"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  className?: string;
};

export function ImpactStat({ label, value, icon: Icon, className }: Props) {
  return (
    <div className={cn("flex items-start gap-3 rounded-xl border bg-card p-4 shadow-sm", className)}>
      <div className="rounded-lg bg-primary/10 p-2 text-primary">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div>
        <p className="font-display text-2xl font-semibold tabular-nums">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
