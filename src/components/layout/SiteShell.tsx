"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useScrollRootRegistration } from "@/components/ui/SmoothScrollProvider";

/**
 * Keeps the floating nav in its own lane and scrolls the page underneath it.
 * A fixed nav let section titles slide under the bar; this shell clips the
 * scrollport at the bottom of the header so headings and body copy stay visible.
 */
export function SiteShell({
  header,
  children,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  const { attachRef, setBackdropEl } = useScrollRootRegistration();
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerOffset, setHeaderOffset] = useState<number | null>(null);
  const [chromeTop, setChromeTop] = useState(0);

  useLayoutEffect(() => {
    const headerEl = headerRef.current;
    if (!headerEl) return;
    const apply = () => setHeaderOffset(headerEl.offsetHeight);
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(headerEl);
    return () => observer.disconnect();
  }, []);

  // Android Chrome can lay a non-scrolling page out under the URL bar.
  // visualViewport.offsetTop is that overlap; safe-area covers the notch.
  useLayoutEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const apply = () => setChromeTop(Math.max(0, Math.round(vv.offsetTop)));
    apply();
    vv.addEventListener("resize", apply);
    vv.addEventListener("scroll", apply);
    return () => {
      vv.removeEventListener("resize", apply);
      vv.removeEventListener("scroll", apply);
    };
  }, []);

  return (
    <div
      className="relative flex h-full min-h-0 max-h-[100svh] flex-col overflow-hidden"
      data-chrome-top={chromeTop}
      style={
        {
          "--site-header-offset": headerOffset ? `${headerOffset}px` : undefined,
          "--browser-chrome-top": `${chromeTop}px`,
        } as CSSProperties
      }
    >
      {/* Hero artwork is portaled here so the transparent pill still sits on the
          full-bleed background, while page copy scrolls in the lane below. */}
      <div
        ref={setBackdropEl}
        data-hero-backdrop=""
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      />
      <div
        ref={headerRef}
        className="relative z-50 shrink-0 pb-4 sm:pb-3"
        style={{
          paddingTop: "max(1rem, env(safe-area-inset-top, 0px), var(--browser-chrome-top, 0px))",
          paddingLeft: "max(0.75rem, env(safe-area-inset-left, 0px))",
          paddingRight: "max(0.75rem, env(safe-area-inset-right, 0px))",
        }}
      >
        {header}
      </div>
      <div
        ref={attachRef}
        id="page-scroll"
        data-scroll-root=""
        className="relative z-10 min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain"
      >
        {children}
      </div>
    </div>
  );
}
