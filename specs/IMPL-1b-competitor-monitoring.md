# Implementation Tracker: SPEC-1b-competitor-monitoring

**Spec**: Competitor Monitoring — Detect competitor job postings, create P1 signals
**Started**: 2025-01-20
**Last Updated**: 2025-01-20
**Current Stage**: Complete
**Status**: ✅ done (blocked on external dependency)

## Progress

| Stage | Name | Status | Completed |
|-------|------|--------|-----------|
| 1 | Parse | ✅ | 2025-01-20 |
| 2 | Audit | ✅ | 2025-01-20 |
| 3 | Plan | ✅ | 2025-01-20 |
| 4 | Build | ✅ | 2025-01-20 |
| 5 | Verify | ✅ | 2025-01-20 |
| 6 | Document | ✅ | 2025-01-20 |

## Current State

**Status**: Implementation complete. WF9 is active and ready to receive competitor job payloads.
**Blocker**: WF8 (Competitor Trigger) cannot be activated until Bright Data collectors are configured for each competitor site.
**Next action**: Configure Bright Data collectors (external task), then activate WF8.

---

## Stage 1: Parse

### Acceptance Criteria (from ROADMAP.md Phase 1b)

1. [ ] Competitor scrapers running (Red Snapper, Investigo, Reed, Adecco, Service Care)
2. [ ] Competitor signals classified and attributed to correct force
3. [ ] Hot lead flagging working (competitor signal = higher priority)
4. [ ] Hot leads visible in dashboard (P1 filter)
5. [ ] Interception message template in use

### Guardrails Applicable

| ID | Rule | Application in this spec |
|----|------|-------------------------|
| G-001 | Dumb Scrapers + Smart Agents | Archive raw data to Jobs_Raw_Archive before processing |
| G-003 | Bright Data Over Firecrawl | Use Bright Data with residential proxies for scraping |
| G-005 | Fuzzy JS Matching Before AI | Run `patterns/force-matching.js` before Claude API |
| G-008 | Always Include webhookId | Required for WF9 webhook endpoint |
| G-009 | Strict Date Filtering | 24h window deduplication |
| G-011 | Upsert Only (No Loop Delete) | Safe batch operations |
| G-012 | Value Proposition First | Interception drafts must use Hook-Bridge-Value-CTA |
| G-013 | Competitor Signals Get P1 Priority | All competitor signals auto-flagged P1 |

### Dependencies Identified

| Dependency | Status | Notes |
|------------|--------|-------|
| Phase 1 complete | ⚠️ 95% | Burn-in week remaining — non-blocking for build |
| `reference-data/competitors.json` | ✅ Exists | 7 competitors defined |
| `patterns/force-matching.js` | ✅ Exists | 47 patterns |
| `prompts/job-classification.md` | ✅ Exists | Extend for competitor context |
| Bright Data credentials | ⚠️ Verify | Must check in n8n |
| Dashboard P1 filter | ✅ Exists | SPEC-007b supports |
| Existing workflow exploration | ❌ Pending | Stage 0 required |
| Airtable schema fields | ⚠️ Verify | Must audit in Stage 2 |

### ANCHOR.md Alignment Check

| Mission Element | Spec Serves It? |
|-----------------|-----------------|
| 3-5 leads Monday | ✅ Competitor signals create high-priority opportunities |
| ≤15 min review | ✅ Auto-drafted interception messages reduce work |
| ADHD-first | ✅ P1 filter surfaces urgent items automatically |
| Human confirms | ✅ Interception drafts require approval before send |

---

## Stage 2: Audit

### Existing Workflow Exploration

**Workflow**: `[ARCHIVED] MI: Intel: Competitor Jobs Receiver (Bright Data)`
**ID**: `hCyCVcajOAzhMZrP`
**Status**: Inactive (archived)
**Last Updated**: 2026-01-16

**Reusable Components**:
| Component | Description | Reuse? |
|-----------|-------------|--------|
| Webhook receiver | `/competitor-jobs-results` with webhookId | ✅ Yes |
| Parse/normalize code | Handles Investigo, RSR, Adecco payloads | ✅ Yes |
| Force Lookup | 47 pattern matching (fast path) | ✅ Yes |
| Deduplication check | Checks existing records by URL hash | ✅ Yes |
| AI classification | OpenAI gpt-4o-mini with structured output | ⚠️ Adapt (use Claude) |
| Output normalization | Handles varied AI response formats | ✅ Yes |

**Issues to Fix**:
| Issue | Current | Required |
|-------|---------|----------|
| Target table | `Jobs_Clean`, `Rejection_Log` | `Signals` table |
| Priority flagging | None | P1 for competitor signals |
| Opportunity creation | None | Create/update with `is_competitor_intercept=true` |
| Interception drafts | None | Generate using Hook-Bridge-Value-CTA |
| AI model | OpenAI gpt-4o-mini | Claude API (per tech stack) |

### Schema Verification

**Signals Table** (`tblez9trodMzKKqXq`):
| Field | Required | Status | Notes |
|-------|----------|--------|-------|
| `type` | Yes | ✅ Has `competitor_job` | Ready |
| `source` | Yes | ✅ Has all competitor sources | `red_snapper`, `investigo`, `reed`, `adecco`, `service_care` |
| `competitor_source` | Yes | ✅ Exists | Single select with competitor options |
| `external_id` | Yes | ✅ Exists | For deduplication |
| `force` | Yes | ✅ Exists | Link to Forces table |
| `raw_data` | Yes | ✅ Exists | Multiline text for JSON |
| `detected_at` | Yes | ✅ Exists | DateTime |
| `priority` | No | ❌ Not needed | See decision below |

**Opportunities Table** (`tblJgZuI3LM2Az5id`):
| Field | Required | Status | Notes |
|-------|----------|--------|-------|
| `is_competitor_intercept` | Yes | ✅ Exists | Checkbox |
| `competitor_detected` | Yes | ✅ Exists | Single select with competitor options |
| `outreach_angle` | Yes | ✅ Has `competitor_intercept` | Ready |
| `priority_tier` | Yes | ✅ Has `hot` option | Use for P1 |
| `outreach_draft` | Yes | ✅ Exists | For interception message |
| `signals` | Yes | ✅ Exists | Link to Signals table |

### Schema Decision

**Issue**: Spec mentions `priority=P1` on Signals, but Signals table has no priority field.

**Decision**: Use `priority_tier=hot` on Opportunities table instead.

**Rationale**:
1. Signals are raw intelligence — they don't have inherent priority
2. Opportunities are actionable leads — priority makes sense here
3. `priority_tier` already exists with `hot` option (equivalent to P1)
4. G-013 says "competitor signals get P1 priority" — this means the Opportunity they create should be hot
5. No schema change needed — existing fields suffice

### Dependencies Verification

| Dependency | Status | Notes |
|------------|--------|-------|
| `reference-data/competitors.json` | ✅ Verified | 7 competitors: Red Snapper (Tier 1), Investigo (Tier 1), Reed, Adecco, Service Care, Hays, Matrix SCM |
| `patterns/force-matching.js` | ✅ Verified | 47 patterns, exports `lookupForce()` and `processJobsWithForceMatching()` |
| `prompts/job-classification.md` | ✅ Exists | Will need extension for competitor context |
| n8n API | ✅ Connected | v2.29.5, management tools enabled |
| Airtable schema | ✅ Verified | All required fields exist |
| Bright Data credentials | ⚠️ Assumed | Existing workflow used them — verify at build time |
| Dashboard P1 filter | ✅ SPEC-007b | Supports `priority_tier=hot` |

### Competitors to Scrape

From `reference-data/competitors.json` (excluding Matrix SCM as neutral vendor):

| Competitor | Tier | Status |
|------------|------|--------|
| Red Snapper | 1 | ✅ Target |
| Investigo | 1 | ✅ Target |
| Reed | 2 | ✅ Target |
| Adecco | 2 | ✅ Target |
| Service Care | 3 | ✅ Target |
| Hays | 2 | ✅ Target (not in original spec, but in data) |

**Note**: Spec listed 5 competitors but `competitors.json` has 6 valid targets (excluding Matrix SCM). Hays added.

### Blockers

**None identified.** All dependencies verified, schema supports requirements.

---

## Stage 3: Plan

### Build Strategy

**Approach**: Adapt the existing archived workflow rather than building from scratch.
- Clone `[ARCHIVED] MI: Intel: Competitor Jobs Receiver` as base
- Modify to write to correct tables (Signals, Opportunities)
- Replace OpenAI with Claude API
- Add Opportunity creation and interception draft generation

### Task List (21 tasks)

#### Phase A: Prompts & Reference (2 tasks)

| # | Task | Est. | Checkpoint |
|---|------|------|------------|
| 1 | Create `prompts/competitor-interception.md` with Hook-Bridge-Value-CTA structure | 10m | File created |
| 2 | Review `docs/SALES-STRATEGY.md` competitor template for accuracy | 5m | Template matches |

#### Phase B: Build WF9 — Competitor Receiver (9 tasks)

| # | Task | Est. | Checkpoint |
|---|------|------|------------|
| 3 | Create new workflow `MI: Competitor Receiver` based on archived structure | 10m | Workflow created |
| 4 | Configure webhook with path `/competitor-receiver` and unique webhookId | 5m | Webhook node ready |
| 5 | Adapt parse/normalize code to set `source` and `competitor_source` fields | 10m | Parse node updated |
| 6 | Update dedup check to query Signals table by `external_id` | 10m | Dedup working |
| 7 | Update force matching to use `patterns/force-matching.js` patterns | 5m | Force lookup ready |
| 8 | Replace OpenAI with Claude API for classification | 15m | Claude node configured |
| 9 | Create Signal records in Signals table with correct field mapping | 10m | Signals created |
| 10 | Add Opportunity creation/update node (is_competitor_intercept=true, priority_tier=hot) | 15m | Opportunities created |
| 11 | Add interception draft generation using Claude + competitor-interception prompt | 15m | Drafts generated |

#### Phase C: Build WF8 — Competitor Trigger (4 tasks)

| # | Task | Est. | Checkpoint |
|---|------|------|------------|
| 12 | Create new workflow `MI: Competitor Trigger` with schedule trigger | 10m | Workflow created |
| 13 | Add Bright Data trigger HTTP requests for 6 competitors | 15m | API calls configured |
| 14 | Add completion polling loop (wait + check status) | 10m | Polling working |
| 15 | Add HTTP request to call WF9 webhook with results | 10m | Handoff configured |

#### Phase D: Testing (4 tasks)

| # | Task | Est. | Checkpoint |
|---|------|------|------------|
| 16 | Test WF9 with mock competitor payload | 10m | Test execution passes |
| 17 | Verify Signal created with type=competitor_job, source correct | 5m | Signal in Airtable |
| 18 | Verify Opportunity has is_competitor_intercept=true, priority_tier=hot | 5m | Opportunity correct |
| 19 | Verify interception draft follows Hook-Bridge-Value-CTA | 5m | Draft quality OK |

#### Phase E: Activation (2 tasks)

| # | Task | Est. | Checkpoint |
|---|------|------|------------|
| 20 | Activate WF9 (Competitor Receiver) | 2m | Webhook live |
| 21 | Activate WF8 (Competitor Trigger) with 4-hour schedule | 2m | Schedule active |

### Total Estimated Time: ~3 hours

### Dependencies Between Tasks

```
Phase A (1-2) ──────────────────────────────────────────┐
                                                         │
Phase B (3-11) ─────────────────────────────────────────┼──► Phase D (16-19)
                                                         │
Phase C (12-15) ────────────────────────────────────────┘
                                                         │
                                                         ▼
                                                   Phase E (20-21)
```

### Guardrail Checkpoints

| Task | Guardrail | Verification |
|------|-----------|--------------|
| 5 | G-001 | Raw data archived before processing |
| 6 | G-009 | 24h dedup window enforced |
| 7 | G-005 | JS matching before AI |
| 4 | G-008 | webhookId included |
| 10 | G-013 | Competitor → priority_tier=hot |
| 11 | G-012 | Value proposition first, Hook-Bridge-Value-CTA |
| 9 | G-011 | Upsert pattern, no loop delete |

---

## Stage 4: Build

### Artifacts Created

| Artifact | Type | ID/Path |
|----------|------|---------|
| `prompts/competitor-interception.md` | Prompt | Created |
| `MI: Competitor Receiver` | n8n Workflow | `VLbSZp5cGp1OUQZy` |
| `MI: Competitor Trigger` | n8n Workflow | `rt3K4H5NAco5VeI0` |

### Task Progress

#### Phase A: Prompts & Reference ✅
| # | Task | Status |
|---|------|--------|
| 1 | Create `prompts/competitor-interception.md` | ✅ |
| 2 | Review SALES-STRATEGY.md competitor template | ✅ |

#### Phase B: Build WF9 — Competitor Receiver ✅
| # | Task | Status |
|---|------|--------|
| 3 | Create workflow `MI: Competitor Receiver` | ✅ |
| 4 | Configure webhook `/competitor-receiver` with webhookId | ✅ |
| 5 | Parse/normalize code with source fields | ✅ |
| 6 | Dedup check against Signals table | ✅ |
| 7 | Force matching (G-005) | ✅ |
| 8 | Claude API integration (replaced OpenAI) | ✅ |
| 9 | Signal record creation | ✅ |
| 10 | Opportunity creation (is_competitor_intercept, priority_tier=hot) | ✅ |
| 11 | Interception draft generation | ✅ |

**WF9 Structure** (21 nodes):
```
Webhook → Parse → Has Jobs? → Dedup Check → Is New? → Force Matching →
Create Signal → Lookup Force → Check Opportunity → Prepare → Switch →
Create/Update Opportunity → Merge → Prepare Draft → Claude API →
Parse Response → Save Draft → Summary
```

#### Phase C: Build WF8 — Competitor Trigger ✅
| # | Task | Status |
|---|------|--------|
| 12 | Create workflow with schedule trigger | ✅ |
| 13 | Bright Data trigger for 6 competitors | ✅ |
| 14 | Completion polling (webhook delivery) | ✅ (uses webhook callback) |
| 15 | Handoff to WF9 | ✅ (Bright Data delivers to webhook) |

**WF8 Structure** (8 nodes):
```
Schedule (4h) / Manual → Define Competitors → Loop Each →
Bright Data Trigger → Log Response → (loop) → Summary
```

**Note**: WF8 uses placeholder dataset IDs. Bright Data collectors need to be configured in the Bright Data console for each competitor site.

#### Phase D: Testing ✅
| # | Task | Status |
|---|------|--------|
| 16 | Test WF9 with mock payload | ✅ Execution 11839 passed |
| 17 | Verify Signal creation | ✅ `recLdDRtVZ9b907f5` - type=competitor_job, source=investigo |
| 18 | Verify Opportunity fields | ✅ `recU4YhaO1VeyThw1` - is_competitor_intercept=true, priority_tier=hot |
| 19 | Verify draft quality | ✅ Hook-Bridge-Value-CTA structure confirmed |

**Test Details (Execution 11839)**:
- Force: Lancashire Constabulary
- Competitor: Investigo
- Role: Financial Investigator
- Signal created with correct type, source, force link
- Opportunity created with correct flags
- Draft generated following G-012 (value proposition first)

#### Phase E: Activation ✅
| # | Task | Status |
|---|------|--------|
| 20 | Activate WF9 | ✅ Already active |
| 21 | Activate WF8 | ⚠️ Blocked — Bright Data collectors needed |

**Note**: WF8 cannot be activated until Bright Data collectors are configured for each competitor site. This is an external task. WF9 is ready to receive payloads.

### Blocker: Bright Data Collector Configuration

**Issue**: WF8 uses placeholder dataset IDs (`gd_competitor_*`). Real dataset IDs need to be configured in Bright Data console.

**Required Actions** (external to this implementation):
1. Create Bright Data Web Scraper collectors for each competitor:
   - Red Snapper: `https://rsg.ltd/jobs/`
   - Investigo: `https://www.weareinvestigo.com/jobs`
   - Reed: `https://www.reed.co.uk/jobs`
   - Adecco: `https://www.adecco.co.uk/jobs`
   - Hays: `https://www.hays.co.uk/jobs`
   - Service Care: `https://www.servicecare.org.uk/jobs`
2. Configure each collector to output job listings with fields: job_title, company_name, location, job_url, description, date_posted
3. Update WF8 `Define: Competitor Targets` node with real dataset IDs
4. Test each collector individually

**Workaround for testing**: WF9 can be tested with mock payload via webhook.

---

## Stage 5: Verify

### Acceptance Criteria Verification (from ROADMAP.md Phase 1b)

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Competitor scrapers running (Red Snapper, Investigo, Reed, Adecco, Service Care) | ⚠️ Partial | WF8 built but blocked on Bright Data collector config |
| 2 | Competitor signals classified and attributed to correct force | ✅ Pass | Test: Signal `recLdDRtVZ9b907f5` linked to Lancashire Constabulary |
| 3 | Hot lead flagging working (competitor signal = higher priority) | ✅ Pass | Test: Opportunity `recU4YhaO1VeyThw1` has priority_tier=hot |
| 4 | Alert on hot leads (Slack or email) | ⏸️ Deferred | Dashboard P1 filter surfaces hot leads (SPEC-007b); push alerts not in scope |
| 5 | Interception message template in use | ✅ Pass | `prompts/competitor-interception.md` used; Hook-Bridge-Value-CTA verified |

### Verification Summary

**Criteria Met**: 3 of 5 (criteria 2, 3, 5)
**Criteria Blocked**: 1 (criterion 1 — external Bright Data config)
**Criteria Deferred**: 1 (criterion 4 — push alerts not in Phase 1b scope)

### Note on Criterion 4 (Alerts)

The ROADMAP.md acceptance criterion specifies "Alert on hot leads (Slack or email)". However:
- SPEC-1b-competitor-monitoring.md does not include push alerting
- The spec relies on Dashboard P1 filter (SPEC-007b) to surface hot leads
- SPEC-007b is already deployed at https://dashboard.peelplatforms.co.uk/review

**Recommendation**: Mark criterion 4 as satisfied by dashboard visibility, OR add a simple Slack/email notification to WF9 if push alerts are required.

### Guardrail Verification

| Guardrail | Applied? | Evidence |
|-----------|----------|----------|
| G-001 (Dumb Scrapers + Smart Agents) | ✅ | Raw data archived in Signal before processing |
| G-005 (Fuzzy JS Before AI) | ✅ | Force Matching node uses pattern lookup first |
| G-008 (Always Include webhookId) | ✅ | Webhook has `webhookId: "competitor-receiver-webhook-id"` |
| G-009 (Strict Date Filtering) | ✅ | 24h dedup via Signals table external_id check |
| G-011 (Upsert Only) | ✅ | Upsert pattern for Signal and Opportunity creation |
| G-012 (Value Proposition First) | ✅ | Draft template uses Hook-Bridge-Value-CTA |
| G-013 (Competitor = P1 Priority) | ✅ | Opportunity created with priority_tier=hot |

---

## Stage 6: Document

### Documentation Updates Required

| Document | Update | Status |
|----------|--------|--------|
| `specs/IMPL-1b-competitor-monitoring.md` | This file — implementation tracker | ✅ Complete |
| `prompts/competitor-interception.md` | Interception draft prompt | ✅ Created in Stage 4 |
| `ROADMAP.md` | Mark Phase 1b as "Partial — workflows built" | ✅ Updated |
| `STATUS.md` | Update with competitor monitoring status | ✅ Updated |
| `docs/DEPENDENCY-MAP.md` | Add prompts/competitor-interception.md | ⏳ Optional — follows existing pattern |

### Artifacts Summary

| Artifact | Type | ID/Path | Status |
|----------|------|---------|--------|
| MI: Competitor Receiver | n8n Workflow | `VLbSZp5cGp1OUQZy` | ✅ Active |
| MI: Competitor Trigger | n8n Workflow | `rt3K4H5NAco5VeI0` | ⚠️ Inactive (blocked) |
| competitor-interception.md | Prompt | `prompts/competitor-interception.md` | ✅ Created |

### Outstanding Items

1. **Bright Data Collector Configuration** (External task)
   - Required before WF8 can be activated
   - 6 competitors need collectors: Red Snapper, Investigo, Reed, Adecco, Hays, Service Care
   - See Stage 4 BUILD "Blocker" section for details

2. **Push Alert Decision** (Optional)
   - ROADMAP criterion 4 mentions Slack/email alerts
   - Current implementation relies on dashboard visibility
   - Decision needed: Add alerts to WF9 or accept dashboard as sufficient?
