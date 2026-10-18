import { Shield, HardHat, WineOff, User, Leaf } from "lucide-react";
import { FeatureList } from "@/components/ui/FeatureList";
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
  /** One line, no heading. */
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
    intro: "Spain's new VMP rules have been in force since 1 October 2026. Rido is being built to them, so the fleet is compliant on its first day.",
    complianceTitle: "Compliant at launch",
    compliancePoints: [
      "DGT-certified e-scooter hardware",
      "Registered fleet with identification sticker",
      "Civil liability insurance on every vehicle",
      "Anti-tampering motor, 25 km/h max by design",
    ],
    sustainability:
      "Our commitment: carbon-neutral operations, swappable and recycled batteries, every vehicle recycled at end of life — audited figures after our first year.",
    rulesLabel: "Rider rules",
    items: [
      { title: "Helmet on, every ride", description: "A certified helmet will be docked on every scooter. Since 1 October 2026 it's mandatory nationwide for e-scooter riders." },
      { title: "One rider only", description: "One scooter, one rider. At launch, tandem detection will make sure nobody doubles up." },
      { title: "Stay sober", description: "No riding under the influence. At peak hours, the app will be able to ask for a quick reaction test before unlocking." },
      { title: "Park responsibly", description: "Park in the zones the app will show and keep pavements clear for pedestrians." },
    ],
  },
  es: {
    sectionAria: "Seguridad y confianza",
    label: "Seguridad y confianza",
    title: "Casco incluido. Normas respetadas.",
    intro: "La nueva normativa VMP española está en vigor desde el 1 de octubre de 2026. Rido se está construyendo para cumplirla, así que la flota cumple desde su primer día.",
    complianceTitle: "Cumplimos desde el lanzamiento",
    compliancePoints: [
      "Hardware de patinete certificado por la DGT",
      "Flota inscrita con etiqueta identificativa",
      "Seguro de responsabilidad civil en cada vehículo",
      "Motor antimanipulación, máx. 25 km/h de fábrica",
    ],
    sustainability:
      "Nuestro compromiso: operaciones neutras en carbono, baterías intercambiables y recicladas, cada vehículo reciclado al final de su vida útil — cifras auditadas tras el primer año.",
    rulesLabel: "Normas para circular",
    items: [
      { title: "Casco puesto, siempre", description: "Cada patinete llevará un casco certificado acoplado. Desde el 1 de octubre de 2026 es obligatorio en todo el país." },
      { title: "Solo una persona", description: "Un patinete, una persona. Desde el lanzamiento, la detección de tándem evitará que nadie monte en pareja." },
      { title: "Nada de alcohol", description: "No conduzcas bajo los efectos del alcohol. En horas punta, la app podrá pedir un test de reacción rápido antes de desbloquear." },
      { title: "Aparca con responsabilidad", description: "Aparca en las zonas que marcará la app y deja las aceras libres para los peatones." },
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
            <FeatureList items={t.compliancePoints} accent="positive" className="mt-4" />
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <p className="mt-8 flex gap-3 border-t border-white/10 pt-6 text-sm text-muted leading-relaxed">
              <Leaf className="w-5 h-5 shrink-0 text-rido-green mt-0.5" aria-hidden="true" />
              <span>{t.sustainability}</span>
            </p>
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
