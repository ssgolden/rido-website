import { vehicles } from "@/data/vehicles";
import { pricingTiers } from "@/data/pricing";
import { cities } from "@/data/cities";

const baseUrl = "https://rido.bike";

/**
 * Centralized JSON-LD structured data for SEO and AI engines.
 * All schemas are injected into the <head> via layout.tsx.
 */

// Organization schema (parent company)
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Go2 Place S.L.",
  alternateName: "Rido",
  url: baseUrl,
  logo: `${baseUrl}/images/logo/rido-logo.png`,
  foundingDate: "2025",
  email: "info@rido.bike",
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
  },
  knowsAbout: [
    "E-scooter sharing",
    "E-bike sharing",
    "Micro-mobility",
    "Shared mobility",
    "Sustainable transport",
    "Electric vehicles",
    "Spain mobility",
  ],
};

// Enhanced LocalBusiness schema
export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Rido",
  alternateName: "Go2 Place S.L.",
  description:
    "Shared e-scooters and e-bikes on the Costa del Sol, Spain. Zero-emission micro-mobility available via mobile app.",
  url: baseUrl,
  logo: `${baseUrl}/images/logo/rido-logo.png`,
  image: `${baseUrl}/images/lifestyle/rido-rider-street.jpg`,
  email: "info@rido.bike",
  telephone: undefined,
  priceRange: "€€",
  currenciesAccepted: "EUR",
  paymentAccepted: "Credit Card, Apple Pay, Google Pay",
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
  hasMap: "https://www.google.com/maps/place/Marbella",
  areaServed: cities.map((city) => ({
    "@type": "City",
    name: city.name,
  })),
  serviceType: ["E-Scooter Rental", "E-Bike Rental"],
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "00:00",
    closes: "23:59",
  },
  potentialAction: {
    "@type": "ReserveAction",
    target: `${baseUrl}#download`,
    name: "Join Waitlist",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Rido Vehicle Rentals",
    itemListElement: pricingTiers.map((tier) => ({
      "@type": "Offer",
      name: tier.name,
      description: tier.description,
      priceSpecification: tier.flatRate
        ? {
            "@type": "PriceSpecification",
            price: tier.flatRate,
            priceCurrency: "EUR",
          }
        : {
            "@type": "UnitPriceSpecification",
            priceCurrency: "EUR",
            price: tier.perMinuteValue,
            referenceQuantity: {
              "@type": "QuantitativeValue",
              value: "1",
              unitCode: "MIN",
            },
          },
      itemOffered: {
        "@type": "Service",
        name: "E-Scooter & E-Bike Rental",
        description: `Unlock: ${tier.unlockFee}, Per minute: ${tier.perMinute}`,
      },
    })),
  },
};

// HowTo schema for How It Works
export const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Ride a Rido E-Scooter or E-Bike",
  description:
    "A step-by-step guide to finding, unlocking, riding, and parking a Rido shared e-scooter or e-bike.",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Sign Up Early",
      text: "Join the waitlist and be first in line when the Rido app launches. Create your account in seconds when it's ready.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Scan & Unlock",
      text: "Find a Rido nearby on the map, scan the QR code on the handlebar, and you're ready to roll.",
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
  totalTime: "PT15M",
};

// Product schema for each vehicle
export const productSchemas = vehicles.map((vehicle) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: vehicle.name,
  description: vehicle.description,
  category: vehicle.type === "e-scooter" ? "Electric Scooter" : "Electric Bike",
  brand: { "@type": "Brand", name: "Rido" },
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "EUR",
    lowPrice: "0.25",
    highPrice: "0.35",
    offerCount: "2",
  },
  additionalProperty: vehicle.specs.map((spec) => ({
    "@type": "PropertyValue",
    name: spec.label,
    value: spec.value,
  })),
}));

// SoftwareApplication schema for the app
export const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
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
  publisher: {
    "@type": "Organization",
    name: "Go2 Place S.L.",
  },
  featureList: [
    "Find vehicles near you on the map",
    "Scan QR code to unlock",
    "Real-time battery levels",
    "Pricing shown before every ride",
    "Helmet rewards program",
    "Beginner mode (15 km/h)",
  ],
};

// BreadcrumbList for homepage sections
export const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: baseUrl,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "How It Works",
      item: `${baseUrl}#how-it-works`,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Vehicles",
      item: `${baseUrl}#vehicles`,
    },
    {
      "@type": "ListItem",
      position: 4,
      name: "Pricing",
      item: `${baseUrl}#pricing`,
    },
    {
      "@type": "ListItem",
      position: 5,
      name: "Cities",
      item: `${baseUrl}#cities`,
    },
  ],
};

// Speakable schema for voice search optimization
export const speakableSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Rido — Shared E-Scooters & E-Bikes in Spain",
  url: baseUrl,
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["#how-it-works h3", "#pricing .text-4xl", "#faq button"],
  },
};

// Service schema per city
export const cityServiceSchemas = cities.map((city) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType:
    city.vehicles.join(", ") === "e-scooter, e-bike"
      ? "E-Scooter & E-Bike Rental"
      : "E-Scooter Rental",
  provider: { "@type": "Organization", name: "Rido" },
  areaServed: {
    "@type": "City",
    name: city.name,
  },
  description: `Shared ${city.vehicles
    .join(" and ")
    .replace("e-scooter", "e-scooter")
    .replace("e-bike", "e-bike")} rental in ${city.name}, ${city.region}. Coming soon.`,
}));

/**
 * Returns all JSON-LD scripts as an array of objects for rendering in <head>.
 */
export function getAllSchemas() {
  return [
    organizationSchema,
    localBusinessSchema,
    howToSchema,
    breadcrumbSchema,
    speakableSchema,
    softwareApplicationSchema,
    ...productSchemas,
    ...cityServiceSchemas,
  ];
}