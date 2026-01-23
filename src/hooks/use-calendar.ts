import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-Auth"; 
import { startOfMonth, endOfMonth } from "date-fns";

// ✅ 1. Define the Trade shape matching the SQL JSON object
export interface CalendarTrade {
  id: string;
  symbol: string;
  direction: string;
  pnl: number;
  strategy: string | null;
}

// ✅ 2. Use the Trade type in the Stats interface
export interface CalendarDayStats {
  trade_date: string;
  daily_pnl: number;
  trade_count: number;
  win_count: number;
  best_strategy: string | null;
  emotion?: string | null;
  trades?: CalendarTrade[];
}

export function useCalendar(month: Date) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["calendar-stats", user?.id, month.toISOString()],
    queryFn: async () => {
      if (!user?.id) return {};

      // Calculate range for DB query
      const start = startOfMonth(month);
      const end = endOfMonth(month);
      // Ensure full day coverage in UTC to match DB storage
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      // Call the fixed RPC function
      const { data, error } = await supabase.rpc("get_calendar_stats", {
        p_user_id: user.id,
        p_start_date: start.toISOString(),
        p_end_date: end.toISOString(),
      });

      if (error) {
        console.error("Calendar Stats Error:", error);
        throw error;
      }

      // ✅ 3. Return a Record for fast O(1) lookup in the Grid
      const statsRecord: Record<string, CalendarDayStats> = {};
      
      if (data && Array.isArray(data)) {
        data.forEach((day: any) => {
          // Parse trades list safely (handles potential nulls from DB)
          const trades: CalendarTrade[] = day.trades_json || [];
          
          statsRecord[day.trade_date] = {
            trade_date: day.trade_date,
            // Map SQL 'total_pnl' -> Frontend 'daily_pnl'
            daily_pnl: Number(day.total_pnl) || 0, 
            trade_count: Number(day.trade_count) || 0,
            // Use SQL-calculated win count (Efficient)
            win_count: Number(day.win_count) || 0,
            best_strategy: day.best_strategy === "No Strategy" ? null : day.best_strategy,
            emotion: day.emotion,
            trades: trades
          };
        });
      }

      return statsRecord;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 mins
    placeholderData: (previousData) => previousData, // Prevent flashing on nav
  });
}