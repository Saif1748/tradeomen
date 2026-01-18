import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// --- Types (Co-located for simplicity, or move to @/services/api/types) ---
export interface AdminStats {
  total_users: number;
  active_24h: number;
  revenue: number;
  error_rate: number;
}

export interface TrafficData {
  date_label: string;
  active_users: number;
  api_requests: number;
}

export interface PlanData {
  plan_name: string;
  count: number;
}

export function useAdminDashboard() {
  // 1. Fetch KPI Stats
  const statsQuery = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_admin_stats");
      
      if (error) {
        console.error("Error fetching admin stats:", error);
        // Graceful fallback for dev environments
        if (error.code === 'PGRST202') return null;
        throw error;
      }
      return data as unknown as AdminStats;
    },
    // Industry Grade Caching: Keep fresh for 5 mins
    staleTime: 1000 * 60 * 5, 
    placeholderData: (previousData) => previousData,
  });

  // 2. Fetch Traffic Chart (7 Days)
  const trafficQuery = useQuery({
    queryKey: ["admin", "traffic"],
    queryFn: async () => {
      // Using default param days=7
      const { data, error } = await supabase.rpc("get_admin_traffic_data", { days: 7 });
      
      if (error) {
        console.error("Error fetching traffic:", error);
        return [];
      }
      return data as unknown as TrafficData[];
    },
    staleTime: 1000 * 60 * 15, // Charts cache longer (15 mins)
  });

  // 3. Fetch Plan Distribution
  const planQuery = useQuery({
    queryKey: ["admin", "plans"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_plan_distribution");
      
      if (error) {
        console.error("Error fetching plans:", error);
        return [];
      }
      return data as unknown as PlanData[];
    },
    staleTime: 1000 * 60 * 60, // Very stable data (1 hour)
  });

  return {
    stats: statsQuery.data,
    traffic: trafficQuery.data,
    plans: planQuery.data,
    isLoading: statsQuery.isLoading || trafficQuery.isLoading,
    isError: statsQuery.isError,
    refetch: () => {
      statsQuery.refetch();
      trafficQuery.refetch();
      planQuery.refetch();
    }
  };
}