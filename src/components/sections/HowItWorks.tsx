"use client";

import { useRef, useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Smartphone, QrCode, Bike, ParkingCircle } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StaggerReveal, StaggerItem } from "@/components/ui/StaggerReveal";
import { PhoneMockup } from "@/components/ui/PhoneScreens";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: Smartphone,
    title: "Sign Up Early",
    description: "Join the waitlist now and be first in line when the Rido app launches. Create your account in seconds when it's ready.",
  },
  {
    icon: QrCode,
    title: "Scan & Unlock",
    description: "Find a Rido nearby on the map, scan the QR code on the handlebar, and you're ready to roll.",
  },
  {
    icon: Bike,
    title: "Ride & Enjoy",
    description: "Follow traffic rules, use bike lanes, and enjoy the ride. Helmet recommended for your safety.",
  },
  {
    icon: ParkingCircle,
    title: "Park & End Ride",
    description: "Park responsibly in designated areas shown in the app. End your ride and pay only for what you used.",
  },
];

export function HowItWorks() {
  // Desktop scroll-telling: map scroll progress through the two-column
  // track onto a step index. position:sticky + useScroll stays in sync
  // with Lenis because Lenis animates the native window scroll position.
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const { scrollYProgress } = useScroll({
    target: scrollTrackRef,
    // 0 when the track's top reaches the viewport middle,
    // 1 when its bottom reaches the viewport middle.
    offset: ["start 0.5", "end 0.5"],
  });
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const index = Math.min(steps.length - 1, Math.max(0, Math.floor(progress * steps.length)));
    setActiveStep(index);
  });

  return (
    <section id="how-it-works" aria-label="How it works" className="py-12 sm:py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <SectionHeading
            eyebrow="Simple as 1-2-3"
            before="How It"
            highlight="Works"
            className="text-3xl sm:text-4xl md:text-5xl font-black"
          />
        </div>

        {/* Below md: the existing snap carousel, unchanged. Hidden on md+
            (display:none), so step copy is never duplicated in the a11y tree. */}
        <StaggerReveal className="mobile-carousel pt-5 gap-6 md:hidden" staggerDelay={0.12}>
          {steps.map((step, i) => (
            <StaggerItem key={step.title}>
              <Card className="text-center relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-rido-magenta text-white text-sm font-bold flex items-center justify-center cursor-default">
                  {i + 1}
                </div>
                <div className="mt-4 mb-4 flex justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-rido-magenta/10 flex items-center justify-center">
                    <step.icon className="w-7 h-7 text-rido-magenta" />
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted leading-relaxed">
                  {step.description}
                </p>
              </Card>
            </StaggerItem>
          ))}
        </StaggerReveal>

        {/* md+: scroll-telling — steps list left, pinned phone right whose
            screen crossfades to match the active step. */}
        <div ref={scrollTrackRef} className="hidden md:grid md:grid-cols-2 gap-12 lg:gap-20">
          <StaggerReveal className="flex flex-col gap-6 lg:gap-8 py-4" staggerDelay={0.12}>
            {steps.map((step, i) => {
              const active = i === activeStep;
              return (
                <StaggerItem key={step.title}>
                  <div
                    className={cn(
                      "flex gap-5 rounded-2xl border p-6 lg:p-8 transition-colors duration-300 ease-out",
                      active ? "glass border-rido-magenta/40" : "border-transparent"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 shrink-0 rounded-full text-sm font-bold flex items-center justify-center transition-colors duration-300 ease-out",
                        active ? "bg-rido-magenta text-white" : "border border-white/20 text-muted"
                      )}
                      aria-hidden="true"
                    >
                      {i + 1}
                    </div>
                    <div>
                      <div
                        className={cn(
                          "mb-3 w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300 ease-out",
                          active ? "bg-rido-magenta/20" : "bg-white/5"
                        )}
                      >
                        <step.icon
                          className={cn(
                            "w-6 h-6 transition-colors duration-300 ease-out",
                            active ? "text-rido-magenta" : "text-muted"
                          )}
                        />
                      </div>
                      <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                      <p className="text-sm text-muted leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerReveal>

          {/* Sticky column — plain divs only: a transformed ancestor would
              re-root position:sticky, so no motion wrappers here. */}
          <div className="relative">
            <div className="sticky top-24 flex justify-center lg:justify-end lg:pr-6 xl:pr-16 py-4">
              <PhoneMockup activeStep={activeStep} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
