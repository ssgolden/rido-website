"use client";

import { cities, activeCityCount } from "@/data/cities";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MapPin, Zap, Bike, Sun } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StaggerReveal, StaggerItem } from "@/components/ui/StaggerReveal";

export function Cities() {
  return (
    <section id="cities" aria-label="Cities where we operate" className="py-16 sm:py-24 px-4 sm:px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <SectionHeading
            eyebrow={`${activeCityCount}+ Cities`}
            before="Where to"
            highlight="Find Us"
            className="text-3xl sm:text-4xl md:text-5xl font-black"
          />
          <ScrollReveal>
            <p className="mt-4 text-white/50 max-w-xl mx-auto">Rido serves the Costa del Sol. More locations arriving soon.</p>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={0.1}>
          <div className="relative mb-12 flex justify-center">
            <div className="relative w-full max-w-2xl h-[120px] sm:h-[160px] rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
              <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 600 160" preserveAspectRatio="xMidYMid meet">
                <path d="M50,80 Q100,40 200,50 Q300,60 350,30 Q400,20 500,40 Q550,50 580,30" fill="none" stroke="#DE0498" strokeWidth="1.5" strokeDasharray="4 6"/>
                <path d="M50,80 Q100,40 200,50 Q300,60 350,30 Q400,20 500,40 Q550,50 580,30 L580,160 L50,160 Z" fill="rgba(222,4,152,0.03)"/>
                {cities.map((city, i) => {
                  const total = cities.length;
                  const margin = 60;
                  const available = 600 - margin * 2;
                  const step = total > 1 ? available / (total - 1) : 0;
                  const x = margin + step * i;
                  const y = 55 + (i % 2 === 0 ? 15 : -20);
                  return (
                    <g key={city.slug}>
                      <circle cx={x} cy={y} r="4" fill="#DE0498" opacity="0.8"/>
                      <circle cx={x} cy={y} r="8" fill="none" stroke="#DE0498" strokeWidth="0.5" opacity="0.4"/>
                      <text x={x} y={y - 10} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="Inter">{city.name}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </ScrollReveal>

        <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" staggerDelay={0.08}>
          {cities.map((city) => (
            <StaggerItem key={city.slug}>
              <Card className="group hover:border-rido-magenta/30">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-rido-magenta/10 flex items-center justify-center shrink-0 group-hover:bg-rido-magenta/20 transition-colors">
                    <MapPin className="w-5 h-5 text-rido-magenta" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{city.name}</h3>
                      {city.comingSoon && <Badge variant="magenta-light" className="cursor-default animate-pulse">Coming Soon</Badge>}
                    </div>
                    <p className="text-sm text-white/40">{city.region}</p>
                    <div className="mt-2 flex gap-2">
                      {city.vehicles.map((v) => (
                        <Badge key={v} variant={v === "e-scooter" ? "magenta" : "green"} className="cursor-default">
                          {v === "e-scooter" ? <><Zap className="w-3 h-3" /> E-Scooter</> : <><Bike className="w-3 h-3" /> E-Bike</>}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-white/0 group-hover:text-white/30 transition-all duration-300">
                      <span className="flex items-center gap-1"><Sun className="w-3 h-3" /> Available now</span>
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
