import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
  Bar,
} from "recharts";

const data = [
  { time: "00:00", requests: 1200, latency: 45 },
  { time: "02:00", requests: 800, latency: 38 },
  { time: "04:00", requests: 450, latency: 32 },
  { time: "06:00", requests: 620, latency: 35 },
  { time: "08:00", requests: 1800, latency: 52 },
  { time: "10:00", requests: 2400, latency: 68 },
  { time: "12:00", requests: 2800, latency: 75 },
  { time: "14:00", requests: 3200, latency: 82 },
  { time: "16:00", requests: 2900, latency: 78 },
  { time: "18:00", requests: 2200, latency: 65 },
  { time: "20:00", requests: 1800, latency: 55 },
  { time: "22:00", requests: 1400, latency: 48 },
];

export function TrafficChart() {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Traffic & Latency</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Requests per minute vs avg response time</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-primary/60" />
            <span className="text-muted-foreground">Requests</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
            <span className="text-muted-foreground">Latency (ms)</span>
          </div>
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="time"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar
              yAxisId="left"
              dataKey="requests"
              fill="hsl(var(--primary) / 0.6)"
              radius={[4, 4, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="latency"
              stroke="hsl(45 93% 47%)"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
