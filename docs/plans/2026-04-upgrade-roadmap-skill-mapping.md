# Rido Upgrade Roadmap — Skill & Agent Mapping

> **Purpose:** Map each upgrade to the best skills and specialist agents, then define the execution strategy.
> **Scope:** All open Known Issues (excluding custom domain — user will handle separately)

---

## Phase 1: Skill & Agent Assignment

Each upgrade is mapped to:
- **Primary skill** — the main workflow skill that governs HOW we work
- **Specialist agents** — the jeffallan sub-skills with deep domain expertise
- **Support skills** — quality/safety nets that run alongside

### Legend

| Code | Skill | Role |
|------|-------|------|
| `UX` | `ui-ux-pro-max` | Design system, UX guidelines, component design |
| `WA` | `web-architect` | Next.js architecture, rendering, data flow |
| `BS` | `brainstorming` | Creative exploration, design before code |
| `WP` | `writing-plans` | Structured implementation plans |
| `SD` | `subagent-driven-development` | Parallel task execution |
| `DP` | `dispatching-parallel-agents` | Independent parallel agents |
| `VC` | `verification-before-completion` | Quality gate before claiming done |
| `TDD` | `test-driven-development` | Test-first implementation |
| `SDb` | `systematic-debugging` | Root-cause debugging |
| `CR` | `requesting-code-review` | Post-implementation review |

### Specialist Agents (jeffallan-skills)

| Code | Sub-Skill | Domain Expertise |
|------|-----------|-----------------|
| `NX` | `nextjs-developer` | Next.js App Router, SSG, basePath, metadata |
| `RE` | `react-expert` | Hooks, state, animations, Framer Motion |
| `TS` | `typescript-pro` | Type safety, generics, utility types |
| `SG` | `secure-code-guardian` | GDPR, cookie consent, legal compliance |
| `SR` | `security-reviewer` | Threat modeling, data protection |
| `FM` | `feature-forge` | Feature implementation workflows |
| `TM` | `test-master` | Testing strategies, coverage |

---

## Phase 2: Upgrade → Skill Matrix

### 🔴 Priority 1: Cookie Consent Banner

| Dimension | Assignment |
|-----------|------------|
| **Business value** | GDPR/LOPDGDD compliance — legal risk if missing |
| **Complexity** | Medium — new component + state + localStorage |
| **Primary workflow** | `BS` → `WP` → `SD` |
| **Design** | `UX` (GDPR banner UX patterns, dark-mode styling) |
| **Architecture** | `WA` + `NX` (App Router cookie law, route-level vs layout-level) |
| **Implementation agents** | `RE` (React context/state for consent), `TS` (type-safe consent object) |
| **Compliance review** | `SG` (GDPR Article 5, ePrivacy, LOPDGDD Article 22) + `SR` (data flow review) |
| **Quality gates** | `TDD` → `VC` → `CR` |
| **Why these skills?** | Cookie consent is a **legal+UX** problem — `SG` checks compliance, `UX` ensures the banner isn't intrusive, `NX` handles the Next.js layout integration |
| **Parallelizable?** | No — cross-cutting concern, touches layout.tsx |

### 🟡 Priority 2: Scooter Product Gallery

| Dimension | Assignment |
|-----------|------------|
| **Business value** | Product showcase balance — 1 scooter vs 4 bike images |
| **Complexity** | Low — add images, already have gallery component |
| **Blocker** | **No images available yet** — needs user to provide photos |
| **Primary workflow** | `BS` → `WP` → `SD` |
| **Design** | `UX` (gallery layout, thumbnail sizing) |
| **Architecture** | `WA` (image optimization, sizes prop, lazy loading) |
| **Implementation agents** | `NX` (next/image config, unoptimized basePath), `RE` (existing gallery reuse) |
| **Quality gates** | `VC` |
| **Why these skills?** | Primarily an **asset + config** task — `NX` for Next.js image handling, already have the Vehicles component with gallery |
| **Parallelizable?** | Yes — independent from other upgrades. But **blocked on image assets** |

### 🟡 Priority 3: Footer Enhancement

| Dimension | Assignment |
|-----------|------------|
| **Business value** | Conversion touchpoint — social links, app badges, newsletter, legal entity |
| **Complexity** | Medium — new links, icons, layout redesign, possible email form |
| **Primary workflow** | `BS` → `WP` → `SD` |
| **Design** | `UX` (footer UX patterns, dark-mode, 4→5 column, mobile collapse) |
| **Architecture** | `WA` + `NX` (footer as layout component, link routing with basePath) |
| **Implementation agents** | `RE` (React component with responsive grid), `TS` (typed social links, icon map) |
| **Quality gates** | `VC` → `CR` |
| **Why these skills?** | Footer is a **design+layout** problem — `UX` for the responsive grid pattern, `RE` for the component, `NX` for basePath on links |
| **Parallelizable?** | Yes — independent from cookie banner and gallery |

### 🟢 Priority 4: `/cookies` Page

| Dimension | Assignment |
|-----------|------------|
| **Business value** | Replaces external cookie policy link with internal page |
| **Complexity** | Low — reuse `LegalPage` component, write content |
| **Primary workflow** | `WP` → `SD` |
| **Design** | `UX` (legal page styling — already have pattern from /privacy and /terms) |
| **Architecture** | `WA` + `NX` (new route /cookies, SSG page, LegalPage reuse) |
| **Implementation agents** | `NX` (page route, metadata), `FM` (component implementation) |
| **Compliance review** | `SG` (cookie policy content completeness) |
| **Quality gates** | `VC` |
| **Why these skills?** | Repeat of existing pattern — `NX` for the route, `SG` for cookie policy content |
| **Parallelizable?** | Yes — fully independent |
| **Note** | Can be done alongside cookie consent banner (P1) — the banner links TO this page |

### 🟢 Priority 5: Vehicle Gallery Lightbox

| Dimension | Assignment |
|-----------|------------|
| **Business value** | Polish — let users inspect vehicle images in full screen |
| **Complexity** | Medium — modal component, keyboard nav, animation |
| **Primary workflow** | `BS` → `WP` → `SD` |
| **Design** | `UX` (lightbox patterns, swipe gestures, close button placement) |
| **Architecture** | `WA` + `NX` (portal-rendered modal, withBase for images) |
| **Implementation agents** | `RE` (Framer Motion AnimatePresence, keyboard events, focus trap), `TS` (typed gallery state) |
| **Quality gates** | `TDD` → `VC` → `CR` |
| **Why these skills?** | Lightbox is an **interaction+animation** problem — `RE` for Framer Motion transitions, `UX` for the interaction design |
| **Parallelizable?** | Yes — independent from all other upgrades |

### 🟢 Priority 6: Rido vs Competitors Comparison Table

| Dimension | Assignment |
|-----------|------------|
| **Business value** | Trust & conversion — show Rido's edge over Bolt/Lime/Dott |
| **Complexity** | Medium — data model, responsive table design, competitor research |
| **Primary workflow** | `BS` → `WP` → `SD` |
| **Design** | `UX` (comparison table patterns — checkmarks, mobile horizontal scroll, feature grid) |
| **Architecture** | `WA` + `NX` (new section or standalone page, SSG) |
| **Implementation agents** | `RE` (responsive table component, Framer Motion row animations), `TS` (typed competitor data) |
| **Quality gates** | `VC` |
| **Why these skills?** | Comparison table is **data+design** — `UX` for the mobile-friendly responsive table, `RE` for the component |
| **Parallelizable?** | Yes — fully independent |
| **Note** | Needs competitor research — use `web-search` skill to gather current pricing/features |

### 🟢 Priority 7: Active Nav Pill Animation

| Dimension | Assignment |
|-----------|------------|
| **Business value** | Polish — smooth navbar section indicator |
| **Complexity** | Low — Framer Motion layoutId on existing nav |
| **Primary workflow** | `WP` → `SD` |
| **Design** | `UX` (nav pill transition timing, easing) |
| **Implementation agents** | `RE` (Framer Motion layoutId, AnimatePresence) |
| **Quality gates** | `VC` |
| **Why these skills?** | Pure **animation** task — `RE` for Framer Motion, minimal code change |
| **Parallelizable?** | Yes — independent |

### 🟡 Priority 8: `next/font/google` Fix

| Dimension | Assignment |
|-----------|------------|
| **Business value** | Performance — proper font loading without `<link>` hack |
| **Complexity** | Unknown — depends on Next.js 16 Turbopack fix |
| **Primary workflow** | `SDb` → `WP` (only if fix is available) |
| **Investigation agents** | `NX` (check Next.js changelogs, Turbopack issues) |
| **Support** | `web-search` (check latest Next.js release notes) |
| **Quality gates** | `VC` |
| **Why these skills?** | This is a **monitor+debug** task — `SDb` to test if the bug is fixed, `web-search` to check status |
| **Parallelizable?** | Yes — but only when Next.js releases the fix |
| **Note** | Low effort when fix lands — just swap `<link>` for `next/font/google` in layout.tsx |

---

## Phase 3: Execution Strategy

### Which upgrades can run in parallel?

```
Batch 1 (🔴 Must-do, sequential — touches layout.tsx):
  Cookie Consent Banner ──→ /cookies Page
  (banner links to /cookies; both touch layout.tsx)

Batch 2 (🟡🟢 Independent — can all run in parallel):
  ├── Footer Enhancement
  ├── Vehicle Gallery Lightbox
  ├── Comparison Table
  └── Active Nav Pill Animation

Batch 3 (🟡 Blocked — needs assets):
  Scooter Product Gallery (WAITING on images from user)

Batch 4 (🟡 Monitor — needs upstream fix):
  next/font/google fix (WAITING on Next.js Turbopack fix)
```

### Parallel Agent Dispatch Plan

**Batch 1** — Sequential (cross-cutting):
- Agent A: Cookie consent component + context (SG compliance review)
- Then Agent A: /cookies page (reuses LegalPage)
- `DP` NOT suitable — touches same files (layout.tsx, globals.css)

**Batch 2** — Parallel dispatch via `DP`:
- Agent A: Footer enhancement (layout/Footer.tsx, data/social-links.ts)
- Agent B: Vehicle lightbox (sections/Vehicles.tsx, ui/Lightbox.tsx)
- Agent C: Comparison table (sections/Comparison.tsx, data/competitors.ts)
- Agent D: Nav pill animation (layout/Navbar.tsx)
- ✅ All 4 touch DIFFERENT files — zero conflicts
- `dispatching-parallel-agents` is the right skill here

### Recommended Workflow

```
1. BS (brainstorming)     → Cookie consent + /cookies design approval
2. WP (writing-plans)     → Write implementation plan for Batch 1 + Batch 2
3. SD (subagent-driven)   → Execute Batch 1 (sequential)
4. DP (parallel-agents)   → Execute Batch 2 (4 agents in parallel)
5. VC (verification)       → Full site regression test after each batch
6. CR (code-review)        → Review all changes before merge
```

---

## Phase 4: Agent Dispatch Details

### Batch 2 Agent Prompts (for `dispatching-parallel-agents`)

**Agent A — Footer Enhancement**
```
Scope: src/components/layout/Footer.tsx (ONLY this file + new data file)
Goal: Upgrade 4-column footer to include social icons, app download badges,
      newsletter signup field, and Go2 Place S.L. legal entity line.
Constraints: Use existing Lucide icons, glass styling, withBase() for links,
            responsive grid (4-col desktop, 2-col tablet, 1-col mobile).
Design: Run ui-ux-pro-max search for "footer dark mode SaaS" first.
```

**Agent B — Vehicle Gallery Lightbox**
```
Scope: src/components/sections/Vehicles.tsx + new src/components/ui/Lightbox.tsx
Goal: Add click-to-expand lightbox for vehicle images with prev/next navigation,
      keyboard support (Escape to close, arrow keys), and Framer Motion
      AnimatePresence transitions.
Constraints: Use withBase() for image src, portal-rendered modal,
            focus trap for accessibility, cursor-pointer on thumbnails.
Design: Run ui-ux-pro-max search for "image lightbox dark mode" first.
```

**Agent C — Comparison Table**
```
Scope: New src/components/sections/Comparison.tsx + src/data/competitors.ts
Goal: Feature comparison table — Rido vs Bolt vs Lime vs Dott.
      Research current competitor features via web-search.
Constraints: Responsive (horizontal scroll on mobile), checkmark/X marks,
            Rido column highlighted with magenta accent.
Design: Run ui-ux-pro-max search for "comparison table dark mode mobile" first.
```

**Agent D — Nav Pill Animation**
```
Scope: src/components/layout/Navbar.tsx (ONLY this file)
Goal: Add Framer Motion layoutId to the active section indicator pill
      for smooth animated transition when scrolling between sections.
Constraints: Minimal change — only the active indicator element.
            Test reduced-motion preference.
```

---

## Summary: Skill Usage Per Upgrade

| Upgrade | Primary Skill | Design | Architecture | Impl Agent | Compliance | Quality |
|---------|--------------|--------|-------------|------------|------------|---------|
| 🔴 Cookie Banner | `BS→WP→SD` | `UX` | `WA+NX` | `RE+TS` | `SG+SR` | `TDD→VC→CR` |
| 🟡 Scooter Gallery | `BS→WP→SD` | `UX` | `WA+NX` | `NX+RE` | — | `VC` |
| 🟡 Footer | `BS→WP→SD` | `UX` | `WA+NX` | `RE+TS` | — | `VC→CR` |
| 🟢 /cookies Page | `WP→SD` | `UX` | `WA+NX` | `NX+FM` | `SG` | `VC` |
| 🟢 Lightbox | `BS→WP→SD` | `UX` | `WA+NX` | `RE+TS` | — | `TDD→VC→CR` |
| 🟢 Comparison Table | `BS→WP→SD` | `UX` | `WA+NX` | `RE+TS` | — | `VC` |
| 🟢 Nav Pill | `WP→SD` | `UX` | `WA` | `RE` | — | `VC` |
| 🟡 next/font | `SDb→WP` | — | `NX` | `NX` | — | `VC` |