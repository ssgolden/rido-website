import { BadgeCheck, AppWindow, HandCoins, ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StaggerReveal, StaggerItem } from "@/components/ui/StaggerReveal";
import { STAGGER } from "@/lib/motion";
import type { Locale } from "@/lib/i18n/config";

interface PartnerCopy {
  sectionAria: string;
  label: string;
  title: string;
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
    label: "For partners",
    title: "Run Rido in your city",
    intro:
      "Turnkey shared mobility for Spanish cities. We bring the DGT-certified fleet, the rider app, the insurance, and the operations playbook — you bring the local team.",
    differentiators: [
      {
        title: "DGT-certified fleet",
        description:
          "Registered, insured, and built to Spain's 2026 VMP rules from day one — DGT certification, ID stickers, anti-tamper motors, helmets included.",
      },
      {
        title: "Software and operations",
        description:
          "Rider app, manager dashboard, geofencing, dynamic pricing, and support tooling — one platform, built for our own launch and shared with every partner city.",
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
    label: "Para socios",
    title: "Opera Rido en tu ciudad",
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
          "App del usuario, panel de operaciones, geofencing, precios dinámicos y herramientas de soporte — una sola plataforma, creada para nuestro propio lanzamiento y compartida con cada ciudad socia.",
      },
      {
        title: "Economía alineada",
        description:
          "Reparto de ingresos local con unos números por vehículo transparentes. El valor que crea tu ciudad se queda en tu ciudad — no en una central lejana.",
      },
    ],
    ctaLabel: "Hablemos de colaborar",
    ctaAria: "Enviar un correo a Rido para hablar de una colaboración",
  },
};

/** Partner pitch. Lives on /partners (and /es/partners), not the rider homepage. */
export function Partners({ locale, asPage = false }: { locale: Locale; asPage?: boolean }) {
  const t = copy[locale];
  return (
    <Section id="partners" label={t.sectionAria}>
      <SectionHeader label={t.label} title={t.title} intro={t.intro} align="left" as={asPage ? "h1" : "h2"} />

      <StaggerReveal className="grid grid-cols-1 md:grid-cols-3 gap-px overflow-hidden rounded-3xl bg-white/10 ring-1 ring-white/10" staggerDelay={STAGGER.grid}>
        {t.differentiators.map((d, i) => {
          const Icon = partnerIcons[i];
          return (
            <StaggerItem key={d.title} className="bg-rido-navy p-6 sm:p-8">
              <Icon className="w-6 h-6 text-rido-magenta-light" aria-hidden="true" />
              <h2 className="mt-5 font-display text-lg font-bold">{d.title}</h2>
              <p className="mt-2 text-sm text-muted leading-relaxed">{d.description}</p>
            </StaggerItem>
          );
        })}
      </StaggerReveal>

      <ScrollReveal delay={STAGGER.grid}>
        <a
          href="mailto:info@rido.bike?subject=Partner%20inquiry%20—%20Rido"
          aria-label={t.ctaAria}
          className="group btn-lift mt-10 inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-rido-magenta text-white font-semibold hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-rido-navy cursor-pointer"
        >
          <span>{t.ctaLabel}</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
        </a>
      </ScrollReveal>
    </Section>
  );
}
