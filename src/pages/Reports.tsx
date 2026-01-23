import { useState } from "react";
import { 
  ChartLine, 
  Funnel, 
  Export, 
  CalendarBlank, 
  SquaresFour, 
  ChartBar, 
  Strategy, 
  Clock, 
  Sparkle, 
  X,
  LockKey 
} from "@phosphor-icons/react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";

// Components
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/dashboard/PageHeader";
import MobileSidebar from "@/components/dashboard/MobileSidebar";
import OverviewTab from "@/components/reports/OverviewTab";
import TradeAnalysisTab from "@/components/reports/TradeAnalysisTab";
import StrategyAnalysisTab from "@/components/reports/StrategyAnalysisTab";
import TimeAnalysisTab from "@/components/reports/TimeAnalysisTab";
import AIInsightsTab from "@/components/reports/AIInsightsTab";
import { FeatureGate } from "@/components/auth/FeatureGate"; 

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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

// Hooks
import { useReports, ReportTab } from "@/hooks/use-reports";
import { useStrategies } from "@/hooks/use-strategies";
import { useCurrency } from "@/hooks/use-currency";
import { useFeatureAccess } from "@/hooks/useFeatureAccess"; 

const Reports = () => {
  // --- 1. State Management ---
  const [activeTab, setActiveTab] = useState<ReportTab>("overview");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 0, 1),
    to: new Date(),
  });
  const [instrumentFilter, setInstrumentFilter] = useState("all");
  const [strategyFilter, setStrategyFilter] = useState("all");
  
  // Filters Sheet State
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hook Initialization
  const { symbol, format: formatCurrency } = useCurrency();
  const { strategyNames } = useStrategies();
  const { isPro } = useFeatureAccess(); 

  // Reports Data Fetching
  const { data, isLoading, isError } = useReports(activeTab, {
    instrument: instrumentFilter,
    strategy: strategyFilter,
    from: dateRange?.from,
    to: dateRange?.to
  });

  // --- UI Helpers ---
  const activeFilterCount = (instrumentFilter !== "all" ? 1 : 0) + (strategyFilter !== "all" ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0;

  const dateRangeLabel = dateRange?.from 
    ? dateRange.to 
      ? `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d, yyyy")}`
      : format(dateRange.from, "MMM d, yyyy")
    : "Select dates";

  const handleExport = (type: "csv" | "pdf") => toast.success(`Exporting ${type}...`);
  
  const clearFilters = () => { 
    setInstrumentFilter("all"); 
    setStrategyFilter("all"); 
    setDateRange(undefined);
  };

  /**
   * Helper to render consistent, professional tabs with the Lock badge.
   */
  const renderTabTrigger = (value: string, label: string, icon: any, locked: boolean) => {
    const Icon = icon;
    return (
      <TabsTrigger 
        value={value}
        className="group relative h-10 rounded-lg px-2 sm:px-4 text-xs sm:text-sm font-medium transition-all duration-300 
          data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/20
          hover:bg-secondary/60 data-[state=active]:hover:bg-primary border border-transparent data-[state=active]:border-primary/10"
      >
        <div className="flex items-center justify-center gap-2 relative z-10">
          <Icon weight="duotone" className={`w-4 h-4 ${locked ? 'opacity-70' : ''}`} />
          <span className={locked ? "opacity-80" : ""}>{label}</span>
          
          {/* Aesthetic Lock Badge */}
          {locked && (
            <div className="ml-0.5 flex items-center justify-center bg-background/20 rounded-full p-0.5 backdrop-blur-[1px] border border-white/10 group-data-[state=active]:border-white/20">
              <LockKey weight="fill" className="w-2.5 h-2.5 opacity-80" />
            </div>
          )}
        </div>
      </TabsTrigger>
    );
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Reports"
        icon={<ChartLine weight="duotone" className="w-6 h-6 text-primary" />}
        onMobileMenuOpen={() => setMobileMenuOpen(true)}
      />

      <MobileSidebar 
        open={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />

      <div className="px-4 sm:px-6 lg:px-8 pb-6 pt-4 space-y-4 sm:space-y-6">
        
        {/* Filters Bar - Desktop */}
        <div className="hidden sm:flex flex-wrap items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 bg-card/50 border-border/60 hover:border-primary/30 hover:bg-card transition-all font-medium text-sm shadow-sm">
                <CalendarBlank weight="duotone" className="w-4 h-4 text-primary" />
                {dateRangeLabel}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-card border-border shadow-2xl" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Select value={instrumentFilter} onValueChange={setInstrumentFilter}>
            <SelectTrigger className="w-[150px] bg-card/50 border-border/60 hover:border-primary/30 hover:bg-card transition-all shadow-sm">
              <div className="flex items-center gap-2">
                <Funnel weight="duotone" className="w-4 h-4 text-primary" />
                <SelectValue placeholder="Instrument" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Instruments</SelectItem>
              <SelectItem value="CRYPTO">Crypto</SelectItem>
              <SelectItem value="STOCK">Equity</SelectItem>
              <SelectItem value="FOREX">Forex</SelectItem>
              <SelectItem value="FUTURES">Futures</SelectItem>
            </SelectContent>
          </Select>

          <Select value={strategyFilter} onValueChange={setStrategyFilter}>
            <SelectTrigger className="w-[150px] bg-card/50 border-border/60 hover:border-primary/30 hover:bg-card transition-all shadow-sm">
              <SelectValue placeholder="Strategy" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Strategies</SelectItem>
              {strategyNames.map(name => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-rose-400 h-9 px-2 gap-1">
              <X className="w-3.5 h-3.5" /> Clear
            </Button>
          )}

          <div className="ml-auto flex gap-2">
            <Button onClick={() => handleExport("csv")} variant="outline" size="sm" className="gap-2 bg-card/50 border-border/60 hover:bg-card hover:border-primary/20 h-9 font-semibold shadow-sm">
              <Export weight="bold" className="w-3.5 h-3.5" />
              CSV
            </Button>
            <Button onClick={() => handleExport("pdf")} variant="outline" size="sm" className="gap-2 bg-card/50 border-border/60 hover:bg-card hover:border-primary/20 h-9 font-semibold shadow-sm">
              <Export weight="bold" className="w-3.5 h-3.5" />
              PDF
            </Button>
          </div>
        </div>

        {/* Mobile Filters Trigger */}
        <div className="sm:hidden flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 justify-start gap-2 bg-card/50 border-border/60 text-[10px] h-9"
              >
                <CalendarBlank weight="duotone" className="w-3.5 h-3.5 text-primary" />
                {dateRangeLabel}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-card border-border" align="center">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterSheetOpen(true)}
            className={`gap-1.5 bg-card/50 border-border/60 h-9 ${hasActiveFilters ? 'text-primary border-primary/50' : ''}`}
          >
            <Funnel weight={hasActiveFilters ? "fill" : "duotone"} className="w-4 h-4" />
            {hasActiveFilters && (
              <span className="w-4 h-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {/* Tabs System */}
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as ReportTab)} className="w-full">
          <div className="sticky top-0 z-20 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 bg-background/80 backdrop-blur-sm sm:static sm:bg-transparent">
            {/* Glassmorphism Floating Tab List */}
            <TabsList className="w-full h-auto p-1.5 bg-background/50 border border-border/60 rounded-xl grid grid-cols-2 sm:grid-cols-5 gap-1.5 shadow-sm backdrop-blur-xl">
              {renderTabTrigger("overview", "Overview", SquaresFour, false)}
              {renderTabTrigger("analysis", "Trades", ChartBar, !isPro)}
              {renderTabTrigger("strategy", "Strategies", Strategy, !isPro)}
              {renderTabTrigger("time", "Time", Clock, !isPro)}
              {renderTabTrigger("ai-insights", "Insights", Sparkle, !isPro)}
            </TabsList>
          </div>

          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mt-2"
          >
            <TabsContent value="overview" className="mt-0 outline-none">
              <OverviewTab data={data} isLoading={isLoading} isError={isError} />
            </TabsContent>
            
            <TabsContent value="analysis" className="mt-0 outline-none">
              <FeatureGate feature="isPro" label="Unlock Trade Analytics">
                <TradeAnalysisTab data={data} isLoading={isLoading} isError={isError} />
              </FeatureGate>
            </TabsContent>
            
            <TabsContent value="strategy" className="mt-0 outline-none">
              <FeatureGate feature="isPro" label="Unlock Strategy Performance">
                <StrategyAnalysisTab data={data} isLoading={isLoading} isError={isError} />
              </FeatureGate>
            </TabsContent>
            
            <TabsContent value="time" className="mt-0 outline-none">
              <FeatureGate feature="isPro" label="Unlock Time Analysis">
                <TimeAnalysisTab data={data} isLoading={isLoading} isError={isError} />
              </FeatureGate>
            </TabsContent>
            
            <TabsContent value="ai-insights" className="mt-0 outline-none">
              <FeatureGate feature="isPro" label="Unlock AI Insights">
                <AIInsightsTab data={data} isLoading={isLoading} />
              </FeatureGate>
            </TabsContent>
          </motion.div>
        </Tabs>
      </div>

      {/* Mobile Filters Sheet */}
      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent side="bottom" className="bg-card border-border rounded-t-2xl">
          <SheetHeader className="pb-4 border-b border-border/50">
            <SheetTitle className="text-left">Filter Analytics</SheetTitle>
          </SheetHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Instrument</label>
              <Select value={instrumentFilter} onValueChange={setInstrumentFilter}>
                <SelectTrigger className="w-full bg-secondary/30 border-border h-12 rounded-xl">
                  <SelectValue placeholder="Instrument" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">All Instruments</SelectItem>
                  <SelectItem value="CRYPTO">Crypto</SelectItem>
                  <SelectItem value="STOCK">Equity</SelectItem>
                  <SelectItem value="FOREX">Forex</SelectItem>
                  <SelectItem value="FUTURES">Futures</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Strategy</label>
              <Select value={strategyFilter} onValueChange={setStrategyFilter}>
                <SelectTrigger className="w-full bg-secondary/30 border-border h-12 rounded-xl">
                  <SelectValue placeholder="Strategy" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">All Strategies</SelectItem>
                  {strategyNames.map(name => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 h-12 rounded-xl font-medium border-border" onClick={clearFilters}>Reset</Button>
              <Button className="flex-1 glow-button text-white h-12 rounded-xl font-bold bg-primary" onClick={() => setFilterSheetOpen(false)}>Apply Filters</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default Reports;