"use client";

import { Badge } from "@/components/ui/Badge";
import { ArrowRight, MapPin, Bike, Leaf, Shield } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StaggerReveal, StaggerItem } from "@/components/ui/StaggerReveal";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef, useMemo } from "react";
import Image from "next/image";
import { useCountUp } from "@/hooks/useCountUp";
import { withBase } from "@/lib/basePath";
import { RidoLogo } from "@/components/ui/RidoLogo";
import { vehicles } from "@/data/vehicles";

// Noise overlay (SVG turbulence) — used to break gradient banding on dark surfaces.
const NOISE_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0"/></filter><rect width="100%" height="100%" filter="url(%23n)"/></svg>'
  );

// Stats config — all white, with eyebrow icons + tabular numerals.
const stats = [
  { icon: MapPin, value: 5, suffix: "", label: "Launch Cities" },
  { icon: Bike, value: vehicles.length, suffix: "", label: "Vehicle Types" },
  { icon: Leaf, value: 0, suffix: "", label: "Direct Emissions", text: "Zero", green: true },
];

function HeroStat({ stat }: { stat: (typeof stats)[number] }) {
  const isText = "text" in stat;
  const { count, ref, visible } = useCountUp(stat.value, { duration: 1600 });
  return (
    <StaggerItem ref={ref} className="text-center min-w-0">
      <stat.icon className="w-3.5 h-3.5 mx-auto mb-2 text-white/40" aria-hidden="true" />
      <p
        className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight tabular-nums ${stat.green ? "text-rido-green" : "text-white"}`}
        style={{ opacity: visible ? 1 : 0 }}
        suppressHydrationWarning
      >
        {isText ? stat.text : count.toLocaleString()}
      </p>
      <p className="mt-1 text-[10px] sm:text-xs uppercase tracking-[0.15em] text-white/40">{stat.label}</p>
    </StaggerItem>
  );
}

// Linear/Vercel-style easeOutQuint — confident, not mushy.
const EASE = [0.22, 1, 0.36, 1] as const;

// One word array, one variants block — manual <br/> between line 1 and line 2.
// Non-breaking spaces inside "Costa\u00A0del\u00A0Sol" keep the launch region as one unit.
const headlineWords = [
  "Move",
  "Freely",
  "Across",
  "the",
  "Costa\u00A0del\u00A0Sol",
] as const;

const wordVariants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE },
  },
};

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // Scroll-driven parallax — only when motion is allowed.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgYRaw = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const bgY = reduce ? "0%" : bgYRaw;
  const contentOpacityRaw = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.85, 0]);
  const contentOpacity = reduce ? 1 : contentOpacityRaw;

  // Group indices: 0..2 line 1, 3..4 line 2.
  const wordGroup = useMemo(() => new Set([3, 4]), []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-labelledby="hero-heading"
      className="relative min-h-dvh flex items-center justify-center overflow-hidden pt-[max(3.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]"
    >
      {/* Top edge highlight — premium dark panel cue */}
      <div
        aria-hidden="true"
        className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
      />

      {/* Deep navy base + animated brand gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-rido-navy via-rido-navy to-rido-magenta/15 hero-gradient" />

      {/* Lifestyle photo: full-bleed, low opacity, subtle parallax */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <Image
          src={withBase("/images/lifestyle/rido-rider-street.jpg")}
          alt=""
          role="presentation"
          fill
          sizes="100vw"
          className="object-cover opacity-[0.12]"
          priority
          fetchPriority="high"
          decoding="sync"
        />
      </motion.div>

      {/* Brand color cast — injects magenta into the photo */}
      <div
        aria-hidden="true"
        className="absolute inset-0 mix-blend-color"
        style={{ background: "rgba(222,4,152,0.18)" }}
      />

      {/* Vignette + bottom fade for readability */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 35%, transparent 30%, rgba(15,23,42,0.7) 100%)" }}
      />
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none bg-gradient-to-b from-rido-navy/40 via-transparent to-rido-navy" />

      {/* Soft ambient orbs — breathing */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 -right-24 w-[400px] sm:w-[700px] h-[400px] sm:h-[700px] rounded-full bg-rido-magenta/8 blur-[100px] hero-orb hero-orb-1"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 -left-24 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-rido-green/15 blur-[90px] hero-orb hero-orb-2"
      />

      {/* Film grain — kills gradient banding, premium cue */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: `url("${NOISE_SVG}")` }}
      />

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-2 sm:px-6 text-center py-6 sm:py-12 pb-24 sm:pb-20"
        style={{ opacity: contentOpacity }}
      >
        <ScrollReveal delay={0.05}>
          <div className="mb-5 sm:mb-7 flex justify-center">
            <RidoLogo variant="hero" size="lg" />
          </div>
        </ScrollReveal>

        {/* Social-proof kicker above the badge */}
        <ScrollReveal delay={0.1}>
          <div className="mb-3 sm:mb-4 inline-flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/50">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rido-green/60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rido-green" />
            </span>
            <span>1,200+ riders on the waitlist</span>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.18}>
          <Badge variant="magenta" className="mb-5 sm:mb-7">
            Launching the Costa del Sol
          </Badge>
        </ScrollReveal>

        {/* Headline — animate="visible" (not whileInView) so first paint reveals the H1, not after a frame. */}
        <motion.h1
          id="hero-heading"
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-[-0.02em] leading-[1.05] sm:leading-[1.02] md:leading-[0.98] text-balance"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: reduce ? 0 : 0.09, delayChildren: 0.2 } },
          }}
        >
          {headlineWords.map((w, i) => (
            <motion.span
              key={`${w}-${i}`}
              className={`inline-block ${wordGroup.has(i) ? "text-gradient-animated" : ""}`}
              variants={wordVariants}
            >
              {w}
              {i < headlineWords.length - 1 ? "\u00A0" : ""}
              {i === 2 ? <br className="hidden sm:inline" aria-hidden="true" /> : null}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduce ? 0 : 0.9, duration: 0.6, ease: EASE }}
          className="mt-6 sm:mt-7 text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-snug px-2 sm:px-0 [text-shadow:0_1px_2px_rgba(0,0,0,0.55)]"
        >
          Spain&apos;s first locally-built shared e-scooter and e-bike service. Zero emissions. Swappable batteries. Real human support in your timezone.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduce ? 0 : 1.05, duration: 0.55, ease: EASE }}
          className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
        >
          <a
            href="#download"
            className="group relative inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-rido-magenta text-white font-semibold text-base shadow-[0_8px_30px_rgba(222,4,152,0.35)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(222,4,152,0.5)] hover:brightness-110 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-rido-navy w-full max-w-[320px] sm:w-auto"
          >
            <span>Reserve My First Ride</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
          </a>
          <a
            href="#how-it-works"
            className="group relative inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white/[0.06] backdrop-blur-xl text-white font-semibold text-base border border-white/15 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18)] transition-all duration-300 ease-out hover:bg-white/[0.1] hover:border-white/25 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-rido-navy w-full max-w-[320px] sm:w-auto"
          >
            <span>Watch 30-sec Demo</span>
          </a>
        </motion.div>

        {/* Microcopy under CTAs — risk reversal + social proof */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduce ? 0 : 1.25, duration: 0.5 }}
          className="mt-5 inline-flex items-center gap-2 text-xs text-white/55"
        >
          <Shield className="w-3.5 h-3.5" aria-hidden="true" />
          No spam, unsubscribe anytime · GDPR compliant
        </motion.p>

        <StaggerReveal
          className="mt-12 sm:mt-16 grid grid-cols-3 gap-4 sm:gap-10 text-white/85 divide-x divide-white/10"
          staggerDelay={0.12}
        >
          {stats.map((s) => (
            <HeroStat key={s.label} stat={s} />
          ))}
        </StaggerReveal>
      </motion.div>

      {/* Scroll cue — labelled, refined, fades on scroll */}
      <a
        href="#how-it-works"
        aria-label="Scroll to next section"
        className="group absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/55 hover:text-rido-magenta transition-colors min-h-[44px] min-w-[44px] justify-center"
      >
        <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
        <span className="relative flex h-7 w-px bg-white/20 overflow-hidden">
          <span className="absolute inset-x-0 top-0 h-1.5 bg-rido-magenta motion-safe:animate-[scroll-dot_1.8s_ease-in-out_infinite]" />
        </span>
      </a>
    </section>
  );
}
