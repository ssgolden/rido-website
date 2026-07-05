"use client";

import { cities, activeCityCount } from "@/data/cities";
import { Badge } from "@/components/ui/Badge";
import { MapPin, Zap, Bike } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CoverageMap } from "@/components/ui/CoverageMap";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StaggerReveal, StaggerItem } from "@/components/ui/StaggerReveal";

export function Cities() {
  return (
    <section id="cities" aria-label="Cities where we operate" className="py-12 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-rido-magenta/5 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <SectionHeading
            eyebrow={activeCityCount > 0 ? `${activeCityCount} Cities` : "Coming Soon"}
            before="Where to"
            highlight="Find Us"
            className="text-3xl sm:text-4xl md:text-5xl font-black"
          />
          <ScrollReveal>
            <p className="mt-4 text-muted max-w-xl mx-auto">Rido is launching on the Costa del Sol. Here are the cities we&apos;re bringing our fleet to.</p>
          </ScrollReveal>
        </div>

        {/* Real coverage map (MapLibre + OpenFreeMap, lazy-loaded; falls back to the SVG visualization) */}
        <ScrollReveal delay={0.1}>
          <div className="relative mb-16 flex justify-center">
            <CoverageMap />
          </div>
        </ScrollReveal>

        {/* City cards */}
        <StaggerReveal className="mobile-carousel md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5" staggerDelay={0.08}>
          {cities.map((city) => (
            <StaggerItem key={city.slug}>
              <div className="group glass rounded-2xl p-5 sm:p-6 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-rido-magenta/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-rido-magenta/5">
                <div className="flex items-start gap-4">
                  <div className="relative w-11 h-11 rounded-xl bg-rido-magenta/10 flex items-center justify-center shrink-0 group-hover:bg-rido-magenta/20 transition-colors">
                    <MapPin className="w-5 h-5 text-rido-magenta relative z-10" />
                    <div className="absolute inset-0 rounded-xl bg-rido-magenta/20 city-pulse-ring" style={{ animationDelay: `${cities.indexOf(city) * 0.2}s` }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-lg sm:text-xl">{city.name}</h3>
                      {city.comingSoon && (
                        <Badge variant="magenta-light" className="cursor-default">
                          <span className="coming-soon-blink">Coming Soon</span>
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted mt-0.5">{city.region}</p>
                    <div className="mt-3 flex gap-2">
                      {city.vehicles.map((v) => (
                        <Badge key={v} variant={v === "e-scooter" ? "magenta" : "green"} className="cursor-default">
                          {v === "e-scooter" ? <><Zap className="w-3 h-3" /> E-Scooter</> : <><Bike className="w-3 h-3" /> E-Bike</>}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerReveal>

      </div>
    </section>
  );
}