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
  unlockFee: string;
  perMinute: string;
  /** Numeric unlock fee in EUR (0 = free) */
  unlockFeeValue: number;
  /** Numeric per-minute rate in EUR (0 = included) */
  perMinuteValue: number;
  /** Flat rate for the tier in EUR (null = per-minute billing) */
  flatRate?: number;
  popular?: boolean;
}

interface PricingTierSource extends Omit<PricingTier, "name" | "description" | "unlockFee" | "perMinute"> {
  name: LocalizedString;
  description: LocalizedString;
  unlockFee: LocalizedString;
  perMinute: LocalizedString;
}

/**
 * Single source of truth for the pricing tiers. Both locales live side by
 * side so copy can never drift; prices and currency are identical everywhere.
 */
const tierSources: readonly PricingTierSource[] = [
  {
    id: "pay-as-you-go",
    name: { en: "Pay as you go", es: "Paga por uso" },
    description: {
      en: "No commitment. Ride when you need it.",
      es: "Sin compromiso. Rueda cuando lo necesites.",
    },
    unlockFee: { en: "€1.00", es: "€1.00" },
    perMinute: { en: "€0.35/min", es: "€0.35/min" },
    unlockFeeValue: 1.0,
    perMinuteValue: 0.35,
  },
  {
    id: "rido-pass",
    name: { en: "Rido Pass", es: "Rido Pass" },
    description: {
      en: "Unlimited unlocks + reduced per-minute rate.",
      es: "Desbloqueos ilimitados + tarifa por minuto reducida.",
    },
    unlockFee: { en: "Free", es: "Gratis" },
    perMinute: { en: "€0.25/min", es: "€0.25/min" },
    unlockFeeValue: 0,
    perMinuteValue: 0.25,
    popular: true,
  },
  {
    id: "day-pass",
    name: { en: "Day Pass", es: "Pase diario" },
    description: {
      en: "Unlimited rides for 24 hours.",
      es: "Trayectos ilimitados durante 24 horas.",
    },
    unlockFee: { en: "Free", es: "Gratis" },
    perMinute: { en: "Included", es: "Incluido" },
    unlockFeeValue: 0,
    perMinuteValue: 0,
    flatRate: 14.99,
  },
];

function resolveTiers(locale: Locale): PricingTier[] {
  return tierSources.map((tier) => ({
    ...tier,
    name: tier.name[locale],
    description: tier.description[locale],
    unlockFee: tier.unlockFee[locale],
    perMinute: tier.perMinute[locale],
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

const guaranteeSources: readonly LocalizedString[] = [
  {
    en: "No minimum top-up required",
    es: "Sin recarga mínima obligatoria",
  },
  {
    en: "No hidden fees after your ride",
    es: "Sin costes ocultos después del trayecto",
  },
  {
    en: "Free refund of unused balance",
    es: "Reembolso gratuito del saldo no utilizado",
  },
  {
    en: "Exact pricing shown before every ride",
    es: "Precio exacto visible antes de cada trayecto",
  },
];

/** Per-locale guarantee bullets — `Record<Locale, ...>` forces every locale to exist. */
export const noSurpriseGuaranteesByLocale: Record<Locale, string[]> = {
  en: guaranteeSources.map((g) => g.en),
  es: guaranteeSources.map((g) => g.es),
};

/** Canonical English list (back-compat alias). */
export const noSurpriseGuarantees: string[] = noSurpriseGuaranteesByLocale.en;
