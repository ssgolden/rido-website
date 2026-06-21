"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "./gsap";
import { useReducedMotion } from "./gsap";

/**
 * ScrollReveal — GSAP-powered ScrollTrigger reveal.
 * Drop-in replacement for the lightweight `ScrollReveal` UI primitive,
 * but with timeline control and split-text support.
 *
 * Usage:
 *   <ScrollRevealGSAP
 *     from={{ opacity: 0, y: 24 }}
 *     to={{ opacity: 1, y: 0 }}
 *     duration={0.8}
 *     ease="power3.out"
 *     stagger={0.08}
 *   >
 *     {children}
 *   </ScrollRevealGSAP>
 */
export interface ScrollRevealGSAPProps {
  children: ReactNode;
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  duration?: number;
  delay?: number;
  ease?: string;
  stagger?: number;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  markers?: boolean;
  className?: string;
  as?: "div" | "section" | "article" | "span" | "ul" | "li";
  /** Animate children instead of the wrapper. */
  childrenSelector?: string;
}

export function ScrollRevealGSAP({
  children,
  from = { opacity: 0, y: 24 },
  to = { opacity: 1, y: 0 },
  duration = 0.8,
  delay = 0,
  ease = "power3.out",
  stagger = 0,
  start = "top 85%",
  scrub = false,
  markers = false,
  className,
  as = "div",
  childrenSelector,
}: ScrollRevealGSAPProps) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [Tag, setTag] = useState<"div" | "section" | "article" | "span" | "ul" | "li">(as);

  useEffect(() => {
    setTag(as);
  }, [as]);

  useGSAP(
    () => {
      if (reduce) {
        gsap.set(ref.current, { opacity: 1, y: 0 });
        return;
      }
      // Guard: a selector starting with '>' is invalid for querySelectorAll.
      // This happens when callers pass '> *' or similar — we just animate the
      // wrapper instead of throwing on the page.
      const safeSelector = childrenSelector && !childrenSelector.trim().startsWith(">")
        ? childrenSelector
        : undefined;
      const target = safeSelector ? ref.current?.querySelectorAll(safeSelector) : ref.current;
      if (!target) return;
      gsap.fromTo(
        target as gsap.TweenTarget,
        from,
        {
          ...to,
          duration,
          delay,
          ease,
          stagger,
          scrollTrigger: {
            trigger: ref.current!,
            start,
            scrub,
            markers,
            toggleActions: "play none none reverse",
          },
        }
      );
    },
    { scope: ref }
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Comp = Tag as any;
  return (
    <Comp ref={ref as never} className={className}>
      {children}
    </Comp>
  );
}

/**
 * ScrollParallax — scroll-driven parallax using GSAP ScrollTrigger.
 *
 * Usage:
 *   <ScrollParallax speed={0.3}>
 *     <Image src="..." />
 *   </ScrollParallax>
 */
export function ScrollParallax({
  children,
  speed = 0.3,
  className,
  as = "div",
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
  as?: "div" | "section" | "figure";
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  useGSAP(
    () => {
      if (reduce) return;
      const distance = 100 * speed;
      gsap.fromTo(
        ref.current,
        { y: distance },
        {
          y: -distance,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    },
    { scope: ref }
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Comp = as as any;
  return (
    <Comp ref={ref as never} className={className}>
      {children}
    </Comp>
  );
}

/**
 * Magnetic — element tracks the cursor with a spring follow.
 * Use on CTAs, links, interactive cards.
 */
export function Magnetic({
  children,
  strength = 0.4,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, { x: x * strength, y: y * strength, duration: 0.4, ease: "power2.out" });
    };
    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength, reduce]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export { ScrollTrigger };
