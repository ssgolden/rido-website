"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animated counter that counts from 0 to `end` when the element enters the viewport.
 * Respects prefers-reduced-motion (shows final value instantly).
 *
 * @param end - Target number to count up to
 * @param suffix - String appended after the number (e.g. "+", "km")
 * @param duration - Animation duration in ms (default 2000)
 * @param delay - Stagger delay in ms (default 0)
 */
export function useCountUp(
  end: number,
  { duration = 2000, delay = 0 }: { duration?: number; delay?: number } = {}
) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) {
      setCount(end);
      setHasStarted(true);
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
    if (!hasStarted) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

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
  }, [hasStarted, end, duration, delay]);

  return { count, ref };
}