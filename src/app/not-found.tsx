import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { RidoLogo } from "@/components/ui/RidoLogo";

export const metadata: Metadata = {
  title: "Page Not Found — Rido",
  description: "The page you're looking for doesn't exist. Head back to rido.bike.",
  robots: { index: false, follow: true },
};

// Server component by design: the ambience below is pure CSS (hero-orb keyframes
// from globals.css), which the global prefers-reduced-motion block already stills.
export default function NotFound() {
  return (
    <main
      id="not-found"
      aria-labelledby="not-found-heading"
      className="relative min-h-dvh flex items-center justify-center overflow-hidden bg-rido-navy text-white px-4 sm:px-6 py-16 sm:py-24"
    >
      {/* Top edge highlight — same premium dark-panel cue as the hero */}
      <div
        aria-hidden="true"
        className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
      />

      {/* Deep navy base with a whisper of brand magenta */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-rido-navy via-rido-navy to-rido-magenta/15"
      />

      {/* Soft ambient orbs — breathing, consistent with the hero */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 -right-24 w-[320px] sm:w-[560px] h-[320px] sm:h-[560px] rounded-full bg-rido-magenta/8 blur-[100px] hero-orb hero-orb-1"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 -left-24 w-[260px] sm:w-[420px] h-[260px] sm:h-[420px] rounded-full bg-rido-green/10 blur-[90px] hero-orb hero-orb-2"
      />

      {/* Vignette for focus + readability */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(15,23,42,0.7) 100%)" }}
      />

      <div className="relative z-10 text-center max-w-xl mx-auto">
        <div className="mb-10 flex justify-center">
          <RidoLogo variant="full" size="lg" />
        </div>

        <p className="mb-4 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/50">
          404 — Page not found
        </p>

        {/* h1 picks up Sora via the global display rule */}
        <h1 id="not-found-heading" className="text-display-2xl font-black text-balance">
          Wrong <span className="text-gradient-brand">turn.</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-white/60 leading-relaxed">
          This page doesn&apos;t exist — but the ride back home does.
        </p>

        <div className="mt-10 flex justify-center">
          <Link
            href="/"
            className="btn-ripple inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-xl bg-rido-magenta hover:bg-rido-magenta-dark text-white shadow-lg shadow-rido-magenta/25 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rido-magenta focus-visible:ring-offset-2 focus-visible:ring-offset-rido-navy"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="mt-14 flex items-center justify-center gap-6 text-white/30 text-sm">
          <Link href="/privacy" className="hover:text-rido-magenta-light transition-colors cursor-pointer">
            Privacy Policy
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/terms" className="hover:text-rido-magenta-light transition-colors cursor-pointer">
            Terms of Service
          </Link>
          <span aria-hidden="true">·</span>
          <a href="mailto:info@rido.bike" className="hover:text-rido-magenta-light transition-colors cursor-pointer">
            Contact
          </a>
        </div>
      </div>
    </main>
  );
}
