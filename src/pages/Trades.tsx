import { useState, useMemo } from "react";
import { 
  Plus, 
  Export, 
  DotsThreeVertical, 
  Funnel, 
  CalendarBlank, 
  ChartLineUp, 
  Spinner, 
  CaretLeft, 
  CaretRight,
  Lock // ✅ Added Lock icon for feature gating
} from "@phosphor-icons/react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { toast } from "sonner";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import TradesStatsCards from "@/components/trades/TradesStatsCards";
import TradesFilters from "@/components/trades/TradesFilters";
import TradesTable from "@/components/trades/TradesTable";
import TradeDetailSheet from "@/components/trades/TradeDetailSheet";
import AddTradeModal from "@/components/trades/AddTradeModal";
import EditTradeModal from "@/components/trades/EditTradeModal";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

// ✅ Hooks & API
import { useTrades, UITrade } from "@/hooks/use-trades";
import { tradesApi } from "@/services/api/modules/trades";
import { useCurrency } from "@/hooks/use-currency";
import { useFeatureAccess } from "@/hooks/useFeatureAccess"; // ✅ Import Feature Access
import { useModal } from "@/contexts/ModalContext"; // ✅ Import Modal Context

const Trades = () => {
  // --- 1. Pagination & Data ---
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { 
    trades, 
    totalTrades, 
    totalPages, 
    isLoading, 
    isError, 
    isPlaceholderData,
    createTrade, 
    updateTrade, 
    deleteTrade 
  } = useTrades({ page, limit: pageSize });

  const { symbol, format: formatCurrency } = useCurrency();
  
  // ✅ Feature Access Logic
  const { isPro } = useFeatureAccess();
  const { triggerUpgrade } = useModal();

  // --- 2. Local UI State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [sideFilter, setSideFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 0, 1),
    to: new Date(),
  });
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- 3. Modals & Selection ---
  const [selectedTrade, setSelectedTrade] = useState<UITrade | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [tradeToEdit, setTradeToEdit] = useState<UITrade | null>(null);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // --- 4. Filtering & Sorting ---
  const filteredTrades = useMemo(() => {
    let result = [...trades];

    if (dateRange?.from) {
      result = result.filter(t => t.date >= dateRange.from!);
    }
    if (dateRange?.to) {
       result = result.filter(t => t.date <= dateRange.to!);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.symbol.toLowerCase().includes(query) ||
          (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(query)))
      );
    }

    if (sideFilter !== "all") {
      result = result.filter((t) => t.side === sideFilter);
    }

    if (typeFilter !== "all") {
      result = result.filter((t) => t.type === typeFilter);
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "date":
          comparison = a.date.getTime() - b.date.getTime();
          break;
        case "symbol":
          comparison = a.symbol.localeCompare(b.symbol);
          break;
        case "pnl":
          comparison = (a.pnl || 0) - (b.pnl || 0);
          break;
        case "rMultiple":
          comparison = (a.rMultiple || 0) - (b.rMultiple || 0);
          break;
        default:
          comparison = 0;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [trades, searchQuery, sideFilter, typeFilter, dateRange, sortField, sortDirection]);

  // --- 5. Event Handlers ---
  const handlePageSizeChange = (val: string) => {
    setPageSize(Number(val));
    setPage(1); 
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleTradeClick = (trade: UITrade) => {
    setSelectedTrade(trade);
    setDetailOpen(true);
  };

  const handleAddTrade = (newTrade: any) => {
    createTrade(newTrade, {
        onSuccess: () => setAddModalOpen(false)
    });
  };

  const handleEditTrade = (trade: UITrade) => {
    setTradeToEdit(trade);
    setDetailOpen(false);
    setEditModalOpen(true);
  };

  const handleUpdateTrade = (updatedTrade: any) => {
    if (!tradeToEdit) return;
    updateTrade({ id: tradeToEdit.id, data: updatedTrade }, {
        onSuccess: () => {
            setEditModalOpen(false);
            setDetailOpen(false);
        }
    });
  };

  const handleDeleteTrade = (trade: UITrade) => {
    if (window.confirm("Are you sure you want to delete this trade?")) {
        deleteTrade(trade.id, {
            onSuccess: () => setDetailOpen(false)
        });
    }
  };

  const handleExport = async () => {
    // ✅ Logic: Intercept export for Free users
    if (!isPro) {
      triggerUpgrade("Exporting trade history is a Pro feature.");
      return;
    }

    try {
        toast.info("Preparing export...");
        const blob = await tradesApi.export();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trades_export_${format(new Date(), 'yyyyMMdd')}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("Export downloaded");
    } catch (e: any) {
        toast.error(e.message || "Export failed");
    }
  };

  const clearFilters = () => {
    setSideFilter("all");
    setTypeFilter("all");
    setDateRange(undefined);
  };

  const hasActiveFilters = sideFilter !== "all" || typeFilter !== "all" || dateRange !== undefined;
  const dateRangeLabel = dateRange?.from 
    ? dateRange.to 
      ? `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`
      : format(dateRange.from, "MMM d, yyyy")
    : "Select dates";

  return (
    <DashboardLayout>
      <PageHeader
        title="Trades"
        icon={<ChartLineUp weight="duotone" className="w-6 h-6 text-primary" />}
        onMobileMenuOpen={() => setMobileMenuOpen(true)}
      >
        <div className="hidden sm:flex items-center gap-3">
            {/* ✅ Export Button: Conditionally rendered with Lock or Export icon */}
            <Button
                variant="outline"
                className="gap-2 bg-secondary/50 border-border/50 hover:bg-secondary transition-all"
                onClick={handleExport}
            >
                {isPro ? (
                  <Export weight="regular" className="w-4 h-4" />
                ) : (
                  <Lock weight="bold" className="w-4 h-4 text-muted-foreground" />
                )}
                <span className={!isPro ? "text-muted-foreground" : ""}>Export</span>
            </Button>
            
            <Button
                onClick={() => setAddModalOpen(true)}
                className="gap-2 glow-button text-white"
            >
                <Plus weight="bold" className="w-4 h-4" />
                Add Trade
            </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="sm:hidden bg-secondary/50 border-border/50">
              <DotsThreeVertical weight="bold" className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-border">
            <DropdownMenuItem onClick={handleExport}>
              {isPro ? (
                 <Export weight="regular" className="w-4 h-4 mr-2" />
              ) : (
                 <Lock weight="bold" className="w-4 h-4 mr-2 text-muted-foreground" />
              )}
              Export CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </PageHeader>

      <div className="px-4 sm:px-6 lg:px-8 pb-6 pt-4 space-y-4 sm:space-y-6">
        
        {isLoading && !isPlaceholderData && (
            <div className="flex h-64 items-center justify-center">
                <Spinner className="h-8 w-8 animate-spin text-primary" />
            </div>
        )}

        {isError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center text-red-400">
                Failed to load trades. Please check your connection.
            </div>
        )}

        {(!isLoading || isPlaceholderData) && !isError && (
            <>
                <TradesStatsCards trades={filteredTrades as any[]} />

                {/* Filters - Desktop */}
                <div className="hidden sm:block">
                <TradesFilters
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    sideFilter={sideFilter}
                    setSideFilter={setSideFilter}
                    typeFilter={typeFilter}
                    setTypeFilter={setTypeFilter}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                />
                </div>

                {/* Filters - Mobile */}
                <div className="sm:hidden glass-card p-3 rounded-xl">
                  <div className="flex gap-2">
                      <div className="relative flex-1">
                      <input
                          type="text"
                          placeholder="Search..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full h-9 pl-3 pr-3 text-sm bg-secondary/50 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      </div>
                      <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilterSheetOpen(true)}
                      className={`gap-1.5 bg-secondary/50 border-border/50 ${hasActiveFilters ? 'text-primary border-primary/50' : ''}`}
                      >
                      <Funnel weight={hasActiveFilters ? "fill" : "regular"} className="w-4 h-4" />
                      Filters
                      </Button>
                  </div>
                </div>

                <TradesTable
                    trades={filteredTrades as any[]}
                    onTradeClick={handleTradeClick}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                />

                {/* ✅ Professional Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/50 pt-4">
                  <div className="flex items-center gap-4 order-2 sm:order-1">
                    <div className="text-sm text-muted-foreground">
                      Showing {filteredTrades.length} of {totalTrades} trades
                    </div>
                    
                    {/* ✅ Rows per page selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground hidden sm:inline">Rows:</span>
                      <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                        <SelectTrigger className="h-8 w-[70px] bg-secondary/50 border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 order-1 sm:order-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1 || isPlaceholderData}
                      className="h-8 gap-1 pl-2.5"
                    >
                      <CaretLeft className="h-4 w-4" />
                      Prev
                    </Button>
                    
                    <div className="flex items-center justify-center px-3 h-8 rounded-md bg-secondary/30 border border-border/50">
                      <span className="text-sm font-medium tabular-nums">
                        {page} <span className="text-muted-foreground mx-1">/</span> {totalPages}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
                      disabled={page >= totalPages || isPlaceholderData}
                      className="h-8 gap-1 pr-2.5"
                    >
                      Next
                      <CaretRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
            </>
        )}
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => setAddModalOpen(true)}
        className="fixed bottom-6 right-6 sm:hidden w-14 h-14 rounded-full glow-button text-white shadow-lg flex items-center justify-center z-40"
      >
        <Plus weight="bold" className="w-6 h-6" />
      </button>

      {/* Filter Sheet, Detail Sheet & Modals */}
      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent side="bottom" className="bg-card border-border rounded-t-2xl">
          <SheetHeader className="pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-foreground">Filters</SheetTitle>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                  Clear all
                </Button>
              )}
            </div>
          </SheetHeader>
          <div className="space-y-4 pb-6">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2 bg-secondary/50 border-border/50">
                    <CalendarBlank weight="regular" className="w-4 h-4" />
                    {dateRangeLabel}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={1}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Side</label>
              <Select value={sideFilter} onValueChange={setSideFilter}>
                <SelectTrigger className="w-full bg-secondary/50 border-border/50">
                  <SelectValue placeholder="All Sides" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">All Sides</SelectItem>
                  <SelectItem value="LONG">Long</SelectItem>
                  <SelectItem value="SHORT">Short</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full bg-secondary/50 border-border/50">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="STOCK">Stock</SelectItem>
                  <SelectItem value="CRYPTO">Crypto</SelectItem>
                  <SelectItem value="FOREX">Forex</SelectItem>
                  <SelectItem value="FUTURES">Futures</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full glow-button text-white mt-4" 
              onClick={() => setFilterSheetOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <TradeDetailSheet
        trade={selectedTrade as any}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={handleEditTrade}
        onDelete={handleDeleteTrade}
        allTrades={trades as any[]}
      />

      <AddTradeModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onAddTrade={handleAddTrade}
      />

      <EditTradeModal
        trade={tradeToEdit as any}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onUpdateTrade={handleUpdateTrade}
      />
    </DashboardLayout>
  );
};

export default Trades;