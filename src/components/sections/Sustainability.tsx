"use client";

import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StaggerReveal, StaggerItem } from "@/components/ui/StaggerReveal";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/config";

// Pre-launch: no projected impact numbers — commitments only. Real impact
// numbers come back once we have audited first-year data.
const en = {
  ariaLabel: "Sustainability commitments",
  eyebrow: "Planet First",
  headingBefore: "Real",
  headingHighlight: "Sustainability",
  intro:
    "Every Rido ride replaces a car trip. We're holding ourselves to three commitments from day one and publishing our audited impact after our first year on the road.",
  commitments: [
    {
      title: "Carbon Neutral Operations",
      description:
        "We offset 100% of our operational emissions through verified carbon credits and green energy.",
    },
    {
      title: "Swappable Batteries",
      description:
        "Our vehicle batteries are swappable and recycled at end-of-life. No single-use waste.",
    },
    {
      title: "Responsible Recycling",
      description:
        "At end of life, every vehicle is dismantled and recycled. We publish our recycling rates.",
    },
  ],
};

const copy: Record<Locale, typeof en> = {
  en,
  es: {
    ariaLabel: "Compromisos de sostenibilidad",
    eyebrow: "El planeta primero",
    headingBefore: "Sostenibilidad",
    headingHighlight: "de verdad",
    intro:
      "Cada viaje en Rido sustituye un trayecto en coche. Asumimos tres compromisos desde el primer día y publicaremos nuestro impacto auditado tras el primer año en la calle.",
    commitments: [
      {
        title: "Operaciones neutras en carbono",
        description:
          "Compensamos el 100% de nuestras emisiones operativas con créditos de carbono verificados y energía verde.",
      },
      {
        title: "Baterías intercambiables",
        description:
          "Las baterías de nuestros vehículos son intercambiables y se reciclan al final de su vida útil. Sin residuos de un solo uso.",
      },
      {
        title: "Reciclaje responsable",
        description:
          "Al final de su vida útil, cada vehículo se desmonta y se recicla. Publicamos nuestras tasas de reciclaje.",
      },
    ],
  },
};

export function Sustainability() {
  const locale = useLocale();
  const t = copy[locale];
  return (
    <section id="sustainability" aria-label={t.ariaLabel} className="py-12 sm:py-24 px-4 sm:px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-rido-navy via-rido-green/5 to-rido-navy" />
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <SectionHeading
            eyebrow={t.eyebrow}
            before={t.headingBefore}
            highlight={t.headingHighlight}
            highlightClass="text-rido-green"
            className="text-3xl sm:text-4xl md:text-5xl font-black"
          />
          <ScrollReveal>
            <p className="mt-4 text-muted max-w-xl mx-auto">{t.intro}</p>
          </ScrollReveal>
        </div>

        <StaggerReveal className="mobile-carousel md:grid md:grid-cols-3 gap-6" staggerDelay={0.1} tabIndex={0} role="region" aria-label={t.ariaLabel}>
          {t.commitments.map((item) => (
            <StaggerItem key={item.title}>
              <Card>
                <h3 className="font-bold text-lg mb-2 text-rido-green">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.description}</p>
              </Card>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}
