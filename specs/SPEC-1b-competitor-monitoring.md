# SPEC-1b: Competitor Monitoring

**Status**: Draft  
**Phase**: 1b — Competitor Monitoring  
**Source of Truth**: `docs/STRATEGY.md` Section 5.2, Section 8

---

## 1. Overview

**Goal**: Detect when competitors post police force jobs. Create high-priority signals for immediate interception outreach.

**Expected Outcome**: Competitor job posted → Signal created with P1 priority → Visible in dashboard → Interception draft ready — all within 4 hours of posting. Per G-013, all competitor signals automatically receive P1 priority.

---

## 2. Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Schedule   │────▶│  Bright Data │────▶│    Filter    │
│  (4 hours)   │     │  5 Competitor│     │   Dedupe     │
│              │     │    Sites     │     │   (G-009)    │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                 │
                     ┌──────────────┐     ┌──────▼───────┐
                     │   Airtable   │◀────│    Force     │
                     │   Signals    │     │   Matching   │
                     │  (P1 flag)   │     │   (G-005)    │
                     └──────┬───────┘     └──────────────┘
                            │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
              ┌──────────┐                ┌──────────┐
              │Opportunity│                │Interception│
              │  Creator  │                │   Draft   │
              └──────────┘                └──────────┘
```

**Data Flow**:
1. Scheduled trigger fires every 4 hours **(G-003: Bright Data)**
2. Bright Data scrapes 5 competitor job boards
3. Archive raw data to Jobs_Raw_Archive **(G-001: Dumb Scrapers)**
4. Deduplicate within 24h window **(G-009: Strict Date Filtering)**
5. Force matching via `patterns/force-matching.js` **(G-005: JS Before AI)**
6. Unmatched → Claude classification (extend existing prompt)
7. Create Signal: `type=competitor_job`, `priority=P1` **(G-013: Competitor = P1)**
8. Create Opportunity: `is_competitor_intercept=true`
9. Generate interception draft using SALES-STRATEGY.md Hook-Bridge-Value-CTA **(G-012)**

---

## 3. Tables

**Reads from**:
- `Forces` table (for linking)
- `Signals` table (for deduplication check)

**Writes to**:
- `Signals` table (`tblez9trodMzKKqXq`)
- `Opportunities` table (`tblJgZuI3LM2Az5id`)

**Schema Verification Required** (before building):

| Table | Field | Type | Action |
|-------|-------|------|--------|
| Signals | `type` | Single Select | Verify includes `competitor_job` |
| Signals | `source` | Single Select | Verify includes competitor names |
| Opportunities | `is_competitor_intercept` | Checkbox | Add if missing |
| Opportunities | `competitor_detected` | Single Select | Add if missing |
| Opportunities | `outreach_angle` | Single Select | Verify includes `competitor_intercept` |

**Field mapping for Signal creation**:

| Airtable Field | Source | Notes |
|----------------|--------|-------|
| `type` | `"competitor_job"` | Hardcoded |
| `source` | Competitor name | e.g., `red_snapper` |
| `title` | `job.title` | From Bright Data |
| `url` | `job.url` | From Bright Data |
| `external_id` | Hash of URL | For deduplication |
| `raw_data` | Full job JSON | Preserves scraped data |
| `force` | Force record ID | If pattern match succeeds |
| `status` | `"new"` | Ready for processing |
| `priority` | `"P1"` | Auto-set per G-013 |
| `detected_at` | Current timestamp | When ingested |

---

## 4. Workflows

### Stage 0: Explore Existing Workflow

**Before building**, explore the existing competitor workflow:

```
URL: https://n8n.srv1190997.hstgr.cloud/workflow/hCyCVcajOAzhMZrP
```

**Extract and document**:
- Bright Data collector configuration (URLs, selectors)
- Working force-matching logic
- Deduplication approach
- Alert mechanisms configured
- What worked, what didn't

**Output**: Document findings in `specs/IMPL-1b.md` before proceeding.

---

### Workflow: `MI: Competitor Trigger` (WF8)

**Trigger**: Schedule — every 4 hours (08:00, 12:00, 16:00, 20:00 UK time)

#### Node 1: Trigger Bright Data Collections

**Type**: HTTP Request (loop for each competitor)  
**Guardrail**: G-003 (Bright Data Over Firecrawl)

For each competitor in `reference-data/competitors.json`:
```
POST https://api.brightdata.com/datasets/v3/trigger
Headers: Authorization: Bearer {{$credentials.brightdata}}
Body: { "dataset_id": "{{competitor.dataset_id}}", "format": "json" }
```

#### Node 2: Await Completion

**Type**: Wait + HTTP Request poll  
Poll every 30 seconds until all 5 collectors complete.

#### Node 3: Trigger Receiver Webhook

**Type**: HTTP Request  
Send combined results to WF9 webhook.

---

### Workflow: `MI: Competitor Receiver` (WF9)

**Trigger**: Webhook — `/competitor-jobs-receiver`  
**Guardrail**: G-008 (Unique webhookId)

#### Node 1: Parse Payload

**Type**: Code  
Extract jobs array, identify source competitor.

#### Node 2: Archive Raw Data

**Type**: Airtable Create  
**Guardrail**: G-001 (Dumb Scrapers + Smart Agents)

Store to `Jobs_Raw_Archive` before any processing.

#### Node 3: Dedupe Check

**Type**: Airtable Search  
**Guardrail**: G-009 (24h window)

Check `external_id` against existing Signals. Skip if found within 24h.

#### Node 4: Force Matching

**Type**: Code  
**Guardrail**: G-005 (Fuzzy JS Matching Before AI)

```javascript
// Reference: patterns/force-matching.js
const { matchForce } = require('./patterns/force-matching.js');

return items.map(job => {
  const match = matchForce(job.company, job.location, job.title);
  return {
    ...job,
    force_id: match?.force_id || null,
    force_confidence: match?.confidence || 0,
    needs_ai: match?.confidence < 0.8
  };
});
```

#### Node 5: AI Classification (Unmatched Only)

**Type**: Claude API  
**Guardrail**: G-005 (JS Before AI — only unmatched jobs reach here)

Use extended `prompts/job-classification.md` with competitor context.

#### Node 6: Create Signals

**Type**: Airtable Create Records (batch)  
**Guardrail**: G-011 (Upsert Only), G-013 (Competitor = P1)

All competitor signals created with `priority=P1`.

#### Node 7: Create/Update Opportunity

**Type**: Code + Airtable  

Check if Opportunity exists for this force. If yes, link signal. If no, create with:
- `is_competitor_intercept=true`
- `outreach_angle=competitor_intercept`
- `competitor_detected=[competitor name]`

#### Node 8: Generate Interception Draft

**Type**: Claude API  
**Guardrail**: G-012 (Value Proposition First)

Use `prompts/competitor-interception.md` template based on SALES-STRATEGY.md Hook-Bridge-Value-CTA structure. Never mention competitor.

---

## 5. Testing Plan

| # | Test | Method | Expected Result | Validates |
|---|------|--------|-----------------|-----------|
| 1 | Bright Data collection | Manual trigger for Red Snapper | Raw jobs arrive at webhook | G-001, G-003 |
| 2 | Force matching | Job with "Metropolitan Police" in title | Signal linked to Met Police | G-005 |
| 3 | Deduplication | Same job sent twice in 24h | Only one Signal created | G-009 |
| 4 | P1 priority | Any competitor job creates Signal | Signal has `priority=P1` | G-013 |
| 5 | Dashboard visibility | New P1 signal created | Appears in dashboard P1 filter | AC #4 |

---

## 6. Acceptance Criteria

From ROADMAP.md Phase 1b:

- [ ] Competitor scrapers running (Red Snapper, Investigo, Reed, Adecco, Service Care)
- [ ] Competitor signals classified and attributed to correct force
- [ ] Hot lead flagging working (competitor signal = higher priority)
- [ ] Hot leads visible in dashboard (P1 filter)
- [ ] Interception message template in use

---

## 7. Build Sequence

1. **Stage 0: Explore existing workflow** — Document what exists
2. **Stage 1: Schema verification** — Add missing fields to Airtable
3. **Stage 2: Configure Bright Data** — 5 competitor collectors
4. **Stage 3: Build WF8** — Competitor Trigger
5. **Stage 4: Build WF9** — Competitor Receiver (all guardrails)
6. **Stage 5: Create interception prompt** — `prompts/competitor-interception.md` (Hook-Bridge-Value-CTA)
7. **Stage 6: End-to-end testing** — Tests 1-5
8. **Stage 7: 48-hour burn-in** — Monitor for issues

---

## 8. Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Phase 1 complete | ⚠️ 95% | Burn-in week remaining |
| `reference-data/competitors.json` | ✅ Exists | 7 competitors defined |
| `patterns/force-matching.js` | ✅ Exists | 47 patterns |
| `prompts/job-classification.md` | ✅ Exists | Extend for competitor context |
| Bright Data credentials | ⚠️ Verify | Must be configured |
| Dashboard P1 filter | ✅ Exists | SPEC-007b supports |
| Existing workflow exploration | ❌ Pending | Stage 0 |

---

## Competitor Sources

From `reference-data/competitors.json`:

| Competitor | Tier | URL | Notes |
|------------|------|-----|-------|
| Red Snapper | 1 | rsg.ltd/jobs/ | Primary competitor |
| Investigo | 1 | weareinvestigo.com/jobs | Public sector focus |
| Reed | 2 | reed.co.uk/jobs | Filter for police |
| Adecco | 2 | adecco.co.uk/jobs | Public sector section |
| Service Care | 3 | servicecare.org.uk/jobs | Police specialist |

**Excluded**: Matrix SCM (neutral vendor platform, not competitor)

---

## Interception Message Rules

From STRATEGY.md Section 8:

> Never mention the competitor or how you know about the need.

✅ "I understand you're looking at investigator capacity..."  
❌ "I saw Red Snapper is recruiting for you..."

---

## Files to Create/Update

| File | Action |
|------|--------|
| `specs/IMPL-1b.md` | Create — implementation tracker |
| `prompts/competitor-interception.md` | Create — interception template |
| `n8n/workflows/competitor-*.json` | Create — workflow exports |
| `STATUS.md` | Update — add Phase 1b progress |
| `specs/README.md` | Update — add SPEC-1b to index |

---

## Strategy Divergence Check

**Does this spec implement what the strategy document specifies?**

✅ **YES** — This spec directly implements:
- Section 5.2: Competitor Job Boards (sources, frequency)
- Section 8: Competitor Interception Strategy (messaging, tracking)

No divergence. Proceed with build.

---

## Out of Scope

These are handled elsewhere:
- Indeed job ingestion (SPEC-002)
- Signal classification logic (SPEC-003)
- Dashboard display of competitor signals (SPEC-007b already supports)
- Email-based alerts (Slack only for MVP)

---

## Handoff to Claude Code

**Context**: Detect competitor job postings, create P1 signals with interception drafts

**Pre-Build Required**:
1. Explore existing workflow: `https://n8n.srv1190997.hstgr.cloud/workflow/hCyCVcajOAzhMZrP`
2. Document findings in `specs/IMPL-1b.md`
3. Verify schema fields exist (see Section 3)

**Key references**:
- Competitors: `reference-data/competitors.json`
- Force matching: `patterns/force-matching.js`
- Existing classification: `prompts/job-classification.md`
- n8n rules: `.claude/rules/n8n.md`
- Strategy: `docs/STRATEGY.md` Sections 5.2, 8

**Workflow naming**: `MI: Competitor Trigger`, `MI: Competitor Receiver`

**On completion**: Update STATUS.md, verify first scheduled run succeeds
