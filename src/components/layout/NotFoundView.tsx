import { ArrowLeft } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { withBase } from "@/lib/basePath";

const copy = {
  en: {
    kicker: "404 — Page not found",
    titleBefore: "Wrong",
    titleHighlight: "turn.",
    body: "This page doesn't exist — but the ride back home does.",
    home: "Back to home",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    contact: "Contact",
  },
  es: {
    kicker: "404 — Página no encontrada",
    titleBefore: "Giro",
    titleHighlight: "equivocado.",
    body: "Esta página no existe, pero el camino de vuelta sí.",
    home: "Volver al inicio",
    privacy: "Política de privacidad",
    terms: "Términos del servicio",
    contact: "Contacto",
  },
} as const;

/**
 * 404 view. A server component with no client children (plain <img> and <a>
 * instead of RidoLogo/next/image and next/link): Next loads the not-found
 * boundary's JS on every page, so anything client-side here costs every visitor.
 */
export function NotFoundView({ locale = "en" }: { locale?: Locale }) {
  const t = copy[locale];
  const homeHref = locale === "es" ? "/es" : "/";

  return (
    <main
      id="not-found"
      aria-labelledby="not-found-heading"
      className="relative min-h-dvh flex items-center justify-center overflow-hidden bg-rido-navy text-white px-4 sm:px-6 py-16 sm:py-24"
    >
      <div
        aria-hidden="true"
        className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-rido-navy via-rido-navy to-rido-magenta/15"
      />
      <div
        aria-hidden="true"
        className="absolute top-[10%] -right-40 w-[480px] sm:w-[760px] h-[480px] sm:h-[760px] hero-orb hero-orb-1"
        style={{ background: "radial-gradient(closest-side, rgba(222,4,152,0.08), transparent)" }}
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-24 -left-36 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] hero-orb hero-orb-2"
        style={{ background: "radial-gradient(closest-side, rgba(34,197,94,0.10), transparent)" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(15,23,42,0.7) 100%)" }}
      />

      <div className="relative z-10 text-center max-w-xl mx-auto">
        <div className="mb-10 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- keeps next/image's client JS out of the 404 boundary */}
          <img src={withBase("/images/logo/rido-logo.png")} alt="Rido" width={81} height={40} className="shrink-0" />
        </div>

        <p className="mb-4 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/50">
          {t.kicker}
        </p>

        <h1 id="not-found-heading" className="text-display-2xl font-black text-balance">
          {t.titleBefore} <span className="text-gradient-brand">{t.titleHighlight}</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-white/60 leading-relaxed">{t.body}</p>

        <div className="mt-10 flex justify-center">
          <a
            href={homeHref}
            className="btn-ripple btn-lift inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-xl bg-rido-magenta hover:bg-rido-magenta-dark text-white shadow-lg shadow-rido-magenta/25 hover:shadow-xl hover:shadow-rido-magenta/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rido-magenta focus-visible:ring-offset-2 focus-visible:ring-offset-rido-navy"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            <span>{t.home}</span>
          </a>
        </div>

        <div className="mt-14 flex items-center justify-center gap-6 text-white/30 text-sm">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- plain link keeps next/link out of the 404 boundary */}
          <a href="/privacy" className="nav-link hover:text-rido-magenta-light transition-colors duration-200 cursor-pointer">
            {t.privacy}
          </a>
          <span aria-hidden="true">·</span>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- plain link keeps next/link out of the 404 boundary */}
          <a href="/terms" className="nav-link hover:text-rido-magenta-light transition-colors duration-200 cursor-pointer">
            {t.terms}
          </a>
          <span aria-hidden="true">·</span>
          <a href="mailto:info@rido.bike" className="nav-link hover:text-rido-magenta-light transition-colors duration-200 cursor-pointer">
            {t.contact}
          </a>
        </div>
      </div>
    </main>
  );
}
