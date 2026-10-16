"use client";

import { Shield } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { WaitlistForm } from "@/components/ui/WaitlistForm";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/config";
import { primaryCity } from "@/data/cities";

const town = primaryCity?.name ?? "Torrevieja";

const copy = {
  en: {
    sectionAria: "Join the Rido waitlist",
    title: `Be first to ride in ${town}.`,
    intro: "Join the waitlist and we'll tell you the moment Rido launches, along with launch fares and the next towns.",
    reassurance: "No spam, no payment. Unsubscribe anytime · GDPR compliant",
  },
  es: {
    sectionAria: "Únete a la lista de espera de Rido",
    title: `Sé de los primeros en ${town}.`,
    intro: "Únete a la lista y te avisaremos en cuanto Rido arranque, junto con las tarifas de lanzamiento y las próximas localidades.",
    reassurance: "Sin spam, sin pagos. Date de baja cuando quieras · Cumplimos el RGPD",
  },
} as const satisfies Record<Locale, Record<string, string>>;

/**
 * Closing waitlist block. One headline, one field, one line of reassurance —
 * the same form as the hero (src/components/ui/WaitlistForm.tsx).
 */
export function DownloadCTA({ sharePath }: { sharePath?: string } = {}) {
  const locale = useLocale();
  const t = copy[locale];

  return (
    <section id="download" aria-label={t.sectionAria} className="py-16 sm:py-24 px-4 sm:px-6">
      <ScrollReveal>
        <div className="relative max-w-5xl mx-auto overflow-hidden rounded-[2rem] px-6 py-14 sm:px-12 sm:py-20 text-center bg-gradient-to-br from-rido-magenta/30 via-rido-navy-light to-rido-navy ring-1 ring-white/10">
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-rido-magenta/25 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-balance">{t.title}</h2>
            <p className="mt-4 text-base sm:text-lg text-muted max-w-xl mx-auto leading-relaxed">{t.intro}</p>
            <WaitlistForm align="center" placement="closing" sharePath={sharePath} className="mt-8 max-w-lg" />
            <p className="mt-5 inline-flex items-center gap-2 text-xs sm:text-sm text-muted">
              <Shield className="hidden sm:block w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              {t.reassurance}
            </p>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
