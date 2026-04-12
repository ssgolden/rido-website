# Rido UI/UX Upgrade Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` or `executing-plans` to execute this plan.

**Goal:** Transform the Rido website from a functional MVP into a premium, cinematic, conversion-optimized experience that rivals Bolt, Lime, and Dott — while maintaining the dark-mode magenta brand identity.

**Architecture:** Upgrade all 12 sections + 3 UI primitives + layout components. Add scroll animations via Framer Motion, fix responsive breakpoints, improve accessibility, optimize performance, and add conversion UX patterns. Each task is self-contained and can be executed by an independent subagent.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, Framer Motion (already in package.json), Lucide React, Inter (via next/font)

---

## Current State Audit — Issues Found

| Category | Issue | Severity | Section(s) |
|----------|-------|----------|-------------|
| **Performance** | Google Fonts `<link>` instead of `next/font` — causes layout shift, slower FCP | High | layout.tsx |
| **Animation** | Framer Motion installed but ZERO scroll animations — the site feels static | High | All sections |
| **Responsive** | No responsive QA at 375px/768px/1024px — hero text, grid layouts untested | High | All |
| **Accessibility** | No `cursor-pointer` on all clickable elements (badges, tabs, cards) | Medium | All |
| **Accessibility** | No `prefers-reduced-motion` support | High | All animated |
| **Accessibility** | No skip-to-content link | Medium | Navbar |
| **Accessibility** | Emojis used as icons in Cities (🛴 🚲) — should use Lucide icons | Medium | Cities |
| **Navigation** | No active section indicator on scroll — users lose position | Medium | Navbar |
| **Navigation** | Mobile menu lacks animation — just pops in/out | Low | Navbar |
| **Hero** | Stats row feels disconnected — needs visual grouping | Medium | Hero |
| **Hero** | `animate-pulse-glow` on CTA is distracting per UX guidelines (continuous animation) | Medium | Hero |
| **HowItWorks** | No step connector lines between cards — flow feels broken | Medium | HowItWorks |
| **HowItWorks** | No app screenshot/visual — just text icons (competitors show real UI) | Medium | HowItWorks |
| **Vehicles** | E-scooter only has 1 image (no gallery like e-bike) | Low | Vehicles |
| **Cities** | Uses emojis 🛴🚲 — violates "no emoji icons" rule | Medium | Cities |
| **Cities** | No visual map — competitors show interactive maps | Medium | Cities |
| **Safety** | Good content but no visual differentiation between items | Low | Safety |
| **Sustainability** | `useEffect` + `IntersectionObserver` for counters instead of Framer Motion | Medium | Sustainability |
| **Pricing** | No interactive pricing calculator (BRAIN.md called for one) | Medium | Pricing |
| **DownloadCTA** | Uses emoji (🍎 ▶) for store buttons — should use proper store badges | High | DownloadCTA |
| **Footer** | Cookie Policy links externally — no in-app page | Low | Footer |
| **Global** | No `<section>` `aria-label` attributes | Medium | All sections |
| **Global** | `scroll-behavior: smooth` in CSS but no `prefers-reduced-motion` override | Medium | globals.css |
| **SEO** | No Open Graph image defined | Medium | layout.tsx |
| **SEO** | `lang="es"` on `<html>` but all content is English | Medium | layout.tsx |

---

## Task Summary (10 tasks, ~40 steps)

| # | Task | Files Changed | Priority |
|---|------|---------------|----------|
| 1 | Performance: `next/font` + metadata upgrade | layout.tsx, globals.css | High |
| 2 | Framer Motion: Scroll animation system | New `ScrollReveal` component, all sections | High |
| 3 | Navbar: Active section + mobile animation + skip link | Navbar.tsx | High |
| 4 | Hero: Kill pulse glow, add content, add motion | Hero.tsx | High |
| 5 | HowItWorks: Step connectors + app visual | HowItWorks.tsx | Medium |
| 6 | Vehicles + Cities: Emoji purge + icon upgrades | Vehicles.tsx, Cities.tsx | Medium |
| 7 | Pricing: Interactive calculator | Pricing.tsx, new `PricingCalculator.tsx` | Medium |
| 8 | DownloadCTA: Store badges + motion | DownloadCTA.tsx | High |
| 9 | Accessibility: aria-labels, reduced-motion, focus states | All sections | High |
| 10 | Responsive QA: Breakpoint fixes | All sections | High |

---

## Task 1: Performance — `next/font` + Metadata Upgrade

**Files:** `src/app/layout.tsx`

**Problem:** Current layout uses a `<link>` to Google Fonts, which:
1. Causes layout shift (CLS score penalty)
2. Adds a network waterfall (slower FCP)
3. Violates Next.js best practice (use `next/font/google`)

**Steps:**

### Step 1.1: Replace Google Fonts `<link>` with `next/font`

Replace the entire `<head>` block and `font-sans` with:

```tsx
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-inter",
});

// In <html>: className={`${inter.variable} dark`}
// In <body>: remove font-sans (handled by variable)
// Remove: <link> tags for Google Fonts
// Remove: --font-sans from @theme (use variable instead)
```

### Step 1.2: Update `globals.css` `@theme` font variable

In `@theme`, change:
```css
--font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
```
to:
```css
--font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
```

### Step 1.3: Add Open Graph image + correct `lang`

```tsx
export const metadata: Metadata = {
  // ...existing...
  openGraph: {
    title: "Rido — Shared E-Scooters & E-Bikes in Spain",
    description: "Move freely across Spain with Rido's shared e-scooters and e-bikes.",
    type: "website",
    images: [{ url: "/images/lifestyle/rido-rider-street.jpg", width: 1200, height: 630, alt: "Rido — Ride Spain" }],
  },
};
```

Change `<html lang="es">` to `<html lang="en">` (content is in English).

### Step 1.4: Verify build

```bash
npm run build
```

---

## Task 2: Framer Motion — Scroll Animation System

**Files:** New `src/components/ui/ScrollReveal.tsx`, all section files

**Problem:** Framer Motion is installed but unused. The entire site feels static with no scroll-triggered animations. Competitors (Bolt, Lime) all animate sections on scroll.

**Steps:**

### Step 2.1: Create `ScrollReveal` component

```tsx
"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
  once?: boolean;
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = "up",
  duration = 0.6,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-80px" });

  const directionOffset = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 },
    none: {},
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...directionOffset[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...directionOffset[direction] }}
      transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}
```

### Step 2.2: Create `StaggerReveal` for child lists

```tsx
"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

interface StaggerRevealProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerReveal({ children, className, staggerDelay = 0.1 }: StaggerRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={{ ...containerVariants, show: { transition: { staggerChildren: staggerDelay } } }}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return <motion.div variants={itemVariants} className={className}>{children}</motion.div>;
}
```

### Step 2.3: Wrap every section with `ScrollReveal`

Apply to all 9 sections in `page.tsx` and internally within sections. Pattern:

```tsx
import { ScrollReveal } from "@/components/ui/ScrollReveal";

// Section title pattern:
<ScrollReveal>
  <p className="text-rido-magenta text-sm font-semibold uppercase tracking-wider mb-3">
    Our Fleet
  </p>
  <h2 className="text-4xl md:text-5xl font-black">
    Choose Your <span className="text-gradient-brand">Ride</span>
  </h2>
</ScrollReveal>

// Card/grid pattern — use StaggerReveal + StaggerItem
<StaggerReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {steps.map((step) => (
    <StaggerItem key={step.title}>
      <Card>...</Card>
    </StaggerItem>
  ))}
</StaggerReveal>
```

Section-by-section animation strategy:

| Section | Title Animation | Content Animation | Special |
|---------|----------------|-------------------|---------|
| Hero | Fade-in with slight scale | Stagger stats + CTAs | Background parallax subtle |
| HowItWorks | Slide-up | Stagger cards with connectors | App screenshot slide-in |
| Vehicles | Slide-up | Tabs + image crossfade | Spec cards stagger |
| Cities | Slide-up | Stagger cards | Map pin drop animation |
| Safety | Slide-up | Stagger cards | Beginner Mode card highlight |
| Sustainability | Slide-up | Counter animation on scroll | Stats number count-up |
| Pricing | Slide-up | Stagger cards | Calculator interactive slide-in |
| About | Slide-left (text) + slide-right (values) | Stagger values cards | Image reveal |
| DownloadCTA | Scale + fade | CTA buttons stagger | Phone float animation |

---

## Task 3: Navbar — Active Section + Mobile Animation + Skip Link

**Files:** `src/components/layout/Navbar.tsx`

**Steps:**

### Step 3.1: Add skip-to-content link

```tsx
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:bg-rido-magenta focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">
  Skip to content
</a>
```

### Step 3.2: Add active section tracking with Intersection Observer

Track which section is currently in view and highlight the corresponding nav link:

```tsx
const [activeSection, setActiveSection] = useState("");

useEffect(() => {
  const sections = navLinks.map(l => l.href.replace("#", ""));
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    },
    { rootMargin: "-50% 0px" }
  );
  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
  return () => observer.disconnect();
}, []);

// Nav link classes:
className={cn(
  "text-sm transition-colors",
  activeSection === link.href.replace("#", "")
    ? "text-rido-magenta font-semibold"
    : "text-white/70 hover:text-rido-magenta"
)}
```

### Step 3.3: Animate mobile menu with Framer Motion

Replace the conditional render with `AnimatePresence` + `motion.div`:

```tsx
import { AnimatePresence, motion } from "framer-motion";

<AnimatePresence>
  {mobileOpen && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="md:hidden overflow-hidden"
    >
      {/* nav links */}
    </motion.div>
  )}
</AnimatePresence>
```

### Step 3.4: Add `cursor-pointer` to mobile toggle button (already has it via `<button>`)

---

## Task 4: Hero — Remove Pulse Glow, Add Motion, Improve Content

**Files:** `src/components/section/Hero.tsx`

**Steps:**

### Step 4.1: Replace `animate-pulse-glow` with subtle entrance animation

The continuous pulse is distracting per UX guidelines ("Infinite animations are distracting — Use for loading indicators only"). Replace with:

```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ delay: 0.8, duration: 0.5 }}
>
  <Button size="lg">Download the App</Button>
</motion.div>
```

### Step 4.2: Add StaggerReveal to stats row

```tsx
<StaggerReveal className="mt-16 flex items-center justify-center gap-12 text-white/40" staggerDelay={0.15}>
  <StaggerItem className="text-center">...</StaggerItem>
  <StaggerItem className="w-px h-10 bg-white/10" />
  <StaggerItem className="text-center">...</StaggerItem>
  <StaggerItem className="w-px h-10 bg-white/10" />
  <StaggerItem className="text-center">...</StaggerItem>
</StaggerReveal>
```

### Step 4.3: Add `id="main-content"` to the `<main>` in page.tsx

```tsx
<main id="main-content">
```

### Step 4.4: Add rider background image to hero for visual depth

Add the lifestyle image as a subtle background:

```tsx
<div className="absolute inset-0 bg-gradient-to-br from-rido-navy via-rido-navy to-rido-magenta/20" />
<div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: "url('/images/lifestyle/rido-rider-street.jpg')" }} />
```

---

## Task 5: HowItWorks — Step Connectors + App Visual

**Files:** `src/components/sections/HowItWorks.tsx`

**Steps:**

### Step 5.1: Add horizontal connector lines between cards on desktop

On `lg:` screens, add a connecting line between step cards:

```tsx
{/* Between cards, on desktop only */}
<div className="hidden lg:block absolute top-1/2 -right-3 w-6 border-t-2 border-dashed border-rido-magenta/30" />
```

Alternatively, add step numbers with progress line:

```tsx
<div className="relative">
  {/* Progress line */}
  <div className="hidden lg:block absolute top-[3.5rem] left-[calc(12.5%+1rem)] right-[calc(12.5%+1rem)] h-0.5 bg-gradient-to-r from-rido-magenta/50 via-rido-magenta/20 to-rido-magenta/50" />
  {/* Cards grid */}
</div>
```

### Step 5.2: Add app screenshot visual next to the steps

Below the steps grid, add the app screenshot:

```tsx
<div className="mt-16 flex justify-center">
  <ScrollReveal direction="up" delay={0.3}>
    <div className="relative max-w-xs">
      <Image
        src="/images/app/rido-app-screenshot.png"
        alt="Rido app showing vehicle map and scan-to-ride"
        width={280}
        height={600}
        className="rounded-3xl shadow-2xl shadow-rido-magenta/20"
      />
      <div className="absolute -inset-4 rounded-[2rem] bg-rido-magenta/5 -z-10" />
    </div>
  </ScrollReveal>
</div>
```

---

## Task 6: Emoji Purge + Icon Upgrades

**Files:** `src/components/sections/Cities.tsx`

### Step 6.1: Replace emojis with Lucide icons in Cities

```tsx
import { Bike, Zap } from "lucide-react";

// Replace:
// 🛴 E-Scooter  →  <><Zap className="w-3 h-3" /> E-Scooter</>
// 🚲 E-Bike     →  <><Bike className="w-3 h-3" /> E-Bike</>
```

---

## Task 7: Pricing — Interactive Calculator

**Files:** `src/components/sections/Pricing.tsx`, new `src/components/ui/PricingCalculator.tsx`

**Problem:** The BRAIN.md competitive positioning says "Transparent pricing calculator" but we don't have one. The current pricing page shows static cards.

### Step 7.1: Create interactive ride cost estimator

```tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";

export function PricingCalculator() {
  const [minutes, setMinutes] = useState(10);
  const [plan, setPlan] = useState<"paygo" | "pass" | "day">("paygo");

  const rates = {
    paygo: { unlock: 0.50, perMin: 0.15 },
    pass: { unlock: 0, perMin: 0.10 },
    day: { unlock: 0, perMin: 0, flatRate: 9.99 },
  };

  const r = rates[plan];
  const total = plan === "day" ? r.flatRate : r.unlock + r.perMin * minutes;

  return (
    <Card className="p-8 max-w-lg mx-auto">
      <h3 className="text-xl font-bold mb-6 text-center">Estimate Your Ride</h3>
      
      {/* Plan selector */}
      <div className="flex gap-2 mb-6">
        {(["paygo", "pass", "day"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPlan(p)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all ${
              plan === p
                ? "bg-rido-magenta text-white"
                : "glass text-white/60 hover:text-white"
            }`}
          >
            {p === "paygo" ? "Pay as you go" : p === "pass" ? "Rido Pass" : "Day Pass"}
          </button>
        ))}
      </div>

      {/* Minutes slider */}
      <div className="mb-6">
        <label className="text-sm text-white/50 mb-2 block">
          Ride duration: <strong className="text-white">{minutes} min</strong>
        </label>
        <input
          type="range"
          min={1}
          max={60}
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          className="w-full accent-rido-magenta"
          aria-label="Ride duration in minutes"
        />
      </div>

      {/* Result */}
      <div className="glass rounded-xl p-4 text-center">
        <p className="text-sm text-white/50">Estimated cost</p>
        <p className="text-4xl font-black text-rido-magenta">€{total.toFixed(2)}</p>
        {plan !== "day" && (
          <p className="text-xs text-white/30 mt-1">
            €{r.unlock.toFixed(2)} unlock + €{r.perMin.toFixed(2)}/min
          </p>
        )}
      </div>
    </Card>
  );
}
```

### Step 7.2: Add calculator below the pricing cards

```tsx
<div className="mt-16">
  <ScrollReveal>
    <PricingCalculator />
  </ScrollReveal>
</div>
```

---

## Task 8: DownloadCTA — Store Badges + Motion

**Files:** `src/components/sections/DownloadCTA.tsx`

### Step 8.1: Replace emoji store buttons with proper SVG store badges

Create inline SVG store badges (Apple and Google Play) since we can't link external images:

```tsx
function AppStoreBadge() {
  return (
    <a href="#" aria-label="Download on the App Store" className="inline-block">
      <svg viewBox="0 0 120 40" className="h-12">
        <rect width="120" height="40" rx="8" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.3"/>
        <text x="36" y="15" fill="white" fontSize="7" fontFamily="Inter, sans-serif">Download on the</text>
        <text x="36" y="30" fill="white" fontSize="12" fontWeight="700" fontFamily="Inter, sans-serif">App Store</text>
        {/* Apple logo path */}
      </svg>
    </a>
  );
}
```

Alternatively, use text + icon approach (simpler, more maintainable):

```tsx
import { Apple, Play } from "lucide-react"; // or use SimpleIcons

<Button size="lg" className="gap-3 min-w-[220px]">
  <Apple className="w-5 h-5" />
  <span className="flex flex-col items-start">
    <span className="text-[10px] leading-tight opacity-70">Download on the</span>
    <span className="text-sm leading-tight font-bold">App Store</span>
  </span>
</Button>

<Button variant="secondary" size="lg" className="gap-3 min-w-[220px]">
  <Play className="w-5 h-5" />
  <span className="flex flex-col items-start">
    <span className="text-[10px] leading-tight opacity-70">Get it on</span>
    <span className="text-sm leading-tight font-bold">Google Play</span>
  </span>
</Button>
```

### Step 8.2: Add phone float animation with Framer Motion

```tsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8, delay: 0.4 }}
>
  <motion.div
    animate={{ y: [0, -8, 0] }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
  >
    <Image ... />
  </motion.div>
</motion.div>
```

And wrap it in `prefers-reduced-motion` check:

```tsx
const prefersReducedMotion = useReducedMotion();
// If true, skip the float animation, just do the fade-in
```

---

## Task 9: Accessibility — aria-labels, reduced-motion, focus states

**Files:** All section files, `globals.css`

### Step 9.1: Add `aria-label` to all sections

```tsx
<section id="how-it-works" aria-label="How it works" className="...">
<section id="vehicles" aria-label="Our vehicles" className="...">
<section id="cities" aria-label="Cities where we operate" className="...">
<section id="safety" aria-label="Safety information" className="...">
<section id="sustainability" aria-label="Sustainability impact" className="...">
<section id="pricing" aria-label="Pricing plans" className="...">
<section id="about" aria-label="About Rido" className="...">
```

### Step 9.2: Add `prefers-reduced-motion` to globals.css

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Step 9.3: Add focus-visible styles to globals.css

```css
@layer base {
  *:focus-visible {
    @apply outline-2 outline-offset-2 outline-rido-magenta;
  }
}
```

### Step 9.4: Add `cursor-pointer` to all interactive elements

Audit every `<button>`, `<a>`, `onClick` element across all components. All should have either default cursor (buttons) or explicit `cursor-pointer` class.

### Step 9.5: Add `alt` text audit

Ensure every `<Image>` has descriptive `alt` text (most already do). Verify all `<a>` tags have `aria-label` when they contain only icons.

---

## Task 10: Responsive QA — Breakpoint Fixes

**Files:** All section files

### Step 10.1: Test at 375px (iPhone SE)

Known issues to fix:
- Hero stats: Switch from `gap-12` to `gap-6` on small screens
- Hero heading: Already responsive (`text-5xl md:text-7xl lg:text-8xl`) ✓
- HowItWorks: Single column on mobile ✓ (already `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`)
- Pricing calculator slider: Ensure `max-w-lg` works on 375px
- DownloadCTA buttons: Stack vertically on small screens ✓ (already `flex-col sm:flex-row`)
- Footer: Already 2-column → 4-column ✓

### Step 10.2: Test at 768px (Tablet)

- Cities grid: 2 columns works ✓ (`sm:grid-cols-2`)
- Vehicles: Single column on tablet (lg breakpoint) — verify

### Step 10.3: Test at 1440px (Desktop)

- Max-width container (`max-w-7xl`) should center content
- Vehicle cards should not stretch too wide

### Step 10.4: Add `overflow-x-hidden` to body

```css
body {
  @apply bg-rido-navy text-white font-sans antialiased overflow-x-hidden;
}
```

---

## Execution Priority Order

1. **Task 1** (Performance) — `next/font` is the single biggest LCP/CLS win
2. **Task 9** (Accessibility) — `prefers-reduced-motion`, focus states, aria-labels
3. **Task 2** (Scroll Animations) — Biggest visual impact upgrade
4. **Task 3** (Navbar) — Active section + skip link
5. **Task 4** (Hero) — Kill pulse glow, add motion
6. **Task 8** (DownloadCTA) — Store badges are conversion-critical
7. **Task 6** (Emoji purge) — Quick win
8. **Task 5** (HowItWorks) — Connectors + app visual
9. **Task 7** (Pricing Calculator) — Conversion feature
10. **Task 10** (Responsive QA) — Final polish pass

---

## Pre-Delivery Checklist (from ui-ux-pro-max skill)

- [ ] No emojis as icons — all replaced with Lucide icons
- [ ] Hover states don't cause layout shift (scale not width/height)
- [ ] All clickable elements have `cursor-pointer`
- [ ] Dark mode contrast verified (white text on `#0F172A` background)
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive at 375px, 768px, 1024px, 1440px
- [ ] All `<img>` and `<Image>` have descriptive `alt` text
- [ ] All sections have `aria-label`
- [ ] Skip-to-content link present
- [ ] Focus-visible outlines work
- [ ] `lang` attribute matches content language (`en`)
- [ ] No layout shift from font loading (`next/font`)
- [ ] Lighthouse audit scores: Performance 90+, Accessibility 95+, SEO 90+