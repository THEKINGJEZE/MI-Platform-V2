# Context Brief: Monday Review Experience

Generated: 18 January 2025
For: Claude Chat spec drafting

---

## Current State

**Phase**: 1 — Core Jobs Pipeline (99% COMPLETE)
**Goal**: Phase 1 End-to-End Testing — Tests 1-6 passing, burn-in started
**Blockers**: None

---

## Acceptance Criteria (from ROADMAP.md)

Phase 1 must deliver the Monday review experience. Full criteria:
- [ ] Airtable base created with schema (Signals, Opportunities, Forces, Contacts)
- [ ] 46 UK police forces seeded in Forces table
- [ ] Indeed ingestion workflow running (scheduled, every 4 hours)
- [ ] Signal classification working (Claude API, >90% accuracy)
- [ ] Opportunities created from relevant signals
- [ ] Basic enrichment working (contact lookup, message draft)
- [ ] **Can review opportunity and mark as sent**
- [ ] End-to-end test: fake job → classified → opportunity → reviewed

**Done Means Done** (from ROADMAP):
1. All acceptance criteria checked off
2. End-to-end test passing
3. Running in production for 1 week without major issues
4. **James has used it for at least one Monday review**

---

## Existing Assets

### Workflows (n8n — all active)
- `jobs-trigger.json` — WF1: Triggers Bright Data scrape daily at 06:00
- `jobs-receiver.json` — WF2: Webhook receiver, deduplication, logging
- `jobs-classifier.json` — WF3: AI classification + force matching (15min schedule)
- `opportunity-creator.json` — WF4: Creates opportunities from relevant signals (15min)
- `opportunity-enricher.json` — WF5: Contact lookup, draft outreach, priority scoring (15min)

### Patterns (reuse these, don't recreate)
- `patterns/force-matching.js` — UK police force name fuzzy matching (G-005 compliant)
- `patterns/job-portal-filters.js` — Filter job portal URLs from news (G-010)

### Prompts (can extend or reference)
- `prompts/job-classification.md` — Claude prompt for signal relevance scoring
- `prompts/email-triage.md` — Email classification prompt (Phase 2a)
- `prompts/opportunity-enrichment.md` — Outreach draft + priority scoring

### Reference Data (source of truth)
- `reference-data/uk-police-forces.json` — 48 UK police forces with metadata
- `reference-data/competitors.json` — 7 competitor definitions
- `reference-data/capability-areas.json` — 14 capability areas for classification

### Specs (completed, for reference)
- `specs/SPEC-001-airtable-schema.md` — Database schema design
- `specs/SPEC-002-jobs-ingestion.md` — Bright Data + webhook ingestion
- `specs/SPEC-003-signal-classification.md` — AI classification workflow
- `specs/SPEC-004-opportunity-creator.md` — Signal → Opportunity conversion
- `specs/SPEC-005-opportunity-enricher.md` — Contact + draft enrichment

### Skills & Rules
- `.claude/skills/force-matching/` — Force identification skill (enforces G-005)
- `.claude/rules/airtable.md` — Airtable API patterns and rate limits
- `.claude/rules/n8n.md` — n8n workflow structure requirements

---

## Applicable Guardrails

| ID | Rule | Relevance to Monday Review |
|----|------|---------------------------|
| G-001 | Dumb Scrapers + Smart Agents | Review sees clean opportunities, not raw data |
| G-011 | Upsert Only (No Loop Delete) | Status updates must not risk data loss |

---

## Recent Decisions

| Decision | Date | Impact |
|----------|------|--------|
| A2: Airtable as Primary Database | Jan 2025 | Review UI likely built on Airtable views |
| A4: Two-Layer Claude Architecture | 16 Jan | Review logic in Chat, implementation in Code |
| A7: Single Source of Truth | 16 Jan | Opportunity table is canonical for leads |

---

## Key Questions for Spec

1. **What is the review interface?** — Airtable interface? Custom dashboard? n8n form?
2. **What actions does James take?** — Approve → Send? Edit draft? Skip? Archive?
3. **What does "mark as sent" mean?** — Update Airtable status? Log to HubSpot? Both?
4. **What metrics matter for Monday?** — # ready leads, time to review, quality score?
5. **How does HubSpot sync fit?** — Sync after approval? Sync on send? Background sync?

---

## Notes for Claude Chat

- Reference assets by path (e.g., `patterns/force-matching.js`)
- New prompts go in `prompts/`
- New patterns go in `patterns/`
- Spec output should go in `specs/SPEC-006-monday-review.md`
- Keep spec under 200 lines
- **Critical success metric**: ≤15 min Monday review time (from ANCHOR.md)
- **User context**: James has ADHD — minimize decisions, maximize clarity
