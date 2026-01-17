import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { UsersTable } from "@/components/admin/UsersTable";
import { UserDetailPanel } from "@/components/admin/UserDetailPanel";

export default function AdminUsers() {
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage users, plans, and access</p>
        </div>
        <UsersTable />
        <UserDetailPanel isOpen={detailOpen} onClose={() => setDetailOpen(false)} />
      </div>
    </AdminLayout>
  );
}
