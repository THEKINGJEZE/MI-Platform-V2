# MI Platform — Quality Improvement Plan

**Created**: 21 January 2025  
**Source**: Claude Code plan after GPT audit review  
**Status**: ✅ Phases 1-4 implemented, pending deployment & testing

---

## Implementation Status (21 Jan 2025)

| Phase | Status | Notes |
|-------|--------|-------|
| 1: Classification | ✅ Complete | Gate logic, prompt, schema fields all updated |
| 1b: Deduplication | ✅ Complete | Upsert logic in jobs-receiver and WF9 |
| 2: Opportunity Creator | ✅ Complete | Competitor flag now set correctly |
| 3: Enrichment | ✅ Complete | Signal fetch + P1 guardrail added |
| 4: Data Cleanup | ✅ Scripts created | Ready for dry-run |
| 5: Agentic Enrichment | ✅ Spec written | `specs/SPEC-011-agent-enrichment.md` (supersedes SPEC-010) |

**Next steps**: Deploy workflows to n8n, run cleanup scripts, test end-to-end, monitor for 1 week.

---

## Context

Three ChatGPT models (5.2, 5.2 Pro, 5.2 Research) audited the Signals and Opportunities tables against STRATEGY.md and SALES-STRATEGY.md. All three converged on the same critical issues.

**Consensus Quality Score**: 3/10  
**Signal Classification Accuracy**: ~20-25%  
**Useful Opportunity Summaries**: ~15-20%

Claude Code verified findings by examining actual workflow code, identifying specific root causes.

---

## Verified Findings

### Classification Issues (CRITICAL)

| Issue | Root Cause | Impact |
|-------|-----------|--------|
| Gate logic broken | Uses `confidence >= 70` instead of `relevant` boolean | 80% false positive rate |
| role_type discarded | AI extracts it but WF3 doesn't write to Airtable | Can't filter sworn officers |
| Force extraction fails for competitors | Pattern matching only; AI fallback output ignored | 93% competitor signals have no force |
| No hard gates | Prompt lacks explicit exclusion criteria | Irrelevant roles (IT, probation, finance) pass through |

### Opportunity Issues (CRITICAL)

| Issue | Root Cause | Impact |
|-------|-----------|--------|
| is_competitor_intercept never set | WF4 doesn't set this flag | Can't identify competitor leads |
| No P1 guardrail | WF5 doesn't enforce hot for competitors | 78% competitor opps not flagged hot |
| Generic summaries | WF5 doesn't fetch signal details for AI | AI has no context, produces boilerplate |
| Multiple opps per force | Batch timing issues in WF4 | 13/30 forces have duplicate opps |

### Ingestion Issues (CRITICAL)

| Issue | Root Cause | Impact |
|-------|-----------|--------|
| 37-53% duplicate signals | Insert-only logic, no upsert | Same job creates multiple signals each scrape |
| No lifecycle tracking | Missing first_seen/last_seen fields | Can't track job persistence or detect re-posts |
| Competitor listing URLs | Bright Data stores listing page not job detail | No stable job ID, can't dedupe, can't extract force |

### Schema Gaps

| Field | Status | Action |
|-------|--------|--------|
| role_type on Signals | Missing | Add field |
| seniority on Signals | Missing | Add field |
| first_seen/last_seen | Missing | Add fields (for dedup tracking) |
| expires_at | Exists | Already in schema |
| created_at/updated_at on Opps | Exists | Already in schema |

---

## Implementation Plan

### Phase 1: Fix Classification (WF3) — Highest Priority

**Goal**: Reduce false positive rate from ~80% to <10%

#### 1.1 Fix Gate Logic

**File**: `n8n/workflows/jobs-classifier.json`  
**Node**: "Code: Derive Status" (~line 161)

Current:
```javascript
const status = confidence >= 70 ? 'relevant' : 'irrelevant';
```

Fix:
```javascript
// Use the AI's relevance determination, NOT just confidence
const status = aiResponse.relevant === true ? 'relevant' : 'irrelevant';
```

#### 1.2 Add Hard Gates to Classification Prompt

**File**: `prompts/job-classification.md`

Add explicit exclusion rules:
- Sworn officer roles (Detective Constable, Police Constable, Sergeant, PCSO)
- Non-police orgs (NHS, Environment Agency, Probation Service, IOPC)
- Out-of-scope roles (IT, Finance, HR, Admin, Volunteer)

Add required output validation:
- role_type MUST be one of: investigator, disclosure, case_handler, analyst, review, other
- If role_type = "other" AND employer not a police force → relevant: false

#### 1.3 Use AI Force Extraction as Fallback

**File**: `n8n/workflows/jobs-classifier.json`  
**Node**: Airtable update (~line 188)

Current: Only uses pattern-matched force ID  
Fix: If pattern match fails, use AI-extracted force name, look up in Forces table

#### 1.4 Add Schema Fields

**Action**: Add to Signals table via Airtable MCP
- role_type (Single Select: investigator, disclosure, case_handler, analyst, review, other)
- seniority (Single Select: director, head, manager, officer, unknown)
- ai_confidence (Number)
- force_source (Single Select: pattern, ai, manual)

#### 1.5 Write Extracted Fields to Airtable

**File**: `n8n/workflows/jobs-classifier.json`  
**Node**: Airtable update

Add fields to update payload:
```javascript
{
  "role_type": aiResponse.role_type,
  "seniority": aiResponse.seniority,
  "ai_confidence": aiResponse.confidence,
  "force_source": patternMatched ? 'pattern' : (aiResponse.force ? 'ai' : null)
}
```

---

### Phase 1b: Fix Deduplication (WF1/WF2/WF9)

**Goal**: Eliminate duplicate signals (currently 37-53% of all signals)

#### 1b.1 Add Lifecycle Fields to Schema

**Action**: Add to Signals table via Airtable MCP
- first_seen (DateTime) — When signal was first detected
- last_seen (DateTime) — When signal was last seen in scrape
- scrape_count (Number) — How many times seen (optional, for analytics)

#### 1b.2 Change Ingestion to Upsert

**Files**:
- `n8n/workflows/jobs-ingestion.json` (WF1/WF2 for Indeed)
- `n8n/workflows/competitor-receiver.json` (WF9 for competitors)

Current: Insert new record for each scraped job  
Fix: Upsert on canonical key (source, external_id)

```javascript
// Before creating signal, check if exists
const existingSignal = await airtable.filterByFormula(
  `AND({source}="${source}", {external_id}="${externalId}")`
);

if (existingSignal) {
  // UPDATE: Just bump last_seen timestamp
  await airtable.update(existingSignal.id, {
    last_seen: new Date().toISOString(),
    scrape_count: (existingSignal.scrape_count || 1) + 1
  });
} else {
  // INSERT: New signal with first_seen = last_seen = now
  await airtable.create({
    ...signalData,
    first_seen: new Date().toISOString(),
    last_seen: new Date().toISOString(),
    scrape_count: 1
  });
}
```

#### 1b.3 Add Expiry Detection

Logic: If a signal hasn't been seen in 30 days (last_seen > 30 days ago), set expires_at and mark as stale.

---

### Phase 2: Fix Opportunity Creator (WF4)

**Goal**: Ensure 1 opportunity per force, properly flagged

#### 2.1 Set is_competitor_intercept Flag

**File**: `n8n/workflows/opportunity-creator.json`  
**Node**: Create/Update Opportunity

```javascript
const isCompetitor = signals.some(s => s.type === 'competitor_job');
fields.is_competitor_intercept = isCompetitor;
```

#### 2.2 Improve Opportunity Lookup

**File**: `n8n/workflows/opportunity-creator.json`  
**Node**: Search existing opportunity

Ensure filter correctly finds existing open opportunity:
```
AND(
  {force} = "FORCE_ID",
  NOT(OR({status}="won", {status}="lost", {status}="dormant", {status}="sent"))
)
```

#### 2.3 Add Consolidation Check

Add validation: If >1 open opportunity exists for a force, merge them before proceeding.

---

### Phase 3: Fix Enrichment (WF5)

**Goal**: Generate specific, signal-grounded summaries; enforce P1 for competitors

#### 3.1 Add Signal Fetch Step

**File**: `n8n/workflows/opportunity-enricher.json`

Insert new node after "Extract IDs":
- Fetch full signal records using signal_ids from opportunity
- Extract: title, type, source, detected_at, role_type

#### 3.2 Build Rich AI Context

**File**: `n8n/workflows/opportunity-enricher.json`  
**Node**: "Build AI Context"

```javascript
const signalSummary = signals.map(s =>
  `- ${s.title} (${s.role_type || s.type}, ${s.source}, detected ${s.detected_at})`
).join('\n');
```

#### 3.3 Add P1 Guardrail

**File**: `n8n/workflows/opportunity-enricher.json`  
**Node**: "Parse AI Response"

```javascript
// GUARDRAIL G-013: Competitor intercepts ALWAYS P1/Hot
if (isCompetitorIntercept) {
  score = Math.max(score, 90);
  tier = 'hot';
}
```

#### 3.4 Improve Enrichment Prompt

**File**: `prompts/opportunity-enrichment.md`

Update to require:
- Summary MUST reference actual signal titles
- Talking points MUST be force-specific (use force context)
- Hook MUST cite the triggering signal(s)
- If competitor intercept, use competitor angle per SALES-STRATEGY

---

### Phase 4: Data Cleanup

**Goal**: Fix existing bad data before new pipeline processes more

#### 4.1 Reclassify Irrelevant Signals

Run script to update signals where:
- relevance_reason contains "not a police force" → status = 'irrelevant'
- title contains sworn officer keywords → status = 'irrelevant'

#### 4.2 Merge Duplicate Opportunities

For each force with >1 open opportunity:
- Keep the oldest (most signals)
- Merge signals from others into it
- Archive/delete the duplicates

#### 4.3 Recompute Priority Tiers

For all opportunities with competitor signals:
- Set is_competitor_intercept = true
- Set priority_tier = 'hot'

---

### Phase 5: Agentic Enrichment Workflow (SPEC-010)

**Goal**: Replace sequential enrichment with intelligent agentic workflow

After core pipeline is fixed, implement:

#### 5.1 Agentic Architecture

```
[Opportunity Ready]
    → [Contact Research Agent]
        → Search LinkedIn, Force website, news
        → Return: contact candidates with confidence scores
    → [Message Drafting Agent]
        → Use SALES-STRATEGY templates
        → Personalize based on signal context
        → Return: draft_subject, draft_body
    → [Quality Check Agent]
        → Verify message follows Hook→Bridge→Value→CTA structure
        → Check for policy violations
        → Return: approved or revision needed
    → [Human Review Queue]
```

#### 5.2 Key Features

- Autonomous contact discovery (LinkedIn, force websites)
- Multi-step reasoning for message personalization
- Quality gates before human review
- Tool use: web search, Airtable lookup, LinkedIn API

---

## Execution Sequence

| Step | Phase | Task | Files Modified | Est. Effort |
|------|-------|------|----------------|-------------|
| 1 | 1 | Fix classification gate logic | jobs-classifier.json | 30 min |
| 2 | 1 | Update classification prompt | job-classification.md | 1 hour |
| 3 | 1 | Add AI force fallback | jobs-classifier.json | 30 min |
| 4 | 1 | Add schema fields (role_type, seniority, etc.) | Airtable MCP | 30 min |
| 5 | 1 | Write extracted fields to Airtable | jobs-classifier.json | 30 min |
| 6 | 1b | Add lifecycle fields (first_seen, last_seen) | Airtable MCP | 15 min |
| 7 | 1b | Implement upsert in Indeed ingestion | jobs-ingestion.json | 1 hour |
| 8 | 1b | Implement upsert in competitor receiver | competitor-receiver.json | 1 hour |
| 9 | 2 | Fix WF4 competitor flag | opportunity-creator.json | 30 min |
| 10 | 2 | Improve opportunity lookup/consolidation | opportunity-creator.json | 30 min |
| 11 | 3 | Add signal fetch to WF5 | opportunity-enricher.json | 1 hour |
| 12 | 3 | Add P1 guardrail to WF5 | opportunity-enricher.json | 30 min |
| 13 | 3 | Update enrichment prompt | opportunity-enrichment.md | 1 hour |
| 14 | 4 | Data cleanup script | scripts/cleanup-signals.js | 1 hour |
| 15 | 4 | Test end-to-end | Manual testing | 1 hour |
| 16 | 5 | Design agentic workflow spec | SPEC-010 | 2 hours |
| 17 | 5 | Implement agentic workflow | n8n workflow | 4+ hours |

**Total estimated effort**: ~15 hours

---

## Success Criteria

### After Phase 1-4 (Core Fixes)

- [ ] False positive rate < 10% (from ~80%)
- [ ] Duplicate signals < 5% (from 37-53%)
- [ ] New scrapes update existing signals (upsert working)
- [ ] Competitor signals with force linked: maintain ~7% (limited by Bright Data)
- [ ] Competitor opportunities flagged P1/Hot = 100% (from 22%)
- [ ] Summaries reference actual signal titles > 90%
- [ ] 1 opportunity per force (no duplicates)

### After Phase 5 (Agentic)

- [ ] Contact research automated (reduces manual lookup)
- [ ] Message drafts follow SALES-STRATEGY structure
- [ ] Quality gates catch policy violations
- [ ] Monday review time ≤ 15 min for 5 opportunities

---

## Files to Modify

### Workflows
- `n8n/workflows/jobs-ingestion.json` (WF1/WF2 — dedup)
- `n8n/workflows/jobs-classifier.json` (WF3 — classification)
- `n8n/workflows/opportunity-creator.json` (WF4 — consolidation)
- `n8n/workflows/opportunity-enricher.json` (WF5 — enrichment)
- `n8n/workflows/competitor-receiver.json` (WF9 — competitor dedup)

### Prompts
- `prompts/job-classification.md`
- `prompts/opportunity-enrichment.md`

### Schema
- Signals table: Add role_type, seniority, ai_confidence, force_source, first_seen, last_seen, scrape_count

### Scripts (New)
- `scripts/cleanup-signals.js` — Reclassify bad signals
- `scripts/merge-opportunities.js` — Consolidate duplicates

### Specs (New)
- `specs/SPEC-011-agent-enrichment.md` — Agentic workflow specification (supersedes SPEC-010)

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking existing workflow | Test in dev instance first; keep backup of current JSON |
| AI changes behavior unexpectedly | Add validation gates; log AI responses for audit |
| Schema changes break dashboard | Dashboard reads from same fields; only adding new ones |
| Data cleanup deletes good data | Archive (don't delete); review before merging opps |

---

## Backlog: Bright Data Scraper Fixes

**Issue**: 93% of competitor signals use listing URLs (e.g., `weareinvestigo.com/jobs`) not job detail URLs.

**Impact**:
- No stable job ID for deduplication
- No job description text for AI to extract force from
- Pattern matching has nothing to match

**Root Cause**: Bright Data collector configuration issue, not n8n workflow issue.

**Required Changes** (separate work item):
1. Update Bright Data collectors to scrape individual job detail pages
2. Extract stable job reference/ID from page
3. Store job description text for AI processing
4. Store source_url = job detail URL (not listing URL)
5. Store external_id = stable job reference

**Collectors**:
- Investigo: `c_mkeaif24wc2xinpo6`
- Red Snapper: `c_mke54t691ndre24s37`

**Status**: BACKLOG — Does not block Phases 1-5. Prioritize after core pipeline fixes are validated.

---

## Audit Reports

Full audit reports from ChatGPT models saved in: `docs/archive/audits-2025-01-21/`
- `MI_Platform_Audit_Report.md` (GPT 5.2)
- `MI_Platform_Detailed_Audit_Findings.md` (GPT 5.2 Pro)
- `Market_Intelligence_Platform_Quality_Audit.md` (GPT 5.2 Research)

---

*Last updated: 21 January 2025*
