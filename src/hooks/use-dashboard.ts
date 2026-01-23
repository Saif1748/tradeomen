import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-Auth";
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";
import { DateRange } from "react-day-picker";

export interface DashboardMetrics {
  net_pnl: number;
  total_trades: number;
  expectancy: number; // Avg PnL per trade
  profit_factor: number;
  win_rate: number;
  avg_win: number;
  avg_loss: number;
  avg_win_loss_ratio: number;
  long_win_rate: number;
  short_win_rate: number;
  equity_curve: Array<{ date: string; equity: number }>;
  daily_pnl: Array<{ date: string; pnl: number }>;
}

const DEFAULT_METRICS: DashboardMetrics = {
  net_pnl: 0,
  total_trades: 0,
  expectancy: 0,
  profit_factor: 0,
  win_rate: 0,
  avg_win: 0,
  avg_loss: 0,
  avg_win_loss_ratio: 0,
  long_win_rate: 0,
  short_win_rate: 0,
  equity_curve: [],
  daily_pnl: []
};

export function useDashboard(dateRange: DateRange | undefined) {
  const { user } = useAuth();

  const from = dateRange?.from || startOfMonth(new Date());
  const to = dateRange?.to || endOfMonth(new Date());

  return useQuery({
    queryKey: ["dashboard-analytics", user?.id, from.toISOString(), to?.toISOString()],
    queryFn: async (): Promise<DashboardMetrics> => {
      if (!user?.id) return DEFAULT_METRICS;

      const startDate = startOfDay(from);
      const endDate = endOfDay(to || from);

      const { data, error } = await supabase.rpc("get_dashboard_analytics", {
        p_user_id: user.id,
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString(),
      });

      if (error) {
        console.error("Dashboard Analytics Error:", error);
        throw error;
      }

      // The RPC returns a single row object
      const res = data && data[0] ? data[0] : null;

      if (!res) return DEFAULT_METRICS;

      return {
        net_pnl: Number(res.net_pnl) || 0,
        total_trades: Number(res.total_trades) || 0,
        expectancy: Number(res.avg_pnl_per_trade) || 0,
        profit_factor: Number(res.profit_factor) || 0,
        win_rate: Number(res.win_rate) || 0,
        avg_win: Number(res.avg_win) || 0,
        avg_loss: Number(res.avg_loss) || 0,
        avg_win_loss_ratio: Number(res.avg_win_loss_ratio) || 0,
        long_win_rate: Number(res.long_win_rate) || 0,
        short_win_rate: Number(res.short_win_rate) || 0,
        equity_curve: res.equity_curve || [],
        daily_pnl: res.daily_pnl_chart || []
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    placeholderData: (prev) => prev,
  });
}