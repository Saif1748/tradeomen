import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  House,
  ChartLine,
  Crosshair,
  CalendarBlank,
  ChartBar,
  Globe,
  Robot,
  CaretLeft,
  Lightning,
  Gear,
  Crown,
  Coffee,
} from "@phosphor-icons/react";
import logo from "@/assets/tradeomen-logo.png";
import icon from "@/assets/tradeomen-icon.png";
import SettingsModal from "@/components/settings/SettingsModal";
import { useAuth } from "@/hooks/use-Auth";
import { useProfile } from "@/hooks/use-profile"; // ✅ Import the new cached hook

const navItems = [
  { title: "Dashboard", path: "/dashboard", icon: House },
  { title: "Trades", path: "/trades", icon: ChartLine },
  { title: "Strategies", path: "/strategies", icon: Crosshair },
  { title: "Calendar", path: "/calendar", icon: CalendarBlank },
  { title: "Reports", path: "/reports", icon: ChartBar },
  { title: "Markets", path: "/markets", icon: Globe },
  { title: "AI Chat", path: "/ai-chat", icon: Robot },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const AppSidebar = ({ collapsed, onToggle }: AppSidebarProps) => {
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // ✅ 1. Get static auth state (User ID, Email) from Supabase wrapper
  const { user } = useAuth();
  
  // ✅ 2. Get dynamic profile data (Plan, Credits) from TanStack Query
  // This reads from the cache, so it doesn't reload on page navigation.
  const { data: profile, isLoading } = useProfile();
  
  // Normalize plan to Uppercase to handle database inconsistencies
  const plan = (profile?.plan_tier || "FREE").toUpperCase();

  // Helper to get display name safely
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Trader";

  // ✅ Filter navigation items: Hide specific items in production
  const visibleNavItems = navItems.filter((item) => {
    // Always show these core features
    if (["Dashboard", "Trades", "Strategies", "Calendar"].includes(item.title)) {
      return true;
    }
    // Only show Reports, Markets, and AI Chat in Development (Localhost)
    return import.meta.env.DEV;
  });

  const getInitials = () => {
    const nameToUse = profile?.full_name || user?.user_metadata?.full_name;
    if (nameToUse) {
      const names = nameToUse.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return names[0].substring(0, 2).toUpperCase();
    }
    return (user?.email?.substring(0, 2) || "TR").toUpperCase();
  };

  // --- Dynamic Badge Styling ---
  const getPlanBadgeStyles = () => {
    switch (plan) {
      case "PREMIUM":
        return {
          container: "bg-amber-500/10 border-amber-500/20 text-amber-500",
          label: "Premium Plan",
          Icon: Crown,
        };
      case "PRO":
        return {
          container: "bg-primary/20 border-primary/30 text-primary",
          label: "Pro Plan",
          Icon: Lightning,
        };
      case "FREE":
      default:
        return {
          container: "bg-secondary border-border text-muted-foreground",
          label: "Free Plan",
          Icon: Coffee,
        };
    }
  };

  const badgeStyle = getPlanBadgeStyles();
  const BadgeIcon = badgeStyle.Icon;

  // Determine if we should show skeleton state
  // Show skeleton only if loading AND we have no cached profile yet
  const showSkeleton = isLoading && !profile;

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="hidden md:flex fixed left-0 top-0 h-screen z-50 flex-col bg-card/60 backdrop-blur-xl border-r border-glass-border"
      >
        {/* Collapse Toggle Button */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-primary/20 transition-colors z-10"
        >
          <motion.div
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <CaretLeft weight="bold" className="w-3 h-3 text-foreground" />
          </motion.div>
        </button>

        {/* Logo Section */}
        <div className="flex items-center justify-center py-8 px-4 relative h-24">
          <AnimatePresence mode="wait">
            {collapsed ? (
              <motion.img
                key="icon"
                src={icon}
                alt="TradeOmen"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="h-10 w-auto"
              />
            ) : (
              <motion.img
                key="logo"
                src={logo}
                alt="TradeOmen"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="h-8 w-auto"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Top Plan Badge (Dynamic with Skeleton) */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex justify-center px-4 mb-6"
            >
              {showSkeleton ? (
                 <div className="h-6 w-28 bg-secondary/50 rounded-full animate-pulse" />
              ) : (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-normal ${badgeStyle.container}`}>
                  <BadgeIcon weight="fill" className="w-3 h-3" />
                  {badgeStyle.label}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation - Using visibleNavItems */}
        <nav className="flex-1 px-3 space-y-1">
          {visibleNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <Icon
                  weight={isActive ? "fill" : "regular"}
                  className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    isActive ? "text-primary" : "group-hover:text-foreground"
                  }`}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-light whitespace-nowrap overflow-hidden"
                    >
                      {item.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            );
          })}
        </nav>

        {/* User Section - Clickable for Settings */}
        <div className="p-4 mt-auto">
          <button
            onClick={() => setSettingsOpen(true)}
            className={`group w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/30 transition-all duration-300 hover:bg-secondary/50 cursor-pointer relative overflow-hidden ${
              collapsed ? "justify-center" : ""
            }`}
            style={{
              boxShadow: "0 0 0 0 rgba(139, 92, 246, 0)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 0 20px 2px rgba(139, 92, 246, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 0 0 0 rgba(139, 92, 246, 0)";
            }}
          >
            {/* Glow overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-glow-primary to-glow-secondary flex items-center justify-center text-primary-foreground text-sm font-normal flex-shrink-0 relative z-10">
              {getInitials()}
            </div>

            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0 overflow-hidden text-left relative z-10"
                >
                  <p className="text-sm font-normal text-foreground truncate">
                    {displayName}
                  </p>
                  
                  {/* Bottom Mini Badge with Skeleton */}
                  {showSkeleton ? (
                    <div className="h-3 w-16 bg-secondary/50 rounded animate-pulse mt-1" />
                  ) : (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-normal mt-0.5 border ${badgeStyle.container}`}>
                      {plan === "FREE" ? "Free" : plan === "PRO" ? "Pro" : "Premium"}
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Settings Icon hint */}
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute right-3 z-10"
                >
                  <Gear weight="regular" className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
};

export default AppSidebar;