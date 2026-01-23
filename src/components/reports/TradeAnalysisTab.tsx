import { useMemo } from "react";
import { 
  CurrencyDollar, 
  Scales, 
  ChartBar, 
  Pulse, 
  Coins, 
  TrendUp, 
  TrendDown,
  Warning
} from "@phosphor-icons/react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  ReferenceLine,
  Legend,
  ZAxis
} from "recharts";
import { format } from "date-fns";
import { useCurrency } from "@/hooks/use-currency";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface TradeAnalysisTabProps {
  data: any;
  isLoading: boolean;
  isError: boolean;
}

const COLORS = [
  "hsl(var(--primary))", 
  "hsl(200 70% 50%)", 
  "hsl(160 60% 45%)", 
  "hsl(45 90% 55%)", 
  "hsl(320 70% 50%)", 
  "hsl(30 80% 55%)", 
  "hsl(180 60% 45%)", 
  "hsl(0 70% 50%)"
];

const TradeAnalysisTab = ({ data, isLoading, isError }: TradeAnalysisTabProps) => {
  const { format: formatNum, symbol } = useCurrency();

  const formatCurrency = (val: number) => `${symbol}${formatNum(val)}`;
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl bg-secondary/50" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[300px] rounded-2xl bg-secondary/50" />
          <Skeleton className="h-[300px] rounded-2xl bg-secondary/50" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="h-64 flex items-center justify-center glass-card rounded-2xl border border-rose-500/20 text-rose-400">
        Failed to load analysis data. Please try refreshing.
      </div>
    );
  }

  // ✅ Extract Data from SQL keys
  const kpis = data.kpis || {};
  const assetPerformance = data.assetPerformance || [];
  const riskData = data.riskScatter || [];
  const tagPerformance = data.tagPerformance || [];
  const best = data.bestTrades || [];
  const worst = data.worstTrades || [];

  // KPI Calculations
  const totalVolume = Number(kpis.totalVolume) || 0;
  const totalFees = Number(kpis.totalFees) || 0;
  const feesImpactPct = totalVolume !== 0 ? (totalFees / totalVolume) * 100 : 0;

  const kpiMetrics = [
    { 
      label: "Total Fees Paid", 
      value: formatCurrency(totalFees),
      icon: Coins, 
      subtext: `${feesImpactPct.toFixed(3)}% of Vol`,
      color: "text-rose-400",
      bg: "bg-rose-500/10"
    },
    { 
      label: "Avg Risk per Trade", 
      value: formatCurrency(Number(kpis.avgRisk) || 0), 
      icon: Warning,
      subtext: "Position Sizing",
      color: "text-amber-400",
      bg: "bg-amber-500/10"
    },
    { 
      label: "Total Volume", 
      value: `${symbol}${(totalVolume / 1000).toFixed(1)}k`, 
      icon: Pulse,
      subtext: "Gross Exposure",
      color: "text-blue-400",
      bg: "bg-blue-500/10"
    },
    { 
      label: "Avg Return", 
      value: formatCurrency(Number(kpis.avgReturn) || 0), 
      icon: ChartBar,
      subtext: "Per Trade",
      color: (Number(kpis.avgReturn) || 0) >= 0 ? "text-emerald-400" : "text-rose-400",
      bg: (Number(kpis.avgReturn) || 0) >= 0 ? "bg-emerald-500/10" : "bg-rose-500/10"
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {kpiMetrics.map((kpi, i) => (
          <div key={i} className="glass-card p-5 rounded-2xl hover:border-primary/30 transition-all border border-border/50 group">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{kpi.label}</span>
              <div className={`p-2 rounded-lg ${kpi.bg} text-foreground group-hover:scale-110 transition-transform`}>
                <kpi.icon weight="duotone" className={`w-5 h-5 ${kpi.color.replace('text-', '')}`} />
              </div>
            </div>
            <div>
              <h3 className={`text-2xl font-bold tracking-tight tabular-nums ${kpi.color}`}>
                {kpi.value}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                {kpi.subtext}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Asset & Risk Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        
        {/* Performance by Asset Type */}
        <div className="glass-card p-6 rounded-2xl border border-border/50 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-foreground">Performance by Asset</h3>
              <p className="text-xs text-muted-foreground">PnL distribution by instrument</p>
            </div>
          </div>
          <div className="h-[300px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assetPerformance} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} opacity={0.2} />
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 600 }} 
                  width={60}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted)/0.1)' }}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }}
                  formatter={(value: number) => [formatCurrency(value), "Net P&L"]}
                />
                <Bar dataKey="pnl" radius={[0, 4, 4, 0]} barSize={28}>
                  {assetPerformance.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? "hsl(var(--primary))" : "hsl(346, 84%, 61%)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk vs Reward Scatter */}
        <div className="glass-card p-6 rounded-2xl border border-border/50 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-foreground">Risk vs Reward</h3>
              <p className="text-xs text-muted-foreground">Scatter analysis of Risk Taken vs PnL</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Win</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Loss</div>
            </div>
          </div>
          <div className="h-[300px] w-full mt-auto">
            {riskData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                  <XAxis 
                    type="number" 
                    dataKey="risk" 
                    name="Risk" 
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} 
                    tickFormatter={(val) => `${symbol}${val}`}
                    label={{ value: 'Risk Taken', position: 'bottom', offset: 0, fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                  />
                  <YAxis 
                    type="number" 
                    dataKey="pnl" 
                    name="PnL" 
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} 
                    tickFormatter={(val) => `${symbol}${val}`}
                  />
                  <ZAxis type="number" range={[60, 60]} />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }}
                    formatter={(value: number, name: string) => [formatCurrency(value), name === 'risk' ? 'Risk' : 'PnL']}
                  />
                  <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                  <Scatter name="Wins" data={riskData.filter((d: any) => d.isWin)} fill="hsl(150, 60%, 45%)" shape="circle" />
                  <Scatter name="Losses" data={riskData.filter((d: any) => !d.isWin)} fill="hsl(346, 84%, 61%)" shape="circle" />
                </ScatterChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <Scales weight="duotone" className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-sm">No risk data available (Stop Loss missing)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Tag Intelligence */}
      <div className="glass-card p-6 rounded-2xl border border-border/50">
        <h3 className="text-base font-semibold text-foreground mb-6">Tag Intelligence</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Distribution Pie */}
          <div className="h-[250px] relative">
            <h4 className="absolute top-0 left-0 text-xs font-bold uppercase text-muted-foreground">Volume by Tag</h4>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={tagPerformance} 
                  dataKey="count" 
                  nameKey="tag" 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={4}
                  stroke="none"
                >
                  {tagPerformance.map((_: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: "11px", opacity: 0.8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Performance Bar */}
          <div className="h-[250px] relative">
            <h4 className="absolute top-0 left-0 text-xs font-bold uppercase text-muted-foreground">PnL by Tag</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tagPerformance} layout="vertical" margin={{ top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} opacity={0.2} />
                <XAxis type="number" hide />
                <YAxis dataKey="tag" type="category" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }} width={80} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted)/0.1)' }}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} 
                  formatter={(value: number) => [formatCurrency(value), "Total PnL"]} 
                />
                <Bar dataKey="pnl" radius={[0, 4, 4, 0]} barSize={20}>
                  {tagPerformance.map((entry: any, index: number) => <Cell key={index} fill={entry.pnl >= 0 ? "hsl(var(--primary))" : "hsl(346, 84%, 61%)"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Best & Worst Trades List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {[
          { title: "Top Performers", trades: best, color: "text-emerald-500", icon: TrendUp },
          { title: "Largest Drawdowns", trades: worst, color: "text-rose-500", icon: TrendDown }
        ].map((list, idx) => (
          <div key={idx} className="glass-card rounded-2xl overflow-hidden border border-border/50 flex flex-col">
            <div className="p-4 border-b border-border/50 bg-secondary/10 flex items-center gap-2">
              <list.icon weight="bold" className={`w-4 h-4 ${list.color}`} />
              <h3 className="font-semibold text-sm">{list.title}</h3>
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/20">
                  <tr>
                    <th className="text-left p-3 text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Date</th>
                    <th className="text-left p-3 text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Symbol</th>
                    <th className="text-right p-3 text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {list.trades.length > 0 ? list.trades.map((trade: any) => (
                    <tr key={trade.id} className="border-b border-border/30 last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="p-3 text-muted-foreground text-xs">{format(new Date(trade.date), "MMM d")}</td>
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{trade.symbol}</span>
                          <span className="text-[10px] text-muted-foreground uppercase">{trade.type} • {trade.side}</span>
                        </div>
                      </td>
                      <td className={`p-3 text-right font-bold tabular-nums ${trade.pnl >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                        {trade.pnl >= 0 ? "+" : ""}{formatCurrency(trade.pnl)}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-xs text-muted-foreground italic">
                        No trades recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TradeAnalysisTab;