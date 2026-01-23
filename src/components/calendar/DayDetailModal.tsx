import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDayStats } from "@/hooks/use-calendar";
import {
  TrendUp,
  TrendDown,
  Target,
  Lightning,
  Spinner,
  Crown,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/use-currency";

interface DayDetailModalProps {
  // Support both prop styles used across the app
  open?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  dayData: CalendarDayStats | null;
}

// Small normalized trade shape used locally
interface NormalizedTrade {
  id: string;
  symbol: string;
  direction: string;
  pnl: number;
  strategy?: string | null;
}

// Sub-component to lazy load trades for the specific day
const DayTradesList: React.FC<{ date: string }> = ({ date }) => {
  const { format: formatCurrency, symbol } = useCurrency();

  const { data: trades, isLoading } = useQuery<NormalizedTrade[]>({
    queryKey: ["day-trades", date],
    queryFn: async () => {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from("trades")
        // Select the correct columns from your schema. Use relationship syntax for strategies.
        .select("id, symbol, direction, total_pnl, strategies!strategy_id(name)")
        .gte("start_time", start.toISOString())
        .lte("start_time", end.toISOString())
        .order("start_time", { ascending: false });

      if (error) throw error;

      // Normalize to a simple shape expected by UI
      const normalized: NormalizedTrade[] = (data || []).map((t: any) => ({
        id: String(t.id),
        symbol: t.symbol ?? "",
        direction: String(t.direction ?? "").toUpperCase(),
        pnl: Number(t.total_pnl ?? 0),
        strategy: t.strategies?.name ?? null,
      }));

      return normalized;
    },
    enabled: !!date,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner className="animate-spin w-6 h-6 text-primary" />
      </div>
    );
  }

  if (!trades || trades.length === 0) {
    return <p className="text-center text-muted-foreground p-4 text-sm">No trades found for this day.</p>;
  }

  return (
    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
      {trades.map((trade) => (
        <div key={trade.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                trade.direction === "LONG" ? "bg-emerald-500/20" : "bg-rose-500/20"
              )}
            >
              {trade.direction === "LONG" ? (
                <TrendUp weight="bold" className="w-4 h-4 text-emerald-400" />
              ) : (
                <TrendDown weight="bold" className="w-4 h-4 text-rose-400" />
              )}
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">{trade.symbol}</span>
              <span className="text-xs text-muted-foreground block capitalize">{trade.direction.toLowerCase()}</span>
            </div>
          </div>
          <div className="text-right">
            <span
              className={cn(
                "text-sm font-semibold",
                trade.pnl > 0 ? "text-emerald-400" : "text-rose-400"
              )}
            >
              {trade.pnl >= 0 ? "+" : "-"}
              {symbol}
              {formatCurrency(Math.abs(trade.pnl))}
            </span>
            <span className="text-xs text-muted-foreground block">{trade.strategy || "No Strategy"}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const OverviewCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-xs text-muted-foreground">{title}</span>
    </div>
    <span className="text-lg font-semibold text-foreground truncate block">{value}</span>
  </div>
);

const ModalContent: React.FC<{ dayData: CalendarDayStats }> = ({ dayData }) => {
  const { format: formatCurrency, symbol } = useCurrency();
  const winRate = dayData.trade_count > 0 ? Math.round((dayData.win_count / dayData.trade_count) * 100) : 0;

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="w-full mb-4 bg-secondary/50">
        <TabsTrigger value="overview" className="flex-1">
          Overview
        </TabsTrigger>
        <TabsTrigger value="trades" className="flex-1">
          Trades
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <OverviewCard
            title="Total P&L"
            value={`${dayData.daily_pnl >= 0 ? "+" : "-"}${symbol}${formatCurrency(Math.abs(dayData.daily_pnl))}`}
            icon={
              dayData.daily_pnl >= 0 ? (
                <TrendUp weight="bold" className="w-4 h-4 text-emerald-400" />
              ) : (
                <TrendDown weight="bold" className="w-4 h-4 text-rose-400" />
              )
            }
          />

          <OverviewCard title="Win Rate" value={`${winRate}%`} icon={<Target weight="bold" className="w-4 h-4 text-primary" />} />

          <OverviewCard title="Trades" value={dayData.trade_count} icon={<Lightning weight="bold" className="w-4 h-4 text-yellow-400" />} />

          <OverviewCard title="Best Strategy" value={dayData.best_strategy || "N/A"} icon={<Crown weight="bold" className="w-4 h-4 text-purple-400" />} />
        </div>
      </TabsContent>

      <TabsContent value="trades">
        <DayTradesList date={dayData.trade_date} />
      </TabsContent>
    </Tabs>
  );
};

const DayDetailModal: React.FC<DayDetailModalProps> = ({ open, isOpen, onOpenChange, onClose, dayData }) => {
  const isMobile = useIsMobile();
  const { format: formatCurrency, symbol } = useCurrency();

  // Support both prop styles
  const visible = typeof open === "boolean" ? open : Boolean(isOpen);
  const handleOpenChange = (val: boolean) => {
    if (onOpenChange) onOpenChange(val);
    if (!val && onClose) onClose();
  };

  if (!dayData) return null;

  const dateObj = new Date(dayData.trade_date + "T00:00:00");
  const dateTitle = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const headerContent = (
    <div className="flex items-center gap-3">
      <span className="text-foreground">{dateTitle}</span>
      <Badge
        variant="outline"
        className={cn(dayData.daily_pnl >= 0 ? "border-emerald-500/50 text-emerald-400" : "border-rose-500/50 text-rose-400")}
      >
        {dayData.daily_pnl >= 0 ? "+" : "-"}
        {symbol}
        {formatCurrency(Math.abs(dayData.daily_pnl))}
      </Badge>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={visible} onOpenChange={handleOpenChange}>
        <SheetContent side="bottom" className="h-[65vh] rounded-t-3xl">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-left">{headerContent}</SheetTitle>
          </SheetHeader>
          <ModalContent dayData={dayData} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={visible} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle>{headerContent}</DialogTitle>
        </DialogHeader>
        <ModalContent dayData={dayData} />
      </DialogContent>
    </Dialog>
  );
};

export default DayDetailModal;
