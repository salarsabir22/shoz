import { formatMoney } from "@/lib/discount";
import type { ImpactTotals } from "@/app/data/impact";

type Props = {
  totals: ImpactTotals | null;
  status: "off" | "public-only" | "full";
};

export function ImpactStrip({ totals, status }: Props) {
  if (status === "off") {
    return (
      <section className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-6 text-center text-sm text-[var(--muted)]">
        Add Supabase URL and anon key to{" "}
        <code className="text-[var(--text)]">.env.local</code> to load live deals.
      </section>
    );
  }
  if (status === "public-only") {
    return (
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-center text-sm text-[var(--muted)]">
        Add <code className="text-[var(--text)]">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
        (server only) to show community impact totals from reservations.
      </section>
    );
  }
  if (!totals) return null;
  return (
    <section className="grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:grid-cols-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
          Meals diverted
        </p>
        <p className="mt-1 text-3xl font-bold text-[var(--text)]">{totals.mealsSaved}</p>
        <p className="text-sm text-[var(--muted)]">Reservations on this demo</p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
          Est. customer savings
        </p>
        <p className="mt-1 text-3xl font-bold text-[var(--text)]">
          {formatMoney(totals.moneySavedCents)}
        </p>
        <p className="text-sm text-[var(--muted)]">vs. full menu price</p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
          CO₂ story (rough)
        </p>
        <p className="mt-1 text-3xl font-bold text-[var(--text)]">
          {totals.co2KgEstimate} kg
        </p>
        <p className="text-sm text-[var(--muted)]">Illustrative, not audited</p>
      </div>
    </section>
  );
}
