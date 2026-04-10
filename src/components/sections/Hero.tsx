"use client";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ChevronDown } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-rido-navy via-rido-navy to-rido-coral/20" />
      <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-rido-coral/10 blur-3xl" />
      <div className="absolute -bottom-1/4 -left-1/4 w-[400px] h-[400px] rounded-full bg-rido-green/10 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center pt-24">
        <Badge variant="coral" className="mb-6">
          Now available across Spain
        </Badge>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9]">
          Move <span className="text-gradient-coral">Freely</span>
          <br />
          Across Spain
        </h1>

        <p className="mt-6 text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
          Shared e-scooters and e-bikes in Spain&apos;s most vibrant cities.
          Download the app, scan, and ride. Zero emissions, zero hassle.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="animate-pulse-glow">
            Download the App
          </Button>
          <Button variant="secondary" size="lg">
            See How It Works
          </Button>
        </div>

        <div className="mt-16 flex items-center justify-center gap-12 text-white/40">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">8+</p>
            <p className="text-sm">Cities</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-center">
            <p className="text-3xl font-bold text-white">2</p>
            <p className="text-sm">Vehicle Types</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-center">
            <p className="text-3xl font-bold text-white">0</p>
            <p className="text-sm">Emissions</p>
          </div>
        </div>
      </div>

      <a
        href="#how-it-works"
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 animate-bounce"
        aria-label="Scroll down"
      >
        <ChevronDown size={32} />
      </a>
    </section>
  );
}