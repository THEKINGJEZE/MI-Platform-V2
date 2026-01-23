# MI Platform — Decision Log

## Purpose
Track decisions that **actively affect current work**. Not a historical record — git is for that.

## Rules
1. **Max 20 active decisions** — if adding #21, archive the oldest or least relevant
2. **Only log decisions that Claude needs to remember** — not every choice
3. **Monthly archive rotation** — move stale decisions to `docs/archive/decisions-YYYY-MM.md`
4. **Tier 1 stays forever** — architectural decisions that define the project

---

## Decision Tiers

| Tier | What Goes Here | Lifespan | Example |
|------|----------------|----------|---------|
| **1 - Architectural** | Core tech choices, patterns | Permanent | "Use Airtable not Postgres" |
| **2 - Phase-Level** | Decisions for current phase | Until phase complete | "Phase 1 skips email integration" |
| **3 - Implementation** | How we're building something | Until built | "Use polling not webhooks for Indeed" |

**Don't log**: Session-level choices, obvious decisions, things in git commits

---

## Active Decisions (Max 20)

### Tier 1 — Architectural (Permanent)

#### A1: Three-Layer Document Architecture
**Date**: January 2025  
**Decision**: ANCHOR.md (immutable) + CLAUDE.md (lean index) + detail docs (on-demand)  
**Why**: Prevents document decay, protects mission, fits context windows

#### A2: Airtable as Primary Database
**Date**: January 2025  
**Decision**: Airtable over PostgreSQL/Supabase  
**Why**: Flexible schema, good API, visual debugging, low maintenance

#### A3: Self-Hosted n8n
**Date**: January 2025  
**Decision**: Self-host n8n, not Zapier/Make/cloud n8n  
**Why**: Claude API integration, complex workflows, no per-execution costs

#### A4: Two-Layer Claude Architecture
**Date**: 16 January 2025
**Status**: ⚠️ SUPERSEDED by A11 (23 January 2026)
**Decision**: Claude Chat for strategy, Claude Code for execution
**Why**: Clear roles prevent drift, handoff patterns ensure sync
**Files**: `docs/archive/chat-instructions-archived.md`, `docs/archive/sync-protocol-archived.md`

#### A11: Single-Layer Claude Architecture (Code-Only)
**Date**: 23 January 2026
**Decision**: Consolidate from two-layer (Chat + Code) to single-layer (Code-only) architecture
**Supersedes**: A4 (Two-Layer Claude Architecture)
**Context**:
- Strategy documents now on filesystem (`docs/STRATEGY*.md`), not Chat Project Knowledge
- Code has Plan mode for strategic thinking
- Code has specialized agents (alignment-checker, signal-triage, workflow-builder)
- Manual handoffs created friction without preventing drift
**Why**:
- Reduced fragmentation — no copy-paste between interfaces
- Better document awareness — Code always knows project state
- Less drift risk — single source of context
- Lower coordination overhead — James not needed as sync layer
**Mitigation for strategic thinking**: Plan mode, alignment-checker agent, ANCHOR.md checkpoints
**Files archived**: `docs/archive/sync-protocol-archived.md`, `docs/archive/chat-instructions-archived.md`
**New file**: `.claude/rules/spec-creation.md` (spec drafting rules preserved from Chat instructions)

#### A5: Hook-Based Session Management
**Date**: January 2025  
**Decision**: Use Claude Code hooks for context injection and state capture  
**Why**: Automated discipline beats manual discipline

#### A6: Document Hygiene Protocol
**Date**: 16 January 2025  
**Decision**: Enforce document size limits with archive rotation  
**Why**: Previous project had 300+ decisions, unusable. Keep only what's actively needed.  
**Limits**: STATUS.md <100 lines, DECISIONS.md <20 active, CLAUDE.md <80 lines  
**Files**: `docs/DOCUMENT-HYGIENE.md`, `.claude/commands/hygiene-check.md`

#### A7: Single Source of Truth + Dependency Map
**Date**: 16 January 2025  
**Decision**: Each piece of information lives in ONE document. Others link, never copy.  
**Why**: README.md had duplicated info (phase goals, commands) that drifted from source docs.  
**Rule**: If same info exists in two places, delete the duplicate.  
**Files**: `docs/DEPENDENCY-MAP.md`, updated `README.md`

#### A8: Three-Zone Dashboard Layout + Morning Brief
**Date**: 19 January 2025  
**Decision**: Adopt V1's three-zone dashboard layout (Queue | Context | Action) and Morning Brief ritual as the canonical UI patterns for V2.  
**Context**: Strategy document Section 11 specified a "vertical scroll with sectioned card list" design. V1 implemented a three-zone split instead. Skills were created to codify V1's patterns.  
**Resolution**: The skills represent tested, deliberate design. The strategy document Section 11 was theoretical and never built. Update strategy to match skills, not vice versa.  
**Rationale**:
- V1's layout was tested and works well for ADHD workflows
- Skills codify the patterns: Action-Oriented UX (three-zone), ADHD Interface Design (Morning Flow Protocol)
- The real problem with V1 was backend complexity, not UI design
- V2's simplified backend (fewer tables, cleaner workflows) solves the actual issue  
**Action**:
- SPEC-007a aligned as written (implements Three-Zone Model)
- SPEC-008 aligned as written (implements Morning Flow Protocol)
- Strategy document Section 11 to be updated to match skills  
**Skills referenced**: `action-oriented-ux`, `adhd-interface-design`, `uk-police-design-system`, `notification-system`, `b2b-visualisation`

#### A10: Quality-First Pipeline Fix Before New Features
**Date**: 21 January 2025  
**Decision**: Fix core pipeline quality issues before implementing agentic enrichment or other new features  
**Context**: Three ChatGPT audits (5.2, 5.2 Pro, 5.2 Research) revealed signal classification at ~20% accuracy, 37-53% duplicate signals, 78% competitor opportunities not flagged P1. Claude Code verified root causes in actual workflow code.  
**Approach**:
- Phase 1: Fix classification gate logic and prompts
- Phase 1b: Implement upsert deduplication
- Phase 2-3: Fix opportunity creation and enrichment
- Phase 4: Clean up existing bad data
- Phase 5: Then implement agentic enrichment (SPEC-010)  
**Why**: Garbage-in-garbage-out. Adding sophisticated agentic workflows on top of broken classification would amplify problems, not solve them.  
**Files**: `docs/QUALITY-IMPROVEMENT-PLAN.md`, `docs/archive/audits-2025-01-21/`

#### A9: V1 Dashboard Code Migration
**Date**: 20 January 2025
**Decision**: Replace V2 dashboard code with V1's proven codebase, then rewire data layer for V2 schema
**Context**: Claude Code struggled to match V1's UI quality when building from scratch. V1 has 30+ polished components, rich type system, clean separation between UI and data layers.
**Approach**:
- Copy V1's `dashboard-react/` into V2's `dashboard/`
- Strip features V2 doesn't support yet (contracts, follow-ups, dual-track scoring, email actions)
- Rewrite `lib/airtable.ts` to fetch from V2's 4-table schema
- Simplify type definitions where V2 is simpler
**Why**: Reverse-engineering working code to fit a new backend is more tractable than recreating quality from scratch. UI components don't care where data comes from — they render typed objects.
**Supersedes**: P1c-01 (dashboard MVP approach) — now migrating proven code instead of building minimal version
**Spec**: SPEC-009 — Created, ready for implementation

#### A12: V1 Vision Reprioritisation
**Date**: 23 January 2026
**Decision**: Reprioritise two features from V1's UNIFIED-COMMAND-VISION.md into earlier phases
**Context**: V1 created a comprehensive "Unified Command Vision" document describing ADHD-focused enhancements beyond market intelligence. V2 had deferred most of these to Phase 6+. After review, two features should come earlier.
**Changes**:
1. **Relationship Decay Alerts** → Move to Phase 2a (alongside email integration)
   - Daily scan for contacts going cold (14-45 days)
   - Dashboard section "Relationships Need Attention"
   - AI-suggested touchpoints (not salesy)
   - Why: High ADHD value — prevents "forgetting to follow up"
2. **Social Engagement System** → Add as new Phase 3
   - Daily 15-min engagement queue (5 posts: 3 comment, 2 like)
   - Priority accounts (police contacts + industry influencers)
   - AI-suggested comments
   - Streak tracking
   - Why: Addresses ADHD inconsistency with social presence
**Not reprioritised** (confirmed OK to defer):
- Pre-call briefs → Phase 7
- Weekly planning ritual → Phase 7
- Deal health monitoring → Phase 7+
**Files affected**:
- `ROADMAP.md` — Updated phase structure, added Phase 3 and Phase 7
- `specs/SPEC-013-social-engagement.md` — Created
- `docs/UNIFIED-COMMAND-VISION.md` — Reference document (in main repo)
**Rationale**: V1 features with highest ADHD value (preventing forgotten follow-ups, maintaining social presence) should come earlier. Features requiring less frequent interaction (pre-call briefs, weekly planning) can wait.

#### A13: Hook-Enforced Spec Creation Process
**Date**: 23 January 2026
**Decision**: Enforce spec creation process via Claude Code hooks, not voluntary compliance
**Context**: After moving from two-layer (Chat + Code) to single-layer (Code-only) architecture (A11), spec creation had good documentation but no enforcement. Evidence showed `/prep-spec` was never run before creating SPEC-012 or SPEC-013.
**Problem Solved**: Without Chat's "strategic layer" review, there was no hard gate preventing specs from being created without proper context gathering, acceptance criteria copying, or guardrail review.
**Implementation**:
1. **Hook enforcement**: `.claude/hooks/pre-edit-check.sh` now blocks writes to `specs/SPEC-*.md` if `specs/NEXT-CONTEXT.md` doesn't exist (exit code 2)
2. **Staleness warning**: Warns (but doesn't block) if context brief is >24h old
3. **Pre-flight checklist**: Every spec requires a visible checklist section documenting compliance
4. **Automated audit**: `consistency-check.cjs` now validates specs have checklists
5. **Session protocol**: CLAUDE.md updated to include spec creation step
**Files affected**:
- `.claude/hooks/pre-edit-check.sh` — Added spec creation gate
- `.claude/rules/spec-creation.md` — Documented hook enforcement
- `specs/README.md` — Added pre-flight checklist template
- `scripts/consistency-check.cjs` — Added spec validation
- `CLAUDE.md` — Added spec creation to session protocol
**Why**: Maximum drift prevention. Hooks are the strongest enforcement mechanism available in Claude Code. This ensures specs are always created with proper strategic context.

---

### Tier 2 — Phase-Level (Current Phase Only)

#### P1-01: Airtable Interface for Phase 1 Review UI
**Date**: January 2025 (logged retroactively 19 Jan)
**Decision**: Use Airtable Interface instead of React dashboard for Phase 1 Monday review
**Strategy divergence**: Section 11 specifies Next.js dashboard
**Why accepted**: Speed-to-value — validate pipeline before investing in custom UI. Airtable Interface delivers ≤15 min review target.
**Deferred to**: Phase 2 or later — React dashboard per Section 11
**Spec**: SPEC-006 Section 1

#### P1-02: React Dashboard as Phase 1c
**Date**: 19 January 2025
**Decision**: Custom React dashboard (strategy Section 11) designated as Phase 1c, spec SPEC-007
**Relationship**: Parallel to Phase 1b (competitors), both depend on Phase 1 complete
**Replaces**: Airtable Interface from SPEC-006 (which remains as fallback)
**Reference**: Strategy Section 11, Section 13, `docs/archive/dashboard-v1-review.md`

#### P1c-01: Dashboard MVP (SPEC-007b) Before Full UI (SPEC-007a)
**Date**: 19 January 2025
**Status**: Superseded by A9 (V1 migration approach)
**Decision**: Create simplified dashboard spec (SPEC-007b) that works with current 4-table schema. Defer full UI features (SPEC-007a) until schema supports them.
**Context**: V1 skills describe dual-track scoring, score breakdowns, contact confidence — features requiring schema fields that don't exist. Building the full UI would require premature schema expansion.
**Resolution**:
- SPEC-007b: Dashboard MVP with Three-Zone layout, keyboard nav, progress feedback, undo
- SPEC-007a: Deferred until Phase 1b complete + schema expanded
- SPEC-008: Deferred until dashboard validated + overnight tracking exists
**Why**: Avoids V1's mistake (complexity creep). Build what works now, enhance later.
**Specs affected**: SPEC-007a (deferred), SPEC-007b (created), SPEC-008 (deferred)
**Note**: This decision led to SPEC-007b, which has been superseded by SPEC-009 (V1 migration) per Decision A9.

#### P1c-02: Skills Are Reference, Not Requirements
**Date**: 19 January 2025
**Decision**: Skills folder contains patterns validated in V1, but they are reference material for future phases, not mandatory implementations for Phase 1.
**Context**: 13 skills migrated from V1 covering scoring, visualisation, notifications, procurement — patterns that require infrastructure V2 doesn't have yet.
**Resolution**: Created `skills/README.md` documenting which skills to use when. Skills inform design but don't define scope.
**Why**: Prevents scope creep while preserving valuable knowledge.
**Files**: `skills/README.md`

#### P1c-03: Schema Evolution Path Documented
**Date**: 19 January 2025
**Decision**: Document exactly how schema will grow across phases, not just current state.
**Context**: V1 suffered from undocumented schema growth — too many tables, unclear field purposes.
**Resolution**: ROADMAP.md now includes "Schema Evolution" section showing:
- Current: 4 tables (Forces, Signals, Opportunities, Contacts)
- Phase 1c: +4 fields on Opportunities (draft_subject, draft_body, actioned_at, skip_reason)
- Future SPEC-007a: +7 fields for scoring
- Future SPEC-008: +2 fields for follow-ups
**Why**: Prevents ad-hoc schema changes. Every addition planned.
**Files**: `ROADMAP.md` (Schema Evolution section)

---

### Tier 3 — Implementation (Until Built)

#### I1: HubSpot as Primary Data Source for Relationship Tracking
**Date**: 23 January 2026
**Decision**: Use HubSpot (via MCP) as the primary source for contact engagement and relationship decay, not Airtable
**Context**: Phase 2a relationship decay needs engagement data. HubSpot already has:
- `notes_last_contacted`, `hs_last_sales_activity_timestamp` — engagement timestamps
- `hs_predictivecontactscore_v2` — Breeze AI scoring
- `hs_sales_email_last_replied`, `hs_email_last_open_date` — email engagement
- Deal associations and pipeline stages
**Why**: HubSpot is already the CRM with rich engagement data. Duplicating to Airtable would create sync complexity and data staleness.
**Pattern**: n8n workflows query HubSpot MCP for decay calculations → surface alerts in dashboard
**Affects**: WF4 (Decay Scanner), Dashboard relationship alerts section

#### I2: Email Classifier Uses LLM Chain (Not AI Agent)
**Date**: 23 January 2026
**Decision**: Email classification uses LLM Chain (direct API call) not AI Agent (tool-calling)
**Context**: SPEC-012 specified LLM Chain for speed. Email classifier workflow (email-classifier.json) implements this correctly.
**Why**: AI Agents add latency for tool discovery. Classification is a simple input→output task, not multi-step reasoning.
**Implementation**: `n8n/workflows/email-classifier.json` uses OpenAI node with gpt-4o-mini, no agent nodes
**Status**: ✅ Implemented and tested (21 emails classified successfully)

#### I3: UK Public Sector Contact Auto-Creation (Not Just Police)
**Date**: 23 January 2026
**Decision**: Contact auto-creation workflow (Phase 2a-8) will create HubSpot contacts for ALL UK public sector domains, not just police
**Context**: Original scope was police contacts only (`*.police.uk`). Discussion expanded scope to capture all public sector relationships.
**Domains**:
- `*.police.uk` — Police forces
- `*.gov.uk` — Central government
- `*.nhs.uk` — NHS
- `*.mod.uk` — Ministry of Defence
- `*.parliament.uk` — Parliament
**Why**: James's business relationships extend beyond police to broader public sector. Same workflow logic applies.
**Affects**: Phase 2a-8 (Contact Auto-Creator workflow), SPEC-012 §10

#### I4: Include Closed Won Contacts in Relationship Decay Tracking
**Date**: 23 January 2026
**Decision**: Relationship decay scanner must include contacts associated with Closed Won deals, not just active pipeline
**Context**: Original design only tracked contacts on active deals. "Closed Won contacts are likely now our clients and we need to ensure regular contact with them."
**Two-Tier Thresholds**:
- **Active Pipeline**: 8/15/30 days (tight — silence kills deals)
- **Closed Won (Clients)**: 30/60/90 days (looser — monthly check-ins are fine)
**Dashboard Sections**:
- "Deal Contacts Going Cold" — Active pipeline
- "Client Check-ins Due" — Closed Won (existing clients)
- "Organisations Going Quiet" — Force-level (any contact)
**Why**: Client retention is as important as new business. ADHD risk is forgetting to maintain relationships.
**Affects**: Phase 2a-7 (Decay Scanner workflow), Dashboard design, SPEC-012 §6

---

## Archive Log

| Date | Decisions Archived | Location |
|------|-------------------|----------|
| *None yet* | | |

---

## When to Add a Decision

Ask yourself:
1. Will Claude need to remember this next week? → Add it
2. Is this just "how I did X today"? → Git commit message instead
3. Does this affect multiple components? → Add it
4. Is this reversible easily? → Probably don't log it

## When to Archive

Monthly, or when:
- Decision count exceeds 20
- A phase completes (archive that phase's Tier 2 decisions)
- A feature ships (archive its Tier 3 decisions)
