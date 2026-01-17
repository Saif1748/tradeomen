import { X, Copy, Mail, Calendar, CreditCard, TrendingUp, Cpu, Shield, AlertTriangle, LogIn, Key, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface UserDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailPanel({ isOpen, onClose }: UserDetailPanelProps) {
  if (!isOpen) return null;

  const user = {
    id: "usr_2b3c4d5e",
    email: "sarah.trader@trade.io",
    name: "Sarah Smith",
    plan: "pro",
    status: "active",
    lastLogin: "5 mins ago",
    createdAt: "Jan 15, 2024",
    trades: 8420,
    aiTokensUsed: 145000,
    aiTokensLimit: 200000,
    tradesLimit: 10000,
    brokers: [
      { name: "Zerodha", status: "connected" },
      { name: "Dhan", status: "error" },
    ],
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      {/* Panel */}
      <div className="relative w-full max-w-lg bg-card border-l border-border shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{user.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <button onClick={() => copyToClipboard(user.email)} className="p-0.5 hover:bg-muted rounded">
                  <Copy className="h-3 w-3 text-muted-foreground" />
                </button>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">User ID</p>
              <div className="flex items-center gap-1">
                <code className="text-sm font-mono">{user.id}</code>
                <button onClick={() => copyToClipboard(user.id)} className="p-0.5 hover:bg-muted rounded">
                  <Copy className="h-3 w-3 text-muted-foreground" />
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Active</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Created
              </p>
              <p className="text-sm font-medium">{user.createdAt}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" /> Last Login
              </p>
              <p className="text-sm font-medium">{user.lastLogin}</p>
            </div>
          </div>

          <Separator />

          {/* Plan Control */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">Plan Control</h3>
            </div>
            <Select defaultValue={user.plan}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro ($49/mo)</SelectItem>
                <SelectItem value="enterprise">Enterprise ($149/mo)</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="w-full">
              Save Plan Change
            </Button>
          </div>

          <Separator />

          {/* Usage Quotas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">Usage Quotas</h3>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Trades Uploaded</span>
                  <span className="font-medium">{user.trades.toLocaleString()} / {user.tradesLimit.toLocaleString()}</span>
                </div>
                <Progress value={(user.trades / user.tradesLimit) * 100} className="h-2" />
              </div>
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">AI Tokens Used</span>
                  <span className="font-medium">{user.aiTokensUsed.toLocaleString()} / {user.aiTokensLimit.toLocaleString()}</span>
                </div>
                <Progress value={(user.aiTokensUsed / user.aiTokensLimit) * 100} className="h-2" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Broker Connections */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">Broker Connections</h3>
            </div>
            <div className="space-y-2">
              {user.brokers.map((broker) => (
                <div
                  key={broker.name}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <span className="text-sm font-medium">{broker.name}</span>
                  <Badge
                    className={cn(
                      broker.status === "connected"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-destructive/10 text-destructive"
                    )}
                  >
                    {broker.status === "connected" ? "Connected" : "Error"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Admin Actions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">Admin Actions</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                Login As
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Key className="h-4 w-4" />
                Reset Password
              </Button>
            </div>
          </div>

          <Separator />

          {/* Danger Zone */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <h3 className="text-sm font-medium">Danger Zone</h3>
            </div>
            <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5 space-y-3">
              <p className="text-sm text-muted-foreground">
                These actions are irreversible. Please proceed with caution.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-amber-600 border-amber-600/30 hover:bg-amber-500/10">
                  Ban User
                </Button>
                <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-1">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Data
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
