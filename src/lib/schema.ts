import { vehicles, getVehicleCopy } from "@/data/vehicles";
import { pricingTiersByLocale } from "@/data/pricing";
import { faqItemsByLocale } from "@/data/faq";
import { cities, citiesAnnounced } from "@/data/cities";
import type { Locale } from "@/lib/i18n/config";

const baseUrl = "https://rido.bike";

/**
 * JSON-LD structured data.
 *
 * Two tiers:
 *  - getSiteSchemas()        → Organization / Brand / WebSite / LocalBusiness.
 *                              Injected once by the root layout on every page.
 *  - getHomeSchemas(locale)  → WebPage / FAQPage / Product / Service for the
 *                              EN and ES home pages, in that page's language.
 *
 * Honesty rules (pre-launch): nothing here may assert a rating, a price, a
 * job opening, an app-store listing, a certification, or an operating claim
 * that the visible site does not make. Google treats placeholder JobPosting,
 * SearchAction (sitelinks searchbox) and rating markup as spam signals.
 */

// --- Shared entities referenced by @id --------------------------------------
const orgId = `${baseUrl}/#organization`;
const brandId = `${baseUrl}/#brand`;
const websiteId = `${baseUrl}/#website`;
const localBusinessId = `${baseUrl}/#localbusiness`;
const logoUrl = `${baseUrl}/images/logo/rido-logo.png`;
const heroImage = `${baseUrl}/images/og/rido-og.png`;

const postalAddress = {
  "@type": "PostalAddress",
  streetAddress: "Calle Eneldo 3, C4, local 22",
  addressLocality: "Orihuela Costa",
  addressRegion: "Alicante",
  postalCode: "03189",
  addressCountry: "ES",
};

const areaServed = citiesAnnounced
  ? cities.map((city) => ({
      "@type": "City",
      name: city.name,
      containedInPlace: { "@type": "AdministrativeArea", name: city.region },
    }))
  : [{ "@type": "AdministrativeArea", name: "Costa del Sol" }];

// --- Organization / Brand / WebSite -----------------------------------------
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": orgId,
  name: "Go2 Place S.L.",
  alternateName: "Rido",
  legalName: "Go2 Place S.L.",
  vatID: "ESB01745405",
  url: baseUrl,
  logo: {
    "@type": "ImageObject",
    url: logoUrl,
    width: 500,
    height: 246,
    caption: "Rido logo",
  },
  image: heroImage,
  foundingDate: "2025",
  email: "info@rido.bike",
  address: postalAddress,
  contactPoint: {
    "@type": "ContactPoint",
    email: "info@rido.bike",
    contactType: "customer service",
    availableLanguage: ["English", "Spanish"],
  },
  knowsAbout: [
    "E-scooter sharing",
    "E-bike sharing",
    "Micro-mobility",
    "Shared mobility",
    "Sustainable transport",
    "Electric vehicles",
    "Costa del Sol transport",
  ],
};

export const brandSchema = {
  "@context": "https://schema.org",
  "@type": "Brand",
  "@id": brandId,
  name: "Rido",
  description:
    "Rido is a shared e-scooter and e-bike micro-mobility brand launching on the Costa del Sol, Spain.",
  logo: logoUrl,
  url: baseUrl,
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": websiteId,
  name: "Rido",
  url: baseUrl,
  publisher: { "@id": orgId },
  inLanguage: ["en", "es"],
};

// --- LocalBusiness -----------------------------------------------------------
export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": localBusinessId,
  name: "Rido",
  alternateName: "Go2 Place S.L.",
  description:
    "Shared e-scooters and e-bikes on the Costa del Sol, Spain. Zero-emission micro-mobility via mobile app. Launching 2026.",
  url: baseUrl,
  logo: logoUrl,
  image: heroImage,
  email: "info@rido.bike",
  address: postalAddress,
  areaServed,
  serviceType: ["E-Scooter Rental", "E-Bike Rental"],
  parentOrganization: { "@id": orgId },
  brand: { "@id": brandId },
  potentialAction: {
    "@type": "RegisterAction",
    target: `${baseUrl}/#download`,
    name: "Join Waitlist",
  },
};

/** Site-wide nodes, injected by the root layout on every page. */
export function getSiteSchemas() {
  return [organizationSchema, brandSchema, websiteSchema, localBusinessSchema];
}

// --- Home page nodes (per locale) -------------------------------------------
const homeCopy = {
  en: {
    url: baseUrl,
    name: "Rido — Shared E-Scooters & E-Bikes on the Costa del Sol, Spain",
    description: citiesAnnounced
      ? "Shared e-scooters and e-bikes coming to the Costa del Sol, Spain. Join the Rido waitlist and be first to ride in Marbella, Estepona, and more. Zero emissions, zero hassle."
      : "Shared e-scooters and e-bikes coming to the Costa del Sol, Spain. Launch cities announced soon — join the Rido waitlist and be first to ride. Zero emissions, zero hassle.",
    serviceType: "E-Scooter & E-Bike Rental",
    serviceDescription:
      "Shared e-scooter and e-bike rental on the Costa del Sol, Spain. First launch locations announced soon.",
    catalogName: "Rido plans",
    serviceName: "E-Scooter & E-Bike Rental",
    categories: { "e-scooter": "Electric Scooter", "e-bike": "Electric Bike" },
  },
  es: {
    url: `${baseUrl}/es`,
    name: "Rido — Patinetes y bicicletas eléctricas compartidas en la Costa del Sol",
    description: citiesAnnounced
      ? "Patinetes y bicicletas eléctricas compartidas llegan a la Costa del Sol. Únete a la lista de espera de Rido y sé de los primeros en montar en Marbella, Estepona y más. Cero emisiones, cero complicaciones."
      : "Patinetes y bicicletas eléctricas compartidas llegan a la Costa del Sol. Las ciudades de lanzamiento se anunciarán muy pronto — únete a la lista de espera de Rido y sé de los primeros en montar. Cero emisiones, cero complicaciones.",
    serviceType: "Alquiler de patinetes y bicicletas eléctricas",
    serviceDescription:
      "Alquiler compartido de patinetes y bicicletas eléctricas en la Costa del Sol. Las primeras ubicaciones se anunciarán muy pronto.",
    catalogName: "Planes de Rido",
    serviceName: "Alquiler de patinetes y bicicletas eléctricas",
    categories: { "e-scooter": "Patinete eléctrico", "e-bike": "Bicicleta eléctrica" },
  },
} as const satisfies Record<Locale, unknown>;

/** Page-level nodes for the EN or ES home page. */
export function getHomeSchemas(locale: Locale) {
  const c = homeCopy[locale];
  const pageId = `${c.url}#webpage`;

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": pageId,
    url: c.url,
    name: c.name,
    description: c.description,
    isPartOf: { "@id": websiteId },
    about: { "@id": brandId },
    inLanguage: locale,
    primaryImageOfPage: heroImage,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["#hero h1", "#how-it-works h2", "#faq h2"],
    },
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${c.url}#faq`,
    inLanguage: locale,
    mainEntity: faqItemsByLocale[locale].map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const products = vehicles.map((vehicle) => {
    const copy = getVehicleCopy(vehicle, locale);
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${c.url}#product-${vehicle.id}`,
      name: vehicle.name,
      description: copy.description,
      category: c.categories[vehicle.type],
      brand: { "@id": brandId },
      image: `${baseUrl}${vehicle.image}`,
      // Pre-launch: no price until fares are announced.
      offers: {
        "@type": "Offer",
        availability: "https://schema.org/PreOrder",
        seller: { "@id": localBusinessId },
      },
      additionalProperty: copy.specs.map((spec) => ({
        "@type": "PropertyValue",
        name: spec.label,
        value: spec.value,
      })),
    };
  });

  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${c.url}#service`,
    name: c.serviceName,
    serviceType: c.serviceType,
    provider: { "@id": localBusinessId },
    areaServed,
    description: c.serviceDescription,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: c.catalogName,
      // Pre-launch: plan names only — no per-offer prices.
      itemListElement: pricingTiersByLocale[locale].map((tier) => ({
        "@type": "Offer",
        name: tier.name,
        description: tier.description,
        availability: "https://schema.org/PreOrder",
      })),
    },
  };

  return [webPage, faq, ...products, service];
}
