"use client";

import { useState, useTransition } from "react";
import { reserveListing } from "@/app/actions/listings";
import { whatsappUrl } from "@/lib/wa";
import { formatMoney, discountedPriceCents, interpolatedDiscountPercent } from "@/lib/discount";
import type { ListingRow } from "@/types/listing";

type Props = {
  listing: ListingRow;
};

export function ReserveForm({ listing }: Props) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const now = new Date();
  const discount = interpolatedDiscountPercent(
    now,
    new Date(listing.deal_start),
    new Date(listing.deal_end),
    listing.discount_at_start,
    listing.discount_at_end
  );
  const unitPrice = discountedPriceCents(listing.original_price_cents, discount);

  return (
    <form
      className="mt-6 space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6"
      onSubmit={(e) => {
        e.preventDefault();
        setMessage(null);
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          const name = String(fd.get("name") ?? "");
          const phone = String(fd.get("phone") ?? "");
          const qty = Number(fd.get("qty") ?? 1);
          const res = await reserveListing(listing.id, name, phone, qty);
          if (res.ok) {
            setDone(true);
          } else {
            setMessage(res.message);
          }
        });
      }}
    >
      <h3 className="text-lg font-semibold text-[var(--text)]">Reserve pickup</h3>
      <p className="text-sm text-[var(--muted)]">
        Unit price now:{" "}
        <span className="font-semibold text-[var(--text)]">{formatMoney(unitPrice)}</span>
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-[var(--muted)]">Your name</span>
          <input
            name="name"
            required
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-[var(--text)] outline-none ring-[var(--accent)]/30 focus:ring-2"
            placeholder="Alex"
            disabled={done}
          />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--muted)]">Phone (optional)</span>
          <input
            name="phone"
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-[var(--text)] outline-none ring-[var(--accent)]/30 focus:ring-2"
            placeholder="+32 ..."
            disabled={done}
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="text-[var(--muted)]">Quantity</span>
        <input
          name="qty"
          type="number"
          min={1}
          max={listing.quantity_available}
          defaultValue={1}
          className="mt-1 w-full max-w-[8rem] rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-[var(--text)] outline-none ring-[var(--accent)]/30 focus:ring-2"
          disabled={done}
        />
      </label>
      {message ? (
        <p className="text-sm text-red-600" role="alert">
          {message}
        </p>
      ) : null}
      {done ? (
        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p className="font-medium">Reservation recorded.</p>
          <p className="mt-1 text-emerald-800">
            Message the venue on WhatsApp to confirm pickup time.
          </p>
          <a
            className="mt-3 inline-flex items-center justify-center rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white"
            href={whatsappUrl(
              listing.whatsapp_phone,
              `Hi ${listing.venue_name}, I reserved "${listing.item_name}" on Shoz.`
            )}
            target="_blank"
            rel="noreferrer"
          >
            Open WhatsApp
          </a>
        </div>
      ) : (
        <button
          type="submit"
          disabled={pending || listing.quantity_available <= 0}
          className="w-full rounded-full bg-[var(--accent)] py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
        >
          {pending ? "Saving…" : "Confirm reservation"}
        </button>
      )}
    </form>
  );
}
