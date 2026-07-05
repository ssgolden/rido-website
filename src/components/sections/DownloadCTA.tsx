"use client";

import { useState } from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Apple, Play, Shield, Smartphone, CreditCard, MapPin, Mail, CheckCircle, Loader2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";

const trustSignals = [
  { icon: Smartphone, text: "Be first to ride" },
  { icon: CreditCard, text: "No payment now" },
  { icon: MapPin, text: "Costa del Sol launch" },
];

function DownloadCounter() {
  const { count, ref, visible } = useCountUp(1200, { duration: 2500 });
  return <span ref={ref} className="font-bold text-rido-magenta transition-opacity duration-300" style={{ opacity: visible ? 1 : 0 }} suppressHydrationWarning>{count.toLocaleString()}+</span>;
}

const WAITLIST_KEY = "rido-waitlist-email";

function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      // Store email in localStorage so it persists (no backend on static export).
      // When the backend is ready, this is where the fetch() to /api/waitlist would go.
      const existing = JSON.parse(localStorage.getItem(WAITLIST_KEY) || "[]");
      if (!existing.includes(email)) {
        existing.push(email);
        localStorage.setItem(WAITLIST_KEY, JSON.stringify(existing));
      }
      // Simulate network delay for UX feedback
      await new Promise((r) => setTimeout(r, 600));
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="glass rounded-2xl p-6 text-center max-w-md mx-auto lg:mx-0"
      >
        <CheckCircle className="w-12 h-12 text-rido-green mx-auto mb-3" />
        <h3 className="text-lg font-bold mb-1">You&apos;re on the list!</h3>
        <p className="text-sm text-muted">
          We&apos;ll email you the moment Rido launches on the Costa del Sol. Get ready to ride.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto lg:mx-0">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-weak" />
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder="your@email.com"
            disabled={status === "loading"}
            aria-label="Email address for waitlist"
            aria-invalid={status === "error"}
            className="w-full pl-11 pr-4 py-3 rounded-xl glass text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-rido-magenta/50 cursor-text disabled:opacity-60"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-ripple inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rido-magenta focus-visible:ring-offset-2 focus-visible:ring-offset-rido-navy bg-rido-magenta hover:bg-rido-magenta-dark text-white shadow-lg shadow-rido-magenta/25 px-6 py-3 text-sm whitespace-nowrap disabled:opacity-60 disabled:cursor-wait"
        >
          {status === "loading" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Join Waitlist"
          )}
        </button>
      </div>
      {status === "error" && (
        <p className="text-sm text-red-400 mt-2 text-center lg:text-left" role="alert">{errorMsg}</p>
      )}
    </form>
  );
}

export function DownloadCTA() {
  const prefersReduced = useReducedMotion();
  // useReducedMotion returns null on SSR and boolean on client — null is falsy.
  const shouldReduce = prefersReduced ?? false;

  return (
    <section id="download" aria-label="Join the Rido waitlist" className="py-12 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-rido-magenta/20 via-rido-navy to-rido-magenta-light/10 hero-gradient" />
      <div className="absolute top-0 right-0 w-[280px] sm:w-[400px] h-[280px] sm:h-[400px] rounded-full bg-rido-magenta/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] rounded-full bg-rido-magenta-light/8 blur-3xl" />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <ScrollReveal>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-4 sm:mb-6">Ready to <span className="text-gradient-brand">Ride</span>?</h2>
              <p className="text-lg text-muted max-w-lg mx-auto lg:mx-0 mb-4">Join the waitlist and be first to ride when Rido launches on the Costa del Sol.</p>
              <p className="text-sm text-muted-weak mb-6"><DownloadCounter /> people on the waitlist</p>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <WaitlistForm />
            </ScrollReveal>
            <ScrollReveal delay={0.25}>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-8">
                <a href="#" onClick={(e) => e.preventDefault()} aria-label="Download on the App Store — coming soon" className="inline-block opacity-70 cursor-not-allowed">
                  <div className="bg-white/10 border border-white/20 rounded-xl px-6 py-3 flex items-center gap-3 relative">
                    <Apple className="w-6 h-6 text-white shrink-0" />
                    <span className="flex flex-col items-start"><span className="text-[10px] leading-tight opacity-70">Download on the</span><span className="text-sm leading-tight font-bold">App Store</span></span>
                    <span className="absolute -top-2 -right-2 text-[9px] bg-rido-magenta text-white px-1.5 py-0.5 rounded-full font-semibold">Soon</span>
                  </div>
                </a>
                <a href="#" onClick={(e) => e.preventDefault()} aria-label="Get it on Google Play — coming soon" className="inline-block opacity-70 cursor-not-allowed">
                  <div className="bg-white/10 border border-white/20 rounded-xl px-6 py-3 flex items-center gap-3 relative">
                    <Play className="w-5 h-5 text-white shrink-0 ml-1" />
                    <span className="flex flex-col items-start"><span className="text-[10px] leading-tight opacity-70">Get it on</span><span className="text-sm leading-tight font-bold">Google Play</span></span>
                    <span className="absolute -top-2 -right-2 text-[9px] bg-rido-magenta text-white px-1.5 py-0.5 rounded-full font-semibold">Soon</span>
                  </div>
                </a>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.35}>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 text-muted-weak text-sm">
                {trustSignals.map((signal) => (
                  <div key={signal.text} className="flex items-center gap-2">
                    <signal.icon className="w-4 h-4 text-rido-magenta/60" />
                    <span>{signal.text}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.5}>
              <div className="mt-6 flex items-center justify-center lg:justify-start gap-2 text-muted-weak text-xs">
                <Shield className="w-3.5 h-3.5" />
                <span>Insured rides · GDPR compliant · Data protected</span>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.15} direction="right">
            <div className="flex justify-center lg:justify-end">
              <motion.div initial={{ y: 30 }} animate={shouldReduce ? { y: 0 } : { y: [30, -10, 30] }} transition={shouldReduce ? { duration: 0.3 } : { duration: 6, repeat: Infinity, ease: "easeInOut" }} className="relative">
                <div className="relative w-[260px] sm:w-[280px] h-[520px] sm:h-[560px] rounded-[40px] border-4 border-white/20 bg-rido-navy shadow-2xl shadow-rido-magenta/20 overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-rido-navy rounded-b-[20px] z-20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-b from-rido-magenta/30 to-rido-navy flex flex-col items-center justify-center pt-10">
                      <div className="w-16 h-16 rounded-2xl bg-rido-magenta/30 mb-4 flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M9 16.5L13.5 21L23 11" stroke="#DE0498" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <p className="text-white font-black text-2xl">rido</p>
                      <p className="text-muted-weak text-sm mt-2">Move freely</p>
                      <div className="mt-6 w-[160px] h-[40px] rounded-xl bg-rido-magenta/80 flex items-center justify-center text-white font-semibold text-sm">Scan & Ride</div>
                      <div className="mt-4 grid grid-cols-3 gap-2 w-[200px]">
                        {["Map", "Ride", "Pay"].map((label) => (
                          <div key={label} className="h-[60px] rounded-lg bg-white/5 flex items-center justify-center text-muted-weak text-xs">{label}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 -z-10 rounded-[40px] bg-rido-magenta/20 blur-3xl scale-125" />
              </motion.div>
            </div>
          </ScrollReveal>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-rido-navy to-transparent pointer-events-none" />
    </section>
  );
}