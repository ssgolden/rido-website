export interface PricingTier {
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

export const pricingTiers: PricingTier[] = [
  {
    name: "Pay as you go",
    description: "No commitment. Ride when you need it.",
    unlockFee: "€1.00",
    perMinute: "€0.35/min",
    unlockFeeValue: 1.0,
    perMinuteValue: 0.35,
  },
  {
    name: "Rido Pass",
    description: "Unlimited unlocks + reduced per-minute rate.",
    unlockFee: "Free",
    perMinute: "€0.25/min",
    unlockFeeValue: 0,
    perMinuteValue: 0.25,
    popular: true,
  },
  {
    name: "Day Pass",
    description: "Unlimited rides for 24 hours.",
    unlockFee: "Free",
    perMinute: "Included",
    unlockFeeValue: 0,
    perMinuteValue: 0,
    flatRate: 14.99,
  },
];

export const noSurpriseGuarantees = [
  "No minimum top-up required",
  "No hidden fees after your ride",
  "Free refund of unused balance",
  "Exact pricing shown before every ride",
];