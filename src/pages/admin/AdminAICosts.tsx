import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/StatCard";
import { AICostChart } from "@/components/admin/AICostChart";
import { TopUsersTable } from "@/components/admin/TopUsersTable";
import { Cpu, TrendingUp, DollarSign, Zap } from "lucide-react";

export default function AdminAICosts() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">AI Costs</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor AI usage and spending</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Today's Tokens" value="2.8M" change={12} icon={<Cpu className="h-5 w-5" />} />
          <StatCard title="Today's Cost" value="$56" change={8} icon={<DollarSign className="h-5 w-5" />} />
          <StatCard title="MTD Spend" value="$1,245" change={-5} icon={<TrendingUp className="h-5 w-5" />} variant="success" />
          <StatCard title="Avg per User" value="$0.38" change={-12} icon={<Zap className="h-5 w-5" />} variant="success" />
        </div>

        <AICostChart />
        <TopUsersTable />
      </div>
    </AdminLayout>
  );
}
