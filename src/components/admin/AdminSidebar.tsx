import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAdmin } from "./AdminLayout";
import {
  LayoutDashboard,
  Users,
  Activity,
  ScrollText,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Shield,
  Search,
  LogOut,
  Settings,
  HelpCircle,
  Crown
} from "lucide-react";
import tradeomenIcon from "@/assets/tradeomen-icon.png";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
    exact: true,
  },
  {
    title: "Users",
    icon: Users,
    href: "/admin/users",
    exact: false,
  },
  {
    title: "System Health",
    icon: Activity,
    href: "/admin/system",
    exact: false,
  },
  {
    title: "AI Costs",
    icon: Cpu,
    href: "/admin/ai-costs",
    exact: false,
  },
  {
    title: "Audit Logs",
    icon: ScrollText,
    href: "/admin/audit-logs",
    exact: false,
  },
];

export function AdminSidebar() {
  const adminContext = useAdmin();
  const collapsed = adminContext?.collapsed ?? false;
  const setCollapsed = adminContext?.setCollapsed ?? (() => {});
  
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
        await supabase.auth.signOut();
        toast({ title: "Logged out", description: "You have been signed out successfully." });
        navigate("/auth/login"); 
    } catch (error) {
        console.error("Logout failed", error);
    }
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-background/95 backdrop-blur-2xl border-r border-border/60 transition-all duration-300 ease-in-out flex flex-col will-change-width shadow-xl",
        collapsed ? "w-[80px]" : "w-72"
      )}
    >
      {/* ------------------------------------------------------------------ */}
      {/* 1. Header */}
      {/* ------------------------------------------------------------------ */}
      <div className="h-16 flex items-center px-6 border-b border-border/40 bg-background/50">
        <div className={cn("flex items-center gap-3 overflow-hidden transition-all", collapsed ? "w-8 justify-center" : "w-full")}>
          <img src={tradeomenIcon} alt="TradeOmen" className="h-8 w-8 flex-shrink-0 drop-shadow-md" />
          <div className={cn("flex flex-col opacity-100 transition-opacity duration-300", collapsed && "opacity-0 hidden")}>
            <span className="font-bold text-foreground tracking-tight leading-tight">TradeOmen</span>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Admin Panel</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2. Centered Toggle Button */}
      {/* ------------------------------------------------------------------ */}
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 rounded-full shadow-lg bg-background border-border hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 hover:scale-110"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-foreground" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-foreground" />
          )}
        </Button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3. Search Bar (Fade in/out) */}
      {/* ------------------------------------------------------------------ */}
      <div className={cn("px-4 py-6 transition-all duration-300", collapsed ? "opacity-0 pointer-events-none h-0 p-0 overflow-hidden" : "opacity-100 h-auto")}>
        <button className="w-full group flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground bg-secondary/40 hover:bg-secondary/70 border border-transparent hover:border-primary/20 rounded-lg transition-all shadow-sm">
          <Search className="h-4 w-4 group-hover:text-primary transition-colors" />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-70 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 4. Navigation Links */}
      {/* ------------------------------------------------------------------ */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto py-2 custom-scrollbar">
        {navItems.map((item) => {
          const isActive = item.exact 
            ? location.pathname === item.href 
            : location.pathname.startsWith(item.href);

          return (
            <NavLink
              key={item.href}
              to={item.href}
              title={collapsed ? item.title : undefined}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0 transition-colors duration-200", isActive ? "text-primary drop-shadow-sm" : "text-muted-foreground group-hover:text-foreground")} />
              
              <span className={cn("truncate transition-all duration-300", collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100")}>
                {item.title}
              </span>

              {/* Active Indicator Glow */}
              {isActive && !collapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ------------------------------------------------------------------ */}
      {/* 5. Footer: Account & Role */}
      {/* ------------------------------------------------------------------ */}
      <div className="p-4 mt-auto border-t border-border/40 bg-background/30">
        {!collapsed && (
          <div className="mb-4 px-1 space-y-1">
             <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground h-9 px-2 hover:bg-secondary/50">
               <Settings className="mr-3 h-4 w-4" /> Settings
             </Button>
             <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground h-9 px-2 hover:bg-secondary/50">
               <HelpCircle className="mr-3 h-4 w-4" /> Support
             </Button>
          </div>
        )}
        
        {/* User Card */}
        <div className={cn(
          "flex items-center gap-3 transition-all duration-300",
          collapsed ? "justify-center" : "bg-card/50 p-3 rounded-xl border border-border/50 shadow-sm hover:border-primary/20 hover:shadow-md cursor-default"
        )}>
          {/* Avatar / Icon */}
          <div className="relative group">
             <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
               <Shield className="h-5 w-5" />
             </div>
             <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-emerald-500 animate-pulse" />
          </div>
          
          {/* Account & Role Details */}
          <div className={cn("flex-1 min-w-0 flex flex-col transition-all duration-300", collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100")}>
            <p className="text-sm font-semibold text-foreground truncate">Admin Account</p>
            <div className="flex items-center gap-1.5 mt-0.5">
                <Crown className="h-3 w-3 text-amber-500 fill-amber-500/20" />
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide truncate">Super Admin</p>
            </div>
          </div>
          
          {/* Logout Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            className={cn("h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ml-auto", collapsed ? "hidden" : "")}
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}