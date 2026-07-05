"use client";

import { Card } from "@/components/ui/Card";
import { Shield, HardHat, WineOff, User, Star } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
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
    <section id="safety" aria-label="Safety information" className="py-12 sm:py-24 px-4 sm:px-6 relative overflow-hidden section-tint-magenta">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.02]">
        <Shield className="w-[400px] h-[400px] text-white" strokeWidth={0.5} />
      </div>
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <SectionHeading
            eyebrow="Your Safety Matters"
            before="Ride"
            highlight="Safely"
            className="text-3xl sm:text-4xl md:text-5xl font-black"
          />
          <ScrollReveal>
            <p className="mt-4 text-muted max-w-xl mx-auto">Safety is not optional — it&apos;s the foundation of everything we do.</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="mt-4 flex items-center justify-center gap-1">
              {[1,2,3,4,5].map((i) => (<Star key={i} className="w-4 h-4 fill-rido-yellow text-rido-yellow" />))}
              <span className="ml-2 text-sm text-muted">Safety Rating</span>
            </div>
          </ScrollReveal>
        </div>
        <StaggerReveal className="mobile-carousel md:grid md:grid-cols-2 gap-6" staggerDelay={0.1}>
          {safetyItems.map((item) => (
            <StaggerItem key={item.title}>
              <Card className="flex items-start gap-5 group hover:border-rido-magenta/30">
                <div className="w-12 h-12 rounded-2xl bg-rido-magenta/10 flex items-center justify-center shrink-0 transition-all duration-200 group-hover:bg-rido-magenta/20 group-hover:scale-110">
                  <item.icon className="w-6 h-6 text-rido-magenta transition-transform duration-200 group-hover:scale-110" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{item.description}</p>
                </div>
              </Card>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}
