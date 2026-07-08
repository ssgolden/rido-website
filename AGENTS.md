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
- Use `useCountUp()` from `@/hooks/useCountUp` for animated number counters
- Fonts are self-hosted via `@fontsource-variable` packages imported in layout.tsx — zero external font requests (still not next/font — Turbopack bug on Windows)
- Display font is "Sora Variable" via `--font-display`; body font is "Inter Variable" via `--font-sans`
- `suppressHydrationWarning` on `<body>` tag (Grammarly extension)
- Viewport: Use `min-h-dvh` instead of `min-h-screen` for hero/fullscreen sections (mobile browser chrome issue)
- Mobile padding: `py-16 sm:py-24 px-4 sm:px-6` for sections, not `py-24 px-6`
- Mobile headings: `text-3xl sm:text-4xl md:text-5xl` not `text-4xl md:text-5xl`
- Body has `viewport-fit: cover` (layout.tsx Viewport export) for notched phones
- Hero background image opacity is 12% (not 7%)
- App screenshot images removed from HowItWorks and DownloadCTA sections
- GitHub Pages deployment uses `basePath: "/rido-website"` with `NEXT_OUTPUT=export` env var
- Use `withBase()` from `@/lib/basePath` for non-Link asset paths (images, favicons, manifest)
- **CRITICAL:** Call `withBase()` at RENDER TIME (inside components), NOT in data files. Data files are initialized once and shared between SSR and client, but `basePath` differs between server and browser. Calling `withBase()` at data init time produces wrong URLs client-side.
- `withBase()` uses `getBasePath()` which detects basePath at runtime: `process.env.NEXT_OUTPUT` for SSR, `window.location.pathname.startsWith("/rido-website")` for client
- For CSS background images, use `style={{ backgroundImage: url(withBase('/images/...')) }}` — Tailwind `bg-\[url()\]` class cannot use `withBase()` at runtime
- Use `next/link` for internal navigation (auto-prefixes basePath, don't use withBase())

## Build & Deploy Invariants
- Live site (rido.bike) deploys via GitHub Pages static export (`.github/workflows/deploy.yml`, master pushes). `npm run build` runs `scripts/build.mjs`: a plain `next build` for server hosts, and an API-route-excluding build when `NEXT_OUTPUT=export` (route handlers cannot be statically exported).
- GitHub Pages CANNOT serve custom response headers — `public/_headers` (and any `headers()` in next.config.ts) only take effect on a server host (Vercel/Netlify).
- Do NOT enable next-intl locale routing until an `app/[locale]/` structure exists — otherwise every page 404s (rewrites target nonexistent locale paths).
- Keep `package-lock.json` in sync with package.json (`npm ci --dry-run` must pass) — the deploy runs `npm ci` and fails otherwise.
- Pre-launch gate: `src/proxy.ts` redirects everything to /coming-soon when the `GATE_PASSWORD` env var is set (Vercel only — the password lives in Vercel project settings, NEVER in this public repo). Unset the var to launch. GitHub Pages export ignores the proxy; API routes are excluded from export by `scripts/build.mjs`.

## File Conventions
- Sections in `src/components/sections/`
- UI primitives in `src/components/ui/`
- Hooks in `src/hooks/`
- Layout in `src/components/layout/`
- Data in `src/data/`
- Pages in `src/app/`

## Legal Content
- Company: Go2 Place S.L., NIF B01745405, Orihuela Costa
- Contact: info@rido.bike
- Cookie Policy URL: https://Rido.bike/politica-cookies