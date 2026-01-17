import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const data = [
  { name: "Free", value: 2450, color: "hsl(var(--muted-foreground))" },
  { name: "Pro", value: 680, color: "hsl(var(--primary))" },
  { name: "Enterprise", value: 120, color: "hsl(45 93% 47%)" },
];

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function PlanDistributionChart() {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-foreground">User Distribution</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Breakdown by plan tier</p>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number, name: string) => [`${value.toLocaleString()} users`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4">
        {data.map((item) => (
          <div key={item.name} className="text-center">
            <div
              className="h-2 rounded-full mb-1"
              style={{ backgroundColor: item.color }}
            />
            <p className="text-xs text-muted-foreground">{item.name}</p>
            <p className="text-sm font-semibold">{item.value.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
