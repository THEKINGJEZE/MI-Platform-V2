# SPEC-007a: UI Foundation — Full Feature Dashboard

**Status**: Active
**Phase**: 1c Enhancement
**Created**: 2025-01-19
**Updated**: 2025-01-20
**Depends on**: SPEC-007b (Dashboard MVP) — must be complete and validated first
**Prerequisites**: Schema expansion (see below), Phase 1b competitor monitoring
**Source**: V1 Dashboard codebase (`/Users/jamesjeram/Documents/MI-Platform/dashboard-react`)
**Decision**: A8 (Three-Zone Dashboard Layout + Morning Brief)
**Skills**: `action-oriented-ux`, `adhd-interface-design`, `uk-police-design-system`, `b2b-visualisation`
**Aligned with**: SALES-STRATEGY.md (Lead Prioritisation Model, Contact Strategy)

---

## Implementation Status

This spec enhances the MVP dashboard with priority-based signal display, contact confidence indicators, and session persistence.

**Prerequisites:**

| Prerequisite | Status | Notes |
|--------------|--------|-------|
| SPEC-007b complete | ✅ Done | MVP deployed at dashboard.peelplatforms.co.uk |
| Phase 1b complete | ✅ Done | Competitor monitoring live (WF9) |
| Schema expansion | ⏳ Pending | 6 new fields (see Schema Prerequisites) |
| Workflow updates | ⏳ Pending | WF3 + WF5 prompt changes (see Workflow Requirements) |

**Implementation order:**
1. Add schema fields to Airtable (manual)
2. Update WF3 classification to output priority data
3. Update WF5 enrichment to output contact type
4. Enhance dashboard UI components

---

## Strategic Alignment

This spec implements the Lead Prioritisation Model from SALES-STRATEGY.md.

### Core Philosophy (from Sales Strategy)

> "Job Postings Are Warm Leads, Not Classifications. We are not trying to decide 'is this Agency or Managed Services?' We are identifying a force with an active need and an opportunity to make contact."

**What this means for the UI:**
- ❌ No dual-track scoring (MS vs AG)
- ❌ No "primary track" indicator
- ✅ Priority tiers based on signal patterns
- ✅ Response urgency display
- ✅ Contact type indicator (Problem Owner vs Fallback)

### Priority Tier Model

| Priority | Signal Pattern | Response Window | Visual |
|----------|---------------|-----------------|--------|
| 🔴 **P1 — Hot** | Competitor posting | Same day | Red badge, urgent styling |
| 🔴 **P1 — Hot** | Urgent language ("immediate start", "ASAP", "backlog") | Same day | Red badge, urgent styling |
| 🟠 **P2 — Warm** | Volume indicators (multiple roles) | Within 48 hours | Amber badge |
| 🟠 **P2 — Warm** | Specialist/senior role | Within 48 hours | Amber badge |
| 🟡 **P3 — Standard** | Standard direct posting | This week | Yellow badge |

---

## Overview

Port V1's proven Focus Mode design system and layout to V2, enhanced with priority-based signal display aligned to the Sales Strategy.

**Why this matters**: V1's Focus Mode was designed specifically for the Monday morning review experience — progress tracking, keyboard navigation, visual isolation, and reduced cognitive load. This spec adds the priority intelligence layer that helps James act on the right signals first.

**Scope**: Design system foundation + Monday Review page layout + priority display + feedback systems. Does not include data fetching logic (covered by SPEC-007b) or Morning Brief rituals (see SPEC-008).

---

## Architecture
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Progress] Today: 3 of 12 ████░░░░░░ 25% • Avg: 1:42      [Refresh]       │
├────────────┬──────────────────────────────────────────┬─────────────────────┤
│            │                                          │                     │
│  QUEUE     │           NOW CARD                       │    COMPOSER DOCK    │
│  PANEL     │           (Context)                      │    (Actions)        │
│  (280px)   │           (flexible)                     │    (320px)          │
│            │                                          │                     │
│  Filter:   │  ┌────────────────────────────────┐     │  Subject: ...       │
│  [Ready]   │  │ Force Name              [P1 🔴] │     │                     │
│  [Sent]    │  │ ─────────────────────────────── │     │  Message body...    │
│  [All]     │  │                                 │     │                     │
│            │  │ Why:   Competitor posting       │     │  ───────────────    │
│  ─────────│  │        detected (Red Snapper)   │     │                     │
│  > Kent 🔴 │  │ Next:  Email problem owner      │     │  [Send Email]       │
│    Durham  │  │ When:  ⚡ Same day              │     │                     │
│    Essex   │  │ Source: 2 signals (1 competitor)│     │  [Skip] [Dismiss]   │
│    ...     │  │                                 │     │                     │
│            │  │ [Signal Pattern Cards]          │     │                     │
│            │  │ [Contact Card + Confidence]     │     │                     │
│            │  └────────────────────────────────┘     │                     │
├────────────┴──────────────────────────────────────────┴─────────────────────┤
│  [J/K] navigate  •  [E] Send  •  [S] Skip  •  [D] Dismiss  •  [?] Shortcuts │
└─────────────────────────────────────────────────────────────────────────────┘
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
| `--color-warning` | 38 92% 50% | P2 priority, attention |
| `--color-danger` | 0 100% 71% | P1 priority, urgent |
| `--color-info` | 239 84% 67% | P3 priority, informational |

### Typography

| Token | Value | Usage |
|-------|-------|-------|
| `--font-sans` | Inter | Body text |
| `--font-mono` | IBM Plex Mono | Counts, data |
| `--type-body` | 16px | Default text |
| `--type-body-sm` | 14px | Secondary text |
| `--type-caption` | 12px | Labels, hints |

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

---

## Components

### 1. SessionHeader

**Purpose**: Progress tracking for dopamine feedback loop

**Display**:
```
Today: 3 of 12 ████░░░░░░ 25% • Avg: 1:42    [Refresh]
```

**Props**:
- `processed`: number
- `total`: number
- `percentage`: number
- `averageTime`: number
- `onRefresh`: () => void

**Behaviour**:
- Progress bar colour shifts: <50% muted → 50-75% warning → 75-99% action → 100% success
- Updates in real-time as user processes queue

**Source file**: `components/focus-mode/session-header.tsx`

---

### 2. QueuePanel

**Purpose**: Left navigation showing opportunity list with priority indicators

**Props**:
- `opportunities`: Opportunity[]
- `currentId`: string | null
- `filter`: "ready" | "sent" | "all"
- `onSelect`: (id: string) => void
- `onFilterChange`: (filter) => void

**Display per item**:
- Force name (truncated)
- Signal count badge
- **Priority indicator** (P1 🔴 / P2 🟠 / P3 🟡)
- Left border colour matches priority

**Sort order**: P1 first, then P2, then P3 (within each tier, by recency)

**Keyboard**: J/K navigation updates `currentId`

**Source file**: `components/monday-review/queue-panel.tsx`

---

### 3. NowCard (Priority-Based)

**Purpose**: Central context display with priority intelligence

**Sections**:

1. **Header**
   - Force name (24px, primary)
   - Priority badge (P1/P2/P3 with colour)
   - Response window indicator

2. **Context Capsule** (icon + label + content rows)

   | Label | Icon | Content |
   |-------|------|---------|
   | Why | 💡 | Signal pattern explanation (from `priority_signals`) |
   | Next | → | Recommended channel + action |
   | When | ⏱️ | Response window (Same Day / Within 48h / This Week) |
   | Source | 🏢 | Signal count + types breakdown |

3. **Signal Pattern Cards** (replaces dual-track scores)

   Visual cards showing which patterns triggered this priority:

   | Pattern | Display |
   |---------|---------|
   | Competitor posting | 🔴 "Red Snapper posting detected" |
   | Urgent language | 🔴 "Immediate start required" |
   | Volume indicator | 🟠 "Multiple roles (×3)" |
   | Specialist role | 🟠 "Senior hire: Head of Investigations" |
   | Standard signal | 🟡 "Direct job posting" |

4. **Contact Card** (with confidence indicator)
   - Contact name + title
   - Email (clickable)
   - **Contact type badge**:
     - ✓ "Problem Owner" (green) — we found the right person
     - ○ "HR Fallback" (amber) — interim contact, flag for research
   - Confidence sources (if available)

**Source files**:
- `components/monday-review/now-card.tsx`
- `components/monday-review/signal-patterns.tsx`
- `components/monday-review/contact-card.tsx`

---

### 4. SignalPatternCards (NEW — replaces DualTrackScores)

**Purpose**: Show which signal patterns triggered the priority tier

**Props**:
```typescript
interface SignalPatternCardsProps {
  priorityTier: "P1" | "P2" | "P3";
  patterns: SignalPattern[];
}

interface SignalPattern {
  type: "competitor" | "urgent" | "volume" | "specialist" | "standard";
  description: string;
  source?: string; // e.g., "Red Snapper", "Indeed"
}
```

**Display**:
```
┌─────────────────────────────────────┐
│ 🔴 Competitor posting               │
│    Red Snapper — PIP2 Investigator  │
├─────────────────────────────────────┤
│ 🔴 Urgent language                  │
│    "Immediate start", "backlog"     │
└─────────────────────────────────────┘
```

**Behaviour**:
- Shows all patterns that contributed to priority
- Colour-coded to match priority tier
- Helps James understand *why* this is flagged

---

### 5. ContactCard (Enhanced)

**Purpose**: Display contact with confidence indicator

**Props**:
```typescript
interface ContactCardProps {
  contact: {
    name: string;
    title: string;
    email: string;
    contactType: "problem_owner" | "deputy" | "hr_fallback";
    confidence: number; // 0-100
    confidenceSources?: string[];
  } | null;
}
```

**Display**:
```
┌─────────────────────────────────────┐
│ Jane Smith                          │
│ Head of Crime                       │
│ jane.smith@kent.police.uk      📧   │
│                                     │
│ ✓ Problem Owner                     │
│   via LinkedIn, Force website       │
└─────────────────────────────────────┘
```

**Contact Type Badges**:
| Type | Badge | Colour | Meaning |
|------|-------|--------|---------|
| `problem_owner` | ✓ Problem Owner | Green | Correct target per Sales Strategy |
| `deputy` | ○ Deputy | Blue | Second-best option |
| `hr_fallback` | ⚠ HR Fallback | Amber | Interim — flag for research |

**When HR Fallback**: Show subtle prompt "Consider researching problem owner"

---

### 6. ComposerDock (ActionPanel)

**Purpose**: Right panel with draft message and action buttons

**Sections**:

1. **Draft Display**
   - Subject line
   - Message body (scrollable)
   - Character count
   - Copy button

2. **Primary Action**
   - `[Send Email]` — full width, prominent

3. **Secondary Actions**
   - `[Skip]` — move to next without action
   - `[Dismiss]` — mark as not relevant

4. **Keyboard Hints**
```
   [E] Send • [S] Skip • [D] Dismiss
```

**Source file**: `components/monday-review/composer-dock.tsx`

---

### 7. DismissModal

**Purpose**: Structured dismiss reasons with feedback propagation

**Reasons** (from SPEC-007b):
- "Not police sector" — *propagates to AI filter*
- "Wrong force"
- "Not our service area"
- "Already contacted"
- "Duplicate"
- "Other"

**Source file**: `components/monday-review/dismiss-modal.tsx`

---

### 8. Toast System

**Purpose**: Feedback notifications with undo support

**Toast Types**:
| Type | Duration | Features |
|------|----------|----------|
| `success` | 5s | Green, checkmark icon |
| `error` | 5s | Red, alert icon |
| `warning` | 5s | Amber, warning icon |
| `info` | 5s | Blue, info icon |
| `undo` | 30s | Blue, countdown progress bar, undo action |

**Source file**: `components/feedback/toast.tsx`

---

### 9. Empty State

**Purpose**: Friendly feedback when queue is empty

**Source file**: `components/feedback/empty-state.tsx`

---

### 10. Error State

**Purpose**: Error display with retry and support escalation

**Source file**: `components/feedback/error-state.tsx`

---

### 11. Skeleton Loaders

**Purpose**: Shape-matched loading states

**Source file**: `components/feedback/page-skeletons.tsx`

---

### 12. Shortcut Overlay

**Purpose**: Shows all keyboard shortcuts when user presses `?`

**Source file**: `components/overlays/shortcut-overlay.tsx`

---

### 13. Badge System

Port V1's semantic badge variants, updated for priority model:

| Variant | Background | Text | Usage |
|---------|------------|------|-------|
| `p1` | danger-muted | danger | P1 Hot priority |
| `p2` | warning-muted | warning | P2 Warm priority |
| `p3` | info-muted | info | P3 Standard priority |
| `ready` | success-muted | success | Ready to send |
| `sent` | action-muted | action | Already actioned |
| `problem-owner` | success-muted | success | Contact type |
| `hr-fallback` | warning-muted | warning | Contact type |
| `competitor` | danger-muted | danger | Signal pattern |
| `urgent` | danger-muted | danger | Signal pattern |
| `volume` | warning-muted | warning | Signal pattern |
| `specialist` | warning-muted | warning | Signal pattern |

**Source file**: `components/ui/badge.tsx`

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

---

## File Structure
```
src/
├── styles/
│   └── tokens.css              # Design tokens
├── lib/
│   ├── stores/
│   │   ├── session-store.ts    # Progress + undo state
│   │   └── ui-store.ts         # UI state + toasts
│   └── utils.ts                # cn() helper
├── app/
│   ├── globals.css             # Utility classes
│   ├── layout.tsx              # Providers wrapper
│   └── page.tsx                # Monday Review
├── components/
│   ├── providers.tsx           # ToastProvider wrapper
│   ├── ui/
│   │   ├── badge.tsx           # Semantic badge system
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── skeleton.tsx
│   ├── feedback/
│   │   ├── toast.tsx
│   │   ├── empty-state.tsx
│   │   ├── error-state.tsx
│   │   └── page-skeletons.tsx
│   ├── overlays/
│   │   └── shortcut-overlay.tsx
│   └── monday-review/
│       ├── session-header.tsx
│       ├── queue-panel.tsx
│       ├── now-card.tsx
│       ├── signal-patterns.tsx  # NEW
│       ├── contact-card.tsx     # ENHANCED
│       ├── composer-dock.tsx
│       ├── dismiss-modal.tsx
│       └── keyboard-hints.tsx
```

---

## Schema Prerequisites

### Opportunities Table Additions

| Field | Type | Purpose |
|-------|------|---------|
| `priority_tier` | Single Select | P1, P2, P3 |
| `priority_signals` | Long Text | JSON array of detected patterns |
| `response_window` | Single Select | Same Day, Within 48h, This Week |
| `contact_type` | Single Select | Problem Owner, Deputy, HR Fallback |

### Contacts Table Additions

| Field | Type | Purpose |
|-------|------|---------|
| `research_confidence` | Number (0-100) | How confident are we in this contact? |
| `confidence_sources` | Long Text | Where did we find them? |

---

## Workflow Requirements

These workflow changes are **prerequisites** for the UI enhancements. Without them, the dashboard has no data to display.

### WF3: Classification Updates

**Current state**: WF3 classifies signals as relevant/irrelevant and links to force.

**Required changes**: Add priority tier calculation and signal pattern detection.

#### Priority Tier Rules

| Condition | Priority | Response Window |
|-----------|----------|----------------|
| Signal source is competitor (Red Snapper, Investigo, etc.) | P1 | Same Day |
| Job text contains urgent language | P1 | Same Day |
| Multiple signals for same force (volume) | P2 | Within 48h |
| Senior/specialist role detected | P2 | Within 48h |
| Standard direct posting | P3 | This Week |

**Urgent language patterns** (case-insensitive):
- "immediate start"
- "ASAP"
- "urgent"
- "backlog"
- "critical"
- "as soon as possible"

**Senior/specialist role patterns**:
- Title contains: "Head of", "Director", "Chief", "Senior", "Lead"
- Or role is specialist: "Investigator", "Analyst", "Forensic"

#### AI Prompt Addition (WF3)

Add to the classification prompt output schema:

```json
{
  "priority_tier": "P1 | P2 | P3",
  "priority_signals": [
    {
      "type": "competitor | urgent | volume | specialist | standard",
      "description": "Human-readable explanation",
      "source": "Optional: competitor name or signal source"
    }
  ],
  "response_window": "Same Day | Within 48h | This Week"
}
```

**Classification logic** (in order of precedence):
1. If `signal.source` in competitors list → P1 + "competitor" pattern
2. If urgent language detected → P1 + "urgent" pattern
3. If opportunity has 2+ signals → P2 + "volume" pattern
4. If senior/specialist title → P2 + "specialist" pattern
5. Otherwise → P3 + "standard" pattern

**Note**: A signal can have multiple patterns (e.g., competitor + urgent = still P1, but both patterns shown).

### WF5: Enrichment Updates

**Current state**: WF5 finds contacts and drafts messages.

**Required changes**: Add contact type classification and confidence scoring.

#### Contact Type Rules (Job Title Pattern Matching)

This is Phase 1 implementation using title patterns. Future enhancement will use agentic research for more intelligent contact discovery.

| Contact Type | Title Patterns | Department Match |
|--------------|---------------|------------------|
| **Problem Owner** | "Head of", "Director of", "Chief" | Crime, PSD, Professional Standards, Investigations |
| **Problem Owner** | "Resourcing Manager", "Resourcing Lead" | Resourcing, HR (for volume hiring) |
| **Deputy** | "Deputy", "Assistant Director" | Any operational |
| **HR Fallback** | "HR", "Recruitment", "Talent", "People" | HR |

**Classification logic**:
```
IF contact.department IN ['Crime', 'PSD', 'Professional Standards', 'Investigations']
   AND contact.title MATCHES ['Head of', 'Director', 'Chief']
   → contact_type = 'problem_owner'

ELSE IF contact.department = 'Resourcing'
   AND contact.seniority IN ['Director', 'Head', 'Manager']
   → contact_type = 'problem_owner'

ELSE IF contact.title MATCHES ['Deputy', 'Assistant Director']
   → contact_type = 'deputy'

ELSE IF contact.department = 'HR'
   OR contact.title MATCHES ['HR', 'Recruitment', 'Talent', 'People']
   → contact_type = 'hr_fallback'

ELSE
   → contact_type = 'hr_fallback'  // Default to fallback
```

#### Confidence Scoring

| Source | Confidence |
|--------|------------|
| LinkedIn profile confirmed | +40 |
| Force website staff directory | +30 |
| Previous email reply | +50 |
| Title matches problem owner pattern | +20 |
| Generic HR contact | +10 |

**Total capped at 100**. Store sources in `confidence_sources` as JSON array.

#### AI Prompt Addition (WF5)

Add to the enrichment prompt output schema:

```json
{
  "contact_type": "problem_owner | deputy | hr_fallback",
  "research_confidence": 0-100,
  "confidence_sources": ["LinkedIn", "Force website"]
}
```

### Future Enhancement: Agentic Contact Research

> **Deferred to future phase**: The job title pattern matching above is a Phase 1 implementation. A future enhancement will implement agentic workflows that:
> - Search LinkedIn for the force + role combination
> - Check force website staff directories
> - Cross-reference HubSpot for existing contacts
> - Validate email addresses
> - Build confidence scores from multiple sources
>
> This will be specified in a separate SPEC when we're ready to build it.

---

## Acceptance Criteria

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

---

## Testing Plan

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 1 | Load page with mixed P1/P2/P3 | Queue sorted P1 first, badges visible |
| 2 | Select P1 opportunity | Now Card shows "Same day" response window |
| 3 | View competitor signal | Pattern card shows "Red Snapper posting detected" |
| 4 | View HR Fallback contact | Amber badge, "Consider researching" prompt |
| 5 | Press J three times | Selection moves, Now Card updates |
| 6 | Press E | Mail client opens, toast shows, progress updates |
| 7 | Press Z within 30s | Action reverted |
| 8 | Press D | Dismiss modal opens |
| 9 | Process 3 of 5 | Progress shows "3 of 5" with 60% bar |
| 10 | Press ? | Shortcut overlay appears |

---

## Build Sequence

### Phase A: Prerequisites (Schema + Workflows)

1. **Add schema fields** (manual in Airtable)
   - Opportunities: `priority_tier`, `priority_signals`, `response_window`, `contact_type`
   - Contacts: `research_confidence`, `confidence_sources`
2. **Update WF3 classification** — Add priority tier and signal pattern output
3. **Update WF5 enrichment** — Add contact type and confidence output
4. **Run test signals** — Verify new fields are populated

### Phase B: Dashboard UI Enhancements

5. **Port tokens.css** — Design tokens
6. **Port globals.css utilities** — Utility classes
7. **Port stores** — session-store.ts, ui-store.ts
8. **Port providers.tsx** — ToastProvider
9. **Port feedback components** — toast, empty-state, error-state
10. **Port UI components** — badge (updated variants), button, skeleton
11. **Implement SessionHeader**
12. **Implement QueuePanel** — with priority sorting
13. **Implement NowCard** — with context capsule
14. **Implement SignalPatternCards** — NEW component
15. **Implement ContactCard** — with confidence indicator
16. **Implement ComposerDock**
17. **Implement DismissModal**
18. **Implement ShortcutOverlay**
19. **Wire keyboard navigation**
20. **Integration test**

---

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| SPEC-007b (MVP Dashboard) | ✅ Complete | Deployed at dashboard.peelplatforms.co.uk |
| Phase 1b (Competitor Monitoring) | ✅ Complete | WF9 live, Bright Data connected |
| Schema expansion | ⏳ Pending | 6 fields to add (see Build Sequence Phase A) |
| Workflow updates | ⏳ Pending | WF3 + WF5 (see Workflow Requirements) |
| V1 Codebase | Reference | Source for porting |

---

## Out of Scope

- Command palette (⌘K) — future enhancement
- Pin tray — future enhancement
- Mobile responsive — future enhancement
- Morning Brief rituals — see SPEC-008

---

## Guardrails Applied

- **G-012**: UI must support keyboard-only operation
- **G-013**: Progress feedback required for queue processing
- **G-014**: Single-focus display (one opportunity at a time)

---

## Sales Strategy Alignment Checklist

| Strategy Principle | Implementation |
|-------------------|----------------|
| "Job postings are warm leads, not classifications" | ✅ No MS/AG scoring — priority tiers only |
| "Contact the problem owner" | ✅ Contact type indicator with fallback warning |
| "Competitor signals = confirmed opportunity" | ✅ P1 priority, prominent pattern display |
| "We present our full capability" | ✅ No service pre-classification |
| "Hook → Bridge → Value → CTA structure" | ✅ Drafts follow this (via WF5) |

---

## Revision History

| Date | Change | Reason |
|------|--------|--------|
| 2025-01-19 | Initial draft | Created from V1 patterns |
| 2025-01-20 | Removed dual-track scoring | Aligned with SALES-STRATEGY.md |
| 2025-01-20 | Added priority tier model | Per Sales Strategy Lead Prioritisation |
| 2025-01-20 | Added contact confidence | Per Sales Strategy Contact Strategy |
| 2025-01-20 | Replaced DualTrackScores with SignalPatternCards | Strategy alignment |
| 2025-01-20 | **Status: Active** | Prerequisites met (SPEC-007b + Phase 1b complete) |
| 2025-01-20 | Added Workflow Requirements section | Explicit WF3/WF5 prompt changes for Claude Code |
| 2025-01-20 | Added response window rules | P1→Same Day, P2→48h, P3→Week |
| 2025-01-20 | Added contact type classification | Job title patterns (agentic research deferred) |

---

*This spec implements the UI layer for the Lead Prioritisation Model defined in SALES-STRATEGY.md. Technical implementation of priority classification is in SPEC-003 (Classification).*
