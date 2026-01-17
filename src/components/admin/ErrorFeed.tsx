import { AlertCircle, ChevronRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ErrorLog {
  id: string;
  type: string;
  message: string;
  endpoint: string;
  count: number;
  lastOccurred: string;
}

const mockErrors: ErrorLog[] = [
  {
    id: "e1",
    type: "500",
    message: "Database connection timeout",
    endpoint: "/api/trades/sync",
    count: 12,
    lastOccurred: "5 mins ago",
  },
  {
    id: "e2",
    type: "429",
    message: "Rate limit exceeded",
    endpoint: "/api/ai/chat",
    count: 45,
    lastOccurred: "2 mins ago",
  },
  {
    id: "e3",
    type: "401",
    message: "Invalid authentication token",
    endpoint: "/api/broker/dhan/sync",
    count: 8,
    lastOccurred: "15 mins ago",
  },
  {
    id: "e4",
    type: "500",
    message: "OpenAI API error: context_length_exceeded",
    endpoint: "/api/ai/analyze",
    count: 3,
    lastOccurred: "1 hour ago",
  },
];

export function ErrorFeed() {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <h3 className="text-sm font-medium text-foreground">Recent Errors</h3>
        </div>
        <Badge variant="secondary" className="bg-destructive/10 text-destructive">
          {mockErrors.reduce((acc, e) => acc + e.count, 0)} total
        </Badge>
      </div>
      <div className="divide-y divide-border">
        {mockErrors.map((error) => (
          <div
            key={error.id}
            className="px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      error.type === "500"
                        ? "bg-destructive/10 text-destructive"
                        : error.type === "429"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {error.type}
                  </Badge>
                  <span className="text-sm font-medium text-foreground">{error.message}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <code className="bg-muted px-1.5 py-0.5 rounded">{error.endpoint}</code>
                  <span>×{error.count} occurrences</span>
                  <span>{error.lastOccurred}</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-2 border-t border-border bg-muted/30">
        <Button variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground">
          View All Logs <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
