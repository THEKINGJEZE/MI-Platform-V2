# SPEC-007: React Dashboard

**Status**: Replaced by SPEC-007b  
**Phase**: 1c — React Dashboard  
**Dependencies**: Phase 1 complete (burn-in ends 25 Jan)  
**Source of Truth**: `peel-solutions-mi-platform-strategy.md` Section 11 (Dashboard Design), Section 13 (Technology Stack)

---

## 1. Overview

**Goal**: Replace Airtable Interface with custom React dashboard optimized for the Monday morning experience.

**Expected Outcome**: A Next.js application deployed on Vercel that delivers 3-5 ready-to-send leads in ≤15 minutes review time, with proper data fetching, cache invalidation, and ADHD-optimized flow.

**Why Now**: SPEC-006 validated the pipeline with Airtable Interface. React dashboard delivers the full UX vision from strategy Section 11.

---

## 2. Strategy Divergence Check

| Strategy Section | Strategy Says | Spec Does | Status |
|------------------|---------------|-----------|--------|
| Section 11 | Queue view with Hot Leads + Ready to Send | ✅ Implementing as specified | Aligned |
| Section 11 | Tabs: Queue, Pipeline, Signals, Forces, Email, Tenders | Email/Tenders deferred (Phase 2a/2b) | Intentional scope |
| Section 13 | Next.js 14 + Vercel | ✅ Implementing as specified | Aligned |

**Approval**: Phase 1c scope confirmed in DECISIONS.md P1-02.

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         REACT DASHBOARD                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  Next.js 14 (App Router) → Vercel                                       │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ Queue View   │  │ Pipeline View│  │ Signals View │  │ Forces View │ │
│  │ (Home)       │  │ (Kanban)     │  │ (Debug)      │  │ (Reference) │ │
│  └──────┬───────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
│         │                                                                │
│  ┌──────▼───────────────────────────────────────────────────────────┐   │
│  │                    React Query (TanStack Query)                   │   │
│  │    • Automatic cache invalidation after mutations                 │   │
│  │    • Background revalidation                                      │   │
│  │    • Optimistic updates                                           │   │
│  └──────┬───────────────────────────────────────────────────────────┘   │
│         │                                                                │
│  ┌──────▼───────────────────────────────────────────────────────────┐   │
│  │                    API Routes (/app/api/)                         │   │
│  │    • /opportunities — CRUD for opportunities                      │   │
│  │    • /signals — Read-only signal feed                             │   │
│  │    • /forces — Reference data                                     │   │
│  │    • /send — Webhook trigger to n8n (G-002)                       │   │
│  └──────┬───────────────────────────────────────────────────────────┘   │
│         │                                                                │
└─────────┼───────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────┐     ┌─────────────────────┐
│     Airtable        │     │       n8n           │
│  (Data Layer)       │     │  WF6: Send Outreach │
└─────────────────────┘     └─────────────────────┘
```

---

## 4. Views

### 4.1 Queue View (Home) — Primary

Per strategy Section 11. The Monday morning experience.

**Layout**:
```
┌─────────────────────────────────────────────────────────────────┐
│  Good morning, James.                    Monday, 20 January     │
│                                                                  │
│  You have 5 opportunities ready.                                │
│  Estimated time: 12 minutes.                                    │
│                                                                  │
│  🔥 2 Hot Leads (competitor interceptions — act today)          │
│  📬 3 Standard Leads (weekly outreach)                          │
│                                                                  │
│  [Start Review →]                                               │
├─────────────────────────────────────────────────────────────────┤
│  🔥 HOT LEADS                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Hampshire Police              [🔥 Hot] [Email] [2 signals]│   │
│  │ Why: Red Snapper posting for Crime Analyst 2 days ago    │   │
│  │ Contact: Sarah Chen, Head of Resourcing                  │   │
│  │ ┌─────────────────────────────────────────────────────┐ │   │
│  │ │ Draft message (editable)                            │ │   │
│  │ └─────────────────────────────────────────────────────┘ │   │
│  │ [✏️ Edit] [📧 Send Email] [⏭️ Skip]                      │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  📬 READY TO SEND                                               │
│  [Opportunity cards...]                                         │
└─────────────────────────────────────────────────────────────────┘
```

**Data requirements**:
- Filter: `status = "ready" OR priority_tier = "hot"`
- Sort: `priority_tier` (hot first), then `priority_score` DESC
- Include: linked contact, linked force, linked signals

### 4.2 Pipeline View — Secondary

Kanban board for pipeline overview.

**Columns**: Researching → Ready → Sent → Replied → Meeting → Proposal → Won/Lost

**Card display**: Force name, priority badge, days in stage, signal count

### 4.3 Signals View — Debug

Raw signal feed for troubleshooting.

**Columns**: Source, Force, Title, Relevance, Status, Detected At
**Filters**: By source, by status, by date range

### 4.4 Forces View — Reference

Directory of all 48 police forces.

**Display**: Force name, region, size, relationship status, last contact, opportunity count

---

## 5. Components

### 5.1 Opportunity Card

| Element | Source Field | Notes |
|---------|--------------|-------|
| Force name | `force.name` | Large header |
| Badges | `priority_tier`, `outreach_channel`, `signal_count` | Badge system from V1 |
| Why Now | `why_now` (computed from signals) | 2-3 sentences |
| Contact | `contact.name`, `contact.role`, `contact.email` | Linked record |
| Message | `outreach_draft` | Editable textarea |
| Subject | `subject_line` | Editable (email only) |
| Actions | Send, LinkedIn, Skip | Buttons |

### 5.2 Badge System (port from V1)

```typescript
// Status badges
"new" | "ready" | "sent" | "replied" | "meeting"

// Priority badges  
"hot" | "high" | "medium" | "low"

// Source badges
"indeed" | "competitor" | "tender" | "news" | "regulatory"

// Channel badges
"email" | "linkedin"
```

### 5.3 Action Buttons

| Button | Condition | Action |
|--------|-----------|--------|
| 📧 Send Email | `outreach_channel = "email"` | POST `/api/send` → WF6 **(G-002)** |
| 💼 LinkedIn | `outreach_channel = "linkedin"` | Copy message + open URL |
| ⏭️ Skip | Always | PATCH opportunity status → "skipped" |

---

## 6. API Routes

### `/api/opportunities`

- `GET` — List opportunities with filters
- `PATCH /:id` — Update opportunity (status, draft, etc.) **(G-011: upsert)**

### `/api/send`

- `POST` — Trigger WF6 webhook **(G-002, G-008)**

```typescript
// Request
{ opportunity_id: string, action: "send_email" | "send_linkedin" | "skip" }

// Calls n8n webhook with webhookId (G-008)
```

### `/api/signals`

- `GET` — List signals (read-only, for debug view)

### `/api/forces`

- `GET` — List forces (read-only reference)

---

## 7. Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | App Router, API routes |
| React | 18.x | UI framework |
| TypeScript | 5.x | Type safety |
| TanStack Query | 5.x | Data fetching + cache |
| Zustand | 5.x | Client state |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | latest | Component library |

**Deployment**: Vercel (per strategy Section 13)

---

## 8. Guardrails Compliance

| Guardrail | Implementation |
|-----------|----------------|
| G-002: Command Queue for Emails | ✅ Send goes through `/api/send` → n8n WF6, not direct |
| G-008: Always Include webhookId | ✅ API route includes webhookId in webhook call |
| G-011: Upsert Only | ✅ All Airtable mutations use PATCH, no DELETE |

---

## 9. Testing Plan

| Test | Setup | Method | Expected Result |
|------|-------|--------|-----------------|
| Queue shows ready only | Create opps with various statuses | Load Queue view | Only `ready` and `hot` visible |
| Hot leads first | 1 hot + 2 ready opps | Load Queue view | Hot at top |
| Send triggers webhook | Ready opp with email | Click Send | WF6 called, status → sent |
| Cache invalidates | Send an opp | Check list | Opp removed from queue |
| Edit persists | Modify draft | Save + send | Modified text sent |
| Time target | 5 ready opps | Time full review | ≤15 minutes |
| Mobile responsive | Various viewports | Check layout | Usable on tablet/phone |

---

## 10. Acceptance Criteria

From ROADMAP.md Phase 1c:

- [ ] Next.js 14 app deployed on Vercel
- [ ] Queue view with Hot Leads section (top) and Ready to Send section
- [ ] Opportunity cards show: Force, Why Now, Contact, Message, Actions
- [ ] Message editing inline with save
- [ ] Send Email button triggers WF6 webhook
- [ ] LinkedIn button copies message + opens compose URL
- [ ] Skip button with optional reason
- [ ] Pipeline view (Kanban by status)
- [ ] Signals view (raw feed for debugging)
- [ ] Forces view (reference directory)
- [ ] Tabs: Queue, Pipeline, Signals, Forces
- [ ] Dark-first design with badge system (per V1 review)
- [ ] React Query for data fetching (not manual fetch)
- [ ] Full review of 5 opportunities takes ≤15 minutes

---

## 11. Build Sequence

1. **Scaffold Next.js app** — App Router, TypeScript, Tailwind, shadcn/ui
2. **Set up API routes** — Airtable client, basic CRUD
3. **Implement React Query** — Provider, hooks for each endpoint
4. **Build Queue view** — Layout, opportunity cards, actions
5. **Build Pipeline view** — Kanban columns, drag (optional)
6. **Build Signals view** — Table with filters
7. **Build Forces view** — Directory list
8. **Add badge system** — Port V1 badge variants
9. **Implement send flow** — Webhook integration with WF6
10. **Dark theme** — CSS variables, shadcn theme
11. **Deploy to Vercel** — Environment variables, domain
12. **Validate timing** — 5-opp test must complete in ≤15 min

---

## 12. V1 Patterns to Port

**Keep** (from `docs/archive/dashboard-v1-review.md`):
- Badge system (30+ variants)
- Zustand for client state
- Dark-first CSS variable theming
- Skeleton loading states
- Undo buffer (30-second expiry)

**Fix**:
- Use React Query properly (V1 abandoned SWR)
- Implement cache invalidation after mutations
- Add cursor-based pagination from day one
- Single webhook path (no fallback complexity)

---

## 13. Out of Scope (Later Phases)

- Email tab (Phase 2a)
- Tenders tab (Phase 2b)
- Competitor Activity tab (Phase 1b)
- Analytics/metrics display
- Batch actions (send multiple)
- A/B testing of messages

---

## 14. Files to Create

```
/dashboard
  /app
    /page.tsx              # Queue view (home)
    /pipeline/page.tsx     # Pipeline kanban
    /signals/page.tsx      # Signal feed
    /forces/page.tsx       # Forces directory
    /api
      /opportunities/route.ts
      /signals/route.ts
      /forces/route.ts
      /send/route.ts
  /components
    /opportunity-card.tsx
    /badge.tsx
    /message-editor.tsx
    /action-buttons.tsx
  /lib
    /airtable.ts           # Airtable client
    /queries.ts            # React Query hooks
  /stores
    /ui-store.ts           # Zustand
```

---

*Spec under 200 lines ✓*
