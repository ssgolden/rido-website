import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RidoLogo } from "@/components/ui/RidoLogo";
import type { Locale } from "@/lib/i18n/config";

const copy = {
  en: {
    kicker: "404 — Page not found",
    titleBefore: "Wrong",
    titleHighlight: "turn.",
    body: "This page doesn't exist — but the ride back home does.",
    home: "Back to Home",
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
        className="absolute top-1/4 -right-24 w-[320px] sm:w-[560px] h-[320px] sm:h-[560px] rounded-full bg-rido-magenta/8 blur-[100px] hero-orb hero-orb-1"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 -left-24 w-[260px] sm:w-[420px] h-[260px] sm:h-[420px] rounded-full bg-rido-green/10 blur-[90px] hero-orb hero-orb-2"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(15,23,42,0.7) 100%)" }}
      />

      <div className="relative z-10 text-center max-w-xl mx-auto">
        <div className="mb-10 flex justify-center">
          <RidoLogo variant="full" size="lg" />
        </div>

        <p className="mb-4 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/50">
          {t.kicker}
        </p>

        <h1 id="not-found-heading" className="text-display-2xl font-black text-balance">
          {t.titleBefore} <span className="text-gradient-brand">{t.titleHighlight}</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-white/60 leading-relaxed">{t.body}</p>

        <div className="mt-10 flex justify-center">
          <Link
            href={homeHref}
            className="btn-ripple btn-lift inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-xl bg-rido-magenta hover:bg-rido-magenta-dark text-white shadow-lg shadow-rido-magenta/25 hover:shadow-xl hover:shadow-rido-magenta/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rido-magenta focus-visible:ring-offset-2 focus-visible:ring-offset-rido-navy"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            <span>{t.home}</span>
          </Link>
        </div>

        <div className="mt-14 flex items-center justify-center gap-6 text-white/30 text-sm">
          <Link href="/privacy" className="nav-link hover:text-rido-magenta-light transition-colors duration-200 cursor-pointer">
            {t.privacy}
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/terms" className="nav-link hover:text-rido-magenta-light transition-colors duration-200 cursor-pointer">
            {t.terms}
          </Link>
          <span aria-hidden="true">·</span>
          <a href="mailto:info@rido.bike" className="nav-link hover:text-rido-magenta-light transition-colors duration-200 cursor-pointer">
            {t.contact}
          </a>
        </div>
      </div>
    </main>
  );
}
