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
**Decision**: Claude Chat for strategy, Claude Code for execution  
**Why**: Clear roles prevent drift, handoff patterns ensure sync  
**Files**: `docs/CHAT-INSTRUCTIONS.md`, `docs/SYNC-PROTOCOL.md`

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
**Decision**: Create simplified dashboard spec (SPEC-007b) that works with current 4-table schema. Defer full UI features (SPEC-007a) until schema supports them.
**Context**: V1 skills describe dual-track scoring, score breakdowns, contact confidence — features requiring schema fields that don't exist. Building the full UI would require premature schema expansion.
**Resolution**:
- SPEC-007b: Dashboard MVP with Three-Zone layout, keyboard nav, progress feedback, undo
- SPEC-007a: Deferred until Phase 1b complete + schema expanded
- SPEC-008: Deferred until dashboard validated + overnight tracking exists
**Why**: Avoids V1's mistake (complexity creep). Build what works now, enhance later.
**Specs affected**: SPEC-007a (deferred), SPEC-007b (created), SPEC-008 (deferred)

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

*None yet — add as building starts*

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
