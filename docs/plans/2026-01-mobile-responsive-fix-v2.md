# Mobile Responsive Fix — Round 2 (Samsung S25 / 360×780)

**Date:** 2026-01  
**Priority:** High — Hero section crops on real Samsung S25 device  
**Target:** Samsung Galaxy S25 (360×780 CSS viewport), iPhone SE (375×667), iPhone 15 (390×844)

---

## Problem Statement

The user reports that on their Samsung Galaxy S25, the hero section is **cropped** — the "Rido" name and hero content at the top of the page is partially hidden. This is likely caused by:

1. **Fixed navbar overlapping hero content** — The navbar sits at `top-3` (12px) with `py-2.5` padding. Combined with the logo, it's ~56px tall on mobile. The hero content starts at `pt-[5.5rem]` (88px), leaving only ~32px gap — but on real S25 hardware, status bars and safe areas consume more space.
2. **`min-h-dvh` not supported on Samsung Internet browser** — Some Samsung browser versions (particularly Samsung Internet <17) don't support `dvh` units, falling back to `100vh` which includes browser chrome bar (address bar, tabs), pushing content below the visible area.
3. **No safe area padding** — Samsung S25 has a punch-hole camera and curved edges. The `viewport-fit: cover` is set in `<meta>` but no `env(safe-area-inset-*)` padding is used anywhere.
4. **Hero blur orbs can extend past viewport edges** — Even with `overflow-hidden`, on some mobile browsers the blur computation from `w-[300px]` on a 360px screen can cause subtle layout shifts.

---

## Changes

### 1. Hero.tsx — Robust mobile hero layout

**Current:**
```jsx
<section className="relative min-h-dvh flex items-center justify-center overflow-hidden">
  <div className="... pt-[5.5rem] sm:pt-24 pb-24 sm:pb-16">
```

**New:**
```jsx
<section className="relative min-h-[100svh] min-h-dvh flex items-center justify-center overflow-hidden pt-14 sm:pt-20">
  <div className="... px-4 sm:px-6 text-center pb-20 sm:pb-16">
```

- Replace `min-h-dvh` with stacked `min-h-[100svh] min-h-dvh` — `100svh` (small viewport height) is an even better unit than `dvh` for this case because it always uses the smallest viewport (no address bar included ever). Fallback chain: browsers that don't support `svh` will use `dvh`, and those that don't support `dvh` will use nothing (the `min-height: 100vh` in body CSS catches that).
- Move top padding to the **section** element (`pt-14 sm:pt-20`) instead of the inner div. `pt-14` = 56px, which clears the fixed navbar. `sm:pt-20` = 80px on tablet+.
- Remove `pt-[5.5rem]` from inner div — replaced by section-level padding.
- Change `pb-24` to `pb-20` on mobile — tighter bottom padding.
- Reduce hero blur orb mobile size from `w-[300px]` to `w-[200px]` and `h-[200px]`.

### 2. Navbar.tsx — Tighter mobile logo

**Current:**
```jsx
<span className="block sm:hidden"><RidoLogo variant="full" size="sm" /></span>
<span className="hidden sm:block"><RidoLogo variant="full" size="md" /></span>
```

**New:** Keep responsive logo (already good) but:
- Ensure navbar height is predictable: `py-2 sm:py-3` (8px vs 12px vertical padding)
- Add `safe-area-inset` padding: `pl-[max(0.75rem,env(safe-area-inset-left))]`

### 3. Layout / Body — Safe area support

**globals.css body:**
```css
body {
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
}
```
NO — this would add padding to all sections. Better approach: add safe-area padding to the **navbar only** and **hero section only**.

### 4. layout.tsx — Viewport meta already has `viewportFit: "cover"` ✅

### 5. Hero blur orbs — Reduce mobile size

```jsx
//- Before:
<div className="absolute top-1/4 right-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] ..." />
<div className="absolute bottom-0 left-0 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] ..." />

// After:
<div className="absolute top-1/4 right-0 w-[200px] sm:w-[600px] h-[200px] sm:h-[600px] ..." />
<div className="absolute bottom-0 left-0 w-[150px] sm:w-[400px] h-[150px] sm:h-[400px] ..." />
```

Smaller mobile blur orbs = less GPU compositing work on mobile = fewer layout issues.

### 6. DownloadCTA.tsx — Already has responsive blur orb ✅ (changed to `w-[280px] sm:w-[400px]`)

### 7. Footer.tsx — Responsive padding

```jsx
// Before:
<div className="max-w-7xl mx-auto px-6 py-16">

// After:
<div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
```

### 8. About.tsx — Heading still uses `text-4xl` on mobile

```jsx
// Before:
<h2 className="text-4xl md:text-5xl font-black mb-6">

// After:
<h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6">
```

### 9. ScrollReveal.tsx — Check for mobile animation issues

Verify animations don't cause FOUC or layout shift on mobile.

### 10. RidoLogo.tsx — Verify `sm` size is small enough

`sm` = mark 20px + text-lg (1.125rem = 18px). Total width ≈ 20px + 8px gap + 42px text = **70px**. At 360px - 2*12px (navbar px-3) = 336px available. 70px / 336px = 20.8%. Fine.

---

## Files to Modify

| # | File | Change |
|---|------|--------|
| 1 | `src/components/sections/Hero.tsx` | Section `min-h-[100svh] min-h-dvh`, section padding `pt-14 sm:pt-20`, inner div remove pt, reduce pb, smaller blur orbs |
| 2 | `src/components/layout/Navbar.tsx` | `py-2 sm:py-3` padding |
| 3 | `src/components/sections/About.tsx` | `text-3xl sm:text-4xl md:text-5xl` heading |
| 4 | `src/components/layout/Footer.tsx` | `px-4 sm:px-6 py-12 sm:py-16` |
| 5 | `src/app/globals.css` | Add `min-height: 100svh` before `100dvh` in body |

---

## Verification

1. `npm run build` — must pass
2. Check generated CSS contains `min-height:100svh` and `min-height:100dvh`
3. Check HTML output has `pt-14 sm:pt-20` on hero section
4. Check navbar renders `size="sm"` on mobile breakpoint
5. All sections have `py-16 sm:py-24 px-4 sm:px-6`
6. No horizontal overflow on 360px viewport
7. Deploy to Vercel, verify on live URL