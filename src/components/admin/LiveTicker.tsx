import { UserPlus, CreditCard, TrendingUp, ArrowUpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TickerEvent {
  id: string;
  type: "signup" | "upgrade" | "payment" | "trade";
  message: string;
  time: string;
}

const mockEvents: TickerEvent[] = [
  { id: "1", type: "signup", message: "New user: john.doe@email.com", time: "2m ago" },
  { id: "2", type: "upgrade", message: "Upgrade to Pro: sarah@trade.io", time: "5m ago" },
  { id: "3", type: "payment", message: "Payment received: $49.00", time: "8m ago" },
  { id: "4", type: "trade", message: "1,250 trades imported today", time: "12m ago" },
  { id: "5", type: "signup", message: "New user: trader_mike@gmail.com", time: "15m ago" },
  { id: "6", type: "upgrade", message: "Upgrade to Pro: alex@stocks.net", time: "18m ago" },
  { id: "7", type: "payment", message: "Payment received: $149.00", time: "22m ago" },
];

const iconMap = {
  signup: UserPlus,
  upgrade: ArrowUpCircle,
  payment: CreditCard,
  trade: TrendingUp,
};

const colorMap = {
  signup: "text-blue-500 bg-blue-500/10",
  upgrade: "text-purple-500 bg-purple-500/10",
  payment: "text-emerald-500 bg-emerald-500/10",
  trade: "text-amber-500 bg-amber-500/10",
};

export function LiveTicker() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-sm font-medium text-foreground">Live Activity</h3>
        </div>
        <span className="text-xs text-muted-foreground">Real-time</span>
      </div>
      <div className="max-h-[320px] overflow-y-auto">
        {mockEvents.map((event) => {
          const Icon = iconMap[event.type];
          return (
            <div
              key={event.id}
              className="px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={cn("p-1.5 rounded-md", colorMap[event.type])}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{event.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{event.time}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
