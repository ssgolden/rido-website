"use client";

import { cities, citiesAnnounced, activeCityCount } from "@/data/cities";
import { Badge } from "@/components/ui/Badge";
import { MapPin, Zap, Bike, ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CoverageMap } from "@/components/ui/CoverageMap";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StaggerReveal, StaggerItem } from "@/components/ui/StaggerReveal";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/config";

const copy = {
  en: {
    sectionAria: "Cities where we operate",
    citiesWord: "Cities",
    comingSoonEyebrow: "Coming Soon",
    headingBefore: "Where to",
    headingHighlight: "Find Us",
    intro: "Rido is launching on the Costa del Sol. Here are the cities we're bringing our fleet to.",
    comingSoonBadge: "Coming Soon",
    eScooter: "E-Scooter",
    eBike: "E-Bike",
    // Pre-announcement teaser (citiesAnnounced === false)
    teaserEyebrow: "Launch Cities",
    teaserIntro: "Our first Costa del Sol locations will be announced soon.",
    teaserTitle: "Launch cities — announced soon",
    teaserRegion: "Costa del Sol",
    teaserCta: "Join the waitlist to hear first",
  },
  es: {
    sectionAria: "Ciudades donde operamos",
    citiesWord: "Ciudades",
    comingSoonEyebrow: "Próximamente",
    headingBefore: "Dónde",
    headingHighlight: "Encontrarnos",
    intro: "Rido llega a la Costa del Sol. Estas son las ciudades a las que traemos nuestra flota.",
    comingSoonBadge: "Próximamente",
    eScooter: "Patinete eléctrico",
    eBike: "Bici eléctrica",
    // Teaser previo al anuncio (citiesAnnounced === false)
    teaserEyebrow: "Ciudades de lanzamiento",
    teaserIntro: "Nuestras primeras ubicaciones en la Costa del Sol se anunciarán muy pronto.",
    teaserTitle: "Ciudades de lanzamiento — se anunciarán muy pronto",
    teaserRegion: "Costa del Sol",
    teaserCta: "Únete a la lista de espera y entérate primero",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export function Cities() {
  const locale = useLocale();
  const t = copy[locale];

  return (
    <section id="cities" aria-label={t.sectionAria} className="py-12 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-rido-magenta/5 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <SectionHeading
            eyebrow={
              citiesAnnounced
                ? activeCityCount > 0
                  ? `${activeCityCount} ${t.citiesWord}`
                  : t.comingSoonEyebrow
                : t.teaserEyebrow
            }
            before={t.headingBefore}
            highlight={t.headingHighlight}
            className="text-3xl sm:text-4xl md:text-5xl font-black"
          />
          <ScrollReveal>
            <p className="mt-4 text-muted max-w-xl mx-auto">{citiesAnnounced ? t.intro : t.teaserIntro}</p>
          </ScrollReveal>
        </div>

        {/* Real coverage map (MapLibre + OpenFreeMap, lazy-loaded; falls back to the SVG visualization).
            Pre-announcement it shows the Costa del Sol region only — no town markers/labels/popups. */}
        <ScrollReveal delay={0.1}>
          <div className="relative mb-16 flex justify-center">
            <CoverageMap showCities={citiesAnnounced} />
          </div>
        </ScrollReveal>

        {citiesAnnounced ? (
          /* City cards — restored site-wide when the launch towns are announced */
          <StaggerReveal className="mobile-carousel md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5" staggerDelay={0.08}>
            {cities.map((city) => (
              <StaggerItem key={city.slug}>
                <div className="group glass rounded-2xl p-5 sm:p-6 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-rido-magenta/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-rido-magenta/5">
                  <div className="flex items-start gap-4">
                    <div className="relative w-11 h-11 rounded-xl bg-rido-magenta/10 flex items-center justify-center shrink-0 group-hover:bg-rido-magenta/20 transition-colors">
                      <MapPin className="w-5 h-5 text-rido-magenta relative z-10" />
                      <div className="absolute inset-0 rounded-xl bg-rido-magenta/20 city-pulse-ring" style={{ animationDelay: `${cities.indexOf(city) * 0.2}s` }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-lg sm:text-xl">{city.name}</h3>
                        {city.comingSoon && (
                          <Badge variant="magenta-light" className="cursor-default">
                            <span className="coming-soon-blink">{t.comingSoonBadge}</span>
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted mt-0.5">{city.region}</p>
                      <div className="mt-3 flex gap-2">
                        {city.vehicles.map((v) => (
                          <Badge key={v} variant={v === "e-scooter" ? "magenta" : "green"} className="cursor-default">
                            {v === "e-scooter" ? <><Zap className="w-3 h-3" /> {t.eScooter}</> : <><Bike className="w-3 h-3" /> {t.eBike}</>}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerReveal>
        ) : (
          /* Pre-announcement teaser — one on-brand card, zero town names */
          <ScrollReveal delay={0.15}>
            <div className="max-w-xl mx-auto">
              <div className="glass rounded-2xl p-6 sm:p-8 border border-white/10 text-center transition-all duration-300 hover:bg-white/10 hover:border-rido-magenta/30">
                <div className="relative w-12 h-12 mx-auto rounded-xl bg-rido-magenta/10 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-rido-magenta relative z-10" />
                  <div className="absolute inset-0 rounded-xl bg-rido-magenta/20 city-pulse-ring" />
                </div>
                <h3 className="mt-4 font-black text-lg sm:text-xl">{t.teaserTitle}</h3>
                <p className="mt-1 text-sm text-muted">{t.teaserRegion}</p>
                <a
                  href="#download"
                  className="mt-5 inline-flex items-center justify-center gap-2 min-h-11 px-4 text-sm font-bold text-rido-magenta-light hover:text-white transition-colors cursor-pointer"
                >
                  {t.teaserCta} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </ScrollReveal>
        )}

      </div>
    </section>
  );
}
