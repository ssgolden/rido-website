"use client";

import { cities, activeCityCount } from "@/data/cities";
import { Badge } from "@/components/ui/Badge";
import { MapPin, Zap, Bike } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StaggerReveal, StaggerItem } from "@/components/ui/StaggerReveal";

export function Cities() {
  return (
    <section id="cities" aria-label="Cities where we operate" className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-rido-magenta/5 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-16">
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

        {/* Animated map visualization */}
        <ScrollReveal delay={0.1}>
          <div className="relative mb-16 flex justify-center">
            <div className="relative w-full max-w-3xl h-[200px] sm:h-[260px] rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 260" preserveAspectRatio="xMidYMid meet">
                {/* Coastline path */}
                <path d="M40,180 Q120,140 200,155 Q300,170 380,120 Q460,80 560,100 Q640,110 720,85 Q760,75 780,80" fill="none" stroke="#DE0498" strokeWidth="1" strokeDasharray="6 8" opacity="0.15" className="dash-flow" />
                {/* Sea area */}
                <path d="M40,180 Q120,140 200,155 Q300,170 380,120 Q460,80 560,100 Q640,110 720,85 Q760,75 780,80 L780,260 L40,260 Z" fill="rgba(222,4,152,0.02)"/>

                {/* Connection lines between cities */}
                {cities.map((city, i) => {
                  if (i === 0) return null;
                  const total = cities.length;
                  const margin = 80;
                  const available = 800 - margin * 2;
                  const step = total > 1 ? available / (total - 1) : 0;
                  const prevX = margin + step * (i - 1);
                  const prevY = 120 + ((i - 1) % 2 === 0 ? 20 : -25);
                  const currX = margin + step * i;
                  const currY = 120 + (i % 2 === 0 ? 20 : -25);
                  return (
                    <line key={`line-${city.slug}`} x1={prevX} y1={prevY} x2={currX} y2={currY} stroke="#DE0498" strokeWidth="0.8" strokeDasharray="3 5" opacity="0.15" className="dash-flow-short" />
                  );
                })}

                {/* City markers */}
                {cities.map((city, i) => {
                  const total = cities.length;
                  const margin = 80;
                  const available = 800 - margin * 2;
                  const step = total > 1 ? available / (total - 1) : 0;
                  const x = margin + step * i;
                  const y = 120 + (i % 2 === 0 ? 20 : -25);
                  return (
                    <g key={city.slug}>
                      {/* Outer pulse ring */}
                      <circle cx={x} cy={y} r="6" fill="none" stroke="#DE0498" strokeWidth="0.8" opacity="0.4" className="city-pulse-ring" style={{ animationDelay: `${i * 0.4}s` }} />
                      {/* Middle ring */}
                      <circle cx={x} cy={y} r="8" fill="none" stroke="#DE0498" strokeWidth="0.5" opacity="0.2" />
                      {/* Inner dot */}
                      <circle cx={x} cy={y} r="4" fill="#DE0498" opacity="0.9" className="city-dot-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                      {/* Glow */}
                      <circle cx={x} cy={y} r="12" fill="#DE0498" opacity="0.08" />
                      {/* City name */}
                      <text x={x} y={y - 14} textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize="11" fontFamily="Inter" fontWeight="700">{city.name}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </ScrollReveal>

        {/* City cards */}
        <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5" staggerDelay={0.08}>
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