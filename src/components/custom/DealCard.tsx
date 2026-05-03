"use client";

import Image from "next/image";
import Link from "next/link";
import { Cake, Coffee, ShoppingBasket, UtensilsCrossed, MapPin } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistance } from "@/lib/geo";
import { cn } from "@/lib/utils";
import type { Business, BusinessCategory, Listing } from "@/types";
import { CountdownTimer } from "./CountdownTimer";
import { DiscountBadge } from "./DiscountBadge";
import { QuantityBar } from "./QuantityBar";

export type DealWithMeta = Listing & {
  business: Business;
  distance_km: number;
};

const categoryIcon: Record<BusinessCategory, typeof Cake> = {
  bakery: Cake,
  cafe: Coffee,
  restaurant: UtensilsCrossed,
  grocery: ShoppingBasket,
};

type Props = {
  deal: DealWithMeta;
  highlight?: boolean;
  onHover?: (id: string | null) => void;
};

export function DealCard({ deal, highlight, onHover }: Props) {
  const soldOut = deal.status === "sold_out" || deal.quantity_remaining <= 0;
  const CatIcon = categoryIcon[deal.business.category];

  return (
    <Card
      className={cn(
        "overflow-hidden transition-shadow",
        highlight && "ring-2 ring-primary shadow-lg",
        soldOut && "opacity-70 grayscale-[0.35]"
      )}
      onMouseEnter={() => onHover?.(deal.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className="relative aspect-video w-full bg-muted">
        {deal.photo_url ? (
          <Image
            src={deal.photo_url}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, 400px"
          />
        ) : null}
        <div className="absolute right-2 top-2">
          <DiscountBadge pickupEnd={deal.pickup_end} />
        </div>
        {deal.is_mystery_bag ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/55 backdrop-blur-sm">
            <span className="font-display text-3xl text-primary">?</span>
          </div>
        ) : null}
      </div>
      <CardContent className="space-y-3 pt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CatIcon className="h-4 w-4 shrink-0" aria-hidden />
          <span className="truncate font-medium text-foreground">{deal.business.name}</span>
          <span className="ml-auto flex items-center gap-1 tabular-nums">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            {formatDistance(deal.distance_km)}
          </span>
        </div>
        <h3 className="font-display text-xl font-semibold leading-snug">{deal.title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-muted-foreground line-through">₺{Number(deal.original_price).toFixed(2)}</span>
          <span className="text-2xl font-bold text-primary">₺{Number(deal.current_price).toFixed(2)}</span>
        </div>
        <QuantityBar remaining={deal.quantity_remaining} total={deal.quantity_total} />
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Pick up by</span>
          <span className="font-medium text-foreground">
            {new Date(deal.pickup_end).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
          </span>
        </p>
        <CountdownTimer pickupEnd={deal.pickup_end} />
      </CardContent>
      <CardFooter className="pt-0">
        <Button asChild className="w-full" disabled={soldOut}>
          <Link href={`/listing/${deal.id}`}>{soldOut ? "Sold Out" : "Reserve"}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
