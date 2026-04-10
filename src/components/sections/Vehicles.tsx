"use client";

import { useState } from "react";
import { vehicles } from "@/data/vehicles";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Check } from "lucide-react";
import Image from "next/image";

export function Vehicles() {
  const [active, setActive] = useState(0);
  const v = vehicles[active];

  return (
    <section id="vehicles" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-rido-coral text-sm font-semibold uppercase tracking-wider mb-3">
            Our Fleet
          </p>
          <h2 className="text-4xl md:text-5xl font-black">
            Choose Your <span className="text-gradient-coral">Ride</span>
          </h2>
        </div>

        <div className="flex justify-center gap-4 mb-12">
          {vehicles.map((vehicle, i) => (
            <button
              key={vehicle.id}
              onClick={() => setActive(i)}
              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                i === active
                  ? "bg-rido-coral text-white shadow-lg shadow-rido-coral/25"
                  : "glass text-white/60 hover:text-white"
              }`}
            >
              {vehicle.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="overflow-hidden p-0">
            <div className="relative aspect-[4/3] bg-gradient-to-br from-white/5 to-rido-coral/10 flex items-center justify-center">
              <Image
                src={v.image}
                alt={v.imageAlt}
                fill
                className="object-cover"
                priority
              />
            </div>
          </Card>

          <div className="flex flex-col justify-center gap-6">
            <div>
              <Badge variant="coral" className="mb-3">
                {v.type === "e-scooter" ? "E-Scooter" : "E-Bike"}
              </Badge>
              <h3 className="text-3xl font-black">{v.name}</h3>
              <p className="text-rido-coral font-semibold mt-1">{v.tagline}</p>
            </div>

            <p className="text-white/50 leading-relaxed">{v.description}</p>

            <div className="grid grid-cols-2 gap-4">
              {v.specs.map((spec) => (
                <div
                  key={spec.label}
                  className="glass rounded-xl p-4 text-center"
                >
                  <p className="text-lg font-bold text-rido-coral">
                    {spec.value}
                  </p>
                  <p className="text-xs text-white/40">{spec.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {v.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-rido-green shrink-0" />
                  <span className="text-white/60">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}