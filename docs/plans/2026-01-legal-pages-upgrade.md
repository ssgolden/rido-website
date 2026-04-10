# Legal Pages Upgrade Plan — Privacy Policy & Terms of Service

> **For agentic workers:** REQUIRED SUB-SKILL: Use `writing-plans` for this plan, then `subagent-driven-development` or `executing-plans` to execute.

**Goal:** Create dedicated Privacy Policy and Terms of Service pages on the Rido website, populated with the real legal content from the provided DOCX documents, and update the footer links to point to them.

**Architecture:** Two new Next.js App Router pages (`/privacy` and `/terms`) with scrollable legal content in a dark-mode legal-page layout. Footer links updated from `#` to `/privacy` and `/terms`. Create shared `LegalPage` layout component for consistent legal page styling.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, Lucide React

---

## Document Analysis

### Source Documents

| Document | File | Length | Sections |
|----------|------|--------|----------|
| Privacy Policy | `Policies/RIDO_PRIVACY_POLICY.docx` | 12,477 chars | 11 sections |
| Terms & Conditions | `Policies/RIDO_SERVICE_TERMS_AND_CONDITIONS.docx` | 26,555 chars | 16 sections |

### Key Business Details (extracted from documents)

| Detail | Value |
|--------|-------|
| **Company** | Go2 Place S.L. |
| **NIF** | B01745405 |
| **Address** | Calle Eneldo 3, C4, local 22 - Orihuela Costa - 03189 |
| **Registry** | Commercial Registry of Alicante, Volume 4309, Folio 12, Sheet A-170633 |
| **Email** | info@rido.bike |
| **Cookie Policy URL** | https://Rido.bike/politica-cookies |
| **Minimum age** | 18 years |
| **Damage liability** | Up to €2,000 |
| **Out-of-area return fee** | Up to €500 (€50 within 20km) |
| **No parking photo fee** | €30 |
| **Right of withdrawal** | 14 calendar days (exceptions for per-minute service) |
| **Governing law** | Spanish law, GDPR, LOPDGDD |
| **ODR platform** | http://ec.europa.eu/consumers/odr/ |

### Privacy Policy Sections

1. Introduction and Company Details
2. Applicable Legislation on Personal Data Protection
3. Responsibility
4. Collection and Use of Personal Data
5. Disclosure of Data to Third Parties
6. Links to Third Parties
7. Security Measures
8. Data Retention
9. Your Rights as a Data Subject
10. Amendments to the Privacy Policy
11. Right to File a Complaint with the Supervisory Authority

### Terms & Conditions Sections

1. Introduction and Company Details
2. Definitions
3. Registration and User Account
4. Use of the Service and the App
5. Defects and Damages
6. Rental Period
7. Financial Terms and Conditions
8. User Responsibilities
9. Data Protection and Privacy (GDPR and LOPDGDD)
10. Intellectual Property
11. Modifications and Termination
12. Right of Withdrawal
13. Cookie Policy
14. Applicable Law and Jurisdiction
15. Online Dispute Resolution (ODR Platform)
16. Feedback

---

## Task 1: Create Legal Page Layout Component

**Files:** Create `src/components/layout/LegalPage.tsx`

- [ ] **Step 1: Create the shared legal page layout**

```tsx
// src/components/layout/LegalPage.tsx
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-rido-navy">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/50 hover:text-rido-magenta transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <h1 className="text-3xl md:text-4xl font-black mb-2">{title}</h1>
        <p className="text-sm text-white/40 mb-12">Last updated: {lastUpdated}</p>

        <div className="prose-legal text-white/70 leading-relaxed space-y-6">
          {children}
        </div>

        <div className="mt-16 pt-8 border-t border-white/10">
          <Link
            href="/"
            className="text-rido-magenta hover:text-rido-magenta-light transition-colors"
          >
            ← Back to rido.bike
          </Link>
        </div>
      </div>
    </div>
  );
}
```

The layout provides:
- Consistent max-width container for readability
- Back navigation link
- Title + last updated date
- `prose-legal` class for legal text styling
- Footer link back to home

---

## Task 2: Create Privacy Policy Page

**Files:** Create `src/app/privacy/page.tsx`

- [ ] **Step 2: Create the Privacy Policy page**

The page will contain all 11 sections from the Privacy Policy document, formatted in markdown-style structured content with React components. Key data points to highlight visually:

- Company: Go2 Place S.L. (NIF: B01745405)
- Address: Calle Eneldo 3, C4, local 22 - Orihuela Costa - 03189
- Email: info@rido.bike
- GDPR compliance
- User rights (access, rectification, deletion, portability, objection)

Use styled section headings, highlighted boxes for user rights, and clear table formatting where applicable.

---

## Task 3: Create Terms & Conditions Page

**Files:** Create `src/app/terms/page.tsx`

- [ ] **Step 3: Create the Terms & Conditions page**

The page will contain all 16 sections from the Terms document. Key items to highlight visually:

- Minimum age: **18 years** (callout box)
- Damage liability: **Up to €2,000** (warning box)
- Out-of-area fees: **€500 / €50 / €30** (pricing-style cards)
- Right of withdrawal: 14 calendar days (callout box)
- Governing law: Spanish law, EU ODR platform

---

## Task 4: Add Legal Page Styles to globals.css

**Files:** `src/app/globals.css`

- [ ] **Step 4: Add `prose-legal` utility styles**

Add to `@layer utilities` in `globals.css`:

```css
.prose-legal {
  @apply text-white/70;
}

.prose-legal h2 {
  @apply text-xl font-bold text-white mt-12 mb-4;
}

.prose-legal h3 {
  @apply text-lg font-semibold text-white mt-8 mb-3;
}

.prose-legal p {
  @apply mb-4 leading-relaxed;
}

.prose-legal ul {
  @apply list-disc list-inside mb-4 space-y-1;
}

.prose-legal ol {
  @apply list-decimal list-inside mb-4 space-y-1;
}

.prose-legal a {
  @apply text-rido-magenta hover:text-rido-magenta-light underline transition-colors;
}

.prose-legal strong {
  @apply text-white font-semibold;
}

.prose-legal .legal-highlight {
  @apply bg-rido-magenta/10 border border-rido-magenta/20 rounded-xl p-4 my-6;
}

.prose-legal .legal-warning {
  @apply bg-rido-yellow/10 border border-rido-yellow/20 rounded-xl p-4 my-6;
}
```

---

## Task 5: Update Footer Links

**Files:** `src/components/layout/Footer.tsx`

- [ ] **Step 5: Update the `footerLinks` object**

Change the Legal section from placeholder `#` links to actual routes:

```typescript
const footerLinks = {
  Product: [
    { label: "E-Scooter", href: "#vehicles" },
    { label: "E-Bike", href: "#vehicles" },
    { label: "Pricing", href: "#pricing" },
    { label: "Cities", href: "#cities" },
  ],
  Company: [
    { label: "About", href: "#about" },
    { label: "Safety", href: "#safety" },
    { label: "Sustainability", href: "#sustainability" },
    { label: "Careers", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "https://Rido.bike/politica-cookies" },
  ],
};
```

---

## Task 6: Update BRAIN.md

**Files:** `BRAIN.md`

- [ ] **Step 6: Add legal pages info**

Add to the Website Sections section:

```markdown
11. **Privacy Policy** — `/privacy` — Full GDPR-compliant privacy policy (11 sections)
12. **Terms of Service** — `/terms` — Full legal terms (16 sections)
```

Add to Key Decisions:

```markdown
| 2026-01 | Legal pages use real Go2 Place S.L. documents | sourced from `Policies/` DOCX files, company NIF B01745405 |
```

---

## Task 7: Build Verification

- [ ] **Step 7: Run production build**

```bash
cd "C:\Users\steph\OneDrive\Desktop\Rido"
npm run build
```

Expected: ✓ Compiled successfully, `/privacy` and `/terms` pages generated.

- [ ] **Step 8: Visual QA**

```bash
npm run dev
```

Check:
1. `/privacy` — Full legal page with all 11 sections
2. `/terms` — Full legal page with all 16 sections
3. Footer "Privacy Policy" links to `/privacy`
4. Footer "Terms of Service" links to `/terms`
5. Back navigation works on both pages
6. Dark theme consistent with rest of site
7. Legal text is readable (good contrast, appropriate font sizes)

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add Privacy Policy and Terms of Service pages

- Created /privacy page with full 11-section GDPR-compliant privacy policy
- Created /terms page with full 16-section service terms document
- Created LegalPage shared layout component (back nav, title, prose styling)
- Added prose-legal utility styles to globals.css
- Updated footer links from # to /privacy and /terms
- Legal content sourced from Go2 Place S.L. official documents
- Company: Go2 Place S.L., NIF B01745405, Orihuela Costa"
```