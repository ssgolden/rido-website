# Speed and code-quality plan (October 2026)

From a four-specialist review of rido.bike on 16 October 2026: JS weight and
hydration, assets and delivery, runtime smoothness, and code correctness. The
reviewers measured the static export (`out/`) with Lighthouse, Playwright
traces and bundle analysis. The headline claims below were re-checked against
the code before writing this plan.

## Where we are

| Metric | Today | Target |
|--------|-------|--------|
| First-load JS, home (compressed) | 269 KB (142 KB is the React/Next floor) | ≈ 180 KB |
| Lighthouse mobile, home | 86 (71–90 across runs) | 92–95, stable |
| Lighthouse desktop | 99–100 | keep |
| Simulated mobile LCP, home | 3.5 s | ≈ 2.8 s |
| Real paint of the LCP element | at first paint (Phase F) | keep |
| CLS | 0 | keep |
| Idle main-thread work, top of home (desktop) | 3.3 s per 3 s (busy all the time) | ≈ 0 |
| Slowest interaction at 4× CPU | 376 ms | < 100 ms |
| Repeat visit | every asset re-validated (no cache headers) | static assets cached for a year |

The biggest surprises:

1. A background animation on the hero repaints the full screen 60 times a
   second, forever, even after scrolling away. It is the main cause of slow
   taps and janky scrolling.
2. The animation library is downloaded twice on every page, because of an
   unused logo variant and the error and 404 pages.
3. The unannounced Costa del Sol town names ship to every visitor inside the
   JavaScript.

## Sprint 0: fix first (correctness and privacy) · ~1 day

| # | Issue | Fix |
|---|-------|-----|
| 0.1 | **Unannounced towns leak.** Marbella, San Pedro de Alcántara, Cancelada, Estepona and El Paraíso (with coordinates) are in two public JS files on `/`, `/es`, `/torrevieja` and `/partners`. `Launch.tsx` reads `cities` directly. | Split `src/data/cities.ts`: the public module exports announced towns plus a per-region count only; the full list stays server-only, or out of the repo. Add a CI step that greps `out/` for the unannounced slugs and fails. **Decision needed:** the names are also in the public repo (`cities.ts`, `docs/ASSET-BRIEF.md`). |
| 0.2 | **Sign-up abuse.** No rate limit, honeypot or cap. A script can make our domain send confirmation emails to thousands of addresses, plus notifications to info@, and fill Blobs. `/api/events` accepts unlimited writes. | Hidden honeypot field; Netlify function `rateLimit` config; a daily cap on events. |
| 0.3 | **Email enumeration.** The API answers differently for existing and new emails, and the confirm link skips the token check once confirmed. | One response for both; always check the token; one redirect for every failure. |
| 0.4 | **A failed confirmation email looks like success.** The sign-up stays unconfirmed forever, so it is silently lost. | Return `pending: true` so a re-submit retries, or a clear error. |
| 0.5 | **Store errors return a non-JSON 500.** This breaks the `{ ok, error }` contract the forms rely on. | Wrap both functions in try/catch; reject keys starting with `/`. |

## Sprint 1: quick speed wins (all small, low risk) · ~2 days

Runtime smoothness:

| # | Change | Expected gain |
|---|--------|---------------|
| 1.1 | Remove the infinite hero `background-position` animation (`globals.css` `.hero-gradient`), or move it to a compositor-only `transform`; pause the hero backdrop once it has faded out. | Idle main thread 3.3 s → 0.3 s per 3 s; scroll frames p50 67 → 17 ms; slowest tap 376 → ~56 ms. |
| 1.2 | `ScrollProgress`: framer `scaleX` motion value instead of React state plus `width` on every scroll. | 650 → 0 React re-renders per scroll; ~250 ms fewer forced layouts. |
| 1.3 | Phone mock-up scan line: CSS keyframe instead of an infinite framer animation. | Stops a 60 fps JS loop from page load. |
| 1.4 | Map: give the IntersectionObserver the scroll lane as `root`, so the 500 px pre-load margin actually works; warm the library when idle. Optionally make it tap-to-load on phones. | Removes a ~700 ms freeze mid-scroll on mobile. |
| 1.5 | Pause the map poster's SVG animations when off-screen. | 235 → 0 layouts per 3 s at idle. |
| 1.6 | Hero orbs: radial gradients instead of `blur(100px)` filters; flat glass (no `backdrop-filter`) on the FAQ, phone and cookie surfaces where the blur shows nothing. | Battery and GPU on mid and low-end phones. |

JavaScript and CSS:

| # | Change | Expected gain |
|---|--------|---------------|
| 1.7 | `RidoLogo`: drop the unused `hero` variant and its framer import. | −15 KB on every page (the duplicate framer copy). |
| 1.8 | 404 and error pages: plain `<img>`, `<a>` and inline SVG instead of next/image, Link, lucide and Button. | −14 KB on every page. |
| 1.9 | Load the MapLibre CSS with the map, not statically. | One fewer render-blocking stylesheet (10 KB) on the three main pages; ~110–150 ms off FCP. |
| 1.10 | Lenis: dynamic import (it never runs on phones anyway). | −5 KB on mobile. |
| 1.11 | Cookie banner link: `prefetch={false}`. | Six fewer requests during load. |

Delivery:

| # | Change | Expected gain |
|---|--------|---------------|
| 1.12 | `public/_headers`: `Cache-Control: public, max-age=31536000, immutable` for `/_next/static/*` and fonts; one week for images. | Repeat visits skip ~25–30 round trips. |
| 1.13 | Share image `rido-og.png` 355 KB → JPEG ~52 KB. | Fixes WhatsApp link previews (it drops images over ~300 KB). |
| 1.14 | Vercel Analytics only on Vercel. On Netlify it requests a script that 404s, collects nothing, and the cookie policy says it is active. | One fewer failed request per page view; honest policy. |
| 1.15 | Delete ~450 KB of unused files in `public/` (old lifestyle wordmarks, duplicate OG images, an unused app screenshot). | Smaller deploys; prevents misuse. |

**Measured by the JS reviewer** on an experimental copy with 1.7–1.10 plus
async animation features (2.6): home JS 269 → 217 KB; simulated LCP 3.5 →
3.2 s.

## Sprint 2: medium fixes · ~3–4 days

| # | Area | Change |
|---|------|--------|
| 2.1 | Bug | **Lenis stops short of the page bottom** after the FAQ opens or "Show all" is clicked (it watches the fixed-height scroll lane, not the content). Point it at an inner content element, or call `lenis.resize()` from a ResizeObserver; run its frame loop only while scrolling. |
| 2.2 | GDPR | **Consent.** Accepting cookies does not start analytics until a reload (same-tab `storage` events never fire), and there is no way to withdraw consent. Add a small consent store with events, and a "Cookie settings" link in the footer that reopens the banner. Also fix: the hero form's view event fires before the visitor can consent, so hero views are under-counted. |
| 2.3 | Perceived speed | Hero headline, badge and form are `opacity: 0` in the HTML until JavaScript runs (31 hidden nodes). Replace with CSS entrances (transform only, reduced-motion safe); this also removes framer from the hero. |
| 2.4 | Accessibility | Waitlist success state: keep a persistent live region, move focus to the result, and give the loading button an accessible name ("Sending…"). |
| 2.5 | Form | One shared email regex for the client and the functions; map a 422 to the "invalid email" message instead of the generic error. |
| 2.6 | JS | Load framer's animation features asynchronously (`LazyMotion features={() => import(...)}`), and drop the no-op `layoutId` on the vehicle tabs. −10 KB on first load. |
| 2.7 | JS | `cn()`: plain `clsx` everywhere except the few components that rely on tailwind-merge overrides (audit first). −8 KB. |
| 2.8 | Images | Turn image optimisation back on for Netlify with a custom loader for `/.netlify/images` (AVIF/WebP, real `srcset`), keeping `unoptimized` for the GitHub Pages mirror. Thumbnails fetch 160 px instead of full renders: −280 KB on the fleet section; −13 KB on the LCP image; logo 11 → 4 KB. |
| 2.9 | SEO | JSON-LD: only Organization, WebSite and Brand in the root layout; FAQ, HowTo, Product and breadcrumbs only on the pages that show them (`/torrevieja` currently has two FAQPage blocks; legal pages carry the homepage FAQ). −20 KB HTML on non-home pages, and markup that matches visible content. |
| 2.10 | SEO | Move the homepage `alternates` out of the English root layout (every new English page silently canonicalises to `/`). Make the 404 a valid page (`global-not-found`). Translate the Spanish error page. |
| 2.11 | UX | Close the mobile menu when the viewport passes 768 px (otherwise the page stays unscrollable after a rotation). |
| 2.12 | Map | Fetch the map style in parallel with the library and recolour it before creating the map; preconnect to the tile host. ~200–500 ms sooner. |
| 2.13 | Fonts | Add a Roboto-metric fallback (Android has no Arial, so font-swap CLS returns there); emit each font preload once; optionally trim the variable weight range. |
| 2.14 | Security | CSP: drop `'unsafe-eval'`, add `base-uri`, `object-src 'none'`, `form-action`; remove `X-XSS-Protection`. |
| 2.15 | Privacy | Stop saving the visitor's email in `localStorage` (only the excluded admin page read it, and it is not disclosed). |

## Sprint 3: the structural win · ~1–1.5 weeks

**Move static sections to server components with small client "islands", and
replace scroll reveals and scroll-linked effects with CSS.**

- **Server components:** Safety, Launch (map as the island), DownloadCTA (form
  as the island), SectionHeader and Partners.
- **Reveals:** one shared IntersectionObserver for all of them, instead of 20
  framer `useInView` wrappers.
- **Scroll-linked effects:** the hero ride-out, the fleet ride-in and the How
  it works rail use CSS `animation-timeline: view()/scroll()`, with today's
  static fallback where unsupported. The How it works active step is driven by
  an IntersectionObserver.
- **FAQ:** native `<details name="faq">`.
- **Menu, back-to-top and cookie banner:** CSS transitions.
- **Copy:** each page ships only its own language (today both EN and ES copy
  go to every visitor).

**Expected:** home first-load JS ≈ 175–185 KB; a stable 92–95 mobile score; less
hydration work. **Risks:** hydration parity (markup must not branch on
reduced motion) and the reduced-motion rules. Older Safari and Firefox get the
static version of the scroll effects.

## CI and process

- **Server readiness:** replace `next start & sleep 8` with a readiness wait.
- **Test what production serves:** run the accessibility and visual QA
  against the static export, since that is what Netlify serves.
- **Function tests:** add `node --test` tests for the waitlist and events
  handlers (pure functions with a store double).
- **Town-leak check:** add the grep from 0.1.
- **Deploy gate:** today `deploy.yml` publishes direct pushes to master
  without lint or quality gates. Gate it, or protect master.
- **Build race:** `scripts/build.mjs` moves folders inside `src/` during
  export builds, so a concurrent lint, tsc or build sees a mutated tree.
  Build from a temporary copy instead.
- **Clean up:** unused dependencies (`@fontsource-variable/*`, whose files are
  already copied to `public/fonts`, and `tw-animate-css`), dead code (`Card`,
  `useCountUp`, `activeCityCount`) and stale comments (`public/_headers`,
  AGENTS.md on fonts).

## Decisions needed from Stephen

1. **Unannounced town names in the public repo.** The site fix removes them
   from what visitors download. The names are also in the public source
   (`cities.ts`, `docs/ASSET-BRIEF.md`). Make the repo private, move the list
   out of the repo, or accept it?
2. **Hero background animation.** Remove it (barely visible, biggest cost), or
   keep a cheaper version?
3. **Map on phones.** Load automatically (with the fixes), or show the static
   map with a "View map" button, so low-end phones never pay 700 ms?
4. **Confirmation link.** Email security scanners (e.g. Outlook) open links
   and confirm automatically. Add a "Confirm" button on the landing page
   (stronger consent proof), or keep one-click?
5. **Vercel Analytics.** Drop it in favour of the first-party counts, or keep
   it for the optional Vercel host?

## Order and size

| Sprint | Contents | Effort |
|--------|----------|--------|
| 0 | Correctness and privacy | ~1 day |
| 1 | Quick speed wins | ~2 days, one PR per group so each gain is measurable |
| 2 | Medium fixes | ~3–4 days |
| 3 | Server-component and CSS refactor | ~1–1.5 weeks |
| — | CI items | alongside, starting with the town-leak check and readiness wait |

Every PR keeps the existing gates: lint, tsc, both builds, axe, visual QA and
the Lighthouse budgets. Raise the CI performance floors after Sprint 1 and
again after Sprint 3, once the runner numbers move.
