"use client";

import { cities, activeCityCount } from "@/data/cities";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MapPin, Zap, Bike } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StaggerReveal, StaggerItem } from "@/components/ui/StaggerReveal";

export function Cities() {
  return (
    <section id="cities" aria-label="Cities where we operate" className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <ScrollReveal>
            <p className="text-rido-magenta text-sm font-semibold uppercase tracking-wider mb-3">
              {activeCityCount}+ Cities
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">
              Where to <span className="text-gradient-brand">Find Us</span>
            </h2>
            <p className="mt-4 text-white/50 max-w-xl mx-auto">
              Rido operates across Spain&apos;s most vibrant cities. More locations arriving soon.
            </p>
          </ScrollReveal>
        </div>

        <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" staggerDelay={0.08}>
          {cities.map((city) => (
            <StaggerItem key={city.slug}>
              <Card className="group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-rido-magenta/10 flex items-center justify-center shrink-0 group-hover:bg-rido-magenta/20 transition-colors">
                    <MapPin className="w-5 h-5 text-rido-magenta" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{city.name}</h3>
                      {city.comingSoon && (
                        <Badge variant="magenta-light" className="cursor-default">Coming Soon</Badge>
                      )}
                    </div>
                    <p className="text-sm text-white/40">{city.region}</p>
                    <div className="mt-2 flex gap-2">
                      {city.vehicles.map((v) => (
                        <Badge
                          key={v}
                          variant={v === "e-scooter" ? "magenta" : "green"}
                          className="cursor-default"
                        >
                          {v === "e-scooter" ? (
                            <><Zap className="w-3 h-3" /> E-Scooter</>
                          ) : (
                            <><Bike className="w-3 h-3" /> E-Bike</>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}