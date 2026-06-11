"use client";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ChevronDown, MousePointer } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StaggerReveal, StaggerItem } from "@/components/ui/StaggerReveal";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { useCountUp } from "@/hooks/useCountUp";
import { withBase } from "@/lib/basePath";
import { RidoLogo } from "@/components/ui/RidoLogo";
import { vehicles } from "@/data/vehicles";

function HeroStat({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  const { count, ref, visible } = useCountUp(value, { duration: 2000 });
  return (
    <StaggerItem ref={ref} className="text-center">
      <p className="text-2xl sm:text-3xl font-bold text-white transition-opacity duration-300" style={{ opacity: visible ? 1 : 0 }} suppressHydrationWarning>
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-xs sm:text-sm">{label}</p>
    </StaggerItem>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

  return (
    <section ref={sectionRef} className="relative min-h-screen min-h-dvh flex items-center justify-center overflow-hidden pt-14 sm:pt-20">
      <div className="absolute inset-0 bg-gradient-to-br from-rido-navy via-rido-navy to-rido-magenta/20 hero-gradient" />
      
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <Image
          src={withBase('/images/lifestyle/rido-rider-street.jpg')}
          alt="Rido rider on an e-scooter in a Spanish city street"
          fill
          sizes="100vw"
          className="object-cover opacity-[0.18]"
          priority
        />
      </motion.div>

      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(15,23,42,0.6) 100%)" }} />
      
      <div className="absolute top-1/4 right-0 w-[200px] sm:w-[600px] h-[200px] sm:h-[600px] rounded-full bg-rido-magenta/10 blur-3xl hero-orb hero-orb-1" />
      <div className="absolute bottom-0 left-0 w-[150px] sm:w-[400px] h-[150px] sm:h-[400px] rounded-full bg-rido-green/10 blur-3xl hero-orb hero-orb-2" />
      <div className="absolute top-1/2 left-1/3 w-[120px] sm:w-[300px] h-[120px] sm:h-[300px] rounded-full bg-rido-magenta-light/5 blur-3xl hero-orb hero-orb-3" />
      
      <motion.div className="absolute top-[70%] left-[5%] opacity-[0.03] pointer-events-none" animate={{ x: [0, 30, 0], y: [0, -10, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}>
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1"><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><path d="M5 19h2l3-7h4l2 3h3"/></svg>
      </motion.div>

      <motion.div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center py-6 sm:py-12 pb-20 sm:pb-16" style={{ opacity: contentOpacity }}>
        <ScrollReveal delay={0.05}>
          <div className="mb-4 sm:mb-6">
            <RidoLogo variant="hero" size="xl" />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <Badge variant="magenta" className="mb-4 sm:mb-6">Now live on the Costa del Sol</Badge>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <motion.h1
            aria-label="Move Freely Across Spain"
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] sm:leading-[0.9]"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {["Move", "Freely"].map((w) => (
              <motion.span
                key={w}
                className={cn("inline-block mr-[0.25em] will-change-transform", w === "Freely" ? "text-gradient-animated" : "")}
                variants={{
                  hidden: { opacity: 0, filter: "blur(10px)", y: 30 },
                  visible: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
                }}
              >
                {w}
              </motion.span>
            ))}
            <br className="hidden sm:block" />
            {["Across", "Spain"].map((w) => (
              <motion.span
                key={w}
                className="inline-block mr-[0.25em] will-change-transform"
                variants={{
                  hidden: { opacity: 0, filter: "blur(10px)", y: 30 },
                  visible: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
                }}
              >
                {w}
              </motion.span>
            ))}
          </motion.h1>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-muted-strong max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
            Shared e-scooters and e-bikes on the Costa del Sol.
            Download the app, scan, and ride. Zero emissions, zero hassle.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.6}>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8, duration: 0.5 }} className="relative group">
              <span className="absolute inset-0 rounded-xl bg-rido-magenta/30 blur-xl scale-110 group-hover:scale-125 transition-transform duration-500 animate-pulse-slow" />
              <Button as="a" href="#download" size="lg" className="relative w-full max-w-[280px] sm:w-auto">Download the App</Button>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.95, duration: 0.5 }}>
              <Button as="a" href="#how-it-works" variant="secondary" size="lg" className="w-full max-w-[280px] sm:w-auto">See How It Works</Button>
            </motion.div>
          </div>
        </ScrollReveal>

        <StaggerReveal className="mt-10 sm:mt-16 grid grid-cols-3 gap-3 sm:gap-12 text-muted" staggerDelay={0.15}>
          <HeroStat value={5} suffix="+" label="Cities" />
          <HeroStat value={vehicles.length} label="Vehicle Types" />
          <StaggerItem className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-rido-green">Zero</p>
            <p className="text-xs sm:text-sm">Emissions</p>
          </StaggerItem>
        </StaggerReveal>
      </motion.div>

      <a href="#how-it-works" className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-weak motion-safe:animate-bounce" aria-label="Scroll down">
        <MousePointer className="w-4 h-4 -rotate-90" />
        <ChevronDown size={28} className="sm:w-8 sm:h-8" />
      </a>
    </section>
  );
}
