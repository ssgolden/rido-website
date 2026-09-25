# Rido website — Improvement & Upgrade Plan

**Date:** 25 September 2026 · **Baseline:** `master` @ `d9190ce` · **Branch:** `claude/review-improvements-jucof8`

This plan is the output of a six-discipline review of the live codebase (runtime
correctness, localisation & content, technical SEO, accessibility, performance,
security & delivery). Every finding below was verified against the source, the
emitted static export in `out/`, or a runnable probe before it was accepted.
Findings that could not be verified were dropped. Where a fix was small, safe
and unambiguous it has already been applied (Part 1). Everything that needs a
product decision, a design pass, or real infrastructure is in Part 2 with an
owner discipline, an effort estimate and an acceptance test.

---

## Part 1 — What was fixed in this pass

All fixes are on the branch, verified with `tsc`, `eslint`, both build
flavours (`npm run build` and `NEXT_OUTPUT=export CUSTOM_DOMAIN=true npm run
build`) and the repo's axe gate (`scripts/a11y-audit.mjs`), which now passes
on `/`, `/es`, `/privacy`, `/politica-cookies`, `/careers` and `/coming-soon`.

### Data loss and security (P0)

| # | Finding | Fix |
|---|---|---|
| 1 | **Every waitlist sign-up on rido.bike was discarded.** `deploy.yml` never passed `NEXT_PUBLIC_WAITLIST_URL`, so the exported form kept emails only in the visitor's own `localStorage` while showing "You're on the list". | Workflows read the repository variable; `build.mjs` warns loudly when it is missing. **Action for you:** set the variable in GitHub → Settings → Secrets and variables → Actions → Variables (value: the Apps Script `/exec` URL), then redeploy. |
| 2 | **Next.js 16.2.3 carried published proxy-bypass and image-optimizer RCE advisories** that neutralised the Vercel password gate. | Upgraded to 16.3.6. Production audit now reports only `maplibre-gl` (see Part 2). |
| 3 | **Google Sheets formula injection** through the Apps Script receiver (`userAgent`/`locale` were written raw; `=IMPORTDATA(...)` would exfiltrate the sheet). | Cells are text-escaped, `locale` is whitelisted, user agent is no longer collected, writes are locked and throttled, dedupe compares the email column only. |
| 4 | `/api/waitlist` (server host) had no validation, no rate limit and logged raw emails. | zod schema, same-origin check, per-IP token bucket, hashed log lines. |
| 5 | No security headers on any host (`public/_headers` is Netlify syntax; `next.config.ts` had no `headers()`). | `headers()` with CSP, HSTS, frame-ancestors, nosniff for server builds. GitHub Pages cannot send headers (documented). |

### Correctness (P1)

| # | Finding | Fix |
|---|---|---|
| 6 | **Reduced-motion visitors hydrated against a different DOM.** framer's `useReducedMotion()` is `null` on the server and `true` on the first client render; seven components returned a different tree. | New `usePrefersReducedMotion()` (useSyncExternalStore, hydration-safe). `MotionConfig reducedMotion="user"` covers the rest. |
| 7 | **Accepting cookies never started analytics** in that tab (the loader listened only to the cross-tab `storage` event). | Shared consent module with a same-tab event and a versioned record. |
| 8 | `/es` shipped `<html lang="en">`. | Post-export patch sets `lang="es"` on Spanish pages; the client already patched it after hydration. Proper fix is in Part 2. |
| 9 | Root-layout `canonical` + hreflang leaked to every page: `/waitlist-admin` and `/motion-lab` declared canonical = homepage; legal pages carried the homepage hreflang pair; homepages had duplicate hreflang tags. | Alternates are per page; manual `<link>`s removed. |
| 10 | `/waitlist-admin` was indexable, titled as the homepage and reachable via robots. | Server page with `noindex`; `robots.txt` disallows it and `/motion-lab`; `/coming-soon` is `noindex` with canonical = homepage. |
| 11 | Waitlist success shown on `{ok:false,error:"invalid"}` and on unparseable bodies; a blocked `localStorage` failed the whole submit. | Success only on explicit `ok:true`; storage is a best-effort fallback. |
| 12 | Hero stat values were hidden from screen readers (`aria-label` silently dropped by `StaggerItem`). | Props forwarded. |
| 13 | Section headings had no whitespace between words in the DOM (`HowItWorks`, `ChooseYourRide`) for crawlers and copy/paste. | Real text nodes between word spans. |
| 14 | Hero orb keyframes were declared inside `@theme` and never emitted by Tailwind, so the orbs never animated. | Moved out of `@theme`. |
| 15 | City landing pages would have published fares (`€1.00 unlock + €0.35/min`, priced `AggregateOffer`) the moment `citiesAnnounced` flips. | All fare strings removed; `Offer` without price. |
| 16 | Placeholder city route exported an empty error shell with no `lang`. | Renders the branded 404. |

### Honesty and crawler surfaces (P1)

- `llms.txt` / `llms-full.txt` still advertised fares, a 5-star safety rating,
  projected CO2 tonnage, "1,200+ people on the waitlist" and the wrong cookie
  URL. Rewritten to match the site.
- `manifest.json` listed App Store / Play Store URLs that do not exist.
- Structured data asserted a `JobPosting` with no job, a sitelinks
  `SearchAction` with no search, a `SoftwareApplication` for an unreleased app
  and a carbon-neutral "credential". All removed; JSON-LD is now page-scoped
  and Spanish on `/es`.
- Careers claimed Rido "operates across Spain's most vibrant cities". Footer,
  About and noscript copy scoped to the Costa del Sol. Public footer link to
  the `/motion-lab` demo (which shows invented counters) removed.
- Terms spelled the company two ways (29 × "Go2Place"), did not cover e-bikes
  and contradicted the DGT helmet rule; Privacy contradicted the Cookie Policy
  and described none of the website's real processing. Both corrected.
- Helmet and licence statements now agree across Safety, FAQ, HowItWorks,
  Terms and `llms*.txt` (DGT rule, 1 October 2026).

### Accessibility (P1/P2)

Keyboard-focusable, labelled mobile carousels; contrast fixes on HowItWorks
inactive steps, the Pricing pill, the magenta-light badge, placeholders, input
borders and 404 links; `aria-pressed`/`aria-current` on tabs, thumbnails and
filters; skip-link targets on 404 and `/motion-lab`; bilingual skip link and
back-to-top; cookie banner with Escape-to-decline, a solid surface and region
semantics; Scene3D and the command menu honour reduced motion and Escape;
fully localised phone mock-up on `/es`.

### Performance (P1)

Hero H1, subheadline and CTAs are painted at first frame (CSS transform-only
entrance) instead of `opacity:0` until hydration; the decorative hero photo and
a below-fold vehicle image are no longer preloaded; 70 KB of MapLibre CSS no
longer render-blocks every page; Lenis loads only where it runs; legal and
language links no longer prefetch ~164 KB of route payloads; the dead
`LazyMotion` wrapper and the unused root `Toaster` are gone; blur filters and
permanent `will-change` removed from headings.

---

## Part 2 — Upgrade roadmap

Effort: **S** < ½ day · **M** 1–2 days · **L** 3–5 days · **XL** > 1 week.
Owner: the discipline best placed to lead; everything ships through the same
PR gates.

### Phase 0 — Operational actions (this week, no code)

| # | Action | Owner | Effort |
|---|---|---|---|
| 0.1 | Set the `NEXT_PUBLIC_WAITLIST_URL` repository variable and redeploy; confirm a test sign-up lands in the sheet. | Founder | S |
| 0.2 | Enable branch protection on `master`: require the `build`, `export` and `quality` checks and one review; block direct pushes. Today the CI gates gate nothing. | Founder | S |
| 0.3 | Decide the pre-launch promises that appear in copy: "Your first ride is on us", "Cheaper than a taxi" (while fares are hidden), "DGT certified" (certificate numbers exist?), Terms fee amounts (€2,000 / €500 / €50 / €30). Keep, reword or defer like the fares. | Founder + Legal | S |
| 0.4 | Rotate anything that was ever pasted into a screenshot or chat (Apps Script deployment, gate password). | Founder | S |

### Phase 1 — Launch blockers (1–2 weeks)

| # | Upgrade | Why | Owner | Effort | Acceptance |
|---|---|---|---|---|---|
| 1.1 | **Spanish legal tier**: `/es/privacidad`, `/es/terminos`, `/es/politica-cookies`, bilingual 404 and error pages, language switcher aware of them. | A Spanish consumer service must present terms and privacy in Castilian (LGDCU art. 60, LSSI art. 10, RGPD art. 12). Today an ES visitor lands in English with no way back. | Content + Frontend | L | Every ES page links to ES legal pages; hreflang pairs complete; axe clean. |
| 1.2 | **Proper `<html lang>` per locale** via route groups: `app/(en)/layout.tsx` and `app/es/layout.tsx` as two root layouts sharing a `SiteShell` component, plus `global-not-found` (experimental flag) for unmatched URLs. Removes the post-build patch. | Correct SSR language on both hosts, not only the static export. | Frontend | M | `out/es.html` and the Vercel render both emit `lang="es"` without `build.mjs` rewriting. |
| 1.3 | **Image pipeline for static export**: pre-generate AVIF + WebP at 2–3 widths per asset with a small `sharp` script, serve via `<picture>`/manual `srcSet` (the export has no optimizer, so `sizes` is a no-op today). Inline the nav logo as SVG. | ~300 KB per homepage visit; 64 px thumbnails currently download 240 KB of full-size JPEGs. | Frontend | M | Homepage image bytes < 120 KB on mobile; Lighthouse "modern formats" and "properly sized" pass. |
| 1.4 | **Mobile LCP under budget**: after the hero fix, re-measure; then remove the remaining `opacity:0` SSR reveals (95 elements) by moving `ScrollReveal`/`SectionHeading` to a CSS class toggled by one shared IntersectionObserver, with framer kept for interactive pieces only. | Mobile Lighthouse was 82 (LCP 4.7 s) against a ≥95 / <1.8 s budget; ~55 observers and ~100 motion components drive 0.9–1.7 s of blocking time on a 4× CPU. | Frontend + Perf | L | Lighthouse mobile ≥ 95 on `/` and `/es`; LCP < 1.8 s; TBT < 200 ms on the CI runner; `lighthouserc.json` performance switched from `warn` to `error`. |
| 1.5 | **Analytics that works on the live host.** `@vercel/analytics` requests `/_vercel/insights/*`, which 404s on GitHub Pages, so the site is unmeasured. Options: host-aware loader (only on Vercel), or a cookieless provider that works from static hosting (e.g. Plausible/Umami self-hosted), consent-gated as now. Add a "Cookie settings" footer control that clears the consent record. | Measurement is currently zero on production. | Frontend + Privacy | M | Consent → first pageview recorded on rido.bike; withdrawal possible without clearing site data. |
| 1.6 | **MapLibre upgrade** to `^6.11.2` (critical sanitizer advisory) before `citiesAnnounced` flips; re-verify the brand restyle and markers; add OpenFreeMap as a recipient in the Cookie Policy (tile requests carry the visitor's IP). | Only remaining production vulnerability; map is dormant today. | Frontend | M | `npm audit --omit=dev` clean; map renders in both locales; policy updated. |

### Phase 2 — Robustness and delivery (2–4 weeks)

| # | Upgrade | Why | Owner | Effort | Acceptance |
|---|---|---|---|---|---|
| 2.1 | **Test suite**: Playwright e2e for the two waitlist forms (success, invalid, backend down), consent → analytics handoff, language switch, 404; unit tests for `schema.ts` (no price/rating fields, valid JSON-LD per locale), `build.mjs` lang patch, and a "content honesty" lint that greps the export for banned strings (€ amounts, "rating", "across Spain", fake counts). | Every regression found in this review would have been caught by one of these. | QA + Frontend | L | CI runs the suite on PRs; honesty lint fails on a seeded violation. |
| 2.2 | **Decide the basePath sub-path mode.** Fonts in CSS `url()`, metadata icons and `error.tsx` all break under `/rido-website`; production uses the custom domain. Either delete the mode and the `withBase()` machinery, or make fonts/metadata basePath-aware. | Half-supported modes rot. | Frontend | S–M | One documented deployment mode; AGENTS.md updated. |
| 2.3 | **Gate hardening on Vercel**: HMAC-signed cookie with a separate `GATE_SIGNING_SECRET`, issued-at and expiry; explicit asset allow-list in the proxy matcher instead of "any path with a dot"; WAF rate-limit on `/api/gate`; or replace with Vercel Password Protection. | Cookie is an unkeyed hash of the password; `llms-full.txt` and RSC payloads are readable while "gated". | Security | M | Cookie invalid after rotation/expiry; probing `/api/gate` is throttled. |
| 2.4 | **Consent banner as a true modal or a reserved-space region** (focus not obscured, WCAG 2.2 2.4.11); cookie banner announced to screen readers; mobile menu `inert`s the page. | Remaining AA gaps. | Frontend + a11y | M | axe + manual keyboard walk clean at 390 px and 1440 px. |
| 2.5 | **Lean layout for legal pages**: marketing providers (Lenis, framer, cookie banner motion) in a `(marketing)` route group; legal pages ship < 100 KB gz JS. | `/privacy` currently ships 277 KB gz of interactive shell for zero interactivity. | Frontend | M | Legal pages < 100 KB gz JS; Lighthouse ≥ 98. |
| 2.6 | **Dependency hygiene**: pin GitHub Actions to SHAs, add Dependabot, remove `tailwind-merge` where `clsx` suffices, drop `tw-animate-css` if only `/motion-lab` uses it, add a modern `browserslist` to shed legacy polyfills, fix `scripts/google-apis/ga4-query.mjs` (imports a package not in `package.json`). | Supply-chain and bundle drift. | DevOps | S–M | `npm audit` clean incl. dev; actions pinned; bundle −20 KB gz. |
| 2.7 | **Motion Lab**: either move `/motion-lab` behind the gate / out of the production export, or strip its invented counters ("1,247+ riders", "€14.99"). | Public, noindex page with fabricated numbers contradicts the content rules. | Design + Frontend | S | No fabricated figures reachable on production. |

### Phase 3 — Growth and quality (post-launch)

| # | Upgrade | Why | Owner | Effort |
|---|---|---|---|---|
| 3.1 | Waitlist proof without invented avatars: show the real count only, or real opted-in avatars; reserve layout so the count never shifts the hero. | Today five generic initials imply real people. | Design | S |
| 3.2 | Announcement-day runbook: flip `citiesAnnounced`, restore `llms*.txt` city sections (they are outside the flag), verify city pages, sitemap, JSON-LD, map, and run the honesty lint. | The flag cannot reach static files. | Content + Frontend | S |
| 3.3 | Per-city content beyond the template (parking zones, local rules, photos) once towns are public; `hreflang` and titles per vehicle mix already handled. | SEO for "patinete Marbella" style queries. | Content + SEO | L |
| 3.4 | Hero compositing budget on mobile: cap orb size/blur, bake grain into the image, drop the soft-light layer; `backdrop-filter` only from `md:`. | 7 fps delta at 4× CPU. | Design + Perf | M |
| 3.5 | Split locale copy per bundle (every component inlines both `en` and `es` objects) once the site grows past two locales. | HTML/JS weight. | Frontend | M |
| 3.6 | Semantic lists for milestones, features, trust signals; heading order on legal highlights; `aria-describedby` on form errors. | WCAG 1.3.1 best practice. | a11y | S |

---

## Part 3 — Engineering practices to adopt

1. **Every claim has a source.** Numbers, ratings, certifications and store
   links appear only when a real artefact exists; the honesty lint (2.1) makes
   this mechanical.
2. **One reduced-motion hook.** `usePrefersReducedMotion()` everywhere; never
   framer's `useReducedMotion()` in a component that changes its tree.
3. **Metadata and JSON-LD are page-owned.** The root layout carries only
   site-wide nodes and never `canonical`/`alternates`.
4. **Both build flavours plus the axe gate before every push**, as the
   `premium-web` skill already states; add the Playwright suite (2.1) to the
   same command.
5. **Static files are part of the release**: `llms*.txt`, `manifest.json`,
   `public/vendor/*` and `public/fonts/*` are reviewed with every content
   change, not only the React tree.

---

## Appendix — Verification record for this pass

| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `eslint` | clean |
| `npm run build` (server) | 17 routes, headers() registered |
| `NEXT_OUTPUT=export CUSTOM_DOMAIN=true npm run build` | 15 pages, `lang="es"` patched on 2 |
| `scripts/a11y-audit.mjs` on the export | 6/6 pages pass, 0 advisories |
| `npm audit --omit=dev` | 1 critical (`maplibre-gl`, major upgrade → Phase 1.6) |
| Emitted HTML spot checks | canonical/hreflang per page, `noindex` on admin/dev/gate pages, hero text visible at SSR, no hidden Suspense segments, headings with word spacing, JSON-LD page-scoped and Spanish on `/es`, no MapLibre CSS on non-map pages, hero-orb keyframes present |
