# SPEC-008: Morning Brief — Daily Kickoff Ritual

**Status**: Future Phase (deferred)  
**Phase**: Post-Phase 1c (after dashboard MVP validated)  
**Created**: 2025-01-19  
**Updated**: 2025-01-19  
**Depends on**: SPEC-009 (Dashboard V1 Migration) — must be working first  
**Prerequisites**: Overnight signal tracking, follow-up dates, scoring for energy-based selection  
**Source**: V1 Dashboard codebase (`/Users/jamesjeram/Documents/MI-Platform/dashboard-react/components/rituals`)  
**Decision**: A8 (Three-Zone Dashboard Layout + Morning Brief)  
**Skills**: `adhd-interface-design`, `notification-system`

---

## Why This Is Deferred

The Morning Brief requires data infrastructure that doesn't exist in Phase 1:

1. **Overnight signal detection** — Comparing `detected_at` to last session requires session persistence
2. **Follow-ups due** — Needs `next_follow_up_date` field on Opportunities
3. **Snooze functionality** — Needs `snoozed_until` field on Opportunities
4. **Energy-based selection** — Needs scoring model to select appropriate opportunities
5. **Session completion tracking** — Needs persistent session storage

**Prerequisites before implementing this spec:**

1. **SPEC-009 complete** — Dashboard V1 migration working and used for real Monday reviews
2. **Schema additions** — Add to Opportunities:
   - `next_follow_up_date` (Date)
   - `snoozed_until` (DateTime)
   - `last_session_id` (Text) — for overnight detection
3. **Session table** (optional) — Or use localStorage with sync
4. **Sufficient signal volume** — Morning Brief needs overnight activity to be meaningful
5. **Scoring model** — At minimum, for energy-based selection

**When to implement**: After 4+ weeks of using MVP dashboard, when morning ritual becomes valuable

---

## Overview

Implement the Morning Brief ritual — a structured 2-minute kickoff that prepares James for focused work by checking energy levels, showing overnight activity, and locking in the day's top 3 priorities.

**Why this matters**: Starting the day by scrolling through 20 opportunities creates decision fatigue before any real work happens. The Morning Brief acts as an ADHD-friendly gate that:
- Acknowledges current energy/capacity
- Surfaces what changed overnight
- Commits to a focused subset (Rule of Three)
- Creates psychological closure: "I've decided what to do today"

**Success Criteria**:
- Complete Morning Brief in ≤2 minutes
- Feel prepared, not overwhelmed
- Know exactly what 3 things to tackle first

---

## Design System Alignment

This spec implements patterns from the following skills (see Decision A8):

| Skill | Pattern Implemented |
|-------|--------------------|
| `adhd-interface-design` | Morning Flow Protocol (Energy Check → Review → Selection → Commitment), Energy-Based Task Management, Rule of Three, Executive Function Externalisation |
| `notification-system` | Three-Batch Model (Morning Brief as first batch), Overnight Summary, Priority Classification, Batched Delivery |

The ADHD Interface Design skill explicitly defines the Morning Flow Protocol:
> 1. Energy check: "How is your energy today?"
> 2. Review: Yesterday's unfinished items
> 3. Selection: AI-recommended priorities based on energy + deadlines
> 4. Commitment: Lock in plan, enter Focus Mode

This spec implements that protocol exactly.

---

## User Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                          ☀️  Good morning, James                            │
│                                                                             │
│                      Let's set up your day in 2 minutes                     │
│                                                                             │
│                        ●───────○───────○───────○                            │
│                      Energy  Overnight  Top 3   Go!                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

Step 1: Energy Check
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                    How's your energy today?                                 │
│                    This helps prioritise your leads                         │
│                                                                             │
│     ┌──────────┐      ┌──────────┐      ┌──────────┐                       │
│     │    🔋    │      │    ⚡    │      │    🚀    │                       │
│     │          │      │          │      │          │                       │
│     │   LOW    │      │  MEDIUM  │      │   HIGH   │                       │
│     │          │      │          │      │          │                       │
│     │ Quick    │      │ Standard │      │ Power    │                       │
│     │ wins     │      │ workload │      │ mode     │                       │
│     └──────────┘      └──────────┘      └──────────┘                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

Step 2: Overnight Summary
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                    While you were away...                                   │
│                                                                             │
│     ⚠️  Priority Alerts (2)                                                │
│     ├── Kent Police              [PRIORITY]                    →           │
│     └── West Midlands            [PRIORITY]                    →           │
│                                                                             │
│     📈 New Signals Detected (5)                                            │
│     ├── Hiring surge at BTP                         +15 pts                │
│     ├── New tender at Thames Valley                 +12 pts                │
│     └── +3 more signals                                                    │
│                                                                             │
│     ⏰ Follow-ups Due (3)                                                  │
│     ├── North Wales Police                          Due today              │
│     └── +2 more                                                            │
│                                                                             │
│                                              [Continue →]                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

Step 3: Rule of Three
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                    Your Top 3 Priorities                                    │
│           AI-recommended based on energy, deadlines, signals                │
│                                                                             │
│     ┌─────────────────────────────────────────────────────────────┐        │
│     │  1   Kent Police                    [TERRITORIAL] [PRIORITY]│        │
│     │      🔥 Hiring surge: +15 pts                               │        │
│     │      "Budget flush opportunity before Q4 end"        [Swap] │        │
│     └─────────────────────────────────────────────────────────────┘        │
│                                                                             │
│     ┌─────────────────────────────────────────────────────────────┐        │
│     │  2   North Wales Police             [TERRITORIAL] [HIGH]    │        │
│     │      ⏰ Follow-up due today                                 │        │
│     │      "Initial outreach sent 5 days ago"              [Swap] │        │
│     └─────────────────────────────────────────────────────────────┘        │
│                                                                             │
│     ┌─────────────────────────────────────────────────────────────┐        │
│     │  3   Thames Valley                  [TERRITORIAL] [MEDIUM]  │        │
│     │      📄 New tender detected                                 │        │
│     │      "Framework agreement expires March"             [Swap] │        │
│     └─────────────────────────────────────────────────────────────┘        │
│                                                                             │
│                         [✓ Lock In & Start Day]                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

Step 4: Go!
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                         ✓ You're all set!                                  │
│                                                                             │
│                    Focus on your 3 priorities today.                        │
│                    Everything else can wait.                                │
│                                                                             │
│                         [Start Focus Mode →]                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Architecture

### Page Structure

```
/morning → Morning Brief page (4-step wizard)
  ├── Step 1: EnergyCheck component
  ├── Step 2: OvernightSummary component
  ├── Step 3: RuleOfThree component
  └── Step 4: Confirmation + redirect to Focus Mode
```

### State Flow

```typescript
interface MorningBriefState {
  currentStep: 1 | 2 | 3 | 4;
  energyLevel: "low" | "medium" | "high" | null;
  todaysLeadIds: string[];  // The locked-in 3
  completedAt: string | null;
}
```

### Session Store Integration

Morning Brief writes to session store:
- `energyLevel` — affects lead prioritisation
- `todaysLeadIds` — the Rule of Three selection
- `morningBriefCompleted` — flag for redirect logic
- `morningBriefCompletedAt` — timestamp

---

## Components

### 1. EnergyCheck

**Purpose**: Acknowledge current energy level to adjust workload

**Props**:
```typescript
interface EnergyCheckProps {
  selectedLevel: "low" | "medium" | "high" | null;
  onSelect: (level: "low" | "medium" | "high") => void;
}
```

**Energy Levels**:

| Level | Icon | Label | Description | Effect |
|-------|------|-------|-------------|--------|
| Low | 🔋 | LOW | Quick wins only — 2-3 easy tasks | Shows lower-effort opportunities |
| Medium | ⚡ | MEDIUM | Standard workload — 5-6 balanced tasks | Normal prioritisation |
| High | 🚀 | HIGH | Power mode — tackle the tough ones | Surfaces complex/high-value opportunities |

**Behaviour**:
- Large touch targets (min 160px wide)
- Visual feedback on selection (scale, border, background)
- Advances to next step on selection

**Source file**: `components/rituals/energy-check.tsx`

---

### 2. OvernightSummary

**Purpose**: Show what changed while user was away

**Props**:
```typescript
interface OvernightSummaryProps {
  newSignals: Signal[];
  followUpsDue: Opportunity[];
  snoozeReminders: Opportunity[];
  priorityAlerts: Opportunity[];
}
```

**Sections** (in priority order):

| Section | Icon | Variant | Shows |
|---------|------|---------|-------|
| Priority Alerts | ⚠️ | danger | New priority-level opportunities |
| New Signals | 📈 | success | Signals detected overnight with points |
| Follow-ups Due | ⏰ | warning | Opportunities with follow-up due today |
| Snooze Reminders | 🔔 | info | Snoozed items that have woken up |

**Behaviour**:
- Shows max 3 items per section, "+N more" for overflow
- Each item clickable to preview
- "No new activity" state if all sections empty
- Continue button advances to next step

**Source file**: `components/rituals/overnight-summary.tsx`

---

### 3. RuleOfThree

**Purpose**: Lock in top 3 priorities for the day

**Props**:
```typescript
interface RuleOfThreeProps {
  recommendedLeads: Opportunity[];  // AI-selected top 3
  allLeads: Opportunity[];          // Full list for swapping
  onAccept: (leadIds: string[]) => void;
  onSwap: (index: number, newLeadId: string) => void;
}
```

**AI Selection Logic**:

The top 3 are selected based on:
1. Energy level (low → quick wins, high → complex opportunities)
2. Time pressure (follow-ups due today ranked higher)
3. Signal strength (recent signals boost score)
4. Primary score (tiebreaker)

**Swap Functionality**:
- Each slot has "Swap" button
- Opens dropdown with next 5 candidates
- Shows score and reason for each alternative
- Cancel returns to original selection

**Card Display**:
- Priority number (1, 2, 3) in action-coloured circle
- Organisation name + badges
- Primary signal with points
- AI rationale (1 sentence)

**Behaviour**:
- "Lock In & Start Day" commits selection
- Writes to session store
- Advances to confirmation

**Source file**: `components/rituals/rule-of-three.tsx`

---

### 4. MorningBriefPage

**Purpose**: Orchestrates the 4-step wizard

**State Management**:
```typescript
const [step, setStep] = useState(1);
const [energyLevel, setEnergyLevel] = useState<EnergyLevel | null>(null);
const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
```

**Step Progression**:
1. Energy Check → auto-advance on selection
2. Overnight Summary → advance on "Continue"
3. Rule of Three → advance on "Lock In"
4. Confirmation → redirect to Focus Mode

**Progress Indicator**:
- 4 dots showing current step
- Labels: Energy → Overnight → Top 3 → Go!
- Completed steps filled, current step highlighted

**Source file**: `app/morning/page.tsx`

---

## Data Requirements

### API: Get Morning Brief Data

**Endpoint**: `GET /api/morning-brief`

**Response**:
```typescript
interface MorningBriefData {
  newSignals: Signal[];           // Signals created since last session
  followUpsDue: Opportunity[];    // Follow-up due today
  snoozeReminders: Opportunity[]; // Snooze ended
  priorityAlerts: Opportunity[];  // New priority-level opportunities
  recommendedLeads: Opportunity[]; // AI-selected top 3 (based on energy)
  allLeads: Opportunity[];        // Full active list for swapping
}
```

**Query params**:
- `energy`: "low" | "medium" | "high" — affects `recommendedLeads` selection

### API: Complete Morning Brief

**Endpoint**: `POST /api/morning-brief/complete`

**Body**:
```typescript
{
  energyLevel: "low" | "medium" | "high";
  selectedLeadIds: string[];  // The Rule of Three
}
```

**Effect**:
- Records completion timestamp
- Stores energy level for session
- Locks in today's leads
- Returns redirect URL to Focus Mode

---

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `1` / `2` / `3` | Select energy level (Step 1) |
| `Enter` | Continue to next step |
| `Escape` | Go back to previous step |
| `Tab` | Navigate between swap buttons (Step 3) |

---

## File Structure

```
src/
├── app/
│   └── morning/
│       └── page.tsx            # Morning Brief wizard
├── components/
│   └── rituals/
│       ├── index.ts            # Exports
│       ├── energy-check.tsx    # Step 1
│       ├── overnight-summary.tsx # Step 2
│       ├── rule-of-three.tsx   # Step 3
│       └── progress-dots.tsx   # Step indicator
```

---

## V1 Source Files Reference

| V1 File | V2 Destination | Notes |
|---------|----------------|-------|
| `components/rituals/energy-check.tsx` | `src/components/rituals/` | Keep as-is |
| `components/rituals/overnight-summary.tsx` | `src/components/rituals/` | Adapt to Opportunity type |
| `components/rituals/rule-of-three.tsx` | `src/components/rituals/` | Adapt to Opportunity type |
| `app/morning/page.tsx` | `src/app/morning/page.tsx` | Adapt to V2 API |

---

## Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | Energy check shows 3 options | Low/Medium/High with icons and descriptions |
| 2 | Selection advances automatically | No explicit "Next" button needed |
| 3 | Overnight summary shows 4 sections | Priority alerts, signals, follow-ups, snooze |
| 4 | Empty state shows gracefully | "No new activity while you were away" |
| 5 | Rule of Three shows AI picks | 3 cards with rationale |
| 6 | Swap functionality works | Can replace any of the 3 with alternatives |
| 7 | Lock In commits selection | Writes to session store |
| 8 | Redirect to Focus Mode | After completion |
| 9 | Progress dots show state | Current step highlighted |
| 10 | Complete in ≤2 minutes | Timed user test |

---

## Testing Plan

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 1 | Open /morning | Energy check shown, step 1 of 4 |
| 2 | Click "Low" energy | Advances to overnight summary |
| 3 | No overnight activity | "No new activity" message shown |
| 4 | 5 new signals overnight | Shows 3 + "+2 more" |
| 5 | Click Continue | Advances to Rule of Three |
| 6 | Low energy selected | Recommended leads are lower-effort |
| 7 | Click Swap on lead 2 | Dropdown shows 5 alternatives |
| 8 | Select alternative | Lead 2 replaced, dropdown closes |
| 9 | Click Lock In | Session store updated, redirect to / |
| 10 | Return to /morning same day | Already completed, redirect to / |
| 11 | Press 1/2/3 on step 1 | Selects corresponding energy level |
| 12 | Press Escape on step 2 | Returns to step 1 |

---

## Build Sequence

1. **Create page shell** — `/morning` route with step state
2. **Port EnergyCheck** — adapt styling to V2 tokens
3. **Port OvernightSummary** — adapt to Opportunity type
4. **Port RuleOfThree** — adapt to Opportunity type, connect swap logic
5. **Create progress dots** — step indicator component
6. **Wire session store** — connect to useSessionStore
7. **Create API endpoint** — `/api/morning-brief`
8. **Add completion logic** — POST endpoint + redirect
9. **Add keyboard navigation** — 1/2/3, Enter, Escape
10. **Integration test** — full flow

---

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| SPEC-009 (Dashboard V1 Migration) | Required | Design tokens, badges, buttons, API patterns |
| Session Store | Required | To be added as enhancement |

---

## Out of Scope

- End of Day ritual — future spec
- Brain Dump capture — future spec
- Done List review — future spec
- Skip Morning Brief option — consider for future
- Mobile optimisation — future

---

## Integration with Focus Mode

When Morning Brief is completed:

1. Focus Mode shows **only the Rule of Three** by default
2. Queue filter defaults to "Today's 3" 
3. Progress header shows "Today: 0 of 3" (not full queue)
4. User can switch to "All" queue to see everything
5. Completing all 3 shows celebration state

This creates a "closed world" for the day — you've decided what matters, now execute.

---

## Guardrails Applied

- **G-012**: UI must support keyboard-only operation
- **G-014**: Single-focus display (one step at a time)
- **G-015**: ADHD-friendly: acknowledge energy, limit choices, create closure

---

## Handoff Notes

The V1 ritual components are well-tested and documented. Main adaptation needed:

1. Replace V1's `Lead` type with V2's `Opportunity` type
2. Connect to V2's API patterns (n8n webhooks)
3. Ensure session store integration matches SPEC-009 patterns

The "Rule of Three" pattern is borrowed from productivity methodology and works well for ADHD — it's small enough to remember, large enough to feel accomplished.
