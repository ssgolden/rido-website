# Rido — Shared E-Scooters & E-Bikes in Spain

Premium dark-mode website for **Rido**, a shared micro-mobility business operating e-scooters and e-bikes across Spain.

## Quick Start

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint check
```

## Tech Stack

- **Framework:** Next.js 16 (App Router, Static Site Generation)
- **UI:** React 19 + TypeScript
- **Styling:** Tailwind CSS 4
- **Animations:** Framer Motion 12
- **Icons:** Lucide React
- **Font:** Inter (Google Fonts)
- **Deployment:** Vercel

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Tailwind theme, CSS utilities
│   ├── layout.tsx          # Root layout (fonts, meta, skip link)
│   ├── page.tsx            # Homepage (9 animated sections)
│   ├── privacy/page.tsx    # GDPR Privacy Policy
│   └── terms/page.tsx      # Terms & Conditions
├── components/
│   ├── layout/             # Navbar, Footer, LegalPage
│   ├── sections/           # Hero, HowItWorks, Vehicles, Cities, Safety,
│   │                         Sustainability, Pricing, About, DownloadCTA
│   └── ui/                 # Badge, Button, Card, RidoLogo, ScrollReveal,
│                             StaggerReveal
├── data/                   # cities.ts, vehicles.ts, pricing.ts
└── lib/                    # utils.ts (cn helper)
```

## Key Features

- 🎨 Dark-mode-first cinematic design with **magenta (#DE0498)** brand color
- ✨ Framer Motion scroll animations on every section
- 📱 Responsive at 360px (Samsung S25) → 1440px, `min-h-dvh` for mobile viewport
- ♿ Accessibility: skip-to-content, aria-labels, focus-visible, prefers-reduced-motion
- 🧮 Interactive ride pricing calculator
- 📄 Real legal pages (Go2 Place S.L., GDPR, Terms)
- 🏷️ Lucide SVG icons throughout (zero emoji icons)

## Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#DE0498` | CTAs, headings, accents |
| Primary Dark | `#C10385` | Hover states |
| Primary Light | `#F23DB5` | Badges |
| Navy | `#0F172A` | Background |
| Green | `#22C55E` | Sustainability |

## Deployment

Push to `master` on GitHub — Vercel auto-deploys:
- **Repo:** https://github.com/ssgolden/rido-website
- **Live:** https://skill-deploy-ev5n5hbgck-codex-agent-deploys.vercel.app

## Legal

- **Company:** Go2 Place S.L., NIF B01745405
- **Contact:** info@rido.bike
- **Privacy Policy:** [/privacy](/privacy)
- **Terms & Conditions:** [/terms](/terms)