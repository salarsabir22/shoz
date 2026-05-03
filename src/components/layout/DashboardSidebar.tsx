"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Leaf,
  LayoutDashboard,
  BarChart3,
  Settings,
  LogOut,
  Heart,
  ClipboardList,
  PenLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type Variant = "business" | "customer";

const businessLinks = [
  { href: "/business/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/business/dashboard?tab=listings", label: "Listings", icon: ClipboardList },
  { href: "/business/dashboard?tab=create", label: "Create", icon: PenLine },
  { href: "/business/dashboard?tab=analytics", label: "Analytics", icon: BarChart3 },
  { href: "/business/dashboard?tab=settings", label: "Settings", icon: Settings },
];

const customerLinks = [
  { href: "/customer/dashboard", label: "Reservations", icon: LayoutDashboard },
  { href: "/customer/dashboard?tab=impact", label: "Impact", icon: Leaf },
  { href: "/customer/dashboard?tab=favorites", label: "Favorites", icon: Heart },
  { href: "/customer/dashboard?tab=settings", label: "Settings", icon: Settings },
];

function NavList({ variant }: { variant: Variant }) {
  const pathname = usePathname();
  const links = variant === "business" ? businessLinks : customerLinks;

  return (
    <nav className="flex flex-col gap-1 p-2">
      {links.map(({ href, label, icon: Icon }) => {
        const base = href.split("?")[0];
        const active = pathname === base;
        return (
          <Button key={href + label} variant={active ? "secondary" : "ghost"} className="justify-start gap-2" asChild>
            <Link href={href}>
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}

export function DashboardSidebar({ variant, businessName }: { variant: Variant; businessName?: string | null }) {
  const { logout, user } = useAuth();
  const title = variant === "business" ? businessName ?? "Your business" : "Your account";

  const inner = (
    <div className="flex h-full flex-col border-r bg-muted/30">
      <div className="flex items-center gap-2 border-b px-4 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Leaf className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold">SaveBite</p>
          <p className="truncate text-xs text-muted-foreground">{title}</p>
        </div>
      </div>
      <NavList variant={variant} />
      <div className="mt-auto border-t p-2">
        <Button variant="ghost" className="w-full justify-start gap-2 text-destructive" onClick={() => void logout()}>
          <LogOut className="h-4 w-4" aria-hidden />
          Log out
        </Button>
        {user ? <p className="truncate px-2 pb-2 text-xs text-muted-foreground">{user.email}</p> : null}
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-56 shrink-0 md:block">{inner}</aside>
      <div className="fixed left-4 top-16 z-30 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" aria-label="Open menu">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            {inner}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
