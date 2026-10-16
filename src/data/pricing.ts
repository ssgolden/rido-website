import type { Locale } from "@/lib/i18n/config";

/** A user-visible string pair — the type forces EN and ES to stay in sync. */
interface LocalizedString {
  en: string;
  es: string;
}

/** Stable, locale-independent tier identifier (use for keys and per-tier logic). */
export type PricingTierId = "pay-as-you-go" | "rido-pass" | "day-pass";

export interface PricingTier {
  id: PricingTierId;
  name: string;
  description: string;
  popular?: boolean;
}

interface PricingTierSource extends Omit<PricingTier, "name" | "description"> {
  name: LocalizedString;
  description: LocalizedString;
}

/**
 * Single source of truth for the pricing tiers. Both locales live side by
 * side so copy can never drift.
 *
 * Pre-launch: NO fare amounts live in this repo. Every surface (Pricing
 * section, FAQ, city pages, JSON-LD, llms.txt) says "announced at launch".
 * Add price fields back here only once the amounts are public.
 */
const tierSources: readonly PricingTierSource[] = [
  {
    id: "pay-as-you-go",
    name: { en: "Pay as you go", es: "Paga por uso" },
    description: {
      en: "No commitment. Ride when you need it.",
      es: "Sin compromiso. Rueda cuando lo necesites.",
    },
  },
  {
    id: "rido-pass",
    name: { en: "Rido Pass", es: "Rido Pass" },
    description: {
      en: "Unlimited unlocks + reduced per-minute rate.",
      es: "Desbloqueos ilimitados + tarifa por minuto reducida.",
    },
    popular: true,
  },
  {
    id: "day-pass",
    name: { en: "Day Pass", es: "Pase diario" },
    description: {
      en: "Unlimited rides for 24 hours.",
      es: "Trayectos ilimitados durante 24 horas.",
    },
  },
];

function resolveTiers(locale: Locale): PricingTier[] {
  return tierSources.map((tier) => ({
    ...tier,
    name: tier.name[locale],
    description: tier.description[locale],
  }));
}

/** Per-locale pricing tiers — `Record<Locale, ...>` forces every locale to exist. */
export const pricingTiersByLocale: Record<Locale, PricingTier[]> = {
  en: resolveTiers("en"),
  es: resolveTiers("es"),
};

/**
 * Canonical English list. Kept as the default export shape so the JSON-LD
 * offer catalog (src/lib/schema.ts) keeps emitting English on the EN page.
 */
export const pricingTiers: PricingTier[] = pricingTiersByLocale.en;
