import { SiteHeader } from "@/components/SiteHeader";
import { ListingCard } from "@/components/ListingCard";
import { ImpactStrip } from "@/components/ImpactStrip";
import { fetchActiveListings } from "@/app/data/listings";
import { fetchImpactTotals } from "@/app/data/impact";
import { isSupabasePublicConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function Home() {
  const online = isSupabasePublicConfigured();
  const listings = online ? await fetchActiveListings() : [];
  const totals = await fetchImpactTotals();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6">
        <section className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-wide text-[var(--accent)]">
            Surplus food
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-[var(--text)] sm:text-5xl">
            Cheap meals. Less waste.
          </h1>
          <p className="max-w-xl text-[var(--muted)]">
            Venues post what is left before closing. You see the live price and pick it up
            in time.
          </p>
        </section>

        <ImpactStrip totals={totals} online={online} />

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-xl font-semibold text-[var(--text)]">Deals</h2>
            <span className="text-sm text-[var(--muted)]">
              {listings.length} live
            </span>
          </div>
          {listings.length === 0 ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center text-[var(--muted)]">
              {online ? (
                <>
                  <p>No listings right now.</p>
                  <p className="mt-2 text-sm">
                    <a className="font-medium text-[var(--accent-dark)] underline" href="/business">
                      Venues: list surplus here
                    </a>
                    .
                  </p>
                </>
              ) : (
                <p>Connect Supabase to load the board.</p>
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
      <footer className="mt-auto border-t border-[var(--border)] py-6 text-center text-xs text-[var(--muted)]">
        Demo project — surplus marketplace prototype.
      </footer>
    </>
  );
}
