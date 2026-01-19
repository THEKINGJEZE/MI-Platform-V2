# MI Platform — Roadmap

## Overview

This roadmap breaks the MI Platform build into sequential phases. Each phase has clear acceptance criteria — it's either done or it isn't.

**Current Phase**: 1 — Core Jobs Pipeline

---

## Phases

### Phase 1: Core Jobs Pipeline
**Goal**: Indeed jobs flow through to ready-to-send opportunities

**Acceptance Criteria**:
- [ ] Airtable base created with schema (Signals, Opportunities, Forces, Contacts)
- [ ] 46 UK police forces seeded in Forces table
- [ ] Indeed ingestion workflow running (scheduled, every 4 hours)
- [ ] Signal classification working (Claude API, >90% accuracy)
- [ ] Opportunities created from relevant signals
- [ ] Basic enrichment working (contact lookup, message draft)
- [x] Can review opportunity and mark as sent
- [ ] End-to-end test: fake job → classified → opportunity → reviewed

**Specs** (signed off 18 Jan 2025):
- [x] SPEC-001: Airtable Schema — ✅ Aligned with strategy Section 6
- [x] SPEC-002: Jobs Ingestion — ✅ Aligned with strategy Sections 5.1, 10
- [x] SPEC-003: Signal Classification — ✅ Aligned (model deviation: gpt-4o-mini for cost)
- [x] SPEC-004: Opportunity Creator — ✅ Aligned with strategy Section 7, 10
- [x] SPEC-005: Opportunity Enricher — ✅ Aligned (model deviation: gpt-4o-mini for cost)

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

**Spec**: `specs/phase-1b-competitors.md`

**Duration**: ~2 weeks

---

### Phase 2a: Email Integration
**Goal**: Manage inbox — classify incoming emails, draft responses

**Acceptance Criteria**:
- [ ] Email ingestion from Outlook working
- [ ] Email classification working (lead response, opportunity, etc.)
- [ ] Draft responses generated for emails needing reply
- [ ] Email queue in dashboard
- [ ] Can send response from dashboard

**Dependencies**: Phase 1 complete

**Spec**: `specs/phase-2a-email.md`

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

**Dependencies**: Phase 1 complete

**Spec**: `specs/phase-2b-tenders.md`

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

**Spec**: `specs/phase-3-awards.md`

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

**Spec**: `specs/phase-4-regulatory.md`

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

**Spec**: `specs/phase-5-news.md`

**Duration**: ~2 weeks

---

## Phase Diagram

```
Phase 1: Core Jobs Pipeline
    │
    ├──→ Phase 1b: Competitor Monitoring
    │
    ├──→ Phase 2a: Email Integration
    │
    ├──→ Phase 2b: Tenders ──→ Phase 3: Awards
    │
    ├──→ Phase 4: Regulatory
    │
    └──→ Phase 5: News
```

Phases 1b, 2a, 2b, 4, 5 can run in parallel after Phase 1.
Phase 3 requires Phase 2b.

---

## Done Means Done

A phase is complete when:
1. All acceptance criteria checked off
2. End-to-end test passing
3. Running in production for 1 week without major issues
4. James has used it for at least one Monday review

**No moving to the next phase until current phase is done.**

---

## Updating This Document

- Check off acceptance criteria as they're completed
- Update "Current Phase" when transitioning
- Add notes to phases if scope changes (log decision in DECISIONS.md)

---

*Last updated: 18 January 2025*
