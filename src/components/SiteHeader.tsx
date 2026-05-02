import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="text-lg font-semibold tracking-tight text-[var(--text)]">
            Shoz
          </span>
          <span className="hidden text-sm text-[var(--muted)] sm:inline">
            surplus food nearby
          </span>
        </Link>
        <nav className="flex items-center gap-3 text-sm font-medium">
          <Link
            href="/"
            className="rounded-full px-3 py-1.5 text-[var(--muted)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--text)]"
          >
            Deals
          </Link>
          <Link
            href="/business"
            className="rounded-full bg-[var(--accent)] px-3 py-1.5 text-white shadow-sm transition hover:opacity-95"
          >
            List surplus
          </Link>
        </nav>
      </div>
    </header>
  );
}
