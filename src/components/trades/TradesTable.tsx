// src/components/trades/TradesTable.tsx
import { 
  CaretUp, 
  CaretDown, 
  PencilSimple, 
  Trash, 
  DotsThreeVertical 
} from "@phosphor-icons/react";
import { format } from "date-fns";
import { UITrade } from "@/hooks/use-trades";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrency } from "@/hooks/use-currency";

interface TradesTableProps {
  trades: UITrade[];
  isLoading: boolean;
  onEdit: (trade: UITrade) => void;
  onDelete: (id: string) => void;
  // Sorting props (optional but good to keep if you use them)
  sortField?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (field: string) => void;
}

const TradesTable = ({
  trades,
  isLoading,
  onEdit,
  onDelete,
  sortField,
  sortDirection,
  onSort,
}: TradesTableProps) => {
  const { format: formatCurrency, symbol } = useCurrency();

  // Helper for Sort Icons
  const SortIcon = ({ field }: { field: string }) => {
    if (!onSort || sortField !== field) {
      return (
        <span className="ml-1 inline-flex flex-col opacity-30">
          <CaretUp weight="bold" className="w-2.5 h-2.5 -mb-0.5" />
          <CaretDown weight="bold" className="w-2.5 h-2.5 -mt-0.5" />
        </span>
      );
    }
    return sortDirection === "asc" ? (
      <CaretUp weight="bold" className="w-3 h-3 ml-1 inline text-primary" />
    ) : (
      <CaretDown weight="bold" className="w-3 h-3 ml-1 inline text-primary" />
    );
  };

  // Safe Sort Handler
  const handleSort = (field: string) => {
    if (onSort) onSort(field);
  };

  if (isLoading) {
    return (
        <div className="w-full space-y-4">
            <div className="glass-card rounded-2xl p-4 h-12 animate-pulse bg-secondary/10" />
            {[...Array(5)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl p-4 h-16 animate-pulse bg-secondary/5" />
            ))}
        </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="glass-card rounded-2xl overflow-hidden hidden lg:block border border-border/50 shadow-sm">
        <Table>
          <TableHeader className="bg-secondary/20">
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="cursor-pointer text-muted-foreground font-medium transition-colors hover:text-foreground w-[120px]" onClick={() => handleSort("date")}>
                Date <SortIcon field="date" />
              </TableHead>
              <TableHead className="cursor-pointer text-muted-foreground font-medium transition-colors hover:text-foreground" onClick={() => handleSort("symbol")}>
                Symbol <SortIcon field="symbol" />
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">Type</TableHead>
              <TableHead className="cursor-pointer text-muted-foreground font-medium transition-colors hover:text-foreground" onClick={() => handleSort("side")}>
                Side <SortIcon field="side" />
              </TableHead>
              <TableHead className="cursor-pointer text-muted-foreground font-medium transition-colors hover:text-foreground text-right" onClick={() => handleSort("pnl")}>
                P/L <SortIcon field="pnl" />
              </TableHead>
              <TableHead className="cursor-pointer text-muted-foreground font-medium transition-colors hover:text-foreground text-right" onClick={() => handleSort("rMultiple")}>
                R-Multiple <SortIcon field="rMultiple" />
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">Strategy</TableHead>
              <TableHead className="text-muted-foreground font-medium">Tags</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground italic">
                  No trades found. Log your first trade!
                </TableCell>
              </TableRow>
            ) : (
              trades.map((trade) => {
                const isLoss = (trade.pnl || 0) < 0;
                const isRLoss = trade.rMultiple < 0;

                return (
                  <TableRow
                    key={trade.id}
                    className="border-border/50 hover:bg-primary/5 transition-colors group"
                  >
                    <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
                      {format(trade.date, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {trade.symbol}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs uppercase">{trade.type}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold h-5 px-2 border-0 ${
                          trade.side === "LONG"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-rose-500/10 text-rose-500"
                        }`}
                      >
                        {trade.side}
                      </Badge>
                    </TableCell>
                    <TableCell className={`font-bold tabular-nums text-sm text-right ${!isLoss ? "text-emerald-500" : "text-rose-500"}`}>
                      {!isLoss ? "+" : ""}{symbol}{formatCurrency(Math.abs(trade.pnl || 0))}
                    </TableCell>
                    <TableCell className={`font-medium tabular-nums text-sm text-right ${!isRLoss ? "text-emerald-500" : "text-rose-500"}`}>
                      {!isRLoss ? "+" : "-"}{Math.abs(trade.rMultiple).toFixed(2)}R
                    </TableCell>
                    <TableCell className="text-foreground/80 text-sm truncate max-w-[140px]">
                      {trade.strategy}
                    </TableCell>
                    
                    {/* Tags */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {trade.tags.slice(0, 2).map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="border-primary/20 bg-primary/5 text-primary text-[10px] h-5 px-2 whitespace-nowrap font-medium"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {trade.tags.length > 2 && (
                          <Badge
                            variant="outline"
                            className="border-primary/20 bg-primary/10 text-primary text-[10px] h-5 px-1.5 font-bold"
                          >
                            +{trade.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Actions Menu */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DotsThreeVertical className="h-4 w-4 text-muted-foreground" weight="bold" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-xl border-white/10">
                          <DropdownMenuItem onClick={() => onEdit(trade)} className="text-xs font-medium cursor-pointer">
                            <PencilSimple className="mr-2 h-3.5 w-3.5" /> Edit Metadata
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(trade.id)} className="text-xs font-medium text-rose-500 focus:text-rose-500 cursor-pointer">
                            <Trash className="mr-2 h-3.5 w-3.5" /> Delete Trade
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden space-y-3">
        {trades.map((trade) => {
          const isLoss = (trade.pnl || 0) < 0;
          return (
            <div
              key={trade.id}
              className="glass-card px-4 py-3 rounded-xl border border-border/50 active:scale-[0.98] transition-all hover:bg-secondary/30"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold text-foreground truncate">{trade.symbol}</span>
                  <Badge variant="outline" className={`text-[9px] h-4 px-1 border-0 ${
                      trade.side === "LONG" 
                        ? "bg-emerald-500/10 text-emerald-500" 
                        : "bg-rose-500/10 text-rose-500"
                    }`}>
                    {trade.side}
                  </Badge>
                </div>
                
                {/* Mobile Actions Dropdown */}
                <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold tabular-nums ${!isLoss ? "text-emerald-500" : "text-rose-500"}`}>
                        {!isLoss ? "+" : ""}{symbol}{formatCurrency(Math.abs(trade.pnl || 0))}
                    </span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <DotsThreeVertical className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-xl border-white/10">
                            <DropdownMenuItem onClick={() => onEdit(trade)}>
                                <PencilSimple className="mr-2 h-3.5 w-3.5" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(trade.id)} className="text-rose-500">
                                <Trash className="mr-2 h-3.5 w-3.5" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 truncate max-w-[70%]">
                  <span>{format(trade.date, "MMM d")}</span>
                  <span>•</span>
                  <span className="truncate text-foreground/80">{trade.strategy}</span>
                  {trade.tags.length > 0 && (
                      <span className="border border-primary/20 bg-primary/5 text-primary px-1 rounded-[4px] text-[9px] truncate max-w-[60px]">
                        {trade.tags[0]}
                      </span>
                  )}
                </div>
                <span className={`font-semibold shrink-0 ${trade.rMultiple >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                  {trade.rMultiple >= 0 ? "+" : "-"}{Math.abs(trade.rMultiple).toFixed(1)}R
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TradesTable;