# Plan: Rido Website Improvements & Custom Domain

**Generated**: 2026-04-14  
**Project**: Rido - Shared E-Scooters & E-Bikes in Spain  
**Goal**: Fix all lint errors, add custom domain support (rido.bike), improve SEO/accessibility

---

## Overview

This plan addresses code quality issues (ESLint errors/warnings) and prepares the site for custom domain deployment at rido.bike while expanding SEO and accessibility enhancements.

## Prerequisites
- Node.js 20+ (already in CI)
- GitHub repo: https://github.com/ssgolden/rido-website
- Custom domain: rido.bike (needs DNS configuration)

---

## Dependency Graph

```
T1 ──┬── T2 ──┬── T4 ──┐
     │        │        │
     │        │        └── T7 (JSON-LD)
     │        │
     T3 ──────┴── T5 ── T6 ──┐
                    │        │
                    │        └── T9 (test)
                    │
              T8 (DNS docs)
```

---

## Tasks

### T1: Fix RidoLogo.tsx - Components Created During Render (CRITICAL)
- **depends_on**: []
- **location**: `src/components/ui/RidoLogo.tsx`
- **description**: 
  Move `CheckMark` and `WordMark` components outside the render function to fix ESLint error about creating components during render.
  - Create a variants map at the top level
  - Use conditional rendering with the map
- **validation**: ESLint passes with no errors
- **status**: Not Completed
- **log**: 
- **files edited/created**: `src/components/ui/RidoLogo.tsx`

### T2: Fix Hero.tsx - Unused Variable
- **depends_on**: []
- **location**: `src/components/sections/Hero.tsx`
- **description**: 
  Attach the `ref` from `useCountUp` to the stat container or remove the unused variable.
  - Option 1: Attach ref to the StaggerItem wrapping each stat
  - Option 2: Remove unused ref (lint)
- **validation**: ESLint warning resolved
- **status**: Not Completed
- **log**: 
- **files edited/created**: `src/components/sections/Hero.tsx`

### T3: Upgrade Font Loading to next/font
- **depends_on**: []
- **location**: `src/app/layout.tsx`
- **description**: 
  Replace `<link>` tag for Google Fonts with `next/font/google` to fix ESLint warning and improve performance.
  - Import `Inter` from `next/font/google`
  - Create font instance with `display: "swap"`
  - Apply to body using className
  - Remove HTML `<link>` tag
- **validation**: Page renders correctly, no ESLint warning
- **status**: Not Completed
- **log**: 
- **files edited/created**: `src/app/layout.tsx`

### T4: Fix Footer Broken Links
- **depends_on**: [T2, T3]
- **location**: `src/components/layout/Footer.tsx`
- **description**: 
  Fix broken/external links in footer that currently point to `#` or external 404 pages.
  - Create `/careers` page with placeholder content
  - Fix Cookie Policy link (currently points to non-existent external URL)
  - Add proper external link handling (rel="noopener noreferrer")
- **validation**: All footer links resolve correctly
- **status**: Not Completed
- **log**: 
- **files edited/created**: `src/components/layout/Footer.tsx`, `src/app/careers/page.tsx`

### T5: Add Custom Domain Configuration (rido.bike)
- **depends_on**: [T3]
- **location**: `next.config.ts`, `.github/workflows/deploy.yml`
- **description**: 
  Configure Next.js for rido.bike custom domain deployment.
  - Update `next.config.ts`: Remove `basePath` conditional entirely (rido.bike needs no basePath)
  - Set up environment-based configuration for GitHub Pages vs rido.bike
  - Update GitHub Actions for custom domain deployment
  - Add `vercel.json` backup config
- **validation**: Site works at rido.bike with correct URL routing
- **status**: Not Completed
- **log**: 
- **files edited/created**: `next.config.ts`, `.github/workflows/deploy.yml`, `vercel.json`

### T6: Add JSON-LD Structured Data
- **depends_on**: [T4]
- **location**: `src/app/layout.tsx`
- **description**: 
  Add LocalBusiness schema markup for SEO to improve search engine understanding.
  - Create JSON-LD script with company info, geo-coordinates, service areas
  - Include business type, contact info, operating hours
- **validation**: Google Rich Results Test passes for LocalBusiness
- **status**: Not Completed
- **log**: 
- **files edited/created**: `src/app/layout.tsx`

### T7: Add Error Boundary
- **depends_on**: [T6]
- **location**: `src/app/error.tsx`, `src/app/global-error.tsx`
- **description**: 
  Add Next.js error boundaries for graceful failure handling.
  - `error.tsx` for route-level errors
  - `global-error.tsx` for app-level errors
  - Styled consistently with brand
- **validation**: Error pages display correctly when errors occur
- **status**: Not Completed
- **log**: 
- **files edited/created**: `src/app/error.tsx`, `src/app/global-error.tsx`

### T8: Create DNS Configuration Documentation
- **depends_on**: [T5]
- **location**: `docs/DNS-SETUP.md`
- **description**: 
  Document DNS configuration for rido.bike with step-by-step instructions for:
  - GitHub Pages custom domain setup
  - DNS records needed (A records or CNAME)
  - SSL/HTTPS configuration
- **validation**: User can follow docs to configure DNS
- **status**: Not Completed
- **log**: 
- **files edited/created**: `docs/DNS-SETUP.md`

### T9: Add Mobile Menu Scroll Lock
- **depends_on**: []
- **location**: `src/components/layout/Navbar.tsx`
- **description**: 
  Prevent body scroll when mobile menu is open for better UX.
  - Use `overflow-hidden` on body when menu open
  - Clean up on menu close
- **validation**: Body cannot scroll when mobile menu is open
- **status**: Not Completed
- **log**: 
- **files edited/created**: `src/components/layout/Navbar.tsx`

---

## Parallel Execution Groups

| Wave | Tasks | Can Start When | Dependencies |
|------|-------|----------------|--------------|
| 1 | T1, T2, T3, T9 | Immediately | None |
| 2 | T4 | Wave 1 complete | T2, T3 |
| 3 | T5 | Wave 1 complete | T3 |
| 4 | T6, T8 | T4, T5 complete | T4, T5 |
| 5 | T7 | T6 complete | T6 |
| Final | Verify | All complete | All |

---

## Testing Strategy

1. **ESLint**: `npm run lint` passes with 0 errors
2. **Build**: `npm run build` completes successfully
3. **TypeScript**: `npx tsc --noEmit` passes
4. **Links**: All internal links navigate correctly
5. **Mobile**: Menu scroll lock works on Samsung S25 viewport
6. **Domain**: Site loads at rido.bike with correct asset paths
7. **Error boundaries**: Error pages trigger correctly with invalid routes

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| BasePath removal breaks GitHub Pages | Maintain `NEXT_OUTPUT=export` build path as fallback |
| Custom domain DNS propagation delay | Provide clear documentation; GitHub Pages remains fallback |
| Font change causes FOUT | Use `display: "swap"` and fallback font |

---

## Success Criteria

- [ ] 0 ESLint errors
- [ ] Custom domain rido.bike configured
- [ ] All footer links functional
- [ ] JSON-LD schema validates in Search Console
- [ ] Error boundaries prevent white-screen failures
- [ ] Mobile scroll lock implemented
- [ ] DNS documentation provided