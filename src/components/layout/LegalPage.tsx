import Link from "next/link";
import { ChevronRight, Languages } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { SiteShell } from "@/components/layout/SiteShell";
import { Footer } from "@/components/layout/Footer";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/config";

const copy = {
  en: { breadcrumb: "Breadcrumb", home: "Home", lastUpdated: "Last updated", back: "Back to rido.bike" },
  es: { breadcrumb: "Migas de pan", home: "Inicio", lastUpdated: "Última actualización", back: "Volver a rido.bike" },
} as const satisfies Record<Locale, Record<string, string>>;

/** The "available in English only" line, in Spanish, shown above English-only pages. */
const ES_ONLY_IN_ENGLISH = "Esta página está disponible solo en inglés por ahora.";

interface LegalPageProps {
  title: string;
  /** Omit on pages that are not dated legal documents. */
  lastUpdated?: string;
  /** Language of the chrome (breadcrumb, nav, footer). Defaults to English. */
  locale?: Locale;
  /**
   * Spanish summary of an English-only page (what the page is, in one or two
   * sentences). When set, a Spanish notice renders between the breadcrumb and
   * the title: the summary plus "Esta página está disponible solo en inglés
   * por ahora." The ES footer and language switcher link here until the
   * Spanish legal pages exist (lawyer's translation pending), so Spanish
   * visitors are told where they are rather than landing on English silently.
   */
  esIntro?: string;
  children: React.ReactNode;
}

/**
 * Long-form text page (legal documents, careers) inside the site chrome:
 * SiteShell lane + Navbar + Footer, a locale-aware breadcrumb and the
 * `.legal-content` typography. Server component: the shell and nav are
 * client islands that take this tree as children.
 */
export function LegalPage({ title, lastUpdated, locale = "en", esIntro, children }: LegalPageProps) {
  const t = copy[locale];
  const home = locale === "es" ? "/es" : "/";
  const page = (
    <SiteShell header={<Navbar />}>
      {/* Target for the global skip-to-content link in the root layout */}
      <main id="main-content" className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-16 sm:pt-10 sm:pb-24">
        <nav aria-label={t.breadcrumb} className="mb-6">
          <ol className="flex items-center gap-1.5 text-sm text-muted">
            <li>
              <Link
                href={home}
                className="nav-link nav-link-tall inline-flex items-center min-h-11 px-1 -mx-1 cursor-pointer hover:text-rido-magenta-light transition-colors"
              >
                {t.home}
              </Link>
            </li>
            <li aria-hidden="true" className="flex items-center text-white/25">
              <ChevronRight className="w-4 h-4" />
            </li>
            <li>
              <span className="text-white/70" aria-current="page">{title}</span>
            </li>
          </ol>
        </nav>

        {esIntro ? (
          <aside
            lang="es"
            aria-label="Aviso en español"
            className="mb-8 flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-muted"
          >
            <Languages className="mt-0.5 h-4 w-4 shrink-0 text-rido-magenta-light" aria-hidden="true" />
            <div>
              <p>{esIntro}</p>
              <p className="mt-2 font-semibold text-white/80">{ES_ONLY_IN_ENGLISH}</p>
            </div>
          </aside>
        ) : null}

        <h1 className={`text-3xl md:text-4xl font-black ${lastUpdated ? "mb-2" : "mb-12"}`}>{title}</h1>
        {lastUpdated ? (
          <p className="text-sm text-muted mb-12">{t.lastUpdated}: {lastUpdated}</p>
        ) : null}

        <div className="legal-content text-white/70 leading-relaxed space-y-6">
          {children}
        </div>

        <div className="mt-16 pt-8 border-t border-white/10">
          <Link
            href={home}
            className="inline-flex items-center min-h-11 cursor-pointer text-rido-magenta-light hover:text-white transition-colors"
          >
            ← {t.back}
          </Link>
        </div>
      </main>
      <Footer locale={locale} />
    </SiteShell>
  );
  // English is the default locale context; Spanish pages wrap the tree so the
  // Navbar (a client component reading useLocale) renders Spanish copy.
  return locale === "es" ? <LocaleProvider locale="es">{page}</LocaleProvider> : page;
}
