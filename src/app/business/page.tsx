import { SiteHeader } from "@/components/SiteHeader";
import { BusinessListingForm } from "@/components/BusinessListingForm";
import { isSupabaseAdminConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "List surplus | Shoz",
  description: "Publish end-of-day surplus for nearby customers.",
};

export default function BusinessPage() {
  const adminOk = isSupabaseAdminConfigured();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <header className="mb-8 max-w-xl space-y-2">
          <h1 className="text-3xl font-bold text-[var(--text)]">List surplus</h1>
          <p className="text-[var(--muted)]">
            For the course MVP this form writes straight to Supabase using a server-only
            service key. In production you would gate this behind restaurant accounts.
          </p>
        </header>
        {!adminOk ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-6 text-sm text-[var(--muted)]">
            Set <code className="text-[var(--text)]">SUPABASE_SERVICE_ROLE_KEY</code> in{" "}
            <code className="text-[var(--text)]">.env.local</code> (never commit it) so
            this form can insert rows.
          </div>
        ) : (
          <BusinessListingForm />
        )}
      </main>
    </>
  );
}
