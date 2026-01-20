import { useMemo } from "react";
import { 
  Target, 
  ShieldWarning, 
  TrendUp, 
  TrendDown, 
  ChartLine,
  Lightbulb,
  Spinner
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useStrategies } from "@/hooks/use-strategies";

interface LevelsTabProps {
  stopLoss: string;
  setStopLoss: (value: string) => void;
  target: string;
  setTarget: (value: string) => void;
  strategyId: string | null;
  setStrategyId: (value: string | null) => void;
  side: string;
  entryPrice: string;
}

const LevelsTab = ({
  stopLoss,
  setStopLoss,
  target,
  setTarget,
  strategyId,
  setStrategyId,
  side,
  entryPrice,
}: LevelsTabProps) => {
  const { strategies: availableStrategies, isLoading: loadingStrategies } = useStrategies();

  // Calculate R:R Ratio
  const riskRewardRatio = useMemo(() => {
    const entry = parseFloat(entryPrice) || 0;
    const sl = parseFloat(stopLoss) || 0;
    const tgt = parseFloat(target) || 0;

    if (entry === 0 || sl === 0 || tgt === 0) return null;

    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tgt - entry);

    if (risk === 0) return null;

    return (reward / risk).toFixed(2);
  }, [entryPrice, stopLoss, target]);

  // Calculate potential P&L percentages
  const potentialLoss = useMemo(() => {
    const entry = parseFloat(entryPrice) || 0;
    const sl = parseFloat(stopLoss) || 0;
    if (entry === 0 || sl === 0) return null;
    
    const loss = ((sl - entry) / entry) * 100;
    return side === "LONG" ? loss : -loss;
  }, [entryPrice, stopLoss, side]);

  const potentialGain = useMemo(() => {
    const entry = parseFloat(entryPrice) || 0;
    const tgt = parseFloat(target) || 0;
    if (entry === 0 || tgt === 0) return null;
    
    const gain = ((tgt - entry) / entry) * 100;
    return side === "LONG" ? gain : -gain;
  }, [entryPrice, target, side]);

  // Quick percentage buttons
  const applyQuickStopLoss = (percentage: number) => {
    const entry = parseFloat(entryPrice) || 0;
    if (entry === 0) return;
    
    const multiplier = side === "LONG" ? (1 - percentage / 100) : (1 + percentage / 100);
    setStopLoss((entry * multiplier).toFixed(2));
  };

  const applyQuickTarget = (percentage: number) => {
    const entry = parseFloat(entryPrice) || 0;
    if (entry === 0) return;
    
    const multiplier = side === "LONG" ? (1 + percentage / 100) : (1 - percentage / 100);
    setTarget((entry * multiplier).toFixed(2));
  };

  return (
    <div className="space-y-6 py-2">
      {/* === Risk & Reward Header === */}
      <div className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-primary/5 via-background/50 to-background/50 backdrop-blur-sm border border-primary/10">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-2">
            <ChartLine className="w-5 h-5 text-primary" weight="duotone" />
            <h3 className="text-sm font-semibold tracking-tight">Risk Management</h3>
          </div>
          <p className="text-xs text-muted-foreground/80 tracking-tight leading-relaxed">
            Define your risk parameters and profit targets for disciplined trading.
          </p>
        </div>
      </div>

      {/* === Stop Loss Section === */}
      <div className="space-y-3.5 p-5 rounded-xl bg-muted/5 border border-rose-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <ShieldWarning className="w-4 h-4 text-rose-500" weight="duotone" />
            </div>
            <div>
              <Label className="text-sm font-semibold tracking-tight text-foreground">
                Stop Loss
              </Label>
              <p className="text-[10px] text-muted-foreground mt-0.5">Maximum risk tolerance</p>
            </div>
          </div>
          {potentialLoss !== null && (
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground mb-0.5">Potential Loss</div>
              <div className={cn(
                "text-sm font-bold tracking-tight",
                potentialLoss < 0 ? "text-rose-500" : "text-emerald-500"
              )}>
                {potentialLoss > 0 ? "+" : ""}{potentialLoss.toFixed(2)}%
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-500/70 font-bold text-base">
              $
            </span>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              className={cn(
                "h-10 pl-7 text-sm font-medium tracking-tight rounded-lg",
                "bg-background/50 backdrop-blur-sm border-rose-500/10",
                "focus:border-rose-500/30 focus:shadow-sm",
                "transition-all duration-300"
              )}
            />
          </div>

          {/* Quick Percentage Buttons */}
          <div className="space-y-2">
            <Label className="text-[11px] font-medium text-muted-foreground/80 tracking-tight ml-1">Quick Set (% from entry)</Label>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 5].map((pct) => (
                <Button
                  key={pct}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyQuickStopLoss(pct)}
                  disabled={!entryPrice}
                  className={cn(
                    "h-7 px-3 text-xs tracking-tight font-medium rounded-md",
                    "bg-background/50 backdrop-blur-sm border-rose-500/10",
                    "hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-500",
                    "transition-all duration-300"
                  )}
                >
                  -{pct}%
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* === Target Section === */}
      <div className="space-y-3.5 p-5 rounded-xl bg-muted/5 border border-emerald-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Target className="w-4 h-4 text-emerald-500" weight="duotone" />
            </div>
            <div>
              <Label className="text-sm font-semibold tracking-tight text-foreground">
                Take Profit
              </Label>
              <p className="text-[10px] text-muted-foreground mt-0.5">Desired profit level</p>
            </div>
          </div>
          {potentialGain !== null && (
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground mb-0.5">Potential Gain</div>
              <div className={cn(
                "text-sm font-bold tracking-tight",
                potentialGain > 0 ? "text-emerald-500" : "text-rose-500"
              )}>
                {potentialGain > 0 ? "+" : ""}{potentialGain.toFixed(2)}%
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500/70 font-bold text-base">
              $
            </span>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className={cn(
                "h-10 pl-7 text-sm font-medium tracking-tight rounded-lg",
                "bg-background/50 backdrop-blur-sm border-emerald-500/10",
                "focus:border-emerald-500/30 focus:shadow-sm",
                "transition-all duration-300"
              )}
            />
          </div>

          {/* Quick Percentage Buttons */}
          <div className="space-y-2">
            <Label className="text-[11px] font-medium text-muted-foreground/80 tracking-tight ml-1">Quick Set (% from entry)</Label>
            <div className="flex flex-wrap gap-2">
              {[2, 5, 10, 15].map((pct) => (
                <Button
                  key={pct}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyQuickTarget(pct)}
                  disabled={!entryPrice}
                  className={cn(
                    "h-7 px-3 text-xs tracking-tight font-medium rounded-md",
                    "bg-background/50 backdrop-blur-sm border-emerald-500/10",
                    "hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-500",
                    "transition-all duration-300"
                  )}
                >
                  +{pct}%
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* === Risk/Reward Ratio Display === */}
      {riskRewardRatio && (
        <div className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-primary/20">
          <div className="absolute inset-0 bg-grid-white/5" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-5 h-5 text-primary" weight="duotone" />
              <div>
                <div className="text-[10px] text-muted-foreground tracking-tight uppercase font-semibold">Risk/Reward</div>
                <div className="text-xl font-bold tracking-tight text-primary">
                  1:{riskRewardRatio}
                </div>
              </div>
            </div>
            <div className={cn(
              "px-3 py-1 rounded-lg backdrop-blur-sm border text-xs font-semibold tracking-tight",
              parseFloat(riskRewardRatio) >= 2 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                : parseFloat(riskRewardRatio) >= 1.5 
                ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                : "bg-rose-500/10 border-rose-500/20 text-rose-500"
            )}>
              {parseFloat(riskRewardRatio) >= 2 
                ? "Excellent" 
                : parseFloat(riskRewardRatio) >= 1.5 
                ? "Good" 
                : "Risky"}
            </div>
          </div>
        </div>
      )}

      {/* === Strategy Section === */}
      <div className="space-y-3 p-5 rounded-xl bg-muted/5 border border-white/5">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <ChartLine className="w-4 h-4 text-primary" weight="duotone" />
          </div>
          <div>
            <Label className="text-sm font-semibold tracking-tight text-foreground">
              Trading Strategy
            </Label>
            <p className="text-[10px] text-muted-foreground mt-0.5">Link this trade to a strategy</p>
          </div>
        </div>

        <Select
          value={strategyId ?? "none"}
          onValueChange={(val) => setStrategyId(val === "none" ? null : val)}
        >
          <SelectTrigger className={cn(
            "h-10 bg-background/50 backdrop-blur-sm border-white/5 rounded-lg",
            "focus:border-primary/50 transition-all duration-300",
            "hover:bg-background/80 hover:border-primary/20"
          )}>
            <SelectValue placeholder="Select a strategy..." />
          </SelectTrigger>
          <SelectContent className="bg-background/95 backdrop-blur-md border-white/10 rounded-xl">
            <SelectItem 
              value="none" 
              className="tracking-tight hover:bg-primary/5 focus:bg-primary/5 text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">No Strategy</span>
              </div>
            </SelectItem>
            
            {loadingStrategies ? (
              <div className="flex items-center justify-center p-3 text-muted-foreground">
                <Spinner className="animate-spin w-4 h-4 mr-2" />
                <span className="text-xs">Loading strategies...</span>
              </div>
            ) : availableStrategies.length > 0 ? (
              availableStrategies.map((strategy) => (
                <SelectItem 
                  key={strategy.id} 
                  value={strategy.id}
                  className="tracking-tight hover:bg-primary/5 focus:bg-primary/5"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{strategy.emoji}</span>
                    <div>
                      <div className="font-medium text-sm">{strategy.name}</div>
                      {strategy.description && (
                        <div className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                          {strategy.description}
                        </div>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))
            ) : (
              <div className="p-3 text-center text-xs text-muted-foreground">
                No strategies found
              </div>
            )}
          </SelectContent>
        </Select>

        {/* Strategy Info Hint */}
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <Lightbulb className="w-4 h-4 text-primary/70 mt-0.5 flex-shrink-0" weight="duotone" />
          <p className="text-[10px] text-muted-foreground/80 leading-relaxed tracking-tight">
            Linking trades to strategies helps you analyze performance patterns.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LevelsTab;