"use client";

import dynamic from "next/dynamic";
import { useState, useRef, useEffect } from "react";
import { Sparkles, Zap, MousePointer2, Type, Box, Layers, MessageSquare, Menu, Wind, Command } from "lucide-react";
import { gsap, useGSAP } from "./gsap";
import { ScrollRevealGSAP, Magnetic } from "./ScrollRevealGSAP";
import { DraggableCard } from "./DraggableCard";
import { NumberCounter, FloatingElement } from "./NumberCounter";
import { NoiseField } from "./NoiseField";
import { Toaster, showSuccess, showError, showInfo, showPromise, showLoading } from "./Toast";
import { Drawer } from "./Drawer";
import { CommandMenu } from "./CommandMenu";

// 3D scene is heavy; load it only on the client and only when visible.
const Scene3D = dynamic(() => import("./Scene3D").then((m) => m.Scene3D), {
  ssr: false,
  loading: () => null,
});

export function AnimationShowcase() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  // SplitText demo on the H1
  useGSAP(
    () => {
      type Split = { chars?: HTMLElement[]; revert: () => void };
      let split: Split | null = null;
      let cancelled = false;
      (async () => {
        const mod = await import("./gsap");
        const splitText = mod.splitText;
        if (cancelled || !headlineRef.current) return;
        const result = await splitText({
          target: headlineRef.current,
          type: "chars,words",
          ariaLabel: headlineRef.current.innerText,
        });
        split = result as unknown as Split;
        if (!split.chars) return;
        gsap.from(split.chars, {
          opacity: 0,
          y: 40,
          filter: "blur(8px)",
          stagger: 0.025,
          duration: 0.8,
          ease: "power3.out",
        });
      })();
      return () => {
        cancelled = true;
        split?.revert();
      };
    },
    { scope: headlineRef }
  );

  // ⌘K / Ctrl+K to open the command menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const fakePromise = <T,>(value: T, ms = 1400) =>
    new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));

  return (
    <main className="min-h-dvh bg-rido-navy text-white pt-24 pb-32 px-4 sm:px-6 relative overflow-x-hidden">
      <Toaster />

      {/* Ambient noise field behind the whole page */}
      <NoiseField
        width={1280}
        height={720}
        className="fixed inset-0 -z-10 pointer-events-none"
        tint="rgba(222, 4, 152, 0.05)"
        opacity={0.6}
      />

      {/* Header */}
      <header className="max-w-6xl mx-auto mb-20">
        <ScrollRevealGSAP from={{ opacity: 0, y: 12 }} to={{ opacity: 1, y: 0 }} duration={0.6}>
          <p className="text-xs uppercase tracking-[0.3em] text-rido-magenta-light mb-4 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" /> Rido Motion Lab
          </p>
        </ScrollRevealGSAP>
        <h1
          ref={headlineRef}
          className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[0.95] text-balance max-w-4xl"
        >
          Enterprise motion for the Costa del Sol.
        </h1>
        <ScrollRevealGSAP
          from={{ opacity: 0, y: 12 }}
          to={{ opacity: 1, y: 0 }}
          duration={0.6}
          delay={0.4}
        >
          <p className="mt-6 text-lg text-muted-strong max-w-2xl">
            GSAP + ScrollTrigger, react-three-fiber, react-spring, vaul, sonner, simplex-noise,
            Lenis, and tw-animate-css — all wired for Next.js 16 / React 19 / Tailwind 4.
          </p>
        </ScrollRevealGSAP>

        <ScrollRevealGSAP
          from={{ opacity: 0, y: 8 }}
          to={{ opacity: 1, y: 0 }}
          duration={0.5}
          delay={0.7}
        >
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Magnetic strength={0.3}>
              <button
                onClick={() => setCommandOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-medium transition-colors cursor-pointer"
              >
                <Command className="w-3.5 h-3.5" />
                Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono">⌘K</kbd>
              </button>
            </Magnetic>
            <Magnetic strength={0.3}>
              <button
                onClick={() => setDrawerOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rido-magenta hover:bg-rido-magenta-dark text-sm font-medium transition-colors cursor-pointer"
              >
                <Menu className="w-3.5 h-3.5" />
                Open premium drawer
              </button>
            </Magnetic>
          </div>
        </ScrollRevealGSAP>
      </header>

      {/* Grid of demos */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <DemoCard icon={<Type className="w-4 h-4" />} title="GSAP + ScrollTrigger" desc="SplitText, scroll parallax, and timeline-based reveals. Premium plugin stack.">
          <ScrollRevealGSAP
            from={{ opacity: 0, x: -20 }}
            to={{ opacity: 1, x: 0 }}
            duration={0.8}
            ease="expo.out"
            className="space-y-3"
          >
            <p className="text-muted-strong">From the left, ease expo.out, 0.8s.</p>
            <p className="text-rido-magenta-light font-semibold">Scroll down to retrigger the demos.</p>
            <p className="text-sm text-muted">ScrollTrigger handles pin / scrub / batch.</p>
          </ScrollRevealGSAP>
        </DemoCard>

        <DemoCard icon={<Box className="w-4 h-4" />} title="react-three-fiber" desc="3D brand orb with distortion + float. Drei primitives.">
          <div className="h-48 -mx-2 -mb-2 rounded-xl overflow-hidden bg-gradient-to-br from-rido-magenta/10 to-rido-green/10 relative">
            <Scene3D showStars showEnvironment={false} />
            <p className="absolute bottom-3 left-3 text-xs text-muted">Distort + Float + Stars</p>
          </div>
        </DemoCard>

        <DemoCard icon={<Zap className="w-4 h-4" />} title="react-spring" desc="Spring-physics count-up. No rAF jank, no setState in a loop.">
          <div className="text-5xl font-black tabular-nums text-rido-magenta">
            <NumberCounter value={1247} suffix="+" />
          </div>
          <p className="text-sm text-muted mt-1">riders on the waitlist (live)</p>
          <div className="mt-4 text-3xl font-bold tabular-nums text-white">
            €<NumberCounter value={1499} /> flat rate
          </div>
        </DemoCard>

        <DemoCard icon={<Layers className="w-4 h-4" />} title="simplex-noise" desc="Procedural noise field — the Vercel/Linear atmospheric layer.">
          <div className="h-32 -mx-2 -mb-2 rounded-xl overflow-hidden relative bg-rido-navy">
            <NoiseField width={1200} height={600} tint="rgba(222, 4, 152, 0.18)" base="rgba(15, 23, 42, 1)" className="absolute inset-0" />
          </div>
          <p className="text-xs text-muted mt-2">Tinted magenta noise over navy. Pauses on tab hidden.</p>
        </DemoCard>

        <DemoCard icon={<MousePointer2 className="w-4 h-4" />} title="Magnetic + Draggable" desc="@use-gesture/react + spring physics for interactive cards.">
          <div className="grid grid-cols-2 gap-3">
            <Magnetic strength={0.5}>
              <div className="rounded-xl bg-rido-magenta/20 border border-rido-magenta/30 p-4 text-center font-bold cursor-pointer">
                Hover me
              </div>
            </Magnetic>
            <DraggableCard className="rounded-xl bg-rido-green/20 border border-rido-green/30 p-4 text-center font-bold">
              Drag me
            </DraggableCard>
          </div>
          <p className="text-xs text-muted mt-3">Magnetic uses GSAP, draggable uses use-gesture + spring.</p>
        </DemoCard>

        <DemoCard icon={<Wind className="w-4 h-4" />} title="Floating + tw-animate-css" desc="Tailwind 4 native animation utilities + spring float.">
          <div className="flex items-center justify-around h-32">
            <FloatingElement amplitude={10} duration={2400}>
              <div className="w-10 h-10 rounded-full bg-rido-magenta/80 shadow-lg shadow-rido-magenta/30" />
            </FloatingElement>
            <FloatingElement amplitude={14} duration={3000}>
              <div className="w-10 h-10 rounded-full bg-rido-green/80 shadow-lg shadow-rido-green/30" />
            </FloatingElement>
            <div className="w-10 h-10 rounded-full bg-rido-yellow/80 animate-[wiggle_2.5s_ease-in-out_infinite] shadow-lg shadow-rido-yellow/30" />
          </div>
          <p className="text-xs text-muted mt-2">React-spring bob + Tailwind 4 keyframe animation.</p>
        </DemoCard>

        <DemoCard icon={<MessageSquare className="w-4 h-4" />} title="Sonner toasts" desc="Stacked, themeable, promise-aware notifications.">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => showSuccess("Reservation confirmed", "We'll email you when Rido launches.")}
              className="px-3 py-1.5 rounded-lg bg-rido-green/20 border border-rido-green/30 text-rido-green text-sm font-medium hover:bg-rido-green/30 transition-colors cursor-pointer"
            >
              Success
            </button>
            <button
              onClick={() => showError("Couldn't save", "Please try again.")}
              className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-medium hover:bg-red-500/30 transition-colors cursor-pointer"
            >
              Error
            </button>
            <button
              onClick={() => showInfo("Heads up", "Rido is launching Q2 2026.")}
              className="px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-medium hover:bg-blue-500/30 transition-colors cursor-pointer"
            >
              Info
            </button>
            <button
              onClick={() => showLoading("Loading...")}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer"
            >
              Loading
            </button>
            <button
              onClick={() =>
                showPromise(fakePromise({ ok: true }, 1800), {
                  loading: "Reserving your spot...",
                  success: "You're on the list!",
                  error: "Something went wrong",
                })
              }
              className="px-3 py-1.5 rounded-lg bg-rido-magenta/20 border border-rido-magenta/30 text-rido-magenta-light text-sm font-medium hover:bg-rido-magenta/30 transition-colors cursor-pointer"
            >
              Promise
            </button>
          </div>
        </DemoCard>

        <DemoCard icon={<Menu className="w-4 h-4" />} title="Vaul drawer" desc="iOS-style bottom sheet with snap points.">
          <button
            onClick={() => setDrawerOpen(true)}
            className="px-4 py-2 rounded-xl bg-rido-magenta hover:bg-rido-magenta-dark text-sm font-medium transition-colors cursor-pointer"
          >
            Open drawer
          </button>
        </DemoCard>
      </section>

      {/* Big scroll demo */}
      <ScrollRevealGSAP
        from={{ opacity: 0, scale: 0.96 }}
        to={{ opacity: 1, scale: 1 }}
        duration={1.2}
        ease="expo.out"
        className="max-w-6xl mx-auto mt-20"
      >
        <div className="rounded-2xl glass p-12 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-rido-magenta-light mb-4">End of page</p>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Motion that feels <span className="text-gradient-brand">alive</span>.
          </h2>
          <p className="mt-4 text-muted">Every demo on this page respects <code>prefers-reduced-motion</code>.</p>
        </div>
      </ScrollRevealGSAP>

      <Drawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="Vaul premium drawer"
        description="iOS-style bottom sheet. Swipe to dismiss or press Esc."
        snapPoints={[0.5, 1]}
        defaultSnap={0}
      >
        <div className="space-y-4">
          <p className="text-muted-strong">
            Drawers are perfect for mobile-first flows: city pickers, ride summaries, account sheets.
            Built on Radix UI primitives with spring snap physics.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><span className="text-rido-green">✓</span> Snap points (50% / 100%)</li>
            <li className="flex items-center gap-2"><span className="text-rido-green">✓</span> Drag handle + scrim</li>
            <li className="flex items-center gap-2"><span className="text-rido-green">✓</span> Esc to close</li>
            <li className="flex items-center gap-2"><span className="text-rido-green">✓</span> Touch + mouse</li>
            <li className="flex items-center gap-2"><span className="text-rido-green">✓</span> Portal + z-index safe</li>
          </ul>
        </div>
      </Drawer>

      <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
    </main>
  );
}

function DemoCard({
  icon,
  title,
  desc,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <ScrollRevealGSAP
      from={{ opacity: 0, y: 24 }}
      to={{ opacity: 1, y: 0 }}
      duration={0.7}
      ease="power3.out"
    >
      <div className="rounded-2xl glass p-6 h-full flex flex-col gap-4 hover:border-rido-magenta/40 transition-colors">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-rido-magenta/15 text-rido-magenta flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-white">{title}</h3>
            <p className="text-xs text-muted leading-relaxed">{desc}</p>
          </div>
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </ScrollRevealGSAP>
  );
}
