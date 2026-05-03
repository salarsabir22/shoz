"use client";

import { cn } from "@/lib/utils";

type Props = {
  remaining: number;
  total: number;
  className?: string;
};

export function QuantityBar({ remaining, total, className }: Props) {
  const pct = total > 0 ? Math.min(100, Math.round((remaining / total) * 100)) : 0;
  const colorClass =
    remaining <= 2 ? "bg-destructive" : remaining <= 5 ? "bg-amber-500" : "bg-primary";

  return (
    <div className={cn("space-y-1", className)}>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full transition-all duration-500", colorClass)} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          {remaining <= 2 && remaining > 0 ? (
            <span className="font-medium text-destructive">Only {remaining} left!</span>
          ) : (
            <span>{remaining} left</span>
          )}
        </span>
        <span className="tabular-nums">{pct}%</span>
      </div>
    </div>
  );
}
