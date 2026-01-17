import { AdminLayout } from "@/components/admin/AdminLayout";
import { AuditLogTable } from "@/components/admin/AuditLogTable";

export default function AdminAuditLogs() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Audit Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">Track all admin actions and system events</p>
        </div>
        <AuditLogTable />
      </div>
    </AdminLayout>
  );
}
