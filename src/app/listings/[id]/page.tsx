import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { ReserveForm } from "@/components/ReserveForm";
import { fetchListingById } from "@/app/data/listings";
import {
  discountedPriceCents,
  formatMoney,
  interpolatedDiscountPercent,
  minutesUntil,
} from "@/lib/discount";
import { whatsappUrl } from "@/lib/wa";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const listing = await fetchListingById(id);
  if (!listing) return { title: "Listing | Shoz" };
  return {
    title: `${listing.item_name} · ${listing.venue_name}`,
    description: listing.description ?? "Surplus pickup deal",
  };
}

export default async function ListingPage({ params }: Props) {
  const { id } = await params;
  const listing = await fetchListingById(id);
  if (!listing) notFound();

  const now = new Date();
  const dealEnd = new Date(listing.deal_end);
  const dealStart = new Date(listing.deal_start);
  const discount = interpolatedDiscountPercent(
    now,
    dealStart,
    dealEnd,
    listing.discount_at_start,
    listing.discount_at_end
  );
  const price = discountedPriceCents(listing.original_price_cents, discount);
  const mins = minutesUntil(dealEnd, now);
  const active = listing.quantity_available > 0 && dealEnd.getTime() > Date.now();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
        <Link
          href="/"
          className="text-sm font-medium text-[var(--accent-dark)] underline-offset-4 hover:underline"
        >
          ← All deals
        </Link>
        <article className="mt-6 space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-[var(--accent)]">
            {listing.venue_name}
          </p>
          <h1 className="text-3xl font-bold text-[var(--text)]">{listing.item_name}</h1>
          {listing.mystery_bag ? (
            <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
              Mystery bag
            </span>
          ) : null}
          {listing.description ? (
            <p className="pt-2 text-[var(--muted)]">{listing.description}</p>
          ) : null}
          {listing.address ? (
            <p className="text-sm text-[var(--text)]">
              <span className="font-medium">Pickup:</span> {listing.address}
            </p>
          ) : null}
        </article>

        <div className="mt-8 grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase text-[var(--muted)]">Smart price now</p>
            <p className="text-3xl font-bold text-[var(--text)]">{formatMoney(price)}</p>
            <p className="text-sm text-[var(--muted)]">
              <span className="line-through">{formatMoney(listing.original_price_cents)}</span>
              <span className="ml-2 font-semibold text-[var(--accent-dark)]">−{discount}%</span>
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-[var(--muted)]">Closing window</p>
            <p className="text-lg font-semibold text-[var(--text)]">
              {mins < 1 ? "Under a minute" : `${mins} minutes left`}
            </p>
            <p className="text-sm text-[var(--muted)]">
              {listing.quantity_available} portion
              {listing.quantity_available === 1 ? "" : "s"} left
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            className="inline-flex items-center justify-center rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white"
            href={whatsappUrl(
              listing.whatsapp_phone,
              `Hi ${listing.venue_name}, I'm interested in "${listing.item_name}" on Shoz.`
            )}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp venue
          </a>
        </div>

        {active ? (
          <ReserveForm listing={listing} />
        ) : (
          <p className="mt-6 rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
            This listing is no longer available for reservation.
          </p>
        )}
      </main>
    </>
  );
}
