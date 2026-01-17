import { Bell, Moon, Sun, RefreshCw, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export function AdminHeader() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-16 border-b border-border/40 bg-background/60 backdrop-blur-md sticky top-0 z-30 transition-all duration-300">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left Side: Breadcrumbs or Page Title */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <span className="hover:text-foreground transition-colors cursor-pointer">Admin</span>
            <span className="text-border">/</span>
            <span className="text-foreground font-medium">Dashboard</span>
          </div>

          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            System Operational
          </span>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Trigger (visible only on small screens) */}
          <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground">
            <Command className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full border-2 border-background" />
          </Button>

          <div className="h-4 w-px bg-border/50 mx-1" />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}