# Rido Website — Five-Discipline Senior Review

**Date:** 2026-08-20 · **Method:** five independent senior-level reviews (product design, frontend architecture, accessibility/WCAG 2.2 AA, performance + technical SEO, content/conversion strategy), cross-checked and merged. Findings confirmed by 2+ independent reviewers are marked **[×N]**.

---

## Executive summary

The foundations are genuinely strong — well above template grade. Disciplined design tokens, self-hosted subset fonts with metric-matched fallbacks, typed EN/ES content parity, a robust dual-deploy build script, honest city-gating, correct sitemap/robots/canonicals, and a lazy, accessible MapLibre coverage map. Multiple reviewers independently called out the engineering craft.

But the site currently fails its own merge-blocking rules in three clusters:

1. **Trust & honesty (worst):** the homepage waitlist form silently discards every signup while showing "You're on the list!", two fabricated waitlist counters (one self-incrementing), a sourceless 5-star "Safety Rating", a fake `aggregateRating` (5 stars, 0 reviews) and placeholder `JobPosting` in the JSON-LD (Google manual-action risk), "across Spain" geography overclaims, and present-tense operating claims for a pre-launch company. All five reviewers hit some part of this independently.
2. **Accessibility & compliance:** 6 WCAG 2.2 AA blocker-level failures, including a `useCountUp` bug that renders all stats permanently invisible to reduced-motion users [×3], `lang="en"` on Spanish pages [×3], and real contrast failures (computed ratios down to 1.7:1 on input focus rings).
3. **Performance:** ~304 KB gzip First Load JS with every homepage section client-rendered, and the entire first viewport server-rendered at `opacity:0` — mobile LCP cannot meet the project's own < 1.8 s budget in the current state.

Fix the honesty layer first (a day or two of deletions and one form wire-up), the compliance layer second (mostly one-line fixes), and the performance architecture third. Details below.

---

## Critical findings (cross-confirmed)

### 1. The homepage waitlist form is fake — every signup is lost [×3]
`src/components/sections/DownloadCTA.tsx:125-139` writes the email to the **visitor's own** localStorage, waits a simulated 600 ms, then shows "You're on the list! We'll email you the moment Rido launches." No data ever reaches the company. Meanwhile `/coming-soon` posts to `/api/waitlist` — which `scripts/build.mjs` **excludes from the GitHub Pages export**, so on the live static site that form always errors. The site's entire conversion funnel is broken in both directions, with GDPR-adjacent exposure (claiming a processing purpose you cannot perform).
**Fix:** wire the homepage form to the same `/api/waitlist` endpoint (Vercel host) or a static-compatible collector (Formspree/Buttondown); never show a success state that doesn't correspond to a recorded signup. Exclude or noindex `/coming-soon` on the static export.

### 2. Fabricated social proof, in visible copy and in structured data [×5]
- `src/components/ui/WaitlistCounter.tsx:17-53` — "1,200+ riders on the waitlist" seeded from `1200 + minutes-since-epoch % 48`, +1 per visit per device.
- `src/components/sections/DownloadCTA.tsx:100-103` — a second, hardcoded `useCountUp(1200)` counter (two fake mechanisms, potentially two different numbers on one page).
- `src/components/sections/Safety.tsx:81-86` — five gold stars labeled "Safety Rating", no source, pre-launch (also uses yellow outside the logo, against the token rules).
- `src/lib/schema.ts:303-309` — `aggregateRating: { ratingValue: "5", reviewCount: "0" }`; `schema.ts:437-449` — placeholder `JobPosting` emitted on **every page** while the careers page says there are no open roles. Both are Google structured-data policy violations with manual-action risk.
- `public/llms-full.txt` — bakes "1,200+ people already on the waitlist", "Safety Rating: 5 stars", and the stale "Move Freely Across Spain" headline into the file AI engines quote verbatim.
**Fix:** delete all of it. Replace the hero kicker with something true ("Founding-rider waitlist now open — Costa del Sol, 2026"). Re-add ratings/counters only when real data exists.

### 3. Geography and tense overclaims [×2]
- `src/app/careers/page.tsx:44`: "operating e-scooters and e-bikes across Spain's most vibrant cities" — false tense and banned geography.
- `src/components/sections/Hero.tsx:44-45`: "Spain's first locally-built…" — unverifiable superlative; regulator/competitor-challengeable. Stronger and defensible: "The Costa del Sol's own e-scooter and e-bike share — built and run right here."
- `Sustainability.tsx:54-66`, `About.tsx:17,26`, `src/data/faq.ts` (several): "We offset 100% of our operational emissions", "we publish our recycling rates", "every ride is insured", "we include a helmet with every scooter" — present-tense operating claims, pre-launch (EU greenwashing rules apply). The city-page FAQ gets the tense right ("will", "we plan to") — make the rest match.
- `Sustainability.tsx:47-51`: "1,240+ Tonnes CO₂ **Saved**" in giant animated type with a 12 px "projected" footnote — the hierarchy communicates the opposite of the caveat. Put "Projected first-year impact" / "Our 3-year target" in the heading, not the footnote.
- `Hero.tsx:47`: "Watch 30-sec Demo" links to a text section; there is no demo. Rename "See how it works".

### 4. Reduced-motion users see no numbers at all [×3]
`src/hooks/useCountUp.ts:42-49` returns early under `prefers-reduced-motion`, so `visible` stays `false` forever — and Hero stats (`Hero.tsx:87`), Sustainability stats (`Sustainability.tsx:31`), and the CTA counter (`DownloadCTA.tsx:102`) all render `opacity: visible ? 1 : 0`. Seven stats are permanently invisible for this audience. The tell-tale `opacity: visible ? 1 : 1` patch in `WaitlistCounter.tsx:69` shows it was noticed once and papered over.
**Fix (one line):** in the reduced-motion branch set `hasStarted`/`visible` to true (count already initializes at `end`). Additionally, `ScrollReveal`/`StaggerReveal` have no reduced-motion path at all — wrap the app in `<MotionConfig reducedMotion="user">` in `layout.tsx` (also one line, fixes every Framer entrance site-wide, and satisfies the project's merge-blocking motion rule).

### 5. Spanish pages declare `lang="en"` [×3]
`src/app/layout.tsx:93` hardcodes `<html lang="en">`; `/es` and `/es/[city]` render fully Spanish content under it (confirmed in the exported HTML — the client-side patch in `locale-context.tsx` isn't crawl-safe). WCAG 3.1.1 failure + wrong language signal in google.es, the primary market.
**Fix:** the planned `app/[locale]/` structure solves it properly (PREMIUM-PLAN Phase 3 — accelerate it).

### 6. Homepage can't meet its own performance budget
- **First-viewport text is SSR'd invisible:** the exported homepage contains 102 inline `opacity:0` styles; the H1/subheadline/CTAs can't paint until 304 KB gz of JS downloads, hydrates, and a ~1.1 s Framer intro finishes. Mobile LCP estimated 3.5–5 s vs the 1.8 s budget. Fix: first viewport renders visible in SSR, animated with CSS; JS-driven reveals below the fold only.
- **All-client architecture:** every section + Navbar + Footer is `"use client"` (41 files); the `dynamic()` imports in `page.tsx` split files but don't defer loading. RSC-ify static sections with client islands → est. −150–200 KB gz.
- **Below-fold `priority` preload:** `Vehicles.tsx:124` preloads a 66 KB scooter JPEG that competes with the hero LCP image. Remove.
- **Images:** `unoptimized: true` under export → no AVIF/WebP, no srcset; 1600 px JPEGs serve 64 px thumbnails; ~820 KB vehicle set could drop 40–60 % with a build-time sharp pipeline (planned in Phase 4 — confirmed worth it).
- **Lighthouse CI doesn't enforce the stated budgets:** desktop preset, perf `warn` at 0.8, no LCP/TBT assertions (`lighthouserc.json`). Align CI with the merge-blocking budget.

### 7. Analytics measure nothing; security headers exist nowhere
- `ConsentAwareAnalytics.tsx:32-40` subscribes only to the `storage` event, which never fires in the tab where consent was granted — analytics only start on the *next* page load. And `@vercel/analytics` 404s on GitHub Pages entirely, so production currently has **no working analytics at all**. Fix: dispatch a same-tab consent event + pick a static-host-compatible provider (or move hosting — Phase 0 decision).
- `public/_headers` is Netlify syntax (ignored by GitHub Pages and Vercel) and its comment points at a `headers()` in `next.config.ts` that doesn't exist. The Vercel deployment — the one with the password gate and API routes — ships with no CSP/HSTS/XFO. Fix: add real `headers()` to `next.config.ts`.

---

## High-priority findings

### Accessibility (WCAG 2.2 AA blockers beyond #4/#5)
- **Contrast** (computed): `placeholder-white/30` = 2.70:1 (FAQ + waitlist inputs); `text-white/40` hero stat labels = 3.81:1; 404-page links at `text-white/30` = 2.70:1; input focus ring `ring-rido-magenta/50` = **1.71:1** (needs 3:1). Fix with the already-defined `text-muted-weak` token and full-opacity magenta rings (~6 class edits).
- **Loading submit button loses its accessible name** (`DownloadCTA.tsx:181-185` — spinner only). Add `aria-label`/sr-only text.
- **Keyboard:** `.mobile-carousel` containers (5 sections) aren't focusable → off-screen cards unreachable below 768 px; every tab/filter group (Vehicles switcher + thumbnails, FAQ categories, Pricing calculator) conveys selection visually only — add `aria-pressed`/tablist semantics; mobile nav has no Escape handling or `aria-controls`; waitlist success unmounts the form silently with no `role="status"` and dropped focus.
- Magenta `#DE0498` is a 3.89:1 color on navy — keep it large-text/UI-only (currently respected); `text-rido-magenta-light` (5.19:1) is the right small-text brand tone.

### Design & UX
- **Two motion identities:** the hero deliberately uses `[0.22, 1, 0.36, 1]` against the mandated `[0.25, 0.46, 0.45, 0.94]` used everywhere else, with off-scale durations. Pick one family (the hero's quint is arguably the better one — promote it into `@theme` and migrate) — one motion voice.
- **Section stencil:** nine sections in a row repeat centered eyebrow → two-word gradient heading → magenta divider. The single biggest "template tell". Art-direct 2–3 sections asymmetrically (full-bleed Vehicles, split-layout Safety), drop the universal divider.
- **Narrative order buries pricing:** actual order puts Pricing 7th and About between FAQ and the closing CTA. Recommend: Hero → How → Vehicles → **Pricing** → Cities → Safety → Sustainability → About → FAQ → CTA (objection-handling FAQ feeds the close).
- **Dead nav anchors on subpages [×2]:** `Navbar.tsx:20-26` / `Footer.tsx:24-36` use `#section` hrefs that match nothing on `/marbella`, `/careers`, legal pages. Use `/#section` (locale-aware).
- **Fake app-store badges** (`DownloadCTA.tsx:221-234`): hand-rolled Apple/Google badges (both companies forbid mock artwork) as focusable dead `href="#"` links. Remove until the apps exist; the waitlist is the CTA.
- **Two competing button systems:** `Button.tsx` (scale-105 + ripple) vs ~500-char hand-rolled hero/city CTA class strings (translate-y + shadow bloom, duplicated verbatim). Make the hero treatment the canonical `Button` primary; retire ripple/scale.
- **Motion Lab (internal playground) linked in the public footer** with a "new" badge [×3]. Remove.
- **Error pages are the cheapest screens on the site:** generic copy, `min-h-screen` (rule: `min-h-dvh`), `global-error.tsx` renders **unstyled** (no `globals.css` import) and nests `<button>` inside `<a>`. Port the 404's art direction ("Flat tire."). `error.tsx`/404 are EN-only for `/es` visitors.
- **Careers page wears legal-document clothes** (numbered sections inside `LegalPage`). Rebuild as a simple branded page (Phase 3 overlap).

### Content & conversion
- **CTA verb chaos:** "Reserve My First Ride" (reserves nothing) vs "Join Waitlist" vs "Join the Waitlist" vs "Join the waitlist →". One verb everywhere; state the waitlist's value ("founding riders get first access").
- **Pricing gaps:** the Day Pass card never shows its €14.99 price (renders "Free / Included"); Rido Pass has no subscription price at all — "No Surprises" fails its own section. Add price rows + a worked example under the calculator ("10-min ride: €1.00 + 10 × €0.35 = €4.50").
- **FAQ gaps for the actual audience:** missing "When do you launch?", "Which towns?", "Can tourists use it / need a Spanish ID?", "Payment methods", "What do waitlist members get?", "Can I ride on the Paseo Marítimo?".
- **Differentiation story is thin:** the hero's three differentiators never reappear. Add one "Why Rido" trio (local team, swappable batteries = charged fleet, bilingual human support) — the honest answer to "why not Bolt/Lime".
- **Spanish gaps:** legal pages EN-only (incl. `/politica-cookies` — Spanish URL, English content; effectively mandatory at launch under LSSI), `PhoneScreens` strings untranslated, "sé el primero" vs "sé de los primeros" inconsistency, "Dónde Encontrarnos" English-style title case, EN badge "Launching the Costa del Sol" missing "on".
- **Metadata:** `og:locale "en_ES"` invalid (use `en_GB` + alternate `es_ES`); og-image is a logo card (Phase 5 overlap); twitter image is a different asset with Android EXIF.

### Engineering hygiene
- **FAQ open-state keyed by filtered index** (`FAQ.tsx:115`) — open panel "teleports" to a different question when searching/filtering; `aria-controls` points at wrong content. Key by stable slug. [×2]
- **hreflang emitted twice** (manual `<link>` + Metadata API) and legal pages inherit the homepage's es alternate incorrectly. Keep Metadata API only.
- **Structured-data inaccuracies:** Organization logo declared 512×512 but the asset is 500×246; `SearchAction` targets a search page that doesn't exist; two Organization nodes. `dateModified` hardcoded and stale.
- **Dead deploy flavor:** every real build sets `CUSTOM_DOMAIN=true`, so the `/rido-website` basePath flavor is never built — and is itself broken (font preloads/`@font-face` not basePath-aware). Either delete the flavor and simplify `basePath.ts`, or finish it. AGENTS.md is stale either way ("fonts imported in layout.tsx" — actually vendored in `public/fonts`).
- **Dependency hygiene:** `googleapis` (~100 MB, scripts-only) and `zod` (unused) in dependencies; `@fontsource-variable/*` no longer imported; `@types/three` misplaced; duplicate `<Toaster />` (root layout + motion-lab); `AnimatedHeading.tsx` dead code; stale `drizzle/` directory.
- **Misc:** JSON-LD injected without `<` escaping (latent XSS-shaped bug); `error.tsx` uses basePath-unaware `window.location.href`; `coming-soon` indexable (self-canonical, no robots meta); blinking "Coming Soon" badges (`coming-soon-blink`) read cheap — one soft pulse max; `ScrollProgress`/`BackToTop` re-render on every scroll frame (use `useScroll` + transform); JS `scrollTo({behavior:"smooth"})` ignores reduced-motion in `BackToTop`/`Navbar`.

---

## Prioritized roadmap

### P0 — Trust & truth (1–2 days, do before anything else)
1. Wire the homepage waitlist to a real endpoint; fix or noindex `/coming-soon` on static export.
2. Delete both fake counters, the 5-star rating, `aggregateRating`, the placeholder `JobPosting`, and `SearchAction`; sync `llms-full.txt`.
3. Tense-and-claims pass: "will" until launch day; fix careers "across Spain"; soften "Spain's first"; reframe sustainability stats as targets; rename "Watch 30-sec Demo"; remove fake store badges.
4. One CTA verb site-wide with an honest waitlist value proposition.

### P1 — Compliance & access (2–3 days)
5. Fix `useCountUp` reduced-motion visibility; add `<MotionConfig reducedMotion="user">`; gate JS smooth-scroll calls.
6. `lang` per locale (start the `app/[locale]/` move).
7. Contrast sweep (~6 class edits) + focus-ring opacity; loading-button label; success `role="status"` + focus.
8. Keyboard pass: focusable carousels, `aria-pressed` on tab/filter groups, Escape on mobile nav.
9. Real `headers()` in `next.config.ts`; same-tab consent event + analytics that work on the actual host.

### P2 — Performance architecture (~1 week)
10. Hero paints without JS (no SSR `opacity:0` in the first viewport) — the single change that makes LCP < 1.8 s reachable.
11. RSC-ify static sections with client islands; drop Framer from the critical path.
12. Remove below-fold `priority`; AVIF/WebP + srcset build pipeline; strip EXIF; delete unused images.
13. Align Lighthouse CI with the real budgets (mobile, perf ≥ 0.95, LCP ≤ 1800).
14. Prune deps (`googleapis`, `zod`, misplaced types); exclude `/motion-lab` from production; remove footer link.

### P3 — Conversion & polish (ongoing)
15. Reorder sections (Pricing 4th, FAQ→CTA close); break the section stencil with 2–3 asymmetric layouts; drop the universal divider.
16. "Why Rido" differentiation section; FAQ additions; pricing completeness (€14.99 on the card, Rido Pass price or explicit "announced at launch"; worked example).
17. Consolidate the button system; fix `/#anchor` nav links; branded error pages (styled `global-error`, `min-h-dvh`, ES variants); careers page redesign.
18. Spanish legal pages (at minimum `politica-cookies` in Spanish); localize `PhoneScreens`; ES copy consistency fixes; og:locale + one purpose-built og-image.
19. Motion unification: one easing family in `@theme`, durations on the 200/500 ms grid, FAQ stable keys, static "Coming Soon" badges.

---

## What's already good (keep it)
Typed EN/ES data files that make copy drift a compile error · `scripts/build.mjs` crash-safe dual builds · correct Next 16 `proxy.ts` gating · render-time `withBase()` discipline · CoverageMap (lazy, WebGL fallbacks, reduced-motion camera, real `<button>` markers) · sitemap/robots with correct `citiesAnnounced` gating · self-hosted subset fonts with size-adjusted fallbacks (near-zero font CLS) · the honest "illustrative app preview" stance in PhoneScreens · skip link, section `id`/`aria-label` discipline, coarse-pointer 44 px floor · the 404 page's voice ("Wrong turn.").

*Overlaps with `docs/PREMIUM-PLAN.md` were checked by every reviewer; items above marked with phase references confirm planned work rather than duplicating it. Newly found and NOT in the plan: the SSR `opacity:0` LCP problem, the all-client architecture, the fake-success waitlist behavior, the `useCountUp` bug, `lang="en"` on /es, the site-wide JobPosting, and the dead security-header config.*
