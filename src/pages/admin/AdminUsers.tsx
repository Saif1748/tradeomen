import { AdminLayout } from "@/components/admin/AdminLayout";
import { UsersTable } from "@/components/admin/UsersTable";
import { Button } from "@/components/ui/button";
import { Download, Plus, Users } from "lucide-react";

// Standard Page Layout
const AdminUsers = () => {
  return (
    <AdminLayout>
      <div className="space-y-8 max-w-[1600px] mx-auto">
        
        {/* ---------------------------------------------------------------------- */}
        {/* Header Section */}
        {/* ---------------------------------------------------------------------- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/40">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="w-5 h-5 text-primary" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    Users Management
                </h1>
            </div>
            <p className="text-sm font-normal text-muted-foreground/80 max-w-2xl pl-1">
              View and manage all registered users, monitor subscription plans, and handle security actions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="h-9 shadow-sm border-border/60 hover:bg-secondary/50 font-medium text-muted-foreground hover:text-foreground">
              <Download className="w-4 h-4 mr-2 text-muted-foreground" />
              Export CSV
            </Button>
            <Button size="sm" className="h-9 shadow-sm font-medium bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Invite User
            </Button>
          </div>
        </div>

        {/* ---------------------------------------------------------------------- */}
        {/* Users Table */}
        {/* ---------------------------------------------------------------------- */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <UsersTable />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;