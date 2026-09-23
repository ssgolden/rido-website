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
import { Magnetic } from "@/components/ui/Magnetic";
import { vehicles } from "@/data/vehicles";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/config";
import type { LucideIcon } from "lucide-react";
import { EASE, STAGGER } from "@/lib/motion";

// Noise overlay (SVG turbulence) — used to break gradient banding on dark surfaces.
const NOISE_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0"/></filter><rect width="100%" height="100%" filter="url(%23n)"/></svg>'
  );

type HeroStatData = {
  icon: LucideIcon;
  value: number;
  suffix: string;
  label: string;
  text?: string;
  green?: boolean;
};

// User-visible strings per locale. Non-breaking spaces keep "Costa del Sol" as one unit.
const en = {
  waitlistKicker: "Waitlist now open — be first to ride",
  badge: "Coming soon to the Costa del Sol",
  headlineWords: ["Move", "Freely", "Across", "the", "Costa del Sol"],
  subheadline:
    "Cheaper than a taxi, cleaner than a rental car, and run by people who live in your city. Built and operated by a local Costa del Sol team — every euro stays here.",
  ctaPrimary: "Join the Waitlist",
  ctaSecondary: "See How It Works",
  microcopy: "No spam, unsubscribe anytime · GDPR compliant",
  scrollAria: "Scroll to next section",
  scrollLabel: "Scroll",
  stats: [
    { icon: MapPin, value: 5, suffix: "", label: "Launch Cities" },
    { icon: Bike, value: vehicles.length, suffix: "", label: "Vehicle Types" },
    { icon: Leaf, value: 0, suffix: "", label: "Direct Emissions", text: "Zero", green: true },
  ] as HeroStatData[],
};

const copy: Record<Locale, typeof en> = {
  en,
  es: {
    waitlistKicker: "Lista de espera abierta — sé de los primeros en moverte",
    badge: "Muy pronto en la Costa del Sol",
    headlineWords: ["Muévete", "libremente", "por", "la", "Costa del Sol"],
    subheadline:
      "Más barato que un taxi, más limpio que un coche de alquiler, y gestionado por gente que vive en tu ciudad. Construido y operado por un equipo local — cada euro se queda en la Costa del Sol.",
    ctaPrimary: "Unirme a la lista",
    ctaSecondary: "Cómo funciona",
    microcopy: "Sin spam, date de baja cuando quieras · Cumplimos el RGPD",
    scrollAria: "Desliza a la siguiente sección",
    scrollLabel: "Desliza",
    stats: [
      { icon: MapPin, value: 5, suffix: "", label: "Ciudades de lanzamiento" },
      { icon: Bike, value: vehicles.length, suffix: "", label: "Tipos de vehículo" },
      { icon: Leaf, value: 0, suffix: "", label: "Emisiones directas", text: "Cero", green: true },
    ] as HeroStatData[],
  },
};

function HeroStat({ stat }: { stat: HeroStatData }) {
  const isText = stat.text !== undefined;
  const { count, ref, visible } = useCountUp(stat.value, { duration: 1600 });
  const displayValue = isText ? stat.text : count.toLocaleString();
  const finalValue = isText ? stat.text : stat.value.toLocaleString();
  return (
    <StaggerItem ref={ref} className="text-center min-w-0" aria-label={`${finalValue} ${stat.label}`}>
      <stat.icon className="w-3.5 h-3.5 mx-auto mb-2 text-white/60" aria-hidden="true" />
      <p
        aria-hidden="true"
        className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight tabular-nums ${stat.green ? "text-rido-green" : "text-white"}`}
        style={{ opacity: visible ? 1 : 0 }}
        suppressHydrationWarning
      >
        {displayValue}
      </p>
      <p className="mt-1 text-[11px] sm:text-xs uppercase tracking-[0.15em] text-white/60">{stat.label}</p>
    </StaggerItem>
  );
}

const EASE_TUPLE = EASE as unknown as [number, number, number, number];

const wordVariants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE_TUPLE },
  },
};

const wordVariantsReduced = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
};

export function Hero() {
  const locale = useLocale();
  const t = copy[locale];
  const headlineWords = t.headlineWords;
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgYRaw = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const bgY = reduce ? "0%" : bgYRaw;
  // Fade content but never below 0.25 — full-vanish bottom half reads gimmicky.
  const contentOpacityRaw = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.85, 0.25]);
  const contentOpacity = reduce ? 1 : contentOpacityRaw;
  const cueOpacityRaw = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const cueOpacity = reduce ? 1 : cueOpacityRaw;

  // Group indices: 0..2 line 1, 3..4 line 2.
  const wordGroup = useMemo(() => new Set([3, 4]), []);
  const variants = reduce ? wordVariantsReduced : wordVariants;

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-labelledby="hero-heading"
      className="relative min-h-[100vh] min-h-dvh flex items-center justify-center overflow-hidden pt-[max(3.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]"
    >
      {/* Top edge highlight — premium dark panel cue */}
      <div
        aria-hidden="true"
        className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
      />

      {/* Deep navy base + animated brand gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-rido-navy via-rido-navy to-rido-magenta/20 hero-gradient" />

      {/* Lifestyle photo: full-bleed, subtle parallax. Lowered fetchpriority — H1 text is the real LCP. */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <Image
          src={withBase("/images/lifestyle/rido-rider-street@3x.jpg")}
          alt=""
          role="presentation"
          fill
          sizes="100vw"
          className="object-cover opacity-[0.22]"
          priority
          decoding="async"
        />
      </motion.div>

      {/* Brand color cast — scoped radial tint, not a lens gel over the whole frame */}
      <div
        aria-hidden="true"
        className="absolute inset-0 mix-blend-soft-light"
        style={{
          background:
            "radial-gradient(60% 80% at 80% 20%, rgba(222,4,152,0.35), transparent 70%)",
        }}
      />

      {/* Vignette centered on the copy zone */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(15,23,42,0.65) 100%)",
        }}
      />
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none bg-gradient-to-b from-rido-navy/40 via-transparent to-rido-navy" />
      {/* Lateral falloff for ultrawide / orb clipping */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(15,23,42,0.5), transparent 12%, transparent 88%, rgba(15,23,42,0.5))",
        }}
      />

      {/* Ambient orbs — magenta primary stronger than green accent; motion-safe via CSS */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 -right-24 w-[400px] sm:w-[700px] h-[400px] sm:h-[700px] rounded-full bg-rido-magenta/15 blur-[100px] hero-orb hero-orb-1"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 -left-24 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-rido-green/8 blur-[90px] hero-orb hero-orb-2"
      />

      {/* Film grain — lifted opacity, rendered above vignette so banded gradients get dithered */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.08] mix-blend-overlay"
        style={{ backgroundImage: `url("${NOISE_SVG}")` }}
      />

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-2 sm:px-6 text-center py-6 sm:py-12 pb-12 sm:pb-20"
        style={{ opacity: contentOpacity }}
      >
        {/* Social-proof kicker */}
        <ScrollReveal delay={0.05}>
          <div className="mb-3 sm:mb-4 inline-flex items-center gap-2 text-[11px] sm:text-xs uppercase tracking-[0.15em] text-white/60">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-rido-green/60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rido-green" />
            </span>
            <span>{t.waitlistKicker}</span>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <Badge variant="magenta" className="mb-5 sm:mb-7">
            {t.badge}
          </Badge>
        </ScrollReveal>

        {/* Headline — animate="visible" so first paint reveals the H1. Spaces rendered as sibling text nodes for SR correctness. */}
        <motion.h1
          id="hero-heading"
          className="text-display-2xl font-extrabold text-balance"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: reduce ? 0 : STAGGER.text, delayChildren: 0.15 } },
          }}
        >
          {headlineWords.map((w, i) => (
            <span key={`${w}-${i}`}>
              <motion.span
                className={`inline-block ${wordGroup.has(i) ? "text-gradient-brand" : ""}`}
                variants={variants}
              >
                {w}
              </motion.span>
              {i < headlineWords.length - 1 ? " " : ""}
              {i === 2 ? <br className="hidden sm:inline" aria-hidden="true" /> : null}
            </span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduce ? 0 : 0.65, duration: 0.6, ease: EASE_TUPLE }}
          className="mt-6 sm:mt-7 text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed sm:leading-normal px-2 sm:px-0 [text-shadow:0_1px_2px_rgba(0,0,0,0.55)]"
        >
          {t.subheadline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduce ? 0 : 0.8, duration: 0.55, ease: EASE_TUPLE }}
          className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
        >
          <a
            href="#download"
            className="group relative inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-rido-magenta text-white font-semibold text-base shadow-[0_8px_30px_rgba(222,4,152,0.35)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(222,4,152,0.5)] hover:brightness-110 active:translate-y-0 active:scale-[0.98] active:duration-75 will-change-transform transform-gpu focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-rido-navy w-full max-w-[320px] sm:w-auto"
          >
            <Magnetic className="contents">
              <span className="relative z-10">{t.ctaPrimary}</span>
              <ArrowRight className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
            </Magnetic>
          </a>
          <a
            href="#how-it-works"
            className="group relative inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white/[0.06] backdrop-blur-xl text-white font-semibold text-base border border-white/15 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18)] transition-all duration-300 ease-out hover:bg-white/[0.1] hover:border-white/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] active:duration-75 will-change-transform transform-gpu focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-rido-navy w-full max-w-[320px] sm:w-auto"
          >
            <span>{t.ctaSecondary}</span>
          </a>
        </motion.div>

        {/* Microcopy under CTAs */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduce ? 0 : 0.95, duration: 0.5 }}
          className="mt-5 inline-flex items-center gap-2 text-xs text-white/70"
        >
          <Shield className="w-3.5 h-3.5" aria-hidden="true" />
          {t.microcopy}
        </motion.p>

        <StaggerReveal
          className="mt-10 sm:mt-16 grid grid-cols-3 gap-4 sm:gap-10 text-white/85 divide-x divide-white/10"
          staggerDelay={STAGGER.grid}
        >
          {t.stats.map((s) => (
            <HeroStat key={s.label} stat={s} />
          ))}
        </StaggerReveal>
      </motion.div>

      {/* Scroll cue — pill + inner dot + magenta glow; hidden on small screens and short heights */}
      <motion.a
        href="#how-it-works"
        aria-label={t.scrollAria}
        style={{ opacity: cueOpacity }}
        className="group absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 hidden [@media(min-height:700px)]:flex flex-col items-center gap-2 text-white/60 hover:text-rido-magenta-light transition-colors min-h-[44px] min-w-[44px] justify-center"
      >
        <span className="text-[11px] uppercase tracking-[0.15em]">{t.scrollLabel}</span>
        <span className="relative flex h-9 w-6 rounded-full border border-white/15 backdrop-blur bg-white/[0.04] shadow-[0_0_12px_rgba(222,4,152,0.25)] justify-center pt-1.5">
          <span className="block h-1.5 w-1.5 rounded-full bg-rido-magenta shadow-[0_0_6px_rgba(222,4,152,0.6)] motion-safe:animate-[scroll-dot_2s_ease-in-out_infinite]" />
        </span>
      </motion.a>
    </section>
  );
}
