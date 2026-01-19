import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/use-Auth";
import { AlertCircle, Loader2 } from "lucide-react";

// ✅ FIX: Export as a named constant for "import { ProtectedAdminRoute } from ..."
export const ProtectedAdminRoute = () => {
  const { session, profile, loading, isSyncing } = useAuth();

  // 1. Loading State
  // We stay in loading state if:
  // a) Supabase is still initializing (loading)
  // b) User is logged in but we are syncing with Python backend (isSyncing)
  // c) User is logged in but profile is not yet populated (!profile)
  const isInitializing = loading || (!!session && (isSyncing || !profile));

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground text-sm">Verifying Access Permissions...</p>
      </div>
    );
  }

  // 2. Not Logged In
  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  // 3. Role Check
  const allowedRoles = ["admin", "super_admin"];
  // If role is missing, default to 'user' to trigger the debug screen
  const userRole = profile?.role || "user";

  if (!allowedRoles.includes(userRole)) {
    // ---------------------------------------------------------
    // 🛑 DEBUG SCREEN (Temporary)
    // Instead of redirecting, we show WHY it failed.
    // ---------------------------------------------------------
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle className="w-8 h-8" />
            <h1 className="text-xl font-bold">Access Denied (Debug Mode)</h1>
          </div>
          
          <div className="space-y-4 text-sm">
            <div className="p-3 bg-gray-100 rounded">
              <p className="font-semibold text-gray-700">User ID:</p>
              <p className="font-mono text-xs text-gray-500 break-all">{session.user.id}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-red-50 border border-red-100 rounded">
                <p className="font-semibold text-red-800">Your Current Role</p>
                <p className="text-xl font-bold text-red-600 uppercase mt-1">
                  {userRole}
                </p>
              </div>

              <div className="p-3 bg-green-50 border border-green-100 rounded">
                <p className="font-semibold text-green-800">Required Role</p>
                <p className="text-xs font-medium text-green-700 mt-2">
                  ADMIN or SUPER_ADMIN
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <p className="font-semibold mb-2">Troubleshooting Steps:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>If "Your Current Role" is <strong>USER</strong>, but you changed it in the DB:
                    <ul className="list-disc pl-5 mt-1 text-xs">
                        <li><strong>Restart your Python Backend</strong> (It caches roles for 3 mins).</li>
                        <li>Or wait 3 minutes and refresh.</li>
                    </ul>
                </li>
                <li>If "Your Current Role" is blank, the backend sync failed.</li>
              </ul>
            </div>
            
             <button 
              onClick={() => window.location.href = '/dashboard'}
              className="w-full mt-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

// ✅ FIX: Also keep default export for "import ProtectedAdminRoute from ..."
export default ProtectedAdminRoute;