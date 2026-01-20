# V1 → V2 Visual Comparison Report

**Generated**: 20 January 2025
**Purpose**: Gap analysis between V1 and V2 dashboard implementations to inform visual refinement
**Status**: Audit-only (no code changes made)

---

## Executive Summary

V1 (`MI-Platform/dashboard-react`) is a feature-rich implementation with dual-track scoring, sophisticated badge variants, and comprehensive session management. V2 (`MI-Platform-V2/dashboard`) is a simplified MVP focused on the core review workflow with P1/P2/P3 priority tiers.

**Key Differences**:
- V1 has 6 queue modes vs V2's 3 filter tabs
- V1 has dual-track scoring (MS vs AG) vs V2's single priority tier
- V1's badge system has 30+ variants vs V2's ~10 variants
- V1 uses Tailwind v4 with `@theme` inline vs V2's older Tailwind pattern
- V1 has all-time stats and energy tracking vs V2's session-only stats

---

## Component Comparison Table

| UI Element | V1 File(s) | V2 File(s) | Gap Analysis |
|------------|-----------|-----------|--------------|
| **Design Tokens** | `styles/tokens.css` (200+ lines) | `styles/tokens.css` (130 lines) | V2 missing: density modes, shadcn full compatibility layer, animation tokens |
| **Global Styles** | `app/globals.css` (Tailwind v4, @theme inline) | `app/globals.css` (older pattern) | V2 missing: focus mode dimming classes, full utility class layer |
| **Queue Panel** | `components/focus-mode/queue-panel.tsx` | `components/review/queue-panel.tsx` | V2 missing: 6 queue modes (has 3 tabs), TrackBadge display, force grouping |
| **Now Card** | `components/focus-mode/now-card.tsx` (341 lines) | `components/review/now-card.tsx` (389 lines) | V2 has Context Capsule but missing: DualTrackScores, ComponentScores grid |
| **Action Panel** | `components/focus-mode/action-panel.tsx` | `components/review/composer-dock.tsx` | V2 missing: channel buttons (Phone/LinkedIn), outcome buttons (Won/Lost/Dormant) |
| **Contact Card** | `components/focus-mode/contact-card.tsx` | (inline in now-card.tsx) | V2 missing: confidence dot colors, ConfidenceLabel tooltips |
| **Session Header** | `components/focus-mode/session-header.tsx` | `components/review/session-header.tsx` | V2 missing: all-time stats, quick capture button, enhanced progress display |
| **Dual-Track Scores** | `components/focus-mode/dual-track-scores.tsx` | N/A | Not in V2 (deferred per SPEC-007a) |
| **Score Breakdown** | `components/focus-mode/score-breakdown.tsx` | N/A | Not in V2 (deferred per SPEC-007a) |
| **Badge System** | `components/ui/badge.tsx` (418 lines, 30+ variants) | `components/mi-badge.tsx` (208 lines, ~10 variants) | V2 missing: HMICFRS, Admiralty, track (MS/AG), segment, IR35, opportunity type variants |
| **Session Store** | `lib/stores/session-store.ts` (persist, energy) | `lib/stores/review-store.ts` (no persist) | V2 missing: localStorage persist, energy level, all-time counter |

---

## Detailed Gap Analysis

### 1. Design Tokens

**V1 Tokens** (`styles/tokens.css`):
```css
/* V1 has density modes */
:root[data-density="compact"] {
  --space-1: 2px;
  --space-2: 4px;
  /* ... */
}

/* V1 has full shadcn compatibility */
--card: var(--bg-surface-0);
--card-foreground: var(--text-primary);
--popover: var(--bg-surface-1);
--popover-foreground: var(--text-primary);
/* ... 20+ shadcn mappings */

/* V1 has animation tokens */
--duration-instant: 50ms;
--duration-fast: 150ms;
--duration-normal: 250ms;
--ease-out: cubic-bezier(0.33, 1, 0.68, 1);
```

**V2 Tokens** (`styles/tokens.css`):
```css
/* V2 has P1/P2/P3 priority colors (good!) */
--priority-p1: var(--color-danger);
--priority-p2: var(--color-warning);
--priority-p3: hsl(45 93% 47%);

/* V2 has layout widths (good!) */
--queue-width: 280px;
--composer-width: 320px;

/* V2 missing: density modes, full shadcn layer, animation tokens */
```

**Gap**: V2 should port V1's density modes and animation tokens for polish.

---

### 2. Queue Panel

**V1 Queue Modes** (6 options):
```typescript
// V1 has sophisticated filtering
type QueueMode = 'priority' | 'managed' | 'agency' | 'by_force' | 'all' | 'follow_up';

// V1 shows track badges inline
<TrackBadge track={opp.primary_track} size="sm" />
<PriorityBadge priority={opp.priority} size="sm" />
```

**V2 Filter Tabs** (3 options):
```typescript
// V2 simpler filtering
type FilterType = 'ready' | 'sent' | 'all';

// V2 shows priority tiers
<PriorityTierBadge priority={opp.priority_tier} />
```

**Gap**: V2 intentionally simplified per SPEC-007b. Consider adding `by_force` grouping in future.

---

### 3. Now Card / Context Display

**V1 Now Card Structure**:
```tsx
// V1 has full scoring display
<DualTrackScores
  msScore={opp.ms_score}
  agScore={opp.ag_score}
  primaryTrack={opp.primary_track}
/>

<ComponentScores
  signal={opp.signal_score}
  fit={opp.fit_score}
  relationship={opp.relationship_score}
  timing={opp.timing_score}
/>

// V1 has rich context rows
<ContextRow icon="why" label="Why" value={opp.why_now} />
<ContextRow icon="urgency" label="Urgency" value={opp.urgency_reason} />
```

**V2 Now Card Structure**:
```tsx
// V2 has Context Capsule (good!)
<ContextCapsule opportunity={opp} />

// V2 has Signal Pattern Cards (good!)
<SignalPatternCards signals={opp.signals} />

// V2 has Contact Confidence bar (good!)
<ContactConfidenceBar confidence={contact.research_confidence} />
```

**Gap**: V2 has good structure. Missing dual-track scores (deferred per SPEC-007a).

---

### 4. Action Panel vs Composer Dock

**V1 Action Panel**:
```tsx
// V1 has channel selection
<ChannelButtons>
  <Button variant="channel" data-channel="email">Email</Button>
  <Button variant="channel" data-channel="phone">Phone</Button>
  <Button variant="channel" data-channel="linkedin">LinkedIn</Button>
</ChannelButtons>

// V1 has outcome buttons
<OutcomeButtons>
  <Button variant="outcome-won">Won</Button>
  <Button variant="outcome-lost">Lost</Button>
  <Button variant="outcome-dormant">Dormant</Button>
</OutcomeButtons>
```

**V2 Composer Dock**:
```tsx
// V2 simpler actions
<Button onClick={handleSend}>Send Email</Button>
<Button variant="secondary" onClick={handleSkip}>Skip</Button>
<Button variant="ghost" onClick={() => setShowDismissModal(true)}>Dismiss</Button>
```

**Gap**: V2 missing channel selection and outcome tracking. Consider for Phase 2.

---

### 5. Badge System

**V1 Badge Variants** (30+):
```typescript
const badgeVariants = cva("...", {
  variants: {
    variant: {
      default, secondary, outline, destructive, // Base
      success, warning, info, muted, // Semantic
      "priority-hot", "priority-high", "priority-medium", "priority-low", // Priority
      "hmicfrs-outstanding", "hmicfrs-good", "hmicfrs-adequate", // HMICFRS
      "admiralty-a", "admiralty-b", "admiralty-c", // Admiralty codes
      "track-ms", "track-ag", // Dual-track
      "segment-enterprise", "segment-mid", "segment-emerging", // Segment
      "ir35-inside", "ir35-outside", "ir35-undetermined", // IR35
      "opp-new", "opp-nurture", "opp-active", "opp-won", "opp-lost", // Opportunity
    }
  }
});
```

**V2 Badge Variants** (~10):
```typescript
const variants = {
  status: "bg-blue-500/20 text-blue-400",
  priority: "bg-orange-500/20 text-orange-400",
  "priority-high": "bg-red-500/20 text-red-400",
  "priority-p1": "bg-[hsl(var(--priority-p1))]...",
  "priority-p2": "bg-[hsl(var(--priority-p2))]...",
  "priority-p3": "bg-[hsl(var(--priority-p3))]...",
  contactType: "bg-purple-500/20 text-purple-400",
  source: "bg-gray-500/20 text-gray-400",
  channel: "bg-indigo-500/20 text-indigo-400",
};
```

**Gap**: V2 missing domain-specific variants (HMICFRS, Admiralty, IR35). Port as needed.

---

### 6. Contact Confidence Display

**V1 Contact Card**:
```tsx
// V1 has confidence dot with semantic colors
const confidenceColors = {
  high: 'bg-[hsl(var(--color-success))]',    // Green
  medium: 'bg-[hsl(var(--color-action))]',   // Blue
  low: 'bg-[hsl(var(--color-warning))]',     // Orange
  none: 'bg-[hsl(var(--color-danger))]',     // Red
};

// V1 has tooltip explanation
<ConfidenceLabel confidence={confidence}>
  <TooltipContent>{getConfidenceExplanation(confidence)}</TooltipContent>
</ConfidenceLabel>
```

**V2 Contact Section**:
```tsx
// V2 has progress bar
<div className="w-16 h-1.5 bg-surface-2 rounded-full overflow-hidden">
  <div
    className="h-full bg-action rounded-full"
    style={{ width: `${confidence}%` }}
  />
</div>
```

**Gap**: V2 has visual but missing semantic colors and tooltip explanations.

---

### 7. Session Store / State Management

**V1 Session Store**:
```typescript
// V1 persists to localStorage
export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      // Energy level for morning brief
      energyLevel: null as EnergyLevel | null,

      // All-time counter (persisted)
      allTimeProcessed: 0,

      // Undo with expiry
      undoStack: [] as UndoAction[],

      // Morning brief state
      morningBriefCompleted: false,
    }),
    { name: 'mi-session-store' }
  )
);
```

**V2 Review Store**:
```typescript
// V2 no persistence (session-only)
export const useReviewStore = create<ReviewState>((set, get) => ({
  // Filter state
  filter: 'ready' as FilterType,

  // Session stats (not persisted)
  stats: { processed: 0, total: 0, startTime: 0, actionTimes: [] },

  // Undo stack
  undoStack: [] as UndoAction[],
}));
```

**Gap**: V2 missing persistence. Consider adding for all-time stats.

---

### 8. Focus Mode Dimming

**V1 Global Styles**:
```css
/* V1 has focus mode dimming for reduced distraction */
.focus-mode-active [data-dimmable]:not([data-focused]) {
  opacity: 0.4;
  filter: grayscale(0.3);
  pointer-events: none;
}

.focus-mode-active [data-focused] {
  position: relative;
  z-index: 10;
}
```

**V2**: Not present.

**Gap**: Nice-to-have for ADHD focus. Consider porting.

---

## What's Already Good in V2

V2 has several improvements over V1:

1. **P1/P2/P3 Priority Tiers** — Cleaner than hot/high/medium/low
2. **Context Capsule Component** — Well-structured context display
3. **Signal Pattern Cards** — Visual signal categorization
4. **Contact Confidence Bar** — Simple visual indicator
5. **Cleaner File Structure** — Easier to navigate
6. **Simplified Store** — Less complexity to maintain

---

## Refinement Recommendations

### Priority 1: Copy Directly (Low Effort)

| Item | V1 Source | V2 Target | Notes |
|------|-----------|-----------|-------|
| Animation tokens | `styles/tokens.css` | `styles/tokens.css` | Add duration/easing vars |
| Density modes | `styles/tokens.css` | `styles/tokens.css` | Add compact/comfortable modes |
| Focus dimming CSS | `app/globals.css` | `app/globals.css` | Add focus mode classes |

### Priority 2: Adapt (Medium Effort)

| Item | V1 Source | V2 Target | Notes |
|------|-----------|-----------|-------|
| Badge variants | `components/ui/badge.tsx` | `components/mi-badge.tsx` | Port HMICFRS, Admiralty as needed |
| Contact confidence dots | `contact-card.tsx` | `now-card.tsx` ContactSection | Add semantic color dots |
| Confidence tooltips | `contact-card.tsx` | `now-card.tsx` | Add tooltip explanations |

### Priority 3: Future Enhancement (Higher Effort)

| Item | V1 Source | Notes |
|------|-----------|-------|
| Dual-track scores | `dual-track-scores.tsx` | Requires SPEC-007a schema fields |
| Score breakdown | `score-breakdown.tsx` | Requires SPEC-007a schema fields |
| Channel selection | `action-panel.tsx` | Consider for Phase 2 |
| Outcome tracking | `action-panel.tsx` | Consider for Phase 2 |
| Session persistence | `session-store.ts` | Consider for SPEC-008 |
| Energy level tracking | `session-store.ts` | Consider for SPEC-008 |
| Queue mode selection | `queue-panel.tsx` | Consider for Phase 2 |

---

## File-by-File Change Estimates

| V2 File | Changes Needed | Complexity | Time Est. |
|---------|---------------|------------|-----------|
| `styles/tokens.css` | Add animation tokens, density modes | Low | 30 min |
| `app/globals.css` | Add focus dimming classes | Low | 15 min |
| `components/mi-badge.tsx` | Port 5-10 V1 variants | Medium | 1 hour |
| `components/review/now-card.tsx` | Add confidence dots, tooltips | Medium | 45 min |
| `components/review/session-header.tsx` | Add all-time stats display | Medium | 30 min |
| `lib/stores/review-store.ts` | Add persist middleware | Medium | 30 min |
| **Total for Priority 1+2** | | | **~3.5 hours** |

---

## Appendix: V1 Component Inventory

### Focus Mode Components
- `queue-panel.tsx` — 6 queue modes, track badges, keyboard hints
- `now-card.tsx` — Full context display, scoring, signals
- `action-panel.tsx` — Draft display, channels, outcomes, dismiss
- `contact-card.tsx` — Confidence indicators, tooltips
- `session-header.tsx` — Progress, all-time stats, quick capture
- `dual-track-scores.tsx` — MS vs AG comparison bars
- `score-breakdown.tsx` — Ghost bar pattern, progressive disclosure

### UI Components
- `badge.tsx` — 30+ semantic variants
- Standard shadcn components (button, card, dialog, etc.)

### Stores
- `session-store.ts` — Persisted session state, energy, undo

---

## Appendix: V2 Component Inventory

### Review Components
- `queue-panel.tsx` — 3 filter tabs, priority sorting
- `now-card.tsx` — Context capsule, signal cards, contact section
- `composer-dock.tsx` — Editable draft, send/skip/dismiss
- `session-header.tsx` — Progress bar, average time
- `dismiss-modal.tsx` — Reason selection

### UI Components
- `mi-badge.tsx` — ~10 variants including P1/P2/P3

### Stores
- `review-store.ts` — Filter, stats, undo (no persist)

---

*This document is for planning purposes. No code changes have been made.*
