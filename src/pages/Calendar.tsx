import { useState, useMemo } from "react";
import { CalendarBlank, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { setMonth, setYear, getMonth, getYear, startOfMonth } from "date-fns";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/dashboard/PageHeader";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import DayDetailModal from "@/components/calendar/DayDetailModal";
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
  const [currentDate, setCurrentDate] = useState<Date>(() =>
    startOfMonth(today)
  );
  const [colorMode, setColorMode] = useState<"pnl" | "winrate">("pnl");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Day modal
  const [selectedDayStats, setSelectedDayStats] =
    useState<CalendarDayStats | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data: monthDataMap, isLoading } = useCalendar(currentDate);
  const { format: formatCurrency, symbol } = useCurrency();

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2020 + 3 }, (_, i) => 2020 + i);

  // Aggregate stats
  const monthStats = useMemo(() => {
    if (!monthDataMap) {
      return { monthlyPnL: 0, winRate: 0, totalTrades: 0, tradingDays: 0 };
    }

    let totalPnL = 0;
    let totalTrades = 0;
    let totalWins = 0;
    let tradingDays = 0;

    for (const d of Object.values(monthDataMap)) {
      totalPnL += d.daily_pnl;
      totalTrades += d.trade_count;
      totalWins += d.win_count;
      if (d.trade_count > 0) tradingDays++;
    }

    return {
      monthlyPnL: totalPnL,
      totalTrades,
      tradingDays,
      winRate:
        totalTrades > 0
          ? Math.round((totalWins / totalTrades) * 100)
          : 0,
    };
  }, [monthDataMap]);

  // Navigation
  const goToPreviousMonth = () =>
    setCurrentDate((d) =>
      startOfMonth(new Date(d.getFullYear(), d.getMonth() - 1, 1))
    );

  const goToNextMonth = () =>
    setCurrentDate((d) =>
      startOfMonth(new Date(d.getFullYear(), d.getMonth() + 1, 1))
    );

  const goToToday = () => setCurrentDate(startOfMonth(today));

  const handleMonthSelect = (m: string) => {
    const idx = months.indexOf(m);
    if (idx === -1) return;
    setCurrentDate((d) => startOfMonth(setMonth(d, idx)));
  };

  const handleYearSelect = (y: string) => {
    const yr = parseInt(y, 10);
    if (Number.isNaN(yr)) return;
    setCurrentDate((d) => startOfMonth(setYear(d, yr)));
  };

  const handleDayClick = (stats: CalendarDayStats) => {
    setSelectedDayStats(stats);
    setIsDetailOpen(true);
  };

  const formatPnL = (v: number) => {
    const sign = v >= 0 ? "+" : "-";
    return `${sign}${symbol}${formatCurrency(Math.abs(v))}`;
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Calendar"
        icon={<CalendarBlank weight="duotone" className="w-6 h-6 text-primary" />}
        onMobileMenuOpen={() => setMobileMenuOpen(true)}
      />

      <div className="px-4 sm:px-6 lg:px-8 pb-6 pt-4 space-y-4 sm:space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          <div className="glass-card p-3 sm:p-5 rounded-xl">
            <span className="text-xs text-muted-foreground">Monthly P&L</span>
            <div
              className={cn(
                "text-lg sm:text-2xl font-semibold",
                monthStats.monthlyPnL >= 0
                  ? "text-emerald-500"
                  : "text-rose-500"
              )}
            >
              {formatPnL(monthStats.monthlyPnL)}
            </div>
          </div>

          <div className="glass-card p-3 sm:p-5 rounded-xl">
            <span className="text-xs text-muted-foreground">Win Rate</span>
            <div className="text-lg sm:text-2xl font-semibold">
              {monthStats.winRate}%
            </div>
          </div>

          <div className="glass-card p-3 sm:p-5 rounded-xl">
            <span className="text-xs text-muted-foreground">Trades</span>
            <div className="text-lg sm:text-2xl font-semibold">
              {monthStats.totalTrades}
            </div>
          </div>

          <div className="glass-card p-3 sm:p-5 rounded-xl">
            <span className="text-xs text-muted-foreground">Trading Days</span>
            <div className="text-lg sm:text-2xl font-semibold">
              {monthStats.tradingDays}
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="glass-card p-3 sm:p-6 rounded-xl">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                <CaretLeft weight="bold" />
              </Button>

              <Select
                value={months[getMonth(currentDate)]}
                onValueChange={handleMonthSelect}
              >
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={getYear(currentDate).toString()}
                onValueChange={handleYearSelect}
              >
                <SelectTrigger className="w-[90px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" onClick={goToNextMonth}>
                <CaretRight weight="bold" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={goToToday}
                className="text-xs"
              >
                Today
              </Button>
            </div>

            {/* Toggle */}
            <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg">
              <button
                onClick={() => setColorMode("pnl")}
                className={cn(
                  "px-3 py-1 text-sm rounded-md",
                  colorMode === "pnl"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground"
                )}
              >
                P&L
              </button>
              <button
                onClick={() => setColorMode("winrate")}
                className={cn(
                  "px-3 py-1 text-sm rounded-md",
                  colorMode === "winrate"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground"
                )}
              >
                Win Rate
              </button>
            </div>
          </div>

          {/* Grid */}
          <CalendarGrid
            currentMonth={currentDate}
            data={monthDataMap || {}}
            colorMode={colorMode}
            isLoading={isLoading}
            onDayClick={handleDayClick}
          />
        </div>
      </div>

      <DayDetailModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        dayData={selectedDayStats}
      />
    </DashboardLayout>
  );
};

export default Calendar;
