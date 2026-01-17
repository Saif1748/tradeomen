import { ReactNode, createContext, useContext, useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
}

// 1. Create a Context to manage the sidebar state globally
interface AdminContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const AdminContext = createContext<AdminContextType>({
  collapsed: false,
  setCollapsed: () => {},
});

export const useAdmin = () => useContext(AdminContext);

export function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AdminContext.Provider value={{ collapsed, setCollapsed }}>
      <div className="min-h-screen bg-muted/20 font-sans text-foreground selection:bg-primary/20 selection:text-primary">
        {/* Sidebar passed via context if you update AdminSidebar to consume it, 
            otherwise it sits fixed here */}
        <AdminSidebar />
        
        {/* Main Content Area */}
        {/* We use 'pl' (padding-left) instead of 'ml' to allow the background to stretch if needed, 
            and transition the width based on the collapsed state */}
        <div 
          className={cn(
            "flex flex-col min-h-screen transition-all duration-300 ease-in-out",
            collapsed ? "lg:pl-[80px]" : "lg:pl-72" 
          )}
        >
          <AdminHeader />
          
          <main className="flex-1 p-4 md:p-8 pt-6 max-w-[1600px] mx-auto w-full animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}