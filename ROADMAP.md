# MI Platform — Roadmap

## Overview

This roadmap breaks the MI Platform build into sequential phases. Each phase has clear acceptance criteria — it's either done or it isn't.

**Current Phase**: 1 — Core Jobs Pipeline

---

## Phases

### Phase 1: Core Jobs Pipeline
**Goal**: Indeed jobs flow through to ready-to-send opportunities

**Acceptance Criteria**:
- [x] Airtable base created with schema (Signals, Opportunities, Forces, Contacts)
- [x] 48 UK police forces seeded in Forces table
- [ ] Indeed ingestion workflow running (scheduled, daily 06:00)
- [ ] Signal classification working (OpenAI gpt-4o-mini, >90% accuracy)
- [ ] Opportunities created from relevant signals
- [ ] Basic enrichment working (contact lookup, message draft)
- [ ] Can review opportunity and mark as sent
- [ ] End-to-end test: fake job → classified → opportunity → reviewed

**Specs**:
- [x] SPEC-001: Airtable Schema — ✅ Complete
- [x] SPEC-002: Jobs Ingestion — ✅ Built (WF1-WF3)
- [x] SPEC-003: Signal Classification — ✅ Built (WF3)
- [ ] SPEC-004: Opportunity Creator — In progress (WF4)
- [ ] SPEC-005: Opportunity Enricher — Next (WF5)

**Duration**: ~4 weeks

---

### Phase 1b: Competitor Monitoring
**Goal**: Detect when competitors post jobs for police forces, trigger interception

**Acceptance Criteria**:
- [ ] Competitor scrapers running (Red Snapper, Investigo, Reed, Adecco, Service Care)
- [ ] Competitor signals classified and attributed to correct force
- [ ] Hot lead flagging working (competitor signal = higher priority)
- [ ] Alert on hot leads (Slack or email)
- [ ] Interception message template in use

**Dependencies**: Phase 1 complete

**Spec**: `specs/phase-1b-competitors.md` (to be created)

**Skills used**: `competitive-analysis`, `intelligence-source-grading`

**Duration**: ~2 weeks

---

### Phase 1c: Dashboard MVP
**Goal**: Custom Monday Review interface with Three-Zone layout

**Acceptance Criteria**:
- [ ] Next.js 14 app deployed (Vercel or VPS)
- [ ] Three-zone layout (Queue | Now Card | Composer)
- [ ] Design tokens from V1 applied
- [ ] J/K keyboard navigation working
- [ ] E/S/D action keys working
- [ ] Z undo within 30 seconds working
- [ ] Progress header showing X of Y
- [ ] Toast notifications with countdown
- [ ] Empty state when queue clear
- [ ] Error state with retry
- [ ] Full review of 5 opportunities takes ≤15 minutes

**Dependencies**: Phase 1 complete (WF4, WF5 populating data)

**Spec**: `specs/SPEC-007b-dashboard-mvp.md` ✅

**Skills used**: `uk-police-design-system`, `action-oriented-ux`, `adhd-interface-design`

**Schema additions required**:
- `draft_subject` (Single Line Text) on Opportunities
- `draft_body` (Long Text) on Opportunities
- `actioned_at` (DateTime) on Opportunities
- `skip_reason` (Single Select) on Opportunities

**Duration**: ~2 weeks

**Note**: This replaces the original SPEC-007 with a simplified MVP. Full features (SPEC-007a) come later.

---

### Phase 2a: Email Integration
**Goal**: Manage inbox — classify incoming emails, draft responses

**Acceptance Criteria**:
- [ ] Email ingestion from Outlook working
- [ ] Email classification working (lead response, opportunity, etc.)
- [ ] Draft responses generated for emails needing reply
- [ ] Email queue in dashboard
- [ ] Can send response from dashboard

**Dependencies**: Phase 1c complete

**Spec**: `specs/phase-2a-email.md` (to be created)

**Skills used**: `hubspot-integration`

**Duration**: ~3 weeks

---

### Phase 2b: Tenders & Procurement
**Goal**: Monitor Find a Tender and Contracts Finder for relevant opportunities

**Acceptance Criteria**:
- [ ] FTS API integration working
- [ ] Contracts Finder API integration working
- [ ] Tender classification working
- [ ] Tender signals create opportunities
- [ ] Deadline tracking and alerts
- [ ] Tender view in dashboard

**Dependencies**: Phase 1c complete

**Spec**: `specs/phase-2b-tenders.md` (to be created)

**Skills used**: `uk-public-sector-procurement`

**Duration**: ~3 weeks

---

### Phase 3: Contract Awards Intel
**Goal**: Track who wins contracts, build competitor intelligence

**Acceptance Criteria**:
- [ ] Award notices ingested from FTS/Contracts Finder
- [ ] Winner extraction working
- [ ] Force contract history populated
- [ ] Contract end date tracking
- [ ] Renewal reminders working

**Dependencies**: Phase 2b complete

**Spec**: `specs/phase-3-awards.md` (to be created)

**Duration**: ~2 weeks

---

### Phase 4: Regulatory Signals
**Goal**: Monitor HMICFRS reports and Reg 28s for forces under pressure

**Acceptance Criteria**:
- [ ] HMICFRS PEEL report scraping working
- [ ] Reg 28 report scraping working
- [ ] Regulatory signals classified correctly
- [ ] Force profiles updated with PEEL ratings
- [ ] Sensitive outreach angles working (don't cite their problems)

**Dependencies**: Phase 1 complete

**Spec**: `specs/phase-4-regulatory.md` (to be created)

**Skills used**: `uk-police-market-domain`, `intelligence-source-grading`

**Duration**: ~3 weeks

---

### Phase 5: News Monitoring
**Goal**: Catch breaking news about forces (backlogs, staffing issues, etc.)

**Acceptance Criteria**:
- [ ] News API integration working
- [ ] News classification filtering noise effectively
- [ ] Relevant news linked to forces/opportunities
- [ ] News context available in dashboard

**Dependencies**: Phase 1 complete

**Spec**: `specs/phase-5-news.md` (to be created)

**Duration**: ~2 weeks

---

## Phase Diagram

```
Phase 1: Core Jobs Pipeline
    │
    ├──→ Phase 1b: Competitor Monitoring
    │         │
    │         └──→ Dashboard Enhancement: Dual-Track Scoring (SPEC-007a partial)
    │
    ├──→ Phase 1c: Dashboard MVP (SPEC-007b)
    │         │
    │         ├──→ Dashboard Enhancement: Full UI (SPEC-007a)
    │         │
    │         └──→ Dashboard Enhancement: Morning Brief (SPEC-008)
    │
    ├──→ Phase 2a: Email Integration
    │
    ├──→ Phase 2b: Tenders ──→ Phase 3: Awards
    │
    ├──→ Phase 4: Regulatory
    │
    └──→ Phase 5: News
```

---

## Schema Evolution

The Airtable schema grows incrementally to support features:

### Current (Phase 1)

**4 tables**: Forces, Signals, Opportunities, Contacts

**Opportunities fields**:
- Core: name, force, signals, status, priority, contact
- Enrichment: why_now (AI context)

### Phase 1c Additions

**Add to Opportunities**:
- `draft_subject` (Single Line Text)
- `draft_body` (Long Text)
- `actioned_at` (DateTime)
- `skip_reason` (Single Select: Not police sector, Wrong force, Not our service area, Already contacted, Duplicate, Other)

### Future: Dashboard Enhancement (SPEC-007a)

**Add to Opportunities** (when implementing dual-track scoring):
- `ms_score` (Number 0-100) — Managed Services score
- `ag_score` (Number 0-100) — Agency score
- `primary_track` (Single Select: MS, AG)
- `signal_score` (Number 0-100)
- `fit_score` (Number 0-100)
- `relationship_score` (Number 0-100)
- `timing_score` (Number 0-100)

**Add to Contacts**:
- `research_confidence` (Number 0-100)
- `confidence_sources` (Long Text)

### Future: Morning Brief (SPEC-008)

**Add to Opportunities**:
- `next_follow_up_date` (Date)
- `snoozed_until` (DateTime)

**Optional**: Sessions table for tracking completion

### Future: Monitoring (Phase 6+)

**New tables**:
- `System_Logs` — Workflow execution logs
- `System_Health` — Daily metrics aggregation

---

## Dashboard Evolution

The dashboard grows in capability over time:

### MVP (Phase 1c) — SPEC-007b
- Three-zone layout ✓
- Keyboard navigation ✓
- Progress feedback ✓
- Undo with 30s window ✓
- Simple priority badge
- Why Now + Signals context
- Basic contact display

### Enhancement 1 (Post-1b) — SPEC-007a Partial
*Triggered by: Competitor monitoring creating differentiated signals*

- Dual-track scoring display (MS vs AG)
- Score breakdown grid
- Contact confidence indicators
- Session persistence

### Enhancement 2 (Post-validation) — SPEC-008
*Triggered by: 4+ weeks of real usage, sufficient overnight activity*

- Morning Brief ritual
- Energy check
- Overnight summary
- Rule of Three selection
- Focus Mode integration

### Enhancement 3 (Phase 2+)
- Pipeline view (Kanban)
- Email queue view
- Tender deadline view
- Force directory view

---

## Future Features (Parked)

These features are fully specified but intentionally deferred:

| Feature | Spec | Trigger to Implement |
|---------|------|---------------------|
| Dual-track scoring UI | SPEC-007a | Phase 1b complete + schema expanded |
| Score breakdown grid | SPEC-007a | Scoring model validated |
| Contact confidence | SPEC-007a | Contact research workflow exists |
| Morning Brief ritual | SPEC-008 | 4+ weeks using MVP + sufficient signal volume |
| Overnight summaries | SPEC-008 | Session persistence implemented |
| Energy-based selection | SPEC-008 | Scoring model supports difficulty levels |

---

## Skills Reference

See `skills/README.md` for guidance on when to use each skill.

**Active skills** (use now):
- `uk-police-design-system` — Design tokens
- `technical-architecture` — Data patterns
- `uk-police-market-domain` — Domain knowledge

**Ready for Phase 1c**:
- `action-oriented-ux` — Three-Zone Model
- `adhd-interface-design` — ADHD patterns

**Deferred**:
- `lead-scoring-methodology` — Needs schema expansion
- `notification-system` — Needs overnight tracking
- `b2b-visualisation` — Needs scoring data

---

## Done Means Done

A phase is complete when:
1. All acceptance criteria checked off
2. End-to-end test passing
3. Running in production for 1 week without major issues
4. James has used it for at least one Monday review

**No moving to the next phase until current phase is done.**

---

## Spec Index

| Spec | Phase | Status |
|------|-------|--------|
| SPEC-001: Airtable Schema | 1 | ✅ Complete |
| SPEC-002: Jobs Ingestion | 1 | ✅ Built |
| SPEC-003: Signal Classification | 1 | ✅ Built |
| SPEC-004: Opportunity Creator | 1 | 🔄 In Progress |
| SPEC-005: Opportunity Enricher | 1 | ⏳ Next |
| SPEC-006: Monday Review | 1 | 🔀 Absorbed into SPEC-007b |
| SPEC-007: React Dashboard | 1c | 🔀 Replaced by SPEC-007b |
| SPEC-007a: Full UI Foundation | Future | ⏸️ Deferred |
| SPEC-007b: Dashboard MVP | 1c | ✅ Ready |
| SPEC-008: Morning Brief | Future | ⏸️ Deferred |

---

## Updating This Document

- Check off acceptance criteria as they're completed
- Update "Current Phase" when transitioning
- Add notes to phases if scope changes (log decision in DECISIONS.md)
- Schema changes go in "Schema Evolution" section
- New dashboard features go in "Dashboard Evolution" section

---

*Last updated: 19 January 2025*
