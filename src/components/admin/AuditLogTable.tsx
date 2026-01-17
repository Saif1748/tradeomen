import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download, UserCog, CreditCard, Shield, Trash2, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuditLog {
  id: string;
  timestamp: string;
  admin: string;
  action: string;
  target: string;
  targetType: "user" | "system" | "billing";
  details: string;
  ip: string;
}

const mockLogs: AuditLog[] = [
  {
    id: "log1",
    timestamp: "2024-01-17 10:30:22",
    admin: "admin@tradeomen.com",
    action: "PLAN_CHANGE",
    target: "john.doe@email.com",
    targetType: "billing",
    details: "Changed plan from FREE to PRO",
    ip: "192.168.1.1",
  },
  {
    id: "log2",
    timestamp: "2024-01-17 10:15:45",
    admin: "admin@tradeomen.com",
    action: "LOGIN_AS",
    target: "sarah.trader@trade.io",
    targetType: "user",
    details: "Impersonated user for debugging",
    ip: "192.168.1.1",
  },
  {
    id: "log3",
    timestamp: "2024-01-17 09:45:12",
    admin: "mod@tradeomen.com",
    action: "BAN_USER",
    target: "spam@temp.com",
    targetType: "user",
    details: "Banned for suspicious activity",
    ip: "192.168.1.5",
  },
  {
    id: "log4",
    timestamp: "2024-01-17 09:30:00",
    admin: "admin@tradeomen.com",
    action: "RESET_PASSWORD",
    target: "mike.stocks@gmail.com",
    targetType: "user",
    details: "Password reset requested via support ticket #1234",
    ip: "192.168.1.1",
  },
  {
    id: "log5",
    timestamp: "2024-01-17 09:00:00",
    admin: "admin@tradeomen.com",
    action: "DELETE_DATA",
    target: "old-user@email.com",
    targetType: "user",
    details: "GDPR data deletion request fulfilled",
    ip: "192.168.1.1",
  },
  {
    id: "log6",
    timestamp: "2024-01-16 18:20:30",
    admin: "admin@tradeomen.com",
    action: "SYSTEM_CONFIG",
    target: "rate_limits",
    targetType: "system",
    details: "Updated AI rate limits from 100 to 150 req/min",
    ip: "192.168.1.1",
  },
];

const actionIcons: Record<string, typeof UserCog> = {
  PLAN_CHANGE: CreditCard,
  LOGIN_AS: LogIn,
  BAN_USER: Shield,
  RESET_PASSWORD: Shield,
  DELETE_DATA: Trash2,
  SYSTEM_CONFIG: UserCog,
};

const actionColors: Record<string, string> = {
  PLAN_CHANGE: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  LOGIN_AS: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  BAN_USER: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  RESET_PASSWORD: "bg-muted text-muted-foreground",
  DELETE_DATA: "bg-destructive/10 text-destructive",
  SYSTEM_CONFIG: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

export function AuditLogTable() {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search logs..." className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[160px]">Timestamp</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead className="w-[40%]">Details</TableHead>
              <TableHead>IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockLogs.map((log) => {
              const Icon = actionIcons[log.action] || UserCog;
              return (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {log.timestamp}
                  </TableCell>
                  <TableCell className="text-sm">{log.admin}</TableCell>
                  <TableCell>
                    <Badge className={cn("gap-1", actionColors[log.action])}>
                      <Icon className="h-3 w-3" />
                      {log.action.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-sm">{log.target}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{log.details}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{log.ip}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>Showing 6 of 248 logs</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
