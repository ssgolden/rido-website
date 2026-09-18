# Rido — 10-Agent Design Audit Upgrade Plan
**Generated:** 2026-09-18 · **Lenses:** Typography, Hierarchy, Background, CTAs, Copy, Motion, Mobile, Performance, Accessibility, Premium Polish

---

## Verdict
The site is well-architected (CI, i18n, GDPR, deferred heavy deps) but reads as a competent Tailwind landing, not a funded product. The highest-leverage fixes are **copy honesty, contrast/accessibility, and a single, unified motion system**. Three buckets below.

---

## 🔴 Phase 1 — Broken / Deceiving / Risky (do first)

| # | Fix | Lens | File |
|---|---|---|---|
| 1 | **Hero primary CTA honesty:** "Reserve My First Ride" → `#download` is a waitlist email form, not a ride booking. Change to **"Join the Waitlist"** (EN) / **"Únete a la lista"** (ES). | CTA + Copy | `Hero.tsx` copy dicts |
| 2 | **Secondary CTA honesty:** "Watch 30-sec Demo" links to `#how-it-works` (text, not video). Change to **"See How It Works"** / **"Cómo funciona"**. | CTA + Copy | `Hero.tsx` copy dicts |
| 3 | **Waitlist backend: still localStorage-only by design.** Mark as known non-goal pre-launch, but log the count limitation in the README so it isn't discovered post-launch. | CTA | docs |
| 4 | **Hero H1 weight mismatch:** uses `font-black` (900) but Sora face declares 100–800 — renders synthetic/clamped. Change to **`font-extrabold`** (800). | Typography | `Hero.tsx:227` |
| 5 | **H1 line-height clips ES diacritics:** `0.95` on display-2xl crops á/é ascenders in "Muévete libremente…". Change to **`1.05`**. | Typography + Mobile | `globals.css:63` |
| 6 | **H1 fluid floor too big at 360px:** `clamp(2.75rem, …)` overflows with NBSP-joined "Costa del Sol". Change to **`clamp(2.25rem, 1.4rem + 6vw, 6rem)`**. | Typography + Mobile | `globals.css:62` |
| 7 | **Stat labels fail WCAG AA:** `text-white/40` (10px) on navy = **3.81:1**, needs 4.5. Bump to **`text-white/60`** (≈8.8:1). | Typography + A11y | `Hero.tsx:91` |
| 8 | **Animated magenta text fails AA at magenta end:** `#DE0498` on navy = **3.89:1** (only passes "large text" 3:1 marginally). Brighten magenta stop to **`#E832A8`** (≈4.6:1) or use static gradient on H1. | Typography + A11y | `globals.css:172-179` |
| 9 | **prefers-reduced-motion holes:** `ScrollReveal` / `StaggerReveal` don't call `useReducedMotion` — every section still animates. `useCountUp` not gated. Hero word variants still blur+y when reduced. Fix all three. | Motion + A11y | `ScrollReveal.tsx`, `StaggerReveal.tsx`, `useCountUp.ts`, `Hero.tsx` |
| 10 | **Hero orbs are not motion-safe:** CSS `hero-orb` classes run unconditionally, two 700px `blur-[100px]` paint constantly. Gate keyframes behind `@media (prefers-reduced-motion: no-preference)`. | Motion + A11y + Perf | `globals.css` |
| 11 | **Screen readers misread hero H1:** inline-block spans concatenate `\u00A0`, extraction yields "MoveFreelyAcross theCosta del Sol". Render the space as a **sibling text node**, not inside the span. | Mobile + A11y | `Hero.tsx:190-200` |
| 12 | **Navbar lacks safe-area insets:** only hero has them; on landscape notched iPhones the hamburger/logo sits in the dead zone. Add `top/left/right: max(0.75rem, env(safe-area-inset-*))`. | Mobile | `Navbar.tsx:63` |
| 13 | **Mobile menu can trap content in landscape:** `overflow-hidden` no max-height + body locked. Add **`max-h-[calc(100dvh-5rem)] overflow-y-auto`** to menu panel. | Mobile + A11y | `Navbar.tsx:84` |
| 14 | **Mobile menu links < 44px touch target:** `py-2.5` ≈ 42px. Bump to `py-3` + `min-h-[44px]`. | Mobile + A11y + CTA | `Navbar.tsx:87` |
| 15 | **No skip-to-content + no `<main>` landmark is broken** (there IS one in `page.tsx` already — verified); **skip link exists in layout.tsx** — verified working. Remove from plan. | A11y | — |
| 16 | **Cookie banner not a dialog + non-distinct focus rings:** add `role="dialog" aria-labelledby`, focus on mount, switch focus ring on the X close to white. | A11y | `CookieConsent.tsx` |
| 17 | **Magnetic wrapper breaks focus ring inside link on Safari:** move `Magnetic` inside the `<a>` or add `tabIndex={-1}` to wrapper. | CTA | `Hero.tsx:263`, `Magnetic.tsx` |
| 18 | **Waitlist submit = placeholder UX:** add ⚠️ louder comment + disable-button state is fine but no aria-live on success. Add `role="status"` on success panel. | CTA + A11y | `DownloadCTA.tsx` |

---

## 🟡 Phase 2 — Polish (high-trust, low-risk)

| # | Fix | Lens | File |
|---|---|---|---|
| 1 | **CTA copy unify:** "Join the Waitlist" everywhere (hero, navbar, footer, form button). ES: "Únete a la lista" / "Unirme a la lista". | CTA + Copy | Hero, Navbar, Footer |
| 2 | **Mobile navbar CTA hidden:** only hamburger shows on mobile — kills signups. Add compact **"Join"** pill next to hamburger on `<md`. | CTA + Mobile | `Navbar.tsx` |
| 3 | **Footer "Join the waitlist →" too weak:** text-only link. Promote to `Button variant="outline"` with arrow + hover state. | CTA + Hierarchy | `Footer.tsx:74` |
| 4 | **Subhead feature stack is ops-speak:** "Zero emissions. Swappable batteries. Real human support in your timezone." → **"Cheaper than a taxi, cleaner than a rental car, run by people who live in your city."** ES natural equivalent. | Copy | `Hero.tsx` |
| 5 | **"Spain's first locally-built" is risky claim** — Acciona/Cooltra/Movo exist. **"Built and run by a local team — every euro stays on the Costa del Sol."** | Copy | `Hero.tsx` |
| 6 | **Badge inconsistency EN vs ES:** "Launching the Costa del Sol" implies Rido launches the region. Change to **"Coming soon to the Costa del Sol"** / ES already fine: **"Muy pronto en la Costa del Sol"**. | Copy | `Hero.tsx` |
| 7 | **Pricing tier: per-minute rate should be dominant**, unlock fee demoted to footnote. "Most Popular" gets `lg:-translate-y-3 lg:scale-[1.03]` lift, not just shimmer. | Hierarchy | `Pricing.tsx` |
| 8 | **HowItWorks:** dim inactive steps to `opacity-50`, scale active `scale-[1.02]` — focal point should travel with scroll. | Hierarchy | `HowItWorks.tsx` |
| 9 | **Sections all `text-center` + same `py-24`** — vary alignment (left for HowItWorks/About, keep center for Pricing/CTA) and rhythm. Replace hairline dividers with background-value zoning. | Hierarchy | `page.tsx`, all sections |
| 10 | **Hero visual pyramid too flat** — 7 focal layers. Drop `RidoLogo` block (navbar already has it), remove kicker ping dot, keep badge + headline + one dominant CTA. Move stats to HowItWorks. | Hierarchy | `Hero.tsx` |
| 11 | **Hero orbs color-inverted:** magenta primary should be /15, green /8 (currently reversed). Brand hierarchy fix. | Background | `Hero.tsx:179-186` |
| 12 | **Hero photo at 12% is wasted bytes + LCP competitor:** drop to @1x/1280w, AVIF, remove `fetchPriority="high"`. Or bump to 22-28% opacity + soften gradient. **Recommend downgrading + brightening atmosphere instead.** | Performance + Background | `Hero.tsx:150` |
| 13 | **Magnetic spring under-damped:** stiffness 150/damping 15 on mass 0.1 → wobbles. Change to `stiffness: 260, damping: 24`. | Motion | `Magnetic.tsx` |
| 14 | **Easing inconsistency:** ScrollReveal/StaggerReveal hardcode `[0.25,0.46,0.45,0.94]`; Hero uses `[0.22,1,0.36,1]`. Extract shared `EASE` token and use everywhere. | Motion | new `lib/motion.ts`, all reveal files |
| 15 | **Stagger cadence magic numbers** (0.09 / 0.1 / 0.12): name them `STAGGER.text = 0.09`, `STAGGER.grid = 0.12`. | Motion | same |
| 16 | **contentOpacity fades to 0 too fast, scroll cue doesn't fade:** fade to 0.2-0.3 floor, extend bg parallax to 20-25%, fade cue on same progress. | Motion | `Hero.tsx` |
| 17 | **Hero over-delayed ~1.5s before CTA interactive:** compress to badge 0.1, words 0.15+0.07 stagger (~0.5 last), sub 0.65, CTAs 0.8, microcopy 0.95. | Motion + Perf | `Hero.tsx` |
| 18 | **ScrollReveal -80px vs StaggerReveal -60px rootMargin mismatch:** standardize (e.g., `-10% 0px`). | Motion | both files |
| 19 | **4 independent `useScroll` subscriptions + Lenis double-tick:** consolidate into one context or drop Lenis on touch devices and after `prefers-reduced-motion` change. | Performance + Motion | `SmoothScrollProvider.tsx` |
| 20 | **Large blurs repainted per frame:** replace 400-700px `blur-[100px]` orbs with pre-baked radial-gradient background-image (GPU-composited once). | Performance | `Hero.tsx`, Cities, DownloadCTA |
| 21 | **LazyMotion + domAnimation for framer:** cuts ~35KB gz from critical path. | Performance | `app/layout.tsx`, section files |
| 22 | **Dynamic imports with no loading skeleton:** add fixed-height SectionSkeleton to prevent CLS when chunks land. | Performance | `page.tsx` |
| 23 | **Mobile menu: no Escape, no focus return, no focus-trap:** add onKeyDown Escape → close + refocus hamburger; focus first link on open. | A11y + Mobile | `Navbar.tsx` |
| 24 | **Stat counter aria-hidden churn:** wrap animated `<p>` in `aria-label="{value} {label}"` container with `aria-hidden="true"` on the animated element. | A11y | `Hero.tsx` HeroStat |
| 25 | **Gradient text reserve animation for CTAs:** use static `text-gradient-brand` on H1, keep `text-gradient-animated` for CTA accents. | Typography + A11y | `Hero.tsx`, `globals.css` |
| 26 | **Font features + optical sizing missing:** add to body `font-optical-sizing: auto; font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "ss01" 1, "cv11" 1;` | Typography + Premium | `globals.css:136` |
| 27 | **Duplicate letter-spacing on h1-h3:** delete from base rule, let display tokens own it. | Typography | `globals.css:144-147` |
| 28 | **Micro-labels below legibility floor:** 10px uppercase + tracking 0.2em + white/40-55 → floor to `text-[11px]` and `tracking-[0.15em]`. | Typography + Mobile | multiple |
| 29 | **Subhead `leading-snug` too tight at `md:text-xl`:** → `leading-relaxed sm:leading-normal`. | Typography | `Hero.tsx:249` |
| 30 | **Mobile hero doesn't fit in 100dvh at 375×667:** CTA below fold, scroll cue overlaps stats. Hide scroll cue below `sm`, drop `pb-24` to `pb-12`, tighten stack. | Mobile | `Hero.tsx` |
| 31 | **min-h-dvh needs fallback:** add `min-height: 100vh; min-height: 100dvh;` pair. | Mobile | `Hero.tsx:92` |
| 32 | **Mobile carousel density:** reduce inter-block `mb-10 sm:mb-16` to `mb-8`, cap carousel card height, add swipe affordance. | Mobile + Hierarchy | Pricing, HowItWorks |
| 33 | **Cities:** 600px glow dominates, content card minimal. Pair card side-by-side with map on md+, cut `py-24` to `py-16`. | Hierarchy | `Cities.tsx` |
| 34 | **Pricing section: merge guarantee into calculator footer**, or 2-col layout (cards | sticky calculator) on lg+. | Hierarchy | `Pricing.tsx` |
| 35 | **Stats duplicated in Hero + Sustainability:** make them consistent or drop Hero's, reserve big-number device for Sustainability. | Hierarchy | both |
| 36 | **ES copy fixes:** "geovallado" → "geocercado", heading casing, vary "rodar" (use "muévete", "circula", "desplázate"). Native Peninsular sweep. | Copy | ES copy dicts |

---

## 🟢 Phase 3 — Premium (visible-without-squinting only)

| # | Fix | Lens |
|---|---|---|
| 1 | **Magnetic CTA cursor-following sheen:** radial-gradient overlay positioned via `--mx/--my` mouse-move custom properties. | Premium |
| 2 | **Glass top-edge highlight:** `box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.12)` on `.glass`, brighter on hover. | Premium |
| 3 | **Button press feedback with squash:** `active:scale-[0.98] active:duration-75 active:translate-y-px` + shadow tightening + `will-change: transform`. Replace uniform `active:scale-95`. | Premium |
| 4 | **Waitlist submit choreographed state:** text fades out (150ms) → conic-gradient ring spins around button → success: ring completes into animated check (`pathLength` draw) + green glow pulse. | Premium |
| 5 | **Conic gradient rings on Hero stat icons** (rotating on hover, magenta→green). | Premium |
| 6 | **Scroll cue redesign:** replace 1×28px line with 24×38px rounded pill + inner dot + soft magenta glow, hover scales 1.05. | Premium + Motion |

**Deferred (need decision / new assets / subjective):**
- Avatar group + "Join 2,300+ riders" social proof kicker (Premium/CTA) — needs real number + avatar assets, and borders back into fabricated-numbers territory.
- Different headline entirely ("La movilidad de la Costa del Sol, hecha aquí") — copy direction call, needs user sign-off.
- Embedded 30-sec demo video — requires producing the video.
- Neutral scrollbar (rgba white / magenta hover) instead of solid magenta — taste call.
- Real social proof / press mentions / "Backed by X" — needs real data.

---

## Apply Order

1. **Phase 1** (18 fixes) — legal + trust + accessibility baseline
2. **Phase 2** (36 fixes) — visual system + honest copy + unified motion
3. **Phase 3 subset** (6 items marked visible-at-1×) — "funded product" signal details

Say **"apply"** to ship Phase 1 + Phase 2 + Phase 3 subset in one pass (split into logical commits: typography, motion-system, copy-honesty, mobile+a11y, premium-polish).

Say **"phase 1 only"** for the minimum-shippable set, or **"skip phase 3"** to stop at polish.
