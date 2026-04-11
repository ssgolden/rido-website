# Rido — Project Brain

> **Everything we know, learn, and decide about the Rido project lives here.**
> **Skills reference:** `C:\Users\steph\OneDrive\Desktop\Rido\SKILLS.md`

---

## What Is Rido?

**Rido** is a shared micro-mobility business operating in **Spain**, providing **e-scooters** and **e-bikes** for rent via a mobile app. The website is a **public-facing frontend** — its purpose is brand awareness, trust, and app downloads.

- **Legal entity:** Go2 Place S.L., NIF B01745405, Calle Eneldo 3, C4, local 22, Orihuela Costa 03189
- **Contact:** info@rido.bike
- **Live site:** https://ssgolden.github.io/rido-website/ (auto-deploys on push to master)
- **GitHub:** https://github.com/ssgolden/rido-website (34 commits)

---

## Business Context

| Detail | Value |
|--------|-------|
| **Company** | Go2 Place S.L. (brand: Rido) |
| **NIF** | B01745405 |
| **Market** | Spain (expanding) |
| **Vehicles** | Shared e-scooters, shared e-bikes |
| **Business model** | App-based rental (scan → ride → park) |
| **Target audience** | Urban commuters (18-45), tourists, students, eco-conscious riders |
| **Website purpose** | Brand awareness → App download → Trust & credibility |
| **Website type** | Static Next.js site (SSG) on Vercel |

---

## Competitor Analysis

### Key Competitors

| Competitor | HQ | Website Quality | Unique Strength |
|-----------|-----|-----------------|-----------------|
| **Hoppy** | Belgium (Spain: Elche) | ⭐⭐ Basic | Multi-vehicle, Hoppy Hubs |
| **Bolt** | Estonia | ⭐⭐⭐⭐⭐ Enterprise | Super-app, brand refresh, safety tech |
| **Lime** | USA | ⭐⭐⭐⭐⭐ Premium | Global scale, sustainability |
| **Dott** | Netherlands | ⭐⭐⭐⭐ Clean | European, purpose-driven |

### Where Rido Wins

| Dimension | Competitor Standard | Rido's Edge |
|-----------|-------------------|-------------|
| **Brand** | Generic green/blue | Bold magenta, Spanish identity |
| **Website** | Functional/corporate | Cinematic, animated, immersive |
| **Pricing** | Confusing, hidden fees | Transparent calculator, no-surprise guarantee |
| **Legal** | Generic templates | Real Go2 Place S.L. legal docs |
| **Safety** | Basic rules page | Beginner mode, tandem detection, helmet rewards |

---

## Design Direction

### Brand Personality
- **Warm** — Spanish sun, Mediterranean lifestyle, passionate about cities
- **Confident** — We own our space, we're not copying anyone
- **Honest** — Transparent pricing, no hidden fees, real sustainability
- **Energetic** — Movement, freedom, the feeling of wind in your hair

### Color Palette (Pixel-Extracted from Brand Assets)

> **CRITICAL:** The brand color is **magenta/fuchsia (#DE0498)**, NOT orange-coral. Programmatic pixel extraction confirmed across all 4 brand assets.

| Token | Hex | Usage |
|-------|-----|-------|
| **Primary** | `#DE0498` | CTAs, headings, accents, logo |
| **Primary Dark** | `#C10385` | Hover/active states |
| **Primary Light** | `#F23DB5` | Badges, subtle backgrounds |
| **Yellow Accent** | `#FDE803` | Secondary accent (sparingly) |
| **Dark Background** | `#0F172A` | Page background |
| **Surface** | `#1E293B` | Card backgrounds |
| **Green** | `#22C55E` | Eco/success/sustainability |
| **Cloud White** | `#F8FAFC` | Light backgrounds |

### Logo
- **Rido checkmark (✓)** — primary brand mark, rendered in `#DE0498` on rounded square
- **Wordmark** — lowercase "rido" in Inter Black
- Component: `src/components/ui/RidoLogo.tsx` — variants: `mark`, `wordmark`, `full`
- Favicon: `public/favicon.svg`

### Typography
- **Headlines:** Inter (Bold/Black)
- **Body:** Inter (Regular)
- Loaded via Google Fonts `<link>` with `display=swap`

### UI Style
- **Dark mode first** — cinematic, premium, tech-forward
- **Magenta gradient accents** — `from-rido-magenta to-rido-magenta-light`
- **Glass morphism** — `glass` and `glass-strong` utilities
- **Scroll animations** — Framer Motion `ScrollReveal` + `StaggerReveal`
- **Full-bleed imagery** — Spanish cityscapes, riders in motion

---

## Website Sections (12 total)

| # | Section | Route | Key Features |
|---|---------|-------|-------------|
| 1 | **Hero** | `/#` | Animated gradient bg, 3 floating orbs, 3 micro-particles, count-up stats, dual CTA, rider bg at 12% opacity |
| 2 | **How It Works** | `/#how-it-works` | 4-step cards, progress line (image removed) |
| 3 | **Vehicles** | `/#vehicles` | Tab switcher, image gallery, spec cards, features list |
| 4 | **Cities** | `/#cities` | 9 city cards with Lucide icons, Coming Soon badges |
| 5 | **Safety** | `/#safety` | 4 safety cards with hover micro-interactions, Beginner Mode callout |
| 6 | **Sustainability** | `/#sustainability` | Animated counters, 3 commitment cards |
| 7 | **Pricing** | `/#pricing` | 3-tier cards (€1/€0.35, Pass, Day €14.99), no-surprise guarantee, calculator |
| 8 | **About** | `/#about` | Split layout (text + values), company story |
| 9 | **Download CTA** | `/#download` | Animated gradient bg, 3 floating orbs, App Store/Google Play buttons, trust signals, security badge |
| 10 | **Footer** | — | 4-column, legal links, ES/EN selector |
| 11 | **Privacy Policy** | `/privacy` | 11 sections, GDPR, Go2 Place S.L., legal highlight boxes |
| 12 | **Terms of Service** | `/terms` | 16 sections, damage fees, age limits, legal warning boxes |

---

## Technical Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **UI** | React 19 + TypeScript |
| **Styling** | Tailwind CSS 4 |
| **Animations** | Framer Motion 12 (ScrollReveal, StaggerReveal) |
| **Icons** | Lucide React |
| **Fonts** | Inter (Google Fonts) |
| **Deployment** | GitHub Pages (auto-deploy via Actions) + Vercel compatible |
| **Package manager** | npm |

---

## Key Libraries & Components

### Custom Components

| Component | Path | Purpose |
|-----------|------|---------|
| `ScrollReveal` | `src/components/ui/ScrollReveal.tsx` | Fade-in from direction on scroll |
| `StaggerReveal` | `src/components/ui/StaggerReveal.tsx` | Staggered children reveal |
| `StaggerItem` | `src/components/ui/StaggerReveal.tsx` | Individual stagger child |
| `RidoLogo` | `src/components/ui/RidoLogo.tsx` | Checkmark + wordmark logo |
| `Button` | `src/components/ui/Button.tsx` | Primary/secondary/outline variants |
| `Badge` | `src/components/ui/Badge.tsx` | magenta/magenta-light/green/default |
| `Card` | `src/components/ui/Card.tsx` | Glass card with hover effects |
| `LegalPage` | `src/components/layout/LegalPage.tsx` | Shared legal page layout |
| `Navbar` | `src/components/layout/Navbar.tsx` | Fixed, glass-strong, active section |
| `Footer` | `src/components/layout/Footer.tsx` | 4-column, legal links to /privacy + /terms |
| `PricingCalculator` | Inside `Pricing.tsx` | Interactive ride cost estimator |
| `Skeleton` | `src/components/ui/Skeleton.tsx` | Loading pulse skeleton |
| `useCountUp` | `src/hooks/useCountUp.ts` | IntersectionObserver-triggered count-up animation (prefers-reduced-motion safe) |
| `basePath` | `src/lib/basePath.ts` | GitHub Pages `/rido-website` prefix utility |
| `withBase()` | `src/lib/basePath.ts` | Prepends basePath for export builds |

### CSS Utilities

| Class | Purpose |
|-------|---------|
| `.text-gradient-brand` | Magenta→magenta-light gradient text |
| `.glass` | White 5% backdrop-blur card |
| `.glass-strong` | White 10% backdrop-blur card |
| `.legal-*` | Legal page typography / highlight / warning |
| `.hero-gradient` | Animated cycling gradient (15s) |
| `.hero-orb` | Floating blur orb base class |
| `.hero-orb-1/2/3` | Individual orb keyframe animations (12s/18s/14s) |
| `focus-visible` | Magenta outline on focus |

### Accessibility

- Skip-to-content link in layout
- `aria-label` on all 8 homepage sections + legal pages
- `prefers-reduced-motion` CSS media query + `useReducedMotion()` hook
- `focus-visible` outline styles (magenta)
- Lang attribute: `en` (matching English content)
- All icons: Lucide SVG (zero emoji icons)

---

## Brand Assets

| File | Content | Usage |
|------|---------|-------|
| `public/images/scooter/rido-scooter-product.jpg` | White e-scooter with magenta accents | Vehicles section (primary) |
| `public/images/bike/rido-bike-front.jpg` | E-bike front product shot | Vehicles section gallery |
| `public/images/bike/rido-bike-side.jpg` | E-bike side profile | Vehicles section gallery |
| `public/images/bike/rido-bike-detail.jpg` | E-bike detail close-up | Vehicles section gallery |
| `public/images/bike/rido-bike-lifestyle.jpg` | E-bike lifestyle angle | Vehicles section gallery |
| `public/images/lifestyle/rido-scooter-street.jpg` | Scooter on Spanish street | Hero, How It Works |
| `public/images/app/rido-app-screenshot.png` | Rido app interface (1080×2340) | Available but currently unused (removed from HowItWorks + DownloadCTA) |
| `public/images/lifestyle/rido-rider-street.jpg` | Rider on scooter in Spanish city | Hero bg (12% opacity), About, Sustainability, OG image |
| `public/favicon.svg` | Checkmark in `#DE0498` on rounded square | Browser favicon |

---

## File Structure

```
rido/
├── SKILLS.md                              # Skills reference
├── BRAIN.md                               # This file
├── vercel.json                             # Vercel deployment config
├── next.config.ts                          # Next.js config
├── tsconfig.json                           # TypeScript config
├── package.json                            # Dependencies & scripts
├── postcss.config.mjs                      # PostCSS for Tailwind
├── .gitignore                              # Git ignore rules
├── docs/
│   └── plans/
│       ├── 2026-01-rido-website.md         # Original website plan
│       ├── 2026-01-brand-upgrade.md        # Coral alignment (superseded)
│       ├── 2026-01-brand-color-correction.md # Coral→magenta correction
│       ├── 2026-01-ebike-upgrade.md         # E-bike gallery
│       ├── 2026-01-legal-pages-upgrade.md   # Privacy + Terms pages
│       └── 2026-01-ui-ux-upgrade.md        # UI/UX animation + accessibility plan
├── src/
│   ├── app/
│   │   ├── globals.css                     # Tailwind config, theme tokens, utilities
│   │   ├── layout.tsx                      # Root layout (Google Fonts, skip link, meta)
│   │   ├── page.tsx                        # Homepage (9 sections + Navbar + Footer)
│   │   ├── privacy/page.tsx                # Privacy Policy (11 sections)
│   │   ├── terms/page.tsx                  # Terms of Service (16 sections)
│   │   └── not-found.tsx                   # Custom 404 page
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx                   # Fixed glass navbar, active section tracking
│   │   │   ├── Footer.tsx                   # 4-column footer, legal links
│   │   │   └── LegalPage.tsx                # Shared legal page layout
│   │   ├── sections/
│   │   │   ├── Hero.tsx                     # Full-screen hero, animated gradient, orbs, count-up stats, CTAs
│   │   │   ├── HowItWorks.tsx               # 4-step cards + progress line (image removed)
│   │   │   ├── Vehicles.tsx                  # Tabbed vehicle gallery + specs
│   │   │   ├── Cities.tsx                    # City cards with Lucide icons
│   │   │   ├── Safety.tsx                    # Safety cards + Beginner Mode
│   │   │   ├── Sustainability.tsx            # Animated counters + commitments
│   │   │   ├── Pricing.tsx                   # Tiers + no-surprise + calculator
│   │   │   ├── About.tsx                     # Split layout, company story
│   │   │   └── DownloadCTA.tsx              # Animated gradient bg, trust signals, security badge, store buttons
│   │   └── ui/
│   │       ├── Badge.tsx                     # Badge variants (magenta/green/default)
│   │       ├── Button.tsx                    # Button variants (primary/secondary/outline)
│   │       ├── Card.tsx                      # Glass card with hover
│   │       ├── RidoLogo.tsx                  # Checkmark + wordmark logo
│   │       ├── ScrollReveal.tsx              # Framer Motion scroll fade-in
│   │       ├── StaggerReveal.tsx             # Staggered children animation
│   │       └── Skeleton.tsx                  # Loading pulse skeleton
│   ├── hooks/
│   │   └── useCountUp.ts                    # IntersectionObserver count-up animation (prefers-reduced-motion safe)
│   ├── data/
│   │   ├── cities.ts                         # 9 Spanish cities with coordinates
│   │   ├── vehicles.ts                       # E-scooter + E-bike specs, images, features
│   │   └── pricing.ts                        # Pay-as-you-go (€1 unlock/€0.35 min), Rido Pass, Day Pass (€14.99)
│   └── lib/
│       ├── utils.ts                          # cn() utility
│       └── basePath.ts                        # GitHub Pages basePath + withBase() utility
└── public/
    ├── favicon.svg                           # SVG checkmark favicon
    ├── apple-touch-icon.svg                  # 180×180 apple touch icon
    ├── manifest.json                         # PWA manifest (brand colors, icons)
    ├── robots.txt                            # Allow all, sitemap reference
    ├── sitemap.xml                           # /, /privacy, /terms
    ├── icons/
    │   ├── icon-192.svg                       # PWA icon 192×192
    │   └── icon-512.svg                       # PWA icon 512×512
    └── images/
        ├── bike/                             # 4 e-bike images
        ├── scooter/                          # 1 scooter image
        ├── lifestyle/                         # 2 lifestyle images
        └── app/                              # 1 app screenshot
```

---

## Key Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01 | Next.js 16 + App Router | Best DX, SSG for performance, SEO for discoverability |
| 2026-01 | Tailwind CSS 4 | Fastest iteration, consistent design system |
| 2026-01 | Dark-mode-first design | Cinematic, premium feel differentiating from green-heavy competitors |
| 2026-01 | **Magenta `#DE0498` (NOT coral)** | Pixel extraction from all 4 brand assets confirms fuchsia/magenta. Visual assessment fooled by white backgrounds |
| 2026-01 | Checkmark logo (not "Rido.") | Brand assets show checkmark on scooter deck, stem, app header |
| 2026-01 | Legal pages use real Go2 Place S.L. docs | Sourced from Policies/ DOCX, NIF B01745405 |
| 2026-01 | Framer Motion scroll animations | ScrollReveal + StaggerReveal on all 9 homepage sections |
| 2026-01 | Active section tracker in Navbar | IntersectionObserver highlights current section |
| 2026-01 | Emoji purge → Lucide icons | Replaced 🛴🚲 with Zap/Bike SVG icons throughout |
| 2026-01 | App Store/Google Play badges | Replaced 🍎 ▶ with Lucide Apple/Play + store names |
| 2026-01 | Interactive pricing calculator | Ride cost estimator with plan + duration slider |
| 2026-01 | prefers-reduced-motion | CSS media query + useReducedMotion() in DownloadCTA |
| 2026-01 | skip-to-content + focus-visible | Accessibility: skip link, magenta focus rings, aria-labels |
| 2026-01 | lang="en" | Content is English, not Spanish |
| 2026-01 | metadataBase https://rido.bike | Resolves OG image URLs for social sharing |
| 2026-01 | Vercel deployment | Static SSG on Vercel via Codex deploy script |
| 2026-01 | Mobile responsive fix (S25) | min-h-dvh, responsive padding, button sizing, viewport-fit:cover, scroll-margin, overscroll |
| 2026-01 | Mobile responsive v2 (S25) | min-h-screen+min-h-dvh fallback, section pt-14/sm:pt-20, smaller blur orbs, navbar mobile logo=sm, svh+dvh body fallback, safe-area utilities |
| 2026-01 | SEO & PWA bundle | @vercel/analytics, manifest.json, PWA icons, sitemap.xml, robots.txt, twitter cards, OG metadata, theme-color, 404 page |
| 2026-01 | Image optimization | sizes attributes on all Image components, Suspense boundary on HowItWorks, Skeleton component |
| 2026-01 | Pricing update | €1.00 unlock / €0.35 min (was €0.50/€0.15), Pass €0.25/min (was €0.10), Day €14.99 (was €9.99) |
| 2026-01 | GitHub Pages deployment | Auto-deploy via GitHub Actions, live at ssgolden.github.io/rido-website, basePath fix for assets/links |
| 2026-01 | Hamburger touch target 46px | p-3 -mr-3 padding for 44px+ touch target accessibility |
| 2026-01 | SEO & PWA bundle | @vercel/analytics, manifest.json, PWA icons, sitemap.xml, robots.txt, twitter cards, OG metadata, theme-color |
| 2026-01 | Custom 404 page | Branded 404 with RidoLogo, Back to Home + View Fleet CTAs, legal links |
| 2026-01 | P1 UI/UX upgrades | Hero gradient animation + orbs + micro-particles, micro-interactions on Safety/Vehicles, Download CTA trust signals, useCountUp hook for stats, Sustainability count-up (1,240+/85,000+/420,000+) |
| 2026-01 | App screenshots removed | Removed rido-app-screenshot.png from HowItWorks and DownloadCTA sections |

---

## Known Issues & Future Work

| Priority | Item | Notes |
|----------|------|-------|
| 🔴 High | `next/font/google` blocked by Turbopack | Windows http2 bug; using Google Fonts `<link>` as fallback. Switch when Next.js fixes |
| 🟡 Medium | E-scooter has only 1 image | Add scooter product gallery when more images provided |
| 🟢 Low | Cookie Policy is external link | Could create `/cookies` page if needed |
| 🟢 Low | Bilingual ES/EN | Currently English only; could add i18n |
| 🟢 Low | Vercel Analytics not configured | ✅ DONE: @vercel/analytics installed |
| 🟢 Low | No sitemap/robots | ✅ DONE: sitemap.xml + robots.txt created |
| 🟢 Low | No 404 page | ✅ DONE: not-found.tsx with Rido branding |
| 🟢 Low | No PWA manifest | ✅ DONE: manifest.json + SVG icons |
| 🔴 High | Custom domain rido.bike | Needs DNS pointing to GitHub Pages or Vercel |
| 🟡 Medium | P0: Stats counter animation | ✅ DONE: useCountUp hook in Hero + Sustainability |
| 🟡 Medium | P0: Social proof / testimonials | New section: 3 rotating testimonials with avatar, name, city, stars |
| 🟡 Medium | P0: FAQ accordion | New section: 8-10 questions on age, parking, damage, insurance, refunds |
| 🟡 Medium | P0: Sticky nav download CTA | Download button in navbar after scrolling past hero |
| 🟢 Low | P2: Cookie consent banner | GDPR/LOPDGDD required, planned |
| 🟢 Low | P2: Footer enhancement | Social icons, app download badges, newsletter, legal entity |
| 🟢 Low | P2: Skeleton loading | loading.tsx for page transitions |
| 🟢 Low | P3: Comparison table | Rido vs Bolt vs Lime feature comparison |
| 🟢 Low | P3: Active nav pill animation | Framer Motion layoutId for smooth pill transition |
| 🟢 Low | P3: Vehicle gallery lightbox | Click-to-expand vehicle images with next/prev |

---

## Skills Active for This Project

| Skill | When We Use It |
|-------|---------------|
| `using-superpowers` | Every session start |
| `brainstorming` | Before any new feature/section |
| `writing-plans` | Before implementation |
| `subagent-driven-development` | During implementation |
| `ui-ux-pro-max` | Design system, color, typography, layout |
| `web-architect` | Architecture decisions |
| `verification-before-completion` | Before claiming anything works |
| `deploy-to-vercel` | Deployment |

---

## Sources & References

- **Hoppy:** https://behoppy.es
- **Bolt:** https://bolt.eu
- **Lime:** https://www.li.me
- **Dott:** https://www.ridedott.com
- **Legal docs:** `Policies/RIDO_PRIVACY_POLICY.docx`, `Policies/RIDO_SERVICE_TERMS_AND_CONDITIONS.docx`