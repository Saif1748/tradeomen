import { useState, useMemo } from "react";
import { CalendarBlank, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { setMonth, setYear, getMonth, getYear } from "date-fns";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/dashboard/PageHeader";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import DayDetailModal from "@/components/calendar/DayDetailModal"; // ✅ Corrected Import Name
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Hooks
import { useCalendar, CalendarDayStats } from "@/hooks/use-calendar";
import { useCurrency } from "@/hooks/use-currency";

const Calendar = () => {
  const today = new Date();
  // Initialize to the first of the current month to ensure stable queries
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [colorMode, setColorMode] = useState<'pnl' | 'winrate'>('pnl');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // State for Day Details Modal
  const [selectedDayStats, setSelectedDayStats] = useState<CalendarDayStats | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch efficient SQL stats
  const { data: monthDataMap, isLoading } = useCalendar(currentDate);
  
  // Currency Settings
  const { format: formatCurrency, symbol } = useCurrency();

  // Generate years for the dropdown
  const currentYearInt = new Date().getFullYear();
  const years = Array.from({ length: currentYearInt - 2020 + 3 }, (_, i) => 2020 + i);
  
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Efficient Object Aggregation
  const monthStats = useMemo(() => {
    if (isLoading || !monthDataMap) {
      return { monthlyPnL: 0, winRate: 0, totalTrades: 0, tradingDays: 0 };
    }

    let totalPnL = 0;
    let totalTrades = 0;
    let totalWins = 0;
    let tradingDays = 0;

    const days = Object.values(monthDataMap);
    
    for (const dayStat of days) {
      totalPnL += dayStat.daily_pnl;
      totalTrades += dayStat.trade_count;
      totalWins += dayStat.win_count;
      if (dayStat.trade_count > 0) tradingDays++;
    }

    const winRate = totalTrades > 0 ? Math.round((totalWins / totalTrades) * 100) : 0;

    return {
      monthlyPnL: totalPnL,
      winRate,
      totalTrades,
      tradingDays
    };
  }, [monthDataMap, isLoading]);

  // Navigation Handlers
  const goToPreviousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToToday = () => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  const handleMonthSelect = (m: string) => setCurrentDate(setMonth(currentDate, months.indexOf(m)));
  const handleYearSelect = (y: string) => setCurrentDate(setYear(currentDate, parseInt(y)));

  // Handler for opening the day detail modal
  const handleDayClick = (stats: CalendarDayStats) => {
    setSelectedDayStats(stats);
    setIsDetailOpen(true);
  };

  const formatPnL = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${symbol}${formatCurrency(Math.abs(value))}`;
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Calendar"
        icon={<CalendarBlank weight="duotone" className="w-6 h-6 text-primary" />}
        onMobileMenuOpen={() => setMobileMenuOpen(true)}
      />

      <div className="px-4 sm:px-6 lg:px-8 pb-6 pt-4 space-y-4 sm:space-y-6 h-[calc(100vh-100px)] flex flex-col">
        {/* Monthly Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 shrink-0">
          <div className="glass-card p-3 sm:p-5 rounded-xl sm:rounded-2xl">
            <span className="text-[10px] sm:text-sm text-muted-foreground block mb-0.5 sm:mb-1">Monthly P&L</span>
            <span className={cn(
              "text-lg sm:text-2xl font-semibold",
              monthStats.monthlyPnL >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            )}>
              {formatPnL(monthStats.monthlyPnL)}
            </span>
          </div>
          <div className="glass-card p-3 sm:p-5 rounded-xl sm:rounded-2xl">
            <span className="text-[10px] sm:text-sm text-muted-foreground block mb-0.5 sm:mb-1">Win Rate</span>
            <span className="text-lg sm:text-2xl font-semibold text-foreground">
              {monthStats.winRate}%
            </span>
          </div>
          <div className="glass-card p-3 sm:p-5 rounded-xl sm:rounded-2xl">
            <span className="text-[10px] sm:text-sm text-muted-foreground block mb-0.5 sm:mb-1">Trades</span>
            <span className="text-lg sm:text-2xl font-semibold text-foreground">
              {monthStats.totalTrades}
            </span>
          </div>
          <div className="glass-card p-3 sm:p-5 rounded-xl sm:rounded-2xl">
            <span className="text-[10px] sm:text-sm text-muted-foreground block mb-0.5 sm:mb-1">Trading Days</span>
            <span className="text-lg sm:text-2xl font-semibold text-foreground">
              {monthStats.tradingDays}
            </span>
          </div>
        </div>

        {/* Calendar Container */}
        <div className="glass-card p-3 sm:p-6 rounded-xl sm:rounded-2xl flex-1 flex flex-col min-h-0">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-4 mb-4 sm:mb-6 shrink-0">
            
            {/* Navigation & Selectors */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 w-full xl:w-auto">
              <Button variant="outline" size="icon" onClick={goToPreviousMonth} className="h-9 w-9 rounded-lg border-border/50 hover:bg-secondary/50 shrink-0">
                <CaretLeft weight="bold" className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-2">
                <Select value={months[getMonth(currentDate)]} onValueChange={handleMonthSelect}>
                  <SelectTrigger className="w-[120px] h-9 bg-secondary/50 border-border/50 font-medium text-sm">
                    <SelectValue>{months[getMonth(currentDate)]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent align="start" className="max-h-[300px]">
                    {months.map((month) => <SelectItem key={month} value={month}>{month}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={getYear(currentDate).toString()} onValueChange={handleYearSelect}>
                  <SelectTrigger className="w-[85px] h-9 bg-secondary/50 border-border/50 font-medium text-sm">
                    <SelectValue>{getYear(currentDate)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent align="start" className="max-h-[300px]">
                    {years.map((year) => <SelectItem key={year} value={year.toString()}>{year}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" size="icon" onClick={goToNextMonth} className="h-9 w-9 rounded-lg border-border/50 hover:bg-secondary/50 shrink-0">
                <CaretRight weight="bold" className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={goToToday} className="text-xs text-muted-foreground hover:text-foreground ml-1">Today</Button>
            </div>

            {/* Color Mode Toggle */}
            <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg shrink-0">
              <button onClick={() => setColorMode('pnl')} className={cn("px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all", colorMode === 'pnl' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>P&L</button>
              <button onClick={() => setColorMode('winrate')} className={cn("px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all", colorMode === 'winrate' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                <span className="hidden sm:inline">Win Rate</span><span className="sm:hidden">WR</span>
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground mb-4 shrink-0">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-500/30" /><span>Profit</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-rose-500/30" /><span>Loss</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-muted/30" /><span>No Trades</span></div>
          </div>

          {/* Grid */}
          <div className="flex-1 min-h-0">
            <CalendarGrid
              currentMonth={currentDate}
              data={monthDataMap || {}}
              colorMode={colorMode}
              isLoading={isLoading}
              onDayClick={handleDayClick}
            />
          </div>
        </div>
      </div>

      {/* ✅ Corrected Modal Component */}
      <DayDetailModal
        isOpen={isDetailOpen} // Note: Prop name depends on your DayDetailModal implementation (isOpen vs open)
        onClose={() => setIsDetailOpen(false)}
        dayData={selectedDayStats}
      />
    </DashboardLayout>
  );
};

export default Calendar;