export interface PricingTier {
  name: string;
  description: string;
  unlockFee: string;
  perMinute: string;
  popular?: boolean;
}

export const pricingTiers: PricingTier[] = [
  {
    name: "Pay as you go",
    description: "No commitment. Ride when you need it.",
    unlockFee: "€1.00",
    perMinute: "€0.35/min",
  },
  {
    name: "Rido Pass",
    description: "Unlimited unlocks + reduced per-minute rate.",
    unlockFee: "Free",
    perMinute: "€0.25/min",
    popular: true,
  },
  {
    name: "Day Pass",
    description: "Unlimited rides for 24 hours.",
    unlockFee: "Free",
    perMinute: "Included",
  },
];

export const noSurpriseGuarantees = [
  "No minimum top-up required",
  "No hidden fees after your ride",
  "Free refund of unused balance",
  "Exact pricing shown before every ride",
];