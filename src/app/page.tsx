import { SiteHeader } from "@/components/SiteHeader";
import { ListingCard } from "@/components/ListingCard";
import { ImpactStrip } from "@/components/ImpactStrip";
import { fetchActiveListings } from "@/app/data/listings";
import { fetchImpactTotals } from "@/app/data/impact";
import {
  isSupabaseAdminConfigured,
  isSupabasePublicConfigured,
} from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function Home() {
  const publicOk = isSupabasePublicConfigured();
  const adminOk = isSupabaseAdminConfigured();
  const listings = publicOk ? await fetchActiveListings() : [];
  const totals = adminOk ? await fetchImpactTotals() : null;

  const impactStatus = !publicOk ? "off" : adminOk ? "full" : "public-only";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6">
        <section className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-wide text-[var(--accent)]">
            Smart surplus marketplace
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-[var(--text)] sm:text-5xl">
            Save food tonight.{" "}
            <span className="text-[var(--accent-dark)]">Pay less.</span>
          </h1>
          <p className="max-w-2xl text-lg text-[var(--muted)]">
            Cafés and bakeries list unsold portions before closing. Discounts climb
            automatically as pickup time approaches—like the European apps you may
            know, built here with Next.js and Supabase.
          </p>
        </section>

        <ImpactStrip totals={totals} status={impactStatus} />

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-xl font-semibold text-[var(--text)]">Live near you</h2>
            <span className="text-sm text-[var(--muted)]">
              {listings.length} active {listings.length === 1 ? "deal" : "deals"}
            </span>
          </div>
          {listings.length === 0 ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center text-[var(--muted)]">
              {publicOk ? (
                <>
                  <p>No active listings right now.</p>
                  <p className="mt-2 text-sm">
                    Venues can publish surplus on the{" "}
                    <a className="font-medium text-[var(--accent-dark)] underline" href="/business">
                      business form
                    </a>
                    .
                  </p>
                </>
              ) : (
                <p>Configure Supabase to see the shared dashboard.</p>
              )}
            </div>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2">
              {listings.map((listing) => (
                <li key={listing.id}>
                  <ListingCard listing={listing} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <footer className="mt-auto border-t border-[var(--border)] py-8 text-center text-xs text-[var(--muted)]">
        University prototype — not affiliated with Too Good To Go. Inspired by the same
        waste-reduction playbook.
      </footer>
    </>
  );
}
