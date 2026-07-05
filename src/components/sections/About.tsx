"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StaggerReveal, StaggerItem } from "@/components/ui/StaggerReveal";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/config";

// User-visible strings per locale.
const en = {
  ariaLabel: "About Rido",
  eyebrow: "Our Story",
  headingBefore: "Born in ",
  headingHighlight: "Spain",
  headingAfter: ", Built for Spanish Cities",
  quote: "Moving through your city should be easy, affordable, and clean.",
  para1: "Rido was founded with a simple belief. We saw empty bike lanes, crowded roads, and cities that deserve better air.",
  para2: "So we built a fleet of shared e-scooters and e-bikes designed for Spain's streets, Spain's weather, and Spain's people. Every vehicle is serviced in-house, every ride is insured, and every kilometre replaces a car trip.",
  milestones: [
    { year: "2025", event: "Rido founded in Spain" },
    { year: "2026", event: "Costa del Sol launch — 5 cities planned" },
    { year: "2027", event: "Expanding across Andalusia" },
  ],
  values: [
    { title: "Freedom", description: "Move on your terms. No schedules, no waiting, no parking headaches. Just scan and go.", dotClass: "bg-rido-magenta", borderClass: "border-rido-magenta" },
    { title: "Safety", description: "Beginner mode, tandem detection, brake checks, and real-time ride monitoring.", dotClass: "bg-rido-magenta-light", borderClass: "border-rido-magenta-light" },
    { title: "Sustainability", description: "Zero emissions, swappable batteries, carbon-neutral operations, responsible recycling.", dotClass: "bg-rido-green", borderClass: "border-rido-green" },
  ],
};

const copy: Record<Locale, typeof en> = {
  en,
  es: {
    ariaLabel: "Sobre Rido",
    eyebrow: "Nuestra historia",
    headingBefore: "Nacido en ",
    headingHighlight: "España",
    headingAfter: ", creado para las ciudades españolas",
    quote: "Moverte por tu ciudad debería ser fácil, asequible y limpio.",
    para1: "Rido nació de una convicción sencilla. Veíamos carriles bici vacíos, calles saturadas y ciudades que merecen un aire mejor.",
    para2: "Así que creamos una flota de patinetes y bicis eléctricas compartidas diseñada para las calles de España, su clima y su gente. Cada vehículo se mantiene en nuestros propios talleres, cada viaje está asegurado y cada kilómetro sustituye un trayecto en coche.",
    milestones: [
      { year: "2025", event: "Rido se funda en España" },
      { year: "2026", event: "Lanzamiento en la Costa del Sol — 5 ciudades previstas" },
      { year: "2027", event: "Expansión por toda Andalucía" },
    ],
    values: [
      { title: "Libertad", description: "Muévete a tu ritmo. Sin horarios, sin esperas, sin líos de aparcamiento. Escanea y listo.", dotClass: "bg-rido-magenta", borderClass: "border-rido-magenta" },
      { title: "Seguridad", description: "Modo principiante, detección de tándem, revisión de frenos y monitorización del viaje en tiempo real.", dotClass: "bg-rido-magenta-light", borderClass: "border-rido-magenta-light" },
      { title: "Sostenibilidad", description: "Cero emisiones, baterías intercambiables, operaciones neutras en carbono y reciclaje responsable.", dotClass: "bg-rido-green", borderClass: "border-rido-green" },
    ],
  },
};

export function About() {
  const locale = useLocale();
  const t = copy[locale];
  return (
    <section id="about" aria-label={t.ariaLabel} className="py-12 sm:py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <ScrollReveal direction="left">
            <div>
              <p className="text-rido-magenta-light text-sm font-semibold uppercase tracking-wider mb-3">{t.eyebrow}</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6">{t.headingBefore}<span className="text-gradient-brand">{t.headingHighlight}</span>{t.headingAfter}</h2>
              <blockquote className="relative mb-6 pl-6 border-l-4 border-rido-magenta">
                <p className="text-white/70 text-lg italic leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              </blockquote>
              <p className="text-muted leading-relaxed mb-6">{t.para1}</p>
              <p className="text-muted leading-relaxed">{t.para2}</p>
              <div className="mt-8 space-y-4">
                {t.milestones.map((m, i) => (
                  <ScrollReveal key={m.year} delay={0.1 * i}>
                    <div className="flex items-center gap-4">
                      <span className="text-rido-magenta-light font-bold text-sm w-12 shrink-0">{m.year}</span>
                      <div className="h-px flex-1 bg-gradient-to-r from-rido-magenta/40 to-transparent" />
                      <span className="text-muted text-sm">{m.event}</span>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </ScrollReveal>
          <StaggerReveal className="grid grid-cols-1 gap-4" staggerDelay={0.15}>
            {t.values.map((value) => (
              <StaggerItem key={value.title}>
                <div className={`bg-rido-navy-light/50 rounded-2xl p-6 flex items-start gap-4 border-l-4 ${value.borderClass}`}>
                  <div className={`w-3 h-3 rounded-full mt-2 shrink-0 ${value.dotClass}`} />
                  <div>
                    <h3 className="font-bold text-lg">{value.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{value.description}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerReveal>
        </div>
      </div>
    </section>
  );
}
