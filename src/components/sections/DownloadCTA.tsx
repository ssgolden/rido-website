import { Check, Shield } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { WaitlistForm } from "@/components/ui/WaitlistForm";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { withBase } from "@/lib/basePath";
import type { Locale } from "@/lib/i18n/config";
import { primaryCity } from "@/data/cities";
import { vehicles } from "@/data/vehicles";

const town = primaryCity?.name ?? "Torrevieja";
// The e-bike here, so the page shows both vehicles (the hero has the scooter).
const bike = vehicles.find((v) => v.id === "e-bike");
const bikeImage = bike?.cutouts.find((c) => c.includes("side")) ?? bike?.cutouts[0];

const copy = {
  en: {
    sectionAria: "Join the Rido waitlist",
    title: `Be first to ride in ${town}.`,
    intro: "Leave your email. We'll only write when it matters.",
    benefitsLabel: "What you'll hear first",
    benefits: [
      `The day Rido launches in ${town}`,
      "Our launch fares, as soon as they're set",
      "Which Costa del Sol towns come next",
    ],
    reassurance: "No spam, no payment. Unsubscribe anytime · GDPR compliant",
    imageAlt: "The Rido e-bike in brand magenta, with a front basket",
  },
  es: {
    sectionAria: "Únete a la lista de espera de Rido",
    title: `Sé de los primeros en montar en ${town}.`,
    intro: "Déjanos tu correo. Solo te escribiremos cuando importe.",
    benefitsLabel: "Te enterarás antes que nadie de",
    benefits: [
      `El día que Rido llegue a ${town}`,
      "Nuestras tarifas de lanzamiento, en cuanto estén listas",
      "Qué localidades de la Costa del Sol vienen después",
    ],
    reassurance: "Sin spam, sin pagos. Date de baja cuando quieras · Cumplimos el RGPD",
    imageAlt: "La bici eléctrica Rido en magenta, con cesta delantera",
  },
} as const satisfies Record<Locale, unknown>;

/**
 * Closing waitlist block: the promise (what you'll hear first), the same form
 * as the hero (src/components/ui/WaitlistForm.tsx) and the e-bike. The list
 * only restates what joining actually gets you; no offers we haven't made.
 */
export function DownloadCTA({ locale, sharePath }: { locale: Locale; sharePath?: string }) {
  const t = copy[locale];

  return (
    <section id="download" aria-label={t.sectionAria} className="py-16 sm:py-24 px-4 sm:px-6">
      <ScrollReveal>
        <div className="relative max-w-6xl mx-auto overflow-hidden rounded-[2rem] px-6 py-14 sm:px-12 sm:py-16 lg:py-14 bg-gradient-to-br from-rido-magenta/30 via-rido-navy-light to-rido-navy ring-1 ring-white/10">
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-rido-magenta/25 blur-3xl" aria-hidden="true" />
          <div className="relative grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14 items-center">
            <div className="text-center lg:text-left">
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-balance">{t.title}</h2>
              <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed">{t.intro}</p>

              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.14em] text-rido-magenta-light">{t.benefitsLabel}</p>
              <ul className="mt-3 inline-flex flex-col gap-2.5 text-left">
                {t.benefits.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm sm:text-base text-white/90">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rido-magenta/20" aria-hidden="true">
                      <Check className="h-3.5 w-3.5 text-rido-magenta-light" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <WaitlistForm placement="closing" sharePath={sharePath} className="mt-8 max-w-lg mx-auto lg:mx-0" />
              <p className="mt-5 inline-flex items-center gap-2 text-xs sm:text-sm text-muted">
                <Shield className="hidden sm:block w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {t.reassurance}
              </p>
            </div>

            {bikeImage ? (
              <ImageFrame
                src={withBase(bikeImage)}
                alt={t.imageAlt}
                sizes="(max-width: 1024px) 0px, 40vw"
                aspect="aspect-[5/4]"
                imageClassName="drop-shadow-[0_24px_30px_rgba(15,23,42,0.25)]"
                className="hidden lg:block shadow-2xl shadow-black/40"
              />
            ) : null}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
