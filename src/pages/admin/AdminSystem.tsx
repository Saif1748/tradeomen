import { AdminLayout } from "@/components/admin/AdminLayout";
import { SystemHealthCard } from "@/components/admin/SystemHealthCard";
import { SlowQueriesTable } from "@/components/admin/SlowQueriesTable";
import { ErrorFeed } from "@/components/admin/ErrorFeed";

export default function AdminSystem() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">System Health</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor infrastructure and performance</p>
        </div>

        {/* Health Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SystemHealthCard title="API Uptime" status="healthy" metric="99.98%" description="Last 30 days" lastChecked="1 min ago" />
          <SystemHealthCard title="Database" status="healthy" metric="45ms" description="Avg query time" lastChecked="30 sec ago" />
          <SystemHealthCard title="AI Service" status="warning" metric="89%" description="Success rate" lastChecked="2 min ago" />
          <SystemHealthCard title="Broker Sync" status="critical" metric="12" description="Failed accounts" lastChecked="5 min ago" />
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SlowQueriesTable />
          <ErrorFeed />
        </div>
      </div>
    </AdminLayout>
  );
}
