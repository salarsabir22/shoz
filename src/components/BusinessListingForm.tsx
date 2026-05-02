"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createListing, type CreateListingInput } from "@/app/actions/listings";

function toDatetimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function BusinessListingForm() {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [okId, setOkId] = useState<string | null>(null);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getTime() + 30 * 60000);
    const end = new Date(now.getTime() + 3 * 3600000);
    if (startRef.current && !startRef.current.value) {
      startRef.current.value = toDatetimeLocalValue(start);
    }
    if (endRef.current && !endRef.current.value) {
      endRef.current.value = toDatetimeLocalValue(end);
    }
  }, []);

  return (
    <form
      className="mx-auto max-w-xl space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        setMsg(null);
        setOkId(null);
        const fd = new FormData(e.currentTarget);
        const input: CreateListingInput = {
          venueName: String(fd.get("venueName") ?? ""),
          itemName: String(fd.get("itemName") ?? ""),
          description: String(fd.get("description") ?? ""),
          address: String(fd.get("address") ?? ""),
          whatsappPhone: String(fd.get("whatsappPhone") ?? ""),
          originalPriceEur: Number(fd.get("originalPriceEur") ?? 0),
          discountAtStart: Number(fd.get("discountAtStart") ?? 30),
          discountAtEnd: Number(fd.get("discountAtEnd") ?? 70),
          dealStart: String(fd.get("dealStart") ?? ""),
          dealEnd: String(fd.get("dealEnd") ?? ""),
          quantity: Number(fd.get("quantity") ?? 1),
          mysteryBag: fd.get("mysteryBag") === "on",
        };
        startTransition(async () => {
          const res = await createListing(input);
          if (res.ok) {
            setOkId(res.id);
            e.currentTarget.reset();
          } else {
            setMsg(res.message);
          }
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          <span className="text-[var(--muted)]">Venue name</span>
          <input
            name="venueName"
            required
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
            placeholder="Riverside Bakery"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="text-[var(--muted)]">Item</span>
          <input
            name="itemName"
            required
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
            placeholder="Mixed pastries box"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="text-[var(--muted)]">Description</span>
          <textarea
            name="description"
            rows={3}
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
            placeholder="Allergens, pickup notes…"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="text-[var(--muted)]">Address / pickup hint</span>
          <input
            name="address"
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
            placeholder="Main Street 12 — side door"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="text-[var(--muted)]">WhatsApp (business)</span>
          <input
            name="whatsappPhone"
            required
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
            placeholder="+32470123456"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--muted)]">Original price (€)</span>
          <input
            name="originalPriceEur"
            type="number"
            step="0.01"
            min={0.5}
            required
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
            defaultValue={12}
          />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--muted)]">Quantity available</span>
          <input
            name="quantity"
            type="number"
            min={1}
            required
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
            defaultValue={8}
          />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--muted)]">Discount at window start (%)</span>
          <input
            name="discountAtStart"
            type="number"
            min={0}
            max={90}
            required
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
            defaultValue={30}
          />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--muted)]">Discount by closing (%)</span>
          <input
            name="discountAtEnd"
            type="number"
            min={0}
            max={95}
            required
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
            defaultValue={70}
          />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--muted)]">Deal window start</span>
          <input
            ref={startRef}
            name="dealStart"
            type="datetime-local"
            required
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--muted)]">Pickup deadline</span>
          <input
            ref={endRef}
            name="dealEnd"
            type="datetime-local"
            required
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
          />
        </label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input name="mysteryBag" type="checkbox" className="size-4 rounded border" />
          <span className="text-[var(--text)]">Mystery bag listing</span>
        </label>
      </div>
      {msg ? (
        <p className="text-sm text-red-600" role="alert">
          {msg}
        </p>
      ) : null}
      {okId ? (
        <p className="text-sm text-emerald-700">
          Listing published.{" "}
          <a className="font-medium underline" href={`/listings/${okId}`}>
            View live
          </a>
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-[var(--accent)] py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
      >
        {pending ? "Publishing…" : "Publish to dashboard"}
      </button>
    </form>
  );
}
