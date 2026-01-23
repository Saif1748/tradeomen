// src/hooks/use-reports.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-Auth";

// Tabs supported by Reports UI
export type ReportTab =
  | "overview"
  | "analysis"
  | "strategy"
  | "time"
  | "ai-insights";

export interface ReportFilters {
  instrument: string; // 'all' | 'STOCK' | 'CRYPTO' ...
  strategy: string;   // 'all' | strategy_id (or name)
  from?: Date;
  to?: Date;
}

export function useReports(
  tab: ReportTab,
  filters: ReportFilters = { instrument: "all", strategy: "all" }
) {
  const { user } = useAuth();

  /**
   * Map UI tabs -> SQL RPCs
   */
  const rpcMap: Record<ReportTab, string> = {
    overview: "get_overview_report",
    analysis: "get_trade_analysis",      // General metrics breakdown
    strategy: "get_strategy_analysis",   // Performance by strategy
    time: "get_time_analysis",           // Hourly/Daily breakdown
    "ai-insights": "get_overview_report", // Reuses overview data for context
  };

  return useQuery({
    queryKey: [
      "reports",
      user?.id,
      tab,
      filters.instrument || "all",
      filters.strategy || "all",
      filters.from ? filters.from.toISOString() : "all-time",
      filters.to ? filters.to.toISOString() : "now",
    ],

    queryFn: async () => {
      if (!user?.id) return null;

      const rpcName = rpcMap[tab];
      if (!rpcName) return null;

      // Prepare date params safely
      const startDate = filters.from ? filters.from.toISOString() : null;
      // If 'to' is set, use it. If not, default to end of today (effectively 'now' for reporting)
      const endDate = filters.to ? filters.to.toISOString() : new Date().toISOString();

      const { data, error } = await supabase.rpc(rpcName, {
        p_user_id: user.id,
        p_instrument: filters.instrument || "all",
        p_strategy: filters.strategy || "all",
        p_start_date: startDate,
        p_end_date: endDate,
      });

      if (error) {
        console.error(`[useReports] RPC Error (${rpcName}):`, error.message);
        throw new Error(error.message);
      }

      return data;
    },

    enabled: !!user?.id,
    
    // Performance Settings
    staleTime: 1000 * 60 * 5,    // 5 minutes
    gcTime: 1000 * 60 * 30,      // 30 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    placeholderData: (previous) => previous,
  });
}