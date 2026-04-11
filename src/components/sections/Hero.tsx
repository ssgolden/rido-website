"use client";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ChevronDown } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StaggerReveal, StaggerItem } from "@/components/ui/StaggerReveal";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-rido-navy via-rido-navy to-rido-magenta/20" />
      <div className="absolute inset-0 bg-[url('/images/lifestyle/rido-rider-street.jpg')] bg-cover bg-center opacity-[0.07]" />
      <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-rido-magenta/10 blur-3xl" />
      <div className="absolute -bottom-1/4 -left-1/4 w-[400px] h-[400px] rounded-full bg-rido-green/10 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center pt-24">
        <ScrollReveal delay={0.1}>
          <Badge variant="magenta" className="mb-6">
            Now available across Spain
          </Badge>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9]">
            Move <span className="text-gradient-brand">Freely</span>
            <br />
            Across Spain
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <p className="mt-6 text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            Shared e-scooters and e-bikes in Spain&apos;s most vibrant cities.
            Download the app, scan, and ride. Zero emissions, zero hassle.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.6}>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Button size="lg">Download the App</Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.95, duration: 0.5 }}
            >
              <Button variant="secondary" size="lg">
                See How It Works
              </Button>
            </motion.div>
          </div>
        </ScrollReveal>

        <StaggerReveal className="mt-16 grid grid-cols-3 gap-4 sm:gap-12 text-white/40" staggerDelay={0.15}>
          <StaggerItem className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-white">8+</p>
            <p className="text-xs sm:text-sm">Cities</p>
          </StaggerItem>
          <StaggerItem className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-white">2</p>
            <p className="text-xs sm:text-sm">Vehicle Types</p>
          </StaggerItem>
          <StaggerItem className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-white">0</p>
            <p className="text-xs sm:text-sm">Emissions</p>
          </StaggerItem>
        </StaggerReveal>
      </div>

      <a
        href="#how-it-works"
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 motion-safe:animate-bounce"
        aria-label="Scroll down"
      >
        <ChevronDown size={32} />
      </a>
    </section>
  );
}