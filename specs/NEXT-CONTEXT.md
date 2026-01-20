# Context Brief: Phase 1b — Competitor Monitoring

Generated: 20 January 2025
For: Claude Chat spec drafting

---

## Current State

**Phase**: 1c — Dashboard MVP ✅ DEPLOYED
**Goal**: Dashboard deployed and tested; timing validation pending Monday
**Blockers**: None — Phase 1 and 1c are functionally complete

**Phase 1b Status**: Not yet started — depends on Phase 1 completion

---

## Acceptance Criteria (from ROADMAP.md)

```markdown
### Phase 1b: Competitor Monitoring
**Goal**: Detect when competitors post jobs for police forces, trigger interception

**Acceptance Criteria**:
- [ ] Competitor scrapers running (Red Snapper, Investigo, Reed, Adecco, Service Care)
- [ ] Competitor signals classified and attributed to correct force
- [ ] Hot lead flagging working (competitor signal = higher priority)
- [ ] Alert on hot leads (Slack or email)
- [ ] Interception message template in use

**Dependencies**: Phase 1 complete
**Skills used**: `competitive-analysis`, `intelligence-source-grading`
**Duration**: ~2 weeks
```

---

## Existing Assets

### Reference Data (source of truth)

| File | Purpose |
|------|---------|
| `reference-data/competitors.json` | 7 competitors with URLs, tiers, service areas |
| `reference-data/uk-police-forces.json` | 48 forces with metadata |
| `reference-data/capability-areas.json` | 14 capability areas for classification |

**Competitor Details** (from `competitors.json`):
- **Tier 1 (Direct)**: Red Snapper, Investigo
- **Tier 2 (Generalist)**: Hays, Adecco, Reed
- **Tier 3 (Niche)**: Service Care, Matrix SCM

**Key URLs**:
- Red Snapper: `rsg.ltd/jobs/`
- Investigo: `weareinvestigo.com/jobs`
- Reed: `reed.co.uk/jobs`
- Adecco: `adecco.co.uk/jobs`
- Service Care: `servicecare.org.uk/jobs`

### Patterns (reuse these, don't recreate)

| File | Purpose | Notes |
|------|---------|-------|
| `patterns/force-matching.js` | UK police force name matching | 47 patterns, G-005 compliant |
| `patterns/job-portal-filters.js` | Filter job portal false positives | G-010 compliant |
| `patterns/indeed-keywords.json` | Indeed search keywords | Can extend for competitors |

### Prompts (can extend or reference)

| File | Purpose | Notes |
|------|---------|-------|
| `prompts/job-classification.md` | Claude prompt for classifying job signals | Extend for competitor source |
| `prompts/opportunity-enrichment.md` | Enrichment prompt | Interception angle needed |

### Skills (reference for design)

| Skill | Purpose | Status |
|-------|---------|--------|
| `competitive-analysis` | Best-in-class dashboard patterns | Ready for 1b |
| `intelligence-source-grading` | Admiralty Code, signal confidence | Ready for 1b |

---

## Applicable Guardrails

| ID | Rule | Relevance to Phase 1b |
|----|------|----------------------|
| G-001 | Dumb Scrapers + Smart Agents | Competitor jobs → Raw_Archive → AI → Signals |
| G-003 | Bright Data Over Firecrawl | Required for competitor sites (anti-bot) |
| G-005 | Fuzzy JS Matching Before AI | Reuse `force-matching.js` for competitor job attribution |
| G-009 | Strict Date Filtering | 24h window prevents duplicate competitor signals |
| G-011 | Upsert Only (No Loop Delete) | Prevent data loss during sync |
| G-013 | Competitor Signals Get P1 Priority | **Critical**: Auto-flag as highest priority |

---

## Strategy Document References

The following sections from `docs/STRATEGY.md` are relevant:

| Section | Content |
|---------|---------|
| **5.2 Competitor Job Boards** | Source list, scraping frequency (4 hours), intelligence value |
| **8. Competitor Interception Strategy** | Full interception workflow, messaging rules, tracking metrics |

### Key Strategy Points

**From Section 5.2**:
- Scrape every 4 hours (time-sensitive for interception)
- Intelligence: which forces use which competitors, live needs, interception opportunity

**From Section 8**:
- Same-day response target
- Never mention competitor or how you knew
- Track: Interception Rate >15%, Win Rate >5%, Time to Response <24h

**Message Framing Rule**:
> Never mention the competitor or how you know about the need.
>
> ✅ "I understand you're looking at investigator capacity..."
> ❌ "I saw Red Snapper is recruiting for you..."

---

## Recent Decisions

| Decision | Date | Impact on Phase 1b |
|----------|------|-------------------|
| A2: Airtable as Primary Database | Jan 2025 | Competitor signals go to Signals table |
| A3: Self-Hosted n8n | Jan 2025 | Competitor scrapers as n8n workflows |
| G-013: Competitor Signals Get P1 | Jan 2025 | Auto-prioritisation required |
| P1c-01: MVP Before Full UI | 19 Jan | Dashboard already exists for hot leads |

---

## Schema Impact

**Signals table already supports competitor signals** (from STRATEGY.md Section 6):
- `type`: Single Select includes `competitor_job`
- `source`: Single Select includes `red_snapper`, `investigo`, `reed`, `adecco`, `service_care`
- `competitor_source`: Single Select for which competitor

**Opportunities table already supports interception**:
- `is_competitor_intercept`: Checkbox
- `competitor_detected`: Single Select
- `outreach_angle`: Single Select includes `competitor_intercept`

**Verify**: Check if these fields exist in current Airtable schema or need adding.

---

## Workflow Architecture (Expected)

```
┌────────────────────────────────────────────────────────────────────┐
│  WF8: Competitor Trigger                                            │
│  Schedule: Every 4 hours during business hours                     │
│  Triggers: Bright Data collector for each competitor site          │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  WF9: Competitor Receiver                                           │
│  Webhook: /competitor-jobs-receiver                                 │
│  Steps:                                                             │
│  1. Receive Bright Data payload                                     │
│  2. Deduplicate (G-009)                                            │
│  3. Archive to Raw table (G-001)                                   │
│  4. Run force-matching.js (G-005)                                  │
│  5. Send unmatched to AI classification                            │
│  6. Create Signals (type=competitor_job, source=competitor name)   │
│  7. Flag as P1 priority (G-013)                                    │
│  8. Send Slack/email alert if hot lead                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Strategy Alignment Check

**Potential alignment issues to verify**:

1. **Scraping frequency**: Strategy says 4 hours. Confirm with James if this is still desired or if daily is acceptable.

2. **Alert channel**: Strategy mentions "Slack or email". Clarify which James prefers.

3. **Interception message**: Strategy has a template in Section 8. Confirm if this should be the default or if SALES-STRATEGY.md templates take precedence.

4. **Matrix SCM**: Listed in `competitors.json` but described as "neutral vendor platform - not a direct competitor". Clarify if it should be monitored.

---

## Notes for Claude Chat

- Reference assets by path (e.g., `patterns/force-matching.js`)
- New prompts go in `prompts/`
- New patterns go in `patterns/`
- Spec output should go in `specs/SPEC-1b-competitor-monitoring.md`
- Keep spec under 200 lines
- Reuse existing job classification prompt — extend, don't recreate
- Ensure interception message respects G-012 (Value Proposition First)
- Dashboard already exists (SPEC-007b) — spec should focus on data pipeline

**Key question for spec**: Does the Airtable schema already have the competitor-specific fields, or do they need to be added?
