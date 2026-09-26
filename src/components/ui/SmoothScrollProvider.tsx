"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Lenis from "lenis";

/** How long to keep waiting for a lazily-mounted hash target (next/dynamic sections). */
const HASH_RESOLVE_TIMEOUT_MS = 5000;

type ScrollRootContextValue = {
  /** Element that actually scrolls on marketing pages. Null when the window scrolls. */
  rootNode: HTMLElement | null;
  /** Stable ref mirroring `rootNode`, safe to pass to Framer `useScroll({ container })`. */
  scrollRef: React.RefObject<HTMLElement | null>;
  attachRef: (node: HTMLElement | null) => void;
  /** Full-viewport layer behind the header. Hero paints its backdrop here. */
  backdropEl: HTMLElement | null;
  setBackdropEl: (node: HTMLElement | null) => void;
  scrollTo: (target: number | string | HTMLElement) => void;
};

const ScrollRootContext = createContext<ScrollRootContextValue | null>(null);

export function useScrollRootNode() {
  return useContext(ScrollRootContext)?.rootNode ?? null;
}

export function useScrollRootRegistration() {
  const ctx = useContext(ScrollRootContext);
  if (!ctx) throw new Error("useScrollRootRegistration must be used within SmoothScrollProvider");
  return { attachRef: ctx.attachRef, setBackdropEl: ctx.setBackdropEl };
}

export function useScrollContainerRef() {
  const ctx = useContext(ScrollRootContext);
  if (!ctx) throw new Error("useScrollContainerRef must be used within SmoothScrollProvider");
  return ctx.scrollRef;
}

export function useHeroBackdropEl() {
  return useContext(ScrollRootContext)?.backdropEl ?? null;
}

export function useScrollTo() {
  const ctx = useContext(ScrollRootContext);
  return ctx?.scrollTo ?? fallbackScrollTo;
}

function fallbackScrollTo(target: number | string | HTMLElement) {
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: "smooth" });
    return;
  }
  if (typeof target === "string") {
    if (target === "#" || target === "#top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const scrollRef = useRef<HTMLElement | null>(null);
  const [rootNode, setRootNode] = useState<HTMLElement | null>(null);
  const [backdropEl, setBackdropElState] = useState<HTMLElement | null>(null);

  const attachRef = useCallback((node: HTMLElement | null) => {
    scrollRef.current = node;
    setRootNode((prev) => (prev === node ? prev : node));
  }, []);

  const setBackdropEl = useCallback((node: HTMLElement | null) => {
    setBackdropElState((prev) => (prev === node ? prev : node));
  }, []);

  const scrollTo = useCallback((target: number | string | HTMLElement) => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, { force: true });
      return;
    }
    const root = scrollRef.current;
    if (typeof target === "number") {
      (root ?? window).scrollTo({ top: target, behavior: "smooth" });
      return;
    }
    if (typeof target === "string") {
      if (target === "#" || target === "#top") {
        (root ?? window).scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const reducedMotionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointerMq = window.matchMedia("(pointer: coarse)");

    let lenis: Lenis | null = null;

    const shouldEnable = () =>
      !reducedMotionMq.matches && !coarsePointerMq.matches;

    const start = () => {
      if (lenis) return;
      const root = scrollRef.current;
      lenis = new Lenis({
        autoRaf: true,
        lerp: 0.1,
        wheelMultiplier: 1,
        anchors: true,
        // Marketing pages scroll an element below the header, not the window.
        // Listen for wheel/touch on the document so trackpads over the nav still scroll.
        ...(root
          ? { wrapper: root, content: root, eventsTarget: document.documentElement }
          : {}),
      });
      lenisRef.current = lenis;
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
            el.scrollIntoView({ behavior: "auto", block: "start" });
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
  }, [rootNode]);

  return (
    <ScrollRootContext.Provider
      value={{ rootNode, scrollRef, attachRef, backdropEl, setBackdropEl, scrollTo }}
    >
      {children}
    </ScrollRootContext.Provider>
  );
}
