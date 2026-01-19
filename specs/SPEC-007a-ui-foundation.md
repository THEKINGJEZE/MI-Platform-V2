# SPEC-007a: UI Foundation — Full Feature Dashboard

**Status**: Future Phase (deferred)  
**Phase**: Post-Phase 1c  
**Created**: 2025-01-19  
**Updated**: 2025-01-19  
**Depends on**: SPEC-007b (Dashboard MVP) — must be complete and validated first  
**Prerequisites**: Schema expansion (see below), scoring model validation  
**Source**: V1 Dashboard codebase (`/Users/jamesjeram/Documents/MI-Platform/dashboard-react`)  
**Decision**: A8 (Three-Zone Dashboard Layout + Morning Brief)  
**Skills**: `action-oriented-ux`, `adhd-interface-design`, `uk-police-design-system`, `b2b-visualisation`

---

## Why This Is Deferred

This spec describes the full-featured dashboard with dual-track scoring, score breakdowns, and session persistence. It requires schema fields and scoring logic that don't exist in Phase 1.

**Prerequisites before implementing this spec:**

1. **SPEC-007b complete** — MVP dashboard working in production
2. **Schema expansion** — Add these fields to Opportunities:
   - `ms_score` (Number 0-100) — Managed Services score
   - `ag_score` (Number 0-100) — Agency score  
   - `primary_track` (Single Select: MS, AG)
   - `signal_score`, `fit_score`, `relationship_score`, `timing_score` (Numbers)
3. **Contact enrichment** — Add to Contacts:
   - `research_confidence` (Number 0-100)
   - `confidence_sources` (Long Text)
4. **Scoring workflow** — WF5 enhanced to calculate dual-track scores
5. **Phase 1b complete** — Competitor monitoring provides differentiated signals

**When to implement**: After Phase 1c MVP is validated with real Monday reviews

---

## Overview

Port V1's proven Focus Mode design system and layout to V2, replacing the current single-card UI with the three-zone layout optimised for ADHD workflows.

**Why this matters**: V1's Focus Mode was designed specifically for the Monday morning review experience — progress tracking, keyboard navigation, visual isolation, and reduced cognitive load. V2 currently lacks these ADHD-critical patterns.

**Scope**: Design system foundation + Monday Review page layout + feedback systems. Does not include data fetching logic (covered by SPEC-007) or Morning Brief rituals (see SPEC-008).

---

## Design System Alignment

This spec implements patterns from the following skills (see Decision A8):

| Skill | Pattern Implemented |
|-------|--------------------|
| `action-oriented-ux` | Three-Zone Model (Queue \| Context \| Action), 2-Minute Lead Loop, Review-First Composition, Non-Blocking Feedback |
| `adhd-interface-design` | Context Capsule (What/Why/Next/When/Source), Visual Isolation, Undo as Safety Net, Progress Feedback |
| `uk-police-design-system` | Design Tokens, Technical Luxury aesthetic, Dark Mode Primary, Badge System, ADHD-Specific Features (Pin, Quick Capture, Focus Mode) |
| `b2b-visualisation` | 2-Second Comprehension Rule, Score Explainability, Progressive Disclosure |

The strategy document Section 11 originally specified a vertical-scroll layout. Per Decision A8, that design was theoretical — these skills represent the tested, production patterns from V1.

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
│  [Ready]   │  │ Force Name           Score │     │                         │
│  [Sent]    │  │ Capability                 │     │  Message body...        │
│  [All]     │  │                            │     │                         │
│            │  │ Why:    Context capsule    │     │  ─────────────────────  │
│  ─────────│  │ Next:   Recommended action │     │                         │
│  > Item 1  │  │ When:   Timing indicator   │     │  [Send Email]           │
│    Item 2  │  │ Source: Signal summary     │     │                         │
│    Item 3  │  │                            │     │  [Skip] [Dismiss]       │
│    ...     │  │ [Score breakdown grid]     │     │                         │
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

## Design Tokens

Port V1's `styles/tokens.css` as the single source of truth for all visual values.

### Colour System

| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--bg-canvas` | 220 20% 7% | Page background |
| `--bg-surface-0` | 220 18% 11% | Cards, panels |
| `--bg-surface-1` | 220 16% 15% | Elevated elements, borders |
| `--bg-surface-2` | 220 14% 19% | Hover states, inputs |
| `--text-primary` | 220 10% 93% | Headlines, key data |
| `--text-secondary` | 220 10% 70% | Body text |
| `--text-muted` | 220 10% 50% | Labels, hints, disabled |
| `--color-action` | 217 91% 60% | Primary buttons, links |
| `--color-success` | 160 84% 39% | Positive states, sent |
| `--color-warning` | 38 92% 50% | Attention needed |
| `--color-danger` | 0 100% 71% | Priority, urgent, errors |
| `--color-info` | 239 84% 67% | Informational |

### Typography

| Token | Value | Usage |
|-------|-------|-------|
| `--font-sans` | Inter | Body text |
| `--font-mono` | IBM Plex Mono | Scores, counts, data |
| `--type-body` | 16px | Default text |
| `--type-body-sm` | 14px | Secondary text |
| `--type-caption` | 12px | Labels, hints |
| `--type-metric-lg` | 40px | Hero scores |

### Spacing

4px base grid: `--space-1` (4px) through `--space-8` (48px)

---

## State Management

### Session Store

Port V1's `lib/stores/session-store.ts` — manages progress tracking and undo.

**State**:
```typescript
interface SessionState {
  stats: {
    todayProcessed: number;
    todayTotal: number;
    allTimeProcessed: number;
    averageTimeSeconds: number;
    sessionStartedAt?: string;
  };
  undoStack: UndoAction[];
}

interface UndoAction {
  id: string;
  type: "action" | "skip" | "dismiss";
  leadId: string;
  previousStatus: string;
  timestamp: number;
  expiresAt: number; // 30 seconds from creation
}
```

**Key methods**:
- `incrementProcessed(timeSeconds)` — update stats after each action
- `getProgress()` — returns `{ processed, total, percentage }`
- `pushUndo(action)` — add to stack with 30s auto-expiry
- `popUndo()` — retrieve and remove most recent valid action
- `formatTime(seconds)` — returns "m:ss" format

**Persistence**: `allTimeProcessed` and `averageTimeSeconds` persist to localStorage.

### UI Store

Port V1's `lib/stores/ui-store.ts` — manages UI state and toasts.

**State**:
```typescript
interface UIState {
  isFocusMode: boolean;
  isShortcutOverlayOpen: boolean;
  toasts: Toast[];
}

interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info" | "undo";
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  duration?: number; // ms, default 5000, undo = 30000
}
```

**Key methods**:
- `setFocusMode(enabled)` — toggle focus mode
- `addToast(toast)` — add with auto-remove timer
- `removeToast(id)` — manual dismiss

---

## Components to Port

### 1. SessionHeader

**Purpose**: Progress tracking for dopamine feedback loop

**Display**:
```
Today: 3 of 12 ████░░░░░░ 25% • Avg: 1:42
```

**Props**:
- `processed`: number — opportunities reviewed this session
- `total`: number — total in current queue
- `percentage`: number — calculated progress
- `averageTime`: number — seconds per opportunity
- `onRefresh`: () => void — reload data

**Behaviour**:
- Progress bar colour shifts: <50% muted → 50-75% warning → 75-99% action → 100% success
- Updates in real-time as user processes queue

**Source file**: `components/focus-mode/session-header.tsx`

---

### 2. QueuePanel

**Purpose**: Left navigation showing opportunity list

**Props**:
- `opportunities`: Opportunity[] — filtered list
- `currentId`: string | null — highlighted item
- `filter`: "ready" | "sent" | "all" — queue filter
- `onSelect`: (id: string) => void
- `onFilterChange`: (filter) => void

**Display per item**:
- Force name (truncated)
- Signal count badge
- Priority indicator (colour-coded left border)
- Score (mono font, right-aligned)

**Keyboard**: J/K navigation updates `currentId`

**Source file**: `components/focus-mode/queue-panel.tsx`

---

### 3. NowCard

**Purpose**: Central context display for current opportunity

**Sections**:

1. **Header**
   - Force name (24px, primary)
   - Score (40px, mono, right-aligned)
   - Priority badge

2. **Context Capsule** (icon + label + content rows)

   | Label | Icon | Content |
   |-------|------|---------|
   | Why | 💡 | `context_summary` field |
   | Next | → | Recommended channel + action |
   | When | ⏱️ | Timing indicator from score |
   | Source | 🏢 | Signal count + types |

3. **Dual Track Scores** (MS vs AG comparison)
   - Side-by-side progress bars
   - Primary track indicator
   - Delta display if significant (15+ points)

4. **Score Breakdown** (4-column grid)
   - Signal score
   - Fit score
   - Relationship score
   - Timing score

5. **Contact Card** (if available)
   - Suggested contact name
   - Email (clickable)
   - Confidence indicator (verified/enriched/unverified dot)

**Source files**: 
- `components/focus-mode/now-card.tsx`
- `components/focus-mode/dual-track-scores.tsx`
- `components/focus-mode/contact-card.tsx`

---

### 4. ActionPanel (Composer Dock)

**Purpose**: Right panel with draft message and action buttons

**Sections**:

1. **Draft Display**
   - Subject line (if present)
   - Message body (scrollable, max-height)
   - Character count
   - Copy button

2. **Primary Action**
   - `[Send Email]` — full width, prominent

3. **Secondary Actions**
   - `[Skip]` — move to next without action
   - `[Dismiss]` — mark as not relevant (opens DismissModal)

4. **Keyboard Hints**
   ```
   [E] Send • [S] Skip • [D] Dismiss
   ```

**Source file**: `components/focus-mode/action-panel.tsx`

---

### 5. DismissModal

**Purpose**: Structured dismiss reasons with feedback propagation

**Reasons**:
- "Not police sector" — *propagates to AI filter*
- "Wrong force"
- "Not our service area"
- "Already contacted"
- "Duplicate"
- "Other"

**Behaviour**:
- Shows warning when reason propagates ("trains AI filter")
- Calls dismiss API with reason
- Advances to next opportunity

**Source file**: `components/focus-mode/dismiss-modal.tsx`

---

### 6. Toast System

**Purpose**: Feedback notifications with undo support

**Toast Types**:
| Type | Duration | Features |
|------|----------|----------|
| `success` | 5s | Green, checkmark icon |
| `error` | 5s | Red, alert icon |
| `warning` | 5s | Amber, warning icon |
| `info` | 5s | Blue, info icon |
| `undo` | 30s | Blue, countdown progress bar, undo action |

**Undo Toast Special Features**:
- Animated progress bar showing time remaining
- "Undo" button or press `Z` to revert
- Auto-removes from undo stack on expiry

**Implementation**:
- `ToastProvider` wraps app
- `ToastContainer` renders in bottom-right
- `useToast()` hook for adding/removing

**Source file**: `components/feedback/toast.tsx`

---

### 7. Empty State

**Purpose**: Friendly feedback when queue is empty

**Props**:
- `icon`: LucideIcon
- `title`: string
- `description`: string
- `primaryAction`: { label, onClick, icon? }
- `secondaryAction`: { label, onClick }

**Source file**: `components/feedback/empty-state.tsx`

---

### 8. Error State

**Purpose**: Error display with retry and support escalation

**Props**:
- `message`: string
- `details?`: string (shown in mono, for technical errors)
- `onRetry`: () => void
- `retryCount`: number — shows support link after 3+ retries

**Source file**: `components/feedback/error-state.tsx`

---

### 9. Skeleton Loaders

**Purpose**: Shape-matched loading states to prevent layout jank

**Components**:
- `FocusPageSkeleton` — matches three-zone layout
- `Skeleton` — base shimmer component

**Behaviour**:
- Subtle shimmer animation (not spinner)
- Matches exact component shapes
- Respects `prefers-reduced-motion`

**Source file**: `components/feedback/page-skeletons.tsx`

---

### 10. Shortcut Overlay

**Purpose**: Shows all keyboard shortcuts when user presses `?`

**Shortcut Groups**:
- **Navigation**: J/K, Enter, Escape
- **Actions**: E (Send), S (Skip), D (Dismiss), Z (Undo)
- **Global**: ⌘K (Command palette), ? (This overlay)

**Source file**: `components/overlays/shortcut-overlay.tsx`

---

### 11. Badge System

Port V1's semantic badge variants:

| Variant | Background | Text | Usage |
|---------|------------|------|-------|
| `priority` | danger-muted | danger | High priority items |
| `high` | warning-muted | warning | High score |
| `medium` | info-muted | info | Medium score |
| `low` | surface-1 | muted | Low score |
| `ready` | success-muted | success | Ready to send |
| `sent` | action-muted | action | Already actioned |
| `managed` | action-muted | action | MS track |
| `agency` | info-muted | info | AG track |
| `job_signal` | success-muted | success | Hiring activity |

**Source file**: `components/ui/badge.tsx`

---

## Global Styles

Port V1's `app/globals.css` utility classes:

```css
/* Surface utilities */
.bg-canvas { background-color: hsl(var(--bg-canvas)); }
.bg-surface-0 { background-color: hsl(var(--bg-surface-0)); }
.bg-surface-1 { background-color: hsl(var(--bg-surface-1)); }
.bg-surface-2 { background-color: hsl(var(--bg-surface-2)); }

/* Text utilities */
.text-primary { color: hsl(var(--text-primary)); }
.text-secondary { color: hsl(var(--text-secondary)); }
.text-muted { color: hsl(var(--text-muted)); }

/* Semantic text */
.text-action { color: hsl(var(--color-action)); }
.text-success { color: hsl(var(--color-success)); }
.text-warning { color: hsl(var(--color-warning)); }
.text-danger { color: hsl(var(--color-danger)); }

/* Muted backgrounds (for badges) */
.bg-action-muted { background-color: hsl(var(--color-action) / 0.15); }
.bg-success-muted { background-color: hsl(var(--color-success) / 0.15); }
.bg-warning-muted { background-color: hsl(var(--color-warning) / 0.15); }
.bg-danger-muted { background-color: hsl(var(--color-danger) / 0.15); }
```

---

## Keyboard Navigation

| Key | Action | Context |
|-----|--------|---------|
| `J` | Next opportunity | Queue navigation |
| `K` | Previous opportunity | Queue navigation |
| `E` | Send email | Opens mail client with draft |
| `S` | Skip | Move to next without action |
| `D` | Dismiss | Opens dismiss modal |
| `Z` | Undo | Reverts last action (if within 30s) |
| `?` | Show shortcuts | Opens shortcut overlay |

Implementation: Single `useEffect` with `keydown` listener, guard against input focus.

---

## File Structure

```
src/
├── styles/
│   └── tokens.css              # Design tokens (port from V1)
├── lib/
│   ├── stores/
│   │   ├── session-store.ts    # Progress + undo state
│   │   └── ui-store.ts         # UI state + toasts
│   └── utils.ts                # cn() helper
├── app/
│   ├── globals.css             # Utility classes (port from V1)
│   ├── layout.tsx              # Providers wrapper
│   └── page.tsx                # Monday Review (three-zone layout)
├── components/
│   ├── providers.tsx           # ToastProvider wrapper
│   ├── ui/
│   │   ├── badge.tsx           # Semantic badge system
│   │   ├── button.tsx          # Button variants
│   │   ├── card.tsx            # Card component
│   │   └── skeleton.tsx        # Base skeleton component
│   ├── feedback/
│   │   ├── toast.tsx           # Toast system + container
│   │   ├── empty-state.tsx     # Empty queue state
│   │   ├── error-state.tsx     # Error with retry
│   │   └── page-skeletons.tsx  # Loading states
│   ├── overlays/
│   │   └── shortcut-overlay.tsx # Keyboard shortcuts help
│   └── monday-review/
│       ├── session-header.tsx  # Progress bar
│       ├── queue-panel.tsx     # Left navigation
│       ├── now-card.tsx        # Centre context
│       ├── dual-track-scores.tsx # MS vs AG display
│       ├── contact-card.tsx    # Contact with confidence
│       ├── action-panel.tsx    # Right composer
│       ├── dismiss-modal.tsx   # Dismiss reasons
│       └── keyboard-hints.tsx  # Footer hints
```

---

## V1 Source Files Reference

Files to port from `/Users/jamesjeram/Documents/MI-Platform/dashboard-react`:

| V1 File | V2 Destination | Notes |
|---------|----------------|-------|
| `styles/tokens.css` | `src/styles/tokens.css` | Copy wholesale |
| `app/globals.css` | `src/app/globals.css` | Merge with existing |
| `lib/utils.ts` | `src/lib/utils.ts` | cn() helper |
| `lib/stores/session-store.ts` | `src/lib/stores/` | Adapt types |
| `lib/stores/ui-store.ts` | `src/lib/stores/` | Simplify for MVP |
| `components/providers.tsx` | `src/components/` | ToastProvider |
| `app/focus/page.tsx` | `src/app/page.tsx` | Adapt to V2 data model |
| `components/focus-mode/session-header.tsx` | `src/components/monday-review/` | Simplify props |
| `components/focus-mode/queue-panel.tsx` | `src/components/monday-review/` | Adapt to V2 types |
| `components/focus-mode/now-card.tsx` | `src/components/monday-review/` | Adapt to V2 types |
| `components/focus-mode/dual-track-scores.tsx` | `src/components/monday-review/` | Keep as-is |
| `components/focus-mode/contact-card.tsx` | `src/components/monday-review/` | Keep as-is |
| `components/focus-mode/action-panel.tsx` | `src/components/monday-review/` | Simplify for MVP |
| `components/focus-mode/dismiss-modal.tsx` | `src/components/monday-review/` | Keep as-is |
| `components/feedback/toast.tsx` | `src/components/feedback/` | Keep as-is |
| `components/feedback/empty-state.tsx` | `src/components/feedback/` | Keep as-is |
| `components/feedback/error-state.tsx` | `src/components/feedback/` | Keep as-is |
| `components/feedback/page-skeletons.tsx` | `src/components/feedback/` | Adapt to V2 layout |
| `components/overlays/shortcut-overlay.tsx` | `src/components/overlays/` | Update shortcuts list |
| `components/ui/badge.tsx` | `src/components/ui/` | Port semantic variants |
| `components/ui/button.tsx` | `src/components/ui/` | Port variants |
| `components/ui/skeleton.tsx` | `src/components/ui/` | Keep as-is |

---

## Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | Design tokens imported and functional | Colours render correctly across all components |
| 2 | Three-zone layout renders | Queue left, Now Card centre, Actions right |
| 3 | Progress header shows session stats | "Today: X of Y" with progress bar |
| 4 | Queue panel shows opportunities | List with current item highlighted |
| 5 | Now Card displays context capsule | Why/Next/When/Source rows visible |
| 6 | Dual track scores display | MS vs AG with primary indicator |
| 7 | Action panel shows draft message | Subject + body + Send button |
| 8 | J/K navigation works | Keyboard moves through queue |
| 9 | E/S/D actions work | Triggers appropriate handlers |
| 10 | Z undo works | Reverts last action within 30s |
| 11 | Undo toast shows countdown | Progress bar animates down |
| 12 | ? shows shortcut overlay | Modal with all shortcuts |
| 13 | Dismiss modal shows reasons | Propagation warning for "Not police sector" |
| 14 | Empty state shows when queue empty | Friendly message + refresh button |
| 15 | Error state shows on API failure | Retry button, support link after 3 failures |
| 16 | Skeleton shows while loading | Three-zone shape maintained |

---

## Testing Plan

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 1 | Load page with 5 opportunities | Queue shows 5 items, first selected, Now Card populated |
| 2 | Press J three times | Selection moves to 4th item, Now Card updates |
| 3 | Press E on opportunity | Mail client opens, toast shows with countdown, progress updates |
| 4 | Press Z within 30s of action | Action reverted, opportunity restored |
| 5 | Wait 31s after action, press Z | "Nothing to undo" toast |
| 6 | Press D on opportunity | Dismiss modal opens with reasons |
| 7 | Select "Not police sector" dismiss | Warning about AI training shown |
| 8 | Process 3 of 5 opportunities | Progress shows "3 of 5" with 60% bar |
| 9 | Press ? key | Shortcut overlay appears with all shortcuts |
| 10 | Trigger API error | Error state with retry button |
| 11 | Retry 3+ times | Support link appears |
| 12 | Load page (slow connection) | Skeleton matches final layout |

---

## Build Sequence

1. **Port tokens.css** — Copy V1's design tokens to V2
2. **Port globals.css utilities** — Add utility classes
3. **Port lib/utils.ts** — cn() helper
4. **Port stores** — session-store.ts, ui-store.ts
5. **Port providers.tsx** — ToastProvider wrapper
6. **Port feedback components** — toast, empty-state, error-state, skeletons
7. **Port UI components** — badge, button, skeleton
8. **Create component shells** — monday-review folder structure
9. **Implement SessionHeader** — Progress display
10. **Implement QueuePanel** — List with selection
11. **Implement NowCard** — Context capsule + dual track + contact
12. **Implement ActionPanel** — Draft display and buttons
13. **Implement DismissModal** — Reasons with propagation
14. **Implement ShortcutOverlay** — Help modal
15. **Wire keyboard navigation** — J/K/E/S/D/Z/? handlers
16. **Integration test** — Full flow verification

---

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| SPEC-007 (React Dashboard) | ✅ Implemented | Data fetching already done |
| SPEC-001 (Airtable Schema) | ✅ Complete | Data model defined |
| V1 Codebase | ✅ Reviewed | Source for porting |
| Zustand | Required | State management (same as V1) |

---

## Out of Scope

- Command palette (⌘K) — future enhancement
- Pin tray — future enhancement
- Force context sidebar — future enhancement
- Follow-up mode — Phase 2
- Mobile responsive — future enhancement
- Morning Brief rituals — see SPEC-008

---

## Guardrails Applied

- **G-012**: UI must support keyboard-only operation
- **G-013**: Progress feedback required for queue processing
- **G-014**: Single-focus display (one opportunity at a time)

---

## Handoff Notes

This spec can be implemented by:

1. Copying V1 source files from the paths listed above
2. Adapting TypeScript types to match V2's `Opportunity` interface (from SPEC-007)
3. Connecting to V2's existing data fetching hooks
4. Testing the keyboard navigation and action handlers

The V1 code is production-tested and well-documented with JSDoc comments.
