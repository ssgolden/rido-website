import { vehicles } from "@/data/vehicles";
import { pricingTiers } from "@/data/pricing";
import { announcedCities, primaryCity, regionsWithUnannouncedTowns } from "@/data/cities";
import { APP_STORE_ID, PLAY_PACKAGE, storeListingName, storeUrl } from "@/data/apps";
import { faqItemsByLocale } from "@/data/faq";
import type { Locale } from "@/lib/i18n/config";
import { SITE_LAST_MODIFIED, SITE_ORIGIN } from "@/lib/site";

const baseUrl = SITE_ORIGIN;

/**
 * Centralized JSON-LD structured data for SEO and AI engines.
 * All schemas are injected into the <head> via the locale root layouts.
 *
 * June 2026 best practices applied:
 * - Schema.org v28+ types where available
 * - AI-search optimized descriptions and entity relationships
 * - Consistent @id / sameAs graph for knowledge panel consolidation
 * - Multi-city Service + Place markup
 * - CarbonFootprint for sustainability claims
 * - MerchantListing / VehicleListing hints for future marketplace expansion
 */

// --- Shared entities referenced by @id --------------------------------------
const orgId = `${baseUrl}/#organization`;
const brandId = `${baseUrl}/#brand`;
const websiteId = `${baseUrl}/#website`;
const logoUrl = `${baseUrl}/images/logo/rido-logo.png`;
// Real product photo. The lifestyle/ "rider-street" files are the wordmark, not a photo.
const heroImage = `${baseUrl}/images/scooter/rido-scooter-product.jpg`;

// --- Organization / Brand graph -------------------------------------------
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": orgId,
  name: "Go2 Place S.L.",
  alternateName: "Rido",
  url: baseUrl,
  logo: {
    "@type": "ImageObject",
    url: logoUrl,
    width: 512,
    height: 512,
    caption: "Rido logo",
  },
  image: heroImage,
  foundingDate: "2025",
  email: "info@rido.bike",
  sameAs: [
    // Add real profiles when live; placeholders removed to avoid dead links
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: "Calle Eneldo 3, C4, local 22",
    addressLocality: "Orihuela Costa",
    addressRegion: "Alicante",
    postalCode: "03189",
    addressCountry: "ES",
  },
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
    "Spain mobility",
    "Costa Blanca transport",
    "Costa del Sol transport",
  ],
};

export const brandSchema = {
  "@context": "https://schema.org",
  "@type": "Brand",
  "@id": brandId,
  name: "Rido",
  description:
    "Rido is a shared e-scooter micro-mobility brand, live in Torrevieja on the Costa Blanca, Spain, with the Costa del Sol to follow.",
  logo: logoUrl,
  url: baseUrl,
  parentOrganization: { "@id": orgId },
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

export const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${baseUrl}/`,
  name: "Rido — Shared E-Scooters in Torrevieja, Costa Blanca, Spain",
  description:
    "Shared e-scooters, live now in Torrevieja on the Costa Blanca, with the Costa del Sol to follow. Download the Rido app on the App Store or Google Play and ride today. Zero emissions, zero hassle.",
  url: baseUrl,
  isPartOf: { "@id": websiteId },
  about: { "@id": brandId },
  inLanguage: "en",
  dateModified: SITE_LAST_MODIFIED,
  primaryImageOfPage: heroImage,
};

// --- LocalBusiness + AreaServed ---------------------------------------------
export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${baseUrl}/#localbusiness`,
  name: "Rido",
  alternateName: "Go2 Place S.L.",
  description:
    "Shared e-scooters, live in Torrevieja on the Costa Blanca, Spain, with the Costa del Sol to follow. Zero-emission micro-mobility via the Rido app for iPhone and Android.",
  url: baseUrl,
  logo: logoUrl,
  image: heroImage,
  email: "info@rido.bike",
  // No priceRange: fares are shown in the app, not on the site.
  currenciesAccepted: "EUR",
  paymentAccepted: "Credit Card, Apple Pay, Google Pay, Debit Card",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Calle Eneldo 3, C4, local 22",
    addressLocality: "Orihuela Costa",
    addressRegion: "Alicante",
    postalCode: "03189",
    addressCountry: "ES",
  },
  ...(primaryCity
    ? {
        geo: {
          "@type": "GeoCoordinates",
          latitude: primaryCity.lat,
          longitude: primaryCity.lng,
        },
        hasMap: `https://www.google.com/maps/place/${encodeURIComponent(primaryCity.name)},+Spain`,
      }
    : {}),
  // Announced towns by name; regions with unannounced towns by region only.
  areaServed: [
    ...announcedCities.map((city) => ({
      "@type": "City",
      name: city.name,
      containedInPlace: { "@type": "AdministrativeArea", name: city.region },
    })),
    ...regionsWithUnannouncedTowns.map((region) => ({ "@type": "AdministrativeArea", name: region })),
  ],
  serviceType: ["E-Scooter Rental"],
  potentialAction: {
    "@type": "DownloadAction",
    target: [storeUrl.ios, storeUrl.android],
    name: "Get the Rido app",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Rido Vehicle Rentals",
    // Fares live in the app: plan names only, no per-offer prices.
    itemListElement: pricingTiers.map((tier) => ({
      "@type": "Offer",
      name: tier.name,
      description: tier.description,
      availability: "https://schema.org/InStock",
      itemOffered: {
        "@type": "Service",
        name: "E-Scooter Rental",
        provider: { "@id": `${baseUrl}/#localbusiness` },
      },
    })),
  },
};

// --- HowTo ------------------------------------------------------------------
export const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Ride a Rido E-Scooter",
  description:
    "A step-by-step guide to downloading the app, then finding, unlocking, riding and parking a Rido shared e-scooter.",
  totalTime: "PT15M",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Download Rido",
      text: "Get the free Rido app on the App Store or Google Play and create your account in seconds.",
      url: `${baseUrl}/#download`,
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Scan & Unlock",
      text: "Find a Rido nearby on the map, scan the QR code on the handlebar, and you're ready to roll.",
      url: `${baseUrl}/#how-it-works`,
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Ride & Enjoy",
      text: "Follow traffic rules, use bike lanes, and enjoy the ride. Helmets are mandatory for e-scooter riders in Spain, and one is included with every scooter.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Park & End Ride",
      text: "Park responsibly in designated areas shown in the app. End your ride and pay only for what you used.",
    },
  ],
};

// --- Products / Vehicles ----------------------------------------------------
export const productSchemas = vehicles.map((vehicle) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": `${baseUrl}/#product-${vehicle.id}`,
  name: vehicle.name,
  description: vehicle.description,
  category: vehicle.type === "e-scooter" ? "Electric Scooter" : "Electric Bike",
  brand: { "@id": brandId },
  manufacturer: { "@id": orgId },
  image: `${baseUrl}${vehicle.image}`,
  offers: {
    "@type": "AggregateOffer",
    // The scooter rides in Torrevieja now; the e-bike comes later.
    availability: vehicle.type === "e-scooter" ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
    // No lowPrice/highPrice: fares are shown in the app.
    offerCount: pricingTiers.length.toString(),
  },
  additionalProperty: vehicle.specs.map((spec) => ({
    "@type": "PropertyValue",
    name: spec.label,
    value: spec.value,
  })),
  isRelatedTo: { "@id": `${baseUrl}/#localbusiness` },
}));

// --- Rider app (live in both stores) ----------------------------------------
export const mobileAppSchemas = (["ios", "android"] as const).map((store) => ({
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  "@id": `${baseUrl}/#app-${store}`,
  name: storeListingName[store],
  operatingSystem: store === "ios" ? "iOS" : "Android",
  applicationCategory: "TravelApplication",
  url: storeUrl[store],
  ...(store === "ios" ? { identifier: APP_STORE_ID } : { identifier: PLAY_PACKAGE }),
  installUrl: storeUrl[store],
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  publisher: { "@id": orgId },
  description: "Find, unlock and pay for Rido shared e-scooters nearby, with a real-time map.",
}));

// --- Breadcrumbs -----------------------------------------------------------
export const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${baseUrl}/#breadcrumbs`,
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
    { "@type": "ListItem", position: 2, name: "How It Works", item: `${baseUrl}/#how-it-works` },
    { "@type": "ListItem", position: 3, name: "Vehicles", item: `${baseUrl}/#vehicles` },
    { "@type": "ListItem", position: 4, name: "Cities", item: `${baseUrl}/#cities` },
    { "@type": "ListItem", position: 5, name: "FAQ", item: `${baseUrl}/#faq` },
  ],
};

// --- Speakable (voice/AI search) ------------------------------------------
export const speakableSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${baseUrl}/#speakable`,
  name: "Rido — Shared E-Scooters in Torrevieja, Costa Blanca, Spain",
  url: baseUrl,
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["#how-it-works h2, #how-it-works h3", "#safety h2, #safety h4", "#faq h2, #faq button"],
  },
};

// --- Services per city ------------------------------------------------------
// One Service per announced town, plus one region-level Service for each
// region whose towns are not announced yet (no town names reach JSON-LD).
export const cityServiceSchemas = [
  ...announcedCities.map((city) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${baseUrl}/#service-${city.slug}`,
    serviceType: city.vehicles.length === 2 ? "E-Scooter & E-Bike Rental" : "E-Scooter Rental",
    provider: { "@id": `${baseUrl}/#localbusiness` },
    areaServed: {
      "@type": "Place",
      name: city.name,
      geo: { "@type": "GeoCoordinates", latitude: city.lat, longitude: city.lng },
      containedInPlace: {
        "@type": "City",
        name: city.name,
        containedInPlace: { "@type": "AdministrativeArea", name: city.region },
      },
    },
    description: `Shared ${city.vehicles.map((v) => (v === "e-scooter" ? "e-scooter" : "e-bike")).join(" and ")} rental in ${city.name}, ${city.region}. ${city.comingSoon ? "Launching in the coming weeks." : "Live now."}`,
    offers: {
      "@type": "AggregateOffer",
      availability: city.comingSoon ? "https://schema.org/PreOrder" : "https://schema.org/InStock",
      // No lowPrice/highPrice: fares are shown in the app.
    },
  })),
  ...regionsWithUnannouncedTowns.map((region) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${baseUrl}/#service-${region.toLowerCase().replace(/\s+/g, "-")}`,
    serviceType: "E-Scooter & E-Bike Rental",
    provider: { "@id": `${baseUrl}/#localbusiness` },
    areaServed: { "@type": "AdministrativeArea", name: region },
    description: `Shared e-scooter and e-bike rental on the ${region}, Spain. Launch locations announced soon.`,
    offers: {
      "@type": "AggregateOffer",
      availability: "https://schema.org/PreOrder",
    },
  })),
];

// --- FAQPage ---------------------------------------------------------------
export function getFaqSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": locale === "es" ? `${baseUrl}/es#faq` : `${baseUrl}/#faq`,
    inLanguage: locale,
    mainEntity: faqItemsByLocale[locale].map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

// --- CarbonFootprint / sustainability ---------------------------------------
export const sustainabilitySchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${baseUrl}/#sustainability`,
  name: "Rido Sustainability",
  url: `${baseUrl}/#safety`,
  knowsAbout: [
    "Carbon neutral operations",
    "Swappable electric vehicle batteries",
    "Micromobility emissions reduction",
    "Vehicle recycling",
  ],
  // Pre-launch: commitments, not audited results. No credential markup until
  // a real certification exists.
  description:
    "Rido commits to offsetting 100% of operational emissions through verified carbon credits, to swappable and recycled batteries, and to recycling every vehicle at end of life. Audited impact figures will be published after the first year of operation.",
};

/**
 * JSON-LD that describes the whole site: rendered on every page by the root
 * layout (RootDocument). Kept small, because each block is also serialised
 * into the page's RSC payload.
 */
export function getSiteSchemas() {
  return [organizationSchema, brandSchema, websiteSchema, localBusinessSchema];
}

/**
 * JSON-LD for the homepage only (EN at /, ES at /es): its FAQ, how-to,
 * products and services describe content visible on that page, as Google's
 * structured-data guidelines require. Town pages emit their own Service and
 * FAQPage. No JobPosting (no open roles), no SearchAction (no site search).
 */
export function getHomeSchemas(locale: Locale = "en") {
  return [
    webPageSchema,
    howToSchema,
    breadcrumbSchema,
    speakableSchema,
    getFaqSchema(locale),
    sustainabilitySchema,
    ...productSchemas,
    ...cityServiceSchemas,
    ...mobileAppSchemas,
  ];
}
