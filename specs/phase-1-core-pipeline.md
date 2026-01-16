# Phase 1: Core Jobs Pipeline

## Overview

**Goal**: Indeed jobs flow through to ready-to-send opportunities

**Outcome**: Every Monday morning, James opens the dashboard and sees 3-5 classified job opportunities with draft messages ready to review and send.

**Duration**: ~4 weeks

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PHASE 1 DATA FLOW                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   [Bright Data]                                                     │
│        │                                                            │
│        │ Webhook (every 4h)                                         │
│        ▼                                                            │
│   ┌─────────────────┐                                               │
│   │  WF1: Ingestion │                                               │
│   │   (MI: Jobs     │                                               │
│   │    Ingestion)   │                                               │
│   └────────┬────────┘                                               │
│            │                                                        │
│            ▼                                                        │
│   [Jobs_Raw_Archive] ←─── 100% raw, no filtering (G-001)            │
│            │                                                        │
│            │ Trigger: New record                                    │
│            ▼                                                        │
│   ┌─────────────────┐                                               │
│   │ WF2: Classifier │                                               │
│   │  (MI: Jobs      │                                               │
│   │   Classifier)   │                                               │
│   └────────┬────────┘                                               │
│            │                                                        │
│            ├──► JS Force Match (G-005) ──► 85% resolved instantly   │
│            │                                                        │
│            ├──► Claude AI ──► 15% need AI classification            │
│            │                                                        │
│            ▼                                                        │
│   [Signals] ←─── Classified, force-linked, scored                   │
│            │                                                        │
│            │ Filter: relevance_score > 70                           │
│            ▼                                                        │
│   ┌─────────────────┐                                               │
│   │ WF3: Opportunity│                                               │
│   │  Creator        │                                               │
│   │ (MI: Opp        │                                               │
│   │  Creator)       │                                               │
│   └────────┬────────┘                                               │
│            │                                                        │
│            ▼                                                        │
│   [Opportunities] ←─── Actionable leads                             │
│            │                                                        │
│            │ Trigger: New opportunity                               │
│            ▼                                                        │
│   ┌─────────────────┐                                               │
│   │ WF4: Enrichment │                                               │
│   │  (MI: Opp       │                                               │
│   │   Enricher)     │                                               │
│   └────────┬────────┘                                               │
│            │                                                        │
│            ├──► Contact lookup (from Contacts table)                │
│            ├──► Message drafting (Claude AI)                        │
│            ├──► Priority scoring                                    │
│            │                                                        │
│            ▼                                                        │
│   [Outreach] ←─── Draft messages ready for review                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   MONDAY DASHBOARD    │
                    │   "5 leads ready"     │
                    └───────────────────────┘
```

---

## Airtable Tables Required

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| Forces | UK police forces (48) | name, region, size, relationship_status |
| Jobs_Raw_Archive | Raw Indeed data | source_url, title, company_name, description, detected_at |
| Signals | Classified signals | source, title, force→, relevance_score, classification |
| Opportunities | Actionable leads | force→, signals→, status, priority, opportunity_type |
| Contacts | Decision-makers | name, title, email, force→ |
| Outreach | Draft messages | opportunity→, contact→, body, status |

### System Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| System_Logs | Workflow execution logs | workflow_name, execution_id, event_type, timestamp |
| System_Health | Daily metrics | workflow_name, date, success_rate, records_processed |

---

## Workflows to Build

### WF1: MI: Jobs Ingestion

**Trigger**: Webhook from Bright Data (every 4 hours)

**Input**: Array of job objects from Indeed scraper

**Process**:
1. Receive Bright Data webhook payload
2. Apply strict 24h date filter (G-009)
3. Deduplicate by source_url
4. Insert ALL jobs into Jobs_Raw_Archive (G-001 - no filtering)
5. Log start/end to System_Logs

**Output**: Records in Jobs_Raw_Archive

**Guardrails**: G-001 (dumb scraper), G-008 (webhookId), G-009 (date filter), G-011 (upsert)

**File**: `n8n/workflows/mi-jobs-ingestion.json`

---

### WF2: MI: Jobs Classifier

**Trigger**: New record in Jobs_Raw_Archive

**Input**: Single job record

**Process**:
1. Run JS force matching first (G-005) using `patterns/force-matching.js`
2. If force matched: Mark as `force_matched_by: pattern`, skip AI
3. If no match: Send to Claude API with `prompts/job-classification.md`
4. Parse AI response (relevance, confidence, force, role_type)
5. Create record in Signals table if relevance_score > threshold
6. Update Jobs_Raw_Archive with `processed_at`, `signal_created`
7. Log to System_Logs

**Output**: Records in Signals table

**Guardrails**: G-005 (JS before AI), G-001 (archive first)

**File**: `n8n/workflows/mi-jobs-classifier.json`

---

### WF3: MI: Opportunity Creator

**Trigger**: New Signal with relevance_score > 70

**Input**: Signal record

**Process**:
1. Check if opportunity already exists for this force + timeframe
2. If exists: Link signal to existing opportunity
3. If not: Create new opportunity
4. Set initial priority based on signal strength
5. Log to System_Logs

**Output**: Records in Opportunities table

**Guardrails**: G-011 (upsert pattern)

**File**: `n8n/workflows/mi-opportunity-creator.json`

---

### WF4: MI: Opportunity Enricher

**Trigger**: New Opportunity created

**Input**: Opportunity record

**Process**:
1. Lookup contact for force (from Contacts table)
2. If no contact: Flag for manual research
3. Draft outreach message using Claude AI
4. Create Outreach record with draft
5. Calculate final priority score
6. Update opportunity status to "Ready for Review"
7. Log to System_Logs

**Output**: Records in Outreach table, updated Opportunity

**Guardrails**: G-002 (command queue for emails - outreach is the queue)

**File**: `n8n/workflows/mi-opportunity-enricher.json`

---

## Data Sources

### Indeed (via Bright Data)

**Dataset ID**: `gd_l4dx9j9sscpvs7no2`

**Keywords**: 30 search terms across 6 categories (see `patterns/indeed-keywords.json`)

**Filters**:
- Time: Last 24 hours
- Location: United Kingdom
- Date posted filter must be applied

**Schedule**: Every 4 hours (6x daily)

**Expected Volume**: ~50-200 jobs per run, ~300-1000 per day before filtering

---

## Classification Logic

### Force Matching (JS - First Pass)

Use `patterns/force-matching.js` with 47 patterns:
- Covers all 43 territorial forces + 5 national agencies
- Matches company name variations, abbreviations
- ~85% hit rate for direct police force employers

### AI Classification (Second Pass)

Use `prompts/job-classification.md` for:
- Agency job postings (Red Snapper, Matrix SCM, etc.)
- Ambiguous employers
- Complex role descriptions

**Model**: Claude (via n8n Anthropic node)

**Output Schema**:
```json
{
  "relevant": true,
  "confidence": 85,
  "reasoning": "Direct police employer...",
  "force": "Metropolitan Police Service",
  "force_confidence": 95,
  "rejection_reason": null,
  "role_type": "Investigation"
}
```

### Scoring Thresholds

| Score | Action |
|-------|--------|
| >70% | Auto-create opportunity |
| 50-70% | Create signal, flag for review |
| <50% | Archive only, no signal |

---

## Testing Plan

### Unit Tests

1. **Force matching**: Test all 47 patterns against known inputs
2. **Classification prompt**: Test with 10 sample jobs (mix of relevant/irrelevant)
3. **Webhook handling**: Verify payload parsing, deduplication

### Integration Tests

1. **End-to-end (fake job)**:
   - Create fake job in Jobs_Raw_Archive
   - Verify Signal created
   - Verify Opportunity created
   - Verify Outreach draft created

2. **Deduplication**:
   - Send same job twice
   - Verify only one Signal created

3. **Error handling**:
   - Send malformed webhook payload
   - Verify graceful failure, System_Logs entry

### Production Smoke Test

After deployment, manually:
1. Check Jobs_Raw_Archive has new records
2. Check Signals table has classified records
3. Check Opportunities table has actionable leads
4. Review one opportunity in dashboard

---

## Acceptance Criteria

From [ROADMAP.md](../ROADMAP.md):

- [ ] Airtable base created with schema (Signals, Opportunities, Forces, Contacts)
- [ ] 46 UK police forces seeded in Forces table
- [ ] Indeed ingestion workflow running (scheduled, every 4 hours)
- [ ] Signal classification working (Claude API, >90% accuracy)
- [ ] Opportunities created from relevant signals
- [ ] Basic enrichment working (contact lookup, message draft)
- [ ] Can review opportunity and mark as sent
- [ ] End-to-end test: fake job → classified → opportunity → reviewed

---

## Build Sequence

1. **Verify/Create Airtable schema**
   - Confirm tables exist with correct fields
   - Seed forces if not already done
   - Create System_Logs and System_Health tables

2. **Build WF1: Jobs Ingestion**
   - Simple webhook receiver
   - Test with manual payload

3. **Build WF2: Jobs Classifier**
   - Test JS force matching
   - Test Claude classification
   - Connect to WF1 via Airtable trigger

4. **Build WF3: Opportunity Creator**
   - Filtering logic
   - Opportunity creation/linking

5. **Build WF4: Opportunity Enricher**
   - Contact lookup
   - Message drafting
   - Priority calculation

6. **End-to-end testing**
   - Full flow test
   - Error scenarios
   - Performance check

7. **Production deployment**
   - Activate workflows
   - Monitor for 24h
   - First Monday review

---

## Dependencies

- **Bright Data account** with active Indeed dataset
- **Airtable base** with schema (see above)
- **Claude API key** for classification
- **n8n instance** (self-hosted, per G-004)

---

## References

- `patterns/force-matching.js` — Force identification patterns
- `patterns/indeed-keywords.json` — Search keywords
- `prompts/job-classification.md` — Classification prompt
- `reference-data/uk-police-forces.json` — 48 official forces
- `docs/GUARDRAILS.md` — Architectural rules

---

*Last updated: 16 January 2025*
