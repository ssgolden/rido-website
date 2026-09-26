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

  useLayoutEffect(() => {
    const headerEl = headerRef.current;
    if (!headerEl) return;
    const apply = () => setHeaderOffset(headerEl.offsetHeight);
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(headerEl);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="relative flex h-dvh min-h-0 flex-col overflow-hidden"
      style={headerOffset ? ({ "--site-header-offset": `${headerOffset}px` } as CSSProperties) : undefined}
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
        className="relative z-50 shrink-0 pb-3"
        style={{
          paddingTop: "max(0.75rem, env(safe-area-inset-top))",
          paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
          paddingRight: "max(0.75rem, env(safe-area-inset-right))",
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
