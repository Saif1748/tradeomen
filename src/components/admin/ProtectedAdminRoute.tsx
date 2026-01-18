import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/use-Auth";

export const ProtectedAdminRoute = () => {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 1. Must be logged in
  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  // 2. Must be an Admin
  // Ensure your backend sends 'role' in the profile, or check specific email
  const isAdmin = profile?.role === 'admin' || profile?.role === 'service_role'; 
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};