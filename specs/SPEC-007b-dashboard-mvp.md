# SPEC-007b: Dashboard MVP — Monday Review Interface

**Status**: Ready for implementation  
**Created**: 2025-01-19  
**Phase**: 1c — React Dashboard  
**Depends on**: SPEC-001 (Airtable Schema), SPEC-004 (Opportunity Creator), SPEC-005 (Opportunity Enricher)  
**Supersedes**: SPEC-007 (absorbed), SPEC-006 (absorbed)  
**Future Evolution**: SPEC-007a (Full UI Foundation), SPEC-008 (Morning Brief)

---

## Overview

Build the minimum viable Monday Review dashboard that delivers the core experience: review opportunities, edit drafts, take action. This spec implements the proven Three-Zone layout from V1 without the scoring complexity that requires schema expansion.

**Why MVP first**: SPEC-007a describes a rich UI with dual-track scoring, score breakdowns, and session persistence. That requires schema fields (ms_score, ag_score, research_confidence) that don't exist yet. This spec builds what's possible with the current 4-table schema, creating a functional Monday experience immediately.

**What this delivers**:
- Three-zone layout (Queue | Now Card | Composer)
- Keyboard navigation (J/K/E/S/D/Z)
- Progress feedback
- Undo with 30-second window
- Design tokens from V1

**What this defers** (to SPEC-007a):
- Dual-track scoring display
- Score breakdown grid
- Contact confidence indicators
- Session persistence across browser sessions

---

## Design Philosophy

From `uk-police-design-system` skill:
- Dark mode primary
- Semantic colour only
- Keyboard first
- ADHD optimised

This spec implements the **Three-Zone Model** from `action-oriented-ux` skill, enabling the 2-Minute Lead Loop without requiring the full scoring infrastructure.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Progress] Today: 3 of 12 ████░░░░░░ 25% • Avg: 1:42      [Refresh]       │
├────────────┬──────────────────────────────────────┬─────────────────────────┤
│            │                                      │                         │
│  QUEUE     │           NOW CARD                   │    COMPOSER DOCK        │
│  PANEL     │           (Context)                  │    (Actions)            │
│  (280px)   │           (flexible)                 │    (320px)              │
│            │                                      │                         │
│  Filter:   │  ┌────────────────────────────┐     │  Subject: ...           │
│  [Ready]   │  │ Force Name        [PRIORITY]│     │                         │
│  [Sent]    │  │                             │     │  Message body...        │
│  [All]     │  │ Why Now:                    │     │                         │
│            │  │ "Budget flush opportunity   │     │  ─────────────────────  │
│  ─────────│  │  before Q4 end"             │     │                         │
│  > Kent    │  │                             │     │  [Send Email]           │
│    Durham  │  │ Signals: 3 job postings     │     │                         │
│    Essex   │  │                             │     │  [Skip] [Dismiss]       │
│    ...     │  │ Contact: Jane Smith         │     │                         │
│            │  │ HR Manager                  │     │                         │
│            │  └────────────────────────────┘     │                         │
├────────────┴──────────────────────────────────────┴─────────────────────────┤
│  [J/K] navigate  •  [E] Send  •  [S] Skip  •  [D] Dismiss  •  [?] Shortcuts │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────────────┐
                              │  ✓ Actioned: Kent Police │  ← Toast with
                              │  Press Z to undo (28s)   │    countdown bar
                              │  ████████████░░░░░░░░░░  │
                              └─────────────────────────┘
```

---

## Data Model (Current Schema)

This spec works with the existing Opportunities table from SPEC-001:

| Field | Type | Used For |
|-------|------|----------|
| `name` | Text | Display in queue and card |
| `force` | Link → Forces | Force name resolution |
| `signals` | Link → Signals | Signal count and types |
| `status` | Single Select | Queue filtering (New, Ready, Sent, etc.) |
| `priority` | Single Select | Priority badge (High, Medium, Low) |
| `contact` | Link → Contacts | Contact display |
| `why_now` | Long Text | Context summary (AI-generated by WF5) |
| `draft_subject` | Text | Email subject line |
| `draft_body` | Long Text | Email message body |
| `actioned_at` | DateTime | When action was taken |

**Schema additions required** (add to Opportunities table):

| Field | Type | Purpose |
|-------|------|---------|
| `draft_subject` | Single Line Text | Email subject |
| `draft_body` | Long Text | Email body |
| `actioned_at` | DateTime | Track when sent/skipped |
| `skip_reason` | Single Select | Why skipped (optional) |

These are minimal additions that don't increase complexity.

---

## Design Tokens

Port V1's `styles/tokens.css` wholesale:

### Colours

| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--bg-canvas` | 220 20% 7% | Page background |
| `--bg-surface-0` | 220 18% 11% | Cards, panels |
| `--bg-surface-1` | 220 16% 15% | Elevated elements |
| `--bg-surface-2` | 220 14% 19% | Hover states |
| `--text-primary` | 220 10% 93% | Headlines |
| `--text-secondary` | 220 10% 70% | Body text |
| `--text-muted` | 220 10% 50% | Labels, hints |
| `--color-action` | 217 91% 60% | Primary buttons |
| `--color-success` | 160 84% 39% | Positive states |
| `--color-warning` | 38 92% 50% | Attention needed |
| `--color-danger` | 0 100% 71% | Priority, errors |

### Typography

| Token | Value | Usage |
|-------|-------|-------|
| `--font-sans` | Inter | Body text |
| `--font-mono` | IBM Plex Mono | Counts, data |
| `--type-body` | 16px | Default |
| `--type-body-sm` | 14px | Secondary |
| `--type-caption` | 12px | Labels |

### Spacing

4px base grid: `--space-1` (4px) through `--space-8` (48px)

---

## Components

### 1. SessionHeader

Progress tracking for dopamine feedback.

**Display**:
```
Today: 3 of 12 ████░░░░░░ 25% • Avg: 1:42    [Refresh]
```

**State** (in-memory, resets on page refresh):
```typescript
interface SessionStats {
  processed: number;      // Opportunities actioned this session
  total: number;          // Total in current queue
  startTime: number;      // Session start timestamp
  actionTimes: number[];  // Time per action for average
}
```

**Behaviour**:
- Progress bar colour: <50% muted → 50-75% warning → 75-99% action → 100% success
- Average time calculated from `actionTimes` array
- Refresh button reloads data from API

---

### 2. QueuePanel

Left navigation showing opportunity list.

**Props**:
```typescript
interface QueuePanelProps {
  opportunities: Opportunity[];
  currentId: string | null;
  filter: "ready" | "sent" | "all";
  onSelect: (id: string) => void;
  onFilterChange: (filter: string) => void;
}
```

**Display per item**:
- Force name (truncated to ~20 chars)
- Signal count badge (e.g., "3 signals")
- Priority indicator (coloured left border: danger=high, warning=medium, muted=low)

**Filter tabs**:
- Ready — `status = "Ready"`
- Sent — `status = "Sent"`
- All — no filter

**Keyboard**: J/K moves selection, updates `currentId`

---

### 3. NowCard (Simplified)

Central context display. **This is the key simplification from SPEC-007a.**

**Sections**:

1. **Header**
   - Force name (24px, primary)
   - Priority badge (High/Medium/Low)

2. **Why Now** (the key context)
   - Icon: 💡
   - Content: `why_now` field (AI-generated summary)
   - If empty: "No context summary available"

3. **Signals Summary**
   - Icon: 📊
   - Content: Count + types (e.g., "3 signals: 2 job postings, 1 tender")
   - Derived from linked Signals records

4. **Contact Card** (if linked)
   - Name + Title
   - Email (clickable)
   - Force relationship

**What's NOT in MVP** (deferred to SPEC-007a):
- Dual-track scores (MS vs AG)
- Score breakdown grid
- Contact confidence indicator
- Timing indicator

---

### 4. ComposerDock

Right panel with draft and actions.

**Sections**:

1. **Draft Display**
   ```
   Subject: [draft_subject or "Re: [Force] - Peel Solutions"]
   ───────────────────────────
   [draft_body - scrollable, editable]
   
   [Copy] 245 chars
   ```

2. **Primary Action**
   - `[Send Email]` — Full width, action colour
   - Opens mailto: link with pre-filled subject/body

3. **Secondary Actions**
   - `[Skip]` — Move to next, mark as Skipped
   - `[Dismiss]` — Opens DismissModal

4. **Keyboard Hints**
   ```
   [E] Send • [S] Skip • [D] Dismiss
   ```

---

### 5. DismissModal

Structured dismiss with feedback.

**Reasons** (Single Select options):
- "Not police sector" — Propagates to AI (show warning)
- "Wrong force"
- "Not our service area"
- "Already contacted"
- "Duplicate"
- "Other"

**Behaviour**:
- Updates Opportunity status to "Dismissed"
- Stores reason in `skip_reason` field
- Advances to next opportunity

---

### 6. Toast System

Feedback with undo support.

**Implementation** (client-side only):
```typescript
interface Toast {
  id: string;
  type: "success" | "error" | "undo";
  title: string;
  description?: string;
  duration: number;  // ms
  onUndo?: () => void;
}

interface UndoAction {
  opportunityId: string;
  previousStatus: string;
  expiresAt: number;  // 30 seconds from action
}
```

**Undo Flow**:
1. User takes action (Send/Skip/Dismiss)
2. Optimistic update: move to next opportunity
3. Show toast with 30s countdown
4. If Z pressed within 30s: revert status, return to opportunity
5. After 30s: commit action to Airtable

**Note**: Undo is session-only. If user refreshes, action is committed.

---

### 7. Empty State

When queue is empty.

**Display**:
```
┌─────────────────────────────────────┐
│                                     │
│            ✓ All done!              │
│                                     │
│   No opportunities ready to review. │
│   Check back later or view the      │
│   Pipeline for in-progress items.   │
│                                     │
│   [View Pipeline]  [Refresh]        │
│                                     │
└─────────────────────────────────────┘
```

---

### 8. Error State

When API fails.

**Display**:
```
┌─────────────────────────────────────┐
│                                     │
│         ⚠️ Something went wrong     │
│                                     │
│   Couldn't load opportunities.      │
│   [error.message]                   │
│                                     │
│   [Try Again]                       │
│                                     │
│   Tried 3+ times? Contact support.  │
│                                     │
└─────────────────────────────────────┘
```

---

### 9. Loading State

Skeleton matching layout.

**Display**: Three-zone skeleton with shimmer animation. Maintains layout stability.

---

### 10. ShortcutOverlay

Shows when user presses `?`.

**Shortcuts**:
| Key | Action |
|-----|--------|
| J | Next opportunity |
| K | Previous opportunity |
| E | Send email |
| S | Skip |
| D | Dismiss |
| Z | Undo (30s) |
| ? | This help |

---

## Keyboard Navigation

Single `useEffect` with keydown listener:

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ignore if typing in input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }
    
    switch (e.key.toLowerCase()) {
      case 'j': selectNext(); break;
      case 'k': selectPrevious(); break;
      case 'e': handleSend(); break;
      case 's': handleSkip(); break;
      case 'd': openDismissModal(); break;
      case 'z': handleUndo(); break;
      case '?': toggleShortcutOverlay(); break;
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [/* dependencies */]);
```

---

## State Management

Use Zustand for client state (lightweight, no boilerplate):

```typescript
// lib/stores/review-store.ts
interface ReviewState {
  // Queue state
  opportunities: Opportunity[];
  currentId: string | null;
  filter: "ready" | "sent" | "all";
  
  // Session stats
  stats: SessionStats;
  
  // Undo stack
  undoStack: UndoAction[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  toasts: Toast[];
  isShortcutOverlayOpen: boolean;
  
  // Actions
  setOpportunities: (opps: Opportunity[]) => void;
  selectOpportunity: (id: string) => void;
  selectNext: () => void;
  selectPrevious: () => void;
  setFilter: (filter: string) => void;
  
  // Opportunity actions
  markAsSent: (id: string) => void;
  markAsSkipped: (id: string, reason?: string) => void;
  markAsDismissed: (id: string, reason: string) => void;
  undo: () => void;
  
  // Toast actions
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}
```

---

## Data Fetching

### API: Load Opportunities

**Endpoint**: n8n webhook `GET /webhook/opportunities`

**Query params**:
- `status`: Filter by status (optional)
- `limit`: Max records (default 50)

**Response**:
```typescript
interface Opportunity {
  id: string;
  name: string;
  force: {
    id: string;
    name: string;
  };
  signals: {
    id: string;
    type: string;
    title: string;
  }[];
  status: string;
  priority: string;
  contact: {
    id: string;
    name: string;
    title: string;
    email: string;
  } | null;
  why_now: string | null;
  draft_subject: string | null;
  draft_body: string | null;
}
```

### API: Update Opportunity

**Endpoint**: n8n webhook `PATCH /webhook/opportunities/:id`

**Body**:
```typescript
{
  status: string;
  skip_reason?: string;
  actioned_at?: string;
}
```

### Data Fetching Pattern

Use SWR for caching and revalidation:

```typescript
// hooks/use-opportunities.ts
import useSWR from 'swr';

export function useOpportunities(filter: string) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/opportunities?status=${filter}`,
    fetcher,
    { refreshInterval: 30000 }  // Refresh every 30s
  );
  
  return { opportunities: data, error, isLoading, mutate };
}
```

---

## File Structure

```
dashboard/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Redirect to /review
│   ├── review/
│   │   └── page.tsx            # Monday Review (main page)
│   ├── pipeline/
│   │   └── page.tsx            # Pipeline view (future)
│   └── api/
│       └── opportunities/
│           └── route.ts        # Proxy to n8n webhook
├── components/
│   ├── providers.tsx           # Zustand + Toast providers
│   ├── ui/                     # Base components
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── skeleton.tsx
│   ├── feedback/
│   │   ├── toast.tsx
│   │   ├── empty-state.tsx
│   │   ├── error-state.tsx
│   │   └── loading-skeleton.tsx
│   └── review/                 # Monday Review components
│       ├── session-header.tsx
│       ├── queue-panel.tsx
│       ├── now-card.tsx
│       ├── composer-dock.tsx
│       ├── dismiss-modal.tsx
│       ├── shortcut-overlay.tsx
│       └── keyboard-hints.tsx
├── lib/
│   ├── stores/
│   │   └── review-store.ts     # Zustand store
│   ├── hooks/
│   │   └── use-opportunities.ts
│   └── utils.ts                # cn() helper
├── styles/
│   └── tokens.css              # Design tokens
└── package.json
```

---

## n8n Webhooks Required

### WF7: Dashboard API

Create a webhook workflow that serves the dashboard:

**Endpoints**:

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/webhook/opportunities` | List opportunities |
| GET | `/webhook/opportunities/:id` | Get single opportunity |
| PATCH | `/webhook/opportunities/:id` | Update opportunity |

**Security**: Include `X-Dashboard-Secret` header check.

---

## Acceptance Criteria

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

---

## Testing Plan

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 1 | Load page with 5 Ready opportunities | Queue shows 5, first selected |
| 2 | Press J three times | Selection moves to 4th item |
| 3 | Press K once | Selection moves back to 3rd |
| 4 | Press E | mailto opens, toast shows, next selected |
| 5 | Press Z within 30s | Action reverted, back to opportunity |
| 6 | Wait 31s, press Z | "Nothing to undo" message |
| 7 | Press S | Skipped, toast shows, next selected |
| 8 | Press D | Modal opens with reasons |
| 9 | Select "Not police sector" | Warning shown about AI training |
| 10 | Confirm dismiss | Status updated, next selected |
| 11 | Process 3 of 5 | Progress shows "3 of 5", 60% bar |
| 12 | Process all 5 | Empty state shows "All done!" |
| 13 | API returns error | Error state with retry button |
| 14 | Press ? | Shortcut overlay appears |
| 15 | Click filter "Sent" | Queue shows only Sent items |

---

## Build Sequence

1. **Project setup** — Next.js 14, Tailwind, Zustand, SWR
2. **Design tokens** — Port tokens.css from V1
3. **Base components** — badge, button, card, skeleton
4. **Zustand store** — review-store.ts with all state
5. **API route** — Proxy to n8n webhook
6. **Layout shell** — Three-zone grid structure
7. **SessionHeader** — Progress display
8. **QueuePanel** — List with selection
9. **NowCard** — Simplified context display
10. **ComposerDock** — Draft and actions
11. **Toast system** — Feedback with undo
12. **Keyboard navigation** — Global handler
13. **DismissModal** — Reason selection
14. **ShortcutOverlay** — Help modal
15. **Empty/Error states** — Edge cases
16. **n8n webhook workflow** — WF7 Dashboard API
17. **Integration testing** — Full flow

---

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| SPEC-001 (Airtable Schema) | ✅ Complete | Base tables exist |
| SPEC-005 (Opportunity Enricher) | ✅ Complete | Populates why_now, draft |
| n8n instance | ✅ Running | For webhook API |
| Vercel account | Required | For deployment |

---

## Schema Additions

Add these fields to Opportunities table before building:

| Field | Type | Purpose |
|-------|------|---------|
| `draft_subject` | Single Line Text | Email subject |
| `draft_body` | Long Text | Email body |
| `actioned_at` | DateTime | When actioned |
| `skip_reason` | Single Select | Why skipped |

Options for `skip_reason`:
- Not police sector
- Wrong force
- Not our service area
- Already contacted
- Duplicate
- Other

---

## Future Evolution

This spec is the foundation. Future enhancements (see SPEC-007a, SPEC-008):

| Phase | Enhancement | Spec |
|-------|-------------|------|
| Post-1c | Dual-track scoring display | SPEC-007a |
| Post-1c | Score breakdown grid | SPEC-007a |
| Post-1c | Contact confidence indicators | SPEC-007a |
| Post-1c | Session persistence | SPEC-007a |
| Post-1c | Morning Brief ritual | SPEC-008 |
| Phase 2 | Pipeline view | New spec |
| Phase 2 | Email queue view | SPEC-2a |

---

## Guardrails Applied

- **G-012**: UI must support keyboard-only operation ✓
- **G-013**: Progress feedback required for queue processing ✓
- **G-014**: Single-focus display (one opportunity at a time) ✓

---

## Handoff to Claude Code

**Context**: MVP dashboard for Monday review experience

**Key references**:
- Design tokens: Port from V1 (`styles/tokens.css`)
- Airtable IDs: `.claude/skills/airtable-schema/table-ids.json`
- n8n patterns: `.claude/rules/n8n.md`

**On completion**:
- Dashboard deployed to Vercel
- WF7 webhook workflow created in n8n
- Schema fields added to Opportunities
- STATUS.md updated
