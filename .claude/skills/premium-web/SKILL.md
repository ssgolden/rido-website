---
name: premium-web
description: Quality bar and hard rules for all visual, content, and performance work on the Rido website. Use when designing, restyling, animating, adding pages/sections, writing marketing copy, or reviewing UI changes — any task that affects what visitors see or feel.
---

# Premium web standards for rido.bike

You are acting as a senior developer at a high-end agency. Every change must
read as part of a $100k build. The roadmap lives in `docs/PREMIUM-PLAN.md`;
this skill is the per-change quality bar.

## Design tokens — single source of truth

- All colors, spacing, radii, and motion values come from the `@theme` block
  in `src/app/globals.css`. Never introduce ad-hoc hex values or one-off
  pixel spacings; extend the theme instead.
- Brand: magenta `#DE0498` (never coral/orange), navy `#0F172A` background,
  yellow `#FDE803` accent only in the logo, green `#22C55E` only for
  sustainability/positive signals.
- Typography is a scale, not a per-component choice. Headings use the fluid
  scale (`text-3xl sm:text-4xl md:text-5xl` pattern or `clamp()`).
  Fonts are self-hosted via `@fontsource-variable` packages (no Google
  Fonts requests, not next/font): headlines use "Sora Variable" via
  `--font-display` exclusively; body is "Inter Variable" via `--font-sans`.

## Motion identity

- One easing family: `[0.25, 0.46, 0.45, 0.94]` (the existing StaggerReveal
  ease) for entrances; `easeOut` ≤ 300ms for micro-interactions.
- Three durations only: 200ms (micro), 500ms (entrance), 2–6s (ambient).
- EVERY looping or scroll-driven animation needs a `prefers-reduced-motion`
  path (use `useReducedMotion()` from framer-motion; Lenis already disables
  itself). No exceptions — this is merge-blocking.
- Entrances use `ScrollReveal`/`StaggerReveal` from `@/components/ui/` —
  don't hand-roll new intersection observers.

## Layout rhythm

- Sections: `py-12 sm:py-24 px-4 sm:px-6` (compact mobile), heading blocks
  `mb-10 sm:mb-16`, container `max-w-7xl mx-auto`.
- Card grids that stack on phones must use the `.mobile-carousel` utility
  (horizontal snap-scroll below `md`) instead of tall vertical stacks.
- Fullscreen sections use `min-h-dvh`, never `min-h-screen`.

## Content honesty (hard rules)

- NEVER fabricate testimonials, rider counts, press mentions, ratings, or
  partner logos. If real ones don't exist, the section doesn't exist.
- Geography claims match reality: Costa del Sol (Marbella, San Pedro,
  Cancelada, Estepona, El Paraíso) — not "across Spain".
- Social links only for accounts we verifiably own. Currently: none (email
  only).
- Legal identity everywhere: Go2 Place S.L., NIF B01745405, info@rido.bike.

## Performance budgets (merge-blocking)

- LCP < 1.8s, CLS < 0.05, INP < 200ms on mobile; Lighthouse ≥ 95.
- Images: AVIF/WebP, explicit dimensions, `sizes` attr, hero preloaded.
- Heavy libraries (three.js, mapbox-gl) load only on routes that use them,
  behind dynamic import with a lightweight poster/skeleton first.

## Verification workflow for any visual change

1. Build and start the app (`npm run build && npx next start`).
2. Run `node scripts/visual-qa.mjs` — screenshots all key pages at 390px
   (phone), 768px (tablet), 1440px (desktop) into `.visual-qa/`.
3. LOOK at the screenshots (Read tool) before declaring done. Check: nothing
   clipped, spacing rhythm consistent, carousel affordance visible, text
   contrast ≥ 4.5:1.
4. `npm run lint` (needs `NODE_OPTIONS=--max-old-space-size=4096`) and
   `npx tsc --noEmit` must be clean; both build flavors must pass
   (`npm run build` and `NEXT_OUTPUT=export CUSTOM_DOMAIN=true npm run build`).

## Accessibility floor

- Every section: `id` + `aria-label`. Every interactive element:
  `cursor-pointer`, focus-visible ring (global), 44px touch target.
- Keyboard: carousels scrollable, accordions operable, skip-link intact.
- New pages get a11y-checked with axe (Phase 4 adds CI; until then, manual).
