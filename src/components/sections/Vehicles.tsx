"use client";

import { useState } from "react";
import { vehicles } from "@/data/vehicles";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Check } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StaggerReveal, StaggerItem } from "@/components/ui/StaggerReveal";
import Image from "next/image";

export function Vehicles() {
  const [active, setActive] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const v = vehicles[active];

  const handleVehicleChange = (index: number) => {
    setActive(index);
    setActiveImage(0);
  };

  return (
    <section id="vehicles" aria-label="Our vehicles" className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <ScrollReveal>
            <p className="text-rido-magenta text-sm font-semibold uppercase tracking-wider mb-3">
              Our Fleet
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">
              Choose Your <span className="text-gradient-brand">Ride</span>
            </h2>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={0.1}>
          <div className="flex justify-center gap-4 mb-12">
            {vehicles.map((vehicle, i) => (
              <button
                key={vehicle.id}
                onClick={() => handleVehicleChange(i)}
                className={`px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
                  i === active
                    ? "bg-rido-magenta text-white shadow-lg shadow-rido-magenta/25"
                    : "glass text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                {vehicle.name}
              </button>
            ))}
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ScrollReveal direction="left" delay={0.2}>
            <Card className="overflow-hidden p-0">
              <div className="relative aspect-[4/3] bg-gradient-to-br from-white/5 to-rido-magenta/10 flex items-center justify-center">
                <Image
                  src={v.images[activeImage]}
                  alt={v.imageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
              {v.images.length > 1 && (
                <div className="flex gap-2 p-3 bg-white/5">
                  {v.images.map((img, i) => (
                    <button
                      key={img}
                      onClick={() => setActiveImage(i)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 cursor-pointer ${
                        i === activeImage
                          ? "ring-2 ring-rido-magenta ring-offset-2 ring-offset-rido-navy"
                          : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${v.name} view ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
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

              <p className="text-white/50 leading-relaxed">{v.description}</p>

              <StaggerReveal className="grid grid-cols-2 gap-4" staggerDelay={0.08}>
                {v.specs.map((spec) => (
                  <StaggerItem key={spec.label} className="glass rounded-xl p-4 text-center">
                    <p className="text-lg font-bold text-rido-magenta">{spec.value}</p>
                    <p className="text-xs text-white/40">{spec.label}</p>
                  </StaggerItem>
                ))}
              </StaggerReveal>

              <div className="grid grid-cols-2 gap-2">
                {v.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-rido-green shrink-0" />
                    <span className="text-white/60">{feature}</span>
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