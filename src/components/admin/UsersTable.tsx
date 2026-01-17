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
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  MoreHorizontal,
  Copy,
  Eye,
  UserCog,
  Ban,
  Trash2,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  email: string;
  name: string;
  plan: "free" | "pro" | "enterprise";
  status: "active" | "inactive" | "banned";
  lastLogin: string;
  trades: number;
  aiTokens: number;
}

const mockUsers: User[] = [
  { id: "usr_1a2b3c4d", email: "john.doe@email.com", name: "John Doe", plan: "pro", status: "active", lastLogin: "2 hours ago", trades: 1250, aiTokens: 45000 },
  { id: "usr_2b3c4d5e", email: "sarah.trader@trade.io", name: "Sarah Smith", plan: "enterprise", status: "active", lastLogin: "5 mins ago", trades: 8420, aiTokens: 180000 },
  { id: "usr_3c4d5e6f", email: "mike.stocks@gmail.com", name: "Mike Johnson", plan: "free", status: "active", lastLogin: "1 day ago", trades: 45, aiTokens: 2500 },
  { id: "usr_4d5e6f7g", email: "alex.options@yahoo.com", name: "Alex Williams", plan: "pro", status: "inactive", lastLogin: "15 days ago", trades: 320, aiTokens: 12000 },
  { id: "usr_5e6f7g8h", email: "emma.forex@outlook.com", name: "Emma Brown", plan: "free", status: "active", lastLogin: "3 hours ago", trades: 89, aiTokens: 5000 },
  { id: "usr_6f7g8h9i", email: "david.crypto@proton.me", name: "David Chen", plan: "pro", status: "active", lastLogin: "30 mins ago", trades: 2100, aiTokens: 78000 },
  { id: "usr_7g8h9i0j", email: "spam.user@temp.com", name: "Spam Account", plan: "free", status: "banned", lastLogin: "30 days ago", trades: 0, aiTokens: 100 },
];

const planColors = {
  free: "bg-secondary text-secondary-foreground",
  pro: "bg-primary/10 text-primary",
  enterprise: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

const statusColors = {
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  inactive: "bg-muted text-muted-foreground",
  banned: "bg-destructive/10 text-destructive",
};

export function UsersTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlan, setFilterPlan] = useState<string | null>(null);

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = !filterPlan || user.plan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email, name, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              {filterPlan ? filterPlan.charAt(0).toUpperCase() + filterPlan.slice(1) : "All Plans"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilterPlan(null)}>All Plans</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setFilterPlan("free")}>Free</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterPlan("pro")}>Pro</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterPlan("enterprise")}>Enterprise</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[140px]">ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Trades</TableHead>
              <TableHead className="text-right">AI Tokens</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="group">
                <TableCell className="font-mono text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">{user.id}</span>
                    <button
                      onClick={() => copyToClipboard(user.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-muted rounded"
                    >
                      <Copy className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">{user.name}</p>
                    <div className="flex items-center gap-1">
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <button
                        onClick={() => copyToClipboard(user.email)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-muted rounded"
                      >
                        <Copy className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={cn("font-medium", planColors[user.plan])}>
                    {user.plan.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={cn("font-medium capitalize", statusColors[user.status])}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {user.trades.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {user.aiTokens.toLocaleString()}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {user.lastLogin}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2">
                        <Eye className="h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <LogIn className="h-4 w-4" /> Login As User
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <UserCog className="h-4 w-4" /> Edit User
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="gap-2 text-amber-600">
                        <Ban className="h-4 w-4" /> Ban User
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-destructive">
                        <Trash2 className="h-4 w-4" /> Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>Showing {filteredUsers.length} of {mockUsers.length} users</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm" disabled>Next</Button>
        </div>
      </div>
    </div>
  );
}
