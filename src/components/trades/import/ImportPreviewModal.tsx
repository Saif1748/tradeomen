import { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, Warning, XCircle, DotsThree, ArrowCounterClockwise, Copy, Trash, Download, CaretDown, Info, Check, Spinner } from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  ImportRow, 
  ColumnConfig, 
  ColumnMapping,
  DEMO_IMPORT_DATA, 
  DEFAULT_COLUMN_CONFIG,
  MAPPING_OPTIONS 
} from './types';

interface ImportPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  importType: 'csv' | 'image';
  onImportComplete: (count: number, skipped: number) => void;
}

export const ImportPreviewModal = ({
  open,
  onOpenChange,
  fileName,
  importType,
  onImportComplete,
}: ImportPreviewModalProps) => {
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMN_CONFIG);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  
  // Advanced options
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [tagImported, setTagImported] = useState('');
  const [autoDetectStrategy, setAutoDetectStrategy] = useState(true);

  // Initialize demo data when modal opens
  useEffect(() => {
    if (open) {
      setRows(DEMO_IMPORT_DATA.map(row => ({ ...row })));
      setColumns([...DEFAULT_COLUMN_CONFIG]);
    }
  }, [open]);

  // Counts
  const totalRows = rows.length;
  const warningRows = rows.filter(r => r.status === 'warning').length;
  const invalidRows = rows.filter(r => r.status === 'invalid').length;
  const selectedRows = rows.filter(r => r.isSelected && r.status !== 'invalid').length;
  const validSelectedRows = rows.filter(r => r.isSelected && r.status !== 'invalid');

  // Select all valid rows
  const handleSelectAll = (checked: boolean) => {
    setRows(prev => prev.map(row => ({
      ...row,
      isSelected: row.status !== 'invalid' ? checked : false,
    })));
  };

  // Toggle single row selection
  const handleRowSelect = (rowId: string, checked: boolean) => {
    setRows(prev => prev.map(row => 
      row.id === rowId ? { ...row, isSelected: checked } : row
    ));
  };

  // Column mapping change
  const handleMappingChange = (columnKey: string, newMapping: ColumnMapping) => {
    // Check for duplicates
    const existingColumn = columns.find(c => c.mapping === newMapping && c.key !== columnKey && newMapping !== 'ignore');
    
    setColumns(prev => prev.map(col => {
      if (col.key === columnKey) {
        return { ...col, mapping: newMapping };
      }
      // Clear duplicate mapping
      if (existingColumn && col.key === existingColumn.key) {
        return { ...col, mapping: 'ignore' };
      }
      return col;
    }));
  };

  // Inline editing
  const startEditing = (rowId: string, field: string, currentValue: string | number | null) => {
    setEditingCell({ rowId, field });
    setEditValue(currentValue?.toString() || '');
  };

  const saveEdit = () => {
    if (!editingCell) return;
    
    setRows(prev => prev.map(row => {
      if (row.id === editingCell.rowId) {
        const updatedRow = { ...row, isEdited: true };
        
        switch (editingCell.field) {
          case 'symbol':
            updatedRow.symbol = editValue;
            break;
          case 'entryPrice':
            updatedRow.entryPrice = parseFloat(editValue) || 0;
            break;
          case 'exitPrice':
            updatedRow.exitPrice = editValue ? parseFloat(editValue) : null;
            break;
          case 'quantity':
            updatedRow.quantity = parseInt(editValue) || 0;
            // Validate quantity
            if (updatedRow.quantity < 0) {
              updatedRow.status = 'invalid';
              updatedRow.statusReason = 'Invalid quantity: Negative values not allowed';
            } else if (row.status === 'invalid' && row.statusReason?.includes('quantity')) {
              updatedRow.status = 'valid';
              updatedRow.statusReason = undefined;
            }
            break;
          case 'side':
            updatedRow.side = editValue as 'LONG' | 'SHORT';
            break;
        }
        return updatedRow;
      }
      return row;
    }));
    
    setEditingCell(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  // Handle keyboard in edit mode
  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  // Row actions
  const handleIgnoreRow = (rowId: string) => {
    setRows(prev => prev.filter(row => row.id !== rowId));
  };

  const handleDuplicateRow = (rowId: string) => {
    const row = rows.find(r => r.id === rowId);
    if (row) {
      const newRow: ImportRow = {
        ...row,
        id: `${row.id}-copy-${Date.now()}`,
        isEdited: true,
      };
      setRows(prev => {
        const index = prev.findIndex(r => r.id === rowId);
        const newRows = [...prev];
        newRows.splice(index + 1, 0, newRow);
        return newRows;
      });
    }
  };

  const handleResetRow = (rowId: string) => {
    const originalRow = DEMO_IMPORT_DATA.find(r => r.id === rowId);
    if (originalRow) {
      setRows(prev => prev.map(row => 
        row.id === rowId ? { ...originalRow } : row
      ));
    }
  };

  // Bulk actions
  const handleIgnoreSelected = () => {
    setRows(prev => prev.filter(row => !row.isSelected || row.status === 'invalid'));
  };

  const handleDownloadSelected = () => {
    // Mock download - would generate CSV in real implementation
    console.log('Downloading selected rows:', validSelectedRows);
  };

  // Import action
  const handleImport = async () => {
    setIsImporting(true);
    
    // Simulate import delay (1.2-2.5s)
    const delay = 1200 + Math.random() * 1300;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    const importedCount = validSelectedRows.length;
    const skippedCount = skipDuplicates ? Math.floor(Math.random() * 3) : 0;
    
    setIsImporting(false);
    onOpenChange(false);
    onImportComplete(importedCount - skippedCount, skippedCount);
  };

  // Confidence indicator
  const ConfidenceIndicator = ({ level }: { level: 'high' | 'medium' | 'low' }) => {
    const colors = {
      high: 'bg-emerald-500',
      medium: 'bg-yellow-500',
      low: 'bg-muted-foreground/50',
    };
    return (
      <span className={cn('w-1.5 h-1.5 rounded-full inline-block', colors[level])} />
    );
  };

  // Row status indicator
  const RowStatusIndicator = ({ status, reason }: { status: ImportRow['status']; reason?: string }) => {
    if (status === 'valid') return null;
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex items-center">
              {status === 'warning' ? (
                <Warning weight="fill" className="w-3.5 h-3.5 text-yellow-500" />
              ) : (
                <XCircle weight="fill" className="w-3.5 h-3.5 text-rose-500" />
              )}
            </span>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <p className="text-xs">{reason || 'Unknown issue'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const allValidSelected = rows.filter(r => r.status !== 'invalid').every(r => r.isSelected);
  const someSelected = rows.some(r => r.isSelected);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[1100px] w-[95vw] max-h-[90vh] h-[90vh] p-0 gap-0 bg-background border-border/60 flex flex-col overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => {
          if (editingCell) {
            cancelEdit();
            e.preventDefault();
          }
        }}
      >
        {/* Sticky Header */}
        <div className="flex-shrink-0 border-b border-border/60 p-4 sm:p-6 space-y-4 bg-background">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <DialogTitle className="text-lg font-medium">Preview trades before import</DialogTitle>
              <p className="text-sm text-muted-foreground truncate">
                {fileName || 'Uploaded file'} — <span className="text-primary/80">Showing demo preview</span>
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 h-8 w-8 rounded-full"
              onClick={() => onOpenChange(false)}
            >
              <X weight="bold" className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Summary Bar */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle weight="fill" className="w-4 h-4 text-emerald-500" />
              <span><strong>{totalRows}</strong> rows detected</span>
            </div>
            {warningRows > 0 && (
              <div className="flex items-center gap-2 text-yellow-500">
                <Warning weight="fill" className="w-4 h-4" />
                <span><strong>{warningRows}</strong> need attention</span>
              </div>
            )}
            {invalidRows > 0 && (
              <div className="flex items-center gap-2 text-rose-500">
                <XCircle weight="fill" className="w-4 h-4" />
                <span><strong>{invalidRows}</strong> invalid</span>
              </div>
            )}
            <div className="flex-1" />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info weight="fill" className="w-3.5 h-3.5" />
              <span>This is a preview. Review mappings and edits before importing.</span>
            </div>
          </div>
        </div>

        {/* Contextual Toolbar (when rows selected) */}
        {someSelected && (
          <div className="flex-shrink-0 border-b border-border/60 px-4 sm:px-6 py-2 bg-secondary/20 flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">
              {selectedRows} of {totalRows - invalidRows} valid rows selected
            </span>
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={() => handleSelectAll(true)}
            >
              <Check weight="bold" className="w-3 h-3" />
              Select all valid
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1.5 text-rose-400 hover:text-rose-300"
              onClick={handleIgnoreSelected}
            >
              <Trash weight="bold" className="w-3 h-3" />
              Ignore selected
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={handleDownloadSelected}
            >
              <Download weight="bold" className="w-3 h-3" />
              Download CSV
            </Button>
          </div>
        )}

        {/* Table Area */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 sm:p-6 pt-2 sm:pt-4">
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <table className="w-full text-sm border-collapse">
                <thead>
                  {/* Mapping Row */}
                  <tr className="bg-muted/30">
                    <th className="w-12 px-3 py-3 border-r border-b border-border/40 text-center align-middle">
                      <Checkbox
                        checked={allValidSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all valid rows"
                      />
                    </th>
                    <th className="w-10 px-2 py-3 border-r border-b border-border/40" /> {/* Status indicator column */}
                    {columns.slice(0, 8).map((col, index) => (
                      <th 
                        key={col.key} 
                        className={cn(
                          "px-4 py-3 text-left min-w-[120px] border-b border-border/40 align-top",
                          index < 7 && "border-r border-border/40"
                        )}
                      >
                        <div className="space-y-1.5">
                          <Select
                            value={col.mapping}
                            onValueChange={(value) => handleMappingChange(col.key, value as ColumnMapping)}
                          >
                            <SelectTrigger className="h-7 text-xs bg-secondary/40 border-border/50 hover:bg-secondary/60 transition-colors">
                              <div className="flex items-center gap-1.5">
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
                          <p className="text-[10px] text-muted-foreground/70 font-normal truncate">{col.originalName}</p>
                        </div>
                      </th>
                    ))}
                    <th className="w-12 px-2 py-3 border-b border-border/40" /> {/* Actions column */}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr 
                      key={row.id}
                      className={cn(
                        'transition-colors group',
                        row.status === 'invalid' && 'bg-rose-500/8',
                        row.status === 'warning' && 'bg-yellow-500/8',
                        row.isEdited && 'bg-primary/8',
                        rowIndex % 2 === 0 && row.status === 'valid' && !row.isEdited && 'bg-muted/10'
                      )}
                    >
                      <td className="px-3 py-3 border-r border-b border-border/30 text-center align-middle">
                        <Checkbox
                          checked={row.isSelected}
                          disabled={row.status === 'invalid'}
                          onCheckedChange={(checked) => handleRowSelect(row.id, checked as boolean)}
                          aria-label={`Select row ${row.id}`}
                        />
                      </td>
                      <td className="px-2 py-3 border-r border-b border-border/30 text-center align-middle">
                        <RowStatusIndicator status={row.status} reason={row.statusReason} />
                      </td>
                      
                      {/* Symbol - Editable */}
                      <td className="px-4 py-3 border-r border-b border-border/30 align-middle">
                        {editingCell?.rowId === row.id && editingCell.field === 'symbol' ? (
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleEditKeyDown}
                            onBlur={saveEdit}
                            className="h-7 text-xs"
                            autoFocus
                          />
                        ) : (
                          <button
                            className={cn(
                              'font-medium text-left w-full hover:text-primary transition-colors',
                              row.isEdited && 'text-primary'
                            )}
                            onClick={() => startEditing(row.id, 'symbol', row.symbol)}
                          >
                            {row.symbol}
                            {row.isEdited && (
                              <span className="ml-1 text-[10px] text-primary/60">•</span>
                            )}
                          </button>
                        )}
                      </td>
                      
                      {/* Type */}
                      <td className="px-4 py-3 border-r border-b border-border/30 align-middle">
                        <Badge variant="outline" className="text-xs bg-secondary/30 border-border/40 font-light">
                          {row.type}
                        </Badge>
                      </td>
                      
                      {/* Side - Editable dropdown */}
                      <td className="px-4 py-3 border-r border-b border-border/30 align-middle">
                        {editingCell?.rowId === row.id && editingCell.field === 'side' ? (
                          <Select value={editValue} onValueChange={(v) => { setEditValue(v); }}>
                            <SelectTrigger className="h-7 text-xs w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="LONG">LONG</SelectItem>
                              <SelectItem value="SHORT">SHORT</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <button
                            onClick={() => startEditing(row.id, 'side', row.side)}
                            className="block"
                          >
                            <Badge
                              className={cn(
                                'text-xs font-light cursor-pointer',
                                row.side === 'LONG'
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                              )}
                            >
                              {row.side}
                            </Badge>
                          </button>
                        )}
                      </td>
                      
                      {/* Date */}
                      <td className="px-4 py-3 border-r border-b border-border/30 text-muted-foreground font-light text-xs align-middle">
                        {row.date}
                      </td>
                      
                      {/* Entry Price - Editable */}
                      <td className="px-4 py-3 border-r border-b border-border/30 text-right align-middle">
                        {editingCell?.rowId === row.id && editingCell.field === 'entryPrice' ? (
                          <Input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleEditKeyDown}
                            onBlur={saveEdit}
                            className="h-7 text-xs text-right w-24"
                            autoFocus
                          />
                        ) : (
                          <button
                            className="font-medium text-right w-full hover:text-primary transition-colors"
                            onClick={() => startEditing(row.id, 'entryPrice', row.entryPrice)}
                          >
                            {row.entryPrice.toLocaleString()}
                          </button>
                        )}
                      </td>
                      
                      {/* Exit Price - Editable */}
                      <td className="px-4 py-3 border-r border-b border-border/30 text-right align-middle">
                        {editingCell?.rowId === row.id && editingCell.field === 'exitPrice' ? (
                          <Input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleEditKeyDown}
                            onBlur={saveEdit}
                            className="h-7 text-xs text-right w-24"
                            autoFocus
                          />
                        ) : (
                          <button
                            className={cn(
                              'text-right w-full hover:text-primary transition-colors',
                              row.exitPrice === null ? 'text-muted-foreground/50 italic' : 'font-medium'
                            )}
                            onClick={() => startEditing(row.id, 'exitPrice', row.exitPrice)}
                          >
                            {row.exitPrice !== null ? row.exitPrice.toLocaleString() : '—'}
                          </button>
                        )}
                      </td>
                      
                      {/* Quantity - Editable */}
                      <td className="px-4 py-3 border-r border-b border-border/30 text-right align-middle">
                        {editingCell?.rowId === row.id && editingCell.field === 'quantity' ? (
                          <Input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleEditKeyDown}
                            onBlur={saveEdit}
                            className="h-7 text-xs text-right w-20"
                            autoFocus
                          />
                        ) : (
                          <button
                            className={cn(
                              'font-medium text-right w-full hover:text-primary transition-colors',
                              row.quantity < 0 && 'text-rose-400'
                            )}
                            onClick={() => startEditing(row.id, 'quantity', row.quantity)}
                          >
                            {row.quantity}
                          </button>
                        )}
                      </td>
                      
                      {/* Row Actions */}
                      <td className="px-2 py-3 border-b border-border/30 text-center align-middle">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <DotsThree weight="bold" className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => handleIgnoreRow(row.id)} className="gap-2 text-xs">
                              <Trash weight="bold" className="w-3.5 h-3.5" />
                              Ignore row
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateRow(row.id)} className="gap-2 text-xs">
                              <Copy weight="bold" className="w-3.5 h-3.5" />
                              Duplicate row
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleResetRow(row.id)} 
                              className="gap-2 text-xs"
                              disabled={!row.isEdited}
                            >
                              <ArrowCounterClockwise weight="bold" className="w-3.5 h-3.5" />
                              Reset changes
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <p className="text-xs text-muted-foreground mt-3">
              Showing {rows.length} of {DEMO_IMPORT_DATA.length} (demo)
            </p>
            
            {/* Advanced Options */}
            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen} className="mt-6">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground hover:text-foreground">
                  Advanced options
                  <CaretDown 
                    weight="bold" 
                    className={cn('w-3 h-3 transition-transform', advancedOpen && 'rotate-180')} 
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-4 pl-2 border-l-2 border-border/40">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TooltipProvider>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="skip-duplicates" className="text-sm">Skip duplicates</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info weight="fill" className="w-3.5 h-3.5 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs max-w-[200px]">Skip trades that match existing entries by symbol, date, and price</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Switch id="skip-duplicates" checked={skipDuplicates} onCheckedChange={setSkipDuplicates} />
                    </div>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="overwrite-existing" className="text-sm">Overwrite existing</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info weight="fill" className="w-3.5 h-3.5 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs max-w-[200px]">Replace existing trades that match instead of skipping them</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Switch id="overwrite-existing" checked={overwriteExisting} onCheckedChange={setOverwriteExisting} />
                    </div>
                  </TooltipProvider>
                  
                  <div className="flex items-center gap-4">
                    <Label htmlFor="tag-imported" className="text-sm whitespace-nowrap">Tag imported trades</Label>
                    <Input
                      id="tag-imported"
                      value={tagImported}
                      onChange={(e) => setTagImported(e.target.value)}
                      placeholder="e.g., imported-jan"
                      className="h-8 text-xs flex-1"
                    />
                  </div>
                  
                  <TooltipProvider>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="auto-detect-strategy" className="text-sm">Auto-detect strategies</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info weight="fill" className="w-3.5 h-3.5 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs max-w-[200px]">Automatically match strategy names from imported data to existing strategies</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Switch id="auto-detect-strategy" checked={autoDetectStrategy} onCheckedChange={setAutoDetectStrategy} />
                    </div>
                  </TooltipProvider>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ScrollArea>

        {/* Sticky Footer */}
        <div className="flex-shrink-0 border-t border-border/60 p-4 sm:p-6 bg-background flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle weight="fill" className="w-4 h-4 text-emerald-500" />
            <span>
              <strong>{selectedRows}</strong> rows selected
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              {selectedRows} will be imported • {invalidRows + (rows.length - selectedRows - invalidRows)} will be skipped
            </span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={selectedRows === 0 || isImporting}
              className="flex-1 sm:flex-none glow-button gap-2"
            >
              {isImporting ? (
                <>
                  <Spinner weight="bold" className="w-4 h-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  Import {selectedRows} Trades
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
