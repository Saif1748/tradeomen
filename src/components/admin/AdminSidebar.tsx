import { NavLink, useLocation } from "react-router-dom";
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
  HelpCircle
} from "lucide-react";
import tradeomenIcon from "@/assets/tradeomen-icon.png";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    title: "Users",
    icon: Users,
    href: "/admin/users",
  },
  {
    title: "System Health",
    icon: Activity,
    href: "/admin/system",
  },
  {
    title: "AI Costs",
    icon: Cpu,
    href: "/admin/ai-costs",
  },
  {
    title: "Audit Logs",
    icon: ScrollText,
    href: "/admin/audit-logs",
  },
];

export function AdminSidebar() {
  // CONNECTED: Now using the context from AdminLayout
  const { collapsed, setCollapsed } = useAdmin();
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-background/80 backdrop-blur-xl border-r border-border transition-all duration-300 ease-in-out flex flex-col will-change-width",
        collapsed ? "w-[80px]" : "w-72"
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b border-border/50">
        <div className={cn("flex items-center gap-3 overflow-hidden transition-all", collapsed ? "w-8" : "w-full")}>
          <img src={tradeomenIcon} alt="TradeOmen" className="h-8 w-8 flex-shrink-0" />
          <div className={cn("flex flex-col opacity-100 transition-opacity duration-300", collapsed && "opacity-0 hidden")}>
            <span className="font-bold text-foreground tracking-tight">TradeOmen</span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Admin Panel</span>
          </div>
        </div>
      </div>

      {/* Collapse Toggle Button */}
      <div className="absolute -right-3 top-20 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-6 w-6 rounded-full shadow-md bg-background border-border hover:bg-muted transition-transform hover:scale-105"
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3 text-foreground" />
          ) : (
            <ChevronLeft className="h-3 w-3 text-foreground" />
          )}
        </Button>
      </div>

      {/* Search Bar (Hidden when collapsed) */}
      <div className={cn("px-4 py-6 transition-all duration-300", collapsed ? "opacity-0 pointer-events-none h-0 p-0" : "opacity-100")}>
        <button className="w-full group flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground bg-secondary/50 hover:bg-secondary/80 border border-transparent hover:border-border/50 rounded-md transition-all">
          <Search className="h-4 w-4 group-hover:text-foreground transition-colors" />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2 custom-scrollbar">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              title={collapsed ? item.title : undefined}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 relative overflow-hidden",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              
              <span className={cn("truncate transition-all duration-300", collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100")}>
                {item.title}
              </span>

              {/* Active Indicator Line */}
              {isActive && !collapsed && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-l-full" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-border/50">
        {!collapsed && (
          <div className="mb-2 px-1 space-y-1">
             <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground h-8">
               <Settings className="mr-2 h-4 w-4" /> Settings
             </Button>
             <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground h-8">
               <HelpCircle className="mr-2 h-4 w-4" /> Support
             </Button>
          </div>
        )}
        
        {/* User Profile Card */}
        <div className={cn(
          "flex items-center gap-3 transition-all duration-300",
          collapsed ? "justify-center" : "bg-secondary/30 p-3 rounded-lg border border-border/50"
        )}>
          <div className="relative group cursor-pointer">
             <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary/20 to-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
              <Shield className="h-4 w-4" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500 animate-pulse" />
          </div>
          
          <div className={cn("flex-1 min-w-0 transition-all duration-300", collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100")}>
            <p className="text-sm font-medium text-foreground truncate">Admin User</p>
            <p className="text-xs text-muted-foreground truncate">super_admin@tradeomen.com</p>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors", collapsed ? "hidden" : "")}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}