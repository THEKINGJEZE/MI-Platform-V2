# SPEC-002: Indeed Jobs Ingestion

**Status**: Ready for implementation  
**Phase**: 1 — Core Jobs Pipeline  
**Source of Truth**: `peel-solutions-mi-platform-strategy.md` Section 5.1, Section 10 (Workflow 1.1)

---

## 1. Overview

**Goal**: Automated ingestion of police-related job postings from Indeed UK into the Signals table.

**Expected Outcome**: Every 4 hours, the system scrapes Indeed, deduplicates results, attempts force matching, and creates raw Signal records with `status = new`. Per G-001 (Dumb Scrapers + Smart Agents), this workflow does NOT classify — it only ingests.

---

## 2. Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Schedule   │────▶│  Bright Data │────▶│    Filter    │
│  (4 hours)   │     │  Indeed API  │     │  Job Portal  │
└──────────────┘     └──────────────┘     │   Spam       │
                                          └──────┬───────┘
                                                 │
                     ┌──────────────┐     ┌──────▼───────┐
                     │   Airtable   │◀────│    Force     │
                     │   Signals    │     │   Matching   │
                     │  (upsert)    │     │  (patterns)  │
                     └──────────────┘     └──────────────┘
```

**Data Flow**:
1. Scheduled trigger fires every 4 hours
2. Bright Data API returns Indeed results (24h window per G-009)
3. Job portal filter removes aggregator spam (reference: `patterns/job-portal-filters.js`)
4. Force matching attempts pattern match before AI (per G-005)
5. Deduplicated signals upserted to Airtable (per G-011)

---

## 3. Tables

**Reads from**: None (external API only)

**Writes to**: 
- `Signals` table (`tblez9trodMzKKqXq`)

**Field mapping for Signal creation**:

| Airtable Field | Source | Notes |
|----------------|--------|-------|
| `type` | `"job_posting"` | Hardcoded |
| `source` | `"indeed"` | Hardcoded |
| `title` | `job.title` | From Bright Data |
| `url` | `job.url` | From Bright Data |
| `external_id` | Hash of URL | For deduplication |
| `raw_data` | Full job JSON | Preserves all scraped data |
| `force` | Force record ID | If pattern match succeeds |
| `status` | `"new"` | Ready for classification |
| `detected_at` | Current timestamp | When ingested |

---

## 4. Workflows

### Workflow: `MI: Jobs Ingestion`

**Trigger**: Schedule — every 4 hours (08:00, 12:00, 16:00, 20:00 UK time)

#### Node 1: Trigger Bright Data Snapshot

**Type**: HTTP Request  
**Guardrail**: G-003 (Bright Data Over Firecrawl)

```
POST https://api.brightdata.com/datasets/v3/trigger
Headers: Authorization: Bearer {{$credentials.brightdata}}
Body: {
  "dataset_id": "gd_l4dx9j9sscpvs7no2",
  "include_errors": false,
  "format": "json"
}
```

Reference: `patterns/indeed-keywords.json` for dataset ID and keyword configuration.

#### Node 2: Poll for Completion

**Type**: HTTP Request + Wait (loop)  
**Guardrail**: G-009 (Strict Date Filtering — 24h window configured in Bright Data)

```
GET https://api.brightdata.com/datasets/v3/progress/{{snapshot_id}}
```

Poll every 30 seconds, max 10 attempts. Exit when `status = ready`.

#### Node 3: Fetch Results

**Type**: HTTP Request

```
GET https://api.brightdata.com/datasets/v3/snapshot/{{snapshot_id}}
```

#### Node 4: Filter Job Portal Spam

**Type**: Code  
**Guardrail**: G-010 (Job Portal Filters)

```javascript
// Reference: patterns/job-portal-filters.js
const filters = require('./patterns/job-portal-filters.js');
return items.filter(job => !filters.isSpam(job));
```

#### Node 5: Force Matching

**Type**: Code  
**Guardrail**: G-005 (Fuzzy JS Matching Before AI)

```javascript
// Reference: patterns/force-matching.js
const { matchForce } = require('./patterns/force-matching.js');

return items.map(job => {
  const match = matchForce(job.company, job.location);
  return {
    ...job,
    force_id: match?.force_id || null,
    force_confidence: match?.confidence || 0
  };
});
```

Only link to Forces table if `confidence >= 0.8`. Otherwise leave null for classification workflow.

#### Node 6: Dedupe Check

**Type**: Airtable Search  
**Guardrail**: G-011 (Upsert Only)

For each job, check if `external_id` already exists in Signals table. Skip if found.

#### Node 7: Create Signals

**Type**: Airtable Create Records (batch)  
**Guardrail**: G-011 (Upsert Only — no duplicates)

Batch in groups of 10 with 200ms delay to respect rate limits (per `.claude/rules/airtable.md`).

#### Node 8: Log Completion

**Type**: Code  
**Guardrail**: A5 (Hook-Based Session Management)

Log execution summary:
- `jobs_fetched`: Total from Bright Data
- `jobs_filtered`: After spam removal
- `jobs_created`: New signals created
- `jobs_skipped`: Duplicates skipped
- `duration_ms`: Total execution time

---

## 5. Testing Plan

| Test | Method | Expected Result |
|------|--------|-----------------|
| Bright Data connection | Manual trigger | Returns JSON array of jobs |
| Spam filter | Run with known spam URLs | Aggregator jobs excluded |
| Force matching | Test with "Hampshire Police" | Links to Hampshire Constabulary |
| Deduplication | Run twice with same data | Second run creates 0 records |
| Full flow | End-to-end run | Signals appear with `status = new` |

**Test data**: Use a single manual Bright Data trigger with live data. Do not mock — we need real Indeed results to validate the pipeline.

---

## 6. Acceptance Criteria

From ROADMAP.md Phase 1:

- [ ] Indeed ingestion workflow running (scheduled, every 4 hours)
- [ ] Signals created with `status = new`
- [ ] No duplicate signals (external_id enforced)
- [ ] Force matching attempted before classification
- [ ] Execution completes in < 2 minutes
- [ ] No manual intervention required

---

## 7. Build Sequence

1. **Verify prerequisites**
   - Bright Data credentials in n8n
   - Airtable API key configured
   - Table IDs confirmed from `table-ids.json`

2. **Build workflow nodes** (in order)
   - Schedule trigger
   - Bright Data trigger → poll → fetch
   - Filter node (import `job-portal-filters.js`)
   - Force matching node (import `force-matching.js`)
   - Dedupe check
   - Airtable create
   - Logging

3. **Test incrementally**
   - Test Bright Data connection alone
   - Add filter, verify output
   - Add force matching, verify links
   - Add Airtable write, verify records

4. **Enable schedule**
   - Activate workflow
   - Monitor first 2-3 runs

---

## 8. Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| SPEC-001: Airtable Schema | ✅ Complete | Signals + Forces tables exist |
| `patterns/force-matching.js` | ✅ Exists | 47 fuzzy patterns |
| `patterns/indeed-keywords.json` | ✅ Exists | 30 keywords, dataset ID |
| `patterns/job-portal-filters.js` | ✅ Exists | Spam filtering regex |
| Bright Data credentials | ⚠️ Verify | Must be configured in n8n |
| n8n instance | ⚠️ Verify | Self-hosted, accessible |

---

## Files to Create/Update

| File | Action |
|------|--------|
| `n8n/workflows/jobs-ingestion.json` | Create — workflow export |
| `STATUS.md` | Update — mark SPEC-002 in progress/complete |

---

## Out of Scope

These are separate specs:
- Signal classification (SPEC-003)
- Opportunity creation from signals (SPEC-004)
- Competitor job ingestion (SPEC-005)

---

## Handoff to Claude Code

**Context**: First data pipeline — brings jobs into the system for classification

**Key references**:
- Table IDs: `.claude/skills/airtable-schema/table-ids.json`
- Force matching: `patterns/force-matching.js`
- Keywords: `patterns/indeed-keywords.json`
- Filters: `patterns/job-portal-filters.js`
- n8n rules: `.claude/rules/n8n.md`

**Workflow naming**: `MI: Jobs Ingestion`

**On completion**: Update STATUS.md, verify first scheduled run succeeds
