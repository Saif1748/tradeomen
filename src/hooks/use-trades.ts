// src/hooks/use-trades.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { tradesApi } from "@/services/api/modules/trades";
import { useAuth } from "@/hooks/use-Auth";
import { toast } from "sonner";
import { CreateTradeInput, UpdateTradeInput, ExecutionCreate } from "@/services/api/types";

interface TradeDBResponse {
  id: string;
  user_id: string;
  symbol: string;
  start_time: string;
  instrument_type: string;
  direction: string; // 'LONG' | 'SHORT'
  status: string; // 'OPEN' | 'CLOSED' | 'CANCELED'
  net_quantity: number;
  avg_price: number;
  total_pnl: number;
  total_fees: number;
  stop_loss?: number | null;
  target?: number | null;
  tags: string[] | null;
  strategies?: { name: string } | null;
}

interface ExecutionDBResponse {
  id: string;
  trade_id: string;
  execution_time: string;
  side: string; // 'BUY' | 'SELL'
  price: number;
  quantity: number;
  fees?: number | null;
}

export interface UITrade {
  id: string;
  user_id: string;
  symbol: string;
  date: Date;
  type: string;
  side: string;
  status: string;

  quantity: number; // UI quantity: current open or initial for closed
  entryPrice: number; // weighted entry price (from executions or fallback to avg_price)
  pnl: number;
  fees: number;

  stopLoss?: number;
  target?: number;
  tags: string[];
  strategy: string;
  rMultiple: number;
}

export function useTrades({ page, limit }: { page: number; limit: number }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  /**
   * Compute initial entry aggregates from executions.
   * Strategy: include consecutive same-side executions from the start
   * (i.e. the "first block" of entry-side fills) and stop when the first
   * opposite-side execution appears. This yields the initial entry quantity
   * and weighted entry price.
   */
  const computeEntryFromExecutions = (execs: ExecutionDBResponse[], direction: string) => {
    const entrySide = String(direction || "").toUpperCase() === "LONG" ? "BUY" : "SELL";
    let initialQty = 0;
    let weightedPriceNumerator = 0;

    // execs expected to be sorted ascending by execution_time
    for (const e of execs) {
      const side = String(e.side || "").toUpperCase();
      if (side === entrySide) {
        const q = Number(e.quantity || 0);
        const p = Number(e.price || 0);
        initialQty += q;
        weightedPriceNumerator += p * q;
      } else {
        // first opposite-side execution -> stop accumulating initial entry
        break;
      }
    }

    const entryWeightedPrice = initialQty > 0 ? weightedPriceNumerator / initialQty : 0;
    return { initialQty, entryWeightedPrice };
  };

  const mapDbToUi = (t: TradeDBResponse, execsForTrade: ExecutionDBResponse[] = []): UITrade => {
    const pnl = Number(t.total_pnl) || 0;
    const tradeNetQty = Number(t.net_quantity) || 0;
    const dbAvgPrice = Number(t.avg_price) || 0;
    const stopLossRaw = t.stop_loss;
    const stopLoss = stopLossRaw !== null && stopLossRaw !== undefined ? Number(stopLossRaw) : undefined;
    const fees = Number(t.total_fees) || 0;

    // closed detection
    const statusStr = String(t.status || "").toLowerCase();
    const isClosed = tradeNetQty === 0 || statusStr === "closed";

    // Ensure executions are sorted ascending by time (safety)
    const sortedExecs = execsForTrade.slice().sort((a, b) => {
      const ta = new Date(a.execution_time).getTime();
      const tb = new Date(b.execution_time).getTime();
      return ta - tb;
    });

    const { initialQty, entryWeightedPrice } = computeEntryFromExecutions(sortedExecs, t.direction);

    const entryPrice = entryWeightedPrice > 0 ? entryWeightedPrice : dbAvgPrice;

    // R-Multiple only for closed trades and if initialQty & stopLoss exist
    let rMultiple = 0;
    if (isClosed && initialQty > 0 && entryPrice > 0 && stopLoss !== undefined && stopLoss !== null) {
      const riskPerUnit = Math.abs(entryPrice - stopLoss);
      const totalRisk = riskPerUnit * Math.abs(initialQty);
      if (totalRisk > 0) {
        rMultiple = pnl / totalRisk;
      }
    }

    // UI quantity: open trades show net_quantity, closed trades show initialQty (fallback 0)
    const uiQuantity = tradeNetQty !== 0 ? Math.abs(tradeNetQty) : Math.abs(initialQty);

    return {
      id: t.id,
      user_id: t.user_id,
      symbol: t.symbol,
      date: new Date(t.start_time || Date.now()),
      type: t.instrument_type,
      side: t.direction,
      status: t.status,

      quantity: Number(uiQuantity || 0),
      entryPrice: Number(entryPrice || 0),
      pnl: Number(pnl || 0),
      fees: Number(fees || 0),

      stopLoss: stopLoss !== undefined ? stopLoss : undefined,
      target: t.target ? Number(t.target) : undefined,
      tags: t.tags || [],
      strategy: t.strategies?.name || "No Strategy",
      rMultiple,
    };
  };

  // --- Query (Supabase) ---
  const query = useQuery({
    queryKey: ["trades", user?.id, page, limit],
    queryFn: async () => {
      if (!user?.id) return { data: [], total: 0 };

      const safeLimit = Math.min(limit, 100);
      const from = (page - 1) * safeLimit;
      const to = from + safeLimit - 1;

      const { data: tradesData, error: tradesError, count } = await supabase
        .from("trades")
        .select(`
          id,
          user_id,
          symbol,
          direction,
          status,
          avg_price,
          net_quantity,
          total_fees,
          start_time,
          total_pnl,
          stop_loss,
          target,
          tags,
          instrument_type,
          strategies!strategy_id(name)
        `, { count: "exact" })
        .eq("user_id", user.id)
        .order("start_time", { ascending: false })
        .range(from, to);

      if (tradesError) {
        console.error("Supabase Error (trades):", tradesError.message);
        throw tradesError;
      }

      const trades = (tradesData || []) as TradeDBResponse[];

      if (trades.length === 0) {
        return { data: [], total: count || 0 };
      }

      // Fetch executions for these trades
      const tradeIds = trades.map((t) => t.id);
      const { data: execsData, error: execsError } = await supabase
        .from("executions")
        .select(`
          id,
          trade_id,
          execution_time,
          side,
          price,
          quantity,
          fees
        `)
        .in("trade_id", tradeIds)
        .order("execution_time", { ascending: true });

      if (execsError) {
        console.error("Supabase Error (executions):", execsError.message);
        throw execsError;
      }

      const execs = (execsData || []) as ExecutionDBResponse[];

      // Group executions by trade_id
      const execMap = new Map<string, ExecutionDBResponse[]>();
      for (const e of execs) {
        const arr = execMap.get(e.trade_id) || [];
        arr.push({
          id: String(e.id),
          trade_id: String(e.trade_id),
          execution_time: String(e.execution_time),
          side: String(e.side),
          price: Number(e.price),
          quantity: Number(e.quantity),
          fees: e.fees !== undefined && e.fees !== null ? Number(e.fees) : 0,
        });
        execMap.set(e.trade_id, arr);
      }

      // Map trades -> UI trades using their executions
      const uiTrades = trades.map((t) => mapDbToUi(t, execMap.get(t.id) || []));

      return {
        data: uiTrades,
        total: count || 0,
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });

  // --- Invalidation Helper ---
  const invalidateFinancials = () => {
    queryClient.invalidateQueries({ queryKey: ["trades"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    queryClient.invalidateQueries({ queryKey: ["calendar-stats"] });
    queryClient.invalidateQueries({ queryKey: ["reports"] });
    queryClient.invalidateQueries({ queryKey: ["strategies"] });
  };

  // --- Mutations ---
  const createMutation = useMutation({
    mutationFn: (data: CreateTradeInput) => tradesApi.create(data),
    onSuccess: () => {
      invalidateFinancials();
      toast.success("Trade logged");
    },
    onError: (err: any) => toast.error(err.message || "Failed to create trade"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTradeInput }) => tradesApi.update(id, data),
    onSuccess: () => {
      invalidateFinancials();
      toast.success("Trade updated");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update trade"),
  });

  const addExecutionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExecutionCreate }) => tradesApi.addExecution(id, data),
    onSuccess: () => {
      invalidateFinancials();
      toast.success("Execution added");
    },
    onError: (err: any) => toast.error(err.message || "Failed to add execution"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tradesApi.delete(id),
    onSuccess: () => {
      invalidateFinancials();
      toast.success("Trade deleted");
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete trade"),
  });

  return {
    trades: query.data?.data || [],
    totalTrades: query.data?.total || 0,
    totalPages: Math.ceil((query.data?.total || 0) / limit) || 1,
    isLoading: query.isLoading,
    isError: query.isError,

    createTrade: createMutation.mutateAsync,
    updateTrade: updateMutation.mutateAsync,
    addExecution: addExecutionMutation.mutateAsync,
    deleteTrade: deleteMutation.mutateAsync,

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isPlaceholderData: query.isPlaceholderData,
  };
}
