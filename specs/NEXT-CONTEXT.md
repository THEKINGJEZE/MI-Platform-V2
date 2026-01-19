# Context Brief: React Dashboard (Phase 1c)

Generated: 19 January 2025
For: Claude Chat spec drafting

---

## Current State

**Phase**: 1 — Core Jobs Pipeline (99% COMPLETE)
**Goal**: Production burn-in monitoring
**Blockers**: None — waiting on burn-in to complete (ends 25 Jan)

---

## Acceptance Criteria (from ROADMAP.md)

Phase 1c: React Dashboard

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
- [ ] React Query or SWR for data fetching (not manual fetch)
- [ ] Full review of 5 opportunities takes ≤15 minutes

**Dependencies**: Phase 1 complete (burn-in ends 25 Jan)

---

## Existing Assets

### Patterns (reuse these, don't recreate)
- `patterns/force-matching.js` — UK police force name fuzzy matching (47 patterns)
- `patterns/indeed-keywords.json` — Indeed search keywords configuration
- `patterns/job-portal-filters.js` — URL regex to filter job portal false positives

### Prompts (can extend or reference)
- `prompts/job-classification.md` — Claude prompt for classifying job signals
- `prompts/email-triage.md` — Claude prompt for email classification
- `prompts/opportunity-enrichment.md` — Claude prompt for enriching opportunities

### Reference Data (source of truth)
- `reference-data/uk-police-forces.json` — 48 UK police forces with metadata
- `reference-data/competitors.json` — 7 competitor definitions
- `reference-data/capability-areas.json` — 14 capability areas for classification

### Skills & Rules
- `.claude/skills/force-matching/SKILL.md` — Force identification skill (enforces G-005)
- `.claude/rules/airtable.md` — Airtable API patterns and rate limits
- `.claude/rules/n8n.md` — n8n workflow structure requirements

### Completed Specs (reference for data model)
- `specs/SPEC-001-airtable-schema.md` — Airtable table definitions
- `specs/SPEC-002-jobs-ingestion.md` — Jobs ingestion workflow
- `specs/SPEC-003-signal-classification.md` — Signal classification workflow
- `specs/SPEC-004-opportunity-creator.md` — Opportunity creation logic
- `specs/SPEC-005-opportunity-enricher.md` — Opportunity enrichment workflow
- `specs/SPEC-006-monday-review.md` — Monday review (Airtable Interface version)

### V1 Dashboard Review (critical reference)
- `docs/archive/dashboard-v1-review.md` — What to keep vs avoid from V1

---

## Applicable Guardrails

| ID | Rule | Relevance |
|----|------|-----------|
| G-002 | Command Queue for Email Actions | Email sends must go through webhook (WF6), not direct API calls |
| G-008 | Always Include webhookId | Any webhook triggers to n8n must include webhookId |
| G-011 | Upsert Only (No Loop Delete) | Mutations to Airtable must use upsert, not delete+create |

---

## Recent Decisions

| Decision | Date | Impact |
|----------|------|--------|
| P1-01: Airtable Interface for Phase 1 | Jan 2025 | SPEC-006 uses Airtable Interface; React dashboard deferred to Phase 1c |
| P1-02: React Dashboard as Phase 1c | 19 Jan 2025 | Dashboard designated SPEC-007, parallel to Phase 1b (competitors) |
| A2: Airtable as Primary Database | Jan 2025 | Dashboard reads/writes to Airtable via API |
| A3: Self-Hosted n8n | Jan 2025 | Webhooks trigger n8n workflows for actions |

---

## Strategy Alignment Check

Before drafting, Claude Chat must verify:
- **Section 11**: Dashboard Design specification (primary reference)
- **Section 13**: Technology Stack (Next.js 14, Vercel deployment)
- Does the planned approach match the strategy specification?

**Key strategy requirements from Section 11**:
1. Queue view with Hot Leads section (competitor interceptions) at top
2. Ready to Send section below Hot Leads
3. Opportunity cards with: Why Now, Contact, Message, Actions
4. Single-focus flow: review → tweak → send → next
5. Tabs: Queue, Pipeline, Signals, Forces (Email/Tenders in later phases)
6. Dark-first design optimized for quick visual scanning

**Critical warning from V1 review**:
> DO NOT port the V1 three-zone layout (Queue/Now/Actions). Build the dashboard exactly as specified in the strategy document.

---

## V1 Technical Patterns to Keep

From `docs/archive/dashboard-v1-review.md`:

**Keep**:
- Badge system (30+ semantic variants for status, priority, source, action)
- Zustand for client state
- Dark-first CSS variable theming
- Skeleton loading states
- Undo buffer (30-second expiry with toast)

**Fix in V2**:
- Use React Query or SWR properly (V1 abandoned it, used manual fetch)
- Implement cache invalidation after mutations
- Add pagination from day one (V1 had none)
- Remove webhook fallback complexity (use n8n webhook only)

---

## Airtable Tables the Dashboard Will Read/Write

| Table | Usage |
|-------|-------|
| Opportunities | Main data source for Queue/Pipeline views |
| Signals (Indeed Intel Clean) | Raw signals for debugging view |
| Forces | Reference data for Forces view |
| Contacts | Contact lookup for opportunity cards |

API patterns: See `.claude/rules/airtable.md`

---

## Workflow Integration

| Action | Trigger | Workflow |
|--------|---------|----------|
| Send Email | Button click → webhook | WF6: Send Outreach (AeEDcJ5FD2YGCSV1) |
| Update Opportunity | Direct Airtable API | N/A |
| Skip Opportunity | Direct Airtable API (status update) | N/A |

---

## Notes for Claude Chat

- Reference assets by path (e.g., `patterns/force-matching.js`)
- Spec output should go in `specs/SPEC-007-react-dashboard.md`
- Keep spec under 200 lines
- Strategy Section 11 is the PRIMARY design reference — V1 review is for technical patterns only
- Phase 1c can start after Phase 1 burn-in completes (25 Jan)
- Dashboard replaces Airtable Interface from SPEC-006 (which remains as fallback)
