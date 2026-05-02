import Link from "next/link";
import {
  discountedPriceCents,
  formatMoney,
  interpolatedDiscountPercent,
  minutesUntil,
} from "@/lib/discount";
import type { ListingRow } from "@/types/listing";

type Props = { listing: ListingRow };

export function ListingCard({ listing }: Props) {
  const now = new Date();
  const dealStart = new Date(listing.deal_start);
  const dealEnd = new Date(listing.deal_end);
  const discount = interpolatedDiscountPercent(
    now,
    dealStart,
    dealEnd,
    listing.discount_at_start,
    listing.discount_at_end
  );
  const price = discountedPriceCents(listing.original_price_cents, discount);
  const mins = minutesUntil(dealEnd, now);

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:border-[var(--accent)]/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--accent)]">
            {listing.venue_name}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-[var(--text)] group-hover:text-[var(--accent-dark)]">
            {listing.item_name}
          </h2>
        </div>
        {listing.mystery_bag && (
          <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
            Mystery bag
          </span>
        )}
      </div>
      {listing.description ? (
        <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">
          {listing.description}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-[var(--border)] pt-4">
        <div>
          <p className="text-xs text-[var(--muted)]">Smart price now</p>
          <p className="text-2xl font-bold text-[var(--text)]">{formatMoney(price)}</p>
          <p className="text-xs text-[var(--muted)]">
            <span className="line-through">{formatMoney(listing.original_price_cents)}</span>
            <span className="ml-2 font-medium text-[var(--accent-dark)]">
              −{discount}%
            </span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[var(--muted)]">Pickup in</p>
          <p className="text-sm font-semibold text-[var(--text)]">
            {mins < 1 ? "Under 1 min" : `${mins} min`}
          </p>
          <p className="text-xs text-[var(--muted)]">
            {listing.quantity_available} left
          </p>
        </div>
      </div>
    </Link>
  );
}
