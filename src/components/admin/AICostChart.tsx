import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { date: "Jan 1", tokens: 1200000, cost: 24 },
  { date: "Jan 2", tokens: 980000, cost: 19.6 },
  { date: "Jan 3", tokens: 1450000, cost: 29 },
  { date: "Jan 4", tokens: 1100000, cost: 22 },
  { date: "Jan 5", tokens: 1680000, cost: 33.6 },
  { date: "Jan 6", tokens: 1890000, cost: 37.8 },
  { date: "Jan 7", tokens: 2100000, cost: 42 },
  { date: "Jan 8", tokens: 1950000, cost: 39 },
  { date: "Jan 9", tokens: 2300000, cost: 46 },
  { date: "Jan 10", tokens: 2450000, cost: 49 },
  { date: "Jan 11", tokens: 2200000, cost: 44 },
  { date: "Jan 12", tokens: 2600000, cost: 52 },
  { date: "Jan 13", tokens: 2800000, cost: 56 },
  { date: "Jan 14", tokens: 2500000, cost: 50 },
];

export function AICostChart() {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Token Burn Rate</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Daily AI token consumption and cost</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-primary/60" />
            <span className="text-muted-foreground">Tokens (M)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
            <span className="text-muted-foreground">Cost ($)</span>
          </div>
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number, name: string) => {
                if (name === "tokens") return [`${(value / 1000000).toFixed(2)}M`, "Tokens"];
                return [`$${value.toFixed(2)}`, "Cost"];
              }}
            />
            <Area
              type="monotone"
              dataKey="tokens"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#tokenGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
