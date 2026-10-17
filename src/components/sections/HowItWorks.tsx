"use client";

import { useRef, useState, type CSSProperties } from "react";
import { Smartphone, QrCode, Bike, ParkingCircle } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PhoneMockup } from "@/components/ui/PhoneScreens";
import { cn } from "@/lib/utils";
import type { HowItWorksCopy } from "@/components/sections/HowItWorks.copy";
import type { PhoneCopy } from "@/components/ui/PhoneScreens.copy";
import { useScrollTo } from "@/components/ui/SmoothScrollProvider";
import { useScrollFrame } from "@/hooks/useScrollFrame";

/** Step icons, in step order (components can't be passed from the server). */
const STEP_ICONS = [Smartphone, QrCode, Bike, ParkingCircle] as const;

function StepIcon({ index }: { index: number }) {
  const Icon = STEP_ICONS[index] ?? Smartphone;
  return <Icon className="w-6 h-6 text-rido-magenta-light" aria-hidden="true" />;
}

/** Scroll distance per step, in small-viewport heights. */
const VH_PER_STEP = 75;

/**
 * Signature scroll moment (Phase D).
 *
 * A tall track pins a stage (sticky inside the #page-scroll lane) while the
 * visitor scrolls; scroll progress picks the active step, which swaps the step
 * copy and the phone screen and fills the progress rail.
 *
 * Reduced motion is handled with `motion-reduce:` CSS variants only — never a
 * JS branch — so server and client markup are identical (no hydration
 * mismatch): the track collapses, the stage un-pins, every step is listed
 * statically and the phone is hidden.
 */
export function HowItWorks({ t, phone }: { t: HowItWorksCopy; phone: PhoneCopy }) {
  const steps = t.steps;
  const trackRef = useRef<HTMLDivElement>(null);
  const anchorRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollTo = useScrollTo();
  const [activeStep, setActiveStep] = useState(0);
  const railXRef = useRef<HTMLDivElement>(null);
  const railYRef = useRef<HTMLDivElement>(null);

  // Progress through the pinned track: 0 when its top reaches the top of the
  // scroll lane, 1 when its bottom reaches the bottom. The rail fill is written
  // directly each frame; React state changes only when the step changes.
  useScrollFrame((root) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const lane = root.getBoundingClientRect();
    const range = rect.height - lane.height;
    const p = range > 0 ? Math.min(1, Math.max(0, (lane.top - rect.top) / range)) : 0;
    if (railXRef.current) railXRef.current.style.transform = `scaleX(${p})`;
    if (railYRef.current) railYRef.current.style.transform = `scaleY(${p})`;
    const step = Math.min(steps.length - 1, Math.floor(p * steps.length));
    setActiveStep((prev) => (prev === step ? prev : step));
  });

  const trackStyle = { "--track-h": `${steps.length * VH_PER_STEP + 25}svh` } as CSSProperties;

  return (
    <section id="how-it-works" aria-label={t.ariaLabel} className="pt-16 sm:pt-24 motion-reduce:pb-16 sm:motion-reduce:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader label={t.label} title={t.title} className="!mb-0 sm:!mb-4" />
      </div>

      <div ref={trackRef} className="relative h-[var(--track-h)] motion-reduce:h-auto" style={trackStyle}>
        {/* Scroll targets for the rail buttons: one per step, evenly along the track. */}
        {steps.map((step, i) => (
          <div
            key={step.title}
            ref={(el) => {
              anchorRefs.current[i] = el;
            }}
            aria-hidden="true"
            className="absolute left-0 h-px w-px motion-reduce:hidden"
            style={{ top: `${(i / steps.length) * 100}%` }}
          />
        ))}

        <div className="sticky top-0 flex h-[calc(100svh-var(--site-header-offset,5.5rem))] items-center motion-reduce:static motion-reduce:h-auto">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 motion-reduce:md:grid-cols-1 gap-6 md:gap-16 items-center">
            {/* Phone: first on phones, right column on md+. Hidden under reduced motion and on short phones (no room beside the step copy). */}
            <div className="order-first md:order-last flex justify-center lg:justify-end motion-reduce:hidden max-md:[@media(max-height:700px)]:hidden">
              <div className="h-[330px] [@media(min-height:760px)]:h-[390px] md:!h-auto">
                <div className="origin-top scale-[0.6] [@media(min-height:760px)]:scale-[0.7] md:!scale-100">
                  <PhoneMockup activeStep={activeStep} t={phone} />
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-5 md:gap-8">
              {/* Progress rail with step markers (pinned mode only). */}
              <nav aria-label={t.stepsLabel} className="relative shrink-0 motion-reduce:hidden">
                <div
                  className="absolute left-4 right-4 top-1/2 h-px -translate-y-1/2 bg-white/10 md:left-1/2 md:right-auto md:top-4 md:bottom-4 md:h-auto md:w-px md:-translate-x-1/2 md:translate-y-0"
                  aria-hidden="true"
                >
                  <div ref={railXRef} className="h-full w-full origin-left bg-rido-magenta md:hidden" style={{ transform: "scaleX(0)" }} />
                  <div ref={railYRef} className="hidden h-full w-full origin-top bg-rido-magenta md:block" style={{ transform: "scaleY(0)" }} />
                </div>
                <ol className="relative flex justify-between md:flex-col md:justify-start md:gap-10">
                  {steps.map((step, i) => (
                    <li key={step.title}>
                      <button
                        type="button"
                        onClick={() => {
                          const el = anchorRefs.current[i];
                          if (el) scrollTo(el);
                        }}
                        aria-label={t.goTo.replace("{n}", String(i + 1)).replace("{title}", step.title)}
                        aria-current={i === activeStep ? "step" : undefined}
                        className={cn(
                          "flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold cursor-pointer transition-colors duration-200",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rido-magenta focus-visible:ring-offset-2 focus-visible:ring-offset-rido-navy",
                          i <= activeStep ? "bg-rido-magenta text-white" : "bg-rido-navy text-muted ring-1 ring-white/20 hover:text-white"
                        )}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
                </ol>
              </nav>

              {/* Step copy: stacked and crossfaded while pinned; a plain list under reduced motion. */}
              <ol className="relative flex-1 min-h-[13rem] sm:min-h-[15rem] motion-reduce:min-h-0 motion-reduce:space-y-10 motion-reduce:pt-10 motion-reduce:md:grid motion-reduce:md:grid-cols-2 motion-reduce:md:gap-x-16 motion-reduce:md:gap-y-12 motion-reduce:md:space-y-0">
                {steps.map((step, i) => {
                  const active = i === activeStep;
                  return (
                    <li
                      key={step.title}
                      className={cn(
                        "absolute inset-x-0 top-0 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        "motion-reduce:static motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:transition-none",
                        active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-display text-5xl sm:text-6xl font-black text-rido-magenta-light/90 tabular-nums" aria-hidden="true">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rido-magenta/15">
                          <StepIcon index={i} />
                        </span>
                      </div>
                      <h3 className="mt-4 font-display text-2xl sm:text-3xl font-black">{step.title}</h3>
                      <p className="mt-3 text-base sm:text-lg text-muted leading-relaxed max-w-md">{step.description}</p>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
