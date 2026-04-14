"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Shield, HardHat, WineOff, User, Gauge, Star } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StaggerReveal, StaggerItem } from "@/components/ui/StaggerReveal";

const safetyItems = [
  { icon: HardHat, title: "Helmet First", description: "Always wear a helmet. We include one with every scooter and offer helmet rewards in the app." },
  { icon: User, title: "One Rider Only", description: "One scooter, one rider. Our tandem detection system ensures nobody doubles up." },
  { icon: WineOff, title: "Stay Sober", description: "No riding under the influence. At peak hours, a cognitive reaction test may be required to unlock." },
  { icon: Shield, title: "Park Responsibly", description: "Park in designated areas shown in the app. Keep sidewalks clear for pedestrians and accessibility." },
];

export function Safety() {
  return (
    <section id="safety" aria-label="Safety information" className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden section-tint-magenta">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.02]">
        <Shield className="w-[400px] h-[400px] text-white" strokeWidth={0.5} />
      </div>
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <ScrollReveal>
            <p className="text-rido-magenta text-sm font-semibold uppercase tracking-wider mb-3">Your Safety Matters</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">Ride <span className="text-gradient-brand">Safely</span></h2>
            <p className="mt-4 text-white/50 max-w-xl mx-auto">Safety is not optional — it&apos;s the foundation of everything we do.</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="mt-4 flex items-center justify-center gap-1">
              {[1,2,3,4,5].map((i) => (<Star key={i} className="w-4 h-4 fill-rido-yellow text-rido-yellow" />))}
              <span className="ml-2 text-sm text-white/50">Safety Rating</span>
            </div>
          </ScrollReveal>
        </div>
        <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12" staggerDelay={0.1}>
          {safetyItems.map((item) => (
            <StaggerItem key={item.title}>
              <Card className="flex items-start gap-5 group hover:border-rido-magenta/30">
                <div className="w-12 h-12 rounded-2xl bg-rido-magenta/10 flex items-center justify-center shrink-0 transition-all duration-200 group-hover:bg-rido-magenta/20 group-hover:scale-110">
                  <item.icon className="w-6 h-6 text-rido-magenta transition-transform duration-200 group-hover:scale-110" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{item.description}</p>
                  <p className="text-xs text-rido-magenta/0 group-hover:text-rido-magenta/60 transition-all duration-300 mt-1 max-h-0 group-hover:max-h-6 overflow-hidden">Tap to learn more →</p>
                </div>
              </Card>
            </StaggerItem>
          ))}
        </StaggerReveal>
        <ScrollReveal delay={0.3}>
          <Card className="max-w-2xl mx-auto text-center border-rido-magenta/30 relative overflow-hidden">
            <div className="absolute inset-0 rounded-2xl border-2 border-rido-magenta/40 animate-pulse-slow pointer-events-none" />
            <div className="relative z-10 p-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Gauge className="w-6 h-6 text-rido-magenta-light" />
                <h3 className="text-xl font-bold">Beginner Mode</h3>
              </div>
              <p className="text-white/50 text-sm mb-4">New to e-scooters? Your first 5 rides are speed-capped at 15 km/h so you can build confidence safely.</p>
              <Badge variant="magenta-light" className="cursor-default">Automatic for new riders</Badge>
            </div>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  );
}
