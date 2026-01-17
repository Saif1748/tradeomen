import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
}

export function StatCard({
  title,
  value,
  change,
  changeLabel = "vs last week",
  icon,
  variant = "default",
}: StatCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  // Modern background styles with subtle left borders for emphasis
  const variantStyles = {
    default: "border-l-4 border-l-primary/60",
    success: "border-l-4 border-l-emerald-500/80",
    warning: "border-l-4 border-l-amber-500/80",
    danger: "border-l-4 border-l-destructive/80",
  };

  const iconStyles = {
    default: "bg-primary/10 text-primary",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    danger: "bg-destructive/10 text-destructive",
  };

  return (
    <Card className={cn("overflow-hidden hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-sm", variantStyles[variant])}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">
              {value}
            </h3>
          </div>
          {icon && (
            <div className={cn("p-2.5 rounded-xl shrink-0", iconStyles[variant])}>
              {icon}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          {change !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                isPositive && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                isNegative && "bg-destructive/10 text-destructive",
                !isPositive && !isNegative && "bg-secondary text-muted-foreground"
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : isNegative ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
          <span className="text-xs text-muted-foreground line-clamp-1">
            {changeLabel}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}