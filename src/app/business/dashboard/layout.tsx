"use client";

import * as React from "react";
import { Suspense } from "react";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { Navbar } from "@/components/layout/Navbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export default function BusinessDashboardLayout({ children }: { children: React.ReactNode }) {
  const [businessName, setBusinessName] = React.useState<string | null>(null);

  React.useEffect(() => {
    void fetch("/api/businesses/me", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d: { business?: { name?: string } | null }) => setBusinessName(d.business?.name ?? null))
      .catch(() => setBusinessName(null));
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 pt-14 md:pt-0">
        <DashboardSidebar variant="business" businessName={businessName} />
        <div className="flex min-h-0 flex-1 flex-col px-4 pb-24 pt-4 md:px-8 md:pb-8 md:pt-8">
          <Suspense fallback={null}>{children}</Suspense>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
}
