"use client";
import { ArrowRight, HardHat, BadgeCheck, MapPin, Shield } from "lucide-react";
import { m, useScroll, useTransform, useReducedMotion, useMotionValueEvent, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { createPortal } from "react-dom";
import { withBase } from "@/lib/basePath";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/config";
import { STAGGER } from "@/lib/motion";
import { WaitlistProof } from "@/components/ui/WaitlistProof";
import { WaitlistForm } from "@/components/ui/WaitlistForm";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { vehicles } from "@/data/vehicles";
import { primaryCity } from "@/data/cities";
import { useHeroBackdropEl, useScrollContainerRef } from "@/components/ui/SmoothScrollProvider";

// Noise overlay (SVG turbulence) — breaks gradient banding on dark surfaces.
const NOISE_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0"/></filter><rect width="100%" height="100%" filter="url(%23n)"/></svg>'
  );

const town = primaryCity?.name ?? "Torrevieja";

const en = {
  waitlistKicker: "Waitlist now open",
  waitlistSingular: "{count} person on the waitlist",
  waitlistPlural: "{count} people on the waitlist",
  badge: `Launching soon in ${town}`,
  /** Last `highlightCount` words get the brand gradient — the only gradient text on the page. */
  headlineWords: ["Move", "freely", "along", "the", "coast."],
  highlightCount: 2,
  subheadline:
    "Shared e-scooters and e-bikes, run by people who live here. Cheaper than a taxi, cleaner than a rental car. Launching first in Torrevieja on the Costa Blanca — the Costa del Sol is next.",
  microcopy: "No spam. One email when we launch near you.",
  secondary: "See how it works",
  imageAlt: "The Rido e-scooter in brand magenta, with its helmet docked on the stem",
  chipsLabel: "Highlights",
  chips: ["Helmet included", "DGT certified", `${town} launch`],
};

const copy: Record<Locale, typeof en> = {
  en,
  es: {
    waitlistKicker: "Lista de espera abierta",
    waitlistSingular: "{count} persona en la lista de espera",
    waitlistPlural: "{count} personas en la lista de espera",
    badge: `Muy pronto en ${town}`,
    headlineWords: ["Muévete", "libre", "por", "la", "costa."],
    highlightCount: 2,
    subheadline:
      "Patinetes y bicis eléctricas compartidas, gestionadas por gente que vive aquí. Más barato que un taxi, más limpio que un coche de alquiler. Arrancamos en Torrevieja, en la Costa Blanca — la Costa del Sol, después.",
    microcopy: "Sin spam. Un correo cuando lleguemos a tu zona.",
    secondary: "Cómo funciona",
    imageAlt: "El patinete eléctrico Rido en magenta, con el casco acoplado en la barra",
    chipsLabel: "Lo esencial",
    chips: ["Casco incluido", "Certificado DGT", `Lanzamiento en ${town}`],
  },
};

const chipIcons = [HardHat, BadgeCheck, MapPin] as const;

/**
 * Hero entrances are CSS keyframes (globals.css .hero-in / .hero-rise), not
 * framer: they start with the first paint instead of after hydration, and the
 * markup is identical on server and client. `.hero-rise` only moves (never
 * transparent), for the form, paragraph and image: the call to action and the
 * LCP element are visible from the first paint. Both are off under reduced
 * motion.
 */
const delay = (seconds: number) => ({ animationDelay: `${seconds}s` });

function HeroBackdrop({ fixed, opacity }: { fixed: boolean; opacity: number | MotionValue<number> }) {
  return (
    <m.div aria-hidden="true" className={fixed ? "absolute inset-0" : "contents"} style={fixed ? { opacity } : undefined}>
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      {/* Static layers only: no filters, no blend modes, no animated backgrounds.
          The orbs are radial gradients (a blurred circle repainted every frame
          was the most expensive paint on the page) and only drift via transform. */}
      <div className="absolute inset-0 bg-gradient-to-br from-rido-navy via-rido-navy to-rido-magenta/20" />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(60% 80% at 80% 20%, rgba(222,4,152,0.14), transparent 70%)" }}
      />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-rido-navy/40 via-transparent to-rido-navy" />
      <div
        className="absolute top-[10%] -right-40 w-[320px] h-[320px] sm:-right-56 sm:w-[920px] sm:h-[920px] hero-orb hero-orb-1"
        style={{ background: "radial-gradient(closest-side, rgba(222,4,152,0.15), transparent)" }}
      />
      <div
        className="absolute -bottom-24 -left-36 w-[280px] h-[280px] sm:-left-48 sm:w-[700px] sm:h-[700px] hero-orb hero-orb-2"
        style={{ background: "radial-gradient(closest-side, rgba(34,197,94,0.08), transparent)" }}
      />
      <div className="absolute inset-0 pointer-events-none opacity-[0.035]" style={{ backgroundImage: `url("${NOISE_SVG}")` }} />
    </m.div>
  );
}

export function Hero() {
  const locale = useLocale();
  const t = copy[locale];
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const scrollContainerRef = useScrollContainerRef();
  const backdropEl = useHeroBackdropEl();

  const { scrollYProgress } = useScroll({
    container: scrollContainerRef,
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const backdropOpacityRaw = useTransform(scrollYProgress, [0.6, 0.92], [1, 0]);
  const backdropOpacity = reduce ? 1 : backdropOpacityRaw;
  // Once the fixed backdrop has faded out, pause its orb animation (CSS
  // [data-idle] rule). A DOM attribute, not React state: no re-render, and the
  // portal container only exists on the client.
  useMotionValueEvent(backdropOpacityRaw, "change", (v) => {
    backdropEl?.toggleAttribute("data-idle", v <= 0.01);
  });
  // Signature moment: the scooter rides out of its frame as the hero scrolls
  // away. Always a MotionValue (zero range under reduced motion) so SSR and
  // client styles match.
  const rideX = useTransform(scrollYProgress, [0.05, 0.75], reduce ? ["0%", "0%"] : ["0%", "75%"]);
  const parkBackdrop = Boolean(backdropEl) && !reduce;
  const highlightFrom = t.headlineWords.length - t.highlightCount;

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-labelledby="hero-heading"
      className="relative flex min-h-[calc(100svh-var(--site-header-offset,5.5rem))] items-center overflow-hidden pt-6 pb-[max(3rem,env(safe-area-inset-bottom,0px))] pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] sm:px-6"
    >
      {parkBackdrop && backdropEl
        ? createPortal(<HeroBackdrop fixed opacity={backdropOpacity} />, backdropEl)
        : <HeroBackdrop fixed={false} opacity={1} />}

      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center">
        <div className="text-center lg:text-left">
          <div className="hero-in flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start mb-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-rido-magenta/15 border border-rido-magenta/25 px-3 py-1 text-xs sm:text-sm font-medium text-rido-magenta-light">
              <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-rido-green/60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rido-green" />
              </span>
              {t.badge}
            </span>
            <span className="text-xs sm:text-sm text-muted">
              <WaitlistProof singular={t.waitlistSingular} plural={t.waitlistPlural} fallbackKicker={t.waitlistKicker} />
            </span>
          </div>

          <h1 id="hero-heading" className="text-display-2xl font-black text-balance">
            {t.headlineWords.map((w, i) => (
              <span key={`${w}-${i}`}>
                <span
                  className={`hero-in inline-block ${i >= highlightFrom ? "text-gradient-brand" : ""}`}
                  style={delay(0.08 + i * STAGGER.text)}
                >
                  {w}
                </span>
                {i < t.headlineWords.length - 1 ? " " : ""}
              </span>
            ))}
          </h1>

          {/* Largest text block on phones (often the LCP element): rise only. */}
          <p
            className="hero-rise mt-6 text-base sm:text-lg md:text-xl text-white/90 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            style={delay(0.24)}
          >
            {t.subheadline}
          </p>

          <div className="hero-rise mt-8 flex justify-center lg:justify-start" style={delay(0.36)}>
            <WaitlistForm placement="hero" className="max-w-lg" />
          </div>

          <div
            className="hero-in mt-4 flex flex-col sm:flex-row items-center gap-3 sm:gap-6 justify-center lg:justify-start text-sm"
            style={delay(0.44)}
          >
            <span className="inline-flex items-center gap-2 text-muted">
              <Shield className="w-3.5 h-3.5" aria-hidden="true" />
              {t.microcopy}
            </span>
            <a
              href="#how-it-works"
              className="group inline-flex items-center gap-1.5 min-h-11 font-semibold text-white hover:text-rido-magenta-light transition-colors cursor-pointer"
            >
              {t.secondary}
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Image slot: product render on sand until the Torrevieja photo shoot lands.
            It is the mobile LCP element, so it never starts transparent: rise only. */}
        <div className="hero-rise relative mx-auto w-full max-w-md lg:max-w-none" style={delay(0.2)}>
          <ImageFrame
            src={withBase(vehicles[0].cutouts[0])}
            alt={t.imageAlt}
            sizes="(max-width: 1024px) 90vw, 45vw"
            priority
            imageClassName="drop-shadow-[0_30px_40px_rgba(15,23,42,0.25)]"
            imageWrapperStyle={{ x: rideX }}
            aspect="aspect-[5/4] lg:aspect-[4/5]"
            className="shadow-2xl shadow-black/40"
          >
            <ul className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5 flex flex-wrap gap-2" aria-label={t.chipsLabel}>
              {t.chips.map((chip, i) => {
                const Icon = chipIcons[i];
                return (
                  <li
                    key={chip}
                    // Two chips on phones so the row never wraps over the vehicle.
                    className={`${i === 2 ? "hidden sm:inline-flex" : "inline-flex"} items-center gap-1.5 rounded-full bg-white/85 backdrop-blur px-3 py-1.5 text-xs font-semibold text-ink ring-1 ring-black/5`}
                  >
                    <Icon className="w-3.5 h-3.5 text-rido-magenta-dark" aria-hidden="true" />
                    {chip}
                  </li>
                );
              })}
            </ul>
          </ImageFrame>
        </div>
      </div>
    </section>
  );
}
