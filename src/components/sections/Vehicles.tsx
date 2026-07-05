"use client";

import { useState } from "react";
import { vehicles, getVehicleCopy } from "@/data/vehicles";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Check } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StaggerReveal, StaggerItem } from "@/components/ui/StaggerReveal";
import Image from "next/image";
import { motion } from "framer-motion";

import { withBase } from "@/lib/basePath";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/config";

// User-visible strings per locale. Vehicle-specific copy (taglines,
// descriptions, specs, features) lives in src/data/vehicles.ts.
const en = {
  ariaLabel: "Our vehicles",
  eyebrow: "Our Fleet",
  headingBefore: "Choose Your",
  headingHighlight: "Ride",
  badgeScooter: "E-Scooter",
  badgeBike: "E-Bike",
  imageUnavailable: "Image unavailable",
  thumbAlt: (name: string, index: number) => `${name} view ${index}`,
};

const copy: Record<Locale, typeof en> = {
  en,
  es: {
    ariaLabel: "Nuestros vehículos",
    eyebrow: "Nuestra flota",
    headingBefore: "Elige tu",
    headingHighlight: "vehículo",
    badgeScooter: "Patinete eléctrico",
    badgeBike: "Bici eléctrica",
    imageUnavailable: "Imagen no disponible",
    thumbAlt: (name: string, index: number) => `${name}, vista ${index}`,
  },
};

export function Vehicles() {
  const locale = useLocale();
  const t = copy[locale];
  const [active, setActive] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const v = vehicles[active];
  const vCopy = getVehicleCopy(v, locale);
  const [mainImageError, setMainImageError] = useState(false);
  const [thumbErrors, setThumbErrors] = useState<Record<number, boolean>>({});

  // Apply basePath prefix at render time so it works in both SSR and client.
  // MUST be called in the component (not in the data file) because
  // withBase() depends on the runtime environment.
  const vehicleImages = v.images.map(withBase);

  const handleVehicleChange = (index: number) => {
    setActive(index);
    setActiveImage(0);
    setMainImageError(false);
    setThumbErrors({});
  };

  const handleThumbnailClick = (index: number) => {
    setActiveImage(index);
    setMainImageError(false);
  };

  return (
    <section id="vehicles" aria-label={t.ariaLabel} className="py-12 sm:py-24 px-4 sm:px-6 relative section-tint-magenta">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <SectionHeading
            eyebrow={t.eyebrow}
            before={t.headingBefore}
            highlight={t.headingHighlight}
            className="text-3xl sm:text-4xl md:text-5xl font-black"
          />
        </div>

        <ScrollReveal delay={0.1}>
          <div className="flex justify-center gap-4 mb-12 relative">
            {vehicles.map((vehicle, i) => (
              <button
                key={vehicle.id}
                onClick={() => handleVehicleChange(i)}
                className={`relative px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-semibold text-sm transition-colors duration-200 cursor-pointer ${
                  i === active
                    ? "text-white"
                    : "text-muted-strong hover:text-white hover:bg-white/10"
                }`}
              >
                {i === active && (
                  <motion.div
                    layoutId="vehicle-tab-bg"
                    className="absolute inset-0 bg-rido-magenta rounded-xl shadow-lg shadow-rido-magenta/25"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{vehicle.name}</span>
              </button>
            ))}
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ScrollReveal direction="left" delay={0.2}>
            <Card className="overflow-hidden p-0 group">
              <div className="relative aspect-[4/3] bg-gradient-to-br from-white/5 to-rido-magenta/10 flex items-center justify-center">
                {mainImageError ? (
                  <div className="absolute inset-0 flex items-center justify-center text-muted text-sm">
                    {t.imageUnavailable}
                  </div>
                ) : (
                  <Image
                    src={vehicleImages[activeImage]}
                    alt={vCopy.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority={active === 0 && activeImage === 0}
                    onError={() => setMainImageError(true)}
                  />
                )}
              </div>
              {vehicleImages.length > 1 && (
                <div className="flex gap-2 p-3 bg-white/5">
                  {vehicleImages.map((img, i) => (
                    <button
                      key={img}
                      onClick={() => handleThumbnailClick(i)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 cursor-pointer hover:scale-105 hover:opacity-100 ${
                        i === activeImage
                          ? "ring-2 ring-rido-magenta ring-offset-2 ring-offset-rido-navy"
                          : "opacity-60"
                      }`}
                    >
                      {thumbErrors[i] ? (
                        <div className="w-full h-full flex items-center justify-center bg-white/10 text-muted text-[10px] text-center px-1">
                          {t.imageUnavailable}
                        </div>
                      ) : (
                        <Image
                          src={img}
                          alt={t.thumbAlt(v.name, i + 1)}
                          fill
                          loading="lazy"
                          className="object-cover"
                          sizes="64px"
                          onError={() => setThumbErrors((prev) => ({ ...prev, [i]: true }))}
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.3}>
            <div className="flex flex-col justify-center gap-6">
              <div>
                <Badge variant="magenta" className="mb-3 cursor-default">
                  {v.type === "e-scooter" ? t.badgeScooter : t.badgeBike}
                </Badge>
                <h3 className="text-3xl font-black">{v.name}</h3>
                <p className="text-rido-magenta font-semibold mt-1">{vCopy.tagline}</p>
              </div>

              <p className="text-muted leading-relaxed">{vCopy.description}</p>

              <StaggerReveal className="grid grid-cols-2 gap-4" staggerDelay={0.08}>
                {vCopy.specs.map((spec) => (
                  <StaggerItem key={spec.label} className="glass rounded-xl p-4 text-center">
                    <p className="text-lg font-bold text-rido-magenta">{spec.value}</p>
                    <p className="text-xs text-muted">{spec.label}</p>
                  </StaggerItem>
                ))}
              </StaggerReveal>

              <div className="grid grid-cols-2 gap-2">
                {vCopy.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-rido-green shrink-0" />
                    <span className="text-muted-strong">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}