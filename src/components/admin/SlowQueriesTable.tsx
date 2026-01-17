import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SlowQuery {
  id: string;
  query: string;
  duration: number;
  table: string;
  timestamp: string;
}

const mockQueries: SlowQuery[] = [
  {
    id: "q1",
    query: "SELECT * FROM trades WHERE user_id = $1 ORDER BY created_at DESC",
    duration: 450,
    table: "trades",
    timestamp: "2 mins ago",
  },
  {
    id: "q2",
    query: "SELECT COUNT(*) FROM trades GROUP BY strategy_id",
    duration: 380,
    table: "trades",
    timestamp: "5 mins ago",
  },
  {
    id: "q3",
    query: "SELECT * FROM ai_conversations WHERE user_id = $1 LIMIT 100",
    duration: 320,
    table: "ai_conversations",
    timestamp: "8 mins ago",
  },
  {
    id: "q4",
    query: "UPDATE profiles SET last_login_at = NOW() WHERE user_id = $1",
    duration: 280,
    table: "profiles",
    timestamp: "12 mins ago",
  },
  {
    id: "q5",
    query: "SELECT * FROM broker_connections JOIN trades ON ...",
    duration: 520,
    table: "broker_connections",
    timestamp: "15 mins ago",
  },
];

export function SlowQueriesTable() {
  const getDurationBadge = (duration: number) => {
    if (duration >= 500) {
      return <Badge className="bg-destructive/10 text-destructive">{duration}ms</Badge>;
    } else if (duration >= 300) {
      return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400">{duration}ms</Badge>;
    }
    return <Badge className="bg-muted text-muted-foreground">{duration}ms</Badge>;
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <h3 className="text-sm font-medium text-foreground">Slow Queries (&gt;200ms)</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[50%]">Query</TableHead>
            <TableHead>Table</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockQueries.map((query) => (
            <TableRow key={query.id}>
              <TableCell>
                <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded font-mono block truncate max-w-[400px]">
                  {query.query}
                </code>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono text-xs">
                  {query.table}
                </Badge>
              </TableCell>
              <TableCell>{getDurationBadge(query.duration)}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{query.timestamp}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
