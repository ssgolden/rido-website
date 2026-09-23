"use client";

import { Card } from "@/components/ui/Card";
import { BadgeCheck, AppWindow, HandCoins, ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StaggerReveal, StaggerItem } from "@/components/ui/StaggerReveal";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/config";

interface PartnerCopy {
  sectionAria: string;
  eyebrow: string;
  headingBefore: string;
  headingHighlight: string;
  headingAfter: string;
  intro: string;
  differentiators: readonly [
    { title: string; description: string },
    { title: string; description: string },
    { title: string; description: string }
  ];
  ctaLabel: string;
  ctaAria: string;
}

const partnerIcons = [BadgeCheck, AppWindow, HandCoins] as const;

const copy: Record<Locale, PartnerCopy> = {
  en: {
    sectionAria: "Partner with Rido",
    eyebrow: "For Partners",
    headingBefore: "Run Rido in",
    headingHighlight: "your city",
    headingAfter: "",
    intro:
      "Turn-key shared mobility for Spanish cities. We bring the DGT-certified fleet, the rider app, the insurance, and the operations playbook — you bring the local team.",
    differentiators: [
      {
        title: "DGT-certified fleet",
        description:
          "Registered, insured, and built to Spain's 2026 VMP rules from day one — DGT certification, ID stickers, anti-tamper motors, helmets included.",
      },
      {
        title: "Software and operations",
        description:
          "Rider app, manager dashboard, geofencing, dynamic pricing, and 24/7 support tooling — already running, ready to deploy.",
      },
      {
        title: "Aligned economics",
        description:
          "Local revenue share with transparent unit economics. You keep the value your city creates — not a distant head office.",
      },
    ],
    ctaLabel: "Talk to us about partnering",
    ctaAria: "Email Rido to discuss a partner arrangement",
  },
  es: {
    sectionAria: "Colabora con Rido",
    eyebrow: "Para socios",
    headingBefore: "Opera Rido en",
    headingHighlight: "tu ciudad",
    headingAfter: "",
    intro:
      "Movilidad compartida llave en mano para ciudades españolas. Nosotros aportamos la flota certificada por la DGT, la app, el seguro y el manual de operaciones — tú pones el equipo local.",
    differentiators: [
      {
        title: "Flota certificada por la DGT",
        description:
          "Inscrita, asegurada y conforme a la nueva normativa VMP 2026 desde el primer día: certificación DGT, etiqueta identificativa, motor antimanipulación y casco incluido.",
      },
      {
        title: "Software y operaciones",
        description:
          "App del usuario, panel de operaciones, geocercado, precios dinámicos y soporte 24/7 — en marcha y listo para desplegar.",
      },
      {
        title: "Economía alineada",
        description:
          "Reparto de ingresos local con una cuenta de resultados transparente. El valor que crea tu ciudad se queda en tu ciudad — no en una central lejana.",
      },
    ],
    ctaLabel: "Hablemos de colaborar",
    ctaAria: "Enviar un correo a Rido para hablar de una colaboración",
  },
};

export function Partners() {
  const locale = useLocale();
  const t = copy[locale];
  return (
    <section id="partners" aria-label={t.sectionAria} className="py-12 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-rido-magenta/5 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <SectionHeading
            eyebrow={t.eyebrow}
            before={t.headingBefore}
            highlight={t.headingHighlight}
            after={t.headingAfter}
            className="text-3xl sm:text-4xl md:text-5xl font-black"
          />
          <ScrollReveal>
            <p className="mt-4 text-muted max-w-2xl mx-auto">{t.intro}</p>
          </ScrollReveal>
        </div>

        <StaggerReveal className="mobile-carousel md:grid md:grid-cols-3 gap-6" staggerDelay={0.1}>
          {t.differentiators.map((d, i) => {
            const Icon = partnerIcons[i];
            return (
              <StaggerItem key={d.title}>
                <Card className="h-full group hover:border-rido-magenta/30">
                  <div className="w-12 h-12 rounded-2xl bg-rido-magenta/10 flex items-center justify-center mb-4 transition-all duration-200 group-hover:bg-rido-magenta/20 group-hover:scale-110">
                    <Icon className="w-6 h-6 text-rido-magenta-light" aria-hidden="true" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{d.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{d.description}</p>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerReveal>

        <ScrollReveal delay={0.25}>
          <div className="mt-10 flex justify-center">
            <a
              href="mailto:info@rido.bike?subject=Partner%20inquiry%20—%20Rido"
              aria-label={t.ctaAria}
              className="group inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-rido-magenta text-white font-semibold text-base shadow-[0_8px_30px_rgba(222,4,152,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(222,4,152,0.5)] hover:brightness-110 active:scale-[0.98] active:duration-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-rido-navy cursor-pointer"
            >
              <span>{t.ctaLabel}</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
