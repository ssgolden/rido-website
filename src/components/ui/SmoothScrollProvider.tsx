"use client";

import { useEffect, useRef } from "react";
import type Lenis from "lenis";

/** How long to keep waiting for a lazily-mounted hash target (next/dynamic sections). */
const HASH_RESOLVE_TIMEOUT_MS = 5000;

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reducedMotionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointerMq = window.matchMedia("(pointer: coarse)");

    let lenis: Lenis | null = null;

    const shouldEnable = () =>
      !reducedMotionMq.matches && !coarsePointerMq.matches;

    let starting = false;
    const start = () => {
      if (lenis || starting) return;
      starting = true;
      // Lazy: touch devices and reduced-motion users never download Lenis.
      void import("lenis").then(({ default: LenisCtor }) => {
        starting = false;
        if (lenis || !shouldEnable()) return;
        lenis = new LenisCtor({
          autoRaf: true,
          lerp: 0.1,
          wheelMultiplier: 1,
          anchors: true,
        });
        lenisRef.current = lenis;
      });
    };

    const stop = () => {
      lenis?.destroy();
      lenis = null;
      lenisRef.current = null;
    };

    const sync = () => {
      if (shouldEnable()) start();
      else stop();
    };

    sync();
    reducedMotionMq.addEventListener("change", sync);
    coarsePointerMq.addEventListener("change", sync);

    // Initial-load hash handling: sections below the Hero mount lazily via
    // next/dynamic, so the anchor target may not exist when the browser tries
    // to resolve the hash. Poll until it appears (capped), then scroll to it.
    let rafId = 0;
    const { hash } = window.location;
    let selector: string | null = null;
    try {
      if (hash.length > 1) selector = `#${CSS.escape(decodeURIComponent(hash.slice(1)))}`;
    } catch {
      selector = null;
    }
    if (selector) {
      const target = selector;
      const deadline = performance.now() + HASH_RESOLVE_TIMEOUT_MS;
      const tryScroll = () => {
        const el = document.querySelector<HTMLElement>(target);
        if (el) {
          if (lenis) {
            lenis.scrollTo(el, { immediate: true, force: true });
          } else {
            el.scrollIntoView({ behavior: "auto" });
          }
        } else if (performance.now() < deadline) {
          rafId = requestAnimationFrame(tryScroll);
        }
      };
      rafId = requestAnimationFrame(tryScroll);
    }

    return () => {
      cancelAnimationFrame(rafId);
      reducedMotionMq.removeEventListener("change", sync);
      coarsePointerMq.removeEventListener("change", sync);
      stop();
    };
  }, []);

  return <>{children}</>;
}
