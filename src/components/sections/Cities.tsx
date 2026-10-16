"use client";

import Link from "next/link";
import { announcedCities, regionsWithUnannouncedTowns, cities } from "@/data/cities";
import { Badge } from "@/components/ui/Badge";
import { MapPin, Zap, Bike, ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CoverageMap } from "@/components/ui/CoverageMap";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StaggerReveal, StaggerItem } from "@/components/ui/StaggerReveal";
import { useLocale } from "@/lib/i18n/locale-context";
import { STAGGER } from "@/lib/motion";
import type { Locale } from "@/lib/i18n/config";

const copy = {
  en: {
    sectionAria: "Cities where Rido is launching",
    eyebrow: "Launch Cities",
    headingBefore: "Where to",
    headingHighlight: "Find Us",
    intro: "Rido launches first in Torrevieja on the Costa Blanca. Our Costa del Sol towns will be announced soon.",
    comingSoonBadge: "Launching soon",
    eScooter: "E-Scooter",
    eBike: "E-Bike",
    cityLink: "Rido in",
    teaserTitle: "More towns — announced soon",
    teaserCta: "Join the waitlist to hear first",
  },
  es: {
    sectionAria: "Ciudades donde llega Rido",
    eyebrow: "Ciudades de lanzamiento",
    headingBefore: "Dónde",
    headingHighlight: "Encontrarnos",
    intro: "Rido arranca en Torrevieja, en la Costa Blanca. Nuestras localidades de la Costa del Sol se anunciarán muy pronto.",
    comingSoonBadge: "Muy pronto",
    eScooter: "Patinete eléctrico",
    eBike: "Bici eléctrica",
    cityLink: "Rido en",
    teaserTitle: "Más localidades — muy pronto",
    teaserCta: "Únete a la lista de espera y entérate primero",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export function Cities() {
  const locale = useLocale();
  const t = copy[locale];
  const cityHref = (slug: string) => (locale === "es" ? `/es/${slug}` : `/${slug}`);

  return (
    <section id="cities" aria-label={t.sectionAria} className="py-12 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-rido-magenta/5 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <SectionHeading
            eyebrow={t.eyebrow}
            before={t.headingBefore}
            highlight={t.headingHighlight}
            className="text-3xl sm:text-4xl md:text-5xl font-black"
          />
          <ScrollReveal>
            <p className="mt-4 text-muted max-w-xl mx-auto">{t.intro}</p>
          </ScrollReveal>
        </div>

        {/* Real coverage map of announced towns only (MapLibre + OpenFreeMap,
            lazy-loaded; falls back to the SVG visualization). */}
        {announcedCities.length > 0 && (
          <ScrollReveal delay={0.1}>
            <div className="relative mb-10 flex justify-center">
              <CoverageMap towns={announcedCities} />
            </div>
          </ScrollReveal>
        )}

        <StaggerReveal
          className="mobile-carousel md:grid md:grid-cols-2 gap-4 sm:gap-5 max-w-3xl mx-auto"
          staggerDelay={STAGGER.grid}
        >
          {/* Announced towns — each links to its landing page */}
          {announcedCities.map((city) => (
            <StaggerItem key={city.slug}>
              <Link
                href={cityHref(city.slug)}
                aria-label={`${t.cityLink} ${city.name}`}
                className="group card-lift glass rounded-2xl p-5 sm:p-6 border border-white/10 hover:bg-white/10 hover:border-rido-magenta/30 hover:shadow-lg hover:shadow-rido-magenta/5 flex items-start gap-4 h-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rido-magenta focus-visible:ring-offset-2 focus-visible:ring-offset-rido-navy"
              >
                <div className="relative w-11 h-11 rounded-xl bg-rido-magenta/10 flex items-center justify-center shrink-0 group-hover:bg-rido-magenta/20 transition-colors">
                  <MapPin className="w-5 h-5 text-rido-magenta relative z-10" aria-hidden="true" />
                  <div className="absolute inset-0 rounded-xl bg-rido-magenta/20 city-pulse-ring" style={{ animationDelay: `${cities.indexOf(city) * 0.2}s` }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-lg sm:text-xl">{city.name}</h3>
                    {city.comingSoon && (
                      <Badge variant="magenta-light" className="cursor-pointer">
                        <span className="coming-soon-blink">{t.comingSoonBadge}</span>
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted mt-0.5">{city.region}</p>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {city.vehicles.map((v) => (
                      <Badge key={v} variant={v === "e-scooter" ? "magenta" : "green"} className="cursor-pointer">
                        {v === "e-scooter" ? <><Zap className="w-3 h-3" aria-hidden="true" /> {t.eScooter}</> : <><Bike className="w-3 h-3" aria-hidden="true" /> {t.eBike}</>}
                      </Badge>
                    ))}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 mt-1 shrink-0 text-muted group-hover:text-rido-magenta-light group-hover:translate-x-0.5 transition-all duration-200" aria-hidden="true" />
              </Link>
            </StaggerItem>
          ))}

          {/* Planned regions whose towns are not announced yet — region name only */}
          {regionsWithUnannouncedTowns.map((region) => (
            <StaggerItem key={region}>
              <div className="card-lift glass rounded-2xl p-5 sm:p-6 border border-white/10 hover:bg-white/10 hover:border-rido-magenta/30 h-full flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-muted" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-lg sm:text-xl">{t.teaserTitle}</h3>
                  <p className="text-sm text-muted mt-0.5">{region}</p>
                  <a
                    href="#download"
                    className="mt-2 inline-flex items-center gap-2 min-h-11 text-sm font-bold text-rido-magenta-light hover:text-white transition-colors cursor-pointer"
                  >
                    {t.teaserCta} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}
