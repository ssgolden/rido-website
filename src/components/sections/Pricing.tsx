"use client";

import { pricingTiersByLocale, noSurpriseGuaranteesByLocale } from "@/data/pricing";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Check, ShieldCheck, Palmtree, Megaphone } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StaggerReveal, StaggerItem } from "@/components/ui/StaggerReveal";
import { useLocale } from "@/lib/i18n/locale-context";
import { STAGGER } from "@/lib/motion";
import type { Locale } from "@/lib/i18n/config";

const copy = {
  en: {
    sectionAria: "Pricing plans",
    eyebrow: "Transparent Pricing",
    headingBefore: "No",
    headingHighlight: "Surprises",
    intro:
      "Fares will be announced at launch. Until then, the promise is the same: see the price before every ride. No hidden fees, no minimum top-ups, no refund charges.",
    mostPopular: "Most Popular",
    bestForTourists: "Best for Tourists",
    priceAnnouncedLabel: "Pricing to be announced",
    priceAnnouncedSub: "at launch",
    guaranteeTitle: "No-Surprise Guarantee",
  },
  es: {
    sectionAria: "Planes de precios",
    eyebrow: "Precios transparentes",
    headingBefore: "Sin",
    headingHighlight: "Sorpresas",
    intro:
      "Las tarifas se anunciarán en el lanzamiento. Hasta entonces, la promesa es la misma: verás el precio antes de cada trayecto. Sin costes ocultos, sin recargas mínimas, sin comisiones por reembolso.",
    mostPopular: "El más popular",
    bestForTourists: "Ideal para turistas",
    priceAnnouncedLabel: "Precios por anunciar",
    priceAnnouncedSub: "en el lanzamiento",
    guaranteeTitle: "Garantía sin sorpresas",
  },
} as const satisfies Record<Locale, Record<string, string>>;

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

        {/* Plan cards — names + descriptions stay, prices replaced by "to be announced" pill */}
        <StaggerReveal className="mobile-carousel md:grid md:grid-cols-3 gap-6 mb-10 sm:mb-16" staggerDelay={STAGGER.grid}>
          {pricingTiers.map((tier) => (
            <StaggerItem key={tier.id} className={tier.popular ? "order-first md:order-none lg:-translate-y-3 lg:scale-[1.03]" : undefined}>
              <div className={tier.popular ? "shimmer-border" : ""}>
                <Card className={`text-center ${tier.popular ? "border-rido-magenta/40 shadow-lg shadow-rido-magenta/10 relative" : ""}`}>
                  {tier.popular && <Badge variant="magenta" className="mb-4 cursor-default">{t.mostPopular}</Badge>}
                  {!tier.popular && tier.id === "day-pass" && <Badge variant="magenta-light" className="mb-4 cursor-default flex items-center gap-1 mx-auto w-fit"><Palmtree className="w-3 h-3" /> {t.bestForTourists}</Badge>}
                  <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-sm text-muted mb-6">{tier.description}</p>
                  <div className="glass rounded-xl p-5 border border-rido-magenta/20 bg-rido-magenta/[0.04]">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Megaphone className="w-4 h-4 text-rido-magenta-light" aria-hidden="true" />
                      <p className="text-sm font-bold text-rido-magenta-light uppercase tracking-wider">{t.priceAnnouncedLabel}</p>
                    </div>
                    <p className="text-xs text-muted-weak">{t.priceAnnouncedSub}</p>
                  </div>
                </Card>
              </div>
            </StaggerItem>
          ))}
        </StaggerReveal>

        {/* No-Surprise Guarantee — full width (calculator removed until prices are public) */}
        <ScrollReveal delay={0.2}>
          <div className="glass rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="w-6 h-6 text-rido-green" />
              <h3 className="text-lg font-bold">{t.guaranteeTitle}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {noSurpriseGuarantees.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-rido-green shrink-0" />
                  <span className="text-muted-strong">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
