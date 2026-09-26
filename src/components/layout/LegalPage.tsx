import Link from "next/link";

interface LegalPageProps {
  title: string;
  /** Omit on pages that are not dated legal documents. */
  lastUpdated?: string;
  children: React.ReactNode;
}

export function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-rido-navy">
      {/* Target for the global skip-to-content link in the root layout */}
      <main id="main-content" className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-muted">
            <li>
              <Link href="/" className="hover:text-rido-magenta-light transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-white/20">/</li>
            <li>
              <span className="text-white/70" aria-current="page">{title}</span>
            </li>
          </ol>
        </nav>

        <h1 className={`text-3xl md:text-4xl font-black ${lastUpdated ? "mb-2" : "mb-12"}`}>{title}</h1>
        {lastUpdated ? (
          <p className="text-sm text-muted mb-12">Last updated: {lastUpdated}</p>
        ) : null}

        <div className="legal-content text-white/70 leading-relaxed space-y-6">
          {children}
        </div>

        <div className="mt-16 pt-8 border-t border-white/10">
          <Link
            href="/"
            className="text-rido-magenta-light hover:text-white transition-colors"
          >
            ← Back to rido.bike
          </Link>
        </div>
      </main>
    </div>
  );
}