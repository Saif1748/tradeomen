import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  MoreHorizontal,
  Copy,
  Eye,
  Ban,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Shield,
  CreditCard,
  CheckCircle2,
  Activity,
  User as UserIcon,
  Crown,
  Zap,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlanTier } from "@/services/api/types";

// Design System
const planStyles: Record<string, { color: string; icon: any }> = {
  free: { 
    color: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700",
    icon: UserIcon 
  },
  pro: { 
    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
    icon: Zap
  },
  premium: { 
    color: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800 shadow-sm",
    icon: Crown
  },
};

const getStatusBadge = (lastActive: string | undefined) => {
    if (!lastActive) return { label: "Offline", color: "text-slate-400 bg-slate-50 border-slate-200" };
    const date = new Date(lastActive);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 3600);
    if (diffHours < 24) return { label: "Online", color: "text-emerald-700 bg-emerald-50 border-emerald-200 ring-1 ring-emerald-100" };
    if (diffHours < 168) return { label: "Active", color: "text-blue-700 bg-blue-50 border-blue-200" };
    return { label: "Offline", color: "text-slate-400 bg-slate-50 border-slate-200" };
};

export function UsersTable() {
  const { 
    users, // ✅ Now directly returned (paginated slice)
    meta,  // ✅ Now directly returned (total count & pages)
    isLoading, 
    page, 
    setPage, 
    limit, 
    search, 
    setSearch,
    planFilter,
    setPlanFilter,
    banUser,
    updatePlan
  } = useAdminUsers();

  const handleFilterChange = (value: string | null) => {
    setPlanFilter(value);
    setPage(1); 
  };

  const copyToClipboard = (text: string) => {
    if (text) navigator.clipboard.writeText(text);
  };

  const handlePlanChange = (userId: string, newPlan: PlanTier, currentPlan: string) => {
    if (newPlan === currentPlan) return;
    if (window.confirm(`Are you sure you want to change this user's plan from ${currentPlan} to ${newPlan}?`)) {
        updatePlan({ userId, planTier: newPlan });
    }
  };

  const handleBanToggle = (userId: string, currentPreferences: any) => {
    const isCurrentlyBanned = currentPreferences?.account_status === "banned";
    const action = isCurrentlyBanned ? "reactivate" : "suspend";
    if (window.confirm(`Are you sure you want to ${action} this user?`)) {
        banUser({ userId, isBanned: !isCurrentlyBanned });
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-card border border-border/40 p-2 rounded-xl shadow-sm">
        <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
                placeholder="Search by name, email or ID..."
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                }}
                className="pl-9 h-9 border-transparent focus:border-border/60 bg-muted/30 focus:bg-background transition-all rounded-lg text-sm"
            />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto px-1">
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className={cn(
                        "h-8 gap-2 border-dashed border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all",
                        planFilter && "bg-primary/5 border-primary/20 text-primary border-solid shadow-sm"
                    )}
                >
                <Filter className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">
                    {planFilter ? planFilter.charAt(0).toUpperCase() + planFilter.slice(1) : "Filter"}
                </span>
                {planFilter && (
                    <div 
                        role="button"
                        className="ml-1 hover:bg-destructive/10 hover:text-destructive rounded-full p-0.5 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleFilterChange(null);
                        }}
                    >
                        <XCircle className="h-3 w-3 fill-current" />
                    </div>
                )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal uppercase tracking-wider">Filter by Plan</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleFilterChange(null)}>All Plans</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("free")}>Free</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("pro")}>Pro</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("premium")}>Premium</DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>

      {/* Table Card */}
      <div className="border border-border/40 rounded-xl overflow-hidden bg-card/50 shadow-sm backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-b border-border/40">
              <TableHead className="w-[320px] pl-6 py-3 uppercase text-[10px] font-semibold tracking-widest text-muted-foreground/70">User Identity</TableHead>
              <TableHead className="w-[140px] uppercase text-[10px] font-semibold tracking-widest text-muted-foreground/70">Current Plan</TableHead>
              <TableHead className="w-[120px] uppercase text-[10px] font-semibold tracking-widest text-muted-foreground/70">Role</TableHead>
              <TableHead className="text-right w-[120px] uppercase text-[10px] font-semibold tracking-widest text-muted-foreground/70">Imports</TableHead>
              <TableHead className="text-right w-[140px] uppercase text-[10px] font-semibold tracking-widest text-muted-foreground/70">AI Tokens</TableHead>
              <TableHead className="w-[160px] text-right pr-6 uppercase text-[10px] font-semibold tracking-widest text-muted-foreground/70">Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                <TableRow>
                    <TableCell colSpan={7} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground animate-pulse">
                            <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
                            <span className="text-sm font-medium">Fetching user data...</span>
                        </div>
                    </TableCell>
                </TableRow>
            ) : users.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={7} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground/50">
                            <div className="p-3 bg-muted/50 rounded-full mb-2">
                                <UserIcon className="w-6 h-6 opacity-50" />
                            </div>
                            <span className="text-sm font-medium text-foreground">No users found</span>
                            {planFilter && (
                                <Button variant="link" size="sm" onClick={() => handleFilterChange(null)} className="mt-1 text-primary h-auto p-0">
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </TableCell>
                </TableRow>
            ) : (
                users.map((user) => {
                    const planKey = (user.plan_tier || "free").toLowerCase();
                    const status = getStatusBadge(user.last_active_at);
                    const isAdmin = user.role === "admin" || user.role === "super_admin";
                    const isBanned = user.preferences?.account_status === "banned";
                    const PlanIcon = planStyles[planKey]?.icon || UserIcon;

                    return (
                      <TableRow 
                        key={user.id} 
                        className={cn(
                            "group hover:bg-muted/40 transition-all duration-200 border-b border-border/30 hover:border-border/60",
                            isBanned && "bg-destructive/5 hover:bg-destructive/10"
                        )}
                      >
                        {/* User Identity Column */}
                        <TableCell className="pl-6 py-3.5">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-9 w-9 border border-border/40 shadow-sm">
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                                    {user.full_name?.substring(0,2).toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={cn("font-medium text-sm text-foreground truncate max-w-[180px]", isBanned && "line-through text-muted-foreground")}>
                                        {user.full_name || "Unnamed User"}
                                    </span>
                                    {isBanned && (
                                        <Badge variant="destructive" className="h-4 px-1.5 text-[9px] uppercase font-bold tracking-wide">Banned</Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 group-hover:text-muted-foreground transition-colors">
                                    <span className="truncate max-w-[180px]" title={user.email}>
                                        {user.email || "No Email"}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            copyToClipboard(user.email || "");
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-all hover:text-foreground p-0.5 rounded-sm hover:bg-muted"
                                        title="Copy Email"
                                    >
                                        <Copy className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Plan Badge */}
                        <TableCell>
                          <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[11px] font-medium transition-colors select-none", planStyles[planKey]?.color || planStyles.free.color)}>
                            <PlanIcon className="h-3 w-3 opacity-70" />
                            {user.plan_tier || "FREE"}
                          </div>
                        </TableCell>

                        {/* Role Badge */}
                        <TableCell>
                            {isAdmin ? (
                                <div className="flex items-center gap-1.5 text-[11px] font-medium text-primary bg-primary/10 w-fit px-2 py-0.5 rounded-md border border-primary/10">
                                    <Shield className="h-3 w-3" />
                                    <span className="capitalize">{user.role?.replace('_', ' ')}</span>
                                </div>
                            ) : (
                                <span className="text-[11px] text-muted-foreground capitalize pl-1">User</span>
                            )}
                        </TableCell>

                        {/* Stats */}
                        <TableCell className="text-right">
                            <span className="text-sm font-mono text-foreground/80 tabular-nums">
                                {user.monthly_import_count?.toLocaleString() || "0"}
                            </span>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-mono text-foreground/80 tabular-nums">
                                    {user.monthly_ai_tokens_used ? (user.monthly_ai_tokens_used / 1000).toFixed(1) + 'k' : '0'}
                                </span>
                            </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="text-right pr-6">
                            <div className="flex flex-col items-end gap-1">
                                <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-medium w-fit uppercase tracking-wider", status.color)}>
                                    <span className="relative flex h-1.5 w-1.5">
                                      <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current", status.label === "Online" ? "block" : "hidden")}></span>
                                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current"></span>
                                    </span>
                                    {status.label}
                                </div>
                            </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-all data-[state=open]:opacity-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                                    User ID: <span className="font-mono text-foreground ml-1">{user.id?.slice(0,8)}...</span>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                              
                              <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-muted">
                                <Eye className="h-4 w-4 text-muted-foreground" /> View Profile
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-muted">
                                <Activity className="h-4 w-4 text-muted-foreground" /> View Logs
                              </DropdownMenuItem>

                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="gap-2 cursor-pointer focus:bg-muted">
                                    <CreditCard className="h-4 w-4 text-muted-foreground" /> Manage Sub
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    <DropdownMenuRadioGroup 
                                        value={user.plan_tier} 
                                        onValueChange={(val) => handlePlanChange(user.id, val as PlanTier, user.plan_tier)}
                                    >
                                        <DropdownMenuRadioItem value="FREE">FREE</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="PRO">PRO</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="PREMIUM">PREMIUM</DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>

                              <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-muted" onClick={() => copyToClipboard(user.id || "")}>
                                <Copy className="h-4 w-4 text-muted-foreground" /> Copy ID
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem 
                                className={cn(
                                    "gap-2 cursor-pointer",
                                    isBanned ? "text-emerald-600 focus:text-emerald-700" : "text-destructive focus:text-destructive"
                                )} 
                                onClick={() => handleBanToggle(user.id, user.preferences)}
                              >
                                {isBanned ? (<><CheckCircle2 className="h-4 w-4" /> Reactivate User</>) : (<><Ban className="h-4 w-4" /> Suspend User</>)}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-2">
        <div className="text-xs text-muted-foreground font-medium">
            Showing <span className="text-foreground">{meta.total > 0 ? (page - 1) * limit + 1 : 0}</span> - <span className="text-foreground">{Math.min(page * limit, meta.total)}</span> of <span className="text-foreground">{meta.total}</span> users
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
            className="h-7 w-7 p-0 border-border/60 hover:bg-background shadow-sm rounded-lg"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
          <div className="flex items-center gap-1 px-2">
             <span className="text-xs font-medium text-foreground">Page {page}</span>
             <span className="text-xs text-muted-foreground">/ {Math.max(1, meta.pages)}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
            disabled={page >= meta.pages || isLoading}
            className="h-7 w-7 p-0 border-border/60 hover:bg-background shadow-sm rounded-lg"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}