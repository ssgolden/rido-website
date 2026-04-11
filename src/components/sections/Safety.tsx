"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Shield, HardHat, WineOff, User, Gauge } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StaggerReveal, StaggerItem } from "@/components/ui/StaggerReveal";

const safetyItems = [
  {
    icon: HardHat,
    title: "Helmet First",
    description:
      "Always wear a helmet. We include one with every scooter and offer helmet rewards in the app.",
  },
  {
    icon: User,
    title: "One Rider Only",
    description:
      "One scooter, one rider. Our tandem detection system ensures nobody doubles up.",
  },
  {
    icon: WineOff,
    title: "Stay Sober",
    description:
      "No riding under the influence. At peak hours, a cognitive reaction test may be required to unlock.",
  },
  {
    icon: Shield,
    title: "Park Responsibly",
    description:
      "Park in designated areas shown in the app. Keep sidewalks clear for pedestrians and accessibility.",
  },
];

export function Safety() {
  return (
    <section id="safety" aria-label="Safety information" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <ScrollReveal>
            <p className="text-rido-magenta text-sm font-semibold uppercase tracking-wider mb-3">
              Your Safety Matters
            </p>
            <h2 className="text-4xl md:text-5xl font-black">
              Ride <span className="text-gradient-brand">Safely</span>
            </h2>
            <p className="mt-4 text-white/50 max-w-xl mx-auto">
              Safety is not optional — it&apos;s the foundation of everything we do.
            </p>
          </ScrollReveal>
        </div>

        <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12" staggerDelay={0.1}>
          {safetyItems.map((item) => (
            <StaggerItem key={item.title}>
              <Card className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-rido-magenta/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-6 h-6 text-rido-magenta" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </Card>
            </StaggerItem>
          ))}
        </StaggerReveal>

        <ScrollReveal delay={0.3}>
          <Card className="max-w-2xl mx-auto text-center border-rido-magenta/30">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Gauge className="w-6 h-6 text-rido-magenta-light" />
              <h3 className="text-xl font-bold">Beginner Mode</h3>
            </div>
            <p className="text-white/50 text-sm mb-4">
              New to e-scooters? Your first 5 rides are speed-capped at 15 km/h so
              you can build confidence safely.
            </p>
            <Badge variant="magenta-light" className="cursor-default">Automatic for new riders</Badge>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  );
}