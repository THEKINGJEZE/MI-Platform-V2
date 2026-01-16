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

---

### Tier 2 — Phase-Level (Current Phase Only)

*None yet — add as Phase 1 progresses*

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
