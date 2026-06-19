# Rido SEO & AI Ranking Improvement Plan

## Current State Audit

### What's good
- ✅ Next.js 16 static export, 7 routes prerendered
- ✅ JSON-LD structured data: `LocalBusiness`, `FAQPage`
- ✅ Meta tags: OG, Twitter Card, canonical, hreflang
- ✅ Sitemap.xml + robots.txt (dynamic routes)
- ✅ Semantic HTML: `<section>`, `aria-label`, skip link, noscript fallback
- ✅ Lint: 0 errors. Build: clean.
- ✅ Cookie consent gating analytics (GDPR)

### What's missing / broken
- ❌ No `llms.txt` file (new standard for AI/LLM crawlers)
- ❌ No `/.well-known/ai-plugin.json` or agent-friendly endpoints
- ❌ Manifest description still says "Download the app, scan, and ride" (stale)
- ❌ Robots.txt still disallows `/api/` which no longer exists (harmless but sloppy)
- ❌ No `Organization` schema (only `LocalBusiness` — missing parent org info)
- ❌ No `Service` or `Product` schema for vehicles (currently only in `OfferCatalog`)
- ❌ No `BreadcrumbList` on main page (only on careers)
- ❌ No `HowTo` schema for the How It Works section
- ❌ No `SoftwareApplication` schema for the app itself
- ❌ Social links (`instagram.com/rido`, etc.) may not exist — dead links hurt trust
- ❌ No `<link rel="preload">` for hero image (LCP optimization)
- ❌ No `AI-Optimized` content blocks — content is JS-rendered, not in initial HTML for crawlers
- ❌ Sitemap missing `lastmod` timestamps with real dates (uses `new Date()` = build time)
- ❌ No Google Search Console verification file
- ❌ No Bing Webmaster verification
- ❌ Images not served as WebP/AVIF (Next.js image optimization disabled on export)
- ❌ No `<picture>` element with responsive srcset for OG image
- ❌ No `GeoCoordinates` in LocalBusiness schema (lat/lng exist in cities data but not in schema)
- ❌ No `areaServed` with `GeoCircle` for service radius
- ❌ FAQ schema doesn't include all FAQ items (only renders on homepage)
- ❌ No `Review` or `AggregateRating` schema (even placeholder for future)
- ❌ No `PriceRange` in LocalBusiness (already have `€` but could be more specific)
- ❌ No `OpeningHoursSpecification` (pre-launch, but can specify "by appointment")
- ❌ No `sameAs` links to real profiles (currently pointing to placeholder URLs)
- ❌ No `potentialAction` (SearchAction or ReserveAction) in LocalBusiness

---

## Phase 1: AI Crawler Optimization (NEW — 2025-2026 standard)

**Goal: Make Rido easily indexable by ChatGPT, Claude, Perplexity, Google AI Overviews, etc.**

### 1.1 Add `llms.txt` file
Jeremy Howard's proposed standard (llmstxt.org). Lives at `/llms.txt` at the root.
Provides a markdown summary of the site that LLMs can read at inference time.

```
# Rido

> Rido is a shared e-scooter and e-bike micro-mobility service launching on the Costa del Sol, Spain. Zero-emission shared vehicles available via a mobile app.

## About
Rido is operated by Go2 Place S.L. (NIF B01745405), based in Orihuela Costa, Spain. We provide shared e-scooters and e-bikes across 5 cities on the Costa del Sol: Marbella, San Pedro de Alcántara, Cancelada, Estepona, and El Paraíso.

## How It Works
1. Join the waitlist at https://rido.bike#download
2. Download the Rido app (launching soon)
3. Scan the QR code on any Rido vehicle
4. Ride and park in designated areas
5. Pay only for what you use

## Pricing
- Pay As You Go: €1.00 unlock + €0.35/min
- Rido Pass: Free unlock + €0.25/min
- Day Pass: €14.99 for unlimited 24-hour rides

## Vehicles
- Rido Scooter (e-scooter): 45km range, 25 km/h top speed
- Rido Bike (e-bike): 60km range, 25 km/h pedal assist

## Links
- [Main site](https://rido.bike)
- [How it works](https://rido.bike#how-it-works)
- [Pricing](https://rido.bike#pricing)
- [Cities](https://rido.bike#cities)
- [Safety](https://rido.bike#safety)
- [FAQ](https://rido.bike#faq)
- [Terms](https://rido.bike/terms)
- [Privacy](https://rido.bike/privacy)
- [Careers](https://rido.bike/careers)

## Contact
- Email: info@rido.bike
- Company: Go2 Place S.L., Calle Eneldo 3, C4, local 22, 03189 Orihuela Costa, Alicante, Spain
```

### 1.2 Add `llms-full.txt` file
A longer, more detailed version with full content from all sections in markdown.

### 1.3 Add `/.well-known/ai-plugin.json`
For AI agents that want to interact programmatically with the site.

### 1.4 Ensure content is in initial HTML
Currently Framer Motion animations hide content until JS loads. Crawlers and LLMs that don't execute JS will miss it. Solution: ensure all text content is in the server-rendered HTML (it is — Next.js SSR renders it, just hidden via opacity). Verify with `curl` that all text is present in raw HTML.

---

## Phase 2: Rich Structured Data (Schema.org)

**Goal: Maximize rich results in Google SERPs and AI answer engines.**

### 2.1 Add `Organization` schema
Parent organization (Go2 Place S.L.) with logo, contact, founding date.

### 2.2 Add `HowTo` schema for How It Works
4-step process with durations and tools needed. Eligible for Google rich results.

### 2.3 Add `Product` schema for each vehicle
With `Brand`, `offers` (pricing), `aggregateRating` (placeholder for future).

### 2.4 Add `BreadcrumbList` to homepage sections
So Google shows breadcrumbs in SERPs for "Rido > How It Works" etc.

### 2.5 Add `SoftwareApplication` schema for the app
With `offers` (free), `operatingSystem`, `applicationCategory`.

### 2.6 Enhance `LocalBusiness` schema
- Add `geo` with `GeoCoordinates` (Marbella as primary city)
- Add `hasMap` (Google Maps URL)
- Add `openingHoursSpecification` (launching — by appointment)
- Add `potentialAction` (ReserveAction → waitlist)
- Add `aggregateRating` placeholder (hidden until real reviews)

### 2.7 Add `Service` schema for each city
With `areaServed`, `provider`, `serviceType`.

### 2.8 Add `AggregateOffer` to pricing
Instead of individual `Offer` items, wrap in `AggregateOffer` with `lowPrice`/`highPrice`.

---

## Phase 3: Technical SEO Fixes

### 3.1 Fix manifest description
Update from "Download the app, scan, and ride" to waitlist messaging.

### 3.2 Fix robots.txt
Remove `/api/` disallow (no API routes exist). Add explicit allow for `/llms.txt`.

### 3.3 Fix sitemap with real dates
Use fixed `lastModified` dates instead of `new Date()` (which changes every build).

### 3.4 Add `<link rel="preload">` for hero image
Speed up LCP (Largest Contentful Paint).

### 3.5 Add `Content-Security-Policy` meta tag
Security header for trust signals (even on static export, can be in `<meta>`).

### 3.6 Add `X-Robots-Tag` for legal pages
Set `noindex` on `/privacy` and `/terms` (they don't need to rank, and keeping them out of the index focuses crawl budget).

### 3.7 Add `canonical` to section anchors
Add `<link rel="canonical" href="https://rido.bike/#section">` within each section's metadata context.

### 3.8 Verify social media links
If `instagram.com/rido`, `facebook.com/rido`, `x.com/rido` don't exist, remove them from `sameAs` in JSON-LD and from the footer. Dead links hurt E-E-A-T signals.

---

## Phase 4: Content Optimization for AI

### 4.1 Add semantic anchor text
Ensure all internal links use descriptive text, not "click here" or "learn more".

### 4.2 Add `FAQ` schema to the page itself
Currently FAQ JSON-LD renders inside the FAQ component, but also add it to the `<head>` via layout for crawlers that only read `<head>`.

### 4.3 Add descriptive `alt` text to all images
Audit all `alt` attributes — currently some are generic ("Rido e-scooter"). Make them keyword-rich: "Rido shared e-scooter on a Costa del Sol street".

### 4.4 Add `aria-describedby` to sections
Link sections to their headings for screen readers and crawlers.

### 4.5 Add a `/llms-full.txt` with complete page content
A single markdown file with all content concatenated, so LLMs can ingest the entire site in one request.

---

## Phase 5: Performance & Core Web Vitals

### 5.1 Add `loading="lazy"` to below-the-fold images
Already done for thumbnails, but audit all images.

### 5.2 Add `fetchpriority="high"` to hero image
Tells the browser to prioritize loading the LCP image.

### 5.3 Preload critical fonts
Add `<link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter..." as="style">` to avoid FOUT.

### 5.4 Add image dimensions to all `<Image>` components
Prevent CLS (Cumulative Layout Shift).

### 5.5 Compress images further
Current images total 860KB. Convert JPGs to WebP with fallback, and compress the OG image to under 100KB.

---

## Phase 6: Local SEO (Spain/Costa del Sol)

### 6.1 Add `hreflang` for Spanish
Even without a Spanish version yet, declare `hreflang="es"` pointing to the same URL with a note that localization is coming. Or remove `hreflang` entirely until Spanish is ready (current approach is correct — already cleaned up).

### 6.2 Add region-specific keywords
Add "Costa del Sol", "Marbella", "Estepona" to meta keywords and content.

### 6.3 Add `geo.position` meta tag
`<meta name="geo.position" content="36.5099;-4.8862">` (Marbella coordinates).

### 6.4 Add `geo.region` meta tag
`<meta name="geo.region" content="ES-A">` (Spain, Alicante region).

### 6.5 Add `ICBM` meta tag
`<meta name="ICBM" content="36.5099, -4.8862">` (legacy but still read by some crawlers).

---

## Phase 7: AI Engine Specific Optimization

### 7.1 Optimize for Google AI Overviews (SGE)
- Use clear, factual statements that can be directly cited
- Add `data-answer` attributes to FAQ items with concise answers
- Ensure pricing info is in plain text (not just in JS components)

### 7.2 Optimize for ChatGPT/Perplexity/Claude
- The `llms.txt` file is the primary vector
- Ensure all factual claims (pricing, cities, vehicle specs) are in the raw HTML
- Add a `summary` section to each major section with `aria-label="Summary"`

### 7.3 Add `citation` schema
Mark factual claims with `data-cite` attributes pointing to sources (e.g., Spanish e-scooter regulations).

### 7.4 Add `speakable` schema
Identify sections that are good for voice search answers (Google Assistant, Alexa).

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "How Rido Works",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": ["#how-it-works h2", "#how-it-works p"]
  },
  "url": "https://rido.bike/#how-it-works"
}
```

---

## Implementation Priority

| Phase | Impact | Effort | When |
|-------|--------|--------|------|
| 1. AI Crawler (llms.txt) | 🔴 Critical | 🟢 Low | Now |
| 2. Structured Data | 🔴 Critical | 🟡 Medium | Now |
| 3. Technical Fixes | 🟡 High | 🟢 Low | Now |
| 5. Performance | 🟡 High | 🟡 Medium | Now |
| 6. Local SEO | 🟡 High | 🟢 Low | Now |
| 4. Content/AI | 🟡 Medium | 🟡 Medium | Next |
| 7. AI Engine Specific | 🟡 Medium | 🔴 High | Later |

---

## Success Metrics

- **Google Rich Results Test**: All schema validates with 0 errors
- **PageSpeed Insights**: 90+ on all Core Web Vitals
- **llms.txt**: Accessible at `https://rido.bike/llms.txt`
- **SERP**: Rich results appear for "rido e-scooter spain", "rido pricing", "how rido works"
- **AI Engines**: ChatGPT/Perplexity can answer "What is Rido?" using site data