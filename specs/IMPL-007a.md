# Implementation Tracker: SPEC-007a

**Spec**: UI Foundation — Full Feature Dashboard
**Started**: 2025-01-20T14:00:00Z
**Last Updated**: 2025-01-20T14:00:00Z
**Current Stage**: 1
**Status**: in_progress

## Progress

| Stage | Name | Status | Completed |
|-------|------|--------|-----------|
| 1 | Parse | ⏳ | - |
| 2 | Audit | ⬜ | - |
| 3 | Plan | ⬜ | - |
| 4 | Build | ⬜ | - |
| 5 | Verify | ⬜ | - |
| 6 | Document | ⬜ | - |

## Current State

**Working on**: Stage 1 — Extracting acceptance criteria, guardrails, and dependencies
**Blockers**: None identified yet
**Next action**: Complete parse, gate for user approval

## Stage Outputs

### Stage 1: Parse

**Acceptance Criteria** (from SPEC-007a §Acceptance Criteria):

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | Design tokens imported | Colours render correctly |
| 2 | Three-zone layout renders | Queue left, Now Card centre, Actions right |
| 3 | Progress header shows session stats | "Today: X of Y" with progress bar |
| 4 | Queue shows priority indicators | P1 🔴 / P2 🟠 / P3 🟡 badges |
| 5 | Queue sorted by priority | P1 first, then P2, then P3 |
| 6 | Now Card displays context capsule | Why/Next/When/Source rows |
| 7 | Signal pattern cards show | Competitor, urgent, volume, etc. |
| 8 | Contact card shows confidence | Problem Owner vs HR Fallback badge |
| 9 | J/K navigation works | Keyboard moves through queue |
| 10 | E/S/D actions work | Triggers appropriate handlers |
| 11 | Z undo works | Reverts last action within 30s |
| 12 | Undo toast shows countdown | Progress bar animates down |
| 13 | ? shows shortcut overlay | Modal with all shortcuts |
| 14 | Dismiss modal shows reasons | Propagation warning works |
| 15 | Empty state shows | When queue empty |
| 16 | Error state shows | On API failure |

**Guardrails Applicable**:
- **G-012**: UI must support keyboard-only operation
- **G-013**: Progress feedback required for queue processing
- **G-014**: Single-focus display (one opportunity at a time)
- (Also implicit: G-002 Command Queue for emails — already in MVP, inherited)

**Dependencies**:

| Dependency | Status | Notes |
|------------|--------|-------|
| SPEC-007b (MVP Dashboard) | ✅ Complete | Deployed at dashboard.peelplatforms.co.uk |
| Phase 1b (Competitor Monitoring) | ✅ Complete | WF9 live, Bright Data connected |
| Schema expansion | ⏳ Pending | 6 new fields needed |
| Workflow updates (WF3 + WF5) | ⏳ Pending | Priority/contact type output |
| V1 Codebase | Reference | Source for porting patterns |

**Schema Prerequisites** (must exist before build):

*Opportunities Table Additions:*
| Field | Type | Purpose |
|-------|------|---------|
| `priority_tier` | Single Select | P1, P2, P3 |
| `priority_signals` | Long Text | JSON array of detected patterns |
| `response_window` | Single Select | Same Day, Within 48h, This Week |
| `contact_type` | Single Select | Problem Owner, Deputy, HR Fallback |

*Contacts Table Additions:*
| Field | Type | Purpose |
|-------|------|---------|
| `research_confidence` | Number (0-100) | Confidence in contact accuracy |
| `confidence_sources` | Long Text | JSON array of sources |

**Workflow Requirements**:

*WF3 Classification Updates:*
- Add `priority_tier` output (P1/P2/P3)
- Add `priority_signals` JSON array output
- Add `response_window` output
- Priority rules: Competitor → P1, Urgent language → P1, Volume → P2, Specialist → P2, Standard → P3

*WF5 Enrichment Updates:*
- Add `contact_type` output (problem_owner/deputy/hr_fallback)
- Add `research_confidence` output (0-100)
- Add `confidence_sources` JSON array
- Contact type rules based on job title patterns

**Tech Stack** (inherited from SPEC-007b + additions):
- Next.js 14.x (App Router) — existing
- React 18.x — existing
- TypeScript 5.x — existing
- TanStack Query 5.x — existing
- Zustand 5.x — **upgrade from React Context**
- Tailwind CSS 4.x — existing
- shadcn/ui — existing

**Components to Build/Port**:

| Component | Source | Status |
|-----------|--------|--------|
| tokens.css | V1 | Port design tokens |
| session-store.ts | V1 | Port Zustand store |
| ui-store.ts | V1 | Port Zustand store |
| SessionHeader | V1 | Port |
| QueuePanel | Enhance | Add priority sorting/badges |
| NowCard | Enhance | Add context capsule, signal patterns |
| SignalPatternCards | NEW | Build from scratch |
| ContactCard | Enhance | Add confidence indicator |
| ComposerDock | Existing | Minor enhancements |
| DismissModal | Existing | Verify works |
| Toast (with undo) | V1 | Port undo countdown |
| ShortcutOverlay | V1 | Port |
| Badge (priority variants) | Enhance | Add P1/P2/P3 variants |

**Out of Scope** (explicitly):
- Command palette (⌘K)
- Pin tray
- Mobile responsive
- Morning Brief rituals (SPEC-008)

### Stage 2: Audit
*To be completed after Stage 1 gate*

### Stage 3: Plan
*To be completed after Stage 2 gate*

### Stage 4: Build
*To be completed after Stage 3 gate*

### Stage 5: Verify
*To be completed after Stage 4 gate*

### Stage 6: Document
*To be completed after Stage 5 gate*

---

## Notes

- This spec enhances the MVP (SPEC-007b), doesn't replace it
- Primary enhancements: Priority display, contact confidence, undo system, session tracking
- Requires schema + workflow changes before UI work can be tested with real data
- Can build UI components in parallel with schema changes, but full integration test needs data
