import { useState, useMemo } from "react";
import { Wallet, TrendUp, TrendDown, Scales } from "@phosphor-icons/react";
import { DateRange } from "react-day-picker";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import GaugeMetric from "@/components/dashboard/GaugeMetric";
import ChartCard from "@/components/dashboard/ChartCard";
import RecentTrades from "@/components/dashboard/RecentTrades";
import MiniCalendar from "@/components/dashboard/MiniCalendar";

import { useDashboard } from "@/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/use-currency"; 

const Dashboard = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // ✅ SAFELY ACCESS RATE
  // @ts-ignore
  const { symbol, rate, exchangeRate } = useCurrency();
  const activeRate = rate || exchangeRate || 1;

  // ✅ FIXED HELPER: Accepts 'skipConversion' to prevent double-multiplying charts
  const formatCompact = (num: number, skipConversion = false) => {
    // Only apply rate if NOT skipped (Charts send pre-converted values)
    const convertedValue = skipConversion ? num : num * activeRate;
    const absVal = Math.abs(convertedValue);

    // 1. Standard Formatting (< 100k)
    if (absVal < 100000) {
      return `${symbol}${convertedValue.toLocaleString("en-US", { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`;
    }

    // 2. Compact Formatting (>= 100k)
    const formatter = new Intl.NumberFormat("en-US", {
      notation: "compact",
      compactDisplay: "short",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    return `${symbol}${formatter.format(convertedValue)}`;
  };

  /* ===============================
     DATE RANGE STATE
     =============================== */
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  /* ===============================
     DATA FETCHING
     =============================== */
  const { data: stats, isLoading } = useDashboard(dateRange);

  /* ===============================
     DERIVED METRICS
     =============================== */
  const netPL = stats?.net_pnl || 0;
  const totalTrades = stats?.total_trades || 0;
  const expectancy = stats?.expectancy || 0;
  const profitFactor = stats?.profit_factor || 0;
  const winRate = stats?.win_rate || 0;
  
  const avgWin = stats?.avg_win || 0;
  const avgLoss = stats?.avg_loss || 0;
  const payoffRatio = stats?.avg_win_loss_ratio || 0;
  
  const longWinRate = stats?.long_win_rate || 0;
  const shortWinRate = stats?.short_win_rate || 0;

  const netPlTrend = netPL >= 0 ? "up" : "down";

  /* ===============================
     RADAR DATA
     =============================== */
  const radarChartData = useMemo(() => [
    { metric: "Win %", value: winRate },
    { metric: "Profit Factor", value: Math.min(profitFactor * 20, 100) },
    { metric: "Avg Win / Avg Loss", value: Math.min(payoffRatio * 20, 100) },
    { metric: "Long Win%", value: longWinRate },
    { metric: "Short Win%", value: shortWinRate },
  ], [winRate, profitFactor, payoffRatio, longWinRate, shortWinRate]);

  /* ===============================
     CHART DATA (Pre-Converted)
     =============================== */
  // We apply the rate here so the Chart line/bars render at the correct height relative to the axis
  const dailyData = useMemo(() => {
    if (!stats?.daily_pnl) return [];
    return stats.daily_pnl.map((d) => ({ 
      date: d.date, 
      value: d.pnl * activeRate 
    }));
  }, [stats, activeRate]);

  const cumulativeData = useMemo(() => {
    if (!stats?.equity_curve) return [];
    return stats.equity_curve.map((d) => ({ 
      date: d.date, 
      value: d.equity * activeRate
    }));
  }, [stats, activeRate]);

  return (
    <DashboardLayout>
      <DashboardHeader
        onMobileMenuOpen={() => setMobileMenuOpen(true)}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />

      <div className="px-4 sm:px-6 lg:px-8 pb-4 pt-2">
        <p className="text-sm text-muted-foreground font-light">
          Welcome back! Here's your real-time trading performance overview.
        </p>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 pb-6 space-y-4 sm:space-y-6">
        
        {/* === MAIN METRICS ROW === */}
        {isLoading ? (
          <div className="grid grid-cols-2 xl:grid-cols-5 gap-3 h-[120px]">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-full w-full rounded-2xl bg-secondary/30" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
            {/* Net P&L Card */}
            <MetricCard
              title="Net P&L"
              value={formatCompact(netPL)} 
              subtitle={`${totalTrades} trades`}
              icon={<Wallet weight="regular" className="w-5 h-5" />}
              trend={netPlTrend}
              trendValue={profitFactor ? `PF ${profitFactor.toFixed(2)}` : "0.00"}
            />

            {/* Expectancy Card */}
            <MetricCard
              title="Expectancy"
              value={formatCompact(expectancy)} 
              subtitle="Per Trade"
              icon={
                expectancy >= 0 ? (
                  <TrendUp className="text-emerald-500 w-5 h-5" />
                ) : (
                  <TrendDown className="text-rose-500 w-5 h-5" />
                )
              }
              trend="neutral"
              trendValue={payoffRatio ? `R:R ${payoffRatio.toFixed(2)}` : "0.00"}
            />

            {/* Profit Factor Gauge */}
            <GaugeMetric
              title="Profit Factor"
              value={profitFactor}
              type="arc"
            />

            {/* Win Rate Gauge */}
            <GaugeMetric
              title="Win Rate"
              value={winRate}
              type="donut"
            />

            {/* Bar Visual Card for Avg Win/Loss */}
            <div className="glass-card p-4 rounded-2xl flex flex-col justify-between relative overflow-hidden border border-border/50">
              <div className="flex justify-between items-start mb-2">
                <span className="text-muted-foreground text-xs font-medium">Avg Win / Avg Loss</span>
                <Scales className="text-blue-500 w-4 h-4" />
              </div>
              
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground tabular-nums">
                    {payoffRatio.toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">Ratio</span>
                </div>

                {/* The "Bar" Visual */}
                <div className="flex h-1.5 w-full rounded-full bg-secondary mt-2 overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(payoffRatio * 25, 100)}%` }} 
                  />
                </div>

                {/* Explicit Values */}
                <div className="flex justify-between mt-2 text-[10px] font-medium text-muted-foreground">
                  <span className="text-emerald-500">{formatCompact(avgWin)}</span>
                  <span className="text-rose-500">{formatCompact(avgLoss)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === MOBILE ONLY GAUGES === */}
        <div className="grid grid-cols-3 gap-2 xl:hidden">
          <GaugeMetric title="Profit Factor" value={profitFactor} type="arc" compact />
          <GaugeMetric title="Win Rate" value={winRate} type="donut" compact />
          <div className="flex flex-col items-center justify-center p-2 glass-card rounded-xl text-center border border-border/50 bg-card/50">
             <span className="text-[10px] text-muted-foreground uppercase font-bold">Payoff</span>
             <span className="text-lg font-bold text-foreground">{payoffRatio.toFixed(2)}</span>
             <span className="text-[9px] text-muted-foreground truncate w-full">
               {formatCompact(avgWin)}/{formatCompact(avgLoss)}
             </span>
          </div>
        </div>

        {/* === ANALYTICS CHARTS === */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          <ChartCard
            title="Trading Personality"
            type="radar"
            data={radarChartData}
          />

          <ChartCard
            title="Equity Curve"
            type="area"
            data={cumulativeData}
            // ✅ FIX: Pass true to SKIP second conversion
            valueFormatter={(v) => formatCompact(v, true)} 
          />

          <ChartCard
            title="Daily P&L"
            type="bar"
            data={dailyData}
            // ✅ FIX: Pass true to SKIP second conversion
            valueFormatter={(v) => formatCompact(v, true)} 
          />
        </div>

        {/* === RECENT ACTIVITY SECTION === */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <RecentTrades /> 
          <MiniCalendar />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;