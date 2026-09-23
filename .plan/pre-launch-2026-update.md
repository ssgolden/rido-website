# Rido — Pre-Launch Update Plan (2026-09-18)

**Inputs:**
- New Spanish e-scooter/VMP regulations (DGT, BOE-A-2026-2140, RD 52/2026, RD 970/2020) — most effective **1 October 2026**, equipment cert by **22 January 2027**
- User direction: remove all fake numbers, add compliance messaging, add partner/turn-key offering

---

## Findings — current site vs. goal

### A. Fake / risky numbers still on the page

| # | Location | Statement | Verdict |
|---|---|---|---|
| 1 | `Sustainability.tsx` stats | "**1,240+** Tonnes CO₂ Saved", "**85,000+** Car Trips Replaced", "**420,000+** Km Ridden Emission-Free" | ❌ Projected numbers presented as facts. Header says "Real Sustainability", disclaimer is a footnote. Must go or be reframed as targets. |
| 2 | `Safety.tsx` header | 5 gold stars + "**Safety Rating**" | ❌ No actual rating exists. Fabricated. Must go. |
| 3 | Hero stats | "5 Launch Cities", "2 Vehicle Types", "Zero Direct Emissions" | ✅ Real numbers (cities planned count = real plan, vehicles.length = real, zero emissions = technically true). Keep. |
| 4 | Hero kicker WaitlistProof | "N people on the waitlist" | ✅ Reads from real backend when set; falls back to honest copy otherwise. Keep. |
| 5 | Cities | All 5 marked `comingSoon: true` | ✅ Honest. |

### B. Spanish 2026 rules (real, effective 1 Oct 2026 / cert by 22 Jan 2027)

From BOE-A-2026-2140 + DGT:
- **Certified VMP required** — must be on DGT list with certificate number (or temporary registration valid only until 22 Jan 2027)
- **Mandatory helmet** for e-scooter riders nationwide (min age 15)
- **High-vis vest at night / poor visibility**, lights always on
- **Mandatory insurance** (~€50/yr civil liability)
- **Technical specs**: max 25 km/h, ≤1000W (non-self-balancing), two independent brakes with min deceleration, front+rear+brake lights, white front + red rear reflectors, ≥203mm wheels, parking stand
- **Registration** with number plate and identification sticker (format M XXXX LLL)
- Fine up to €200 for non-compliance

**Current `vehicles.ts` already includes:** helmet provided, front + rear lights, dual brakes, turn signals, 15 km/h beginner mode, GPS + geocercado, 25 km/h top speed, swappable battery, 45/60 km range.
**Missing / implicit:** DGT certification number, registration sticker, mandatory insurance note, anti-tampering statement, ≥203 mm wheel diameter, max 1000W power.

### C. Partner / turn-key offering — currently absent

No "Partners", "Franchise", "Business", "Turn-key" content anywhere in `src/`. This is a new section.

---

## Plan — Three workstreams, single PR

### WS 1 — Strip fake numbers

1. **Delete the Sustainability stats row** (`<StaggerReveal>` containing the three SustainabilityStat). Replace with the three commitments cards only — they're factual claims about operations (offset 100%, recycled, etc.). Drop the disclaimer footnote.
   - Or, less destructive alternative: keep stats but reframe intro as "**Our first-year targets**" and change label on each card to "target:" (e.g., "**Target:** 1,240 t CO₂"). Apply same reframe on ES.
   - **Decision rule:** if you can publicly defend these as targets, keep with reframe; if not, delete. Default for this PR: **delete** (cleanest).
2. **Delete the Safety rating panel** (`<div className="mt-4 flex items-center justify-center gap-1">` + 5 stars + "Safety Rating"). Section body is fine without it.
3. **Verify** no other count-up numbers on the page claim past-tense results. Hero stat "5 Launch Cities" is a plan — rephrase label to "**Planned Cities**" / "**Ciudades planificadas**" for clarity (same number, truthful framing).

### WS 2 — DGT 2026 / RD 970 compliance messaging

1. **Vehicle features** — append to `vehicles.ts` features array (EN + ES):
   - "DGT certified (VMP-2026 compliant)" / "Certificado DGT (compatible con VMP 2026)"
   - "Registered with identification sticker" / "Inscrito en el Registro de Vehículos Personales Ligeros"
   - "Civil liability insurance included" / "Seguro de responsabilidad civil incluido"
   - "Anti-tampering motor (25 km/h max by design)" / "Motor antimanipulación (máx. 25 km/h de fábrica)"
   - "≥203 mm puncture-resistant wheels" (e-bike already has puncture-resistant tires — add wheel diameter to e-scooter)
   - "Front and rear reflectors + brake light" / "Catadióptricos delanteros y traseros + luz de freno"
2. **New top-level "Compliance" block within Safety.tsx** ("Meets 2026 VMP regulations") with three short bullets citing certification, registration, insurance. Subtitle: **"Fully compliant with Spain's new VMP rules (in force 1 Oct 2026)"** / **"Cumple con la nueva normativa VMP española (en vigor desde el 1 de octubre de 2026)"**.
3. **Safety copy tweak:** "Helmet First" → "Helmet Included — required by law in Spain from Oct 2026" / "Casco incluido — obligatorio por ley en España desde octubre de 2026". Adds the new legal reality.
4. **Legal page touch-up (`/privacy`, `/terms`)**: not in scope for this PR — flag for next pass.

### WS 3 — Partners / turn-key offering

1. **New section component:** `src/components/sections/Partners.tsx`. Slot into `src/app/page.tsx` between `About` and `DownloadCTA` (just before the waitlist CTA).
2. **Content shape (EN + ES):**
   - **Eyebrow:** "For Partners" / "Para socios"
   - **Heading:** "Run Rido in your city" / "Opera Rido en tu ciudad"
   - **Intro:** "Turn-key shared mobility for Spanish cities. We bring the DGT-certified fleet, the app, the insurance, the operations playbook — you bring the local team." / "Movilidad compartida llave en mano para ciudades españolas. Nosotros aportamos la flota certificada por la DGT, la app, el seguro y el manual de operaciones — tú pones el equipo local."
   - **3 differentiators (cards):**
     1. **DGT-certified fleet** — registered, insured, with VMP-2026-compliant hardware from day one.
     2. **Software + operations** — rider app, manager dashboard, geofencing, dynamic pricing, support tools.
     3. **Local revenue share** — aligned incentives, transparent unit economics.
   - **CTA:** "Talk to us about partnering" → `mailto:partners@rido.bike?subject=Partner%20inquiry` (new email — confirm this address exists or use `info@rido.bike` for now). ES: "Hablemos de colaboración".
3. **Footer:** add "**Partners**" link under Company column pointing to `#partners`.
4. **Manifest / metadata:** skip — only section content.

---

## Apply order

1. WS 1 (strip fake numbers) → one commit `refactor(content): remove projected sustainability stats and fake safety rating`
2. WS 2 (DGT compliance) → one commit `feat(content): DGT VMP-2026 compliance messaging (cert, registration, insurance, helmet-as-law)`
3. WS 3 (partners) → one commit `feat(partners): add turn-key partners section (EN+ES) + footer link`
4. Lint + export build + push

**Confirmation needed on two items before I apply:**

A. Sustainability stats — **delete** or **reframe as targets**?
B. Partner CTA email — use existing `info@rido.bike` or create `partners@rido.bike` first?

Say "apply, delete, use info@" or specify alternatives.
