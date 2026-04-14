"use client";

import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Apple, Play, Shield, Smartphone, CreditCard, MapPin } from "lucide-react";

const trustSignals = [
  { icon: Smartphone, text: "Free to download" },
  { icon: CreditCard, text: "No credit card needed" },
  { icon: MapPin, text: "Available in Costa del Sol" },
];

export function DownloadCTA() {
  return (
    <section aria-label="Download the Rido app" className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-rido-magenta/20 via-rido-navy to-rido-magenta-light/10 hero-gradient" />
      {/* Floating orbs */}
      <div className="absolute top-0 right-0 w-[280px] sm:w-[400px] h-[280px] sm:h-[400px] rounded-full bg-rido-magenta/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] rounded-full bg-rido-magenta-light/8 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-rido-magenta/5 blur-3xl" />

      <div className="relative max-w-7xl mx-auto text-center">
        <ScrollReveal>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-4 sm:mb-6">
            Ready to{" "}
            <span className="text-gradient-brand">Ride</span>?
          </h2>
          <p className="text-lg text-white/50 max-w-lg mx-auto mb-10">
            Download the Rido app and start moving freely across Spain. Your first
            ride is waiting.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8">
            <Button size="lg" className="w-full max-w-[280px] sm:w-auto gap-3">
              <Apple className="w-5 h-5 shrink-0" />
              <span className="flex flex-col items-start">
                <span className="text-[10px] leading-tight opacity-70">Download on the</span>
                <span className="text-sm leading-tight font-bold">App Store</span>
              </span>
            </Button>
            <Button variant="secondary" size="lg" className="w-full max-w-[280px] sm:w-auto gap-3">
              <Play className="w-5 h-5 shrink-0" />
              <span className="flex flex-col items-start">
                <span className="text-[10px] leading-tight opacity-70">Get it on</span>
                <span className="text-sm leading-tight font-bold">Google Play</span>
              </span>
            </Button>
          </div>
        </ScrollReveal>

        {/* Trust signals */}
        <ScrollReveal delay={0.35}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-white/40 text-sm">
            {trustSignals.map((signal) => (
              <div key={signal.text} className="flex items-center gap-2">
                <signal.icon className="w-4 h-4 text-rido-magenta/60" />
                <span>{signal.text}</span>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Security badge */}
        <ScrollReveal delay={0.5}>
          <div className="mt-8 flex items-center justify-center gap-2 text-white/30 text-xs">
            <Shield className="w-3.5 h-3.5" />
            <span>Insured rides · GDPR compliant · Data protected</span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}