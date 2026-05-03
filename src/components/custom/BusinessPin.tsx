"use client";

import { cn } from "@/lib/utils";

type Props = {
  price: string;
  active?: boolean;
  onClick?: () => void;
};

export function BusinessPin({ price, active, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex min-w-[3.25rem] -translate-x-1/2 -translate-y-full cursor-pointer items-center justify-center rounded-full border-2 border-white bg-primary px-2 py-1 text-xs font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105",
        active && "bg-secondary text-secondary-foreground ring-2 ring-primary"
      )}
      aria-label={`Deal from ${price}`}
    >
      {price}
      <span
        className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-white bg-primary"
        aria-hidden
      />
    </button>
  );
}
