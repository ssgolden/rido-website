<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Rido Project Rules

## Tech Stack
- Next.js 16 (App Router) with TypeScript
- Tailwind CSS 4 (uses `@theme` CSS blocks, NOT tailwind.config.ts)
- Framer Motion for animations
- Lucide React for icons (NO emoji icons)
- Brand color: `#DE0498` (magenta), NOT coral/orange
- Dark mode only (background: `#0F172A`)

## Key Patterns
- Scroll animations: Use `ScrollReveal` and `StaggerReveal`/`StaggerItem` from `@/components/ui/`
- Legal pages: Use `LegalPage` layout from `@/components/layout/LegalPage`
- All sections need `id` and `aria-label` attributes
- All interactive elements need `cursor-pointer` class
- Use `useReducedMotion()` from framer-motion for animations that loop
- Google Fonts loaded via `<link>` in layout.tsx (not next/font — Turbopack bug on Windows)
- `suppressHydrationWarning` on `<body>` tag (Grammarly extension)
- Viewport: Use `min-h-dvh` instead of `min-h-screen` for hero/fullscreen sections (mobile browser chrome issue)
- Mobile padding: `py-16 sm:py-24 px-4 sm:px-6` for sections, not `py-24 px-6`
- Mobile headings: `text-3xl sm:text-4xl md:text-5xl` not `text-4xl md:text-5xl`
- Body has `viewport-fit: cover` (layout.tsx Viewport export) for notched phones

## File Conventions
- Sections in `src/components/sections/`
- UI primitives in `src/components/ui/`
- Layout in `src/components/layout/`
- Data in `src/data/`
- Pages in `src/app/`

## Legal Content
- Company: Go2 Place S.L., NIF B01745405, Orihuela Costa
- Contact: info@rido.bike
- Cookie Policy URL: https://Rido.bike/politica-cookies