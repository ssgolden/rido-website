# Rido — Shared E-Scooters & E-Bikes in Spain

Premium dark-mode website for **Rido**, a shared micro-mobility business operating e-scooters and e-bikes across Spain.

## Quick Start

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # Production build
NEXT_OUTPUT=export npm run build  # Static export for GitHub Pages
npm run lint     # ESLint check
```

## Tech Stack

- **Framework:** Next.js 16 (App Router, Static Site Generation)
- **UI:** React 19 + TypeScript
- **Styling:** Tailwind CSS 4
- **Animations:** Framer Motion 12 (ScrollReveal, StaggerReveal)
- **Icons:** Lucide React
- **Font:** Inter (Google Fonts, `<link>` fallback for Turbopack)
- **Deployment:** GitHub Pages (auto-deploy via Actions)

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Tailwind theme, CSS utilities, hero animations
│   ├── layout.tsx          # Root layout (fonts, meta, skip link, Analytics)
│   ├── page.tsx            # Homepage (9 animated sections)
│   ├── not-found.tsx       # Custom 404 page
│   ├── privacy/page.tsx    # GDPR Privacy Policy
│   └── terms/page.tsx      # Terms & Conditions
├── components/
│   ├── layout/             # Navbar, Footer, LegalPage
│   ├── sections/           # Hero, HowItWorks, Vehicles, Cities, Safety,
│   │                         Sustainability, Pricing, About, DownloadCTA
│   └── ui/                 # Badge, Button, Card, RidoLogo, ScrollReveal,
│                             StaggerReveal, Skeleton
├── hooks/
│   └── useCountUp.ts       # IntersectionObserver count-up animation
├── data/                   # cities.ts, vehicles.ts, pricing.ts
└── lib/
    ├── utils.ts            # cn() helper
    └── basePath.ts          # GitHub Pages basePath utility
```

## Key Features

- 🎨 Dark-mode-first cinematic design with **magenta (#DE0498)** brand color
- ✨ Framer Motion scroll animations on every section
- 🌊 Animated hero gradient with floating orbs and micro-particles
- 🔢 Count-up stats that animate when scrolled into view (useCountUp hook)
- 🖱️ Micro-interactions on Safety cards, Vehicle thumbnails (hover:scale, tint)
- 📱 Responsive at 360px (Samsung S25) → 1440px, `min-h-dvh` for mobile viewport
- ♿ Accessibility: skip-to-content, aria-labels, focus-visible, prefers-reduced-motion
- 🧮 Interactive ride pricing calculator
- 📄 Real legal pages (Go2 Place S.L., GDPR, Terms)
- 🏷️ Lucide SVG icons throughout (zero emoji icons)
- 🛡️ Trust signals in Download CTA (Free to download, No credit card, 8+ cities)
- 🔒 Security badge (Insured, GDPR, Data protected)

## Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#DE0498` | CTAs, headings, accents |
| Primary Dark | `#C10385` | Hover states |
| Primary Light | `#F23DB5` | Badges |
| Navy | `#0F172A` | Background |
| Green | `#22C55E` | Sustainability |

## Deployment

Push to `master` on GitHub — GitHub Actions auto-deploys to GitHub Pages (~41s):

- **Repo:** https://github.com/ssgolden/rido-website
- **Live:** https://ssgolden.github.io/rido-website/

### Adding a Custom Domain

1. Go to repo Settings → Pages → Custom domain → add `rido.bike`
2. Update DNS to point to GitHub Pages
3. Remove `basePath` from `next.config.ts` (Vercel deployment doesn't need it)

## Legal

- **Company:** Go2 Place S.L., NIF B01745405
- **Contact:** info@rido.bike
- **Privacy Policy:** [/privacy](/privacy)
- **Terms & Conditions:** [/terms](/terms)