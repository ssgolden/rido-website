"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

/** How long to keep waiting for a lazily-mounted hash target (next/dynamic sections). */
const HASH_RESOLVE_TIMEOUT_MS = 5000;

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let lenis: Lenis | null = null;
    if (!prefersReduced) {
      lenis = new Lenis({
        autoRaf: true,
        lerp: 0.1,
        wheelMultiplier: 1,
        // Smooth-scroll in-page anchor clicks. Lenis honors the target's
        // scroll-margin-top (set on section[id] in globals.css for the fixed navbar).
        anchors: true,
      });
      lenisRef.current = lenis;
    }

    // Initial-load hash handling: sections below the Hero mount lazily via
    // next/dynamic, so the anchor target may not exist when the browser tries
    // to resolve the hash. Poll until it appears (capped), then scroll to it.
    let rafId = 0;
    const { hash } = window.location;
    let selector: string | null = null;
    try {
      if (hash.length > 1) selector = `#${CSS.escape(decodeURIComponent(hash.slice(1)))}`;
    } catch {
      selector = null; // malformed hash — ignore
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
      lenis?.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
