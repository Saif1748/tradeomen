import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface TopUser {
  rank: number;
  email: string;
  plan: string;
  tokensUsed: number;
  cost: number;
  percentOfTotal: number;
}

const mockTopUsers: TopUser[] = [
  { rank: 1, email: "heavy.user@trade.io", plan: "enterprise", tokensUsed: 180000, cost: 36, percentOfTotal: 12.5 },
  { rank: 2, email: "algo.trader@stocks.net", plan: "pro", tokensUsed: 145000, cost: 29, percentOfTotal: 10.1 },
  { rank: 3, email: "analysis.king@gmail.com", plan: "enterprise", tokensUsed: 128000, cost: 25.6, percentOfTotal: 8.9 },
  { rank: 4, email: "daily.ai@outlook.com", plan: "pro", tokensUsed: 98000, cost: 19.6, percentOfTotal: 6.8 },
  { rank: 5, email: "power.user@yahoo.com", plan: "pro", tokensUsed: 87000, cost: 17.4, percentOfTotal: 6.0 },
  { rank: 6, email: "active.joe@proton.me", plan: "pro", tokensUsed: 76000, cost: 15.2, percentOfTotal: 5.3 },
  { rank: 7, email: "trader.mike@email.com", plan: "free", tokensUsed: 65000, cost: 13, percentOfTotal: 4.5 },
  { rank: 8, email: "newbie.nick@gmail.com", plan: "free", tokensUsed: 54000, cost: 10.8, percentOfTotal: 3.8 },
];

const planColors = {
  free: "bg-secondary text-secondary-foreground",
  pro: "bg-primary/10 text-primary",
  enterprise: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export function TopUsersTable() {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <h3 className="text-sm font-medium text-foreground">Top AI Cost Users</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Users consuming the most AI resources</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead className="text-right">Tokens</TableHead>
            <TableHead className="text-right">Cost</TableHead>
            <TableHead className="w-[150px]">% of Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockTopUsers.map((user) => (
            <TableRow key={user.rank}>
              <TableCell className="font-medium text-muted-foreground">{user.rank}</TableCell>
              <TableCell className="font-medium">{user.email}</TableCell>
              <TableCell>
                <Badge
                  className={planColors[user.plan as keyof typeof planColors] || "bg-muted"}
                >
                  {user.plan.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                {user.tokensUsed.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400">
                ${user.cost.toFixed(2)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress value={user.percentOfTotal * 8} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground w-10">{user.percentOfTotal}%</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
