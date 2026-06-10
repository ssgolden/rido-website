"use client";

import { useState, useEffect } from "react";
import { vehicles } from "@/data/vehicles";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Check } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StaggerReveal, StaggerItem } from "@/components/ui/StaggerReveal";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import { withBase } from "@/lib/basePath";



export function Vehicles() {
  const [active, setActive] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const v = vehicles[active];
  const [mainImageError, setMainImageError] = useState(false);
  const [thumbErrors, setThumbErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setMainImageError(false);
    setThumbErrors({});
  }, [active, activeImage]);

  // Apply basePath prefix at render time so it works in both SSR and client.
  // MUST be called in the component (not in the data file) because
  // withBase() depends on the runtime environment.
  const vehicleImages = v.images.map(withBase);

  const handleVehicleChange = (index: number) => {
    setActive(index);
    setActiveImage(0);
  };

  return (
    <section id="vehicles" aria-label="Our vehicles" className="py-16 sm:py-24 px-4 sm:px-6 relative section-tint-magenta">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <SectionHeading
            eyebrow="Our Fleet"
            before="Choose Your"
            highlight="Ride"
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
                    Image unavailable
                  </div>
                ) : (
                  <Image
                    src={vehicleImages[activeImage]}
                    alt={v.imageAlt}
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
                      onClick={() => setActiveImage(i)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 cursor-pointer hover:scale-105 hover:opacity-100 ${
                        i === activeImage
                          ? "ring-2 ring-rido-magenta ring-offset-2 ring-offset-rido-navy"
                          : "opacity-60"
                      }`}
                    >
                      {thumbErrors[i] ? (
                        <div className="w-full h-full flex items-center justify-center bg-white/10 text-muted text-[10px] text-center px-1">
                          Image unavailable
                        </div>
                      ) : (
                        <Image
                          src={img}
                          alt={`${v.name} view ${i + 1}`}
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
                  {v.type === "e-scooter" ? "E-Scooter" : "E-Bike"}
                </Badge>
                <h3 className="text-3xl font-black">{v.name}</h3>
                <p className="text-rido-magenta font-semibold mt-1">{v.tagline}</p>
              </div>

              <p className="text-muted leading-relaxed">{v.description}</p>

              <StaggerReveal className="grid grid-cols-2 gap-4" staggerDelay={0.08}>
                {v.specs.map((spec) => (
                  <StaggerItem key={spec.label} className="glass rounded-xl p-4 text-center">
                    <p className="text-lg font-bold text-rido-magenta">{spec.value}</p>
                    <p className="text-xs text-muted">{spec.label}</p>
                  </StaggerItem>
                ))}
              </StaggerReveal>

              <div className="grid grid-cols-2 gap-2">
                {v.features.map((feature) => (
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