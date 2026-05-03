"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Leaf, Minus, Plus } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { CountdownTimer } from "@/components/custom/CountdownTimer";
import { DiscountBadge } from "@/components/custom/DiscountBadge";
import { ReservationCode } from "@/components/custom/ReservationCode";
import { calculateImpact } from "@/lib/impact-calculator";
import { useToast } from "@/hooks/use-toast";
import type { Business, Listing } from "@/types";

type Props = { listingId: string };

export function ListingDetail({ listingId }: Props) {
  const { toast } = useToast();
  const [listing, setListing] = React.useState<(Listing & { business: Business }) | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [qty, setQty] = React.useState(1);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [reservedCode, setReservedCode] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/listings/${listingId}`, { credentials: "same-origin" });
        const json = (await res.json()) as { listing?: Listing & { business: Business } };
        if (!cancelled) setListing(json.listing ?? null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  React.useEffect(() => {
    if (!listing) return;
    setQty((q) => Math.min(Math.max(1, q), Math.max(1, listing.quantity_remaining)));
  }, [listing]);

  const soldOut = !listing || listing.status === "sold_out" || listing.quantity_remaining <= 0;

  const total = listing ? parseFloat((Number(listing.current_price) * qty).toFixed(2)) : 0;
  const impact = listing
    ? calculateImpact(qty, Number(listing.original_price) * qty, Number(listing.current_price) * qty)
    : null;

  function reserve() {
    if (!listing || soldOut) return;
    setDialogOpen(true);
  }

  async function confirmReserve() {
    if (!listing) return;
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ listing_id: listing.id, quantity: qty }),
    });
    const json = (await res.json()) as { reservation?: { reservation_code: string }; error?: string };
    if (!res.ok) {
      toast({ title: "Could not reserve", description: json.error ?? "Try again.", variant: "destructive" });
      setDialogOpen(false);
      return;
    }
    setReservedCode(json.reservation?.reservation_code ?? "");
    toast({ title: "Reserved!", description: "Pickup details are in your dashboard." });
    setDialogOpen(false);
    const refresh = await fetch(`/api/listings/${listingId}`, { credentials: "same-origin" });
    const body = (await refresh.json()) as { listing?: Listing & { business: Business } };
    setListing(body.listing ?? null);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="mx-auto w-full max-w-5xl space-y-4 p-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="aspect-video w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <p className="p-8 text-center text-muted-foreground">This deal is not available.</p>
      </div>
    );
  }

  const b = listing.business;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-4 py-6 pb-24 md:pb-8">
        <nav className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2">→</span>
          <Link href="/explore" className="hover:text-foreground">
            Explore
          </Link>
          <span className="mx-2">→</span>
          <span className="text-foreground">{b.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
              {listing.photo_url ? (
                <Image src={listing.photo_url} alt="" fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" />
              ) : null}
              {listing.is_mystery_bag ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/60 backdrop-blur-md">
                  <span className="font-display text-5xl text-primary">?</span>
                  <p className="max-w-xs px-4 text-center text-sm text-muted-foreground">
                    Surprise assortment — contents revealed at pickup
                  </p>
                </div>
              ) : null}
            </div>
            <Card>
              <CardContent className="flex gap-4 pt-6">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={b.logo_url ?? undefined} alt="" />
                  <AvatarFallback>{b.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-xl font-semibold">{b.name}</h2>
                    <Badge variant="secondary">{b.category}</Badge>
                    <span className="text-sm text-muted-foreground">★ {b.rating.toFixed(1)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{b.address}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{listing.title}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <DiscountBadge pickupEnd={listing.pickup_end} />
              <span className="text-muted-foreground line-through">₺{Number(listing.original_price).toFixed(2)}</span>
              <span className="text-3xl font-bold text-primary">₺{Number(listing.current_price).toFixed(2)}</span>
            </div>
            <CountdownTimer pickupEnd={listing.pickup_end} large />

            {listing.is_mystery_bag ? (
              <p className="text-sm text-muted-foreground blur-sm">Description hidden for mystery bags.</p>
            ) : listing.description ? (
              <p className="text-sm leading-relaxed text-muted-foreground">{listing.description}</p>
            ) : null}

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-mono text-lg">{qty}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Increase quantity"
                onClick={() => setQty((q) => Math.min(listing.quantity_remaining, q + 1))}
                disabled={qty >= listing.quantity_remaining}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-lg font-semibold">
              Total: <span className="text-primary">₺{total.toFixed(2)}</span>
            </p>
            {impact ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Leaf className="h-4 w-4 text-primary" aria-hidden />
                Reserving this saves ~{impact.co2Saved} kg of CO₂ vs waste.
              </p>
            ) : null}

            <Button className="w-full" size="lg" disabled={soldOut} onClick={() => void reserve()}>
              {soldOut ? "Sold out" : "Reserve now"}
            </Button>
          </div>
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Confirm reservation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Payments are coming soon. For now, confirm to lock in your pickup — no card charge.
            </p>
            <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
              <div className="font-medium text-foreground">Card (demo)</div>
              <div className="mt-2 font-mono">4242 4242 4242 4242 · 12/34 · 000</div>
            </div>
            <Button className="w-full" onClick={() => void confirmReserve()}>
              Confirm reservation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!reservedCode} onOpenChange={() => setReservedCode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">You&apos;re set!</DialogTitle>
          </DialogHeader>
          {reservedCode ? <ReservationCode code={reservedCode} /> : null}
          <Button asChild className="w-full">
            <Link href="/customer/dashboard">View my reservations</Link>
          </Button>
        </DialogContent>
      </Dialog>

      <MobileBottomNav />
    </div>
  );
}
