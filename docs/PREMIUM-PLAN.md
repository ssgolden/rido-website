# Rido — Premium Website Plan ("the $100k build")

**Owner:** stephen@rido.bike · **Author:** Claude (senior web dev role) · **Status:** proposed

This is the roadmap for taking rido.bike from a good template-grade marketing
site to the kind of website a top agency would deliver for a six-figure
budget: bespoke art direction, one signature interactive moment, a real
product surface (live map, working waitlist, Spanish localization), and
engineering quality gates that keep it fast and accessible forever.

The budget framing is a quality bar, not a spend target. Each workstream
below notes what portion of a $100k agency engagement it represents, so we
always know where the perceived value comes from.

---

## What we have today (baseline)

A solid one-page marketing site: dark navy theme, magenta brand, Framer
Motion reveals, Lenis smooth scroll, good SEO/a11y fundamentals, legal pages,
cookie compliance. Backend layer (Postgres/Drizzle, auth, waitlist/contact/
newsletter APIs, Resend email, Stripe, i18n dictionaries) exists in the repo
but is **not deployed** — GitHub Pages only serves the static export.

What it is missing versus a $100k site, bluntly:

1. **No real imagery.** The phone mockup is CSS, the map is a fake SVG, there
   are no vehicle photos or Costa del Sol lifestyle shots. Nothing on the
   page could not have been made without leaving a code editor — and it shows.
2. **No signature moment.** Nothing a visitor screenshots or remembers.
3. **Single-font, single-page.** Inter-only typography, no per-city pages, no
   Spanish — in a Spanish market.
4. **Product features are decorative.** The waitlist button doesn't submit
   anywhere; the backend that could power it is unshipped.
5. **No quality gates.** No visual regression, no Lighthouse budget, no axe
   CI; regressions are caught by eyeballs or not at all.

## Phase 0 — Unblock (prerequisite, ~0 new cost)

- Merge PR #1 (deploy pipeline + site-breaking middleware fixes).
- Decide and execute **hosting move to Vercel**: it unlocks the already-built
  API routes, security headers, image optimization, and preview deploys.
  GitHub Pages stays as a fallback static mirror if desired.
- Merge the compact-mobile PR (#2) after phone review.

## Phase 1 — Design system & art direction (≈ $20k value · 1–2 weeks)

- **Typography:** pair a display face with Inter (e.g. a geometric display
  for headlines), self-hosted with `next/font` or local files (kills the
  render-blocking Google Fonts request AND the GDPR IP-transfer footnote in
  our own cookie policy). Fluid type scale via `clamp()`.
- **Design tokens:** formalize the existing `@theme` block into a documented
  scale (spacing, radii, elevation, motion durations/easings). One source of
  truth; kill ad-hoc values.
- **Motion identity:** one easing family, 3 durations, entrance/exit rules —
  documented in `.claude/skills/premium-web` so every future change conforms.
- **Asset production brief (external):** commission or shoot (a) 3D renders
  or studio photos of the actual scooter/bike with brand livery, (b) 8–12
  lifestyle photos on recognizable Costa del Sol locations, (c) real app
  screenshots once the app UI exists. This is the single highest-leverage
  spend; CSS cannot fake it.

## Phase 2 — Signature moments (≈ $25k value · 2–3 weeks)

- **Hero:** scroll-linked 3D vehicle (React Three Fiber, DRACO-compressed
  glTF from the Phase 1 renders) OR a full-bleed lifestyle video loop with
  duotone grade. Reduced-motion fallback: static hero image. Budget: hero
  must still hit LCP < 1.8s (poster first, lazy-hydrate the canvas).
- **Real coverage map:** replace the fake SVG with Mapbox GL (token slot
  already in the env contract) — dark custom style in brand colors, geofenced
  operating zones per city from `src/data/cities`, animated zone reveal on
  scroll. This is the section that proves the service is real.
- **How-It-Works scroll-telling:** pin the phone mockup (with real app
  screenshots) and drive its screen state as the user scrolls the 4 steps.
- **Micro-interactions:** magnetic primary buttons, card tilt on pointer,
  View Transitions between pages, branded 404.

## Phase 3 — Product surface (≈ $25k value · 2–3 weeks, overlaps Phase 2)

- **Working waitlist/newsletter:** wire DownloadCTA + footer to the existing
  `/api/waitlist` + Resend confirmation emails (Vercel hosting makes them
  live). Double-opt-in, GDPR-clean, admin export.
- **Spanish first-class:** build the `app/[locale]/` structure the i18n
  layer was designed for (es default, en prefixed — config already exists),
  translate all copy, hreflang pairs. In this market this is not optional
  polish; it is the product.
- **Per-city landing pages** (`/marbella`, `/estepona`, …) generated from
  `src/data/cities`: local hero, zone map crop, city-specific FAQ/SEO
  ("alquiler patinete eléctrico Marbella"). These pages are the organic
  search strategy.
- **Careers + press kit pages** with real content; contact form on the
  existing `/api/contact`.

## Phase 4 — Performance & quality engineering (≈ $15k value · continuous)

Budgets (enforced, not aspirational): LCP < 1.8s, CLS < 0.05, INP < 200ms,
Lighthouse ≥ 95 all categories, mobile 4G.

- Self-hosted subset fonts; AVIF/WebP pipeline with correct `sizes`; preload
  hero media; route-level code splitting audit (three.js only on `/`).
- **CI gates:** `scripts/visual-qa.mjs` (in this repo now) for screenshot
  diffs per PR; Lighthouse CI with budget file; `axe-core` a11y scan; keep
  the existing lint/build/export matrix green.
- Error monitoring (Sentry slot already in env contract) + Vercel Analytics
  funnels on the waitlist conversion.

## Phase 5 — Content, trust & conversion (≈ $15k value · 1–2 weeks)

- Professional EN+ES copywriting pass (voice: confident, local, concrete —
  kill remaining "across Spain" overclaims in metadata; it's Costa del Sol).
- Trust fabric: real rider testimonials when they exist (never fabricated —
  house rule), press logos, safety certifications, app-store badges when live.
- Dynamic OG images per page (`@vercel/og`), expanded structured data
  (FAQPage per city, BreadcrumbList everywhere).
- A/B-ready CTA instrumentation; cookie-consent-gated analytics events.

---

## Sequencing at a glance

| Week | Workstream |
|------|-----------|
| 0 | Phase 0 merges + Vercel migration |
| 1–2 | Design system, typography, tokens; commission assets |
| 2–4 | Mapbox coverage map, hero moment, scroll-telling |
| 3–5 | Waitlist live, `[locale]` Spanish, city pages |
| every PR | Visual QA + Lighthouse + axe gates |
| 5–6 | Copy pass, trust fabric, OG/structured data, launch review |

## Ground rules (enforced by `.claude/skills/premium-web`)

1. Never fabricate social proof, rider counts, or press mentions.
2. Every animated element has a reduced-motion path.
3. No stock-looking imagery; real or commissioned only.
4. Performance budgets are merge-blocking, not advisory.
5. Spanish and English ship together for every new page.
