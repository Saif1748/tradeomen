import { supabase } from "@/integrations/supabase/client";
import { UserProfile, PlanTier } from "../types";
import { request } from "../core";

// Simplified response structure for client-side mode
export interface AdminUsersResponse {
  data: Partial<UserProfile>[];
  count: number;
}

export const adminUsersService = {
  /**
   * GET /admin/users (Client-Side Mode)
   * Fetches the latest 1000 users so the frontend can filter/sort instantly.
   * We skip server-side pagination to enable instant UI updates.
   */
  getAllUsers: async (): Promise<AdminUsersResponse> => {
    // 1. Fetch a large batch of users (e.g., 1000)
    // If you grow >1000 users, switch back to Server-Side Pagination
    const { data, error, count } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(1000); 

    if (error) throw new Error(error.message);

    return {
      data: (data as unknown as Partial<UserProfile>[]) || [],
      count: count || 0,
    };
  },

  /**
   * POST /admin/users/:id/ban
   * Toggles the ban status.
   */
  banUser: async (userId: string, isBanned: boolean, reason?: string) => {
    return request(`/admin/users/${userId}/ban`, {
      method: "POST",
      body: JSON.stringify({ is_banned: isBanned, reason }),
    });
  },

  /**
   * PUT /admin/users/:id/plan
   * Updates the user's subscription tier.
   */
  updateUserPlan: async (userId: string, planTier: PlanTier) => {
    return request(`/admin/users/${userId}/plan`, {
      method: "PUT",
      body: JSON.stringify({ plan_tier: planTier }),
    });
  }
};