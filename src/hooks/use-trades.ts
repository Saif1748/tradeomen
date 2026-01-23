// src/hooks/use-trades.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client"; 
import { tradesApi } from "@/services/api/modules/trades"; 
import { useAuth } from "@/hooks/use-Auth";
import { toast } from "sonner";
import { CreateTradeInput, UpdateTradeInput, ExecutionCreate } from "@/services/api/types";

// ✅ UPDATED: Shape of data coming from new Supabase schema
interface TradeDBResponse {
  id: string;
  user_id: string;
  symbol: string;
  
  // New Time Field
  start_time: string;       // WAS: entry_time
  
  instrument_type: string;
  direction: string;
  status: string;
  
  // New Financial Fields (Aggregates)
  net_quantity: number;     // WAS: quantity
  avg_price: number;        // WAS: entry_price
  total_pnl: number;        // WAS: pnl
  total_fees: number;       // WAS: fees
  
  // Metadata
  stop_loss?: number;
  target?: number;
  tags: string[];
  strategies?: { name: string } | null;
}

export interface UITrade {
  id: string;
  user_id: string;
  symbol: string;
  date: Date;            
  type: string;            
  side: string;            
  status: string;
  
  quantity: number;
  entryPrice: number;    
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

  // --- Helpers ---
  const mapDbToUi = (t: TradeDBResponse): UITrade => {
    let calculatedR = 0;
    const pnl = Number(t.total_pnl) || 0;
    
    // ✅ UPDATED: Risk calc uses avg_price & net_quantity
    // Note: For closed trades (net_quantity=0), risk calc might be 0.
    // Ideally, we should store 'initial_risk' in DB, but this approximates open trades.
    const risk = (t.avg_price && t.stop_loss && t.net_quantity) 
      ? Math.abs((t.avg_price - t.stop_loss) * t.net_quantity) 
      : 0;

    if (risk > 0) {
      calculatedR = pnl / risk;
    }

    return {
      id: t.id,
      user_id: t.user_id,
      symbol: t.symbol,
      date: new Date(t.start_time), // Map start_time -> date
      type: t.instrument_type,
      side: t.direction,
      status: t.status,
      
      quantity: Number(t.net_quantity) || 0,
      entryPrice: Number(t.avg_price) || 0,
      pnl: pnl,
      fees: Number(t.total_fees) || 0,
      
      stopLoss: t.stop_loss ? Number(t.stop_loss) : undefined,
      target: t.target ? Number(t.target) : undefined,
      tags: t.tags || [],
      strategy: t.strategies?.name || "No Strategy",
      rMultiple: calculatedR,
    };
  };

  // --- Read (Supabase Direct) ---
  const query = useQuery({
    queryKey: ["trades", user?.id, page, limit],
    queryFn: async () => {
      if (!user?.id) return { data: [], total: 0 };

      const safeLimit = Math.min(limit, 100);
      const from = (page - 1) * safeLimit;
      const to = from + safeLimit - 1;

      // ✅ UPDATED: Select query matches new DB columns
      const { data, error, count } = await supabase
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
        .order("start_time", { ascending: false }) // Order by start_time
        .range(from, to);

      if (error) {
        console.error("Supabase Error:", error.message);
        throw error;
      }

      // Cast data to our known DB Interface to satisfy TS
      const typedData = data as unknown as TradeDBResponse[];

      return {
        data: typedData.map(mapDbToUi),
        total: count || 0,
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60, 
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });

  // --- Cascading Invalidation Helper ---
  const invalidateFinancials = () => {
    queryClient.invalidateQueries({ queryKey: ["trades"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    queryClient.invalidateQueries({ queryKey: ["calendar-stats"] });
    queryClient.invalidateQueries({ queryKey: ["reports"] });
    queryClient.invalidateQueries({ queryKey: ["strategies"] });
  };

  // --- Mutations (FastAPI Backend) ---
   
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
  
  // ✅ NEW: Add Execution Mutation
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
    
    // Actions
    createTrade: createMutation.mutateAsync,
    updateTrade: updateMutation.mutateAsync,
    addExecution: addExecutionMutation.mutateAsync, // Exposed new action
    deleteTrade: deleteMutation.mutateAsync,
    
    // States
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isPlaceholderData: query.isPlaceholderData,
  };
}