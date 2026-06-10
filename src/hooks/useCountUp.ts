"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animated counter that counts from 0 to `end` when the element enters the viewport.
 * Respects prefers-reduced-motion (shows final value instantly).
 *
 * Hydration-safe: initializes count at `end` so the server renders the final
 * value, then resets to 0 and animates up once the component is mounted and
 * the element scrolls into view. This avoids hydration mismatches for large
 * numbers (e.g. "0+" on server vs "50,000+" on client).
 *
 * @param end - Target number to count up to
 * @param duration - Animation duration in ms (default 2000)
 * @param delay - Stagger delay in ms (default 0)
 */
export function useCountUp(
  end: number,
  { duration = 2000, delay = 0 }: { duration?: number; delay?: number } = {}
) {
  const [count, setCount] = useState(end); // Start at final value for SSR
  const [hasStarted, setHasStarted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) {
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { rootMargin: "-80px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end]);

  useEffect(() => {
    if (!mounted || !hasStarted) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    // Reset count to 0 before animating
    setCount(0);

    let startTime: number;
    let raf: number;

    const timeout = setTimeout(() => {
      startTime = performance.now();
      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic for natural feel
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * end));
        if (progress < 1) {
          raf = requestAnimationFrame(animate);
        }
      };
      raf = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [mounted, hasStarted, end, duration, delay]);

  // visible is true once the animation has started (after mount + scroll into view).
  // Before that, the element is hidden via opacity to avoid the flash of final → 0.
  const visible = mounted && hasStarted;

  return { count, ref, visible };
}