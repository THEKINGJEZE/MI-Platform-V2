# Implementation Tracker: SPEC-007b

**Spec**: Dashboard MVP — Monday Review Interface
**Started**: 2025-01-19
**Last Updated**: 2025-01-19
**Current Stage**: 1
**Status**: in_progress

## Progress

| Stage | Name | Status | Completed |
|-------|------|--------|-----------|
| 1 | Parse | ✅ | 2025-01-20 |
| 2 | Audit | ✅ | 2025-01-20 |
| 3 | Plan | 🔄 | - |
| 4 | Build | ⬜ | - |
| 5 | Verify | ⬜ | - |
| 6 | Document | ⬜ | - |

## Current State

**Working on**: Stage 3 PLAN complete - awaiting gate approval
**Blockers**: AIRTABLE_API_KEY not configured (Task 1 will resolve)
**Next action**: Stage 4 BUILD - execute 22 tasks in 7 phases

## STATUS.md Context

- Phase 1 at 95% (burn-in monitoring)
- Phase 1c at 60% (Dashboard MVP)
- Existing Next.js app exists at `dashboard/` from previous SPEC-007 build
- Schema fields still needed: draft_subject, draft_body, actioned_at, skip_reason

## ANCHOR.md Alignment Check

| Mission Element | SPEC-007b Alignment |
|-----------------|---------------------|
| 3-5 ready-to-send leads Monday | ✅ Dashboard displays opportunities for review |
| ≤15 minutes review time | ✅ Acceptance criterion #17 explicitly requires this |
| ADHD-first design | ✅ Three-zone layout, keyboard nav, progress feedback |
| Human confirms, system decides | ✅ AI drafts messages, James reviews and sends |
| Reduce cognitive load | ✅ Single-focus display, one opportunity at a time |

**Verdict**: SPEC-007b directly serves the mission. No drift detected.

## Stage Outputs

### Stage 1: Parse

**Acceptance Criteria** (17 total):

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | Three-zone layout renders | Queue left, Now Card centre, Composer right |
| 2 | Design tokens applied | Colours match specification |
| 3 | Queue shows opportunities | List with priority indicators |
| 4 | Filter tabs work | Ready/Sent/All filter correctly |
| 5 | J/K navigation works | Keyboard moves through queue |
| 6 | Now Card shows context | Force, Why Now, Signals, Contact |
| 7 | Composer shows draft | Subject + body editable |
| 8 | E sends email | Opens mailto with pre-filled content |
| 9 | S skips opportunity | Moves to next, updates status |
| 10 | D opens dismiss modal | Shows reasons, updates status |
| 11 | Z undoes within 30s | Reverts last action |
| 12 | Progress header updates | Shows X of Y with progress bar |
| 13 | Toast shows on action | Confirms action with undo option |
| 14 | Empty state shows | When no opportunities |
| 15 | Error state shows | On API failure |
| 16 | ? shows shortcuts | Overlay with all keys |
| 17 | Full review ≤15 minutes | 5 opportunities reviewed |

**Guardrails Applicable**:
- G-008: Always Include webhookId — Required for n8n Dashboard API (WF7)
- G-012: UI must support keyboard-only operation (implicitly, from sales strategy)
- Note: G-012-015 are sales/messaging guardrails, not directly applicable to dashboard UI

**Dependencies Identified**:
1. SPEC-001 (Airtable Schema) — ✅ Complete
2. SPEC-005 (Opportunity Enricher) — ✅ Complete (populates why_now, draft)
3. n8n instance — ✅ Running
4. Vercel account — Required for deployment

**Schema Additions Required** (before building):
- `draft_subject` (Single Line Text) on Opportunities
- `draft_body` (Long Text) on Opportunities
- `actioned_at` (DateTime) on Opportunities
- `skip_reason` (Single Select) on Opportunities with options:
  - Not police sector
  - Wrong force
  - Not our service area
  - Already contacted
  - Duplicate
  - Other

**Tech Stack** (from spec):
- Next.js 14 (App Router)
- Tailwind CSS
- Zustand (state management)
- SWR (data fetching)

**Build Sequence** (17 tasks from spec):
1. Project setup — Next.js 14, Tailwind, Zustand, SWR
2. Design tokens — Port tokens.css from V1
3. Base components — badge, button, card, skeleton
4. Zustand store — review-store.ts with all state
5. API route — Proxy to n8n webhook
6. Layout shell — Three-zone grid structure
7. SessionHeader — Progress display
8. QueuePanel — List with selection
9. NowCard — Simplified context display
10. ComposerDock — Draft and actions
11. Toast system — Feedback with undo
12. Keyboard navigation — Global handler
13. DismissModal — Reason selection
14. ShortcutOverlay — Help modal
15. Empty/Error states — Edge cases
16. n8n webhook workflow — WF7 Dashboard API
17. Integration testing — Full flow

### Stage 2: Audit

**Completed**: 2025-01-20

**Key Findings:**

1. **Two Airtable bases exist:**
   - `appU3ktqJHk3eUmOS` — HubSpot-synced (global CLAUDE.md references this)
   - `appEEWaGtGUwOyOhm` — MI Platform (dashboard uses this) ✅ CORRECT

2. **Schema is compatible** — Fields exist with slightly different names:
   | SPEC-007b | Actual Field | Status |
   |-----------|--------------|--------|
   | draft_subject | subject_line | ✅ |
   | draft_body | outreach_draft | ✅ |
   | actioned_at | sent_at | ✅ |
   | skip_reason | skipped_reason | ✅ |

3. **Existing dashboard structure:**
   - `/` — Queue view (Monday queue) ✅
   - `/signals` — Signals view ✅
   - `/forces` — Forces view ✅
   - `/pipeline` — Pipeline view ✅
   - API routes: /api/opportunities, /api/signals, /api/forces, /api/send

4. **n8n connectivity:** ✅ Health check passed

5. **Missing configuration:**
   - `AIRTABLE_API_KEY` empty in dashboard/.env.local
   - n8n webhook URLs empty

6. **Gap analysis vs SPEC-007b:**
   - Missing: Three-zone layout (current is single-column cards)
   - Missing: Keyboard navigation (J/K/E/S/D/Z)
   - Missing: Progress header with session stats
   - Missing: Undo with 30s countdown
   - Missing: Toast system with undo
   - Missing: Shortcut overlay (?)
   - Has: Queue filtering, opportunity cards, send/skip actions

**Blockers:**
- ⚠️ `AIRTABLE_API_KEY` not set — dashboard won't work until configured
- ⚠️ Field names differ from spec — code changes needed

**Recommendation:** Adapt existing dashboard to SPEC-007b requirements rather than rebuild from scratch. Key changes:
1. Refactor layout to Three-Zone Model
2. Add keyboard navigation
3. Add session stats header
4. Add undo/toast system
5. Map field names to actual schema

### Stage 3: Plan

**Completed**: 2025-01-20

**Approach**: Adapt existing dashboard rather than rebuild. Key refactors:
1. Layout → Three-Zone Model
2. State → Zustand with undo support
3. Add keyboard navigation
4. Add toast/feedback system

**Task List** (22 tasks, ~15 min each):

#### Phase A: Configuration & Foundation (Tasks 1-4)
| # | Task | Files | Est |
|---|------|-------|-----|
| 1 | Copy AIRTABLE_API_KEY to dashboard/.env.local | dashboard/.env.local | 2m |
| 2 | Create design tokens CSS file | dashboard/styles/tokens.css | 10m |
| 3 | Update globals.css to import tokens | dashboard/app/globals.css | 5m |
| 4 | Install zustand if not present | package.json | 2m |

#### Phase B: State Management (Tasks 5-7)
| # | Task | Files | Est |
|---|------|-------|-----|
| 5 | Create review-store.ts with Zustand | dashboard/lib/stores/review-store.ts | 15m |
| 6 | Add undo stack logic to store | dashboard/lib/stores/review-store.ts | 10m |
| 7 | Add session stats to store | dashboard/lib/stores/review-store.ts | 10m |

#### Phase C: Layout Refactor (Tasks 8-11)
| # | Task | Files | Est |
|---|------|-------|-----|
| 8 | Create Three-Zone layout wrapper | dashboard/components/review/review-layout.tsx | 15m |
| 9 | Create QueuePanel component | dashboard/components/review/queue-panel.tsx | 15m |
| 10 | Create NowCard component | dashboard/components/review/now-card.tsx | 15m |
| 11 | Create ComposerDock component | dashboard/components/review/composer-dock.tsx | 15m |

#### Phase D: Feedback Components (Tasks 12-15)
| # | Task | Files | Est |
|---|------|-------|-----|
| 12 | Create SessionHeader component | dashboard/components/review/session-header.tsx | 15m |
| 13 | Create Toast system | dashboard/components/feedback/toast.tsx | 15m |
| 14 | Create DismissModal component | dashboard/components/review/dismiss-modal.tsx | 10m |
| 15 | Create ShortcutOverlay component | dashboard/components/review/shortcut-overlay.tsx | 10m |

#### Phase E: Keyboard Navigation (Tasks 16-17)
| # | Task | Files | Est |
|---|------|-------|-----|
| 16 | Create useKeyboardNav hook | dashboard/lib/hooks/use-keyboard-nav.ts | 15m |
| 17 | Integrate keyboard nav into review page | dashboard/app/review/page.tsx | 10m |

#### Phase F: Page Integration (Tasks 18-20)
| # | Task | Files | Est |
|---|------|-------|-----|
| 18 | Refactor /review page with Three-Zone | dashboard/app/review/page.tsx | 15m |
| 19 | Update home page to redirect to /review | dashboard/app/page.tsx | 5m |
| 20 | Add empty/error state components | dashboard/components/feedback/ | 10m |

#### Phase G: API & Field Mapping (Tasks 21-22)
| # | Task | Files | Est |
|---|------|-------|-----|
| 21 | Update API route field mappings | dashboard/app/api/opportunities/route.ts | 10m |
| 22 | Update type definitions | dashboard/lib/airtable.ts | 10m |

**Total estimated**: ~4 hours

**Checkpoints**: After tasks 4, 7, 11, 15, 17, 20, 22

**Dependencies**:
- Task 1 blocks all other tasks (API key needed)
- Tasks 5-7 block tasks 8-17 (store needed for components)
- Tasks 8-11 block task 18 (components needed for page)

### Stage 4: Build
*To be completed after Stage 3 gate*

### Stage 5: Verify
*To be completed after Stage 4 gate*

### Stage 6: Document
*To be completed after Stage 5 gate*
