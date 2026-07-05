import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, Bike, ChevronDown, MapPin, Zap } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/Badge";
import { CoverageMap } from "@/components/ui/CoverageMap";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { BackToTop } from "@/components/ui/BackToTop";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/config";
import { cities, type City } from "@/data/cities";
import { pricingTiers } from "@/data/pricing";

const DownloadCTA = dynamic(() => import("@/components/sections/DownloadCTA").then((m) => ({ default: m.DownloadCTA })));
const Footer = dynamic(() => import("@/components/layout/Footer").then((m) => ({ default: m.Footer })));

const baseUrl = "https://rido.bike";

export function getCity(slug: string): City | undefined {
  return cities.find((c) => c.slug === slug);
}

function cityUrl(city: City, locale: Locale): string {
  return locale === "es" ? `${baseUrl}/es/${city.slug}` : `${baseUrl}/${city.slug}`;
}

function otherTownNames(city: City): string[] {
  return cities.filter((c) => c.slug !== city.slug).map((c) => c.name);
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

// Pricing facts sourced from src/data/pricing.ts so copy never drifts from the
// pricing section. Price strings (€1.00 / €0.35/min / …) are locale-identical.
const payg = pricingTiers.find((t) => t.id === "pay-as-you-go") ?? pricingTiers[0];
const pass = pricingTiers.find((t) => t.id === "rido-pass") ?? pricingTiers[1];
const day = pricingTiers.find((t) => t.id === "day-pass") ?? pricingTiers[2];

// --- FAQ (honest: every town is comingSoon — never claim live availability) --
export interface CityFaqItem {
  question: string;
  answer: string;
}

export function getCityFaq(city: City, locale: Locale): CityFaqItem[] {
  const others = listNames(otherTownNames(city), locale);
  const both = city.vehicles.length === 2;

  if (locale === "es") {
    return [
      {
        question: `¿Rido ya funciona en ${city.name}?`,
        answer: `Todavía no — Rido llegará muy pronto a ${city.name} y al resto de la Costa del Sol. Únete a la lista de espera y te avisaremos por email en cuanto los primeros vehículos estén en la calle.`,
      },
      {
        question: `¿Dónde operará Rido en ${city.name}?`,
        answer: `${city.name} es una de las cinco localidades de lanzamiento de Rido en la Costa del Sol, junto a ${others}. Las zonas exactas para circular y aparcar se mostrarán en la app cuando lancemos el servicio.`,
      },
      {
        question: `¿Cuánto costará montar en ${city.name}?`,
        answer: `Paga por trayecto: ${payg.unlockFee} por desbloquear más ${payg.perMinute}. Con el Rido Pass el desbloqueo es gratis y pagas ${pass.perMinute}, y el Day Pass cuesta €${day.flatRate?.toFixed(2)} con viajes ilimitados durante 24 horas. Sin recarga mínima y sin costes ocultos: verás el precio exacto antes de cada viaje.`,
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
      answer: `Not yet — Rido is launching soon in ${city.name} and across the Costa del Sol. Join the waitlist and we'll email you the moment the first vehicles hit the street.`,
    },
    {
      question: `Where will Rido operate in ${city.name}?`,
      answer: `${city.name} is one of Rido's five launch towns on the Costa del Sol, alongside ${others}. Exact riding and parking zones will be shown in the app when the service goes live.`,
    },
    {
      question: `How much will a ride in ${city.name} cost?`,
      answer: `Pay as you go: ${payg.unlockFee} to unlock plus ${payg.perMinute}. The Rido Pass gives you free unlocks at ${pass.perMinute}, and a €${day.flatRate?.toFixed(2)} Day Pass covers unlimited rides for 24 hours. No minimum top-up, no hidden fees — exact pricing is shown before every ride.`,
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
      ? `Rido trae ${noun} compartidos a ${city.name}, en la ${city.region}. Lanzamiento muy pronto: únete a la lista de espera y sé de los primeros en montar. Desde ${payg.unlockFee} por desbloquear + ${payg.perMinute}.`
      : `Rido is bringing shared ${noun} to ${city.name} on the ${city.region}. Launching soon — join the waitlist and be first to ride. From ${payg.unlockFee} unlock + ${payg.perMinute}.`;

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
      locale: locale === "es" ? "es_ES" : "en_ES",
      images: [
        {
          url: "/images/logo/rido-logo-wide.png",
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
      images: ["/images/lifestyle/rido-rider-street.jpg"],
    },
    other: {
      "geo.position": `${city.lat};${city.lng}`,
      "geo.region": "ES-AN",
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
      priceCurrency: "EUR",
      lowPrice: pass.perMinuteValue.toFixed(2),
      highPrice: (day.flatRate ?? 14.99).toFixed(2),
      availability: "https://schema.org/PreOrder",
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
    badge: "Launching soon",
    heroTitle: (city: City) =>
      city.vehicles.length === 2 ? `E-Scooter & E-Bike Sharing in ${city.name}` : `E-Scooter Sharing in ${city.name}`,
    heroBody: (city: City) =>
      `Rido is bringing shared, zero-emission ${vehicleNoun(city, "en")} to ${city.name} on the ${city.region}. Join the waitlist today and be first to ride the moment we launch.`,
    ctaPrimary: "Join the Waitlist",
    ctaSecondary: "Explore Rido",
    vehiclesLabel: "Planned vehicles",
    scooterChip: "E-Scooter",
    bikeChip: "E-Bike",
    coverageHeading: "Where we're launching",
    coverageBody: (city: City) =>
      `${city.name} is one of five launch towns on the Costa del Sol. Explore the full coverage area below.`,
    faqHeading: (city: City) => `Rido in ${city.name} — FAQ`,
    heroAria: (city: City) => `Rido launching soon in ${city.name}`,
    coverageAria: "Rido launch coverage on the Costa del Sol",
    faqAria: (city: City) => `Frequently asked questions about Rido in ${city.name}`,
  },
  es: {
    badge: "Muy pronto",
    heroTitle: (city: City) =>
      city.vehicles.length === 2
        ? `Patinetes y bicis eléctricas compartidas en ${city.name}`
        : `Patinetes eléctricos compartidos en ${city.name}`,
    heroBody: (city: City) =>
      `Rido trae ${vehicleNoun(city, "es")} compartidos y de cero emisiones a ${city.name}, en la ${city.region}. Únete hoy a la lista de espera y sé de los primeros en montar cuando lancemos.`,
    ctaPrimary: "Únete a la lista de espera",
    ctaSecondary: "Descubre Rido",
    vehiclesLabel: "Vehículos previstos",
    scooterChip: "Patinete eléctrico",
    bikeChip: "Bici eléctrica",
    coverageHeading: "Dónde vamos a lanzar",
    coverageBody: (city: City) =>
      `${city.name} es una de las cinco localidades de lanzamiento en la Costa del Sol. Explora la zona de cobertura completa abajo.`,
    faqHeading: (city: City) => `Rido en ${city.name} — Preguntas frecuentes`,
    heroAria: (city: City) => `Rido llega muy pronto a ${city.name}`,
    coverageAria: "Cobertura de lanzamiento de Rido en la Costa del Sol",
    faqAria: (city: City) => `Preguntas frecuentes sobre Rido en ${city.name}`,
  },
} as const;

// --- Page ----------------------------------------------------------------------
export function CityLanding({ city, locale }: { city: City; locale: Locale }) {
  const t = uiCopy[locale];
  const schemas = getCitySchemas(city, locale);
  const faq = getCityFaq(city, locale);
  const homeHref = locale === "es" ? "/es" : "/";

  return (
    <LocaleProvider locale={locale}>
      <Navbar />
      <main id="main-content">
        {schemas.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}

        {/* Compact city hero */}
        <section
          id="city-hero"
          aria-label={t.heroAria(city)}
          className="relative overflow-hidden pt-32 sm:pt-40 pb-12 sm:pb-20 px-4 sm:px-6"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-rido-navy via-rido-navy to-rido-magenta/15 hero-gradient" aria-hidden="true" />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" aria-hidden="true" />
          <div className="absolute top-1/4 -right-24 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-rido-magenta/8 blur-[100px]" aria-hidden="true" />

          <div className="relative max-w-7xl mx-auto text-center">
            <ScrollReveal>
              <Badge variant="magenta" className="mb-5 sm:mb-6">
                <span className="coming-soon-blink">{t.badge}</span>
              </Badge>
            </ScrollReveal>
            <ScrollReveal delay={0.08}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-balance">
                {t.heroTitle(city)}
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.16}>
              <p className="mt-5 sm:mt-6 text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
                {t.heroBody(city)}
              </p>
            </ScrollReveal>

            {/* Vehicle availability chips */}
            <ScrollReveal delay={0.22}>
              <div className="mt-6 flex items-center justify-center gap-2 flex-wrap" aria-label={t.vehiclesLabel}>
                <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-white/40">
                  <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                  {city.name}, {city.region}
                </span>
                {city.vehicles.map((v) => (
                  <Badge key={v} variant={v === "e-scooter" ? "magenta" : "green"} className="cursor-default">
                    {v === "e-scooter" ? (
                      <>
                        <Zap className="w-3 h-3" aria-hidden="true" /> {t.scooterChip}
                      </>
                    ) : (
                      <>
                        <Bike className="w-3 h-3" aria-hidden="true" /> {t.bikeChip}
                      </>
                    )}
                  </Badge>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <a
                  href="#download"
                  className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-rido-magenta text-white font-semibold text-base shadow-[0_8px_30px_rgba(222,4,152,0.35)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(222,4,152,0.5)] hover:brightness-110 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-rido-navy cursor-pointer w-full max-w-[320px] sm:w-auto"
                >
                  <span>{t.ctaPrimary}</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                </a>
                <Link
                  href={homeHref}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white/[0.06] backdrop-blur-xl text-white font-semibold text-base border border-white/15 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18)] transition-all duration-300 ease-out hover:bg-white/[0.1] hover:border-white/25 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-rido-navy cursor-pointer w-full max-w-[320px] sm:w-auto"
                >
                  {t.ctaSecondary}
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <div className="section-divider max-w-7xl mx-auto" />

        {/* Coverage map (shows all launch towns) */}
        <section
          id="coverage"
          aria-label={t.coverageAria}
          className="py-12 sm:py-24 px-4 sm:px-6 relative overflow-hidden"
        >
          <div className="relative max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-16">
              <ScrollReveal>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">{t.coverageHeading}</h2>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <p className="mt-4 text-muted max-w-xl mx-auto">{t.coverageBody(city)}</p>
              </ScrollReveal>
            </div>
            <ScrollReveal delay={0.15}>
              <div className="relative flex justify-center">
                <CoverageMap />
              </div>
            </ScrollReveal>
          </div>
        </section>

        <div className="section-divider max-w-7xl mx-auto" />

        {/* City FAQ */}
        <section
          id="faq"
          aria-label={t.faqAria(city)}
          className="py-12 sm:py-24 px-4 sm:px-6"
        >
          <div className="max-w-3xl mx-auto">
            <ScrollReveal>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-center mb-10 sm:mb-16">
                {t.faqHeading(city)}
              </h2>
            </ScrollReveal>
            <div className="space-y-3 sm:space-y-4">
              {faq.map((item, i) => (
                <ScrollReveal key={item.question} delay={0.06 * i}>
                  <details className="group glass rounded-2xl border border-white/10 px-5 sm:px-6 py-4 transition-colors duration-300 open:border-rido-magenta/30 hover:border-white/20">
                    <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden flex items-center justify-between gap-4 font-semibold text-white min-h-[44px]">
                      <span>{item.question}</span>
                      <ChevronDown className="w-4 h-4 shrink-0 text-rido-magenta transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
                    </summary>
                    <p className="mt-3 text-sm text-muted leading-relaxed">{item.answer}</p>
                  </details>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <div className="section-divider max-w-7xl mx-auto" />

        <DownloadCTA />
      </main>
      <Footer locale={locale} />
      <BackToTop />
    </LocaleProvider>
  );
}
