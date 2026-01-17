import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/StatCard";
import { LiveTicker } from "@/components/admin/LiveTicker";
import { TrafficChart } from "@/components/admin/TrafficChart";
import { PlanDistributionChart } from "@/components/admin/PlanDistributionChart";
import { Users, Activity, DollarSign, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">System overview and real-time metrics</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value="3,250"
            change={12.5}
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard
            title="Active Today"
            value="847"
            change={8.2}
            icon={<Activity className="h-5 w-5" />}
          />
          <StatCard
            title="MRR"
            value="$48,320"
            change={15.3}
            icon={<DollarSign className="h-5 w-5" />}
            variant="success"
          />
          <StatCard
            title="Error Rate"
            value="0.12%"
            change={-25}
            icon={<AlertTriangle className="h-5 w-5" />}
            variant="success"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TrafficChart />
          </div>
          <LiveTicker />
        </div>

        {/* Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PlanDistributionChart />
        </div>
      </div>
    </AdminLayout>
  );
}
