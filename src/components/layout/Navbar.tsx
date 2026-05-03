"use client";

import Link from "next/link";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="h-4 w-4" aria-hidden />
          </span>
          SaveBite
        </Link>
        <nav className="ml-auto flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/explore">Explore</Link>
              </Button>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href={user.role === "business" ? "/business/dashboard" : "/customer/dashboard"}>
                  Dashboard
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full" aria-label="Account menu">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url ?? undefined} alt="" />
                      <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm font-medium">{user.name}</div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/explore">Explore</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={user.role === "business" ? "/business/dashboard" : "/customer/dashboard"}>
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => void logout()}>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : loading ? null : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Sign up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
