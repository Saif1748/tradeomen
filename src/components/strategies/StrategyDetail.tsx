import { useState } from "react";
import {
  ArrowLeft,
  PencilSimple,
  Trash,
  TrendUp,
  TrendDown,
  Sparkle,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Hooks
import { useCurrency } from "@/hooks/use-currency";
import { useStrategyTrades } from "@/hooks/use-strategies";

/* =========================
   Types
========================= */

interface StrategyDetailData {
  id: string;
  name: string;
  description?: string;
  emoji?: string;
  style?: string;
  instrument_types?: string[];
  rules?: Record<string, string[]>;
  totalTrades: number;
  winRate: number;
  netPnl: number;
  profitFactor: number;
  expectancy: number;
  avgWin: number;
  avgLoss: number;
}

interface StrategyDetailProps {
  strategy: StrategyDetailData;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/* =========================
   Component
========================= */

const StrategyDetail = ({
  strategy,
  onBack,
  onEdit,
  onDelete,
}: StrategyDetailProps) => {
  const [activeTab, setActiveTab] = useState<"rules" | "trades" | "insights">(
    "rules"
  );

  const { format, symbol } = useCurrency();

  /* =========================
     Trades (linked by strategy_id)
  ========================= */

  const { data: trades, isLoading: tradesLoading } = useStrategyTrades(
    strategy.id
  );

  /* =========================
     Normalized stats
  ========================= */

  const totalTrades = Number(strategy.totalTrades) || 0;
  const winRate = Number(strategy.winRate) || 0;
  const netPnl = Number(strategy.netPnl) || 0;
  const expectancy = Number(strategy.expectancy) || 0;
  const avgWin = Number(strategy.avgWin) || 0;
  const avgLoss = Number(strategy.avgLoss) || 0;
  const profitFactor = Number(strategy.profitFactor) || 0;

  const pnlColor = netPnl >= 0 ? "text-emerald-400" : "text-rose-400";
  const winRateColor = winRate >= 50 ? "text-emerald-400" : "text-rose-400";
  const expectancyColor =
    expectancy >= 0 ? "text-emerald-400" : "text-rose-400";

  const ruleGroups = strategy.rules
    ? Object.entries(strategy.rules)
    : [];

  /* =========================
     Render
  ========================= */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{strategy.emoji || "♟️"}</span>
              <h1 className="text-2xl font-medium text-foreground">
                {strategy.name}
              </h1>
            </div>

            <p className="text-muted-foreground max-w-2xl mb-3">
              {strategy.description || "No description provided."}
            </p>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{strategy.style || "General"}</Badge>
              {strategy.instrument_types?.map((inst) => (
                <Badge key={inst} variant="outline">
                  {inst}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={onEdit}>
            <PencilSimple className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onDelete}
            className="hover:text-rose-400 hover:border-rose-400/50"
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass-card p-5 rounded-xl">
          <p className="text-sm text-muted-foreground">Total Trades</p>
          <p className="text-2xl font-medium">{totalTrades}</p>
        </div>

        <div className="glass-card p-5 rounded-xl">
          <p className="text-sm text-muted-foreground">Win Rate</p>
          <p className={cn("text-2xl font-medium", winRateColor)}>
            {winRate.toFixed(1)}%
          </p>
        </div>

        <div className="glass-card p-5 rounded-xl">
          <p className="text-sm text-muted-foreground">Net P&L</p>
          <p className={cn("text-2xl font-medium", pnlColor)}>
            {netPnl >= 0 ? "+" : "-"}
            {symbol}
            {format(Math.abs(netPnl))}
          </p>
        </div>

        <div className="glass-card p-5 rounded-xl">
          <p className="text-sm text-muted-foreground">Profit Factor</p>
          <p className="text-2xl font-medium">
            {profitFactor.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="glass-card p-6 rounded-2xl">
        <h2 className="text-lg font-medium mb-4">Performance Metrics</h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Expectancy</p>
            <p className={cn("text-xl font-medium", expectancyColor)}>
              {expectancy >= 0 ? "+" : "-"}
              {symbol}
              {format(Math.abs(expectancy))}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Avg Winner</p>
            <div className="flex items-center gap-2">
              <TrendUp className="w-4 h-4 text-emerald-400" />
              <span className="text-xl font-medium text-emerald-400">
                +{symbol}
                {format(Math.abs(avgWin))}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Avg Loser</p>
            <div className="flex items-center gap-2">
              <TrendDown className="w-4 h-4 text-rose-400" />
              <span className="text-xl font-medium text-rose-400">
                -{symbol}
                {format(Math.abs(avgLoss))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="w-full bg-secondary/50 p-1 rounded-xl">
          <TabsTrigger value="rules" className="flex-1">Rules</TabsTrigger>
          <TabsTrigger value="trades" className="flex-1">Trades</TabsTrigger>
          <TabsTrigger value="insights" className="flex-1">AI Insights</TabsTrigger>
        </TabsList>

        {/* Rules */}
        <TabsContent value="rules" className="mt-4">
          {ruleGroups.length ? (
            <div className="grid md:grid-cols-2 gap-4">
              {ruleGroups.map(([group, rules]) => (
                <div key={group} className="glass-card p-5 rounded-xl">
                  <h3 className="font-medium mb-3">{group}</h3>
                  <ul className="space-y-2">
                    {rules.map((rule, i) => (
                      <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 mt-2 rounded-full bg-primary" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card p-10 text-center text-muted-foreground">
              No rules defined.
            </div>
          )}
        </TabsContent>

        {/* Trades */}
        <TabsContent value="trades" className="mt-4">
          {tradesLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : trades && trades.length ? (
            <div className="glass-card rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="px-4 py-3 text-left">Symbol</th>
                    <th className="px-4 py-3">Side</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {trades.map((t: any) => {
                    const pnl = Number(t.total_pnl) || 0;
                    return (
                      <tr key={t.id} className="hover:bg-white/5">
                        <td className="px-4 py-3 font-medium">{t.symbol}</td>
                        <td className={cn(
                          "px-4 py-3",
                          t.direction === "LONG"
                            ? "text-emerald-400"
                            : "text-rose-400"
                        )}>
                          {t.direction}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{t.status}</Badge>
                        </td>
                        <td className={cn(
                          "px-4 py-3 text-right font-bold",
                          pnl >= 0 ? "text-emerald-400" : "text-rose-400"
                        )}>
                          {pnl >= 0 ? "+" : "-"}
                          {symbol}
                          {format(Math.abs(pnl))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="glass-card p-12 text-center text-muted-foreground">
              No trades linked to this strategy.
            </div>
          )}
        </TabsContent>

        {/* AI Insights */}
        <TabsContent value="insights" className="mt-4">
          <div className="glass-card p-12 text-center relative">
            <Badge className="absolute top-4 right-4 gap-1">
              <Sparkle className="w-3 h-3" /> Coming Soon
            </Badge>
            <p className="font-medium">AI Strategy Insights</p>
            <p className="text-sm text-muted-foreground mt-2">
              Automated analysis of your executions is coming soon.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StrategyDetail;
