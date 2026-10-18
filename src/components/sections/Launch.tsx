import Link from "next/link";
import { ArrowRight, MapPin, Clock } from "lucide-react";
import { announcedCities, plannedTownCount, regionsWithUnannouncedTowns } from "@/data/cities";
import { CoverageMap } from "@/components/ui/CoverageMap";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StaggerReveal, StaggerItem } from "@/components/ui/StaggerReveal";
import type { Locale } from "@/lib/i18n/config";
import { STAGGER } from "@/lib/motion";

const copy = {
  en: {
    aria: "Where Rido is launching",
    label: "Where we're launching",
    title: "Torrevieja first. The\u00A0Costa del Sol next.",
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
      "Somos un equipo local, con base en Orihuela Costa, a pocos kilómetros por la costa. Rido llega a Torrevieja en las próximas semanas con patinetes y bicis eléctricas compartidas.",
    soon: "En las próximas semanas",
    planned: (n: number) => `${n} localidades previstas — las anunciaremos muy pronto`,
    cityLink: (name: string) => `Rido en ${name}`,
    hearFirst: "Únete a la lista y entérate primero",
  },
} satisfies Record<Locale, Record<string, unknown>>;

/**
 * Section id stays "cities" — the navbar, footer and JSON-LD link to #cities.
 * Navy tone: it sits between the sand fleet section and the deep Safety one.
 */
export function Launch({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const cityHref = (slug: string) => (locale === "es" ? `/es/${slug}` : `/${slug}`);

  return (
    <Section id="cities" label={t.aria}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <SectionHeader label={t.label} title={t.title} intro={t.intro} align="left" className="!mb-8" />

          <StaggerReveal className="divide-y divide-white/10 border-y border-white/10" staggerDelay={STAGGER.grid}>
            {announcedCities.map((city) => (
              <StaggerItem key={city.slug}>
                <Link
                  href={cityHref(city.slug)}
                  className="group flex items-center gap-4 py-5 cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rido-magenta focus-visible:ring-offset-2 focus-visible:ring-offset-rido-navy"
                  aria-label={t.cityLink(city.name)}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rido-magenta text-white">
                    <MapPin className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-display text-xl font-bold text-white">
                      {city.name} <span className="font-sans text-base font-medium text-muted">· {city.region}</span>
                    </span>
                    <span className="block text-sm text-muted">{t.soon}</span>
                  </span>
                  <ArrowRight className="w-5 h-5 text-muted transition-transform duration-200 group-hover:translate-x-1 group-hover:text-rido-magenta-light" aria-hidden="true" />
                </Link>
              </StaggerItem>
            ))}
            {regionsWithUnannouncedTowns.map((region) => (
              <StaggerItem key={region}>
                <div className="flex items-center gap-4 py-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-muted">
                    <Clock className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-display text-xl font-bold text-white">{region}</span>
                    <span className="block text-sm text-muted">{t.planned(plannedTownCount(region))}</span>
                  </span>
                </div>
              </StaggerItem>
            ))}
          </StaggerReveal>

          <ScrollReveal delay={0.1}>
            <a
              href="#download"
              className="mt-6 inline-flex items-center gap-2 min-h-11 font-semibold text-rido-magenta-light hover:text-white transition-colors cursor-pointer"
            >
              {t.hearFirst} <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={0.1}>
          {/* Deep card with a hairline ring frames the map on the navy surface (no glow outside the hero). */}
          <div className="rounded-3xl bg-navy-deep p-2 ring-1 ring-white/10 [&_.coverage-map]:max-w-none [&_.coverage-map]:h-[280px] sm:[&_.coverage-map]:h-[420px]">
            <CoverageMap towns={announcedCities} />
          </div>
        </ScrollReveal>
      </div>
    </Section>
  );
}
