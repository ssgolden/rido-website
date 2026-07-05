"use client";

import { pricingTiersByLocale, noSurpriseGuaranteesByLocale } from "@/data/pricing";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Check, ShieldCheck, Palmtree } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StaggerReveal, StaggerItem } from "@/components/ui/StaggerReveal";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/config";
import { useState } from "react";

const copy = {
  en: {
    sectionAria: "Pricing plans",
    eyebrow: "Transparent Pricing",
    headingBefore: "No",
    headingHighlight: "Surprises",
    intro: "See the price before every ride. No hidden fees, no minimum top-ups, no refund charges.",
    mostPopular: "Most Popular",
    bestForTourists: "Best for Tourists",
    unlockFee: "Unlock Fee",
    perMinute: "Per Minute",
    guaranteeTitle: "No-Surprise Guarantee",
    calcTitle: "Estimate Your Ride",
    calcDurationLabel: "Ride duration:",
    calcDurationAria: "Ride duration in minutes",
    calcMinUnit: "min",
    calcEstimated: "Estimated cost",
    calcUnlockWord: "unlock",
    calcFlatNote: "Unlimited rides for 24 hours",
  },
  es: {
    sectionAria: "Planes de precios",
    eyebrow: "Precios transparentes",
    headingBefore: "Sin",
    headingHighlight: "Sorpresas",
    intro: "Ves el precio antes de cada trayecto. Sin costes ocultos, sin recargas mínimas, sin comisiones por reembolso.",
    mostPopular: "El más popular",
    bestForTourists: "Ideal para turistas",
    unlockFee: "Desbloqueo",
    perMinute: "Por minuto",
    guaranteeTitle: "Garantía sin sorpresas",
    calcTitle: "Calcula tu trayecto",
    calcDurationLabel: "Duración del trayecto:",
    calcDurationAria: "Duración del trayecto en minutos",
    calcMinUnit: "min",
    calcEstimated: "Coste estimado",
    calcUnlockWord: "desbloqueo",
    calcFlatNote: "Trayectos ilimitados durante 24 horas",
  },
} as const satisfies Record<Locale, Record<string, string>>;

function PricingCalculator() {
  const locale = useLocale();
  const t = copy[locale];
  const pricingTiers = pricingTiersByLocale[locale];
  const [minutes, setMinutes] = useState(10);
  const [planIndex, setPlanIndex] = useState(0);

  // Derive rates from the same data source as the pricing cards
  const tier = pricingTiers[planIndex];
  const isFlatRate = tier.flatRate != null;
  const total = isFlatRate ? tier.flatRate! : tier.unlockFeeValue + tier.perMinuteValue * minutes;

  return (
    <Card className="p-6 sm:p-8 max-w-lg mx-auto">
      <h3 className="text-xl font-bold mb-6 text-center">{t.calcTitle}</h3>
      <div className="flex gap-2 mb-6">
        {pricingTiers.map((tierOption, i) => (
          <button key={tierOption.id} onClick={() => setPlanIndex(i)}
            className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-200 ${planIndex === i ? "bg-rido-magenta text-white" : "glass text-white/60 hover:text-white hover:bg-white/10"}`}>
            {tierOption.name}
          </button>
        ))}
      </div>
      <div className="mb-6">
        <label className="text-sm text-muted mb-2 block">{t.calcDurationLabel} <strong className="text-white">{minutes} {t.calcMinUnit}</strong></label>
        <input type="range" min={1} max={60} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}
          className="w-full accent-rido-magenta h-2 rounded-lg appearance-none bg-white/10 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rido-magenta [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-rido-magenta [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
          aria-label={t.calcDurationAria} />
        <div className="flex justify-between text-xs text-muted-weak mt-1"><span>1 {t.calcMinUnit}</span><span>60 {t.calcMinUnit}</span></div>
      </div>
      <div className="glass rounded-xl p-5 text-center" aria-live="polite" aria-atomic="true">
        <p className="text-sm text-muted mb-1">{t.calcEstimated}</p>
        <p className="text-4xl font-black text-rido-magenta">&euro;{total.toFixed(2)}</p>
        {!isFlatRate && <p className="text-xs text-muted-weak mt-2">&euro;{tier.unlockFeeValue.toFixed(2)} {t.calcUnlockWord} + &euro;{tier.perMinuteValue.toFixed(2)}/min</p>}
        {isFlatRate && <p className="text-xs text-muted-weak mt-2">{t.calcFlatNote}</p>}
      </div>
    </Card>
  );
}

export function Pricing() {
  const locale = useLocale();
  const t = copy[locale];
  const pricingTiers = pricingTiersByLocale[locale];
  const noSurpriseGuarantees = noSurpriseGuaranteesByLocale[locale];

  return (
    <section id="pricing" aria-label={t.sectionAria} className="py-12 sm:py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <SectionHeading
            eyebrow={t.eyebrow}
            before={t.headingBefore}
            highlight={t.headingHighlight}
            className="text-3xl sm:text-4xl md:text-5xl font-black"
          />
          <ScrollReveal>
            <p className="mt-4 text-muted max-w-xl mx-auto">{t.intro}</p>
          </ScrollReveal>
        </div>
        <StaggerReveal className="mobile-carousel md:grid md:grid-cols-3 gap-6 mb-10 sm:mb-16" staggerDelay={0.1}>
          {pricingTiers.map((tier) => (
            <StaggerItem key={tier.id} className={tier.popular ? "order-first md:order-none" : undefined}>
              <div className={tier.popular ? "shimmer-border" : ""}>
                <Card className={`text-center ${tier.popular ? "border-rido-magenta/40 shadow-lg shadow-rido-magenta/10 relative" : ""}`}>
                  {tier.popular && <Badge variant="magenta" className="mb-4 cursor-default">{t.mostPopular}</Badge>}
                  {!tier.popular && tier.id === "day-pass" && <Badge variant="magenta-light" className="mb-4 cursor-default flex items-center gap-1 mx-auto w-fit"><Palmtree className="w-3 h-3" /> {t.bestForTourists}</Badge>}
                  <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-sm text-muted mb-6">{tier.description}</p>
                  <div className="space-y-3">
                    <div className="glass rounded-xl p-3"><p className="text-xs text-muted">{t.unlockFee}</p><p className="text-lg font-bold text-rido-magenta-light">{tier.unlockFee}</p></div>
                    <div className="glass rounded-xl p-3"><p className="text-xs text-muted">{t.perMinute}</p><p className="text-lg font-bold text-rido-magenta-light">{tier.perMinute}</p></div>
                  </div>
                </Card>
              </div>
            </StaggerItem>
          ))}
        </StaggerReveal>
        <ScrollReveal delay={0.2}>
          <div className="glass rounded-2xl p-8 max-w-2xl mx-auto mb-16">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="w-6 h-6 text-rido-green" />
              <h3 className="text-lg font-bold">{t.guaranteeTitle}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {noSurpriseGuarantees.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-rido-green shrink-0" />
                  <span className="text-white/60">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.3}>
          <PricingCalculator />
        </ScrollReveal>
      </div>
    </section>
  );
}
