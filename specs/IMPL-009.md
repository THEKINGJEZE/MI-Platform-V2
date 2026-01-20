# Implementation Tracker: SPEC-009

**Spec**: Dashboard V1 Migration
**Started**: 2025-01-20 21:00
**Last Updated**: 2025-01-20 21:00
**Current Stage**: 3
**Status**: in_progress

## Progress

| Stage | Name | Status | Completed |
|-------|------|--------|-----------|
| 1 | Parse | ✅ | 2025-01-20 |
| 2 | Audit | ✅ | 2025-01-20 |
| 3 | Plan | ✅ | 2025-01-20 |
| 4 | Build | ⬜ | - |
| 5 | Verify | ⬜ | - |
| 6 | Document | ⬜ | - |

## Current State

**Working on**: Stage 3 complete, ready for Stage 4 BUILD
**Blockers**: None
**Next action**: Execute Phase A (Strip Dead Code) — 8 file deletions

## Stage Outputs

### Stage 1: Parse

**Acceptance Criteria (19 total):**
1. App builds without errors (`npm run build` succeeds)
2. Queue loads opportunities from V2 Airtable
3. Three-Zone layout renders (Queue left, Now Card centre, Composer right)
4. Keyboard navigation works (J/K moves through queue)
5. Priority badges display (Hot/High/Medium/Low)
6. Why Now context shows (AI-generated summary)
7. Contact card shows (Name, role, email)
8. Send action works (updates status to "sent")
9. Skip action works (removes from queue)
10. Progress header updates (shows X of Y processed)
11. Design tokens applied (dark theme, correct colours)
12. No dual-track UI visible
13. No contracts UI visible
14. No email actions route
15. Route is `/review` not `/focus`
16. No dual-track UI anywhere (grep returns zero hits)
17. Sort order correct (Hot first, then by date within tier)
18. Docker build succeeds
19. Production deploy works

**Guardrails Applicable:**
- G-012: UI must support keyboard-only operation
- G-013: Progress feedback required for queue processing
- G-014: Single-focus display (one opportunity at a time)

**Dependencies:**
- [x] V1 code copied to `dashboard/` (James did manually)
- [x] `.env.local` preserved with V2 credentials
- [x] SPEC-001 Airtable Schema complete (4 tables)
- [x] SPEC-005 Opportunity Enricher complete (populates why_now, draft)

**Build Phases (from spec):**
- Phase A: Strip Dead Code
- Phase B: Simplify Types
- Phase C: Rewrite Data Layer
- Phase D: Simplify Components
- Phase E: Simplify Stores
- Phase F: Fix Routes
- Phase G: Test & Fix

### Stage 2: Audit

**Dependencies Verified:**
- [x] V1 code exists in `dashboard/` with expected structure
- [x] `.env.local` has all V2 table IDs (FORCES, CONTACTS, SIGNALS, OPPORTUNITIES)
- [x] Airtable base has exactly 4 tables matching V2 schema
- [x] Table IDs in .env.local match actual Airtable tables

**Files Confirmed for Deletion:**
- `lib/types/email.ts` ✓ exists
- `lib/types/board.ts` ✓ exists
- `lib/stores/board-store.ts` ✓ exists
- `lib/stores/captures-store.ts` ✓ exists
- `lib/stores/pins-store.ts` ✓ exists
- `components/board/competitor-*.tsx` ✓ exist (3 files)
- `components/board/email-actions-tab.tsx` ✓ exists
- `components/focus-mode/dual-track-scores.tsx` ✓ exists
- `components/focus-mode/score-breakdown.tsx` ✓ exists
- `components/focus-mode/contract-context.tsx` ✓ exists
- `components/focus-mode/follow-up-*.tsx` ✓ exist (2 files)

**Route Status:**
- `/focus` exists → needs rename to `/review`
- `/board` exists → keep (board view)
- `/forces` exists → keep
- `/morning` exists → defer (rituals)
- `/eod` exists → defer (rituals)
- No `/email` or `/tenders` routes to delete

**Current airtable.ts:**
- 2175 lines of V1 code
- References ~12 legacy tables (organisations, competitorContracts, emailActions, etc.)
- Uses V1 types (Lead, PrimaryTrack, IR35Determination, EmailAction, WaitingForItem)
- Needs complete replacement with ~420 line V2 adapter

**Blockers:** None

### Stage 3: Plan

**Detailed Build Task List (27 tasks across 7 phases):**

#### Phase A: Strip Dead Code (8 tasks)

| # | Task | File(s) | Verification |
|---|------|---------|--------------|
| A1 | Delete email types | `lib/types/email.ts` | File gone |
| A2 | Delete board types | `lib/types/board.ts` | File gone |
| A3 | Delete board store | `lib/stores/board-store.ts` | File gone |
| A4 | Delete captures store | `lib/stores/captures-store.ts` | File gone |
| A5 | Delete pins store | `lib/stores/pins-store.ts` | File gone |
| A6 | Delete competitor components | `components/board/competitor-*.tsx` | 3 files gone |
| A7 | Delete email actions tab | `components/board/email-actions-tab.tsx` | File gone |
| A8 | Delete focus-mode dual-track | `components/focus-mode/dual-track-scores.tsx`, `score-breakdown.tsx`, `contract-context.tsx`, `follow-up-*.tsx` | 5 files gone |

#### Phase B: Simplify Types (3 tasks)

| # | Task | File(s) | Verification |
|---|------|---------|--------------|
| B1 | Rewrite opportunity.ts | `lib/types/opportunity.ts` | V2 types only |
| B2 | Simplify lead.ts | `lib/types/lead.ts` | Remove dual-track |
| B3 | Update types/index.ts | `lib/types/index.ts` | Exports valid |

#### Phase C: Rewrite Data Layer (2 tasks)

| # | Task | File(s) | Verification |
|---|------|---------|--------------|
| C1 | Replace airtable.ts | `lib/airtable.ts` | V2 adapter (~420 lines) |
| C2 | Fix broken imports | Various | `tsc --noEmit` passes |

#### Phase D: Simplify Components (4 tasks)

| # | Task | File(s) | Verification |
|---|------|---------|--------------|
| D1 | Strip now-card.tsx | `components/focus-mode/now-card.tsx` | No dual-track refs |
| D2 | Update focus-mode index | `components/focus-mode/index.ts` | No deleted exports |
| D3 | Strip queue-panel.tsx | `components/focus-mode/queue-panel.tsx` | V2 types only |
| D4 | Fix remaining component imports | Various in focus-mode/ | No TS errors |

#### Phase E: Simplify Stores (3 tasks)

| # | Task | File(s) | Verification |
|---|------|---------|--------------|
| E1 | Rewrite opportunities-store | `lib/stores/opportunities-store.ts` | V2 actions only |
| E2 | Simplify session-store | `lib/stores/session-store.ts` | Basic tracking |
| E3 | Simplify ui-store | `lib/stores/ui-store.ts` | Remove unused slices |

#### Phase F: Fix Routes (4 tasks)

| # | Task | File(s) | Verification |
|---|------|---------|--------------|
| F1 | Rename /focus to /review | `app/focus/` → `app/review/` | Directory renamed |
| F2 | Update root redirect | `app/page.tsx` | Redirects to /review |
| F3 | Update nav references | `components/app-shell/*.tsx` | /review links |
| F4 | Stub unused routes | `app/pipeline/`, `app/signals/` | Show "Coming soon" |

#### Phase G: Test & Fix (3 tasks)

| # | Task | Command | Verification |
|---|------|---------|--------------|
| G1 | TypeScript compile | `npx tsc --noEmit` | Zero errors |
| G2 | Build succeeds | `npm run build` | Build completes |
| G3 | Dev server works | `npm run dev` | Loads at localhost:3000/review |

**Estimated Duration**: 4-6 hours total
**Critical Path**: A → B → C → D → E → F → G (sequential)

**Execution Notes**:
- Run `npx tsc --noEmit` after each phase to catch errors early
- Phase C (airtable.ts) is the largest single change
- Phases A-B create TypeScript errors that C-E resolve

### Stage 4: Build
(pending)

### Stage 5: Verify
(pending)

### Stage 6: Document
(pending)
