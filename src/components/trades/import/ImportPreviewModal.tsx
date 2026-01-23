import { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  CheckCircle, 
  Warning, 
  XCircle, 
  DotsThree, 
  ArrowCounterClockwise, 
  Copy, 
  Trash, 
  CaretDown, 
  Spinner, 
  ArrowsOut, 
  ArrowsIn, 
  ListChecks
} from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// API & Types
import { tradesApi } from '@/services/api/modules/trades';

// ----------------------------------------------------------------------
// Types & Constants
// ----------------------------------------------------------------------

export type ColumnMapping = 
  | 'symbol' | 'direction' | 'entry_date' | 'entry_price' 
  | 'exit_date' | 'exit_price' | 'quantity' | 'pnl' 
  | 'fees' | 'notes' | 'instrument_type' | 'stop_loss' 
  | 'target' | 'tags' | 'ignore';

export interface ColumnConfig {
  key: string;            // The header name from the CSV
  originalName: string;
  mapping: ColumnMapping;
  confidence: { level: 'high' | 'medium' | 'low'; score?: number };
  sampleValue?: any;
}

export type RowStatus = 'valid' | 'warning' | 'invalid';

export interface ImportRow {
  id: string;
  [key: string]: any; // Dynamic fields holding raw CSV values
  status_type: RowStatus;
  statusReason?: string;
  isSelected: boolean;
  isEdited: boolean;
}

const MAPPING_OPTIONS: { label: string; value: ColumnMapping; required?: boolean; type?: 'string' | 'number' | 'date' | 'enum' }[] = [
  { label: 'Ignore Column', value: 'ignore' },
  { label: 'Symbol (Required)', value: 'symbol', required: true, type: 'string' },
  { label: 'Direction (Long/Short)', value: 'direction', required: true, type: 'enum' },
  { label: 'Entry Date (Required)', value: 'entry_date', required: true, type: 'date' },
  { label: 'Entry Price', value: 'entry_price', type: 'number' },
  { label: 'Exit Date', value: 'exit_date', type: 'date' },
  { label: 'Exit Price', value: 'exit_price', type: 'number' },
  { label: 'Quantity', value: 'quantity', type: 'number' },
  { label: 'PnL', value: 'pnl', type: 'number' },
  { label: 'Fees', value: 'fees', type: 'number' },
  { label: 'Stop Loss', value: 'stop_loss', type: 'number' },
  { label: 'Target', value: 'target', type: 'number' },
  { label: 'Asset Type', value: 'instrument_type', type: 'enum' },
  { label: 'Tags', value: 'tags', type: 'string' },
  { label: 'Notes', value: 'notes', type: 'string' },
];

const NUMERIC_FIELDS = MAPPING_OPTIONS.filter(o => o.type === 'number').map(o => o.value);
const REQUIRED_FIELDS = MAPPING_OPTIONS.filter(o => o.required).map(o => o.value);

interface ImportPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  fileObject?: File;
  onImportComplete: (count: number, skipped: number) => void;
}

export const ImportPreviewModal = ({
  open,
  onOpenChange,
  fileName,
  fileObject,
  onImportComplete,
}: ImportPreviewModalProps) => {
  // State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [columns, setColumns] = useState<ColumnConfig[]>([]);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  
  // Edit State
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  
  // Advanced options
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [autoDetectStrategy, setAutoDetectStrategy] = useState(true);

  // ----------------------------------------------------------------------
  // VALIDATION LOGIC (Mirrors Backend Constraints)
  // ----------------------------------------------------------------------
  const validateRows = useCallback((currentRows: ImportRow[], currentCols: ColumnConfig[]): ImportRow[] => {
    // Create a map of Mapping -> CSV Header Key
    const mapConfig: Record<string, string> = {};
    currentCols.forEach(c => {
      if (c.mapping !== 'ignore') mapConfig[c.mapping] = c.originalName;
    });

    return currentRows.map(row => {
      let status: RowStatus = 'valid';
      let reason: string | undefined = undefined;

      // 1. Check Required Fields
      for (const field of REQUIRED_FIELDS) {
        // @ts-ignore
        const csvHeader = mapConfig[field];
        // If not mapped, or mapped value is empty
        if (!csvHeader || !row[csvHeader] || String(row[csvHeader]).trim() === '') {
          status = 'invalid';
          reason = `Missing required: ${MAPPING_OPTIONS.find(o => o.value === field)?.label}`;
          break;
        }
      }

      // 2. Check Numeric Formats (if valid so far)
      if (status === 'valid') {
        for (const field of NUMERIC_FIELDS) {
          // @ts-ignore
          const csvHeader = mapConfig[field];
          if (csvHeader && row[csvHeader]) {
            const val = String(row[csvHeader]).trim();
            // Allow basic cleaning characters that backend handles ($, commas)
            const cleanVal = val.replace(/[^0-9.\-]/g, '');
            if (val !== '' && (isNaN(parseFloat(cleanVal)) || cleanVal === '')) {
              status = 'warning';
              reason = `Invalid number in ${MAPPING_OPTIONS.find(o => o.value === field)?.label}`;
              break; 
            }
          }
        }
      }

      // 3. Direction Check (Simple Heuristic)
      if (status === 'valid' && mapConfig['direction']) {
        const dir = String(row[mapConfig['direction']]).toUpperCase();
        const validDirs = ['LONG', 'SHORT', 'BUY', 'SELL', 'B', 'S', 'L'];
        if (!validDirs.some(v => dir.includes(v))) {
           status = 'warning';
           reason = "Direction unrecognized (will default to LONG)";
        }
      }

      return { ...row, status_type: status, statusReason: reason };
    });
  }, []);

  // ----------------------------------------------------------------------
  // 1. Analyze File on Open
  // ----------------------------------------------------------------------
  useEffect(() => {
    if (open && fileObject) {
      analyzeFile(fileObject);
    } else if (open && !fileObject) {
       setRows([]);
       setColumns([]);
    }
  }, [open, fileObject]);

  const analyzeFile = async (file: File) => {
    setIsAnalyzing(true);
    setRows([]);
    setColumns([]);
    
    try {
      const result = await tradesApi.analyzeCsv(file);
      
      // 1. Setup Columns
      const newColumns: ColumnConfig[] = result.headers.map((header) => {
        const suggestedKey = Object.keys(result.mapping).find(
          key => result.mapping[key] === header
        );

        return {
          key: header,
          originalName: header,
          mapping: (suggestedKey as ColumnMapping) || 'ignore',
          confidence: { level: suggestedKey ? 'high' : 'low' },
          sampleValue: result.preview[0]?.[header],
        };
      });

      // 2. Setup Initial Rows (Before Validation)
      const rawRows: ImportRow[] = result.preview.map((row, idx) => ({
        id: `preview-${idx}`,
        ...row,
        status_type: 'valid', 
        isSelected: true,
        isEdited: false
      }));

      // 3. Run Initial Validation based on suggested mapping
      const validatedRows = validateRows(rawRows, newColumns);

      setColumns(newColumns);
      setRows(validatedRows);

    } catch (error: any) {
      console.error("Analysis Failed", error);
      toast.error(error.message || "Failed to analyze CSV file");
      onOpenChange(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ----------------------------------------------------------------------
  // 2. Import Logic
  // ----------------------------------------------------------------------
  const handleImport = async () => {
    if (!fileObject) return;
    setIsImporting(true);

    try {
      const mapping: Record<string, string> = {};
      columns.forEach(col => {
        if (col.mapping && col.mapping !== 'ignore') {
          mapping[col.mapping] = col.originalName;
        }
      });

      if (Object.keys(mapping).length === 0) {
        toast.error("Please map at least one column.");
        setIsImporting(false);
        return;
      }

      // Check validation one last time
      if (rows.filter(r => r.isSelected && r.status_type === 'invalid').length > 0) {
         toast.warning("Some selected rows are invalid and will be skipped.");
      }

      const result = await tradesApi.confirmImport(fileObject, mapping);

      if (result.count === 0 && result.skipped === 0) {
         toast.warning(result.errors?.[0] || "No trades imported. Check your mapping.");
      } else {
         toast.success(`Successfully imported ${result.count} trades`);
         onOpenChange(false);
         onImportComplete(result.count, result.skipped);
      }

    } catch (error: any) {
      console.error("Import Failed", error);
      toast.error(error.message || "Import process failed.");
    } finally {
      setIsImporting(false);
    }
  };

  // ----------------------------------------------------------------------
  // Computed & Helpers
  // ----------------------------------------------------------------------
  const totalRows = rows.length;
  const warningRows = rows.filter(r => r.status_type === 'warning').length;
  const invalidRows = rows.filter(r => r.status_type === 'invalid').length;
  const selectedRows = rows.filter(r => r.isSelected && r.status_type !== 'invalid').length;
  const visibleColumns = columns.filter(col => col.mapping !== 'ignore');

  // Selection
  const handleSelectAll = (checked: boolean) => {
    setRows(prev => prev.map(row => ({
      ...row,
      isSelected: row.status_type !== 'invalid' ? checked : false,
    })));
  };

  const handleRowSelect = (rowId: string, checked: boolean) => {
    setRows(prev => prev.map(row => 
      row.id === rowId ? { ...row, isSelected: checked } : row
    ));
  };

  const handleIgnoreSelected = () => setRows(prev => prev.filter(row => !row.isSelected || row.status_type === 'invalid'));

  // Mapping Change - REVALIDATE ROWS
  const handleMappingChange = (columnKey: string, newMapping: ColumnMapping) => {
    const existingColumn = columns.find(c => c.mapping === newMapping && c.key !== columnKey && newMapping !== 'ignore');
    
    // Update columns state
    const newColumns = columns.map(col => {
      if (col.key === columnKey) return { ...col, mapping: newMapping };
      if (existingColumn && col.key === existingColumn.key) return { ...col, mapping: 'ignore' as ColumnMapping };
      return col;
    });

    setColumns(newColumns);
    
    // Re-run validation on all rows with new mapping
    setRows(prevRows => validateRows(prevRows, newColumns));
  };

  // Edit Handlers
  const startEditing = (rowId: string, headerKey: string, currentValue: any) => {
    setEditingCell({ rowId, field: headerKey });
    setEditValue(currentValue === null || currentValue === undefined ? '' : String(currentValue));
  };

  const saveEdit = () => {
    if (!editingCell) return;
    
    const updatedRows = rows.map(row => {
      if (row.id === editingCell.rowId) {
        return { ...row, [editingCell.field]: editValue, isEdited: true };
      }
      return row;
    });

    // Re-validate just this row or all? Revalidating all is safer/easier with current fn
    setRows(validateRows(updatedRows, columns));
    setEditingCell(null);
    setEditValue('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); saveEdit(); }
    else if (e.key === 'Escape') { setEditingCell(null); }
  };

  const handleIgnoreRow = (rowId: string) => setRows(prev => prev.filter(row => row.id !== rowId));

  // Render Helpers
  const ConfidenceIndicator = ({ level }: { level: 'high' | 'medium' | 'low' }) => {
    const colors = { high: 'bg-emerald-500', medium: 'bg-yellow-500', low: 'bg-muted-foreground/50' };
    return <span className={cn('w-1.5 h-1.5 rounded-full inline-block', colors[level])} />;
  };

  const StatusPill = ({ count, icon: Icon, colorClass, tooltip }: any) => {
    if (count === 0) return null;
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full border bg-background/50 text-xs font-medium", colorClass)}>
              <Icon weight="fill" className="w-3 h-3" />
              <span>{count}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent><p>{count} {tooltip}</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const RowStatusIndicator = ({ status, reason }: { status: RowStatus; reason?: string }) => {
    if (status === 'valid') return null;
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex items-center justify-center cursor-help">
              {status === 'warning' ? (
                <Warning weight="fill" className="w-3.5 h-3.5 text-yellow-500" />
              ) : (
                <XCircle weight="fill" className="w-3.5 h-3.5 text-rose-500" />
              )}
            </span>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs bg-popover text-popover-foreground border-border">
            <p className="text-xs font-medium">{reason || 'Unknown issue'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const allValidSelected = rows.length > 0 && rows.filter(r => r.status_type !== 'invalid').every(r => r.isSelected);
  const someSelected = rows.some(r => r.isSelected);

  // ----------------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------------
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "bg-background border-border/60 flex flex-col overflow-hidden transition-all duration-300 p-0 gap-0 [&>button]:hidden",
          isMaximized 
            ? "w-screen h-screen max-w-none rounded-none border-0" 
            : "max-w-[1200px] w-[95vw] max-h-[90vh] h-[90vh] rounded-lg"
        )}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {/* --- HEADER --- */}
        <div className="flex-shrink-0 border-b border-border/60 bg-muted/5 px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="flex flex-col min-w-0">
              <DialogTitle className="text-sm font-semibold leading-tight truncate">Import Trades</DialogTitle>
              <p className="text-[10px] text-muted-foreground truncate max-w-[200px]" title={fileName}>
                {fileName}
              </p>
            </div>
            <div className="h-6 w-px bg-border/60 mx-1 hidden sm:block" />
            
            {isAnalyzing ? (
               <div className="flex items-center gap-2 text-xs text-muted-foreground">
                 <Spinner className="animate-spin w-3 h-3" /> Analyzing...
               </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <StatusPill count={totalRows} icon={CheckCircle} colorClass="text-emerald-600 border-emerald-200 bg-emerald-50" tooltip="total rows" />
                <StatusPill count={warningRows} icon={Warning} colorClass="text-yellow-600 border-yellow-200 bg-yellow-50" tooltip="warnings" />
                <StatusPill count={invalidRows} icon={XCircle} colorClass="text-rose-600 border-rose-200 bg-rose-50" tooltip="invalid (will be skipped)" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {someSelected && !isAnalyzing && (
              <div className="flex items-center gap-1 mr-2 animate-in slide-in-from-right-2 fade-in duration-200">
                <span className="text-[10px] font-medium text-muted-foreground mr-1 hidden sm:inline-block">
                  {selectedRows} selected
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:text-primary hover:bg-primary/10" onClick={() => handleSelectAll(true)}>
                        <ListChecks weight="bold" className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Select all valid</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10" onClick={handleIgnoreSelected}>
                        <Trash weight="bold" className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Ignore selected</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="h-4 w-px bg-border mx-1" />
              </div>
            )}

            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setIsMaximized(!isMaximized)} 
              title={isMaximized ? "Exit Full Screen" : "Full Screen"}
            >
              {isMaximized ? <ArrowsIn weight="bold" className="w-4 h-4" /> : <ArrowsOut weight="bold" className="w-4 h-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => onOpenChange(false)}
            >
              <X weight="bold" className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="flex-1 min-h-0 overflow-auto bg-card relative">
          
          {isAnalyzing && (
            <div className="absolute inset-0 bg-background/80 z-50 flex flex-col items-center justify-center gap-3">
              <Spinner className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-muted-foreground">Analyzing file structure...</p>
            </div>
          )}

          <div className={cn("px-4 py-2", isMaximized && "px-6")}>
            <div className="rounded-md border border-border/60 bg-card overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted/40 sticky top-0 z-10 border-b border-border/40">
                      <th className="w-10 px-2 py-2 border-r border-border/40 text-center bg-muted/40">
                        <Checkbox checked={allValidSelected} onCheckedChange={handleSelectAll} className="scale-90" />
                      </th>
                      <th className="w-8 px-1 py-2 border-r border-border/40 bg-muted/40" />
                      
                      {visibleColumns.map((col, index) => (
                        <th 
                          key={col.key} 
                          className={cn(
                            "px-3 py-2 text-left min-w-[130px] border-border/40 bg-muted/40 font-medium text-xs text-muted-foreground",
                            index < visibleColumns.length - 1 && "border-r"
                          )}
                        >
                          <div className="space-y-1">
                            <Select value={col.mapping} onValueChange={(value) => handleMappingChange(col.key, value as ColumnMapping)}>
                              <SelectTrigger className="h-6 text-[11px] bg-background border-border/50 shadow-none px-2">
                                <div className="flex items-center gap-1.5 truncate">
                                  <ConfidenceIndicator level={col.confidence.level} />
                                  <SelectValue />
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                {MAPPING_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-[10px] text-muted-foreground/70 font-normal truncate pl-0.5" title={col.originalName}>
                              {col.originalName}
                            </p>
                          </div>
                        </th>
                      ))}
                      
                      <th className="w-10 px-2 py-2 border-l border-border/40 bg-muted/40 sticky right-0" />
                    </tr>
                  </thead>
                  
                  <tbody>
                    {rows.map((row) => (
                      <tr 
                        key={row.id} 
                        className={cn(
                          'group hover:bg-muted/30 transition-colors border-b border-border/30 last:border-0',
                          row.isEdited && 'bg-blue-50/30',
                          row.status_type === 'invalid' && 'bg-red-50/30'
                        )}
                      >
                        <td className="px-2 py-2 border-r border-border/30 text-center">
                          <Checkbox 
                            checked={row.isSelected} 
                            disabled={row.status_type === 'invalid'} 
                            onCheckedChange={(c) => handleRowSelect(row.id, c as boolean)}
                            className="scale-90" 
                          />
                        </td>
                        <td className="px-1 py-2 border-r border-border/30 text-center">
                          <RowStatusIndicator status={row.status_type} reason={row.statusReason} />
                        </td>
                        
                        {visibleColumns.map((col) => {
                          const val = row[col.originalName]; 
                          const isEditing = editingCell?.rowId === row.id && editingCell.field === col.originalName;
                          
                          return (
                            <td key={col.key} className="px-3 py-1.5 border-r border-border/30 align-middle text-xs">
                              {isEditing ? (
                                <Input 
                                  value={editValue} 
                                  onChange={(e) => setEditValue(e.target.value)} 
                                  onKeyDown={handleEditKeyDown} 
                                  onBlur={saveEdit} 
                                  autoFocus 
                                  className="h-6 text-xs w-full px-1.5" 
                                />
                              ) : (
                                <div 
                                  onClick={() => startEditing(row.id, col.originalName, val)} 
                                  className="cursor-pointer hover:text-primary min-h-[20px] flex items-center"
                                >
                                  <span className="truncate max-w-[140px] inline-block align-middle">
                                    {val !== null && val !== undefined && val !== '' ? String(val) : <span className="text-muted-foreground/30">-</span>}
                                  </span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                        
                        <td className="px-2 py-1.5 border-l border-border/30 text-center sticky right-0 bg-background group-hover:bg-muted/30">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <DotsThree weight="bold" className="w-3.5 h-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32">
                              <DropdownMenuItem onClick={() => handleIgnoreRow(row.id)} className="text-xs text-rose-500 focus:text-rose-500">
                                <Trash className="mr-2 w-3 h-3" /> Ignore
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                    
                    {rows.length === 0 && !isAnalyzing && (
                        <tr>
                            <td colSpan={visibleColumns.length + 3} className="text-center py-8 text-muted-foreground text-xs">
                                No preview data available.
                            </td>
                        </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen} className="mt-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 gap-1.5 text-[10px] text-muted-foreground hover:text-foreground p-0 hover:bg-transparent">
                  <CaretDown className={cn('w-3 h-3 transition-transform', advancedOpen && 'rotate-180')} />
                  Advanced options
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 pl-2 border-l-2 border-border/40">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch id="skip" checked={skipDuplicates} onCheckedChange={setSkipDuplicates} className="scale-75 origin-left" />
                    <Label htmlFor="skip" className="text-xs font-normal">Skip Duplicates</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="auto" checked={autoDetectStrategy} onCheckedChange={setAutoDetectStrategy} className="scale-75 origin-left" />
                    <Label htmlFor="auto" className="text-xs font-normal">Auto-detect Strategies</Label>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="flex-shrink-0 border-t border-border/60 bg-muted/5 px-4 h-12 flex items-center justify-end gap-2">
           <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => onOpenChange(false)}>
             Cancel
           </Button>
           <Button 
             size="sm" 
             onClick={handleImport} 
             disabled={isAnalyzing || isImporting || visibleColumns.length === 0 || selectedRows === 0} 
             className="h-8 text-xs px-4 glow-button bg-primary text-primary-foreground hover:bg-primary/90"
           >
             {isImporting ? <Spinner className="animate-spin mr-2 w-3 h-3" /> : null} 
             Import Trades {selectedRows > 0 && <span className="ml-1 opacity-80">({selectedRows})</span>}
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};