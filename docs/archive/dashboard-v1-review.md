# Dashboard V1 Review

**Purpose**: Capture learnings from `mi-platform/dashboard-react` for V2 rebuild
**Reviewed**: 16 January 2025
**Source**: `/Users/jamesjeram/Documents/mi-platform/dashboard-react`

---

> ✅ **Decision A8 (19 Jan 2025)**: V1's three-zone layout is now the canonical design for V2. The strategy document Section 11 will be updated to match this review's patterns. The problem with V1 was backend complexity, not UI design — V2's simplified backend solves the actual issue.
>
> This document now serves as the **authoritative reference** for V2 dashboard implementation. Strategy updates have been integrated into `docs/STRATEGY.md`.

---

## Tech Stack

| Technology | Version | Notes |
|------------|---------|-------|
| Next.js | 16.1.0 | App Router, bleeding edge |
| React | 19.2.3 | Latest stable |
| TypeScript | 5.x | Strict mode |
| Tailwind CSS | v4 | CSS variable theming |
| shadcn/ui | v1 | Component library |
| Zustand | v5 | State management |
| SWR | v2.3.8 | **Installed but NOT used** |

**Deployment**: Self-hosted Docker + Traefik on VPS (not Vercel)

---

## Component Inventory (82 total)

### Focus Mode (Queue View)
| Component | Purpose | Status |
|-----------|---------|--------|
| QueuePanel | Left zone - opportunity queue | Complete |
| NowCard | Center zone - current focus | Complete |
| ActionPanel | Right zone - quick actions | Complete |

### Board View Tabs
| Component | Purpose | Status |
|-----------|---------|--------|
| PipelineTab | Kanban-style opportunity board | Complete |
| PipelineScorecard | Pipeline metrics summary | Complete |
| SignalFeed | Raw signal stream | Complete |
| StrategicSignalsTab | Classified strategic signals | Complete |
| EmailActionsTab | Email action queue | Complete |
| CompetitiveIntelTab | Competitor monitoring | Complete |
| MarketLandscapeTab | Market overview | Complete |
| UKForceMap | Geographic force visualization | Complete |

### Forces
| Component | Purpose | Status |
|-----------|---------|--------|
| ForcePriorityList | Ranked force list | Complete |
| ForceDetailCard | Force detail view | Complete |

### Rituals (ADHD Support)
| Component | Purpose | Status |
|-----------|---------|--------|
| EnergyCheck | Morning energy assessment | Complete |
| RuleOfThree | Focus constraint (3 items max) | Complete |
| BrainDump | Quick capture for stray thoughts | Complete |

---

## Data Patterns

### API Architecture
- Direct Airtable API via Next.js API routes (`/api/airtable/*`)
- No SDK - raw `fetch()` calls with manual error handling
- Server-side ISR caching at 60 seconds

### State Management
- **Zustand** for client state (works well)
- **SWR installed but abandoned** - all fetching is manual `fetch()` + `useEffect`
- Manual 30-60 second rate limiting (imperfect)

### Critical Gaps
1. **No cache invalidation** - mutations don't trigger refetch
2. **No pagination** on email actions endpoint
3. **Webhook race conditions** - tries n8n webhook, falls back to direct Airtable
4. **Inefficient signal batching** - OR queries per opportunity instead of batch

---

## UI Patterns Worth Keeping

### Three-Zone Focus Layout — ✅ CANONICAL DESIGN

The V1 dashboard used a three-column split (Queue/Now/Actions). Per Decision A8, this is now the canonical design for V2.

**V2 will use this layout:**
- Queue Panel (left) — prioritised opportunity list with J/K navigation
- Now Card (centre) — context capsule with What/Why/Next/When/Source
- Composer Dock (right) — draft message and action buttons
- Progress header — session stats for dopamine feedback
- Keyboard navigation — E/S/D/Z for actions

This layout is optimised for the "Monday Morning Experience" — 15 minutes to review and send a week's outreach. The strategy document Section 11 will be updated to match.

### Badge System
30+ semantic badge variants for rapid visual scanning:
- Status badges (new, pending, active, stale)
- Priority badges (hot, warm, cold)
- Source badges (indeed, competitor, tender, news)
- Action badges (call, email, research)

### Undo Buffer
- 30-second expiry on destructive actions
- Toast notification with "Undo" button
- Keeps UI responsive while allowing recovery

### Skeleton Loading
- Consistent skeleton states throughout
- Prevents layout shift during loads

### Dark-First Design
- Comprehensive CSS variable theming
- All colors defined as HSL variables
- Easy to maintain consistency

---

## What Didn't Work

### 1. Abandoned SWR
SWR was installed but never used. All data fetching is manual:
```typescript
// Actual pattern used (brittle)
useEffect(() => {
  fetch('/api/airtable/opportunities')
    .then(res => res.json())
    .then(setData)
}, [])
```
No automatic revalidation, no cache, no mutation handling.

### 2. No Cache Invalidation
After updating an opportunity, the list doesn't refresh. Users must manually reload.

### 3. Webhook Fallback Logic
Complex try/catch that attempts n8n webhook first, falls back to direct Airtable. Race conditions when webhook is slow.

### 4. No Pagination
Email actions endpoint returns all records. Will break at scale.

### 5. Inefficient Queries
Signal batching builds OR queries per opportunity instead of single batch request.

---

## Recommendations for V2

### 1. Use React Query or SWR Properly
The manual fetch/refresh logic was brittle. Pick one and use it:
- Automatic cache invalidation after mutations
- Background revalidation
- Optimistic updates for snappy UI

### 2. Port V1 Three-Zone Layout (Decision A8)
**Port the V1 three-zone layout as the canonical design.** The strategy document Section 11 will be updated to match.

**Layout to implement:**
- Queue Panel (left) — prioritised opportunity list
- Now Card (centre) — context capsule with What/Why/Next/When/Source
- Composer Dock (right) — draft message and actions

**Views to build:**
- Queue (home) — three-zone layout
- Pipeline (Kanban by status)
- Signals (raw feed for debugging)
- Forces (reference with intelligence summary)
- Email (Phase 2a)
- Tenders (Phase 2b)

See SPEC-007a for full implementation details.

### 3. Port the Badge System
The 30+ semantic variants provide rapid visual scanning. Copy these Tailwind classes to V2 design system.

### 4. Keep Zustand
Simple, no boilerplate, works well with Next.js. Don't overcomplicate with Redux.

### 5. Implement Pagination from Day One
Use cursor-based pagination for all Airtable list endpoints. The `offset` token approach Airtable uses works well.

---

## V2 Design: Decision A8 Resolution

| Aspect | V1 Design | V2 Design (Decision A8) |
|--------|-----------|-------------------------|
| Main layout | Three-zone split (Queue/Now/Actions) | ✅ Three-zone split (adopted) |
| Navigation | Tab-based board views | ✅ Tab-based (kept) |
| Opportunity display | Split across zones | ✅ Split across zones (adopted) |
| Primary flow | Review → Tweak → Send → Next | ✅ Same (this was always the goal) |
| Progress tracking | Session header with stats | ✅ Session header (adopted) |
| Keyboard nav | J/K/E/S/D/Z | ✅ Full keyboard support (adopted) |

**V1's layout is now canonical. Strategy document Section 11 will be updated to match.**

---

## Files to Reference

For detailed implementation examples, see:
- `dashboard-react/src/components/focus/` - Queue/Now/Actions panels
- `dashboard-react/src/components/ui/badge.tsx` - Badge variants
- `dashboard-react/src/stores/` - Zustand store patterns
- `dashboard-react/src/app/api/airtable/` - API route patterns (what NOT to do)

---

*This document is for reference only. V2 will be built fresh in MI-Platform-V2.*
