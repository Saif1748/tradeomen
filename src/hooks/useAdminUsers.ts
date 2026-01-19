import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminUsersService, AdminUsersResponse } from "../services/api/modules/admin";
import { useToast } from "./use-toast";
import { PlanTier } from "../services/api/types";

export const useAdminUsers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Controls
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50); // Default 50 per page
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<string | null>(null);

  // 1. Fetch ALL Data Once (Cached for 5 minutes)
  const query = useQuery({
    queryKey: ["admin-users-all"], 
    queryFn: () => adminUsersService.getAllUsers(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: (previousData) => previousData,
  });

  const allUsers = query.data?.data || [];

  // 2. ⚡ Client-Side Filtering Logic
  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      // Plan Filter
      if (planFilter && user.plan_tier?.toUpperCase() !== planFilter.toUpperCase()) {
        return false;
      }
      
      // Search Filter
      if (search) {
        const q = search.toLowerCase();
        const matches = 
          user.full_name?.toLowerCase().includes(q) || 
          user.email?.toLowerCase().includes(q) || 
          user.id?.toLowerCase().includes(q);
        
        if (!matches) return false;
      }
      return true;
    });
  }, [allUsers, planFilter, search]);

  // 3. ⚡ Client-Side Pagination Logic
  const paginatedUsers = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filteredUsers.slice(startIndex, startIndex + limit);
  }, [filteredUsers, page, limit]);

  // ---------------------------------------------------------
  // 4. Mutations with Instant UI Updates (Optimistic Updates)
  // ---------------------------------------------------------

  // BAN MUTATION
  const banMutation = useMutation({
    mutationFn: ({ userId, isBanned, reason }: { userId: string; isBanned: boolean; reason?: string }) =>
      adminUsersService.banUser(userId, isBanned, reason),
    
    onSuccess: (_, variables) => {
      // ✅ 1. Instant Manual Cache Update
      queryClient.setQueryData<AdminUsersResponse>(["admin-users-all"], (oldData) => {
        if (!oldData || !oldData.data) return oldData;

        return {
          ...oldData,
          data: oldData.data.map((user) => {
            if (user.id === variables.userId) {
              return {
                ...user,
                preferences: {
                  ...(user.preferences || {}),
                  account_status: variables.isBanned ? "banned" : "active",
                },
              };
            }
            return user;
          }),
        };
      });

      // ✅ 2. Trigger Background Refresh (Sync with DB)
      queryClient.invalidateQueries({ queryKey: ["admin-users-all"] });

      toast({ 
        title: variables.isBanned ? "User Suspended" : "User Reactivated", 
        description: `User has been successfully ${variables.isBanned ? "banned" : "unbanned"}.` 
      });
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  });

  // PLAN UPDATE MUTATION
  const planMutation = useMutation({
    mutationFn: ({ userId, planTier }: { userId: string; planTier: PlanTier }) =>
      adminUsersService.updateUserPlan(userId, planTier),
    
    onSuccess: (_, variables) => {
      // ✅ 1. Instant Manual Cache Update
      queryClient.setQueryData<AdminUsersResponse>(["admin-users-all"], (oldData) => {
        if (!oldData || !oldData.data) return oldData;

        return {
          ...oldData,
          data: oldData.data.map((user) => {
            if (user.id === variables.userId) {
              // Optimistically update the plan_tier field
              return { ...user, plan_tier: variables.planTier };
            }
            return user;
          }),
        };
      });

      // ✅ 2. Trigger Background Refresh
      queryClient.invalidateQueries({ queryKey: ["admin-users-all"] });

      toast({ 
        title: "Plan Updated", 
        description: `User plan changed to ${variables.planTier}.` 
      });
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  });

  return {
    // Return Processed Data
    users: paginatedUsers,
    meta: {
      total: filteredUsers.length,
      pages: Math.ceil(filteredUsers.length / limit) || 1
    },
    
    // Status
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    
    // Controls
    page, setPage,
    limit, setLimit,
    search, setSearch,
    planFilter, setPlanFilter,

    // Actions
    banUser: banMutation.mutate,
    isBanning: banMutation.isPending,
    
    updatePlan: planMutation.mutate,
    isUpdatingPlan: planMutation.isPending,
  };
};