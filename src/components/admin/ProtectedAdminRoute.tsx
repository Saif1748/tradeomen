import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/use-Auth";

export const ProtectedAdminRoute = () => {
  // 1. Destructure all auth states including isSyncing
  const { session, profile, loading, isSyncing } = useAuth();

  // 2. Comprehensive Loading Check (The "Race Condition" Fix)
  // We stay in loading state if:
  // a) Supabase is still initializing (loading)
  // b) User is logged in but we are syncing with Python backend (isSyncing)
  // c) User is logged in but profile is not yet populated (!profile)
  const isInitializing = loading || (!!session && (isSyncing || !profile));

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        {/* Simple Loading Spinner */}
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 3. Security Check: Must be logged in
  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  // 4. Role Check: Must be 'admin' or 'super_admin'
  // We use string literals here to avoid 'Cannot find name UserRole' errors
  const allowedRoles = ["admin", "super_admin"];
  const userRole = profile?.role || "user";

  if (!allowedRoles.includes(userRole)) {
    // Redirect unauthorized users (e.g., standard users) to their dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // 5. Access Granted
  return <Outlet />;
};