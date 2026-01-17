import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/StatCard";
import { LiveTicker } from "@/components/admin/LiveTicker";
import { TrafficChart } from "@/components/admin/TrafficChart";
import { PlanDistributionChart } from "@/components/admin/PlanDistributionChart";
import { Users, Activity, DollarSign, AlertTriangle, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminDashboard() {
  const currentDate = new Date().toLocaleDateString("en-US", { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in pb-10">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <p>{currentDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-background/50">
              <Download className="mr-2 h-4 w-4" /> Export Data
            </Button>
            <Button className="shadow-lg shadow-primary/20">
              <Activity className="mr-2 h-4 w-4" /> System Health
            </Button>
          </div>
        </div>

        {/* KPI Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value="3,250"
            change={12.5}
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard
            title="Active Sessions"
            value="847"
            change={8.2}
            icon={<Activity className="h-5 w-5" />}
            variant="success"
          />
          <StatCard
            title="Monthly Revenue"
            value="$48,320"
            change={15.3}
            icon={<DollarSign className="h-5 w-5" />}
            variant="warning" // Warning color used for financial data often looks gold/amber
          />
          <StatCard
            title="System Errors"
            value="0.12%"
            change={-25} // Negative change is good for errors
            changeLabel="decreased vs last week"
            icon={<AlertTriangle className="h-5 w-5" />}
            variant="danger"
          />
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
          {/* Traffic Chart - Takes up 2/3 width */}
          <Card className="xl:col-span-2 bg-card/50 backdrop-blur-sm border-border/60 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Traffic Overview</CardTitle>
              <CardDescription>Daily active users and api requests over time</CardDescription>
            </CardHeader>
            <CardContent className="pl-0">
              <TrafficChart />
            </CardContent>
          </Card>

          {/* Live Ticker - Takes up 1/3 width */}
          <Card className="flex flex-col bg-card/50 backdrop-blur-sm border-border/60 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live Activity
              </CardTitle>
              <CardDescription>Real-time system events</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px]">
              <LiveTicker />
            </CardContent>
          </Card>
        </div>

        {/* Secondary Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/60 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Plan Distribution</CardTitle>
              <CardDescription>User subscription breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <PlanDistributionChart />
            </CardContent>
          </Card>
          
          {/* Placeholder for future widgets to keep layout balanced */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-primary/5 to-secondary/50 border-border/60 border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-[300px] text-muted-foreground gap-4">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Activity className="h-6 w-6 opacity-50" />
              </div>
              <p>Additional metrics configuration available in settings</p>
              <Button variant="outline" size="sm">Configure Widgets</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}