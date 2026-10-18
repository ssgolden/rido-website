# Rido — Mobile Enterprise Upgrade Plan (October 2026)

**Goal:** make rido.bike on a phone read as an established operator (Lime,
Bolt, Voi, Tier, Dott), not a launch template. **Status:** proposed.
**Builds on:** `docs/plans/2026-10-premium-redesign-plan.md` (design
direction, photography, homepage restructure) — this plan is the
phone-specific, evidence-based layer on top of it, sequenced so that most of
it ships before the photo shoot.

**Evidence:** three independent reviews of the production build at 390 px
(mobile UX and conversion; visual design and brand; mobile engineering with
Playwright measurements), plus the owner's own phone screenshots. Reviewers
worked read-only from `.visual-qa/*--phone.png`, the source, and the
served export. Findings are tagged **UX**, **VIS** or **ENG**.

---

## 1. Verdict

| Lens | Today | What holds it back |
|------|-------|--------------------|
| UX / conversion | 6 / 10 — mechanics better than most pre-launch sites: 2-tap email capture, inline success + share, native accordion, honest copy | Mood headline with no product or place; a 10-screen page that repeats its compliance list; language switch buried in the footer; English-only legal pages with no site chrome; cookie card covering a fifth of the first screen |
| Visual / brand | "polished template → early enterprise" — tokens, type, contrast and sand/navy alternation are above template grade | A decorative layer on top: gradient headline word, glowing buttons, blur orbs, ripple, "01 + icon + heading" steps, glass-in-glass FAQ, an abstract map that no local would recognise |
| Engineering | solid mid-tier — zero third parties, self-hosted fonts, LCP preloaded, CLS 0, reduced motion correct | The custom scroll lane breaks native phone behaviours; the mobile menu is not a compliant modal; up to ~460 KB gz of JS can be in flight on a phone that only wanted to read the hero; the image pipeline works only on Netlify and is untested there |

**The one-line diagnosis:** the site is compensating for a missing photograph
with effects, and for a missing information architecture with length.
Benchmarks win on restraint and one real picture.

**Measured baseline (homepage, 390 px, no scroll):** 21 requests, ~300 KB gz;
initial JS 184 KB gz (+273 KB gz MapLibre warmed on first scroll); HTML 35 KB
gz; LCP = hero cutout, preloaded; CLS 0.000; four long tasks at load
(114/97/53/50 ms on a desktop CPU, ~4× on mid-range Android); cookie banner
245 px tall (29 % of an 844 px viewport); page length ~8,600 CSS px (≈10
screens; ES ≈ 8,900).

---

## 2. Five root causes (everything below maps to one of these)

1. **No concrete first screen.** "Move freely along the coast." says neither
   e-scooter nor Torrevieja; the city page's H1 is the stronger pitch. (UX 1)
2. **Effects instead of restraint.** Gradient text, button glow, orbs, ripple,
   noise, three competing signifiers per step, five bullet styles. (VIS 1, 4, 5)
3. **Length and repetition.** Vehicles lists 11 "Included" bullets, Safety
   repeats four of them plus a five-paragraph commitments block; Pricing FAQ is
   three non-answers; section order puts a "coming weeks" map before the value
   explanation. (UX 3, 7, 8, 11)
4. **Not bilingual everywhere.** Language switch only in the footer; legal and
   careers pages are English-only, chrome-less, and the ES footer links to
   them. (UX 4, 12, 16)
5. **Native phone behaviours traded away.** The `#page-scroll` lane removes
   pull-to-refresh, URL-bar collapse, tap-status-bar-to-top and scroll
   restoration; the menu has no focus trap or backdrop; the cookie banner
   ignores the safe area and is last in tab order. (ENG 1, 2, 4)

---

## 3. The plan — four waves

Effort is my implementation time. "Photos" marks what cannot be finished
without the shoot (`docs/ASSET-BRIEF.md`). Every wave ships EN and ES
together, passes the existing gates (axe, Lighthouse, visual QA, sweep) and
the new ones added in §4.

### Wave 1 — Strip and sharpen · ~3 days · no photos, no decisions needed

Flat, confident, editorial. All small, all reversible, highest impact per hour.

| # | Change | Files | Lens |
|---|--------|-------|------|
| 1.1 | Concrete hero: H1 "E-scooters and e-bikes, coming to Torrevieja." (town as the accent words); "Move freely along the coast" becomes the subhead; fold "Waitlist now open" into the badge; hide "See how it works" on phones | `Hero.copy.ts`, `Hero.tsx` | UX 1, VIS 6 |
| 1.2 | Remove the effects layer: gradient text outside the hero accent, magenta box-shadows on all primary buttons, `btn-ripple`, the DownloadCTA blur orb (flat `navy-light` card + 1 px ring), unused `pulse-glow/float/shimmer` keyframes | `Button.tsx`, `WaitlistForm.tsx`, `Partners.tsx`, `Navbar.tsx`, `DownloadCTA.tsx`, `globals.css` | VIS 1 |
| 1.3 | Compact cookie bar on phones: one row, Accept / Decline, policy link as a 44 px row, no X (two decline paths today), `padding-bottom: max(.75rem, env(safe-area-inset-bottom))`, rendered first in `<body>` so it is reachable by keyboard; hide BackToTop while it shows | `CookieConsent.tsx`, `RootDocument.tsx`, `BackToTop.tsx` | UX 5, VIS 16, ENG 4 |
| 1.4 | Mobile menu as a real modal: `inert` on the lane while open, `id`/`aria-controls`, tap-outside backdrop, Tab wraps inside the panel, bottom safe area | `Navbar.tsx` | ENG 1, 14 |
| 1.5 | How-it-works steps: numeral only (muted, tabular), no icon tile, h3 one size down; static phone mock-up as the section's visual anchor on phones | `HowItWorks.tsx` | VIS 4 |
| 1.6 | One `FeatureList` primitive (`tone`, `accent`) replacing the five bullet styles; green only for compliance/sustainability | `src/components/ui/FeatureList.tsx`, Vehicles, Safety, DownloadCTA | VIS 5 |
| 1.7 | FAQ: reorder (cost, helmet, unlock, age, licence, parking first; the €2,000 damage item last); merge the three Pricing items into one honest answer; drop the search field and the glass card wrapper on the homepage; fade the chip row's right edge so it reads as scrollable | `faq.ts`, `FAQ.tsx`, `FAQ.copy.ts`, `globals.css` | UX 7, 8, VIS 8 |
| 1.8 | Small trust and copy fixes: privacy line under both email fields (links to `/privacy`); "Join" button loses the Download icon (no app exists); WaitlistProof shows a count only ≥ 100; ES hero subhead to two lines; NBSP in "Torrevieja first. The Costa del Sol next."; DownloadCTA label in sentence case; `.legal-warning` loses the yellow | `WaitlistForm.tsx`, `Navbar.tsx`, `WaitlistProof.tsx`, `Hero.copy.ts`, `Launch.tsx`, `DownloadCTA.tsx`, `globals.css` | UX 2, 6, 9, 16; VIS 10, 11, 15 |
| 1.9 | Tokens and layout: `--radius-card/control/chip` in `@theme`; footer three columns from 360 px; footer links `min-h-11`; fleet spec grid without the vertical rule; visible rule between `deep` and `navy` sections | `globals.css`, `Footer.tsx`, `Vehicles.tsx`, `Section.tsx` | VIS 7, 9, 12, 14; ENG 9 |
| 1.10 | Form details: focus the field on error, `enterKeyHint="send"`, `readOnly` + `aria-busy` instead of `disabled` while sending (keeps the iOS keyboard), visible "Sending…" under reduced motion | `WaitlistForm.tsx` | ENG 8, 13 |
| 1.11 | PWA and head hygiene: `theme_color` aligned (#0F172A), 180 px PNG apple-touch-icon, 192/512 PNG maskable icons, drop `related_applications` until the apps exist, `display: "browser"` (no service worker yet), remove the duplicate font preloads, `prefetch={false}` on footer and language links, `immutable` on font cache headers, delete the unused 355 KB OG png | `public/manifest.json`, `RootDocument.tsx`, `Footer.tsx`, `LanguageSwitcher.tsx`, `public/_headers`, `public/og/` | ENG 6, 10, 11, 12 |

**Exit criteria:** page reads flat and editorial in the phone screenshots; the
cookie bar never covers the hero form on a 667 px phone; axe passes with the
menu open; no gradient text or box-shadow glow outside the hero.

### Wave 2 — Structure · ~1.5 weeks · no photos · two decisions (§5: 1, 2)

Fix the architecture around the funnel and make the site bilingual end to end.

| # | Change | Files | Lens |
|---|--------|-------|------|
| 2.1 | Bilingual chrome everywhere: `LegalPage` and Careers rendered inside `SiteShell` + Navbar + Footer with a locale-aware breadcrumb; ES/EN toggle in the mobile menu; menu gains "Rido in Torrevieja" (`/torrevieja`) and "Partners" | `LegalPage.tsx`, `Navbar.tsx`, `LanguageSwitcher.tsx`, careers page | UX 4, 12 |
| 2.2 | Spanish legal pages: `/es/privacy`, `/es/terms`, `/es/politica-cookies` from the lawyer's translation (decision 2); until they exist, a Spanish intro paragraph and a clear "this page is in English" line, and the ES footer stops linking into English silently | `src/app/(es)/…`, `LanguageSwitcher.tsx` `EN_ONLY_PATHS` | UX 4 |
| 2.3 | Shorter homepage, target ≤ 7 screens: Vehicles "Included" trimmed to 5 bullets (helmet, lights, dual brakes, beginner mode, GPS); compliance only in Safety, product features there phrased as planned; commitments block to one line; order Hero → How it works → Fleet → Launch map → Safety → FAQ → Waitlist, nav in sync | `vehicles.ts`, `Safety.tsx`, `(en)/page.tsx`, `(es)/es/page.tsx`, `Navbar.tsx` | UX 3, 11, 15 |
| 2.4 | City page with substance: compact three-step strip and a two-card fleet row (server components reusing `vehicles`), Safety link, registered address demoted to the footer, footer CTA pointing at the page's own form | `city-landing.tsx`, `Footer.tsx` | UX 10, 13 |
| 2.5 | A map locals recognise: trace the real coastline (Cabo de Palos → Cabo de la Nao, ~40 points) into the SVG poster, Torrevieja marker on its true position, the two salt lagoons as darker fills, no dashed route, pulse ring kept; poster height 260 px on phones; the live MapLibre map loads only on tap ("Explore map") or when the section is within ~1.5 viewports, never on first scroll | `CoverageMap.tsx` | VIS 3, ENG 3 |
| 2.6 | Image pipeline that is host-independent and tested: pre-generated 2×/3× WebP variants with `srcset` in `ImageFrame` (so GitHub Pages and local QA serve the same quality as Netlify), hero cutouts re-exported at ≥ 1100 px, wordmark as inline SVG, fleet thumbnails as real 128 px files; a CI step builds with `NETLIFY=true` and asserts `srcset` is present | `ImageFrame.tsx`, `RidoLogo.tsx`, `next.config.ts`, `public/images/`, `ci.yml` | ENG 5, VIS 13 |
| 2.7 | JS diet: HowItWorks, Vehicles and FAQ rendered on the server with small client islands (toggle, chips); `Magnetic`, `ScrollProgress`, `BackToTop` mounted behind `requestIdleCallback`; CI budget initial JS ≤ 150 KB gz | sections, `RootDocument.tsx`, `scripts/sweep.mjs` | ENG 3, 7 |
| 2.8 | Placeholder frames that read as product shots until photos arrive: tighter padding on phones, cutout bleeding off the bottom edge, chips as one ink strip along the bottom | `ImageFrame.tsx`, `Hero.tsx`, `Vehicles.tsx` | VIS 2 |

**Exit criteria:** every page has Navbar + Footer in the visitor's language;
homepage ≤ 7 phone screens; initial JS ≤ 150 KB gz with MapLibre absent until
requested; `srcset` verified in CI; the map poster matches the real coast.

### Wave 3 — Native scrolling · ~1 week · decision 3 · highest engineering risk

Return scrolling to the document: `position: sticky` header, hero backdrop on
a `fixed` layer, delete the `#page-scroll` lane and its plumbing
(`SiteShell`, `useScrollRootNode` roots, Lenis `wrapper`, the lane roots in
`RevealObserver`, `CoverageMap`, `Navbar`), re-point the `animation-timeline`
effects at the document scroller.

**What it fixes at once:** pull-to-refresh, URL-bar collapse (≈ 60 px of
screen back), iOS tap-status-bar-to-top, browser scroll restoration on Back
(today: 2,000 px → /privacy → Back lands at 7,690 px because a stale `#faq`
hash wins), simpler observers everywhere, and QA that tests what Safari and
Chrome actually do.

**Fallback if the lane stays** (M instead of L): persist `scrollTop` in
`history.state` and restore on `popstate`, strip stale hashes after anchor
navigation, drop `overscroll-y-contain` on touch so pull-to-refresh returns.

### Wave 4 — Photography · after the shoot · Premium plan Phases A/C

- Hero and city hero: `ImageFrame fit="cover"` with the Torrevieja shot
  (deliverable B); the cutout frames then read as deliberate product shots.
- One full-bleed street photo band after How it works (UX 17).
- Real app screens in the How-it-works mock-up when the app UI exists.

Nothing in Waves 1–3 is thrown away when photos arrive.

---

## 4. New QA gates (ship with Wave 1 and 2)

Fold the reviewer's measurement script into `scripts/sweep.mjs`:

- initial JS ≤ 150 KB gz and total first-load ≤ 350 KB gz (fail);
- no more than two long tasks > 100 ms at 4× CPU throttle (fail);
- CLS after a full scroll < 0.05 (fail);
- mobile menu: focus stays inside while open, Escape and backdrop close it
  (fail);
- tap targets ≥ 44 px for `a, button` outside running text (warn → fail
  after Wave 1);
- cookie banner must not overlap the hero form at 667 px (fail);
- one visual-QA pass with motion **on** (today every screenshot is taken
  with reduced motion, so mid-animation layout bugs are never captured);
- a `NETLIFY=true` build with `srcset` asserted (Wave 2.6).

---

## 5. Decisions needed from Stephen

1. **Cut the Pricing FAQ to one answer** ("fares announced at launch; you
   always see the price before you ride") until fares exist. Recommended: yes.
2. **Spanish legal pages**: commission the translation from the lawyer now
   (the same brief, `docs/LEGAL-REVIEW-POINTS.md`, item 5). Until then Wave 2.2
   ships the interim version. Recommended: commission now; it is on the
   launch path.
3. **Remove the scroll lane (Wave 3)** or keep it with the fallback. The
   full removal is the enterprise answer and simplifies the codebase; it
   touches every scroll-driven effect, so it should be its own PR with a full
   visual-QA pass. Recommended: remove.
4. **Homepage section order and cuts (Wave 2.3)**: same question as the
   premium plan's decision 1, narrowed to the phone. Recommended: yes.
5. **Photo shoot date** (unchanged from the premium plan). Everything in
   Waves 1–3 is worth doing before it; Wave 4 cannot start without it.

---

## 6. Timeline

| Week | Work |
|------|------|
| 1 | Wave 1 (strip and sharpen) + QA gates; one PR per group, screenshots before/after |
| 2–3 | Wave 2 (bilingual chrome, shorter homepage, city page, real coastline, image pipeline, JS diet) |
| 4 | Wave 3 (native scrolling) as its own PR, or the fallback |
| shoot + 1 | Wave 4 (photography) |

---

## 7. Considered and not planned

- **Service worker / offline page**: not worth it for a marketing site
  pre-launch; `display: "browser"` instead (ENG 6).
- **Edge-to-edge cookie bar**: the floating card is more premium than a bar;
  it only needs to be compact (VIS 16 vs UX 5 — the compact floating card wins).
- **Fake proof of any kind** (rider counts, logos, ratings, testimonials):
  still excluded; WaitlistProof shows a number only once it is a real one.
- **Naming the Costa del Sol towns**: unchanged; the map shows a region, not
  dots, until a town's `announced` flag is true.

## 8. Ground rules (unchanged)

Brand magenta, dark mode, Sora + Inter, Lucide icons, CSS-only motion with a
reduced-motion path, EN and ES together, performance budgets merge-blocking,
no fabricated content, towns named only once announced.
