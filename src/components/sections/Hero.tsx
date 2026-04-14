"use client";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ChevronDown } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StaggerReveal, StaggerItem } from "@/components/ui/StaggerReveal";
import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";
import { withBase } from "@/lib/basePath";

function HeroStat({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  const { count, ref } = useCountUp(value, { duration: 2000 });
  return (
    <StaggerItem ref={ref} className="text-center">
      <p className="text-2xl sm:text-3xl font-bold text-white">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-xs sm:text-sm">{label}</p>
    </StaggerItem>
  );
}

export function Hero() {
  return (
    <section className="relative min-h-screen min-h-dvh flex items-center justify-center overflow-hidden pt-14 sm:pt-20">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-rido-navy via-rido-navy to-rido-magenta/20 hero-gradient" />
      {/* Background image with increased opacity */}
      <div className="absolute inset-0 bg-cover bg-center opacity-[0.12]" style={{ backgroundImage: `url(${withBase('/images/lifestyle/rido-rider-street.jpg')})` }} />
      {/* Animated floating orbs */}
      <div className="absolute top-1/4 right-0 w-[200px] sm:w-[600px] h-[200px] sm:h-[600px] rounded-full bg-rido-magenta/10 blur-3xl hero-orb hero-orb-1" />
      <div className="absolute bottom-0 left-0 w-[150px] sm:w-[400px] h-[150px] sm:h-[400px] rounded-full bg-rido-green/10 blur-3xl hero-orb hero-orb-2" />
      <div className="absolute top-1/2 left-1/3 w-[120px] sm:w-[300px] h-[120px] sm:h-[300px] rounded-full bg-rido-magenta-light/5 blur-3xl hero-orb hero-orb-3" />
      {/* Micro-particles for depth */}
      <motion.div
        className="absolute top-[20%] left-[15%] w-1.5 h-1.5 rounded-full bg-rido-magenta/30"
        animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[60%] right-[20%] w-1 h-1 rounded-full bg-rido-magenta-light/40"
        animate={{ y: [0, -15, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute top-[40%] right-[35%] w-2 h-2 rounded-full bg-rido-green/20"
        animate={{ y: [0, -12, 0], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center py-6 sm:py-12 pb-20 sm:pb-16">
        <ScrollReveal delay={0.1}>
          <Badge variant="magenta" className="mb-4 sm:mb-6">
            Now available across Spain
          </Badge>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] sm:leading-[0.9]">
            Move <span className="text-gradient-brand">Freely</span>
            <br />
            Across Spain
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
            Shared e-scooters and e-bikes in Spain&apos;s most vibrant cities.
            Download the app, scan, and ride. Zero emissions, zero hassle.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.6}>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Button size="lg" className="w-full max-w-[280px] sm:w-auto">
                Download the App
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.95, duration: 0.5 }}
            >
              <Button variant="secondary" size="lg" className="w-full max-w-[280px] sm:w-auto">
                See How It Works
              </Button>
            </motion.div>
          </div>
        </ScrollReveal>

        <StaggerReveal className="mt-10 sm:mt-16 grid grid-cols-3 gap-3 sm:gap-12 text-white/40" staggerDelay={0.15}>
          <HeroStat value={8} suffix="+" label="Cities" />
          <HeroStat value={2} label="Vehicle Types" />
          <HeroStat value={0} label="Emissions" />
        </StaggerReveal>
      </div>

      <a
        href="#how-it-works"
        className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 text-white/30 motion-safe:animate-bounce"
        aria-label="Scroll down"
      >
        <ChevronDown size={28} className="sm:w-8 sm:h-8" />
      </a>
    </section>
  );
}