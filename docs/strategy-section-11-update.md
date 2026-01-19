# Strategy Document Section 11 — Proposed Update

**Purpose**: Replace the theoretical "vertical scroll" design in Section 11 with the tested Three-Zone Model from V1.  
**Decision Reference**: A8 (Three-Zone Dashboard Layout + Morning Brief)  
**Date**: 19 January 2025

---

## Instructions

Replace the existing Section 11 in `peel-solutions-mi-platform-strategy.md` with the content below. This aligns the strategy document with:
- The tested V1 dashboard patterns
- The codified skills (`action-oriented-ux`, `adhd-interface-design`, `uk-police-design-system`)
- Decision A8

---

# 11. Dashboard Design

## Design Philosophy

The dashboard follows the **"Technical Luxury"** aesthetic — precision engineering meets high-end elegance. Every pixel earns its place. Speed is a feature.

**Core Principles** (from `uk-police-design-system` skill):
- Dark mode primary — reduces eye strain, professional aesthetic
- Semantic colour only — Status, Priority, Interaction; else neutral
- Keyboard first — every action accessible without mouse
- ADHD optimised — single focus, progress feedback, undo safety net

## Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PEEL SOLUTIONS                                    [Settings] [Profile]     │
│  Market Intelligence Platform                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [Queue]  [Pipeline]  [Signals]  [Forces]  [Email]  [Tenders]              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## View 1: Queue (Home) — The Three-Zone Model

The primary view. What you see Monday morning. Implements the **Three-Zone Model** from the `action-oriented-ux` skill.

### Layout

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
```

### The Three Zones

| Zone | Width | Purpose | Key Features |
|------|-------|---------|--------------|
| **Queue Panel** | 280px fixed | Prioritised opportunity list | Filter tabs, priority indicators, signal badges, J/K navigation |
| **Now Card** | Flexible | Current opportunity context | Context Capsule (What/Why/Next/When/Source), score breakdown, contact card |
| **Composer Dock** | 320px fixed | Action workspace | Draft message, Send/Skip/Dismiss buttons, keyboard hints |

### Why Three Zones Beat Vertical Scroll

The original Section 11 specified a vertical scroll with expandable cards. V1 testing revealed:

| Vertical Scroll | Three-Zone Model |
|-----------------|------------------|
| Context lost when scrolling | Context always visible |
| No progress feedback | Progress bar shows completion |
| Keyboard nav awkward | J/K moves through queue naturally |
| Message editing requires expansion | Message always visible in dock |
| No visual isolation | Active opportunity centred, rest dimmed |

The Three-Zone Model enables the **2-Minute Lead Loop** (from `action-oriented-ux`):
- 0:00-0:05 — System highlights next lead (auto-selected)
- 0:05-0:30 — User scans "Why now" in Context Capsule
- 0:30-1:30 — User reviews/edits draft in Composer Dock
- 1:30-2:00 — Send and auto-advance to next

### Context Capsule Pattern

Every opportunity displays the **Context Capsule** (from `adhd-interface-design`):

| Field | Icon | Content |
|-------|------|---------|
| **Why** | 💡 | AI-generated context summary — why this matters now |
| **Next** | → | Recommended channel + action |
| **When** | ⏱️ | Timing indicator (urgent, this week, anytime) |
| **Source** | 🏢 | Signal count + types (job posting, tender, etc.) |

This replaces working memory — users don't need to remember context from previous screens.

### Progress Feedback

The session header provides **dopamine feedback** (from `adhd-interface-design`):

```
Today: 3 of 12 ████░░░░░░ 25% • Avg: 1:42
```

- Progress bar colour shifts: <50% muted → 50-75% warning → 75-99% action → 100% success
- Average time per lead encourages efficiency
- Creates momentum and completion satisfaction

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `J` / `K` | Move down/up in queue |
| `E` | Send email |
| `S` | Skip (move to next) |
| `D` | Dismiss (opens reason modal) |
| `Z` | Undo last action (30s window) |
| `?` | Show keyboard shortcuts |

### Undo Safety Net

Every action is reversible for 30 seconds (from `adhd-interface-design`):

```
┌─────────────────────────┐
│  ✓ Actioned: Kent Police │  ← Toast with
│  Press Z to undo (28s)   │    countdown bar
│  ████████████░░░░░░░░░░  │
└─────────────────────────┘
```

This enables fast, confident decisions — mistakes are recoverable.

## Entry Point: Morning Brief (Optional)

Before entering the Queue, users can complete the **Morning Brief** — a 2-minute ritual from `adhd-interface-design`:

1. **Energy Check** — "How's your energy today?" [LOW] [MEDIUM] [HIGH]
2. **Overnight Summary** — What changed while you were away
3. **Rule of Three** — Lock in top 3 priorities for the day
4. **Go** — Enter Focus Mode with a closed-world set of tasks

The Morning Brief is optional but recommended for ADHD users. It creates psychological closure ("I've decided what to do today") and prevents the overwhelm of opening to 20 items.

See SPEC-008 for full specification.

## View 2: Pipeline

Kanban-style board showing opportunities by status.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  RESEARCHING    │    READY       │     SENT      │   RESPONDED   │  WON    │
│                 │                │               │               │         │
│  ┌──────────┐  │  ┌──────────┐  │  ┌─────────┐ │  ┌─────────┐  │         │
│  │ Durham   │  │  │Hampshire │  │  │ Met     │ │  │ Essex   │  │         │
│  │ needs    │  │  │ 🔥 Hot   │  │  │ 5d ago  │ │  │ meeting │  │         │
│  │ contact  │  │  │          │  │  │         │ │  │ Friday  │  │         │
│  └──────────┘  │  └──────────┘  │  └─────────┘ │  └─────────┘  │         │
│                 │                │               │               │         │
└─────────────────────────────────────────────────────────────────────────────┘
```

- Click card → Opens opportunity detail modal
- Drag card → Changes status (with confirmation for key transitions)

## View 3: Signals

Raw intelligence feed for reference/debugging. Shows all signals with:
- Source badge (Indeed, competitor, tender, news)
- Force attribution
- Relevance score
- Linked opportunity (if any)

## View 4: Forces

Reference view showing all 43 police forces with:
- Relationship status
- Recent signals
- Active opportunities
- Contract history (Phase 3)

## View 5: Email (Phase 2a)

Email queue showing:
- Needs Response — emails requiring reply
- Snoozed — deferred emails with wake date
- Sent — outreach awaiting response

## View 6: Tenders (Phase 2b)

Tender tracking showing:
- Active opportunities — tenders we're pursuing
- Upcoming deadlines — submission dates
- Awards — won/lost tracking

---

## Design Tokens

All visual values defined in `styles/tokens.css` (from `uk-police-design-system`):

### Colours

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-canvas` | hsl(220, 20%, 7%) | Page background |
| `--bg-surface-0` | hsl(220, 18%, 11%) | Cards, panels |
| `--bg-surface-1` | hsl(220, 16%, 15%) | Elevated surfaces |
| `--text-primary` | hsl(220, 10%, 93%) | Headlines |
| `--text-secondary` | hsl(220, 10%, 70%) | Body text |
| `--color-action` | hsl(217, 91%, 60%) | Primary buttons |
| `--color-success` | hsl(160, 84%, 39%) | Positive states |
| `--color-warning` | hsl(38, 92%, 50%) | Attention needed |
| `--color-danger` | hsl(0, 100%, 71%) | Priority, errors |

### Typography

| Token | Size | Usage |
|-------|------|-------|
| `--type-body` | 16px | Default text |
| `--type-body-sm` | 14px | Secondary text |
| `--type-caption` | 12px | Labels |
| `--type-metric-lg` | 40px | Hero scores |

Font: Inter for UI, IBM Plex Mono for data/metrics.

### Spacing

4px base grid: `--space-1` (4px) through `--space-8` (48px).

---

## Badge System

Semantic badges for rapid visual scanning (from `uk-police-design-system`):

| Variant | Background | Usage |
|---------|------------|-------|
| `priority` | danger-muted | High priority items |
| `ready` | success-muted | Ready to send |
| `sent` | action-muted | Already actioned |
| `job_signal` | success-muted | Hiring activity |
| `competitor` | warning-muted | Competitor interception |

---

## Accessibility

- WCAG 2.1 AA minimum (4.5:1 contrast)
- Focus states visible on all interactive elements
- Touch targets minimum 44×44px
- Respects `prefers-reduced-motion`
- Keyboard-only operation fully supported

---

## Skills Reference

This section implements patterns from:
- `action-oriented-ux` — Three-Zone Model, 2-Minute Lead Loop, Review-First Composition
- `adhd-interface-design` — Context Capsule, Morning Flow Protocol, Undo Safety Net
- `uk-police-design-system` — Design Tokens, Badge System, Technical Luxury aesthetic
- `b2b-visualisation` — 2-Second Comprehension Rule, Score Explainability
- `notification-system` — Morning Brief as first batch of Three-Batch Model
