# Rido — Project Brain

> **Everything we know, learn, and decide about the Rido project lives here.**
> **Skills reference:** `C:\Users\steph\OneDrive\Desktop\Rido\SKILLS.md`

---

## What Is Rido?

**Rido** is a shared micro-mobility business operating in **Spain**, providing **e-scooters** and **e-bikes** for rent via a mobile app. The website is a **public-facing frontend** — its purpose is brand awareness, trust, and app downloads.

---

## Business Context

| Detail | Value |
|--------|-------|
| **Company** | Rido |
| **Market** | Spain (expanding) |
| **Vehicles** | Shared e-scooters, shared e-bikes |
| **Business model** | App-based rental (scan → ride → park) |
| **Target audience** | Urban commuters (18-45), tourists, students, eco-conscious riders |
| **Website purpose** | Brand awareness → App download → Trust & credibility |
| **Website type** | Static frontend (Next.js + React + TypeScript + Tailwind) |

---

## Competitor Analysis

### 1. Hoppy (behoppy.es / gethopp.com)

| Aspect | Details |
|--------|---------|
| **HQ** | Belgium (Hoppsharing BV), Spain entity: Hoppylectrico S.L. (Elche, Alicante) |
| **Spain cities** | Torrevieja, Orihuela, Albir, Lanzarote, Altea, La Nucia, Fuerteventura, Tenerife |
| **Vehicles** | Classic bike, E-Scooter, E-Moped, E-Bike, Golf Carts |
| **Website quality** | ⭐⭐ Basic, functional, not premium |
| **UX flow** | Download → Scan → Ride → Park |
| **Strengths** | Multi-vehicle, city data sharing, Hoppy Hubs (charging stations) |
| **Weaknesses** | Cheap feel, poor reviews (expensive, €10 min top-up, €3 refund fee), data privacy concerns, maintenance issues |

### 2. Bolt (bolt.eu)

| Aspect | Details |
|--------|---------|
| **HQ** | Estonia, 200M+ customers, 600+ cities |
| **Spain cities** | Madrid, Barcelona, Valencia, Málaga, Bilbao, Palma de Mallorca, Seville |
| **Vehicles** | E-scooters, e-bikes, ride-hailing, car sharing, food delivery |
| **Website quality** | ⭐⭐⭐⭐⭐ Enterprise-grade, recent brand refresh |
| **Brand refresh** | New greens (accessible), Inter font (990 languages), 3D illustrations, flexible grid layout, photography library, sonic identity |
| **Safety features** | Beginner mode (15km/h cap first 5 rides), tandem riding detection, cognitive reaction test (drunk detection), Bolt 6 scooter (90km range, 8yr lifespan) |
| **Strengths** | Premium brand, multi-service super-app, city partnerships, charging docks (compatible with all brands), in-house creative team |
| **Weaknesses** | No specific weakness — they're the benchmark |

### 3. Lime (li.me)

| Aspect | Details |
|--------|---------|
| **HQ** | USA, global leader, 100M+ ride milestone |
| **Vehicles** | Gen4 E-Scooter, Gen4 E-Bike, Seated E-Scooter |
| **Website quality** | ⭐⭐⭐⭐⭐ Premium, polished, global |
| **Tagline** | "Ride Green" |
| **Core principles** | Safety, Sustainability, Community, Innovation |
| **Features** | Swappable batteries, LimePrime subscription, multi-region (35+ countries) |
| **Strengths** | Brand recognition, premium feel, sustainability leadership, global scale |
| **Weaknesses** | Less Europe-focused, less city partnership depth in Spain |

### 4. Dott (ridedott.com)

| Aspect | Details |
|--------|---------|
| **HQ** | Netherlands, merged with TIER in 2024 |
| **Scale** | 400+ cities, 500M rides, first EBITDA profitability 2025 |
| **Vehicles** | E-scooters, e-bikes (45,000 new vehicles 2025) |
| **Website quality** | ⭐⭐⭐⭐ Clean, purposeful, European feel |
| **Tagline** | "Change mobility for good, together" / "Moving us closer" |
| **Features** | 2x battery capacity, phone holders with charging, adjustable saddles, complimentary insurance, city e-ebike (women-friendly) |
| **Strengths** | European authenticity, responsible operations (in-house), purpose-driven brand, new fleet investment |
| **Weaknesses** | Less brand recognition than Lime/Bolt |

---

## Competitive Positioning — Where Rido Wins

| Dimension | Competitor Standard | Rido's Opportunity |
|-----------|-------------------|-------------------|
| **Brand** | Generic green/blue | Bold Spanish identity — warm, passionate, Mediterranean |
| **Website** | Functional or corporate | Cinematic, immersive, story-driven |
| **Sustainability** | Talk, some action | Real transparency — live CO2 counter, routes replaced |
| **Safety** | Basic rules page | Interactive safety course with rewards |
| **Cities** | List of names | Interactive map with individual city stories |
| **Vehicles** | Spec sheets | 3D rotating vehicle showcase |
| **Pricing** | Confusing, hidden fees | Transparent pricing calculator |
| **App download** | Small button | Impossible-to-miss CTA on every section |
| **Trust** | Legal pages | Real rider stories, safety track record |

---

## Design Direction

### Brand Personality
- **Warm** — Spanish sun, Mediterranean lifestyle, passionate about cities
- **Confident** — We own our space, we're not copying anyone
- **Honest** — Transparent pricing, no hidden fees, real sustainability
- **Energetic** — Movement, freedom, the feeling of wind in your hair

### Color Palette (From Brand Assets — Updated 2026-01-PIXELED)

> **CRITICAL:** The brand color is **magenta/fuchsia (#DE0498)**, NOT orange-coral. This was confirmed by programmatic pixel extraction across all 4 brand assets. The initial visual assessment was fooled by white backgrounds making magenta appear warmer.

| Token | Hex | Source | Usage |
|-------|-----|--------|-------|
| **Primary** | `#DE0498` | App screenshot (20,694px) | CTAs, headings, accents, logo |
| **Primary Dark** | `#C10385` | Derived (85% brightness) | Hover/active states |
| **Primary Light** | `#F23DB5` | Derived (35% toward white) | Badges, subtle backgrounds |
| **Yellow Accent** | `#FDE803` | App map markers (5,270px) | Secondary accent (use sparingly) |
| **Dark Background** | `#0F172A` | App dark mode + derived | Page background |
| **Surface** | `#1E293B` | Derived | Card backgrounds |
| **Green** | `#22C55E` | Standard | Eco/success/sustainability |
| **Cloud White** | `#F8FAFC` | Standard | Light backgrounds |

**Pixel extraction evidence:**
- Scooter Product (1000508879): #FF31B7 (35,891 magenta pixels)
- Scooter Street (1000508880): #FF4A9B (14,569 magenta pixels)
- App Screenshot (1000508881): #DE0498 (20,694 magenta pixels) ← canonical
- Rider Street (1000508885): #DF0B84 (39,821 magenta pixels)

All 4 images consistently show magenta/pink, NOT orange-coral.

### Logo (From Brand Assets — Updated 2026-01)
- **The Rido checkmark (✓)** is the primary brand mark — visible on scooter deck, stem, and app header
- Checkmark is rounded/friendly (not angular), rendered in coral on a rounded square background
- **Wordmark** is lowercase "rido" in Inter Black
- Component: `src/components/ui/RidoLogo.tsx` with variants: `mark` (icon only), `wordmark` (text), `full` (icon + text)
- Favicon: `public/favicon.svg` (SVG checkmark)

### Typography
- **Headlines:** Inter (Bold/Black) — same as Bolt for 990-language support
- **Body:** Inter (Regular) — clean, readable

### UI Style
- **Dark mode first** — cinematic, premium, tech-forward
- **Gradient accents** — Coral → Gold for energy
- **Glass morphism** — depth and sophistication
- **Micro-animations** — vehicle wheels spinning, location pins bouncing
- **Full-bleed imagery** — Spanish cityscapes, riders in motion

---

## Website Sections (Agreed)

1. **Hero** — Full-screen cinematic video/gradient, bold tagline, dual CTA (App Store + Google Play)
2. **How It Works** — 3-step animated flow (Download → Scan → Ride)
3. **Our Vehicles** — 3D card showcase for E-Scooter and E-Bike with specs
4. **Cities** — Interactive map of Spanish cities where Rido operates
5. **Safety** — Interactive safety principles with icons and stats
6. **Sustainability** — Live CO2 counter, impact stats, green commitment
7. **Pricing** — Transparent pricing calculator with no-surprise guarantee
8. **About Us** — Company story, mission, team
9. **Download CTA** — Final full-width call-to-action for app download
10. **Footer** — Links, legal, social, language selector (ES/EN)

---

## Technical Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **UI** | React 19 + TypeScript |
| **Styling** | Tailwind CSS 4 |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Fonts** | Inter (Google Fonts) |
| **Deployment** | Vercel |
| **Analytics** | Vercel Analytics |
| **Performance** | Next.js Image optimization, ISR, edge runtime |

---

## Brand Assets

| File | Content | Usage |
|------|---------|-------|
| `public/images/scooter/rido-scooter-product.jpg` | White e-scooter with coral accents on white bg | Vehicles section product shot |
| `public/images/lifestyle/rido-scooter-street.jpg` | Scooter on Spanish street | Hero, How It Works |
| `public/images/app/rido-app-screenshot.png` | Rido app interface (1080x2340) | How It Works, Download CTA |
| `public/images/lifestyle/rido-rider-street.jpg` | Rider on scooter in Spanish city | Hero, About, Sustainability |

## File Structure

```
rido/
├── SKILLS.md                    # Skills reference
├── BRAIN.md                     # This file
├── images/                       # Source brand assets (original)
├── docs/
│   └── plans/
│       └── 2026-01-rido-website.md
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── sections/
│   │   │   ├── Hero.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── Vehicles.tsx
│   │   │   ├── Cities.tsx
│   │   │   ├── Safety.tsx
│   │   │   ├── Sustainability.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── About.tsx
│   │   │   └── DownloadCTA.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Badge.tsx
│   │       ├── Card.tsx
│   │       ├── RidoLogo.tsx       # Checkmark logo component
│   │       └── AnimatedCounter.tsx
│   ├── data/
│   │   ├── cities.ts
│   │   ├── vehicles.ts
│   │   └── pricing.ts
│   └── lib/
│       └── utils.ts
├── public/
│   ├── favicon.svg               # SVG checkmark favicon
│   └── images/
│       ├── scooter/rido-scooter-product.jpg
│       ├── lifestyle/rido-scooter-street.jpg
│       ├── app/rido-app-screenshot.png
│       └── lifestyle/rido-rider-street.jpg
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

---

## Key Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01 | Next.js 15 + App Router | Best DX, SSG for performance, SEO for discoverability |
| 2026-01 | Tailwind CSS 4 | Fastest iteration, consistent design system |
| 2026-01 | Dark-mode-first design | Cinematic, premium feel that differentiates from green-heavy competitors |
| 2026-01 | Coral `#FF5733` (not `#FF6B4A`) | Updated after visual audit of scooter product shots and app screenshot — real brand is warmer/more orange |
| 2026-01 | Navy `#0F172A` (not `#1A1F36`) | True near-black matches app dark mode — old value was too desaturated |
| 2026-01 | Checkmark logo (not "Rido.") | Brand assets show checkmark (✓) on scooter deck, stem, and app header — the period was our invention |
| 2026-01 | Removed gold `#FFB84D` | Gold doesn't appear in any brand asset — replaced with coral-light `#FF8A6A` |
| 2026-01 | **Magenta `#DE0498` (NOT coral)** | Programmatic pixel extraction from all 4 brand assets confirms brand color is vibrant magenta/fuchsia, not orange-coral. 20,694px in app, 35,891px in scooter, 39,821px in rider. Visual assessment was fooled by white backgrounds making magenta appear warmer. |
| 2026-01 | Bilingual ES/EN | Spain market + international tourists |

---

## Skills Active for This Project

| Skill | When We Use It |
|-------|---------------|
| `using-superpowers` | Every session start |
| `brainstorming` | Before any new feature/section |
| `writing-plans` | Before implementation |
| `subagent-driven-development` | During implementation |
| `test-driven-development` | Every component and function |
| `ui-ux-pro-max` | Design system, color, typography, layout |
| `web-architect` | Architecture decisions |
| `fullstack-dev` | Patterns and best practices |
| `web-search` | Competitor research, latest tech |
| `verification-before-completion` | Before claiming anything works |

---

## Sources & References

- **Hoppy:** https://behoppy.es, https://gethopp.com/es-us/scooters/
- **Bolt:** https://bolt.eu/en/refresh/, https://bolt.eu/en-gb/scooters/, https://bolt.eu/es-es/scooters/
- **Lime:** https://www.li.me/en-US/home, https://www.li.me/en-gb
- **Dott:** https://www.ridedott.com/, https://ridedott.com/ride-with-us/, https://ridedott.com/your-best-ride-yet/