"use client";

import { cities, activeCityCount } from "@/data/cities";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MapPin } from "lucide-react";

export function Cities() {
  return (
    <section id="cities" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-rido-magenta text-sm font-semibold uppercase tracking-wider mb-3">
            {activeCityCount}+ Cities
          </p>
          <h2 className="text-4xl md:text-5xl font-black">
            Where to <span className="text-gradient-brand">Find Us</span>
          </h2>
          <p className="mt-4 text-white/50 max-w-xl mx-auto">
            Rido operates across Spain&apos;s most vibrant cities. More locations arriving soon.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cities.map((city) => (
            <Card key={city.slug} className="group">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-rido-magenta/10 flex items-center justify-center shrink-0 group-hover:bg-rido-magenta/20 transition-colors">
                  <MapPin className="w-5 h-5 text-rido-magenta" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{city.name}</h3>
                    {city.comingSoon && (
                      <Badge variant="magenta-light">Coming Soon</Badge>
                    )}
                  </div>
                  <p className="text-sm text-white/40">{city.region}</p>
                  <div className="mt-2 flex gap-2">
                    {city.vehicles.map((v) => (
                      <Badge
                        key={v}
                        variant={v === "e-scooter" ? "magenta" : "green"}
                      >
                        {v === "e-scooter" ? "🛴 E-Scooter" : "🚲 E-Bike"}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}