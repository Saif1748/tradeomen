import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
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
  Command,
} from "lucide-react";
import tradeomenIcon from "@/assets/tradeomen-icon.png";

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
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <div className="flex items-center gap-3">
          <img src={tradeomenIcon} alt="TradeOmen" className="h-8 w-8" />
          {!collapsed && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">TradeOmen</span>
              <span className="text-xs px-1.5 py-0.5 bg-destructive/10 text-destructive rounded font-medium">
                ADMIN
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-muted transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Search Bar */}
      {!collapsed && (
        <div className="px-3 py-3">
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground bg-muted/50 hover:bg-muted rounded-lg transition-colors">
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">Search...</span>
            <div className="flex items-center gap-0.5 text-xs">
              <Command className="h-3 w-3" />
              <span>K</span>
            </div>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <div
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50",
            collapsed && "justify-center"
          )}
        >
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Admin User</p>
              <p className="text-xs text-muted-foreground truncate">Super Admin</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
