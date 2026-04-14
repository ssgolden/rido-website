# Rido — Shared E-Scooters & E-Bikes in Spain

Premium dark-mode website for **Rido**, a shared micro-mobility business operating e-scooters and e-bikes across Spain.

## Quick Start

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint check
```

## Build Modes

```bash
# GitHub Pages (default)
NEXT_OUTPUT=export npm run build

# Custom Domain (rido.bike) — no basePath
NEXT_OUTPUT=export CUSTOM_DOMAIN=true npm run build
```

## Tech Stack

- **Framework:** Next.js 16 (App Router, Static Site Generation)
- **UI:** React 19 + TypeScript
- **Styling:** Tailwind CSS 4
- **Animations:** Framer Motion 12 (ScrollReveal, StaggerReveal)
- **Icons:** Lucide React
- **Font:** Inter (Google Fonts)
- **Deployment:** GitHub Pages + Vercel (auto-deploy via Actions)

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Tailwind theme, CSS utilities, hero animations
│   ├── layout.tsx          # Root layout (fonts, meta, JSON-LD, Analytics)
│   ├── page.tsx            # Homepage (10 animated sections)
│   ├── not-found.tsx       # Custom 404 page
│   ├── error.tsx           # Error boundary
│   ├── global-error.tsx    # Global error boundary
│   ├── careers/page.tsx    # Careers page
│   ├── privacy/page.tsx    # GDPR Privacy Policy
│   └── terms/page.tsx      # Terms & Conditions
├── components/
│   ├── layout/             # Navbar, Footer, LegalPage
│   ├── sections/           # Hero, HowItWorks, Vehicles, Cities, Safety,
│   │                         Sustainability, Pricing, FAQ, Testimonials,
│   │                         About, DownloadCTA
│   └── ui/                 # Badge, Button, Card, RidoLogo, ScrollReveal,
│                             StaggerReveal, Skeleton
├── hooks/
│   └── useCountUp.ts       # IntersectionObserver count-up animation
├── data/                   # cities.ts, vehicles.ts, pricing.ts, faq.ts
└── lib/
    ├── utils.ts            # cn() helper
    └── basePath.ts          # Runtime basePath detection + withBase() utility
```

## Key Features

- 🎨 Dark-mode-first cinematic design with **magenta (#DE0498)** brand color
- ✨ Framer Motion scroll animations on every section
- 🌊 Animated hero gradient with floating orbs and micro-particles
- 🔢 Count-up stats that animate when scrolled into view (useCountUp hook)
- 🖱️ Micro-interactions on Safety cards, Vehicle thumbnails (hover:scale, tint)
- 📱 Responsive at 360px (Samsung S25) → 1440px, `min-h-dvh` for mobile viewport
- ♿ Accessibility: skip-to-content, aria-labels, focus-visible, prefers-reduced-motion
- 🛡️ Error boundaries for graceful failure handling
- 📄 Real legal pages (Go2 Place S.L., GDPR, Terms, Careers)
- 🏷️ Lucide SVG icons throughout (zero emoji icons)
- 🛡️ Trust signals in Download CTA (Free to download, No credit card, 8+ cities)
- 🔍 SEO-optimized with JSON-LD LocalBusiness structured data

## Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#DE0498` | CTAs, headings, accents |
| Primary Dark | `#C10385` | Hover states |
| Primary Light | `#F23DB5` | Badges |
| Navy | `#0F172A` | Background |
| Green | `#22C55E` | Sustainability |

## Deployment

### GitHub Pages (Default)
Push to `master` on GitHub — GitHub Actions auto-deploys (~41s):

- **Repo:** https://github.com/ssgolden/rido-website
- **Live:** https://ssgolden.github.io/rido-website/ OR https://rido.bike

### Vercel (Custom Domain)
See [`docs/VERCEL-SETUP.md`](docs/VERCEL-SETUP.md) for step-by-step instructions.

### DNS Configuration
See [`docs/DNS-SETUP.md`](docs/DNS-SETUP.md) for DNS setup instructions for rido.bike.

## Legal

- **Company:** Go2 Place S.L., NIF B01745405
- **Contact:** info@rido.bike
- **Privacy Policy:** [/privacy](/privacy)
- **Terms & Conditions:** [/terms](/terms)
- **Careers:** [/careers](/careers)