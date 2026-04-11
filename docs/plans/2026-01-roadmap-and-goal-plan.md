# Rido — Project Roadmap & Goal Plan

**Date:** 2026-01  
**Status:** Mobile responsive v2 complete, full audit passed  
**Live site:** https://skill-deploy-ev5n5hbgck-codex-agent-deploys.vercel.app  
**GitHub:** https://github.com/ssgolden/rido-website

---

## Current State — ✅ All Verified

### Mobile Responsive (Samsung S25 / 360×780)
- ✅ Hero: `min-h-screen min-h-dvh` fallback chain (100vh→100dvh)
- ✅ Hero: `pt-14 sm:pt-20` (56px/80px) clears fixed navbar
- ✅ Hero: Blur orbs `w-[200px] w-[150px]` on mobile (was 300px/400px)
- ✅ Hero: Responsive heading `text-4xl sm:text-5xl md:text-7xl lg:text-8xl`
- ✅ Hero: Buttons `w-full max-w-[280px] sm:w-auto`
- ✅ Hero: Stats grid `grid-cols-3 gap-3 sm:gap-12`
- ✅ Navbar: Mobile logo `size="sm"` (20px mark), desktop `size="md"` (28px)
- ✅ Navbar: `px-4 py-2.5 sm:px-6 sm:py-3` responsive padding
- ✅ Navbar: Hamburger `p-3 -mr-3` = 46px touch target (≥44px)
- ✅ Body: `min-height: 100vh → 100svh → 100dvh` fallback chain
- ✅ Viewport: `viewport-fit: cover` for notched phones
- ✅ Safe area: `.safe-left` / `.safe-right` utilities with `env(safe-area-inset-*)`
- ✅ Scroll margin: `scroll-mt-16 sm:scroll-mt-24` on all sections
- ✅ All sections: `py-16 sm:py-24 px-4 sm:px-6`
- ✅ All headings: `text-3xl sm:text-4xl md:text-5xl` minimum
- ✅ Download CTA: Responsive blur orb, phone image, buttons
- ✅ Footer: `px-4 sm:px-6 py-12 sm:py-16`
- ✅ About heading: `text-3xl sm:text-4xl md:text-5xl`
- ✅ Accessibility: skip-to-content, aria-labels, focus-visible, prefers-reduced-motion
- ✅ Build passes (5 static routes)

### Desktop & Tablet
- ✅ All breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
- ✅ Active section tracking in Navbar (IntersectionObserver)
- ✅ Framer Motion scroll animations on all 9 sections
- ✅ Interactive pricing calculator
- ✅ Vehicle tab switcher with image gallery

### Legal Pages
- ✅ Privacy Policy (11 sections, GDPR)
- ✅ Terms of Service (16 sections, Go2 Place S.L.)

---

## Goal Plan — Roadmap to Production Quality

### Phase 1: Performance & SEO (Priority: 🔴 High)

| # | Task | Details | Effort |
|---|------|---------|--------|
| 1.1 | **Lighthouse audit** | Run Lighthouse on mobile+desktop, target: P90+, A95+, SEO90+ | 1hr |
| 1.2 | **Image optimization** | Convert JPGs to WebP/AVIF, add proper `sizes` attributes | 2hr |
| 1.3 | **Add `@vercel/analytics`** | Real user metrics (CWV, CLS, LCP) | 30min |
| 1.4 | **Custom 404 page** | `not-found.tsx` matching site design (magenta, glass, RidoLogo) | 1hr |
| 1.5 | **Manifest & PWA icons** | `manifest.json` + PWA icon set for "Add to Home Screen" | 1hr |
| 1.6 | **Sitemap.xml** | Auto-generated sitemap for `/`, `/privacy`, `/terms` | 30min |
| 1.7 | **Robots.txt** | Allow all, link to sitemap | 10min |

### Phase 2: Brand & Visual Polish (Priority: 🟡 Medium)

| # | Task | Details | Effort |
|---|------|---------|--------|
| 2.1 | **E-scooter gallery** | Add 3-4 scooter product images when provided | 1hr |
| 2.2 | **OG & social images** | Create branded OG image (1200×630) for social sharing | 2hr |
| 2.3 | **Favicon set** | Generate .ico, apple-touch-icon, 192/512 PWA icons from SVG | 1hr |
| 2.4 | **Navbar scroll behavior** | Add backdrop-blur only after scroll, smoother transition | 30min |
| 2.5 | **Loading skeleton** | Add Next.js Suspense skeleton for image-heavy sections | 1hr |

### Phase 3: Domain & Deployment (Priority: 🔴 High)

| # | Task | Details | Effort |
|---|------|---------|--------|
| 3.1 | **Custom domain** | Point rido.bike to Vercel deployment | 30min |
| 3.2 | **SSL certificate** | Auto-provisioned by Vercel with custom domain | auto |
| 3.3 | **Environment variables** | Move any hardcoded URLs to `NEXT_PUBLIC_*` env vars | 30min |
| 3.4 | **Vercel project claim** | Use claim URL to take ownership of deployment | 5min |

### Phase 4: Content & i18n (Priority: 🟢 Low)

| # | Task | Details | Effort |
|---|------|---------|--------|
| 4.1 | **Cookie Policy page** | Create `/cookies` page (currently external link) | 2hr |
| 4.2 | **Bilingual ES/EN** | Add Spanish content with i18n routing (`/es/`, `/en/`) | 8hr |
| 4.3 | **Blog section** | SEO content hub for "e-scooter Spain", "micro-mobility" | 16hr |
| 4.4 | **App download links** | Replace `#` links with real App Store / Google Play URLs | 10min |

### Phase 5: Typography & Fonts (Priority: 🟢 Low / Blocked)

| # | Task | Details | Effort |
|---|------|---------|--------|
| 5.1 | **Switch to `next/font`** | Blocked by Turbopack http2 bug on Windows. Switch when Next.js fixes | 1hr |

---

## Immediate Next Steps (Recommended Order)

1. ⭐ **Run Lighthouse audit** (Phase 1.1) — Establish baseline scores
2. ⭐ **Add `@vercel/analytics`** (Phase 1.3) — Start collecting real user data
3. ⭐ **Custom domain setup** (Phase 3.1) — rido.bike on Vercel
4. ⭐ **Create 404 page** (Phase 1.4) — Professional error handling
5. ⭐ **Add manifest & PWA icons** (Phase 1.5) — Mobile web app capability
6. 🔄 **Sitemap + robots.txt** (Phase 1.6 & 1.7) — SEO crawlability

---

## Known Issues & Technical Debt

| Priority | Item | Status | Notes |
|----------|------|--------|-------|
| 🔴 | Vercel deployment | Needs custom domain | rido.bikenot yet pointed |
| 🟡 | `next/font/google` | Blocked | Turbopack http2 bug on Windows |
| 🟡 | No E-scooter gallery | Waiting | Only 1 scooter image available |
| 🟡 | App Store links are `#` | Waiting | Real URLs when app is live |
| 🟢 | Cookie policy is external | Could create `/cookies` | Low priority |
| 🟢 | No blog/SEO content | Future | Content marketing play |