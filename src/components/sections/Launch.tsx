"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Clock } from "lucide-react";
import { announcedCities, plannedTownCount, regionsWithUnannouncedTowns } from "@/data/cities";
import { CoverageMap } from "@/components/ui/CoverageMap";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StaggerReveal, StaggerItem } from "@/components/ui/StaggerReveal";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/config";
import { STAGGER } from "@/lib/motion";

const copy = {
  en: {
    aria: "Where Rido is launching",
    label: "Where we're launching",
    title: "Torrevieja first. The Costa del Sol next.",
    intro:
      "We're a local team, based just down the coast in Orihuela Costa. Rido launches in Torrevieja in the coming weeks with shared e-scooters and e-bikes.",
    soon: "Launching in the coming weeks",
    planned: (n: number) => `${n} towns planned — announced soon`,
    cityLink: (name: string) => `Rido in ${name}`,
    hearFirst: "Join the waitlist to hear first",
  },
  es: {
    aria: "Dónde llega Rido",
    label: "Dónde arrancamos",
    title: "Primero Torrevieja. Después, la Costa del Sol.",
    intro:
      "Somos un equipo local, a pocos kilómetros en Orihuela Costa. Rido llega a Torrevieja en las próximas semanas con patinetes y bicis eléctricas compartidas.",
    soon: "En las próximas semanas",
    planned: (n: number) => `${n} localidades previstas — muy pronto`,
    cityLink: (name: string) => `Rido en ${name}`,
    hearFirst: "Únete a la lista y entérate primero",
  },
} satisfies Record<Locale, Record<string, unknown>>;

/** Section id stays "cities" — the navbar, footer and JSON-LD link to #cities. */
export function Launch() {
  const locale = useLocale();
  const t = copy[locale];
  const cityHref = (slug: string) => (locale === "es" ? `/es/${slug}` : `/${slug}`);

  return (
    <Section id="cities" label={t.aria} tone="sand">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <SectionHeader label={t.label} title={t.title} intro={t.intro} align="left" tone="sand" className="!mb-8" />

          <StaggerReveal className="divide-y divide-ink/10 border-y border-ink/10" staggerDelay={STAGGER.grid}>
            {announcedCities.map((city) => (
              <StaggerItem key={city.slug}>
                <Link
                  href={cityHref(city.slug)}
                  className="group flex items-center gap-4 py-5 cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rido-magenta focus-visible:ring-offset-2 focus-visible:ring-offset-sand"
                  aria-label={t.cityLink(city.name)}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rido-magenta text-white">
                    <MapPin className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-display text-xl font-bold text-ink">
                      {city.name} <span className="font-sans text-base font-medium text-ink-weak">· {city.region}</span>
                    </span>
                    <span className="block text-sm text-ink-muted">{t.soon}</span>
                  </span>
                  <ArrowRight className="w-5 h-5 text-ink-weak transition-transform duration-200 group-hover:translate-x-1 group-hover:text-rido-magenta-dark" aria-hidden="true" />
                </Link>
              </StaggerItem>
            ))}
            {regionsWithUnannouncedTowns.map((region) => (
              <StaggerItem key={region}>
                <div className="flex items-center gap-4 py-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink/5 text-ink-muted">
                    <Clock className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-display text-xl font-bold text-ink">{region}</span>
                    <span className="block text-sm text-ink-muted">{t.planned(plannedTownCount(region))}</span>
                  </span>
                </div>
              </StaggerItem>
            ))}
          </StaggerReveal>

          <ScrollReveal delay={0.1}>
            <a
              href="#download"
              className="mt-6 inline-flex items-center gap-2 min-h-11 font-semibold text-rido-magenta-dark hover:text-ink transition-colors cursor-pointer"
            >
              {t.hearFirst} <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={0.1}>
          {/* Navy card keeps the dark map style and its SVG fallback legible on sand. */}
          <div className="rounded-3xl bg-rido-navy p-2 shadow-2xl shadow-ink/20 [&_.coverage-map]:max-w-none [&_.coverage-map]:h-[280px] sm:[&_.coverage-map]:h-[420px]">
            <CoverageMap towns={announcedCities} />
          </div>
        </ScrollReveal>
      </div>
    </Section>
  );
}
