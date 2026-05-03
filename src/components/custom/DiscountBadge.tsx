"use client";

import { Badge } from "@/components/ui/badge";
import { calculateDiscount, getDiscountVariant } from "@/lib/discount-engine";
import { cn } from "@/lib/utils";

type Props = {
  pickupEnd: string;
  className?: string;
};

export function DiscountBadge({ pickupEnd, className }: Props) {
  const pct = calculateDiscount(new Date(pickupEnd));
  const variant = getDiscountVariant(pct);
  const variantClass =
    variant === "warning"
      ? "border-amber-500/60 bg-amber-100 text-amber-950 hover:bg-amber-100/90"
      : variant === "destructive"
        ? "border-transparent"
        : "";

  return (
    <Badge
      variant={variant === "destructive" ? "destructive" : variant === "secondary" ? "secondary" : "outline"}
      className={cn("font-semibold shadow-sm", variantClass, className)}
    >
      {pct}% off
    </Badge>
  );
}
