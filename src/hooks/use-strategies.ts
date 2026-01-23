import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { strategiesApi } from "@/services/api/modules/strategies";
import { Strategy as ApiStrategy } from "@/services/api/types";
import { useAuth } from "@/hooks/use-Auth";
import { toast } from "sonner";

/* ================================
   Types
================================ */

export interface UIStrategy {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  style: string;
  instrumentTypes: string[];
  rules: Record<string, string[]>;
  trackMissed: boolean;
  createdAt: Date;
  stats: {
    totalTrades: number;
    winRate: number;
    netPL: number;
    profitFactor: number;
    avgWinner: number;
    avgLoser: number;
    expectancy: number;
  };
}

interface StrategyFilters {
  instrument?: string; // 'all' | 'stock' | 'crypto' etc
  from?: Date;
  to?: Date;
}

/* ================================
   Hook: useStrategies
================================ */

export function useStrategies(filters?: StrategyFilters) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  /* ---------- DB -> UI mapper ---------- */
  const mapDbToUi = (s: any): UIStrategy => ({
    id: s.id,
    name: s.name,
    description: s.description ?? "",
    emoji: s.emoji ?? "♟️",
    color: s.color_hex ?? "#FFFFFF",
    style: s.style ?? "General",
    instrumentTypes: s.instrument_types ?? [],
    rules: s.rules ?? {},
    trackMissed: Boolean(s.track_missed_trades),
    createdAt: new Date(s.created_at),

    stats: {
      totalTrades: Number(s.stats?.totalTrades ?? 0),
      winRate: Number(s.stats?.winRate ?? 0),
      netPL: Number(s.stats?.netPL ?? 0),
      profitFactor: Number(s.stats?.profitFactor ?? 0),
      avgWinner: Number(s.stats?.avgWinner ?? 0),
      avgLoser: Number(s.stats?.avgLoser ?? 0),
      expectancy: Number(s.stats?.expectancy ?? 0),
    },
  });

  /* ---------- UI -> API mapper ---------- */
  const mapUiToApi = (s: Partial<UIStrategy>): Partial<ApiStrategy> => {
    const payload: any = { ...s };

    if (s.color !== undefined) payload.color_hex = s.color;
    if (s.instrumentTypes !== undefined)
      payload.instrument_types = s.instrumentTypes;
    if (s.trackMissed !== undefined)
      payload.track_missed_trades = s.trackMissed;

    delete payload.color;
    delete payload.instrumentTypes;
    delete payload.trackMissed;
    delete payload.stats;
    delete payload.createdAt;

    return payload;
  };

  /* ---------- Query ---------- */
  const query = useQuery({
    queryKey: [
      "strategies",
      user?.id,
      filters?.instrument ?? "all",
      filters?.from?.toISOString() ?? null,
      filters?.to?.toISOString() ?? null,
    ],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase.rpc(
        "get_strategies_with_stats",
        {
          p_user_id: user.id,
          p_instrument: filters?.instrument ?? "all",
          p_start_date: filters?.from
            ? filters.from.toISOString()
            : null,
          p_end_date: filters?.to ? filters.to.toISOString() : null,
        }
      );

      if (error) {
        console.error("[useStrategies] RPC Error:", error);
        throw error;
      }

      return (data ?? []).map(mapDbToUi);
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });

  /* ---------- Invalidation ---------- */
  const invalidateCascade = () => {
    queryClient.invalidateQueries({ queryKey: ["strategies"] });
    queryClient.invalidateQueries({ queryKey: ["trades"] });
    queryClient.invalidateQueries({ queryKey: ["reports"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
  };

  /* ---------- Mutations ---------- */
  const createMutation = useMutation({
    mutationFn: (newStrategy: Partial<UIStrategy>) =>
      strategiesApi.create(mapUiToApi(newStrategy)),
    onSuccess: () => {
      invalidateCascade();
      toast.success("Strategy created");
    },
    onError: (err: any) =>
      toast.error(err?.detail || "Failed to create strategy"),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<UIStrategy>;
    }) => strategiesApi.update(id, mapUiToApi(data)),
    onSuccess: () => {
      invalidateCascade();
      toast.success("Strategy updated");
    },
    onError: (err: any) =>
      toast.error(err?.detail || "Failed to update strategy"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => strategiesApi.delete(id),
    onSuccess: () => {
      invalidateCascade();
      toast.success("Strategy deleted");
    },
    onError: (err: any) =>
      toast.error(err?.detail || "Failed to delete strategy"),
  });

  return {
    strategies: query.data ?? [],
    strategyNames: (query.data ?? []).map((s) => s.name),
    isLoading: query.isLoading,
    isError: query.isError,

    createStrategy: createMutation.mutateAsync,
    updateStrategy: updateMutation.mutateAsync,
    deleteStrategy: deleteMutation.mutateAsync,

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

/* ================================
   Hook: useStrategyTrades
================================ */

export function useStrategyTrades(strategyId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["strategy-trades", user?.id, strategyId],
    queryFn: async () => {
      if (!user?.id || !strategyId) return [];

      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", user.id)
        .eq("strategy_id", strategyId)
        .eq("status", "CLOSED") // ✅ consistent with stats
        .order("start_time", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id && !!strategyId,
    staleTime: 1000 * 60 * 5,
  });
}
