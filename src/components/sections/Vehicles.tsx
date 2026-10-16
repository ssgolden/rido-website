"use client";

import { useRef, useState } from "react";
import { vehicles, getVehicleCopy } from "@/data/vehicles";
import { Check } from "lucide-react";
import Image from "next/image";
import { m, AnimatePresence, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { DURATION, EASE, STAGGER } from "@/lib/motion";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { withBase } from "@/lib/basePath";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import { useScrollContainerRef } from "@/components/ui/SmoothScrollProvider";

// Vehicle-specific copy (taglines, descriptions, specs, features) lives in src/data/vehicles.ts.
const en = {
  ariaLabel: "Our vehicles",
  label: "The fleet",
  title: "Choose your ride",
  tabsLabel: "Choose a vehicle",
  badgeScooter: "E-scooter",
  badgeBike: "E-bike",
  imageUnavailable: "Image unavailable",
  thumbAlt: (name: string, index: number) => `${name} view ${index}`,
  specsLabel: "Specifications",
  featuresLabel: "Included",
};

const copy: Record<Locale, typeof en> = {
  en,
  es: {
    ariaLabel: "Nuestros vehículos",
    label: "La flota",
    title: "Elige tu vehículo",
    tabsLabel: "Elige un vehículo",
    badgeScooter: "Patinete eléctrico",
    badgeBike: "Bici eléctrica",
    imageUnavailable: "Imagen no disponible",
    thumbAlt: (name: string, index: number) => `${name}, vista ${index}`,
    specsLabel: "Especificaciones",
    featuresLabel: "Incluye",
  },
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rido-magenta focus-visible:ring-offset-2 focus-visible:ring-offset-sand";

export function Vehicles() {
  const locale = useLocale();
  const t = copy[locale];
  const [active, setActive] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const v = vehicles[active];
  const vCopy = getVehicleCopy(v, locale);
  const [mainImageError, setMainImageError] = useState(false);
  const [thumbErrors, setThumbErrors] = useState<Record<number, boolean>>({});
  const reduce = useReducedMotion();

  // Signature moment, part two: the vehicle rides into its frame as the fleet
  // section scrolls into view (the hero scooter rides out of its own frame).
  // Zero range under reduced motion, so SSR and client styles always match.
  const frameRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useScrollContainerRef();
  const { scrollYProgress: enterProgress } = useScroll({
    container: scrollContainerRef,
    target: frameRef,
    offset: ["start end", "start 0.35"],
  });
  const rideInX = useTransform(enterProgress, [0, 1], reduce ? ["0%", "0%"] : ["-70%", "0%"]);

  // withBase() at render time — basePath differs between SSR and client.
  const vehicleImages = v.cutouts.map(withBase);

  const handleVehicleChange = (index: number) => {
    setActive(index);
    setActiveImage(0);
    setMainImageError(false);
    setThumbErrors({});
  };

  return (
    <Section id="vehicles" label={t.ariaLabel} tone="sand">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10 sm:mb-14">
        <SectionHeader label={t.label} title={t.title} align="left" tone="sand" className="!mb-0" />
        <ScrollReveal>
          <div role="group" aria-label={t.tabsLabel} className="inline-flex rounded-full bg-ink/5 p-1 ring-1 ring-ink/10">
            {vehicles.map((vehicle, i) => (
              <button
                key={vehicle.id}
                aria-pressed={i === active}
                onClick={() => handleVehicleChange(i)}
                className={cn(
                  "relative min-h-11 px-5 sm:px-6 rounded-full font-semibold text-sm transition-colors duration-200 cursor-pointer",
                  focusRing,
                  i === active ? "text-white" : "text-ink-muted hover:text-ink"
                )}
              >
                {i === active && (
                  <m.span
                    layoutId="vehicle-tab-bg"
                    className="absolute inset-0 rounded-full bg-ink"
                    transition={{ duration: reduce ? 0 : DURATION.micro, ease: EASE }}
                  />
                )}
                <span className="relative z-10">{vehicle.name}</span>
              </button>
            ))}
          </div>
        </ScrollReveal>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-16 items-start">
        <ScrollReveal delay={STAGGER.text}>
          <div ref={frameRef} className="image-frame-sun relative aspect-[4/3] overflow-hidden rounded-3xl ring-1 ring-black/5">
            <m.div className="absolute inset-0" style={{ x: rideInX }}>
            {mainImageError ? (
              <div className="absolute inset-0 flex items-center justify-center text-ink-muted text-sm">{t.imageUnavailable}</div>
            ) : (
              <AnimatePresence initial={false}>
                <m.div
                  key={`${v.id}-${activeImage}`}
                  className="absolute inset-0"
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0 : DURATION.micro, ease: EASE }}
                >
                  <Image
                    src={vehicleImages[activeImage]}
                    alt={vCopy.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-contain p-6 sm:p-10 drop-shadow-[0_24px_30px_rgba(15,23,42,0.18)]"
                    onError={() => setMainImageError(true)}
                  />
                </m.div>
              </AnimatePresence>
            )}
            </m.div>
          </div>
          {vehicleImages.length > 1 && (
            <div className="mt-4 flex gap-3">
              {vehicleImages.map((img, i) => (
                <button
                  key={img}
                  onClick={() => {
                    setActiveImage(i);
                    setMainImageError(false);
                  }}
                  aria-label={t.thumbAlt(v.name, i + 1)}
                  aria-pressed={i === activeImage}
                  className={cn(
                    "image-frame-sun relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden cursor-pointer transition-[box-shadow,opacity] duration-200",
                    focusRing,
                    i === activeImage ? "ring-2 ring-ink" : "ring-1 ring-black/5 opacity-70 hover:opacity-100"
                  )}
                >
                  {thumbErrors[i] ? (
                    <span className="absolute inset-0 flex items-center justify-center text-ink-muted text-[10px] text-center px-1">{t.imageUnavailable}</span>
                  ) : (
                    <Image
                      src={img}
                      alt=""
                      fill
                      loading="lazy"
                      sizes="80px"
                      className="object-contain p-1.5"
                      onError={() => setThumbErrors((prev) => ({ ...prev, [i]: true }))}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollReveal>

        <ScrollReveal delay={STAGGER.grid}>
          <p className="text-sm font-semibold text-rido-magenta-dark">{v.type === "e-scooter" ? t.badgeScooter : t.badgeBike}</p>
          <h3 className="mt-1 font-display text-3xl sm:text-4xl font-black text-ink">{v.name}</h3>
          <p className="mt-1 text-lg font-semibold text-ink-muted">{vCopy.tagline}</p>
          <p className="mt-5 text-ink-muted leading-relaxed">{vCopy.description}</p>

          <h4 className="sr-only">{t.specsLabel}</h4>
          <dl className="mt-8 grid grid-cols-2 border-t border-ink/10">
            {vCopy.specs.map((spec, i) => (
              <div key={spec.label} className={cn("py-5 border-b border-ink/10", i % 2 === 0 ? "pr-4" : "pl-4 border-l")}>
                <dt className="text-sm text-ink-muted">{spec.label}</dt>
                <dd className="mt-1 font-display text-2xl sm:text-3xl font-black text-ink">{spec.value}</dd>
              </div>
            ))}
          </dl>

          <h4 className="mt-8 text-sm font-semibold text-ink">{t.featuresLabel}</h4>
          <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {vCopy.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-ink-muted">
                <Check className="mt-0.5 w-4 h-4 shrink-0 text-rido-magenta-dark" aria-hidden="true" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </ScrollReveal>
      </div>
    </Section>
  );
}
