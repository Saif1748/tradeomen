import { useProfile } from "@/hooks/use-profile";

/**
 * Hook to enforce backend plan definitions and permission flags.
 * Updated to use 'useProfile' (TanStack Query) for reactive updates
 * matching the AppSidebar.
 */
export const useFeatureAccess = () => {
  // ✅ Switch from useAuth() to useProfile() to leverage caching & auto-refetching
  const { data: profile, isLoading } = useProfile();

  // Default "Locked" state if loading or no profile
  if (isLoading || !profile) {
    return {
      canExport: false,
      canSyncBrokers: false,
      canWebSearch: false,
      canAddScreenshots: false,
      canChat: false,
      remainingChats: 0,
      isPro: false,
      isPremium: false,
      planName: "Free",
      isLoading: true, // Exposed so components can show a skeleton
    };
  }

  // Limits Configuration (Mirrors backend/core/config.py)
  const limits = {
    FREE: { chat: 5, strategy: 1, trades: 30 },
    PRO: { chat: 50, strategy: 5, trades: 1000000 },
    PREMIUM: { chat: 200, strategy: 10, trades: 10000000 },
  };

  // 1. Normalize Plan Name (Handle DB inconsistencies like 'Founder' or lowercase)
  const rawPlan = profile.plan_tier || "FREE";
  
  // Map 'FOUNDER' or others to 'PREMIUM' if necessary, otherwise trust the raw string
  let normalizedPlan: keyof typeof limits = "FREE";
  if (rawPlan === "PREMIUM" || rawPlan === "FOUNDER") normalizedPlan = "PREMIUM";
  else if (rawPlan === "PRO") normalizedPlan = "PRO";

  const tierLimits = limits[normalizedPlan];

  // 2. Calculate Real-Time Usage
  const remainingChats = Math.max(0, tierLimits.chat - (profile.daily_chat_count || 0));
  const canChat = remainingChats > 0;

  return {
    // Feature Flags
    canExport: profile.allow_export_csv ?? false,
    canSyncBrokers: profile.allow_broker_sync ?? false,
    canWebSearch: profile.allow_web_search ?? false,
    
    // Limits & Usage
    canChat,
    remainingChats,
    chatLimit: tierLimits.chat,
    
    // UI Helpers
    planName: normalizedPlan.charAt(0) + normalizedPlan.slice(1).toLowerCase(),
    isPro: normalizedPlan !== "FREE",
    isPremium: normalizedPlan === "PREMIUM",
    isLoading: false,
  };
};