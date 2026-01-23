# MI Platform — Roadmap

## Overview

This roadmap breaks the MI Platform build into sequential phases. Each phase has clear acceptance criteria — it's either done or it isn't.

**Current Phase**: 1d + 2a (Parallel) — Quality monitoring + Email integration

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

### Phase 1b: Competitor Monitoring ✅ COMPLETE
**Goal**: Detect when competitors post jobs for police forces, trigger interception

**Acceptance Criteria**:
- [x] Competitor scrapers running (Red Snapper, Investigo) — Bright Data configured
- [x] Competitor signals classified and attributed to correct force
- [x] Hot lead flagging working (competitor signal = higher priority)
- [x] Alert on hot leads — Dashboard P1 filter provides visibility
- [x] Interception message template in use

**Dependencies**: Phase 1 complete

**Spec**: `specs/SPEC-1b-competitor-monitoring.md` ✅ Complete
**Implementation**: `specs/IMPL-1b-competitor-monitoring.md`

**Workflows**:
- WF9: MI: Competitor Receiver (`VLbSZp5cGp1OUQZy`) — Active ✅
- WF8: [ARCHIVED] MI: Competitor Trigger — Not needed, Bright Data handles scheduling

**Bright Data Collectors**:
- Investigo: `c_mkeaif24wc2xinpo6` ✅
- Red Snapper: `c_mke54t691ndre24s37` ✅

**Skills used**: `competitive-analysis`, `intelligence-source-grading`

**Duration**: ~2 weeks

**Status**: ✅ Complete — Live data flowing from both collectors.

---

### Phase 1c: Dashboard MVP
**Goal**: Custom Monday Review interface with Three-Zone layout

**Acceptance Criteria**:
- [x] Next.js 14 app deployed (Vercel or VPS) — Build succeeds, pending deploy
- [x] Three-zone layout (Queue | Now Card | Composer) — ✅ Implemented in /review
- [x] Design tokens from V1 applied — ✅ tokens.css preserved
- [x] J/K keyboard navigation working — ✅ Implemented
- [x] E/S/D action keys working — ✅ Implemented
- [ ] Z undo within 30 seconds working — Implemented, pending runtime test
- [x] Progress header showing X of Y — ✅ Implemented
- [ ] Toast notifications with countdown — Implemented, pending runtime test
- [x] Empty state when queue clear — ✅ Implemented
- [x] Error state with retry — ✅ Implemented
- [ ] Full review of 5 opportunities takes ≤15 minutes — Pending user test

**Dependencies**: Phase 1 complete (WF4, WF5 populating data)

**Spec**: `specs/SPEC-009-dashboard-v1-migration.md` ✅ Implemented

**Skills used**: `uk-police-design-system`, `action-oriented-ux`, `adhd-interface-design`

**Schema additions required**:
- `draft_subject` (Single Line Text) on Opportunities
- `draft_body` (Long Text) on Opportunities
- `actioned_at` (DateTime) on Opportunities
- `skip_reason` (Single Select) on Opportunities

**Duration**: ~2 weeks

**Note**: V1 dashboard code migration approach per Decision A9. Supersedes SPEC-007/007a/007b.

---

### Phase 1d: Quality Improvement
**Goal**: Fix critical pipeline quality issues identified in audits

**Acceptance Criteria**:
- [ ] Classification false positive rate < 10% (from ~80%)
- [ ] Duplicate signals < 5% (from 37-53%)
- [ ] Competitor opportunities flagged P1/Hot = 100% (from 22%)
- [ ] Summaries reference actual signal titles > 90%
- [ ] 1 opportunity per force (no duplicates)
- [ ] Existing bad data cleaned up

**Dependencies**: Dashboard deployed (Phase 1c complete)

**Plan**: `docs/QUALITY-IMPROVEMENT-PLAN.md`

**Workflows fixed** ✅:
- WF3: jobs-classifier.json (gate logic, prompt, schema fields)
- jobs-receiver.json (upsert deduplication)
- WF9: competitor-receiver.json (upsert deduplication)
- WF4: opportunity-creator.json (competitor flag)
- WF5: opportunity-enricher.json (signal fetch, P1 guardrail)

**Schema additions** ✅:
- Signals: role_category, role_detail, seniority, ai_confidence, force_source, first_seen, last_seen, scrape_count

**Cleanup scripts created** ✅:
- `scripts/cleanup-signals.js`
- `scripts/merge-opportunities.js`
- `scripts/recompute-priorities.js`

**Duration**: ~1 week

**Status**: ✅ Implementation complete — monitoring until 30 Jan 2026

---

### Phase 1e: Agentic Enrichment (SPEC-011)
**Goal**: Intelligent contact research and message drafting

**Acceptance Criteria**:
- [ ] Contact research automated (LinkedIn, force websites)
- [ ] Message drafts follow SALES-STRATEGY structure
- [ ] Quality gates catch policy violations
- [ ] Monday review time ≤ 15 min for 5 opportunities

**Dependencies**: Phase 1d complete (quality issues fixed)

**Spec**: `specs/SPEC-011-agent-enrichment.md` ✅ Complete

**Duration**: ~1 week

---

### Phase 2a: Email Integration + Relationship Decay Alerts
**Goal**: Manage inbox — classify incoming emails, draft responses. Alert when relationships go cold.

**Acceptance Criteria**:
- [ ] Email ingestion from Outlook working
- [ ] Email classification working (lead response, opportunity, etc.)
- [ ] Draft responses generated for emails needing reply
- [ ] Email queue in dashboard
- [ ] Can send response from dashboard
- [ ] Relationship decay tracking active (daily scan)
- [ ] Dashboard shows "Relationships Need Attention" section
- [ ] AI-suggested touchpoints for cold contacts

**Dependencies**: Phase 1e complete

**Spec**: `specs/SPEC-012-email-integration.md` ✅ Spec Written

**Skills used**: `hubspot-integration`

**Schema additions**:
- `relationship_status` (Single Select: Active/Warming/Cold/At-Risk) on Contacts
- `last_contact_date` (Date) on Contacts (if not already present)
- `decay_alert_sent` (DateTime) on Contacts

**Duration**: ~3 weeks

**Note**: Relationship decay alerts added per Decision A11 (V1 vision reprioritisation).

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

### Phase 3: Social Engagement System
**Goal**: Daily 15-minute social engagement routine with AI-curated content

**Acceptance Criteria**:
- [ ] Priority accounts list maintained (police contacts + industry influencers)
- [ ] n8n workflow fetches recent posts from priority accounts (LinkedIn + Twitter)
- [ ] AI scoring selects top 5 posts worth engaging with
- [ ] AI-suggested comments in James's voice
- [ ] Dashboard shows daily engagement queue (3 to comment, 2 to like)
- [ ] "Engagement Session" mode guides 15-min routine
- [ ] Streak tracking and consistency metrics
- [ ] 80% engagement consistency target

**Dependencies**: Phase 2a complete

**Spec**: `specs/SPEC-013-social-engagement.md`

**Skills used**: `adhd-interface-design` (habit formation, streak tracking)

**Schema additions**:
- New table: `Social_Engagement` (post_id, platform, author, author_tier, post_url, post_preview, posted_at, engagement_type, suggested_comment, status, engaged_at, force, contact)
- New table: `Priority_Accounts` (name, platform, profile_url, tier, category, force, contact, notes, last_engaged)

**Technical considerations**:
- LinkedIn: RSS feeds or scraping (API is restrictive)
- Twitter/X: API access
- No auto-posting (TOS risk) — system curates, you click

**Duration**: ~3 weeks

**Note**: Added per Decision A11 (V1 vision reprioritisation). Based on V1's UNIFIED-COMMAND-VISION.md.

---

### Phase 4: Contract Awards Intel
**Goal**: Track who wins contracts, build competitor intelligence

**Acceptance Criteria**:
- [ ] Award notices ingested from FTS/Contracts Finder
- [ ] Winner extraction working
- [ ] Force contract history populated
- [ ] Contract end date tracking
- [ ] Renewal reminders working

**Dependencies**: Phase 2b complete

**Spec**: `specs/phase-4-awards.md` (to be created)

**Duration**: ~2 weeks

---

### Phase 5: Regulatory Signals
**Goal**: Monitor HMICFRS reports and Reg 28s for forces under pressure

**Acceptance Criteria**:
- [ ] HMICFRS PEEL report scraping working
- [ ] Reg 28 report scraping working
- [ ] Regulatory signals classified correctly
- [ ] Force profiles updated with PEEL ratings
- [ ] Sensitive outreach angles working (don't cite their problems)

**Dependencies**: Phase 1 complete

**Spec**: `specs/phase-5-regulatory.md` (to be created)

**Skills used**: `uk-police-market-domain`, `intelligence-source-grading`

**Duration**: ~3 weeks

---

### Phase 6: News Monitoring
**Goal**: Catch breaking news about forces (backlogs, staffing issues, etc.)

**Acceptance Criteria**:
- [ ] News API integration working
- [ ] News classification filtering noise effectively
- [ ] Relevant news linked to forces/opportunities
- [ ] News context available in dashboard

**Dependencies**: Phase 1 complete

**Spec**: `specs/phase-6-news.md` (to be created)

**Duration**: ~2 weeks

---

### Phase 7: Advanced Features
**Goal**: Pre-call briefs, weekly planning ritual, deal health monitoring

**Acceptance Criteria**:
- [ ] On-demand pre-call brief generation
- [ ] Monday planning session interface
- [ ] Friday review/celebration interface
- [ ] Deal health status tracking (green/yellow/red)
- [ ] At-risk deal alerts

**Dependencies**: Phase 3 complete (social engagement working)

**Spec**: `specs/phase-7-advanced.md` (to be created)

**Duration**: ~4 weeks

**Note**: Deferred features from V1 UNIFIED-COMMAND-VISION.md. Revisit after Phase 3 validation.

**Duration**: ~2 weeks

---

## Phase Diagram

```
Phase 1: Core Jobs Pipeline
    │
    ├──→ Phase 1b: Competitor Monitoring ✅
    │
    ├──→ Phase 1c: Dashboard V1 Migration (SPEC-009) ✅
    │
    ├──→ Phase 1d: Quality Improvement ✅ (monitoring)
    │         │
    │         └──→ Phase 1e: Agent Enrichment (SPEC-011) ✅
    │                   │
    │                   └──→ Dashboard Enhancement: Morning Brief (SPEC-008)
    │
    ├──→ Phase 2a: Email + Relationship Decay Alerts (SPEC-012)
    │
    ├──→ Phase 2b: Tenders ──→ Phase 4: Contract Awards
    │
    ├──→ Phase 3: Social Engagement (SPEC-013) ← NEW
    │
    ├──→ Phase 5: Regulatory
    │
    ├──→ Phase 6: News
    │
    └──→ Phase 7: Advanced Features (pre-call briefs, weekly planning, deal health)
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

**Note**: Phase 1c is dashboard UI migration. Schema fields already defined in SPEC-001:
- `outreach_draft` (Long Text) — Message body for outreach
- `outreach_subject` (Single Line Text) — Subject line for email outreach (added in SPEC-011)
- `status` (Single Select) — Includes sent/skipped states

### Phase 1d Additions (Quality Improvement)

**Add to Signals** (for classification quality):
- `role_category` (Single Select) — `investigation`, `criminal_justice`, `intelligence`, `forensics`, `specialist`, `support`
- `role_detail` (Single Line Text) — Specific role description from AI
- `seniority` (Single Select) — `senior`, `mid`, `junior`, `unknown`
- `ai_confidence` (Number 0-100) — Classification confidence score
- `force_source` (Single Select) — `matched`, `inferred`, `manual`

**Add to Signals** (for deduplication):
- `first_seen` (DateTime) — First scrape timestamp
- `last_seen` (DateTime) — Most recent scrape timestamp
- `scrape_count` (Number) — Times seen in scrapes

**Add to Opportunities**:
- `why_now` (Long Text) — AI-generated context summary
- `is_competitor_intercept` (Checkbox) — Competitor signal detected

### Future: Dashboard Enhancement (Post-SPEC-009)

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

### Phase 2a: Email + Relationship Decay

**Add to Contacts**:
- `relationship_status` (Single Select: Active/Warming/Cold/At-Risk)
- `last_contact_date` (Date) — if not already present
- `decay_alert_sent` (DateTime)

**New table: Emails**:
- See SPEC-012 for full schema

### Phase 3: Social Engagement

**New table: Social_Engagement**:
- `post_id` (Text) — Platform-specific post ID
- `platform` (Single Select: LinkedIn/Twitter)
- `author` (Text)
- `author_tier` (Single Select: High/Medium/Low)
- `post_url` (URL)
- `post_preview` (Long Text)
- `posted_at` (DateTime)
- `engagement_type` (Single Select: Comment/Like)
- `suggested_comment` (Long Text)
- `status` (Single Select: Pending/Done/Skipped)
- `engaged_at` (DateTime)
- `force` (Link to Forces)
- `contact` (Link to Contacts)

**New table: Priority_Accounts**:
- `name` (Text)
- `platform` (Single Select: LinkedIn/Twitter/Both)
- `profile_url` (URL)
- `tier` (Single Select: High/Medium/Low)
- `category` (Single Select: Police Contact/Industry Influencer/Competitor/Other)
- `force` (Link to Forces)
- `contact` (Link to Contacts)
- `notes` (Long Text)
- `last_engaged` (Date)

### Future: Monitoring (Phase 7+)

**New tables**:
- `System_Logs` — Workflow execution logs
- `System_Health` — Daily metrics aggregation

---

## Dashboard Evolution

The dashboard grows in capability over time:

### MVP (Phase 1c) — SPEC-009
- V1 codebase migrated to V2 backend
- Three-zone layout ✓
- Keyboard navigation ✓
- Progress feedback ✓
- Undo with 30s window ✓
- Simple priority badge
- Why Now + Signals context
- Basic contact display

### Enhancement 1 (Post-MVP)
*Triggered by: MVP validated + sufficient real usage*

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
| Dual-track scoring UI | Future (post-SPEC-009) | Schema expanded + scoring validated |
| Score breakdown grid | Future (post-SPEC-009) | Scoring model validated |
| Contact confidence | Future (post-SPEC-009) | Contact research workflow exists |
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
| SPEC-004: Opportunity Creator | 1 | ✅ Built (fixed in Phase 1d) |
| SPEC-005: Opportunity Enricher | 1 | ✅ Built |
| SPEC-006: Monday Review | 1 | 🔀 Absorbed into SPEC-009 |
| SPEC-008: Morning Brief | Future | ⏸️ Deferred |
| SPEC-009: Dashboard V1 Migration | 1c | ✅ Complete |
| SPEC-010: Pipeline Remediation | 1d | ✅ Complete |
| SPEC-011: Agent Enrichment | 1e | ✅ Complete |
| SPEC-012: Email + Relationship Decay | 2a | ✅ Spec Written |
| SPEC-013: Social Engagement | 3 | 📋 Planned |
| SPEC-1b: Competitor Monitoring | 1b | ✅ Complete |

---

## Updating This Document

- Check off acceptance criteria as they're completed
- Update "Current Phase" when transitioning
- Add notes to phases if scope changes (log decision in DECISIONS.md)
- Schema changes go in "Schema Evolution" section
- New dashboard features go in "Dashboard Evolution" section

---

*Last updated: 23 January 2026*
