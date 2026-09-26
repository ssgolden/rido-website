import { vehicles } from "@/data/vehicles";
import { pricingTiers } from "@/data/pricing";
import { cities, citiesAnnounced } from "@/data/cities";
import { SITE_LAST_MODIFIED, SITE_ORIGIN } from "@/lib/site";

const baseUrl = SITE_ORIGIN;

/**
 * Centralized JSON-LD structured data for SEO and AI engines.
 * All schemas are injected into the <head> via layout.tsx.
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
const heroImage = `${baseUrl}/images/lifestyle/rido-rider-street.jpg`;

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
  parentOrganization: { "@id": orgId },
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": websiteId,
  name: "Rido",
  url: baseUrl,
  publisher: { "@id": orgId },
  inLanguage: "en",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${baseUrl}/?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${baseUrl}/`,
  name: "Rido — Shared E-Scooters & E-Bikes on the Costa del Sol, Spain",
  description: citiesAnnounced
    ? "Shared e-scooters and e-bikes coming to the Costa del Sol, Spain. Join the Rido waitlist and be first to ride in Marbella, Estepona, and more. Zero emissions, zero hassle."
    : "Shared e-scooters and e-bikes coming to the Costa del Sol, Spain. Launch cities announced soon — join the Rido waitlist and be first to ride. Zero emissions, zero hassle.",
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
    "Shared e-scooters and e-bikes on the Costa del Sol, Spain. Zero-emission micro-mobility available via mobile app. Launching 2026.",
  url: baseUrl,
  logo: logoUrl,
  image: heroImage,
  email: "info@rido.bike",
  // Pre-launch: priceRange removed until fares are public.
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
  geo: {
    "@type": "GeoCoordinates",
    latitude: 36.5099,
    longitude: -4.8862,
  },
  hasMap: citiesAnnounced
    ? "https://www.google.com/maps/place/Marbella,+M%C3%A1laga,+Spain"
    : "https://www.google.com/maps/place/Costa+del+Sol,+Spain",
  // Pre-announcement, the served area is the region only — no town names.
  areaServed: citiesAnnounced
    ? cities.map((city) => ({
        "@type": "City",
        name: city.name,
        containedInPlace: {
          "@type": "AdministrativeArea",
          name: city.region,
        },
      }))
    : [{ "@type": "AdministrativeArea", name: "Costa del Sol" }],
  serviceType: ["E-Scooter Rental", "E-Bike Rental"],
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "00:00",
    closes: "23:59",
  },
  potentialAction: {
    "@type": "ReserveAction",
    target: `${baseUrl}/#download`,
    name: "Join Waitlist",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Rido Vehicle Rentals",
    // Pre-launch: prices not yet public. List plan names only — no per-offer prices.
    itemListElement: pricingTiers.map((tier) => ({
      "@type": "Offer",
      name: tier.name,
      description: tier.description,
      availability: "https://schema.org/PreOrder",
      itemOffered: {
        "@type": "Service",
        name: "E-Scooter & E-Bike Rental",
        provider: { "@id": `${baseUrl}/#localbusiness` },
      },
    })),
  },
};

// --- HowTo ------------------------------------------------------------------
export const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Ride a Rido E-Scooter or E-Bike",
  description:
    "A step-by-step guide to finding, unlocking, riding, and parking a Rido shared e-scooter or e-bike on the Costa del Sol.",
  totalTime: "PT15M",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Sign Up Early",
      text: "Join the waitlist and be first in line when the Rido app launches. Create your account in seconds when it's ready.",
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
      text: "Follow traffic rules, use bike lanes, and enjoy the ride. Helmet recommended for your safety.",
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
    availability: "https://schema.org/PreOrder",
    // Pre-launch: prices not yet public — no lowPrice/highPrice until announcement.
    offerCount: pricingTiers.length.toString(),
  },
  additionalProperty: vehicle.specs.map((spec) => ({
    "@type": "PropertyValue",
    name: spec.label,
    value: spec.value,
  })),
  isRelatedTo: { "@id": `${baseUrl}/#localbusiness` },
}));

// --- SoftwareApplication / App --------------------------------------------
export const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${baseUrl}/#app`,
  name: "Rido",
  applicationCategory: "TravelApplication",
  operatingSystem: "iOS, Android",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
  },
  description:
    "Find, unlock, and ride shared e-scooters and e-bikes on the Costa del Sol. Scan QR codes, track rides, and pay per minute.",
  publisher: { "@id": orgId },
  featureList: [
    "Find vehicles near you on the map",
    "Scan QR code to unlock",
    "Real-time battery levels",
    "Pricing shown before every ride",
    "Helmet rewards program",
    "Beginner mode (15 km/h)",
    "Tandem detection",
  ],
};

// --- Breadcrumbs -----------------------------------------------------------
export const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${baseUrl}/#breadcrumbs`,
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
    { "@type": "ListItem", position: 2, name: "How It Works", item: `${baseUrl}/#how-it-works` },
    { "@type": "ListItem", position: 3, name: "Vehicles", item: `${baseUrl}/#vehicles` },
    { "@type": "ListItem", position: 4, name: "Pricing", item: `${baseUrl}/#pricing` },
    { "@type": "ListItem", position: 5, name: "Cities", item: `${baseUrl}/#cities` },
  ],
};

// --- Speakable (voice/AI search) ------------------------------------------
export const speakableSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${baseUrl}/#speakable`,
  name: "Rido — Shared E-Scooters & E-Bikes in Spain",
  url: baseUrl,
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["#how-it-works h2, #how-it-works h3", "#pricing h2, #pricing h3", "#faq h2, #faq button"],
  },
};

// --- Services per city ------------------------------------------------------
// Pre-announcement (citiesAnnounced === false) the per-town Service nodes are
// replaced by a single region-level Service so no town name reaches JSON-LD.
export const cityServiceSchemas = citiesAnnounced
  ? cities.map((city) => ({
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${baseUrl}/#service-${city.slug}`,
      serviceType:
        city.vehicles.length === 2 ? "E-Scooter & E-Bike Rental" : "E-Scooter Rental",
      provider: { "@id": `${baseUrl}/#localbusiness` },
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
      description: `Shared ${city.vehicles
        .map((v) => (v === "e-scooter" ? "e-scooter" : "e-bike"))
        .join(" and ")} rental in ${city.name}, ${city.region}. Coming soon.`,
      offers: {
        "@type": "AggregateOffer",
        availability: "https://schema.org/PreOrder",
        // Pre-launch: prices not yet public — no lowPrice/highPrice until announcement.
      },
    }))
  : [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        "@id": `${baseUrl}/#service-costa-del-sol`,
        serviceType: "E-Scooter & E-Bike Rental",
        provider: { "@id": `${baseUrl}/#localbusiness` },
        areaServed: { "@type": "AdministrativeArea", name: "Costa del Sol" },
        description:
          "Shared e-scooter and e-bike rental on the Costa del Sol, Spain. First launch locations announced soon.",
        offers: {
          "@type": "AggregateOffer",
          availability: "https://schema.org/PreOrder",
          // Pre-launch: prices not yet public — no lowPrice/highPrice until announcement.
        },
      },
    ];

// --- FAQPage ---------------------------------------------------------------
import { faqItems } from "@/data/faq";

export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${baseUrl}/#faq`,
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

// --- CarbonFootprint / sustainability ---------------------------------------
export const sustainabilitySchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${baseUrl}/#sustainability`,
  name: "Rido Sustainability",
  url: `${baseUrl}/#sustainability`,
  knowsAbout: [
    "Carbon neutral operations",
    "Swappable electric vehicle batteries",
    "Micromobility emissions reduction",
    "Vehicle recycling",
  ],
  hasCredential: [
    {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "EnvironmentalClaim",
      name: "Carbon-neutral operations via verified carbon credits",
    },
  ],
  description:
    "Rido offsets 100% of operational emissions through verified carbon credits, uses swappable and recycled batteries, and recycles every vehicle at end of life.",
};

/**
 * Returns all JSON-LD scripts as an array of objects for rendering in <head>.
 * No JobPosting: /careers does not list roles.
 */
export function getAllSchemas() {
  return [
    organizationSchema,
    brandSchema,
    websiteSchema,
    webPageSchema,
    localBusinessSchema,
    howToSchema,
    breadcrumbSchema,
    speakableSchema,
    softwareApplicationSchema,
    faqSchema,
    sustainabilitySchema,
    ...productSchemas,
    ...cityServiceSchemas,
  ];
}
