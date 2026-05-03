"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const dash = user.role === "business" ? "/business/dashboard" : "/customer/dashboard";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        <Link
          href="/"
          className={cn(
            "flex flex-1 flex-col items-center gap-0.5 py-2 text-xs text-muted-foreground",
            pathname === "/" && "text-primary"
          )}
        >
          <Home className="h-5 w-5" aria-hidden />
          Home
        </Link>
        <Link
          href="/explore"
          className={cn(
            "flex flex-1 flex-col items-center gap-0.5 py-2 text-xs text-muted-foreground",
            pathname.startsWith("/explore") && "text-primary"
          )}
        >
          <Compass className="h-5 w-5" aria-hidden />
          Explore
        </Link>
        <Link
          href={dash}
          className={cn(
            "flex flex-1 flex-col items-center gap-0.5 py-2 text-xs text-muted-foreground",
            pathname.startsWith("/customer/dashboard") || pathname.startsWith("/business/dashboard")
              ? "text-primary"
              : ""
          )}
        >
          <LayoutDashboard className="h-5 w-5" aria-hidden />
          Dashboard
        </Link>
      </div>
    </nav>
  );
}
