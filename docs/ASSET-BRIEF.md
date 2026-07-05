# Rido — Asset Commissioning Brief

**Client:** Go2 Place S.L. (NIF B01745405) · **Contact:** stephen@rido.bike
**Project:** rido.bike premium rebuild, Phase 1 (see `docs/PREMIUM-PLAN.md`)
**Status:** open for quotes · **Date:** July 2026

This brief covers three deliverables: 3D vehicle renders (A), lifestyle
photography (B), and an app-screenshot spec placeholder (C). Quotes may be
submitted per deliverable — A and B will likely go to different vendors.

---

## 1. Brand context

Rido operates shared e-scooters and e-bikes on the Costa del Sol — Marbella,
San Pedro de Alcántara, Cancelada, Estepona, and El Paraíso. The website is
dark-mode only: deep navy background `#0F172A` with brand magenta `#DE0498`
as the single accent color (never coral or orange). A yellow `#FDE803`
appears in the logo mark only — it must not be used as a general accent in
imagery or grading. The visual tone is premium, urban, Mediterranean:
confident and local, not startup-generic. All assets in this brief will sit
on that dark navy canvas, so contrast against `#0F172A` is a hard
requirement for every deliverable.

The site currently carries interim in-house photography (real fleet product
and lifestyle JPGs under `public/images/scooter/`, `public/images/bike/`,
and `public/images/lifestyle/`, plus a CSS-drawn phone mockup, no 3D); this
brief covers the professional-grade replacement for all of it.

## 2. Deliverable A — 3D vehicle renders

Hero-grade 3D renders of both fleet vehicles carrying Rido brand livery
(magenta `#DE0498` accents on dark charcoal/navy body panels; logo files
supplied at kickoff as vector SVG/PNG at `public/images/logo/`).

**Vehicles** (reference specs in `src/data/vehicles.ts`):

- **Rido Scooter** — stand-up e-scooter: wide deck, dual brakes, front and
  rear lights, turn signals, phone holder with charging, swappable battery,
  QR unlock plate on the stem/handlebar.
- **Rido Bike** — electric-assist bike: step-through frame, adjustable
  saddle, front cargo basket, integrated lights, puncture-resistant tires,
  swappable battery, QR unlock plate on the handlebar stem.

Reference photos of the physical vehicles will be provided; renders must
match the real fleet hardware, not a generic vehicle.

### A.1 Real-time source files (for the scroll-linked web hero)

- One glTF/**GLB** per vehicle, PBR materials, Y-up, real-world scale.
- Geometry must survive **DRACO compression**; textures KTX2/Basis-friendly.
- Hard budget: **< 2 MB per vehicle** after DRACO + texture compression
  (this drives a scroll-linked React Three Fiber hero in Phase 2 with an
  LCP budget of 1.8 s). Please state achievable polycount/texture sizes in
  your quote.
- Clean single-object hierarchy, no baked cameras/lights, no vendor-locked
  extensions. Deliver the working scene files too (Blender preferred).

### A.2 Static renders (per vehicle)

4K (3840 px long edge minimum), 16-bit source where possible:

1. **3/4 front** hero angle (slight low camera, wheels grounded)
2. **Side profile** (true orthographic-feel side, full vehicle)
3. **Detail: handlebar / QR unlock area** (close crop, QR plate legible)
4. One additional detail of the artist's choice (battery, deck, basket)

Each render in **two variants**:

- **Transparent-background PNG** (clean alpha, no baked shadow — separate
  shadow/AO pass on its own layer or file)
- **Composited on dark navy `#0F172A`** (with grounded contact shadow)

### A.3 Lighting spec

Soft studio key (large overhead/45° softbox feel), neutral white, low-key
overall to sit naturally on the dark site. Add a **magenta rim/edge light
(`#DE0498`)** from behind-left or behind-right — subtle, on edges and
highlights only, never tinting the whole body. No HDRI environments that
imply an outdoor location; this is studio product visualization.

### A.4 File naming and delivery

Deliver into a new `public/images/vehicles/` folder structure (the interim
photos it supersedes live in `public/images/scooter/` and
`public/images/bike/`):

```
vehicles/
  rido-scooter.glb
  rido-bike.glb
  rido-scooter-hero-34.png          (transparent)
  rido-scooter-hero-34-navy.png     (composited)
  rido-scooter-side.png / -navy.png
  rido-scooter-detail-qr.png / -navy.png
  rido-bike-hero-34.png / -navy.png
  rido-bike-side.png / -navy.png
  rido-bike-detail-qr.png / -navy.png
```

Lowercase, hyphenated, no spaces. Source scene files in a separate
`source/` folder. Two revision rounds included in the quote.

## 3. Deliverable B — lifestyle photography

**8–12 final selects** shot on location on the Costa del Sol, using the
actual Rido fleet vehicles (we provide vehicles and logistics).

### Shot list (locations are directives, not suggestions)

1. Marbella Paseo Marítimo — rider on Rido Bike along the seafront, golden
   hour, sea behind
2. Marbella old town periphery — scooter rider passing whitewashed
   streetscape (respect any pedestrian-zone rules; shoot legal riding only)
3. Puerto Banús — scooter parked/unlocking moment, marina backdrop, dusk
4. San Pedro de Alcántara boulevard — two riders (bike + scooter) on the
   landscaped boulevard, candid conversation mid-ride
5. Estepona old town — bike with front basket, flower-pot streets, morning
   light
6. Estepona Paseo Marítimo — scooter rider, long seafront lines, golden hour
7. Cancelada / El Paraíso — residential-coastal ride, palms, relaxed pace
8. Close-up: hands scanning the QR code with a phone (any location, shallow
   depth of field)
9. Close-up: helmet going on / chin strap, smiling, no logo conflicts
10. Wide establishing: vehicle parked correctly in a marked zone, town
    recognizable behind

Plus 2 photographer's-choice candids from the same days.

### Direction

- **Golden hour priority.** Schedule around first/last light; midday only
  for shaded old-town streets.
- **Helmets ALWAYS, on every rider, in every frame where a vehicle is
  moving or mounted.** This is brand law, not a style choice — a single
  helmetless frame makes the whole select unusable. (Static
  parked-vehicle frames without riders are exempt.)
- Riders: diverse, casual, ages 25–45, locals-not-models energy. Candid
  movement, not posed lifestyle-stock poses. No forced smiles at camera.
- Wardrobe: casual, no large third-party logos, nothing magenta-adjacent
  that fights the brand color; muted tones photograph best on our dark site.
- Grade: natural, slightly warm, true blacks (these sit on `#0F172A`);
  no HDR halos, no heavy teal-orange.
- Model releases required for every identifiable rider; property releases
  where applicable.

### Technical delivery

- **RAW files + edited finals.**
- Every select delivered in **landscape 3:2 and vertical 4:5 crops**
  (compose with both crops in mind on set).
- Minimum **4000 px long edge** on edited finals; sRGB and untagged/wide
  masters.
- Naming: `rido-lifestyle-{location}-{nn}.jpg` (lowercase, hyphenated),
  e.g. `rido-lifestyle-marbella-paseo-01.jpg`.
- **Usage rights: perpetual, worldwide web/social/print license to
  Go2 Place S.L.** No time-limited or impression-capped licensing —
  quote must reflect full buyout for those channels.

## 4. Deliverable C — app screenshots (spec placeholder)

The Rido app UI is still in development; this section defines the target so
screens can be produced the moment UI exists. **No external commission yet**
— for quoting purposes treat this as a future UI-design/export task.

- **Frame:** the site's phone mockup renders at **280 × 560 CSS px (exact
  1:2 aspect ratio)** with 40 px corner radius and a 120 × 30 px top notch
  (see `src/components/sections/DownloadCTA.tsx`). Deliver screens at
  **1170 × 2340 px** (1:2 at retina density) so they drop into the mockup
  and the Phase 2 scroll-telling sequence without recropping.
- **Theme:** dark UI on `#0F172A`-family backgrounds, magenta `#DE0498`
  accents, matching the site's design tokens.
- **Screens needed (4):**
  1. **Map / find** — nearby vehicles on a dark map, battery levels
  2. **Scan / unlock** — QR scanner state
  3. **Ride summary** — distance, duration, CO₂ saved, route trace
  4. **Payment** — methods + receipt state
- PNG, no device chrome baked in (the site supplies the frame), status bar
  either clean or omitted.

## 5. Honesty constraints (contractual)

These are house rules that bind all vendors:

1. **No stock imagery**, in whole or in part, composited or otherwise. All
   photography must be shot for this brief, on our locations, with our
   vehicles.
2. **No AI-generated "photos" presented as real riders or real places.**
   AI tooling for retouching/cleanup is acceptable; synthetic people,
   synthetic locations, or synthetic riding moments are not.
3. **No fabricated app screens presented as the real app** before it
   exists. All renders and UI mockups must be visibly product
   visualization, and will be captioned/used as such on the site.
4. Renders must depict the actual fleet hardware — no aspirational
   features the vehicles don't have.
5. All riders photographed wear helmets (see Deliverable B). Depicting
   unsafe or illegal riding (sidewalks where prohibited, two-up, no
   helmet) is a rejection-level defect.

## 6. Acceptance checklist and budget guidance

### Acceptance — Deliverable A

- [ ] Both GLBs load, DRACO-compressed, each **< 2 MB**, PBR intact
- [ ] Livery magenta measures `#DE0498` under neutral light in renders
- [ ] All 4 angles × 2 variants (transparent + navy) per vehicle at ≥ 4K
- [ ] Transparent PNGs have clean alpha; shadow delivered separately
- [ ] Magenta rim light present but body color uncontaminated
- [ ] QR unlock plate legible in detail shots
- [ ] File names match section A.4 exactly; source scenes included

### Acceptance — Deliverable B

- [ ] 8–12 selects covering at least 5 of the listed locations across
      Marbella, San Pedro, Cancelada/El Paraíso, and Estepona
- [ ] **Every mounted/moving rider wears a helmet — zero exceptions**
- [ ] Both 3:2 and 4:5 crops per select, ≥ 4000 px long edge, plus RAWs
- [ ] Signed model releases for all identifiable people
- [ ] Written perpetual web/social/print license to Go2 Place S.L.
- [ ] Grade holds up composited over `#0F172A` (we will test on-site)

### Acceptance — Deliverable C (when commissioned)

- [ ] 4 screens at 1170 × 2340 px, dark theme, `#DE0498` accents
- [ ] No baked device chrome; drops cleanly into the site mockup

### Suggested budget ranges (EUR, 2026 Spanish market)

| Deliverable | Range | Notes |
|---|---|---|
| A — 3D: modeling + livery (2 vehicles) | €2,500 – €5,000 | From reference photos; PBR, web-optimized |
| A — 3D: render package (8 angles × 2 variants) | €800 – €2,000 | Often bundled with modeling |
| **A total** | **€3,500 – €7,000** | 2 revision rounds included |
| B — photographer day rate (Costa del Sol) | €800 – €1,500/day | Expect 2 shoot days for the location spread |
| B — riders/talent (3–4 non-agency, released) | €600 – €1,600 | €150–400 pp/day |
| B — editing, crops, licensing buyout | €500 – €1,500 | Perpetual license priced in |
| **B total** | **€3,000 – €7,500** | Golden-hour scheduling means split days |
| C — UI screen design/export (future) | €500 – €1,500 | Only if app team doesn't produce internally |
| **Indicative total (A + B)** | **€6,500 – €14,500** | C excluded until app UI exists |

Quotes should itemize against these lines and state revision rounds,
delivery timeline, and (for B) weather-contingency policy.

---

**Kickoff materials supplied to selected vendors:** vector logo files,
brand color tokens, reference photos of the fleet, site staging URL, and a
one-page location/permits note per municipality.
