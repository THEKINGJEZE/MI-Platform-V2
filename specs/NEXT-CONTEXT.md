# Context Brief: SPEC-007a (Full UI Foundation)

Generated: 20 January 2025
For: Claude Chat spec refinement/review

---

## Current State

**Phase**: 1c — Dashboard MVP
**Goal**: Validate ≤15 min timing criterion via manual test
**Blockers**: None
**Dashboard Status**: Deployed at https://dashboard.peelplatforms.co.uk/review (pending timing validation)

---

## SPEC-007a Overview

SPEC-007a already exists at `specs/SPEC-007a-ui-foundation.md`. This is a **692-line spec** that defines enhancements to the MVP dashboard.

**Status**: ⏸️ Deferred (per Spec Index in ROADMAP.md)
**Trigger**: Phase 1c MVP validated + Phase 1b complete + schema expanded

**Key Features Defined**:
- Priority tier display (P1/P2/P3 based on signal patterns)
- Signal pattern cards (replacing removed dual-track scoring)
- Contact confidence indicators
- Response window display
- Enhanced badge system
- Session persistence (localStorage)

---

## What SPEC-007a Requires (Prerequisites)

From ROADMAP.md "Future Features" and the spec itself:

| Prerequisite | Status | Notes |
|--------------|--------|-------|
| SPEC-007b complete | ✅ Deployed | Pending timing validation |
| Phase 1b complete | ✅ Complete | Competitor monitoring live |
| Schema expansion | ❌ Not done | 4 fields on Opportunities, 2 on Contacts |

### Schema Additions Required

**Opportunities table** (per ROADMAP.md Schema Evolution):
- `priority_tier` (Single Select: P1, P2, P3)
- `priority_signals` (Long Text) — JSON array of detected patterns
- `response_window` (Single Select: Same Day, Within 48h, This Week)
- `contact_type` (Single Select: Problem Owner, Deputy, HR Fallback)

**Contacts table**:
- `research_confidence` (Number 0-100)
- `confidence_sources` (Long Text)

### Workflow Updates Required

- **WF3 (Classification)** must set:
  - `priority_tier` based on signal patterns
  - `priority_signals` JSON with detected patterns
- **WF5 (Enrichment)** must set:
  - `contact_type` based on contact research
  - `research_confidence` on Contact record

---

## Acceptance Criteria (from SPEC-007a)

| # | Criterion |
|---|-----------|
| 1 | Design tokens imported |
| 2 | Three-zone layout renders |
| 3 | Progress header shows session stats |
| 4 | Queue shows priority indicators (P1 🔴 / P2 🟠 / P3 🟡) |
| 5 | Queue sorted by priority |
| 6 | Now Card displays context capsule (Why/Next/When/Source) |
| 7 | Signal pattern cards show |
| 8 | Contact card shows confidence (Problem Owner vs HR Fallback) |
| 9 | J/K navigation works |
| 10 | E/S/D actions work |
| 11 | Z undo works |
| 12 | Undo toast shows countdown |
| 13 | ? shows shortcut overlay |
| 14 | Dismiss modal shows reasons |
| 15 | Empty state shows |
| 16 | Error state shows |

---

## Existing Assets

### Skills (reference for design patterns)
- `skills/uk-police-design-system/SKILL.md` — Design tokens, dark mode, semantic colours
- `skills/action-oriented-ux/SKILL.md` — Three-Zone Model, 2-minute lead loop
- `skills/adhd-interface-design/SKILL.md` — Progress feedback, undo patterns, focus mode
- `skills/b2b-visualisation/SKILL.md` — Score displays, badges, sparklines

### Reference Data
- `reference-data/uk-police-forces.json` — 48 forces with metadata
- `reference-data/competitors.json` — 7 competitor definitions (for P1 signal detection)
- `reference-data/capability-areas.json` — 14 capability areas

### Patterns
- `patterns/force-matching.js` — UK police force name matching (G-005)
- `patterns/indeed-keywords.json` — Indeed search keywords
- `patterns/job-portal-filters.js` — Filter false positives (G-010)

### Prompts
- `prompts/job-classification.md` — Signal classification prompt (needs priority_tier output)
- `prompts/opportunity-enrichment.md` — Enrichment prompt (needs contact_type output)
- `prompts/competitor-interception.md` — Competitor signal handling

### Existing Specs (dependencies)
- `specs/SPEC-007b-dashboard-mvp.md` — MVP foundation (✅ Deployed)
- `specs/SPEC-001-airtable-schema.md` — Base schema
- `specs/SPEC-003-signal-classification.md` — Classification workflow (needs update)
- `specs/SPEC-004-opportunity-creator.md` — Opportunity creation
- `specs/SPEC-005-opportunity-enricher.md` — Enrichment workflow (needs update)

### Dashboard Codebase (exists)
- Live at: `https://dashboard.peelplatforms.co.uk/review`
- Built with: Next.js 14, Tailwind, Zustand, SWR

---

## Applicable Guardrails

| ID | Rule | Relevance to SPEC-007a |
|----|------|------------------------|
| G-002 | Command Queue for Email Actions | Email actions go through queue, not direct |
| G-011 | Upsert Only | Status updates must use upsert patterns |
| G-013 | Competitor Signals Get P1 Priority | P1 tier auto-assigned for competitor signals |
| G-014 | Contact the Problem Owner | Contact type indicator shows fallback warning |
| G-015 | Message Structure | Drafts follow Hook → Bridge → Value → CTA |

**UI-Specific Guardrails** (from specs):
- G-012: UI must support keyboard-only operation ✓
- G-013: Progress feedback required for queue processing ✓
- G-014: Single-focus display (one opportunity at a time) ✓

---

## Recent Decisions

| Decision | Date | Impact on SPEC-007a |
|----------|------|---------------------|
| **A8**: Three-Zone Dashboard Layout | 19 Jan | Confirms layout pattern |
| **P1c-01**: MVP Before Full UI | 19 Jan | SPEC-007a explicitly deferred until MVP validated |
| **P1c-02**: Skills Are Reference | 19 Jan | Skills inform design but don't mandate features |
| **P1c-03**: Schema Evolution Documented | 19 Jan | SPEC-007a fields listed in ROADMAP.md |

---

## Strategy Alignment Check

Before implementing SPEC-007a, verify alignment with:

### SALES-STRATEGY.md Key Principles

| Principle | SPEC-007a Implementation |
|-----------|-------------------------|
| "Job postings are warm leads, not classifications" | ✅ No MS/AG scoring — priority tiers only |
| "Contact the problem owner" | ✅ Contact type indicator with HR fallback warning |
| "Competitor signals = confirmed opportunity" | ✅ P1 priority, prominent pattern display |
| "Hook → Bridge → Value → CTA structure" | ✅ Drafts follow this (via WF5) |

### Recent Change (20 Jan)
The spec was updated to **remove dual-track scoring** and replace it with:
- Priority tier model (P1/P2/P3)
- Signal pattern cards
- Response window indicators

This aligns with SALES-STRATEGY.md which says:
> "We are not trying to decide 'is this Agency or Managed Services?'"

---

## What's Already Built vs What SPEC-007a Adds

### Already in SPEC-007b (✅ Deployed)
- Three-zone layout
- Keyboard navigation (J/K/E/S/D/Z)
- Progress header
- Basic priority badge (High/Medium/Low)
- Why Now + Signals summary
- Basic contact display
- Toast with undo
- Empty/Error states

### SPEC-007a Additions
- Priority tier display (P1 🔴 / P2 🟠 / P3 🟡)
- Priority-based queue sorting
- Signal pattern cards (why this priority)
- Response window indicator (Same Day / 48h / This Week)
- Contact type badge (Problem Owner vs HR Fallback)
- Contact confidence indicator
- Enhanced badge system
- Session persistence (localStorage for stats)

---

## Notes for Claude Chat

**If reviewing/refining SPEC-007a:**

1. **The spec exists** — at `specs/SPEC-007a-ui-foundation.md` (692 lines)
2. **Dual-track scoring removed** — already done on 20 Jan, aligned with Sales Strategy
3. **Prerequisites not met** — schema expansion not done, MVP not validated
4. **May need minor updates** for:
   - Ensuring classification prompt changes are spec'd for WF3
   - Ensuring enrichment prompt changes are spec'd for WF5
   - Verifying badge variants match what MVP already has

**Reference assets by path:**
- Design tokens: `skills/uk-police-design-system/SKILL.md`
- Three-Zone Model: `skills/action-oriented-ux/SKILL.md`
- Priority model: `docs/SALES-STRATEGY.md` (Lead Prioritisation section)

**When implementation is triggered:**
1. First: Validate MVP timing criterion (≤15 min for 5 opps)
2. Then: Expand schema (6 new fields)
3. Then: Update WF3/WF5 to populate new fields
4. Then: Enhance dashboard components

---

## Open Questions for Clarification

1. **Timing**: When should SPEC-007a implementation begin? After MVP timing test passes?
2. **Workflow updates**: Should the spec include explicit updates to SPEC-003 and SPEC-005 prompts?
3. **Session persistence**: localStorage for stats only, or full session state?
4. **Deployment**: VPS (current) or Vercel (spec mentions)?

---

*Generated by /prep-spec command for Claude Chat spec work*
