# Brand Alignment Upgrade Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the website's color palette and logo to match the real Rido brand assets — the checkmark logo visible on the scooter and app, and the exact coral/orange tones from the product photography and app UI.

**Architecture:** Update Tailwind theme tokens in `globals.css`, create SVG checkmark logo component, replace all "Rido." text logos with the real checkmark logo, and propagate color corrections across all components.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, Lucide React

---

## Problem Statement

### What's Wrong

1. **Logo is wrong** — Currently using text "Rido<span class='text-rido-coral'>.</span>" everywhere (Navbar, Footer). The real Rido brand uses a **checkmark (✓) logo** visible on the scooter deck (1000508879.jpg), scooter stem (1000508880.jpg), and app header (1000508881.jpg).

2. **Coral is slightly off** — Current `#FF6B4A` is too pink/salmon. The real brand color from the scooter and app is a **warmer, more orange coral** — approximately `#FF5733` to `#FF6040`. The scooter accent and app UI both show a deeper, more saturated orange-coral.

3. **Navy is too desaturated** — Current `#1A1F36` reads as generic dark blue. The real brand (from the app dark mode and scooter frame) is closer to a **true near-black** like `#0F172A` (slate-900) or `#111827` (gray-900).

4. **Missing checkmark motif** — The checkmark is a central part of the Rido brand identity (it's on every vehicle, in the app, on the deck). It should appear in the logo, loading states, success confirmations, and as a decorative element.

5. **Gold `#FFB84D` doesn't appear in any brand asset** — This was an assumption. The actual brand accent (from the app screenshot) is a **lighter coral/salmon** for secondary highlights, not gold.

6. **Green `#2DD4BF` is teal, not the app's green** — The app uses a more standard green for success/eco states, closer to `#22C55E` (green-500).

### Visual Evidence (from brand images)

| Image | Key Insight |
|-------|-------------|
| `1000508879.jpg` | White scooter on white bg, **coral deck + stem accents**, **Rido checkmark logo on deck** |
| `1000508880.jpg` | Scooter on Spanish street, **checkmark on vertical stem**, coral accents |
| `1000508881.jpg` | App UI: **checkmark logo in header**, **coral primary buttons**, dark background `#111827`-ish, green for success states |
| `1000508885.jpg` | Rider on street, **checkmark logo clearly on footboard** in coral |

---

## New Brand Token System

### Updated Color Palette

| Token | Current | New | Why |
|-------|---------|-----|-----|
| `--color-rido-coral` | `#FF6B4A` | `#FF5733` | Warmer, more orange — matches scooter accent and app buttons |
| `--color-rido-coral-dark` | `#E5553A` | `#E04B20` | Darker variant for hover/active states |
| `--color-rido-coral-light` | (missing) | `#FF8A6A` | Light variant for badges, highlights, hover backgrounds |
| `--color-rido-navy` | `#1A1F36` | `#0F172A` | True near-black, matches app dark mode, better contrast |
| `--color-rido-navy-light` | `#2A2F4A` | `#1E293B` | Subtle surface variant for cards within navy bg |
| `--color-rido-green` | `#2DD4BF` | `#22C55E` | Standard green for eco/success — matches app, less teal |
| `--color-rido-gold` | `#FFB84D` | **REMOVE** | Not in any brand asset. Replace with `rido-coral-light` |
| `--color-rido-cloud` | `#F8FAFC` | `#F8FAFC` | Keep — matches scooter white background |

### Logo Component

**Old:** Text `Rido.` with coral period
**New:** SVG checkmark logo + "rido" wordmark

The checkmark is the **primary brand mark**. It appears:
- As a standalone icon (favicon, app icon, nav)
- Combined with "rido" wordmark (footer, hero)
- The checkmark is rounded/friendly (not angular), colored in `rido-coral`

---

## Task 1: Update Color Tokens in globals.css

**Files:** `src/app/globals.css`

- [ ] **Step 1: Replace the `@theme` color block**

Replace the entire `@theme` block colors with:

```css
@theme {
  --color-rido-coral: #FF5733;
  --color-rido-coral-dark: #E04B20;
  --color-rido-coral-light: #FF8A6A;
  --color-rido-navy: #0F172A;
  --color-rido-navy-light: #1E293B;
  --color-rido-green: #22C55E;
  --color-rido-cloud: #F8FAFC;
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --animate-fade-in: fade-in 0.6s ease-out forwards;
  --animate-slide-up: slide-up 0.6s ease-out forwards;
  --animate-float: float 3s ease-in-out infinite;
  --animate-pulse-glow: pulse-glow 2s ease-in-out infinite;
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(255, 87, 51, 0.3); }
    50% { box-shadow: 0 0 40px rgba(255, 87, 51, 0.6); }
  }
}
```

Key changes:
- `rido-coral` → `#FF5733` (warmer orange)
- `rido-coral-dark` → `#E04B20` (darker hover)
- Added `rido-coral-light` → `#FF8A6A` (for badges, hover bg)
- `rido-navy` → `#0F172A` (true near-black)
- `rido-navy-light` → `#1E293B` (card surfaces)
- `rido-green` → `#22C55E` (standard green, not teal)
- Removed `rido-gold` entirely
- Updated `pulse-glow` to use new coral hex

- [ ] **Step 2: Update base layer body background**

In `@layer base`, ensure the body uses the new navy:

```css
body {
  @apply bg-rido-navy text-white font-sans antialiased;
}
```

This already works because it references the token, which will resolve to the new value.

- [ ] **Step 3: Verify no hardcoded old colors in globals.css**

Search for `#FF6B4A`, `#E5553A`, `#1A1F36`, `#2A2F4A`, `#FFB84D`, `#2DD4BF` in globals.css — none should remain.

---

## Task 2: Create RidoCheckmark Logo Component

**Files:** Create `src/components/ui/RidoLogo.tsx`

- [ ] **Step 4: Create the logo component**

Create `src/components/ui/RidoLogo.tsx`:

```tsx
import { cn } from "@/lib/utils";

interface RidoLogoProps {
  variant?: "full" | "mark" | "wordmark";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RidoLogo({ variant = "full", size = "md", className }: RidoLogoProps) {
  const sizes = {
    sm: { mark: 20, text: "text-lg" },
    md: { mark: 28, text: "text-2xl" },
    lg: { mark: 40, text: "text-4xl" },
  };

  const s = sizes[size];

  // The checkmark mark — rounded, friendly, in coral
  const CheckMark = () => (
    <svg
      width={s.mark}
      height={s.mark}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      {/* Rounded square background */}
      <rect width="32" height="32" rx="8" fill="#FF5733" />
      {/* Checkmark path — rounded, friendly */}
      <path
        d="M9 16.5L13.5 21L23 11"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // The "rido" wordmark — lowercase, modern
  const WordMark = () => (
    <span className={cn("font-black tracking-tight text-white", s.text)}>
      rido
    </span>
  );

  if (variant === "mark") return <CheckMark />;
  if (variant === "wordmark") return <WordMark />;

  return (
    <span className="inline-flex items-center gap-2">
      <CheckMark />
      <WordMark />
    </span>
  );
}
```

The design:
- **Checkmark mark**: Rounded square (`rx="8"`) filled with `rido-coral`, white rounded check path inside — matches the scooter deck logo
- **Wordmark**: Lowercase "rido" in Inter Black — modern, friendly, matches the app header
- **Three variants**: `mark` (icon only), `wordmark` (text only), `full` (icon + text)
- **Three sizes**: `sm` (20px mark), `md` (28px mark), `lg` (40px mark)

---

## Task 3: Replace All Logo Instances

**Files:** `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx`

- [ ] **Step 5: Update Navbar logo**

In `Navbar.tsx`, replace:

```tsx
// OLD
<a href="#" className="text-2xl font-black tracking-tight text-white">
  Rido<span className="text-rido-coral">.</span>
</a>
```

With:

```tsx
// NEW
import { RidoLogo } from "@/components/ui/RidoLogo";

<a href="#" aria-label="Rido home">
  <RidoLogo variant="full" size="md" />
</a>
```

- [ ] **Step 6: Update Footer logo**

In `Footer.tsx`, replace:

```tsx
// OLD
<p className="text-2xl font-black text-white">
  Rido<span className="text-rido-coral">.</span>
</p>
```

With:

```tsx
// NEW
import { RidoLogo } from "@/components/ui/RidoLogo";

<RidoLogo variant="full" size="md" />
```

---

## Task 4: Remove All `rido-gold` References

**Files:** All component files that use `rido-gold`

Since `rido-gold` was our invention and doesn't appear in any brand asset, we must replace all occurrences with brand-correct alternatives.

### Search & Replace Map

| Old (gold) | New | Why |
|------------|-----|-----|
| `bg-rido-gold/15` | `bg-rido-coral-light/15` | Same warm accent, brand-accurate |
| `text-rido-gold` | `text-rido-coral-light` | Lighter coral for secondary highlights |
| `border-rido-gold/25` | `border-rido-coral-light/25` | Consistent border treatment |
| `bg-rido-gold/10` | `bg-rido-coral-light/10` | Subtle background |
| `bg-rido-gold` | `bg-rido-coral-light` | Full background |
| `hover:border-rido-gold` | `hover:border-rido-coral-light` | Hover accent |

- [ ] **Step 7: Find all gold references and replace**

Run search across all `.tsx` files:

```bash
grep -rn "rido-gold" src/
```

Expected files with `rido-gold`:
- `src/components/sections/Cities.tsx` — "Coming Soon" badge uses `rido-gold`
- `src/components/sections/Safety.tsx` — "Beginner Mode" badge uses `rido-gold`
- `src/components/sections/Sustainability.tsx` — no gold (uses green)
- `src/components/sections/About.tsx` — gold dot on Safety value

For each file, replace `rido-gold` with the correct `rido-coral-light` equivalent per the table above.

**Cities.tsx** — "Coming Soon" badge:
```tsx
// OLD
<span className="... bg-rido-gold/15 text-rido-gold border-rido-gold/25">Coming Soon</span>
// NEW
<span className="... bg-rido-coral-light/15 text-rido-coral-light border-rido-coral-light/25">Coming Soon</span>
```

**Safety.tsx** — "Beginner Mode" section:
```tsx
// OLD
className="... border-rido-coral/30"
// Also update the badge inside:
<span className="... bg-rido-gold/15 text-rido-gold border-rido-gold/25">Automatic for new riders</span>
// NEW
<span className="... bg-rido-coral-light/15 text-rido-coral-light border-rido-coral-light/25">Automatic for new riders</span>
```

And the Gauge icon:
```tsx
// OLD
<Gauge className="w-6 h-6 text-rido-gold" />
// NEW
<Gauge className="w-6 h-6 text-rido-coral-light" />
```

**About.tsx** — Gold dot on middle value:
```tsx
// OLD
<div className="w-3 h-3 rounded-full mt-2 shrink-0 bg-rido-gold"></div>
// NEW
<div className="w-3 h-3 rounded-full mt-2 shrink-0 bg-rido-coral-light"></div>
```

- [ ] **Step 8: Verify no gold references remain**

```bash
grep -rn "rido-gold" src/
```

Expected: zero results.

---

## Task 5: Fix Hardcoded Old Colors in Components

**Files:** All `.tsx` files with hardcoded hex values

- [ ] **Step 9: Search for old hardcoded colors**

```bash
grep -rn "#FF6B4A\|#E5553A\|#1A1F36\|#2A2F4A\|#FFB84D\|#2DD4BF" src/
```

Any matches should be replaced with the corresponding new token class. Expected: none in `.tsx` files (they should all use Tailwind classes), but verify.

---

## Task 6: Update Gradient Utilities

**Files:** `src/app/globals.css`

- [ ] **Step 10: Update gradient utilities**

The `text-gradient-coral` class should use the updated colors:

```css
.text-gradient-coral {
  @apply bg-gradient-to-r from-rido-coral to-rido-coral-light bg-clip-text text-transparent;
}
```

Previously was `from-rido-coral to-rido-gold` — now uses `from-rido-coral to-rido-coral-light` which is more brand-accurate (coral to lighter coral, not coral to gold).

Also verify `glass` and `glass-strong` still work with the new navy:

```css
.glass {
  @apply bg-white/5 backdrop-blur-xl border border-white/10;
}
.glass-strong {
  @apply bg-white/10 backdrop-blur-2xl border border-white/20;
}
```

These are fine — they use transparent whites, not brand colors.

---

## Task 7: Update Button Component Hover States

**Files:** `src/components/ui/Button.tsx`

- [ ] **Step 11: Update Button to use new coral-dark**

The Button already uses `rido-coral` and `rido-coral-dark` tokens, so the color update propagates automatically. But verify the shadow uses the right reference:

```tsx
variant === "primary" &&
  "bg-rido-coral hover:bg-rido-coral-dark text-white shadow-lg shadow-rido-coral/25",
```

This is correct — when the tokens change, the rendered colors change automatically.

---

## Task 8: Update Data Files with Checkmark References

**Files:** `src/data/vehicles.ts`, `src/data/pricing.ts`

- [ ] **Step 12: Verify data files don't use removed tokens**

```bash
grep -rn "rido-gold" src/data/
```

Expected: zero results. If any found, replace per the mapping table in Task 4.

---

## Task 9: Update Badge Component

**Files:** `src/components/ui/Badge.tsx`

- [ ] **Step 13: Replace gold badge variant with coral-light**

The Badge currently has a `gold` variant. Replace it:

```tsx
// OLD
variant === "gold" &&
  "bg-rido-gold/15 text-rido-gold border border-rido-gold/25",
// NEW
variant === "coral-light" &&
  "bg-rido-coral-light/15 text-rido-coral-light border border-rido-coral-light/25",
```

Also update any Badge usage from `variant="gold"` to `variant="coral-light"`:

Search:
```bash
grep -rn 'variant="gold"' src/
```

Replace all instances with `variant="coral-light"`.

---

## Task 10: Create Favicon from Checkmark Logo

**Files:** `public/favicon.ico`, `public/apple-touch-icon.png`, `public/favicon-32x32.png`, `public/favicon-16x16.png`

- [ ] **Step 14: Generate favicon SVG**

Create `public/favicon.svg` (modern browsers support SVG favicons):

```svg
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="8" fill="#FF5733"/>
  <path d="M9 16.5L13.5 21L23 11" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

- [ ] **Step 15: Update layout.tsx to use SVG favicon**

In `src/app/layout.tsx`, add/update the metadata:

```tsx
export const metadata: Metadata = {
  icons: {
    icon: "/favicon.svg",
  },
  // ... rest of metadata
};
```

This replaces the default Next.js favicon.

---

## Task 11: Visual QA & Build Verification

- [ ] **Step 16: Run production build**

```bash
cd "C:\Users\steph\OneDrive\Desktop\Rido"
npm run build
```

Expected: ✓ Compiled successfully, no TypeScript errors.

- [ ] **Step 17: Start dev server and verify visual changes**

```bash
npm run dev
```

Check at `localhost:3000`:
1. **Navbar** — Shows checkmark logo + "rido" wordmark (not "Rido.")
2. **Footer** — Same updated logo
3. **Hero** — Coral gradient is warmer/more orange (not pink-salmon)
4. **Vehicles** — Product image matches the warmer coral accents
5. **Cities** — "Coming Soon" badge is coral-light, not gold
6. **Safety** — "Beginner Mode" badge is coral-light, not gold
7. **About** — Middle dot is coral-light, not gold
8. **Pricing** — "Most Popular" badge is coral (correct, no change)
9. **Download CTA** — Coral gradient warmer
10. **Favicon** — Checkmark icon in browser tab
11. **All gradients** — Coral→coral-light (not coral→gold)

- [ ] **Step 18: Verify no console errors**

Open browser DevTools. No hydration errors, no 404s for images, no CSS warnings.

- [ ] **Step 19: Commit the brand upgrade**

```bash
git add -A
git commit -m "feat: align brand palette & logo with real Rido assets

- Updated coral to #FF5733 (warmer orange, matches scooter/app)
- Updated navy to #0F172A (true near-black, matches app dark mode)
- Updated green to #22C55E (standard green, matches app success states)
- Removed gold (#FFB84D) — not in any brand asset
- Added coral-light (#FF8A6A) as secondary warm accent
- Created RidoCheckmark Logo component (SVG mark + wordmark)
- Replaced text 'Rido.' logo with checkmark logo in Navbar & Footer
- Created favicon.svg from checkmark logo
- Replaced all rido-gold usage with rido-coral-light
- Updated gradient to coral→coral-light (was coral→gold)"
```

---

## Summary of Changes

| What | Before | After |
|------|--------|-------|
| **Logo** | Text "Rido." with coral period | SVG checkmark mark + "rido" wordmark |
| **Primary coral** | `#FF6B4A` (pink-salmon) | `#FF5733` (warm orange-coral) |
| **Dark background** | `#1A1F36` (desaturated navy) | `#0F172A` (true near-black) |
| **Accent/gold** | `#FFB84D` (gold — not in brand) | `#FF8A6A` (coral-light — warm accent) |
| **Success green** | `#2DD4BF` (teal) | `#22C55E` (standard green) |
| **Favicon** | Default Next.js | Rido checkmark SVG |
| **Gradient** | coral → gold | coral → coral-light |

### Files Changed

| File | Change |
|------|--------|
| `src/app/globals.css` | Updated all color tokens, removed gold, added coral-light, updated gradient |
| `src/components/ui/RidoLogo.tsx` | **NEW** — Checkmark logo component |
| `src/components/ui/Badge.tsx` | Replace `gold` variant with `coral-light` |
| `src/components/ui/Button.tsx` | Tokens auto-propagate (verify only) |
| `src/components/layout/Navbar.tsx` | Replace text logo with RidoLogo component |
| `src/components/layout/Footer.tsx` | Replace text logo with RidoLogo component |
| `src/components/sections/Cities.tsx` | Replace `rido-gold` with `rido-coral-light` |
| `src/components/sections/Safety.tsx` | Replace `rido-gold` with `rido-coral-light` |
| `src/components/sections/About.tsx` | Replace gold dot with coral-light dot |
| `src/app/layout.tsx` | Update favicon to SVG checkmark |
| `public/favicon.svg` | **NEW** — SVG checkmark favicon |