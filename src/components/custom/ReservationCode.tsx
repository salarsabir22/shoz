"use client";

import { cn } from "@/lib/utils";

type Props = {
  code: string;
  className?: string;
};

export function ReservationCode({ code, className }: Props) {
  return (
    <div
      className={cn(
        "rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 px-6 py-4 text-center",
        className
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pickup code</p>
      <p className="mt-2 font-mono text-4xl font-bold tracking-[0.35em] text-primary">{code}</p>
    </div>
  );
}
