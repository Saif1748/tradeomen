// src/hooks/use-calendar.tsx
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-Auth";
import { startOfMonth, endOfMonth } from "date-fns";

// ---- Frontend types ----
export interface CalendarTrade {
  id: string;
  symbol: string;
  direction: string;
  pnl: number;
  strategy: string | null;
}

export interface CalendarDayStats {
  trade_date: string;           // "YYYY-MM-DD"
  daily_pnl: number;
  trade_count: number;
  win_count: number;
  win_rate: number;             // percent, e.g. 62.5
  best_strategy: string | null;
  emotion?: string | null;
  trades?: CalendarTrade[];
}

// ---- RPC response shape (matches get_calendar_stats RETURN TABLE) ----
interface RpcCalendarRow {
  trade_date: string;               // date as string "YYYY-MM-DD" (Postgres DATE)
  total_pnl: string | number | null;
  trade_count: string | number | null;
  win_count: string | number | null;
  win_rate: string | number | null;
  best_strategy: string | null;
  emotion: string | null;
  trades_json: any;                 // could be null, array, or JSON string
}

export function useCalendar(month: Date) {
  const { user } = useAuth();

  // Use the month start ISO (YYYY-MM) for a stable key
  const monthKey = startOfMonth(month).toISOString();

  return useQuery({
    queryKey: ["calendar-stats", user?.id, monthKey],
    queryFn: async (): Promise<Record<string, CalendarDayStats>> => {
      // Always return a record shape
      const empty: Record<string, CalendarDayStats> = {};
      if (!user?.id) return empty;

      // Build UTC-range for the month
      const start = startOfMonth(month);
      start.setHours(0, 0, 0, 0);
      const end = endOfMonth(month);
      end.setHours(23, 59, 59, 999);

      let rpc;
      try {
        rpc = await supabase.rpc<RpcCalendarRow>("get_calendar_stats", {
          p_user_id: user.id,
          p_start_date: start.toISOString(),
          p_end_date: end.toISOString(),
        });
      } catch (err) {
        console.error("Calendar Stats RPC failed:", err);
        throw err;
      }

      const { data, error } = rpc as { data: any; error: any };

      if (error) {
        console.error("Calendar Stats Error:", error);
        throw error;
      }

      const statsRecord: Record<string, CalendarDayStats> = {};

      if (!data || !Array.isArray(data)) {
        return statsRecord;
      }

      for (const rawRow of data) {
        try {
          // Normalize numeric fields (Supabase/Postgres may return numeric as string)
          const dailyPnl = rawRow.total_pnl !== null && rawRow.total_pnl !== undefined
            ? Number(rawRow.total_pnl)
            : 0;
          const tradeCount = rawRow.trade_count !== null && rawRow.trade_count !== undefined
            ? Number(rawRow.trade_count)
            : 0;
          const winCount = rawRow.win_count !== null && rawRow.win_count !== undefined
            ? Number(rawRow.win_count)
            : 0;
          const winRate = rawRow.win_rate !== null && rawRow.win_rate !== undefined
            ? Number(rawRow.win_rate)
            : 0;

          // Parse trades_json safely (array | json-string | null)
          let tradesArr: CalendarTrade[] = [];
          if (rawRow.trades_json) {
            // If the RPC returned JSONB already parsed as JS array/object
            if (Array.isArray(rawRow.trades_json)) {
              tradesArr = rawRow.trades_json.map((tr: any) => ({
                id: String(tr.id),
                symbol: tr.symbol ?? "",
                direction: String(tr.direction ?? "").toLowerCase(),
                pnl: Number(tr.pnl ?? 0),
                strategy: tr.strategy ?? null,
              }));
            } else if (typeof rawRow.trades_json === "string") {
              // JSON string — attempt parse
              try {
                const parsed = JSON.parse(rawRow.trades_json);
                if (Array.isArray(parsed)) {
                  tradesArr = parsed.map((tr: any) => ({
                    id: String(tr.id),
                    symbol: tr.symbol ?? "",
                    direction: String(tr.direction ?? "").toLowerCase(),
                    pnl: Number(tr.pnl ?? 0),
                    strategy: tr.strategy ?? null,
                  }));
                }
              } catch (e) {
                console.warn("Failed to parse trades_json for", rawRow.trade_date, e);
                tradesArr = [];
              }
            } else {
              // unknown shape: attempt to coerce if it looks like an object with entries
              tradesArr = [];
            }
          }

          statsRecord[String(rawRow.trade_date)] = {
            trade_date: String(rawRow.trade_date),
            daily_pnl: dailyPnl,
            trade_count: tradeCount,
            win_count: winCount,
            win_rate: winRate,
            best_strategy: rawRow.best_strategy === "No Strategy" ? null : rawRow.best_strategy,
            emotion: rawRow.emotion ?? null,
            trades: tradesArr,
          };
        } catch (err) {
          console.error("Failed to map calendar row:", rawRow, err);
          // skip malformed row but continue processing others
          continue;
        }
      }

      return statsRecord;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: (previousData) => previousData as any,
  });
}
