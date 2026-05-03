"use client";

import { Clock } from "lucide-react";
import { useCountdown } from "@/hooks/useCountdown";
import { cn } from "@/lib/utils";

type Props = {
  pickupEnd: string;
  className?: string;
  large?: boolean;
};

export function CountdownTimer({ pickupEnd, className, large }: Props) {
  const { minutes, seconds, isUrgent, isCritical, isPast } = useCountdown(pickupEnd);

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2 font-mono tabular-nums",
        isPast && "border-muted bg-muted/50 text-muted-foreground",
        !isPast && isCritical && "animate-pulse-urgent border-destructive/50 bg-destructive/10 text-destructive",
        !isPast && isUrgent && !isCritical && "border-amber-500/50 bg-amber-50 text-amber-900",
        !isPast && !isUrgent && "border-border bg-card",
        large && "text-lg px-4 py-3",
        className
      )}
      aria-live="polite"
    >
      <Clock className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
      {isPast ? (
        <span>Pickup window ended</span>
      ) : (
        <span>
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")} left
        </span>
      )}
    </div>
  );
}
