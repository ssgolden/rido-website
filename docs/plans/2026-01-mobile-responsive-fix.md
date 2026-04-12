# Rido Mobile Responsive Fix Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` or `subagent-driven-development`.

**Goal:** Fix all mobile responsiveness issues so the Rido website renders perfectly on Samsung Galaxy S25 (360×780 CSS viewport) and all other mobile devices. The hero section is the primary complaint — it crops on mobile. Every section must be tested and fixed.

**Architecture:** Systematic fix of all 9 sections + Navbar + layout. Use CSS `dvh` units for mobile viewport, adjust all mobile breakpoints, test every component at 360px width.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Framer Motion 12

---

## Root Cause Analysis

The S25 has a CSS viewport of **360×780px** (with browser chrome). The hero section uses `min-h-screen` which resolves to `100vh`. On mobile browsers, `100vh` includes the address bar and navigation UI, so content positioned near `bottom-10` gets hidden behind the browser chrome. Additionally:

| # | Issue | Severity | File(s) |
|---|-------|----------|----------|
| 1 | **`min-h-screen` uses `100vh`** — on mobile, this includes browser chrome, causing content to overflow below the visible viewport | Critical | Hero.tsx |
| 2 | **Hero `pt-24` (96px)** is too much top padding on mobile — navbar is only ~52px, leaving 44px dead space | High | Hero.tsx |
| 3 | **Scroll arrow `bottom-10`** is hidden behind mobile browser chrome | High | Hero.tsx |
| 4 | **Blur orbs extend outside viewport** (`-right-1/4`, `-left-1/4` on 600px+ elements) — potential H-scroll | Medium | Hero.tsx |
| 5 | **DownloadCTA `min-w-[220px]` buttons** — two buttons at 220px each = 440px + 16px gap, overflows 360px viewport | High | DownloadCTA.tsx |
| 6 | **Vehicle tab buttons `px-6`** — "Rido Scooter" + "Rido Bike" at px-6 each can overflow 360px | Medium | Vehicles.tsx |
| 7 | **Button `size="lg"` has `px-8 py-4 text-lg`** — with children (icon + text), Download CTA buttons are very wide | High | Button.tsx, DownloadCTA.tsx |
| 8 | **HowItWorks step number circles `-top-4`** — the number badge sits above the card and may clip on mobile | Low | HowItWorks.tsx |
| 9 | **Pricing calculator `max-w-lg` (512px)** is fine, but the plan selector buttons may be tight on 360px | Low | Pricing.tsx |
| 10 | **No `overscroll-behavior: contain`** on body — pull-to-refresh can interfere with scroll animations | Medium | globals.css |

---

## Task Summary (8 tasks)

| # | Task | Files Changed | Priority |
|---|------|---------------|----------|
| 1 | Fix Hero: `dvh` viewport, mobile padding, scroll arrow | Hero.tsx | Critical |
| 2 | Fix Download CTA: responsive button sizing | DownloadCTA.tsx | High |
| 3 | Fix Vehicle tabs: responsive button text | Vehicles.tsx | Medium |
| 4 | Fix Navbar: mobile safe area padding | Navbar.tsx | Medium |
| 5 | Add `min-h-dvh` fallback + overscroll to globals | globals.css, layout.tsx | High |
| 6 | Fix all section headings for 360px | All section files | Medium |
| 7 | Fix DownloadCTA phone image height on short viewports | DownloadCTA.tsx | Medium |
| 8 | Fix Pricing calculator on 360px | Pricing.tsx | Low |

---

## Task 1: Fix Hero — Critical Mobile Cropping

**File:** `src/components/sections/Hero.tsx`

**Problems:**
- `min-h-screen` uses `100vh` which includes mobile browser chrome
- `pt-24` (96px) wastes space on mobile (navbar is ~52px)
- `bottom-10` scroll arrow is hidden behind mobile browser
- Blur orbs at `-right-1/4` / `-left-1/4` extend beyond viewport

**Fix:**

```tsx
<section className="relative min-h-dvh flex items-center justify-center overflow-hidden">
  {/* Background layers - contain the orbs within viewport */}
  <div className="absolute inset-0 bg-gradient-to-br from-rido-navy via-rido-navy to-rido-magenta/20" />
  <div className="absolute inset-0 bg-cover bg-center opacity-[0.07]" style={{ backgroundImage: "url('/images/lifestyle/rido-rider-street.jpg')" }} />
  <div className="absolute top-1/4 right-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] rounded-full bg-rido-magenta/10 blur-3xl -translate-x-0" />
  <div className="absolute bottom-0 left-0 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] rounded-full bg-rido-green/10 blur-3xl translate-x-0" />

  <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center pt-20 pb-24 sm:pt-24">
    {/* ...badge, h1, p, buttons, stats... */}
  </div>

  {/* Scroll arrow positioned within safe area */}
  <a
    href="#how-it-works"
    className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 text-white/30 motion-safe:animate-bounce"
    aria-label="Scroll down"
  >
    <ChevronDown size={32} />
  </a>
</section>
```

Key changes:
- `min-h-screen` → `min-h-dvh` (dynamic viewport height, accounts for browser chrome)
- `pt-24` → `pt-20 pb-24 sm:pt-24` (less top padding on mobile, explicit bottom padding)
- Bottom arrow `bottom-10` → `bottom-6 sm:bottom-10` (safe on mobile)
- Blur orb positions: `top-1/4 -right-1/4 w-[600px]` → `top-1/4 right-0 w-[300px] sm:w-[600px]` (contained on mobile)
- Second orb: same treatment — smaller on mobile, contained
- `px-6` → `px-4 sm:px-6`

---

## Task 2: Fix Download CTA — Responsive Button Sizing

**File:** `src/components/sections/DownloadCTA.tsx`

**Problems:**
- `min-w-[220px]` on each button: 2×220 + 16px gap = 456px > 360px viewport
- Phone image `max-w-[280px]` is fine but could be slightly smaller on mobile

**Fix:**
- Remove `min-w-[220px]` — let buttons size to content
- On mobile (`flex-col`), buttons should be `w-full max-w-[280px]`
- Add responsive padding adjustments

```tsx
<div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
  <Button size="lg" className="w-full max-w-[280px] sm:w-auto gap-3">
    <Apple className="w-5 h-5 shrink-0" />
    <span className="flex flex-col items-start">
      <span className="text-[10px] leading-tight opacity-70">Download on the</span>
      <span className="text-sm leading-tight font-bold">App Store</span>
    </span>
  </Button>
  <Button variant="secondary" size="lg" className="w-full max-w-[280px] sm:w-auto gap-3">
    <Play className="w-5 h-5 shrink-0" />
    <span className="flex flex-col items-start">
      <span className="text-[10px] leading-tight opacity-70">Get it on</span>
      <span className="text-sm leading-tight font-bold">Google Play</span>
    </span>
  </Button>
</div>
```

---

## Task 3: Fix Vehicle Tabs — Responsive Button Text

**File:** `src/components/sections/Vehicles.tsx`

**Problem:** `px-6 py-3` on each tab with full names "Rido Scooter" / "Rido Bike" can overflow on 360px.

**Fix:**
- Reduce padding to `px-4 py-2.5 sm:px-6 sm:py-3`
- Shorten labels on mobile: use abbreviated names

```tsx
<button
  onClick={() => handleVehicleChange(i)}
  className={`px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
    i === active
      ? "bg-rido-magenta text-white shadow-lg shadow-rido-magenta/25"
      : "glass text-white/60 hover:text-white hover:bg-white/10"
  }`}
>
  {vehicle.name === "Rido Scooter" ? (
    <><span className="sm:hidden">Scooter</span><span className="hidden sm:inline">Rido Scooter</span></>
  ) : (
    <><span className="sm:hidden">Bike</span><span className="hidden sm:inline">Rido Bike</span></>
  )}
</button>
```

Alternatively, simplify by using shorter names always or just reducing padding:

```tsx
className={`px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-semibold text-sm transition-all ...`}
```

---

## Task 4: Fix Navbar — Mobile Safe Area

**File:** `src/components/layout/Navbar.tsx`

**Problem:** Fixed navbar at `top-3 left-3 right-3` uses absolute pixels from viewport edge, but on phones with rounded corners (like S25), content can be clipped.

**Fix:**
- Add `env(safe-area-inset-*)` support for notched phones
- Reduce mobile padding slightly
- Ensure mobile menu items have adequate spacing

No major code change needed — the current `top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4` is already responsive. Just add viewport-fit=cover meta tag in Task 5.

---

## Task 5: Add `dvh` Support + Viewport Meta + Overscroll

**File:** `src/app/layout.tsx`, `src/app/globals.css`

**Problem:** `min-h-screen` (100vh) doesn't account for dynamic viewport on mobile. Samsung S25 browser shows chrome that makes 100vh taller than the visible viewport.

**Fix in layout.tsx:**
Add `viewport-fit=cover` to the viewport meta for safe-area support:

```tsx
<html lang="en" className="dark">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    ...fonts...
  </head>
```

Wait — Next.js already adds the viewport meta tag automatically. But we can add `viewport-fit=cover` via the metadata API:

```tsx
export const metadata: Metadata = {
  viewport: {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  },
  // ...rest
};
```

Actually in Next.js 14+, `viewport` is a separate export:

```tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
```

**Fix in globals.css:**
Add overscroll behavior and dvh fallback:

```css
@layer base {
  html {
    scroll-behavior: smooth;
    height: 100%;
  }

  body {
    @apply bg-rido-navy text-white font-sans antialiased overflow-x-hidden;
    min-height: 100vh;
    min-height: 100dvh; /* Dynamic viewport height for mobile */
  }
}
```

And add `overscroll-behavior: contain` to the main content:

```css
#main-content {
  overscroll-behavior: contain;
}
```

---

## Task 6: Fix Section Headings on 360px

**Files:** All section files

**Problem:** Section titles use `text-4xl md:text-5xl` which is `2.25rem = 36px` on mobile. At 360px width, long titles like "Choose Your Ride" or "No Surprises" might look fine, but "Real Sustainability" is okay. However, the section `py-24` (96px top AND bottom) is excessive on mobile.

**Fix:** Reduce vertical padding on mobile to `py-16 sm:py-24`:

Every section currently has `className="py-24 px-6"`. Change to:
```tsx
className="py-16 sm:py-24 px-4 sm:px-6"
```

Apply to all 9 sections: Hero, HowItWorks, Vehicles, Cities, Safety, Sustainability, Pricing, About, DownloadCTA.

Also reduce `gap-8` and `gap-12` values on mobile in grid layouts.

---

## Task 7: Fix DownloadCTA Phone Image on Short Viewports

**File:** `src/components/sections/DownloadCTA.tsx`

**Problem:** The phone image `max-w-[280px]` with the floating animation can push content below the fold on very short viewports (landscape phones).

**Fix:** Add `max-h-[50vh] sm:max-h-none` on the phone container to prevent it from dominating short viewports, and reduce section padding:

```tsx
<section aria-label="Download the Rido app" className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
  ...
  <div className="mt-10 sm:mt-12 max-w-[240px] sm:max-w-[280px] mx-auto">
```

---

## Task 8: Fix Pricing Calculator on 360px

**File:** `src/components/sections/Pricing.tsx`

**Problem:** On 360px, the range slider and plan selector work but could be tighter.

**Fix:** Already addressed with `text-xs sm:text-sm` on plan buttons and `p-6 sm:p-8` padding. No major changes needed — just verify it works at 360px.

---

## Execution Priority

1. **Task 5** (globals + layout) — Foundation: dvh units, viewport meta, overscroll
2. **Task 1** (Hero) — Primary complaint: fix viewport cropping
3. **Task 2** (Download CTA) — Button overflow on 360px
4. **Task 6** (All sections) — Reduce padding on mobile
5. **Task 3** (Vehicles) — Tab overflow
6. **Task 7** (Download CTA phone) — Short viewport
7. **Task 4** (Navbar) — Minor, already responsive
8. **Task 8** (Pricing) — Verify only

---

## Pre-Delivery Checklist

- [ ] Hero renders fully on 360×780 viewport (S25 portrait)
- [ ] Hero renders on 320×568 (iPhone SE)
- [ ] No horizontal scrollbar on any viewport
- [ ] All buttons fit within 360px viewport
- [ ] Download CTA buttons don't overflow on mobile
- [ ] Vehicle tab buttons don't overflow on mobile
- [ ] All section padding looks correct at 360px
- [ ] Navbar doesn't overlap content
- [ ] Scroll-down arrow visible on mobile
- [ ] Pricing calculator usable on 360px
- [ ] `min-h-dvh` fallback works on browsers without support
- [ ] Build passes with no TypeScript errors