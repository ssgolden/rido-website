# Rido — Skills Reference

> **Purpose:** Load this file at the start of every session so all available skills, triggers, and workflows are immediately accessible. No need to rediscover or reinstall skills. Everything is here.

---

## Quick-Reference: Skill Triggers

| # | Skill | Trigger — Use When... |
|---|-------|----------------------|
| 1 | `using-superpowers` | Starting ANY conversation — check for relevant skills before any action |
| 2 | `brainstorming` | Before any creative work — creating features, building components, adding functionality |
| 3 | `writing-plans` | You have a spec/requirements for a multi-step task, before touching code |
| 4 | `executing-plans` | You have a written implementation plan to execute in a separate session |
| 5 | `subagent-driven-development` | Executing implementation plans with independent tasks in the current session |
| 6 | `dispatching-parallel-agents` | Facing 2+ independent tasks that can be worked on without shared state |
| 7 | `test-driven-development` | Implementing any feature or bugfix, before writing implementation code |
| 8 | `systematic-debugging` | Encountering any bug, test failure, or unexpected behavior |
| 9 | `verification-before-completion` | About to claim work is complete, fixed, or passing |
| 10 | `writing-skills` | Creating new skills, editing existing skills, or verifying skills work |
| 11 | `custom-skill` | Create or update a custom reusable skill |
| 12 | `requesting-code-review` | Completing tasks, implementing major features, or before merging |
| 13 | `receiving-code-review` | Receiving code review feedback, before implementing suggestions |
| 14 | `finishing-a-development-branch` | Implementation is complete, all tests pass, need to decide how to integrate |
| 15 | `using-git-worktrees` | Starting feature work that needs isolation or before executing plans |
| 16 | `apk-master` | Android app architecture, Gradle, APK generation, device deployment |
| 17 | `file-reader` | Locate and read local files on Windows and WSL/Linux |
| 18 | `linux-file-reader` | Read files inside WSL distros |
| 19 | `linux-image-reader` | Mount and inspect Linux filesystem images (.iso, .img, .qcow2, ext4.vhdx) |
| 20 | `linux-package-installer` | Install Linux package files (.deb, .rpm, AppImage) into a WSL distro |
| 21 | `gemini-cli-unlock` | Install, verify, troubleshoot Gemini CLI on Windows |
| 22 | `fullstack-dev` | Building full-stack apps, REST API with frontend, scaffolding backend |
| 23 | `web-architect` | Full-stack web apps with Next.js, React, TypeScript |
| 24 | `ui-ux-pro-max` | UI/UX design — 67 styles, 161 color palettes, 57 font pairings, 99 UX guidelines |
| 25 | `visual-forge` | Image, video, computer-vision workflows (OpenCV, PIL, Diffusers, FFmpeg) |
| 26 | `brand-palette-extractor` | Extract exact brand colors from image assets using PIL, compare to website tokens |
| 27 | `neural-nexus` | AI/ML systems with PyTorch, TensorFlow, RAG, local model workflows |
| 28 | `syntax-surgeon` | Debug broken code with stack traces, targeted fixes, reproducible verification |
| 29 | `web-search` | Search web and fetch page content via Ollama |
| 30 | `eof-prompts-installer` | Install EOF-style prompt blocks into local file paths |
| 31 | `openclaw-connector` | Connect to / verify local OpenClaw gateway |
| 32 | `vanguard-fleet-setup` | Inspect Vanguard fleet archive, recover OpenClaw configs |
| 33 | `red-team-engagement-planner` | Plan authorized red-team engagements with scope and RoE |
| 34 | `red-team-detection-validator` | Design safe detection-validation exercises for authorized environments |
| 35 | `red-team-report-writer` | Produce clear red-team reports for authorized engagements |
| 36 | `jeffallan-skills` | 53 specialist dev sub-skills (see Specialist Skills section below) |
| 37 | `skills` | Deployment skills (Vercel, Netlify) |

---

## Workflow Order

Skills form a recommended workflow chain:

```
using-superpowers → brainstorming → writing-plans → executing-plans / subagent-driven-development
                                                          ↓
                                    test-driven-development + systematic-debugging
                                                          ↓
                                    verification-before-completion → finishing-a-development-branch
```

---

## Skill Details

---

### 1. using-superpowers

**Trigger:** Starting ANY conversation. Even a 1% chance a skill applies means invoke it.

**Core Rule:** Invoke relevant skills BEFORE any response or action. Including clarifying questions.

**Priority:**
1. User's explicit instructions (CLAUDE.md, AGENTS.md, direct requests) — highest
2. Superpowers skills — override default system behavior
3. Default system prompt — lowest

**Skill Priority:** Process skills first (brainstorming, debugging), then implementation skills.

**Red Flags — STOP rationalizing:**
| Thought | Reality |
|---------|---------|
| "This is just a simple question" | Questions are tasks. Check for skills. |
| "I need more context first" | Skill check comes BEFORE clarifying questions. |
| "The skill is overkill" | Simple things become complex. Use it. |
| "I'll just do this one thing first" | Check BEFORE doing anything. |

---

### 2. brainstorming

**Trigger:** Before ANY creative work — creating features, building components, adding functionality, or modifying behavior.

**HARD GATE:** Do NOT write code or invoke implementation skills until you present a design and the user approves it.

**Checklist (complete in order):**
1. Explore project context — check files, docs, recent commits
2. Offer visual companion (if topic involves visual questions)
3. Ask clarifying questions — one at a time
4. Propose 2-3 approaches — with trade-offs and recommendation
5. Present design — scaled to complexity, get approval after each section
6. Write design doc — save to `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`
7. Spec self-review — check for placeholders, contradictions, ambiguity
8. User reviews written spec
9. Transition to implementation — invoke `writing-plans` skill

**Key Principles:**
- One question at a time
- Multiple choice preferred
- YAGNI ruthlessly
- Always propose 2-3 approaches
- Design for isolation and clarity (small units, one clear purpose)
- Terminal state is invoking `writing-plans`. Do NOT invoke any other implementation skill.

---

### 3. writing-plans

**Trigger:** You have a spec or requirements for a multi-step task, before touching code.

**Save plans to:** `docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md`

**Plan Header (required):**
```markdown
# [Feature Name] Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans.

**Goal:** [One sentence]
**Architecture:** [2-3 sentences]
**Tech Stack:** [Key technologies]
```

**Task Structure:**
- Each step is one action (2-5 minutes)
- Exact file paths always
- Complete code in every step
- Exact commands with expected output
- DRY, YAGNI, TDD, frequent commits

**No Placeholders — these are plan failures:**
- "TBD", "TODO", "implement later"
- "Add appropriate error handling"
- "Write tests for the above" (without actual test code)
- Steps that describe what to do without showing how

---

### 4. executing-plans

**Trigger:** You have a written implementation plan to execute in a separate session.

**Process:**
1. **Load and Review Plan** — Read plan, review critically, raise concerns before starting
2. **Execute Tasks** — Mark in_progress, follow steps exactly, run verifications, mark completed
3. **Complete Development** — Use `finishing-a-development-branch` skill

**Required sub-skill:** `using-git-worktrees` — set up isolated workspace before starting.

**When to Stop and Ask:**
- Hit a blocker
- Plan has critical gaps
- Don't understand an instruction
- Verification fails repeatedly

---

### 5. subagent-driven-development

**Trigger:** Executing implementation plans with independent tasks in the current session.

**Core Pattern:** Fresh subagent per task + two-stage review (spec compliance → code quality) = high quality, fast iteration.

**Per Task:**
1. Dispatch implementer subagent
2. Implementer implements, tests, commits, self-reviews
3. Dispatch spec reviewer subagent — confirms code matches spec
4. If spec issues → implementer fixes → re-review
5. Dispatch code quality reviewer subagent
6. If quality issues → implementer fixes → re-review
7. Mark task complete

**Model Selection:** Use least powerful model that can handle each role.
- Mechanical implementation (1-2 files, clear specs) → fast/cheap model
- Integration and judgment → standard model
- Architecture, design, review → most capable model

**Required sub-skills:** `using-git-worktrees`, `writing-plans`, `requesting-code-review`, `finishing-a-development-branch`

---

### 6. dispatching-parallel-agents

**Trigger:** Facing 2+ independent tasks without shared state or sequential dependencies.

**Pattern:**
1. Identify independent domains (group by what's broken)
2. Create focused agent tasks (specific scope, clear goal, constraints, expected output)
3. Dispatch in parallel
4. Review and integrate (read summaries, verify no conflicts, run full suite)

**Good Agent Prompts Are:**
1. **Focused** — One clear problem domain
2. **Self-contained** — All context needed to understand the problem
3. **Specific about output** — What should the agent return?

**Don't Use When:** Failures are related, need full context, exploratory debugging, shared state.

---

### 7. test-driven-development (TDD)

**Trigger:** Implementing any feature or bugfix, before writing implementation code.

**The Iron Law:**
```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```
Write code before test? Delete it. Start over.

**Red-Green-Refactor:**
1. **RED** — Write one minimal failing test
2. **Verify RED** — Run test, confirm it fails correctly
3. **GREEN** — Write simplest code to pass the test
4. **Verify GREEN** — Run test, confirm it passes + other tests still pass
5. **REFACTOR** — Clean up while keeping tests green
6. Repeat

**Good Tests:** One behavior per test, clear name, real code (no mocks unless unavoidable).

**Common Rationalizations:**
| Excuse | Reality |
|--------|---------|
| "Too simple to test" | Simple code breaks. Test takes 30 seconds. |
| "I'll test after" | Tests passing immediately prove nothing. |
| "TDD will slow me down" | TDD is faster than debugging. |

---

### 8. systematic-debugging

**Trigger:** Encountering any bug, test failure, or unexpected behavior, BEFORE proposing fixes.

**The Iron Law:**
```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

**Four Phases (complete each before proceeding):**

**Phase 1: Root Cause Investigation**
1. Read error messages carefully
2. Reproduce consistently
3. Check recent changes (git diff)
4. Gather evidence in multi-component systems (log at each boundary)
5. Trace data flow backward

**Phase 2: Pattern Analysis**
1. Find working examples in same codebase
2. Compare against references (read completely, don't skim)
3. Identify all differences
4. Understand dependencies

**Phase 3: Hypothesis and Testing**
1. Form single hypothesis (write it down)
2. Test minimally (smallest possible change)
3. Verify before continuing
4. If you don't know — say so, ask for help

**Phase 4: Implementation**
1. Create failing test case
2. Implement single fix
3. Verify fix
4. If 3+ fixes failed: STOP and question the architecture

---

### 9. verification-before-completion

**Trigger:** About to claim work is complete, fixed, or passing.

**The Iron Law:**
```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

**The Gate Function:**
1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh, complete)
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm the claim?
5. ONLY THEN: Make the claim

**Red Flags — STOP:**
- Using "should", "probably", "seems to"
- Expressing satisfaction before verification
- Trusting agent success reports

---

### 10. writing-skills

**Trigger:** Creating new skills, editing existing skills, or verifying skills work.

**Core Principle:** Writing skills IS TDD applied to process documentation.

**TDD Mapping:**
| TDD Concept | Skill Creation |
|-------------|----------------|
| Test case | Pressure scenario with subagent |
| Production code | Skill document (SKILL.md) |
| Test fails (RED) | Agent violates rule without skill |
| Test passes (GREEN) | Agent complies with skill present |
| Refactor | Close loopholes |

**SKILL.md Structure:**
- Frontmatter: `name` and `description` (max 1024 chars)
- Description starts with "Use when..." — triggering conditions ONLY, NOT workflow summary
- Overview, When to Use, Core Pattern, Quick Reference, Common Mistakes

**CSO (Claude Search Optimization):**
- Rich description with concrete triggers and symptoms
- Keyword coverage (error messages, symptoms, tools, synonyms)
- Active-voice naming (verb-first)

---

### 11. custom-skill

**Trigger:** Create or update a custom skill with clear triggering guidance.

**Workflow:**
1. Confirm target task and user inputs
2. Choose smallest useful resource set: `scripts/`, `references/`, `assets/`
3. Keep `SKILL.md` concise; move detailed material to `references/`
4. Use deterministic scripts for repetitive operations
5. Validate skill after each update

**Validation:** `python C:/Users/steph/.codex/skills/.system/skill-creator/scripts/quick_validate.py <skill-path>`

---

### 12. requesting-code-review

**Trigger:** Completing tasks, implementing major features, or before merging.

**How:**
1. Get git SHAs (`BASE_SHA`, `HEAD_SHA`)
2. Dispatch code-reviewer subagent with template
3. Act on feedback:
   - Fix Critical issues immediately
   - Fix Important issues before proceeding
   - Note Minor issues for later
   - Push back if reviewer is wrong (with reasoning)

**Review Integration:**
- Subagent-driven development: review after EACH task
- Executing plans: review after each batch
- Ad-hoc: review before merge

---

### 13. receiving-code-review

**Trigger:** Receiving code review feedback, before implementing suggestions.

**Core Principle:** Verify before implementing. Technical correctness over social comfort.

**Response Pattern:**
1. READ: Complete feedback without reacting
2. UNDERSTAND: Restate requirement in own words (or ask)
3. VERIFY: Check against codebase reality
4. EVALUATE: Technically sound for THIS codebase?
5. RESPOND: Technical acknowledgment or reasoned pushback
6. IMPLEMENT: One item at a time, test each

**Forbidden Responses:** "You're absolutely right!", "Great point!", "Let me implement that now" (before verification)

**YAGNI Check:** If reviewer suggests implementing something unused, grep codebase first.

---

### 14. finishing-a-development-branch

**Trigger:** Implementation is complete, all tests pass, need to decide how to integrate.

**Process:**
1. **Verify Tests** — Must pass before proceeding
2. **Determine Base Branch**
3. **Present 4 Options:**
   1. Merge back to base-branch locally
   2. Push and create a Pull Request
   3. Keep the branch as-is
   4. Discard this work
4. **Execute Choice** — Follow specific steps per option
5. **Cleanup Worktree** — For options 1, 2, 4 only

**Never:** Proceed with failing tests, merge without verification, delete without confirmation.

---

### 15. using-git-worktrees

**Trigger:** Starting feature work that needs isolation, or before executing implementation plans.

**Directory Selection Priority:**
1. Check existing directories (`.worktrees` preferred over `worktrees`)
2. Check CLAUDE.md for preference
3. Ask user

**Safety:** MUST verify directory is gitignored before creating project-local worktree.

**Steps:**
1. Detect project name
2. Create worktree: `git worktree add <path> -b <BRANCH_NAME>`
3. Run project setup (npm install, cargo build, etc.)
4. Verify clean baseline (run tests)
5. Report location

**Required by:** `brainstorming`, `subagent-driven-development`, `executing-plans`

---

### 16. apk-master

**Trigger:** Android app architecture with Kotlin, Jetpack Compose, Gradle, ADB.

**Stack:** Kotlin, Jetpack Compose, Android SDK/NDK, Gradle, Room, ADB

**Workflow:**
1. Clarify app goal, min SDK, target device, build constraints
2. Design project structure, modules, state model, data flow
3. Produce production-ready code and Gradle configuration
4. Add command-line build and install steps
5. Verify with concrete commands and expected artifacts

---

### 17. file-reader

**Trigger:** Locate and read local files on Windows and WSL/Linux.

**Windows Workflow:**
1. Locate candidates: `Get-ChildItem -Recurse -File -Force`, `rg --files`, `rg -n`
2. Inspect metadata: `Get-Item`, `Get-FileHash`
3. Preview content: `Get-Content -TotalCount 200`, or bundled `read_file.py`
4. Binary files: `Format-Hex -Count 256`

**WSL/Linux Files:**
- UNC path: `\\wsl$\<Distro>\home\<user>\...`
- WSL commands: `wsl -d <Distro> -- bash -lc "..."`

**Safety:** Confirm before reading sensitive files (.ssh/, .aws/, .env, etc.)

---

### 18. linux-file-reader

**Trigger:** Read files inside WSL distros (config, logs, project files, package contents).

**Workflow:**
1. Identify Linux environment: `wsl -l -v`
2. Locate target: filename search, content search, directory listing via `wsl -d`
3. Preview safely: head/tail via `sed`, `stat`
4. Inspect packages: `dpkg-deb -I/-c`, `rpm -qip/-qlp`, `tar -tf`

---

### 19. linux-image-reader

**Trigger:** Mount and inspect Linux filesystem images (.iso, .img, .qcow2, ext4.vhdx).

**Workflow:**
1. Identify image type: `Get-Item`, `wsl ... file`
2. Use correct access method:
   - ISO: `Mount-DiskImage`
   - VHDX: `wsl --mount --vhd --bare`
   - Raw: `losetup --find --show --read-only -P`
   - QCOW2: `qemu-img info`, convert or attach
3. Inspect contents read-only
4. Clean up (unmount, detach)

---

### 20. linux-package-installer

**Trigger:** Install Linux package files (.deb, .rpm, AppImage, tarballs) into WSL.

**Workflow:**
1. Verify Linux target: `wsl -l -v`, check architecture and OS
2. Inspect file type: `wsl ... file /path/to/package`
3. Install with correct method:
   - `.deb`: `sudo apt install /path/package.deb`
   - `.rpm`: `sudo dnf install /path/package.rpm`
   - AppImage: `chmod +x && ./app.AppImage`
4. Verify: `dpkg -l | rg`, `command -v`, `--version`

---

### 21. gemini-cli-unlock

**Trigger:** Install/verify/troubleshoot Gemini CLI on Windows PowerShell.

**Workflow:**
1. Check Node.js 20+ prerequisite
2. Try `npx @google/gemini-cli` first (no install needed)
3. If global install: `npm install -g @google/gemini-cli`
4. Fix PATH if command not found: find npm prefix, add to user Path
5. Authenticate: Login with Google, API key, or Vertex AI
6. Recovery: uninstall → cache verify → reinstall

---

### 22. fullstack-dev

**Trigger:** Building full-stack apps, REST API with frontend, scaffolding backend services.

**Mandatory Workflow:**
1. Gather requirements (stack, service type, database, integration, real-time, auth)
2. Architectural decisions (feature-first structure, API client, auth strategy, error handling)
3. Scaffold with checklist (ALL items required)
4. Implement following patterns (3-layer: Controller → Service → Repository)
5. Test & verify
6. Handoff summary

**Key Principles:**
- Feature-first project structure
- Three-layer architecture (Controller → Service → Repository)
- Centralized typed config (fail-fast on missing env vars)
- Typed error hierarchy + global error handler
- Migrations always, N+1 prevention
- Structured JSON logging with request IDs

---

### 23. web-architect

**Trigger:** Full-stack web apps with Next.js, React, TypeScript.

**Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Node.js, PostgreSQL, Redis

**Workflow:**
1. Confirm product goals, rendering needs, data model, deployment constraints
2. Define repository layout, runtime boundaries, API shape
3. Implement user-facing flows with strong typing and server-client separation
4. Add database, cache, and local environment setup as needed
5. Verify with runnable commands and expected outputs

---

### 24. ui-ux-pro-max

**Trigger:** Any UI/UX work — design, build, implement, review, fix, improve.

**Contains:** 67 styles, 161 color palettes, 57 font pairings, 99 UX guidelines, 25 chart types, 15 tech stacks.

**Workflow:**
1. **Analyze user requirements** (product type, style keywords, industry, stack)
2. **Generate Design System** (REQUIRED step):
   ```bash
   python3 skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system [-p "Project Name"]
   ```
   Add `--persist` to save to `design-system/MASTER.md` + per-page overrides.
3. **Supplement with detailed searches** (domain: style, color, typography, chart, ux, landing)
4. **Stack guidelines** (default: `html-tailwind`)
   ```bash
   python3 skills/ui-ux-pro-max/scripts/search.py "<query>" --stack html-tailwind
   ```

**Common Professional Rules:**
- No emoji icons — use SVG icons (Heroicons, Lucide)
- Add `cursor-pointer` to all clickable elements
- Light mode: `bg-white/80` (not `/10`), text `#0F172A` (not `#94A3B8`)
- Floating navbar: `top-4 left-4 right-4` spacing
- Smooth transitions: `transition-colors duration-200`
- Responsive: 375px, 768px, 1024px, 1440px

**Pre-Delivery Checklist:**
- [ ] No emojis as icons, consistent icon set
- [ ] Hover states don't cause layout shift
- [ ] All clickable elements have cursor-pointer
- [ ] Light/dark mode contrast verified
- [ ] Responsive at all breakpoints
- [ ] Accessibility (alt text, labels, `prefers-reduced-motion`)

---

### 25. visual-forge

**Trigger:** Image, video, computer-vision workflows (generation, manipulation, analysis).

**Stack:** Python, OpenCV, PIL, HuggingFace Diffusers, FFmpeg, ComfyUI APIs

**Workflow:**
1. Identify media objective, input formats, output quality requirements
2. Choose simplest toolchain that fits
3. Implement scripts with deterministic inputs/outputs
4. Verify artifact path, format, quality
5. Document runtime requirements (models, GPU, external services)

---

### 26. neural-nexus

**Trigger:** AI/ML systems — model pipelines, RAG, fine-tuning, agentic AI, vector databases.

**Stack:** PyTorch, TensorFlow, LangChain, HuggingFace, ChromaDB, LoRA

**Workflow:**
1. Clarify AI objective, data sources, latency target, runtime constraints
2. Choose simplest architecture meeting the requirement
3. Define model, retrieval, storage, and evaluation boundaries
4. Implement scripts, services, or configuration
5. Verify with measurable outputs (eval criteria, latency checks)

---

### 27. syntax-surgeon

**Trigger:** Debug broken code with stack traces — root-cause analysis, tested patches, structured reviews.

**Workflow:**
1. Reproduce or inspect the failure precisely
2. Identify the most probable root cause and confidence level
3. Produce the smallest credible fix first
4. Verify with tests, reruns, or explicit reproduction commands
5. Report residual risks or unverified assumptions

---

### 28. web-search

**Trigger:** Need real-time information, current events, documentation, research, anything not in training data.

**Tools:**
- `web_search` — Search via local Ollama instance (query, max_results)
- `web_fetch` — Extract text content from a URL

**Guidelines:**
1. Start with `web_search` to find relevant pages
2. Use `web_fetch` to extract detailed content
3. Synthesize results clearly
4. Always cite sources with URLs
5. Prioritize authoritative sources

**Requires:** Ollama running locally with web search/fetch enabled.

---

### 29. eof-prompts-installer

**Trigger:** Install prompt files supplied as EOF-style blocks into correct local paths.

**Workflow:**
1. Identify target format (single file, bundle, template to embed)
2. Normalize destination (resolve path, create parent dir, stable filename)
3. Validate before install (check completeness, detect truncation, compare old vs new)
4. Install (write exactly as provided, no extra indentation)
5. Verify result (confirm file exists, preview first lines)

---

### 30. openclaw-connector

**Trigger:** Connect to / verify local OpenClaw gateway.

**Local Environment:**
- Config: `C:\Users\steph\.openclaw\openclaw.json`
- Node: `C:\Users\steph\.openclaw\node.json`
- Gateway: `ws://127.0.0.1:18789`

**Workflow:**
1. Check health: `openclaw gateway status --require-rpc --json`
2. Inspect config if needed
3. Repair if RPC down: stop → install --force → start → re-check status
4. Verify listener: `Get-NetTCPConnection -State Listen -LocalPort 18789`

---

### 31. vanguard-fleet-setup

**Trigger:** Inspect Vanguard fleet archive, recover OpenClaw configs, identify node roles.

**Workflow:**
1. List archive members: `tar -tf <archive>`
2. Read core config from archive: `tar -xOf <archive> ./openclaw.json`
3. Identify node inventory from `nodes/<ip>/...`
4. Probe service ports: SSH (22), Ollama (11434), OpenClaw (18789)
5. Rebuild local config (treat archived config as template, rotate secrets)
6. Verify local gateway, then remote endpoints

---

### 32. red-team-engagement-planner

**Trigger:** Plan authorized red-team engagements with scope, rules of engagement, logging, rollback.

**Workflow:**
1. Establish authority and scope (confirm owner, allowed systems, prohibited actions)
2. Define engagement controls (communication, logging, stop conditions, rollback)
3. Define measurable objectives (detection validation, response workflows)
4. Produce artifacts (scope summary, RoE, test matrix)

**Safety:** Use only for authorized environments. If authorization/scope missing, stop and ask.

---

### 33. red-team-detection-validator

**Trigger:** Design safe detection-validation exercises for authorized environments.

**Workflow:**
1. Define validation goal (what alert/analytic should fire, what proves success)
2. Build test matrix (host, platform, expected logs, rollback procedure)
3. Run approved, low-risk simulations only
4. Assess result (did detection fire, was alert timely, did response match)

**Safety:** Focus on observable behaviors and expected telemetry, NOT bypass methods.

---

### 34. red-team-report-writer

**Trigger:** Produce clear red-team reports for authorized engagements.

**Workflow:**
1. Build report frame (executive summary, scope, findings, recommendations)
2. Normalize each finding (title, severity, what observed, why matters, evidence, remediation)
3. Add engagement-level conclusions (detection strengths, control gaps, priority themes)

**Safety:** Use verified evidence only. Distinguish confirmed findings from assumptions.

---

### 35. jeffallan-skills (53 Specialist Sub-Skills)

A collection of 53 specialist development skills. Each contains its own `SKILL.md`.

| Sub-Skill | Domain |
|-----------|--------|
| `angular-architect` | Angular 17+ standalone components, NgRx, RxJS |
| `api-designer` | REST/GraphQL APIs, OpenAPI specifications |
| `architecture-designer` | System architecture, ADRs, scalability |
| `chaos-engineer` | Chaos experiments, failure injection, game days |
| `cli-developer` | CLI tools, argument parsing, shell completions |
| `cloud-architect` | Cloud architecture, multi-region, cost optimization |
| `code-documenter` | Code documentation, doc generation |
| `code-reviewer` | Code review patterns |
| `database-optimizer` | Database optimization, query tuning |
| `debugging-wizard` | Advanced debugging techniques |
| `devops-engineer` | CI/CD, infrastructure automation |
| `embedded-systems` | Embedded/firmware development |
| `fastapi-expert` | FastAPI, Python async APIs |
| `feature-forge` | Feature implementation workflows |
| `fine-tuning-expert` | LLM fine-tuning, optimization |
| `flutter-expert` | Flutter, Dart mobile/desktop |
| `fullstack-guardian` | Full-stack patterns and best practices |
| `game-developer` | Game development, engine patterns |
| `golang-pro` | Go, concurrency, performance |
| `graphql-architect` | GraphQL schema, resolvers |
| `java-architect` | Java architecture, Spring |
| `java-specialist` | Java patterns, JVM optimization |
| `kubernetes-specialist` | K8s, Helm, operators |
| `laravel-specialist` | Laravel, PHP patterns |
| `legacy-modernizer` | Legacy code modernization |
| `mcp-developer` | Model Context Protocol, tool servers |
| `microservices-architect` | Microservices, service mesh |
| `ml-pipeline` | ML pipelines, MLOps |
| `monitoring-expert` | Observability, monitoring, alerting |
| `nestjs-expert` | NestJS, TypeScript backend |
| `nextjs-developer` | Next.js, React SSR |
| `pandas-pro` | Pandas, data analysis |
| `playwright-expert` | Playwright E2E testing |
| `prompt-engineer` | Prompt engineering, LLM interaction |
| `python-pro` | Python, async, type hints |
| `rag-architect` | RAG systems, vector search |
| `rails-expert` | Ruby on Rails |
| `react-expert` | React, hooks, state management |
| `react-native-expert` | React Native, mobile |
| `rust-engineer` | Rust, memory safety, performance |
| `salesforce-developer` | Salesforce, Apex, integrations |
| `secure-code-guardian` | Secure coding, vulnerability prevention |
| `security-reviewer` | Security review, threat modeling |
| `spark-engineer` | Apache Spark, big data |
| `spring-boot-engineer` | Spring Boot, Java microservices |
| `sql-pro` | SQL optimization, database design |
| `sre-engineer` | Site reliability, incident response |
| `swift-expert` | Swift, iOS development |
| `terraform-engineer` | Terraform, IaC |
| `test-master` | Testing strategies, coverage |
| `typescript-pro` | TypeScript, type system |
| `vue-expert` | Vue.js, Composition API |
| `websocket-engineer` | WebSocket, real-time communication |
| `wordpress-pro` | WordPress, PHP, plugins |

---

### 36. skills (Deployment Skills Collection)

| Sub-Skill | Purpose |
|-----------|---------|
| `deploy-to-vercel` | Deploy to Vercel, auto-detects 40+ frameworks |
| `netlify-cli-and-deploy` | Full Netlify CLI workflow |
| `netlify-deploy` | Deploy to Netlify using CLI |

---

## Skills Directory Location

- **Source:** `C:/Users/steph/OneDrive/Desktop/pi skills/`
- **Codex loads from:** `C:/Users/steph/.codex/skills/`
- **This project:** `C:/Users/steph/OneDrive/Desktop/Rido/`

---

## Key Principles (All Skills)

1. **Check skills first** — Even 1% chance means invoke it
2. **Process before implementation** — brainstorming → writing-plans → execution
3. **TDD for code AND skills** — Test with failing case first, then implement
4. **Evidence before assertions** — Run verification before claiming completion
5. **Cite sources** — Always link URLs when providing web information
6. **Progressive disclosure** — Keep SKILL.md under 500 lines, move heavy docs to references/
7. **One question at a time** — Don't overwhelm with multiple questions
8. **YAGNI ruthlessly** — Remove unnecessary features from all designs
9. **Fresh verification** — Never rely on previous runs or assumptions
10. **Stop when blocked** — Ask for clarification rather than guessing