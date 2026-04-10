# Brand Color Correction Plan — Magenta, Not Coral

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct the website's primary color from orange-coral (#FF5733) to the true Rido brand color — vibrant magenta/fuchsia (#DE0498) — as confirmed by programmatic pixel extraction from all 4 brand assets, and update all color tokens, gradients, shadows, and component references accordingly.

**Architecture:** Update the Tailwind `@theme` token block in `globals.css`, rename all semantic color classes from "coral" to "magenta", update all component files that reference those classes, update the RidoLogo SVG, and update all hover/active/shadow values.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, Lucide React

---

## Problem Statement

### The Evidence (Programmatic Extraction)

Pixel-by-pixel analysis of all 4 Rido brand assets reveals the actual color:

| Image | Dominant Saturated Color | Pixel Count | Hue Family |
|-------|--------------------------|-------------|------------|
| Scooter Product (1000508879) | `#FF31B7` | 35,891 | magenta/pink |
| Scooter Street (1000508880) | `#FF4A9B` | 14,569 | magenta/pink |
| **App Screenshot (1000508881)** | **`#DE0498`** | **20,694** | **magenta/pink** |
| Rider Street (1000508885) | `#DF0B84` | 39,821 | magenta/pink |

**Canonical color: `#DE0498`** — from the app screenshot (studio-rendered, no lighting variation).

### Why This Matters

| What We Did | What It Should Be | Delta |
|-------------|-------------------|-------|
| `#FF5733` (warm orange-coral) | `#DE0498` (vibrant magenta) | **47% color distance** |
| `#E04B20` (coral-dark) | `#C10385` (magenta-dark) | **52% color distance** |
| `#FF8A6A` (coral-light) | `#F23DB5` (magenta-light) | **32% color distance** |

The ENTIRE hue family is wrong. We're building in orange-coral when the brand is magenta/fuchsia. This is not a subtle shade correction — it's a complete hue shift from orange (30°) to magenta (320°).

### Additional Brand Colors Extracted

| Token | Source | Hex | Usage |
|-------|--------|-----|-------|
| **Primary** | App scooter markers/buttons | `#DE0498` | CTAs, headings, accents |
| **Primary Hover** | Derived (85% brightness) | `#C10385` | Button hover/active |
| **Primary Light** | Derived (35% toward white) | `#F23DB5` | Badges, subtle bg |
| **Yellow Accent** | App map markers | `#FDE803` | Secondary accent (use sparingly) |
| **Dark Text** | App text color | `#201E1F` | Text on light bg (warm near-black) |
| **Dark Surface** | App dark mode bg | `#0F172A` | Keep (matches our current) |

---

## New Design Token System

| Token | Old Value | New Value | Name Change |
|-------|-----------|-----------|-------------|
| `--color-rido-coral` | `#FF5733` | `#DE0498` | `rido-coral` → `rido-magenta` |
| `--color-rido-coral-dark` | `#E04B20` | `#C10385` | `rido-coral-dark` → `rido-magenta-dark` |
| `--color-rido-coral-light` | `#FF8A6A` | `#F23DB5` | `rido-coral-light` → `rido-magenta-light` |
| `--color-rido-navy` | `#0F172A` | `#0F172A` | No change |
| `--color-rido-navy-light` | `#1E293B` | `#1E293B` | No change |
| `--color-rido-green` | `#22C55E` | `#22C55E` | No change |
| `--color-rido-cloud` | `#F8FAFC` | `#F8FAFC` | No change |
| (new) `--color-rido-yellow` | — | `#FDE803` | New accent from app |
| `--color-rido-gold` | **REMOVED** | — | Already removed |

### Name Migration: `rido-coral` → `rido-magenta`

Since Tailwind CSS v4 uses `@theme` tokens that map to utility classes like `bg-rido-coral`, `text-rido-coral`, etc., renaming the token automatically renames the utility. However, we must also update ALL component files that hardcode `rido-coral` in class names.

---

## Task 1: Update Color Tokens in globals.css

**Files:** `src/app/globals.css`

- [ ] **Step 1: Replace the @theme color block**

Replace the current `@theme` colors with:

```css
@theme {
  --color-rido-magenta: #DE0498;
  --color-rido-magenta-dark: #C10385;
  --color-rido-magenta-light: #F23DB5;
  --color-rido-navy: #0F172A;
  --color-rido-navy-light: #1E293B;
  --color-rido-green: #22C55E;
  --color-rido-yellow: #FDE803;
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
    0%, 100% { box-shadow: 0 0 20px rgba(222, 4, 152, 0.3); }
    50% { box-shadow: 0 0 40px rgba(222, 4, 152, 0.6); }
  }
}
```

Key changes:
- `rido-coral` → `rido-magenta` (`#DE0498`)
- `rido-coral-dark` → `rido-magenta-dark` (`#C10385`)
- `rido-coral-light` → `rido-magenta-light` (`#F23DB5`)
- Added `rido-yellow` (`#FDE803`) from app map accent
- `pulse-glow` updated to use `rgba(222, 4, 152, ...)` instead of `rgba(255, 87, 51, ...)`

- [ ] **Step 2: Update utility classes**

In the `@layer utilities` block, update:

```css
.text-gradient-coral {
  @apply bg-gradient-to-r from-rido-magenta to-rido-magenta-light bg-clip-text text-transparent;
}
```

Rename the class too — `text-gradient-coral` → `text-gradient-brand`:

```css
.text-gradient-brand {
  @apply bg-gradient-to-r from-rido-magenta to-rido-magenta-light bg-clip-text text-transparent;
}
```

Also add a backward-compat alias (will remove later):

```css
.text-gradient-coral {
  @apply bg-gradient-to-r from-rido-magenta to-rido-magenta-light bg-clip-text text-transparent;
}
```

---

## Task 2: Update RidoLogo Component

**Files:** `src/components/ui/RidoLogo.tsx`

- [ ] **Step 3: Update the checkmark SVG fill color**

Change the SVG `fill="#FF5733"` to `fill="#DE0498"`:

```tsx
<rect width="32" height="32" rx="8" fill="#DE0498" />
```

---

## Task 3: Update Favicon SVG

**Files:** `public/favicon.svg`

- [ ] **Step 4: Update favicon checkmark color**

Change the `fill="#FF5733"` to `fill="#DE0498"`:

```svg
<rect width="32" height="32" rx="8" fill="#DE0498"/>
```

---

## Task 4: Mass Rename `rido-coral` → `rido-magenta` in Components

This is the largest task. Every CSS class reference must be updated.

**Search command:**
```bash
grep -rn "rido-coral" src/
```

Expected files (from previous codebase knowledge):

| File | Classes to Update |
|------|-------------------|
| `Hero.tsx` | `text-rido-coral`, `bg-rido-coral/10`, `from-rido-coral`, `shadow-rido-coral`, `text-gradient-coral` |
| `HowItWorks.tsx` | `text-rido-coral`, `bg-rido-coral/10`, `bg-rido-coral`, `shadow-rido-coral/25` |
| `Vehicles.tsx` | `text-rido-coral`, `bg-rido-coral`, `text-gradient-coral` |
| `Cities.tsx` | `text-rido-coral`, `bg-rido-coral/10`, `text-rido-coral` |
| `Safety.tsx` | `text-rido-coral`, `bg-rido-coral/10`, `border-rido-coral/30` |
| `Pricing.tsx` | `text-rido-coral`, `border-rido-coral/40`, `shadow-rido-coral/10` |
| `About.tsx` | `text-rido-coral`, `text-gradient-coral`, `bg-rido-coral` |
| `DownloadCTA.tsx` | `from-rido-coral/20`, `bg-rido-coral/10`, `shadow-rido-coral/20`, `text-gradient-coral` |
| `Badge.tsx` | `bg-rido-coral/15`, `text-rido-coral`, `border-rido-coral/25` |
| `Button.tsx` | `bg-rido-coral`, `hover:bg-rido-coral-dark`, `shadow-rido-coral/25` |
| `Navbar.tsx` | `hover:text-rido-coral` |

For each file, replace ALL instances of:
- `rido-coral` → `rido-magenta` (in Tailwind classes)
- `text-gradient-coral` → `text-gradient-brand` (in class references)

**Important:** Also update opacity variants like:
- `rido-coral/10` → `rido-magenta/10`
- `rido-coral/15` → `rido-magenta/15`
- `rido-coral/20` → `rido-magenta/20`
- `rido-coral/25` → `rido-magenta/25`
- `rido-coral/30` → `rido-magenta/30`
- `rido-coral/40` → `rido-magenta/40`

- [ ] **Step 5: Update Hero.tsx**
- [ ] **Step 6: Update HowItWorks.tsx**
- [ ] **Step 7: Update Vehicles.tsx**
- [ ] **Step 8: Update Cities.tsx**
- [ ] **Step 9: Update Safety.tsx**
- [ ] **Step 10: Update Pricing.tsx**
- [ ] **Step 11: Update About.tsx**
- [ ] **Step 12: Update DownloadCTA.tsx**
- [ ] **Step 13: Update Badge.tsx**
- [ ] **Step 14: Update Button.tsx**
- [ ] **Step 15: Update Navbar.tsx**

---

## Task 5: Rename `rido-coral-light` → `rido-magenta-light` in Components

After the previous mass rename, find all remaining `rido-coral-light` references:

```bash
grep -rn "rido-coral-light" src/
```

| File | Classes to Update |
|------|-------------------|
| `Cities.tsx` | `bg-rido-coral-light/15`, `text-rido-coral-light`, `border-rido-coral-light/25` |
| `Safety.tsx` | `bg-rido-coral-light/15`, `text-rido-coral-light`, `border-rido-coral-light/25` |
| `About.tsx` | `bg-rido-coral-light` |
| `Badge.tsx` | `bg-rido-coral-light/15`, `text-rido-coral-light`, `border-rido-coral-light/25` |

Replace with:
- `rido-coral-light` → `rido-magenta-light`

- [ ] **Step 16: Mass replace rido-coral-light → rido-magenta-light**

---

## Task 6: Rename `rido-coral-dark` → `rido-magenta-dark` in Components

Search for `rido-coral-dark`:

```bash
grep -rn "rido-coral-dark" src/
```

| File | Classes to Update |
|------|-------------------|
| `Button.tsx` | `hover:bg-rido-coral-dark` |

Replace with `hover:bg-rido-magenta-dark`.

- [ ] **Step 17: Update Button.tsx hover state**

---

## Task 7: Update Data Files

**Files:** `src/data/vehicles.ts`, `src/data/cities.ts`, `src/data/pricing.ts`

- [ ] **Step 18: Search data files for rido-coral references**

```bash
grep -rn "rido-coral\|rido-gold" src/data/
```

Expected: zero results (data files use plain strings like "e-scooter", "e-bike", not color classes). But verify.

---

## Task 8: Remove Backward-Compat Alias

After all component updates are done:

- [ ] **Step 19: Remove `text-gradient-coral` backward-compat alias from globals.css**

Ensure only `text-gradient-brand` remains. Remove the `text-gradient-coral` class.

---

## Task 9: Update BRAIN.md

**Files:** `BRAIN.md`

- [ ] **Step 20: Update Brand Palette section**

Replace the current color table with:

```markdown
### Color Palette (From Brand Assets — Updated 2026-01)

| Token | Hex | Source | Usage |
|-------|-----|--------|-------|
| **Primary** | `#DE0498` | App screenshot (20,694px) | CTAs, headings, accents, logo |
| **Primary Dark** | `#C10385` | Derived (85% brightness) | Hover/active states |
| **Primary Light** | `#F23DB5` | Derived (35% toward white) | Badges, subtle backgrounds |
| **Yellow Accent** | `#FDE803` | App map markers (5,270px) | Secondary accent (use sparingly) |
| **Dark Background** | `#0F172A` | App dark mode | Page background |
| **Surface** | `#1E293B` | Derived | Card backgrounds |
| **Green** | `#22C55E` | Standard | Eco/success/ sustainability |
| **Cloud White** | `#F8FAFC` | Standard | Light backgrounds |

> **Critical:** The brand color is **magenta/fuchsia (#DE0498)**, NOT orange-coral. This was confirmed by programmatic pixel extraction across all 4 brand assets. The initial visual assessment was incorrect.
```

- [ ] **Step 21: Update Key Decisions Log**

Add entry:

```markdown
| 2026-01 | Brand color is magenta (#DE0498), NOT coral | Programmatic pixel extraction from 4 brand assets confirms consistent #DE0498 across all images. Initial visual assessment was fooled by white background making magenta appear warmer. |
```

---

## Task 10: Update Footer Language

The Footer currently has `© 2026 Rido.` — no color references, so no change needed. But verify.

---

## Task 11: Build Verification & Visual QA

- [ ] **Step 22: Run production build**

```bash
cd "C:\Users\steph\OneDrive\Desktop\Rido"
npm run build
```

Expected: ✓ Compiled successfully, no TypeScript errors.

- [ ] **Step 23: Visual QA checklist**

Start `npm run dev` and check at `localhost:3000`:

1. **Hero** — Magenta gradient instead of coral
2. **Navbar logo** — Checkmark SVG fills with #DE0498 (magenta)
3. **Favicon** — Magenta checkmark in browser tab
4. **CTA buttons** — Magenta `bg-rido-magenta` (#DE0498)
5. **Hover states** — Darker magenta `#C10385`
6. **Badges** — Magenta badges with magenta-light
7. **Gradients** — `from-rido-magenta to-rido-magenta-light`
8. **Shadows/glows** — Magenta rgba(222, 4, 152, ...)
9. **All "coral" text gone** — `grep -rn "rido-coral" src/` returns zero
10. **All "coral" CSS classes gone** — No `text-gradient-coral` anywhere

- [ ] **Step 24: Commit**

```bash
git add -A
git commit -m "fix: correct brand color from coral (#FF5733) to magenta (#DE0498)

Coral was an incorrect visual assessment. Programmatic pixel extraction
across all 4 brand assets confirms the true Rido brand color is vibrant
magenta/fuchsia #DE0498 (20,694 pixels in app screenshot, consistent
across scooter product, street, and rider images).

- Renamed all rido-coral tokens → rido-magenta
- Updated: #FF5733 → #DE0498 (primary)
- Updated: #E04B20 → #C10385 (primary-dark)
- Updated: #FF8A6A → #F23DB5 (primary-light)
- Added: #FDE803 (yellow accent from app)
- Updated logo SVG, favicon, gradients, shadows
- Added brand-palette-extractor skill"
```

---

## Summary

| What | Before | After |
|------|--------|-------|
| **Hue** | Orange (30°) | Magenta (320°) |
| **Primary** | `#FF5733` (coral) | `#DE0498` (magenta) |
| **Primary Dark** | `#E04B20` | `#C10385` |
| **Primary Light** | `#FF8A6A` | `#F23DB5` |
| **Token name** | `rido-coral` | `rido-magenta` |
| **Gradient class** | `text-gradient-coral` | `text-gradient-brand` |
| **Logo SVG fill** | `#FF5733` | `#DE0498` |
| **Glow rgba** | `rgba(255, 87, 51, ...)` | `rgba(222, 4, 152, ...)` |
| **New accent** | — | `#FDE803` (yellow from app) |
| **Files changed** | ~15 | All component files + globals.css + RidoLogo + favicon |

### Why This Is Critical

The brand color is the **single most important visual identifier**. Using orange-coral instead of magenta makes the website look like a completely different brand. This 290° hue shift changes:
- Every button CTA
- Every section heading accent
- Every badge and tag
- The logo and favicon
- All shadows, gradients, and glows
- The entire brand identity perception