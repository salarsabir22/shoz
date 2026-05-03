"use client";

import { Suspense } from "react";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { Navbar } from "@/components/layout/Navbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { useAuth } from "@/hooks/useAuth";

export default function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 pt-14 md:pt-0">
        <DashboardSidebar variant="customer" businessName={user?.name ?? null} />
        <div className="flex min-h-0 flex-1 flex-col px-4 pb-24 pt-4 md:px-8 md:pb-8 md:pt-8">
          <Suspense fallback={null}>{children}</Suspense>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
}
