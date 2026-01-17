import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, XCircle, Clock } from "lucide-react";

interface SystemHealthCardProps {
  title: string;
  status: "healthy" | "warning" | "critical";
  metric: string;
  description: string;
  lastChecked: string;
}

const statusConfig = {
  healthy: {
    icon: CheckCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    label: "Healthy",
  },
  warning: {
    icon: AlertCircle,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    label: "Warning",
  },
  critical: {
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    label: "Critical",
  },
};

export function SystemHealthCard({
  title,
  status,
  metric,
  description,
  lastChecked,
}: SystemHealthCardProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn("p-4 rounded-xl border bg-card", config.border)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-2xl font-semibold text-foreground">{metric}</p>
        </div>
        <div className={cn("p-2 rounded-lg", config.bg)}>
          <Icon className={cn("h-5 w-5", config.color)} />
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-2">{description}</p>
      <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>Checked {lastChecked}</span>
      </div>
    </div>
  );
}
