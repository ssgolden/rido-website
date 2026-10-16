import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, Bike, ChevronDown, HardHat, Mail, MapPin, Zap } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { SiteShell } from "@/components/layout/SiteShell";
import { CoverageMap } from "@/components/ui/CoverageMap";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { BackToTop } from "@/components/ui/BackToTop";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { WaitlistForm } from "@/components/ui/WaitlistForm";
import { withBase } from "@/lib/basePath";
import { vehicles } from "@/data/vehicles";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/config";
import { announcedCities, type City } from "@/data/cities";
import { OG_LOCALE_EN, OG_LOCALE_ES, SITE_ORIGIN } from "@/lib/site";

const DownloadCTA = dynamic(() => import("@/components/sections/DownloadCTA").then((m) => ({ default: m.DownloadCTA })));
const Footer = dynamic(() => import("@/components/layout/Footer").then((m) => ({ default: m.Footer })));

const baseUrl = SITE_ORIGIN;

/** Resolves announced towns only — an unannounced slug must 404. */
export function getCity(slug: string): City | undefined {
  return announcedCities.find((c) => c.slug === slug);
}

function cityUrl(city: City, locale: Locale): string {
  return locale === "es" ? `${baseUrl}/es/${city.slug}` : `${baseUrl}/${city.slug}`;
}

/** Other announced towns in the same region. */
function regionNeighbours(city: City): string[] {
  return announcedCities.filter((c) => c.region === city.region && c.slug !== city.slug).map((c) => c.name);
}

/** "Torrevieja is Rido's launch town on the Costa Blanca" / "... one of 3 launch towns ..., alongside A and B". */
function launchTownSentence(city: City, locale: Locale): string {
  const others = regionNeighbours(city);
  if (locale === "es") {
    return others.length === 0
      ? `${city.name} es la localidad de lanzamiento de Rido en la ${city.region}.`
      : `${city.name} es una de las ${others.length + 1} localidades de lanzamiento de Rido en la ${city.region}, junto a ${listNames(others, locale)}.`;
  }
  return others.length === 0
    ? `${city.name} is Rido's launch town on the ${city.region}.`
    : `${city.name} is one of Rido's ${others.length + 1} launch towns on the ${city.region}, alongside ${listNames(others, locale)}.`;
}

/** "A, B, C and D" / "A, B, C y D" */
function listNames(names: string[], locale: Locale): string {
  if (names.length <= 1) return names.join("");
  const and = locale === "es" ? " y " : " and ";
  return `${names.slice(0, -1).join(", ")}${and}${names[names.length - 1]}`;
}

function vehicleNoun(city: City, locale: Locale): string {
  const both = city.vehicles.length === 2;
  if (locale === "es") {
    return both ? "patinetes eléctricos y bicicletas eléctricas" : "patinetes eléctricos";
  }
  return both ? "e-scooters and e-bikes" : "e-scooters";
}

// Pre-launch: no fares anywhere on the site until they are announced
// (see the Pricing section and src/data/pricing.ts).

// --- FAQ (honest: every town is comingSoon — never claim live availability) --
export interface CityFaqItem {
  question: string;
  answer: string;
}

export function getCityFaq(city: City, locale: Locale): CityFaqItem[] {
  const both = city.vehicles.length === 2;

  if (locale === "es") {
    return [
      {
        question: `¿Rido ya funciona en ${city.name}?`,
        answer: `Todavía no — Rido llegará a ${city.name} en las próximas semanas. Únete a la lista de espera y te avisaremos por email en cuanto los primeros vehículos estén en la calle.`,
      },
      {
        question: `¿Dónde operará Rido en ${city.name}?`,
        answer: `${launchTownSentence(city, "es")} Las zonas exactas para circular y aparcar se mostrarán en la app cuando lancemos el servicio.`,
      },
      {
        question: `¿Cuánto costará montar en ${city.name}?`,
        answer: "Las tarifas se anunciarán en el lanzamiento. Lo que no cambia: verás el precio exacto antes de cada viaje, sin recarga mínima y sin costes ocultos.",
      },
      {
        question: `¿Qué vehículos habrá en ${city.name}?`,
        answer: both
          ? `En ${city.name} planeamos lanzar tanto patinetes eléctricos como bicicletas eléctricas compartidos. La app mostrará la disponibilidad y el nivel de batería en tiempo real.`
          : `En ${city.name} el lanzamiento arrancará con patinetes eléctricos compartidos. La app mostrará la disponibilidad y el nivel de batería en tiempo real.`,
      },
    ];
  }

  return [
    {
      question: `Is Rido live in ${city.name} yet?`,
      answer: `Not yet — Rido launches in ${city.name} in the coming weeks. Join the waitlist and we'll email you the moment the first vehicles hit the street.`,
    },
    {
      question: `Where will Rido operate in ${city.name}?`,
      answer: `${launchTownSentence(city, "en")} Exact riding and parking zones will be shown in the app when the service goes live.`,
    },
    {
      question: `How much will a ride in ${city.name} cost?`,
      answer: "Fares will be announced at launch. What won't change: you'll see the exact price before every ride, with no minimum top-up and no hidden fees.",
    },
    {
      question: `Which vehicles will be available in ${city.name}?`,
      answer: both
        ? `We plan to launch both shared e-scooters and e-bikes in ${city.name}. The app will show real-time availability and battery levels.`
        : `${city.name} will launch with shared e-scooters first. The app will show real-time availability and battery levels.`,
    },
  ];
}

// --- Metadata -----------------------------------------------------------------
export function getCityMetadata(city: City, locale: Locale): Metadata {
  const url = cityUrl(city, locale);
  const languages = {
    en: `${baseUrl}/${city.slug}`,
    es: `${baseUrl}/es/${city.slug}`,
    "x-default": `${baseUrl}/${city.slug}`,
  };
  const noun = vehicleNoun(city, locale);

  const title =
    locale === "es"
      ? `Alquiler de patinetes eléctricos en ${city.name} — Rido`
      : `E-Scooter Rental in ${city.name} — Rido`;
  const description =
    locale === "es"
      ? `Rido trae ${noun} compartidos a ${city.name}, en la ${city.region}. Lanzamiento muy pronto: únete a la lista de espera y sé de los primeros en montar.`
      : `Rido is bringing shared ${noun} to ${city.name} on the ${city.region}. Launching soon — join the waitlist and be first to ride.`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url,
      siteName: "Rido",
      locale: locale === "es" ? OG_LOCALE_ES : OG_LOCALE_EN,
      alternateLocale: locale === "es" ? [OG_LOCALE_EN] : [OG_LOCALE_ES],
      images: [
        {
          url: "/images/og/rido-og.png",
          width: 1200,
          height: 630,
          alt: title,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/og/rido-og.png"],
    },
    other: {
      "geo.position": `${city.lat};${city.lng}`,
      "geo.region": city.isoRegion,
      "geo.placename": `${city.name}, ${city.region}, Spain`,
      ICBM: `${city.lat}, ${city.lng}`,
    },
  };
}

// --- JSON-LD (Service + FAQPage, consistent with src/lib/schema.ts) -----------
export function getCitySchemas(city: City, locale: Locale) {
  const url = cityUrl(city, locale);
  const serviceType = city.vehicles.length === 2 ? "E-Scooter & E-Bike Rental" : "E-Scooter Rental";

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name:
      locale === "es"
        ? `Alquiler de ${vehicleNoun(city, "es")} en ${city.name}`
        : `${serviceType} in ${city.name}`,
    serviceType,
    provider: { "@id": `${baseUrl}/#localbusiness` },
    url,
    inLanguage: locale,
    areaServed: {
      "@type": "Place",
      name: city.name,
      geo: {
        "@type": "GeoCoordinates",
        latitude: city.lat,
        longitude: city.lng,
      },
      containedInPlace: {
        "@type": "City",
        name: city.name,
        containedInPlace: { "@type": "AdministrativeArea", name: city.region },
      },
    },
    description:
      locale === "es"
        ? `Alquiler compartido de ${vehicleNoun(city, "es")} en ${city.name}, ${city.region}. Muy pronto.`
        : `Shared ${vehicleNoun(city, "en")} rental in ${city.name}, ${city.region}. Launching soon.`,
    offers: {
      "@type": "AggregateOffer",
      availability: "https://schema.org/PreOrder",
      // Pre-launch: no lowPrice/highPrice until fares are public.
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    inLanguage: locale,
    mainEntity: getCityFaq(city, locale).map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return [serviceSchema, faqSchema];
}

// --- UI copy -------------------------------------------------------------------
const uiCopy = {
  en: {
    badge: "Launching in the coming weeks",
    heroTitle: (city: City) =>
      city.vehicles.length === 2 ? `E-scooter and e-bike sharing in ${city.name}` : `E-scooter sharing in ${city.name}`,
    heroBody: (city: City) =>
      `Rido is bringing shared, zero-emission ${vehicleNoun(city, "en")} to ${city.name} on the ${city.region}. Join the waitlist and be first to ride the moment we launch.`,
    explore: "Explore Rido",
    vehiclesLabel: "Planned vehicles",
    scooterChip: "E-scooter",
    bikeChip: "E-bike",
    helmetChip: "Helmet included",
    imageAlt: "The Rido e-scooter in brand magenta, with its helmet docked on the stem",
    coverageLabel: "Where we're launching",
    coverageTitle: (city: City) => `${city.name}, ${city.region}`,
    coverageBody: (city: City) =>
      `${launchTownSentence(city, "en")} Exact riding and parking zones will be shown in the app when the service goes live.`,
    teamLabel: "Who runs it",
    teamTitle: (city: City) => `A local team, just down the coast from ${city.name}`,
    teamBody:
      "Rido is run by Go2 Place S.L. from Orihuela Costa, a short drive down the coast. Write to us and someone from the team will answer.",
    addressLabel: "Registered office",
    contactLabel: "Talk to us",
    faqLabel: "Questions",
    faqHeading: (city: City) => `Rido in ${city.name}`,
    heroAria: (city: City) => `Rido launching soon in ${city.name}`,
    coverageAria: (city: City) => `Rido launch coverage on the ${city.region}`,
    teamAria: "The local Rido team",
    faqAria: (city: City) => `Frequently asked questions about Rido in ${city.name}`,
  },
  es: {
    badge: "En las próximas semanas",
    heroTitle: (city: City) =>
      city.vehicles.length === 2
        ? `Patinetes y bicis eléctricas compartidas en ${city.name}`
        : `Patinetes eléctricos compartidos en ${city.name}`,
    heroBody: (city: City) =>
      `Rido trae ${vehicleNoun(city, "es")} compartidos y de cero emisiones a ${city.name}, en la ${city.region}. Únete a la lista de espera y sé de los primeros en montar cuando lancemos.`,
    explore: "Descubre Rido",
    vehiclesLabel: "Vehículos previstos",
    scooterChip: "Patinete eléctrico",
    bikeChip: "Bici eléctrica",
    helmetChip: "Casco incluido",
    imageAlt: "El patinete eléctrico Rido en magenta, con el casco acoplado en la barra",
    coverageLabel: "Dónde vamos a lanzar",
    coverageTitle: (city: City) => `${city.name}, ${city.region}`,
    coverageBody: (city: City) =>
      `${launchTownSentence(city, "es")} Las zonas exactas para circular y aparcar se mostrarán en la app cuando lancemos el servicio.`,
    teamLabel: "Quién está detrás",
    teamTitle: (city: City) => `Un equipo local, a pocos kilómetros de ${city.name}`,
    teamBody:
      "Rido lo gestiona Go2 Place S.L. desde Orihuela Costa, a pocos kilómetros por la costa. Escríbenos y te responderá alguien del equipo.",
    addressLabel: "Domicilio social",
    contactLabel: "Escríbenos",
    faqLabel: "Preguntas",
    faqHeading: (city: City) => `Rido en ${city.name}`,
    heroAria: (city: City) => `Rido llega muy pronto a ${city.name}`,
    coverageAria: (city: City) => `Cobertura de lanzamiento de Rido en la ${city.region}`,
    teamAria: "El equipo local de Rido",
    faqAria: (city: City) => `Preguntas frecuentes sobre Rido en ${city.name}`,
  },
} as const;

// --- Page ----------------------------------------------------------------------
/**
 * Launch-town landing page (the page local search lands on). Same design
 * language as the homepage: split hero with the inline waitlist form, sand
 * coverage band, local-team strip, FAQ, closing waitlist block.
 */
export function CityLanding({ city, locale }: { city: City; locale: Locale }) {
  const t = uiCopy[locale];
  const schemas = getCitySchemas(city, locale);
  const faq = getCityFaq(city, locale);
  const homeHref = locale === "es" ? "/es" : "/";
  const cityPath = locale === "es" ? `/es/${city.slug}` : `/${city.slug}`;

  return (
    <LocaleProvider locale={locale}>
      <SiteShell header={<Navbar />}>
      <main id="main-content">
        {schemas.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}

        {/* Hero: copy + inline waitlist form, product image on sand. */}
        <section
          id="city-hero"
          aria-label={t.heroAria(city)}
          className="relative overflow-hidden pt-8 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-6"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-rido-navy via-rido-navy to-rido-magenta/15 hero-gradient" aria-hidden="true" />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" aria-hidden="true" />
          <div className="absolute top-1/4 -right-24 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-rido-magenta/10 blur-[100px]" aria-hidden="true" />

          <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <ScrollReveal>
                <span className="inline-flex items-center gap-2 rounded-full bg-rido-magenta/15 border border-rido-magenta/25 px-3 py-1 text-xs sm:text-sm font-medium text-rido-magenta-light">
                  <span className="h-1.5 w-1.5 rounded-full bg-rido-green" aria-hidden="true" />
                  {t.badge}
                </span>
              </ScrollReveal>
              <ScrollReveal delay={0.08}>
                <h1 className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl font-black text-balance">{t.heroTitle(city)}</h1>
              </ScrollReveal>
              <ScrollReveal delay={0.16}>
                <p className="mt-5 sm:mt-6 text-base sm:text-lg text-white/90 max-w-xl mx-auto lg:mx-0 leading-relaxed">{t.heroBody(city)}</p>
              </ScrollReveal>
              <ScrollReveal delay={0.24} className="mt-8 flex justify-center lg:justify-start">
                <WaitlistForm placement="city-hero" sharePath={cityPath} className="max-w-lg" />
              </ScrollReveal>
              <ScrollReveal delay={0.3}>
                <ul className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-sm text-muted" aria-label={t.vehiclesLabel}>
                  {city.vehicles.map((v) => (
                    <li key={v} className="inline-flex items-center gap-1.5">
                      {v === "e-scooter" ? <Zap className="w-4 h-4 text-rido-magenta-light" aria-hidden="true" /> : <Bike className="w-4 h-4 text-rido-green" aria-hidden="true" />}
                      {v === "e-scooter" ? t.scooterChip : t.bikeChip}
                    </li>
                  ))}
                  <li className="inline-flex items-center gap-1.5">
                    <HardHat className="w-4 h-4 text-rido-magenta-light" aria-hidden="true" />
                    {t.helmetChip}
                  </li>
                </ul>
              </ScrollReveal>
            </div>

            <ScrollReveal delay={0.12} className="mx-auto w-full max-w-md lg:max-w-none">
              <ImageFrame
                src={withBase(vehicles[0].cutouts[0])}
                alt={t.imageAlt}
                sizes="(max-width: 1024px) 90vw, 45vw"
                priority
                imageClassName="drop-shadow-[0_30px_40px_rgba(15,23,42,0.25)]"
                aspect="aspect-[5/4] lg:aspect-[4/5]"
                className="shadow-2xl shadow-black/40"
              >
                <span className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 inline-flex items-center gap-1.5 rounded-full bg-white/85 backdrop-blur px-3 py-1.5 text-xs font-semibold text-ink ring-1 ring-black/5">
                  <MapPin className="w-3.5 h-3.5 text-rido-magenta-dark" aria-hidden="true" />
                  {city.name}
                </span>
              </ImageFrame>
            </ScrollReveal>
          </div>
        </section>

        {/* Coverage: sand band, copy beside the live map. */}
        <Section id="coverage" label={t.coverageAria(city)} tone="sand">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <SectionHeader
                label={t.coverageLabel}
                title={t.coverageTitle(city)}
                intro={t.coverageBody(city)}
                align="left"
                tone="sand"
                className="!mb-6"
              />
              <ScrollReveal delay={0.1}>
                <Link
                  href={homeHref}
                  className="inline-flex items-center gap-2 min-h-11 font-semibold text-rido-magenta-dark hover:text-ink transition-colors cursor-pointer"
                >
                  {t.explore} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </ScrollReveal>
            </div>
            <ScrollReveal delay={0.1}>
              {/* Navy card keeps the dark map style and its SVG fallback legible on sand. */}
              <div className="rounded-3xl bg-rido-navy p-2 shadow-2xl shadow-ink/20 [&_.coverage-map]:max-w-none [&_.coverage-map]:h-[280px] sm:[&_.coverage-map]:h-[420px]">
                <CoverageMap towns={announcedCities.filter((c) => c.region === city.region)} />
              </div>
            </ScrollReveal>
          </div>
        </Section>

        {/* Local team strip: real company, real address, a real inbox. */}
        <Section id="local-team" label={t.teamAria} tone="deep">
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-16 items-end">
            <SectionHeader label={t.teamLabel} title={t.teamTitle(city)} intro={t.teamBody} align="left" className="!mb-0" />
            <ScrollReveal delay={0.1}>
              <ul className="divide-y divide-white/10 border-y border-white/10">
                <li className="flex gap-4 py-5">
                  <MapPin className="w-5 h-5 shrink-0 mt-0.5 text-rido-magenta-light" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-white">{t.addressLabel}</p>
                    <p className="mt-1 text-sm text-muted leading-relaxed">
                      Go2 Place S.L. · Calle Eneldo 3, C4, local 22
                      <br />
                      03189 Orihuela Costa (Alicante)
                    </p>
                  </div>
                </li>
                <li className="flex gap-4 py-5">
                  <Mail className="w-5 h-5 shrink-0 mt-0.5 text-rido-magenta-light" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-white">{t.contactLabel}</p>
                    <p className="mt-1 text-sm">
                      <a href="mailto:info@rido.bike" className="inline-flex min-h-8 items-center text-rido-magenta-light hover:text-white transition-colors cursor-pointer">
                        info@rido.bike
                      </a>
                    </p>
                  </div>
                </li>
              </ul>
            </ScrollReveal>
          </div>
        </Section>

        {/* Town FAQ (also emitted as FAQPage JSON-LD above). */}
        <Section id="faq" label={t.faqAria(city)} containerClassName="max-w-3xl">
          <SectionHeader label={t.faqLabel} title={t.faqHeading(city)} />
          <ScrollReveal delay={0.1}>
            <div className="divide-y divide-white/10 border-y border-white/10">
              {faq.map((item) => (
                <details key={item.question} className="group py-2">
                  <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden flex items-center justify-between gap-4 py-3 font-display text-lg font-bold text-white min-h-[44px] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rido-magenta">
                    <span>{item.question}</span>
                    <ChevronDown className="w-5 h-5 shrink-0 text-rido-magenta-light transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
                  </summary>
                  <p className="pb-4 text-base text-muted leading-relaxed">{item.answer}</p>
                </details>
              ))}
            </div>
          </ScrollReveal>
        </Section>

        <DownloadCTA sharePath={cityPath} />
      </main>
      <Footer locale={locale} />
      <BackToTop />
      </SiteShell>
    </LocaleProvider>
  );
}
