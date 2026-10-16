# Rido — Premium Redesign Plan (October 2026)

**Goal:** make rido.bike look and behave like a ~€50k agency build before the
Torrevieja launch. **Status:** proposed. **Builds on:** `docs/PREMIUM-PLAN.md`
(the earlier $100k roadmap). That roadmap's engineering phases are largely
done; this plan is about design, imagery and conversion.

---

## 1. Where the site is today

**Solid foundations (keep):** dark navy + magenta brand, self-hosted Sora/Inter,
reduced-motion paths everywhere, axe + Lighthouse gates in CI, EN/ES, honest
pre-launch copy, a working waitlist, a city-page system, clean legal pages.

**What still reads as "template", in order of impact:**

1. **Every section is the same shape.** Eleven sections, each: small uppercase
   eyebrow → centred H2 with one magenta word → grey intro → a row of identical
   glass cards. Repetition is the single biggest tell of a theme. Premium sites
   vary rhythm: full-bleed image, split layout, oversized number, quiet text
   block, then cards.
2. **No real imagery.** The hero is type on a gradient. Products sit on white
   studio backgrounds inside dark cards (a bright box in a dark page). Both
   phone mockups are drawn in CSS. There are no photos of Torrevieja, the
   coast, people riding, or the team. CSS can't fake this.
3. **Too many sections for a pre-launch site.** Pricing shows three cards that
   all say "to be announced"; Sustainability is three promises; Partners is a
   B2B pitch on a rider page. Each dilutes the one job the page has: get the
   email.
4. **Gradient-highlight word in every heading.** Used once it's a signature;
   used eleven times it's decoration.
5. **Weak hero proof.** "6 planned cities / 2 vehicle types / Zero" are filler
   stats, and the hero shows no product.
6. **Conversion friction.** The only email field is at the very bottom. The
   final section stacks five layers (steps, form, app note, trust icons,
   compliance line).
7. **No signature moment.** Everything fades up the same way. Nothing a
   visitor would remember or screenshot.
8. **Missing trust fabric.** No faces, no local address on the page, no
   "we're 15 minutes away in Orihuela Costa" story, though that story is true.

---

## 2. Design direction

**"Coastal, confident, real."** Less dark-UI-kit, more editorial brand site.

- **Photography first.** Sun, sea, Torrevieja's promenade and salt lakes, real
  riders, the real scooter. Dark navy stays as the brand ground, but sections
  alternate with light, sunlit image bands.
- **One accent, used with restraint.** Magenta for actions and one hero moment.
  Drop gradient text from all section headings except the hero.
- **Editorial typography.** Bigger, tighter Sora display sizes for 2–3 key
  statements; plain sentence-case section labels instead of tracked uppercase
  eyebrows everywhere.
- **Varied rhythm.** No two adjacent sections share a layout.
- **Motion with purpose.** One signature scroll moment (the scooter), crisp
  200ms micro-interactions, everything else static.

---

## 3. Proposed page structure (homepage)

| # | Section | Change |
|---|---------|--------|
| 1 | **Hero** | Full-bleed Torrevieja photo or short video loop, headline, **inline email field** (not a scroll link), cut-out scooter overlapping the fold. |
| 2 | **Launching in Torrevieja** | Split layout: local map (live tiles) + "launching in the coming weeks" + local-team line. Replaces generic stats. |
| 3 | **How it works** | Signature moment: pinned real app screens (or one real render) that change as you scroll the 4 steps. |
| 4 | **The fleet** | Cut-out renders on brand background, large; specs as a clean spec sheet, not cards. Scooter/bike toggle stays. |
| 5 | **Safety & trust** | Helmet-included story with a real photo; DGT certification, insurance, compliance as a quiet checklist. |
| 6 | **FAQ** | Keep; fold pricing promise ("see the price before every ride") into it. |
| 7 | **Join the waitlist** | One clean block: headline, field, one line of reassurance. |
| — | Footer | Add address, local-team line, partner link. |

**Removed from the homepage:** Pricing (→ FAQ answer until fares exist),
Sustainability (→ one line in Safety & trust, full page later), Partners
(→ `/partners` page linked from footer), About (→ short local-team strip in
section 2, full page later).

---

## 4. Phases

### Phase A — Assets (start now; longest lead time) · ~€8–15k external

Nothing else lands as premium without these. Brief: `docs/ASSET-BRIEF.md`.

- **Photo shoot in Torrevieja** (1 day): promenade, Playa del Cura, salt lakes,
  2–3 riders with helmets, close-ups of scooter + helmet dock, team portrait.
- **Cut-out product renders** (transparent PNG/AVIF) of scooter and e-bike,
  3/4 and side.
- **Real app screens** for How-it-works, once the app UI exists.
- Optional: 6–10s hero video loop (muted, compressed, poster first).

### Phase B — Design system refresh · 1 week · I can do this

- Section-layout primitives: `SplitSection`, `ImageBand`, `StatementSection`,
  `CardGrid` — so variety is built in, not ad hoc.
- Type scale: two display sizes for statements; sentence-case labels; remove
  gradient text outside the hero.
- Light "sand" surface token for image bands (theme-level, not ad-hoc hex).
- Button, input and card refinements: one primary style, one quiet style.

### Phase C — Homepage rebuild · 1–2 weeks · I can do this (with Phase A assets)

- Implement the 7-section structure above, EN + ES together.
- Hero inline waitlist form; success state in place.
- Move Pricing/Sustainability/Partners/About content to FAQ, footer or
  dedicated pages, keeping URLs and anchors that are linked externally.
- Can start immediately with placeholder imagery; swap assets in as they
  arrive.

### Phase D — Signature moment · ~1 week · I can do this

- Scroll-driven How-it-works (pinned device, step-synced screens), with a
  static reduced-motion layout.
- Hero → fleet handoff: the cut-out scooter animates from hero into the fleet
  section on scroll (CSS/Framer, no WebGL).

### Phase E — Conversion & trust · ~1 week · I can do most of this

- Torrevieja landing page upgraded to the same design language (it's the
  page local search will land on).
- Waitlist: double opt-in confirmation email (needs Resend key), "share with a
  friend" after sign-up.
- Real local-team strip and address; app-store badges the day the app ships.
- Consent-gated analytics events on CTA views and submits, so design changes
  can be measured.

### Phase F — Polish & QA · ongoing

- Visual-QA screenshots per PR (script exists), Lighthouse ≥ 95, CLS < 0.05,
  LCP < 1.8s on mobile even with hero media.
- Copy pass by a native EN + ES copywriter.

---

## 5. Timeline

| Week | Work |
|------|------|
| 0 | Approve direction; book photo shoot; confirm section cuts |
| 1 | Phase B design system |
| 2–3 | Phase C homepage rebuild (placeholder imagery) |
| 3 | Shoot happens; renders delivered |
| 4 | Swap in real assets; Phase D signature moment |
| 5 | Phase E Torrevieja page + conversion; Phase F QA; launch-ready |

---

## 6. Decisions needed

1. **Cut sections?** Remove Pricing, Sustainability, Partners and About from
   the homepage as proposed.
2. **Photo shoot budget and date** in Torrevieja.
3. **Hero media:** still photo or short video loop.
4. **Language default:** keep English at `/`, or make Spanish the default for
   a Spanish market (Torrevieja's audience is heavily international, so
   English-default is defensible).
5. **Start Phase B/C now with placeholders**, or wait for assets.

## 7. Ground rules (unchanged)

No fabricated social proof. Reduced-motion path for every animation.
Performance budgets are merge-blocking. EN and ES ship together. Name a town
only once its `announced` flag is true.
