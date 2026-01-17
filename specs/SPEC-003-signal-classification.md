# SPEC-003: Signal Classification

**Status**: Ready for implementation  
**Phase**: 1 — Core Jobs Pipeline  
**Source of Truth**: `peel-solutions-mi-platform-strategy.md` Section 7 (Stage 2: CLASSIFY), Section 10 (Workflow 2.1), Section 12.1

---

## 1. Overview

**Goal**: Classify signals created by the Jobs Receiver to determine relevance to Peel Solutions.

**Expected Outcome**: Signals with `status = new` are processed through OpenAI classification. Each signal is updated with a relevance score, reasoning, and binary status (`relevant` or `irrelevant`). Forces are linked where confidently identified. Per 95/5 principle, classification is fully automated with no manual review tier.

---

## 2. Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Airtable    │────▶│    Force     │────▶│   OpenAI     │
│  Signals     │     │   Matching   │     │  gpt-4o-mini │
│  (new)       │     │  (patterns)  │     │  Classify    │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                 │
                     ┌──────────────┐     ┌──────▼───────┐
                     │   Trigger    │◀────│   Airtable   │
                     │   Opp Create │     │   Update     │
                     │   (if rel.)  │     │   Signal     │
                     └──────────────┘     └──────────────┘
```

**Data Flow**:
1. Workflow fetches signals with `status = new`
2. Force matching runs first **(G-005: JS before AI)**
3. OpenAI classifies remaining ambiguity
4. Signal updated with score, reasoning, status, force link
5. If relevant, triggers opportunity creation workflow (SPEC-004)

---

## 3. Tables

**Reads from**: `Signals` table (`tblez9trodMzKKqXq`)  
**Writes to**: `Signals` table (same — updates existing records)  
**Lookups**: `Forces` table (`tblbAjBEdpv42Smpw`) for force linking

**Field updates per signal**:

| Airtable Field | Source | Notes |
|----------------|--------|-------|
| `relevance_score` | `response.confidence` | 0-100 from OpenAI |
| `relevance_reason` | `response.reasoning` | AI explanation |
| `status` | Derived from score | `relevant` (≥70) or `irrelevant` (<70) |
| `force` | Force record ID | If matched with confidence ≥80% |

**Status thresholds** (binary per strategy):

| Score | Status |
|-------|--------|
| ≥70 | `relevant` |
| <70 | `irrelevant` |

---

## 4. Workflows

### Workflow: `MI: Jobs Classifier`

**Trigger**: Schedule — every 15 minutes (processes batch of unclassified signals)

#### Node 1: Fetch Unclassified Signals

**Type**: Airtable Search  

```
Table: Signals
Filter: status = "new"
Max Records: 20
Sort: detected_at ASC (oldest first)
```

If no records returned, exit workflow early.

#### Node 2: Force Pattern Matching

**Type**: Code  
**Guardrail**: G-005 (Fuzzy JS Matching Before AI)

```javascript
// Reference: patterns/force-matching.js
const { matchForce } = require('./patterns/force-matching.js');

return items.map(signal => {
  const rawData = JSON.parse(signal.raw_data);
  const match = matchForce(rawData.company_name, rawData.location);
  return {
    ...signal,
    force_match: {
      force_id: match?.force_id || null,
      confidence: match?.confidence || 0
    },
    company_name: rawData.company_name,
    location: rawData.location,
    description_text: rawData.description_text || rawData.description
  };
});
```

Attaches `force_match` object to each signal. If confidence ≥0.8, force is pre-identified.

#### Node 3: OpenAI Classification

**Type**: HTTP Request (OpenAI API) or n8n OpenAI node  
**Model**: `gpt-4o-mini` (credentials already configured in n8n)  
**Prompt**: `prompts/job-classification.md`

```
POST https://api.openai.com/v1/chat/completions
Headers: 
  Authorization: Bearer {{$credentials.openai}}
  Content-Type: application/json
Body: {
  "model": "gpt-4o-mini",
  "messages": [
    {"role": "system", "content": "You are a Jobs Screening Agent for UK Police sector recruitment intelligence."},
    {"role": "user", "content": "<populated from prompts/job-classification.md>"}
  ],
  "response_format": {"type": "json_object"}
}
```

For each signal, populate prompt with:
- `job_title`: signal.title
- `company_name`: from raw_data
- `location`: from raw_data
- `description_text`: from raw_data

**Rate limiting**: 200ms delay between calls.

#### Node 4: Merge Results & Derive Status

**Type**: Code

```javascript
return items.map(signal => {
  const aiResponse = signal.openai_response;
  const patternMatch = signal.force_match;
  
  // Use pattern match if high confidence, else use AI force identification
  const forceId = patternMatch.confidence >= 0.8 
    ? patternMatch.force_id 
    : aiResponse.force_id;
  
  // Binary status: ≥70 = relevant, <70 = irrelevant
  const status = aiResponse.confidence >= 70 ? 'relevant' : 'irrelevant';
  
  return {
    record_id: signal.id,
    relevance_score: aiResponse.confidence,
    relevance_reason: aiResponse.reasoning,
    status: status,
    force: forceId
  };
});
```

#### Node 5: Update Signals

**Type**: Airtable Update Records (batch)  
**Guardrail**: G-011 (Upsert patterns)

Update each signal with:
- `relevance_score`: confidence (0-100)
- `relevance_reason`: reasoning string
- `status`: `relevant` or `irrelevant`
- `force`: link to force record (if identified)

Batch in groups of 10 with 200ms delay per `.claude/rules/airtable.md`.

#### Node 6: Trigger Opportunity Creation

**Type**: IF + HTTP Request (webhook)

For signals with `status = relevant`, trigger SPEC-004 workflow (when built).

```javascript
const relevantSignals = items.filter(s => s.status === 'relevant');
// Trigger opportunity creation for each relevant signal
```

*Note: This node is a placeholder until SPEC-004 is implemented.*

#### Node 7: Log Completion

**Type**: Code  
**Guardrail**: A5 (Hook-Based Session Management)

Log execution summary:
- `signals_processed`: Total signals classified
- `signals_relevant`: Count with status=relevant
- `signals_irrelevant`: Count with status=irrelevant
- `forces_linked`: Count with force assigned
- `duration_ms`: Total execution time

---

## 5. Testing Plan

| Test | Method | Expected Result |
|------|--------|-----------------|
| Clear police employer | Signal: "Investigator" at "Hampshire Police" | status=relevant, force linked, score ≥70 |
| Clear rejection | Signal: "Software Engineer" at "Barclays Bank" | status=irrelevant, score <70 |
| Pattern match priority | Signal with company matching force pattern | Force linked via pattern (faster than AI) |
| Batch processing | 15 signals with status=new | All 15 classified, none remain status=new |
| Empty batch | No signals with status=new | Workflow exits cleanly, no errors |

**Test data**: Use signals created by SPEC-002 workflow, or manually create test signals with `status = new`.

---

## 6. Acceptance Criteria

From ROADMAP.md Phase 1:

- [ ] Signals with `status = new` are classified automatically
- [ ] Classification uses OpenAI gpt-4o-mini with >90% accuracy
- [ ] Force matching runs before AI (per G-005)
- [ ] Status correctly set: `relevant` or `irrelevant` (binary, no manual review)
- [ ] Force linked when confidently identified (≥80% confidence)
- [ ] Batch of 20 signals processes in <60 seconds

---

## 7. Build Sequence

1. **Verify prerequisites**
   - OpenAI API credentials in n8n
   - Signals table has test records with `status = new`
   - Forces table populated (48 records)
   - `prompts/job-classification.md` accessible

2. **Build workflow nodes** (in order)
   - Schedule trigger (15 min)
   - Airtable fetch (status = new)
   - Code node: force pattern matching
   - OpenAI API node: classification
   - Code node: merge and derive status
   - Airtable update (batch)
   - Placeholder for opportunity trigger
   - Logging node

3. **Test incrementally**
   - Test fetch returns correct signals
   - Test pattern matching alone (without OpenAI)
   - Test OpenAI call format and response parsing
   - Test full flow with 3 test signals
   - Verify binary status assignment

4. **Enable schedule**
   - Activate workflow
   - Monitor first 3-4 runs

---

## 8. Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| SPEC-001: Airtable Schema | ✅ Complete | Signals + Forces tables exist |
| SPEC-002: Jobs Ingestion | ✅ Complete | Creates signals with status=new |
| `prompts/job-classification.md` | ✅ Exists | Classification prompt ready |
| `patterns/force-matching.js` | ✅ Exists | 47 fuzzy patterns |
| OpenAI API credentials | ✅ Configured | Already in n8n |

---

## Files to Create/Update

| File | Action |
|------|--------|
| `n8n/workflows/jobs-classifier.json` | Create — workflow export |
| `STATUS.md` | Update — mark SPEC-003 in progress/complete |

---

## Out of Scope

These are separate specs:
- Opportunity creation from relevant signals (SPEC-004)
- Competitor job ingestion (SPEC-005)
- Human review queue (not planned — 95/5 principle means no manual review tier)

---

## Handoff to Claude Code

**Context**: Second workflow in pipeline — classifies raw signals for relevance

**Key references**:
- Classification prompt: `prompts/job-classification.md`
- Force matching: `patterns/force-matching.js`
- Table IDs: `.claude/skills/airtable-schema/table-ids.json`
- n8n rules: `.claude/rules/n8n.md`

**Workflow naming**: `MI: Jobs Classifier`

**On completion**: Update STATUS.md, verify classified signals appear with correct binary status (relevant/irrelevant)
