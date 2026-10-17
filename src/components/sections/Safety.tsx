import { Shield, HardHat, WineOff, User, Check, Leaf } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StaggerReveal, StaggerItem } from "@/components/ui/StaggerReveal";
import { STAGGER } from "@/lib/motion";
import type { Locale } from "@/lib/i18n/config";

interface SafetyItemCopy {
  title: string;
  description: string;
}

interface SafetyCopy {
  sectionAria: string;
  label: string;
  title: string;
  intro: string;
  complianceTitle: string;
  compliancePoints: readonly [string, string, string, string];
  sustainabilityTitle: string;
  sustainability: string;
  rulesLabel: string;
  /** Fixed-length tuple: keeps both locales aligned with `safetyIcons`. */
  items: readonly [SafetyItemCopy, SafetyItemCopy, SafetyItemCopy, SafetyItemCopy];
}

/** Icons zip with `copy[locale].items` by index. */
const safetyIcons = [HardHat, User, WineOff, Shield] as const;

const copy = {
  en: {
    sectionAria: "Safety and trust",
    label: "Safety & trust",
    title: "Helmet included. Rules respected.",
    intro: "Spain's new VMP rules have been in force since 1 October 2026. Rido was built to them from day one.",
    complianceTitle: "Compliant from day one",
    compliancePoints: [
      "DGT-certified e-scooter hardware",
      "Registered fleet with identification sticker",
      "Civil liability insurance on every vehicle",
      "Anti-tampering motor, 25 km/h max by design",
    ],
    sustainabilityTitle: "Our commitments",
    sustainability:
      "Carbon-neutral operations through verified credits and green energy, swappable and recycled batteries, and every vehicle recycled at end of life. Audited figures published after our first year.",
    rulesLabel: "Rider rules",
    items: [
      { title: "Helmet on, every ride", description: "A certified helmet is docked on every scooter. Since 1 October 2026 it's mandatory nationwide for e-scooter riders." },
      { title: "One rider only", description: "One scooter, one rider. Tandem detection makes sure nobody doubles up." },
      { title: "Stay sober", description: "No riding under the influence. At peak hours, a quick reaction test may be required to unlock." },
      { title: "Park responsibly", description: "Park in the zones shown in the app and keep pavements clear for pedestrians." },
    ],
  },
  es: {
    sectionAria: "Seguridad y confianza",
    label: "Seguridad y confianza",
    title: "Casco incluido. Normas respetadas.",
    intro: "La nueva normativa VMP española está en vigor desde el 1 de octubre de 2026. Rido se diseñó para cumplirla desde el primer día.",
    complianceTitle: "Cumplimos desde el primer día",
    compliancePoints: [
      "Hardware de patinete certificado por la DGT",
      "Flota inscrita con etiqueta identificativa",
      "Seguro de responsabilidad civil en cada vehículo",
      "Motor antimanipulación, máx. 25 km/h de fábrica",
    ],
    sustainabilityTitle: "Nuestros compromisos",
    sustainability:
      "Operaciones neutras en carbono con créditos verificados y energía verde, baterías intercambiables y recicladas, y cada vehículo reciclado al final de su vida útil. Publicaremos cifras auditadas tras el primer año.",
    rulesLabel: "Normas para circular",
    items: [
      { title: "Casco puesto, siempre", description: "Cada patinete lleva un casco certificado acoplado. Desde el 1 de octubre de 2026 es obligatorio en todo el país." },
      { title: "Solo una persona", description: "Un patinete, una persona. La detección de tándem evita que nadie monte en pareja." },
      { title: "Nada de alcohol", description: "No conduzcas bajo los efectos del alcohol. En horas punta puede pedirse un test de reacción para desbloquear." },
      { title: "Aparca con responsabilidad", description: "Aparca en las zonas que marca la app y deja las aceras libres para los peatones." },
    ],
  },
} as const satisfies Record<Locale, SafetyCopy>;

export function Safety({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <Section id="safety" label={t.sectionAria} tone="deep">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        <div>
          <SectionHeader label={t.label} title={t.title} intro={t.intro} align="left" className="!mb-10" />

          <ScrollReveal>
            <h3 className="text-sm font-semibold text-white">{t.complianceTitle}</h3>
            <ul className="mt-4 space-y-3">
              {t.compliancePoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-muted-strong">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rido-green/15">
                    <Check className="w-3.5 h-3.5 text-rido-green" aria-hidden="true" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="mt-10 flex gap-4 border-t border-white/10 pt-8">
              <Leaf className="w-5 h-5 shrink-0 text-rido-green mt-0.5" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-semibold text-white">{t.sustainabilityTitle}</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">{t.sustainability}</p>
              </div>
            </div>
          </ScrollReveal>
        </div>

        <div>
          <h3 className="sr-only">{t.rulesLabel}</h3>
          <StaggerReveal className="divide-y divide-white/10 border-y border-white/10" staggerDelay={STAGGER.grid}>
            {t.items.map((item, i) => {
              const Icon = safetyIcons[i];
              return (
                <StaggerItem key={item.title}>
                  <div className="flex gap-5 py-7">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rido-magenta/10">
                      <Icon className="w-6 h-6 text-rido-magenta-light" aria-hidden="true" />
                    </span>
                    <div>
                      <h4 className="font-display text-lg font-bold">{item.title}</h4>
                      <p className="mt-1 text-sm text-muted leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerReveal>
        </div>
      </div>
    </Section>
  );
}
