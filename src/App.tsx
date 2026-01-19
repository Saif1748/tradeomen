import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

// Contexts & Hooks
import { SettingsProvider } from "@/contexts/SettingsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/use-Auth";
import { ModalProvider } from "@/contexts/ModalContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProtectedAdminRoute } from "@/components/admin/ProtectedAdminRoute";

// Analytics
import { PostHogProvider } from "@/providers/PostHogProvider";
import PageViewTracker from "@/components/PageViewTracker";

// Preload critical assets
import "@/assets/tradeomen-logo.png";
import "@/assets/tradeomen-icon.png";

// Lazy Load Pages
const Index = lazy(() => import("./pages/Index"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Documentation = lazy(() => import("./pages/Documentation"));
const DocArticle = lazy(() => import("./pages/DocArticle"));

// App Pages
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Trades = lazy(() => import("./pages/Trades"));
const Strategies = lazy(() => import("./pages/Strategies"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Reports = lazy(() => import("./pages/Reports"));
const Markets = lazy(() => import("./pages/Markets"));
const AIChat = lazy(() => import("./pages/AIChat"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin Pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminSystem = lazy(() => import("./pages/admin/AdminSystem"));
const AdminAuditLogs = lazy(() => import("./pages/admin/AdminAuditLogs"));
const AdminAICosts = lazy(() => import("./pages/admin/AdminAICosts"));

const queryClient = new QueryClient();

// ✅ Flag to control feature availability
const SHOW_DEV_FEATURES = import.meta.env.DEV;

/**
 * PageLoader
 * Global fallback for Suspense and Auth state transitions.
 */
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

/**
 * AuthRedirect
 * Refined to prevent infinite loading.
 * Redirects authenticated users to dashboard immediately.
 */
const AuthRedirect = () => {
  const { session, loading } = useAuth();
  
  if (loading) {
    return <PageLoader />;
  }
  
  return session ? <Navigate to="/dashboard" replace /> : <Auth />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <PostHogProvider>
        <AuthProvider>
          <SettingsProvider>
            <CurrencyProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <PageViewTracker />
                  
                  {/* ModalProvider wraps the Suspense and Routes.
                      This allows the UpgradeModal to be triggered globally. */}
                  <ModalProvider>
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Index />} />
                        <Route path="/pricing" element={<PricingPage />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/privacy" element={<Privacy />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/docs" element={<Documentation />} />
                        <Route path="/docs/:slug" element={<DocArticle />} />

                        {/* Auth Route */}
                        <Route path="/auth" element={<AuthRedirect />} />

                        {/* Protected Admin Routes */}
                        <Route element={<ProtectedAdminRoute />}>
                          <Route path="/admin" element={<AdminDashboard />} />
                          <Route path="/admin/users" element={<AdminUsers />} />
                          <Route path="/admin/system" element={<AdminSystem />} />
                          <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
                          <Route path="/admin/ai-costs" element={<AdminAICosts />} />
                        </Route>

                        {/* Protected App Routes */}
                        <Route element={<ProtectedRoute />}>
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/trades" element={<Trades />} />
                          <Route path="/strategies" element={<Strategies />} />
                          <Route path="/calendar" element={<Calendar />} />
                          
                          {/* ✅ DEV ONLY ROUTES - Hidden in Production */}
                          {SHOW_DEV_FEATURES && (
                            <>
                              <Route path="/reports" element={<Reports />} />
                              <Route path="/markets" element={<Markets />} />
                              <Route path="/ai-chat" element={<AIChat />} />
                            </>
                          )}
                        </Route>

                        {/* Catch-all */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </ModalProvider>
                  
                </BrowserRouter>
              </TooltipProvider>
            </CurrencyProvider>
          </SettingsProvider>
        </AuthProvider>
      </PostHogProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;