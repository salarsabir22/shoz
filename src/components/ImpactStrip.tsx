import { formatMoney } from "@/lib/discount";
import type { ImpactTotals } from "@/app/data/impact";

type Props = {
  totals: ImpactTotals;
  /** Supabase URL + publishable/anon key configured */
  online: boolean;
};

export function ImpactStrip({ totals, online }: Props) {
  if (!online) {
    return (
      <section className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-6 text-center text-sm text-[var(--muted)]">
        Add your Supabase URL and publishable key to{" "}
        <code className="text-[var(--text)]">.env.local</code> (or Vercel env) to load
        deals and stats.
      </section>
    );
  }

  return (
    <section className="grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:grid-cols-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
          Meals diverted
        </p>
        <p className="mt-1 text-3xl font-bold text-[var(--text)]">{totals.mealsSaved}</p>
        <p className="text-sm text-[var(--muted)]">Reservations (demo)</p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
          Est. savings
        </p>
        <p className="mt-1 text-3xl font-bold text-[var(--text)]">
          {formatMoney(totals.moneySavedCents)}
        </p>
        <p className="text-sm text-[var(--muted)]">vs. full price</p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
          CO₂ (rough)
        </p>
        <p className="mt-1 text-3xl font-bold text-[var(--text)]">
          {totals.co2KgEstimate} kg
        </p>
        <p className="text-sm text-[var(--muted)]">Illustrative</p>
      </div>
    </section>
  );
}
