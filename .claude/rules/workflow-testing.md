# Workflow Testing Protocol

## Purpose

This document defines the **standard testing protocol** for n8n workflows. Every workflow implementation MUST follow this protocol during Stage 5 (Verify) of the implementation framework.

**This protocol eliminates the need to "rediscover" testing approaches each session.**

---

## Quick Reference: n8n MCP Commands

```bash
# List all workflows
mcp__n8n-mcp__n8n_list_workflows

# Get workflow details
mcp__n8n-mcp__n8n_get_workflow id=<workflow_id>

# Test workflow (manual execution)
mcp__n8n-mcp__n8n_test_workflow id=<workflow_id>

# Check recent executions
mcp__n8n-mcp__n8n_executions workflowId=<id> limit=5

# Validate workflow structure
mcp__n8n-mcp__n8n_validate_workflow id=<workflow_id>
```

---

## Standard Test Sequence

### 1. Pre-Test Verification

Before executing the workflow:

| Check | Method | Pass Criteria |
|-------|--------|---------------|
| Workflow exists | `n8n_get_workflow` | Returns workflow JSON |
| Workflow active | Check `active` field | `active: true` |
| Credentials valid | Check node configurations | No "missing credential" warnings |
| Input tables exist | Airtable MCP `describe_table` | Tables accessible |

```markdown
## Pre-Test Verification

- [ ] Workflow ID: `XXX` exists in n8n
- [ ] Workflow status: Active
- [ ] Credentials: All referenced credentials valid
- [ ] Input tables: [list tables] all accessible
```

### 2. Test Data Preparation

**Option A: Use Existing Data**
- Query Airtable for records matching trigger conditions
- Document which records will be processed

**Option B: Inject Test Data**
- Use `scripts/inject-test-signal.cjs` to create test records
- Document test record IDs for later verification

```markdown
## Test Data

Method: [Existing / Injected]
Records: [List record IDs that will be processed]
Expected outcome: [What should happen to each record]
```

### 3. Execution Test

Execute the workflow and capture results:

```bash
# Execute workflow
mcp__n8n-mcp__n8n_test_workflow id=<workflow_id>

# Result includes:
# - execution_id
# - status (success/error)
# - duration_ms
# - error_message (if failed)
```

**Document:**
```markdown
## Execution Test

- Execution ID: `XXXXX`
- Status: [success / error]
- Duration: XXX seconds
- Error: [none / error message]
```

### 3.5 MANDATORY Read-Back Verification (Cannot Skip)

**⚠️ THIS STEP IS NON-NEGOTIABLE**

After execution, you MUST run the verification script to confirm results. Do NOT trust the workflow's success status alone.

**Why**: Airtable API can return HTTP 200 success when operations silently fail. Previous implementations marked Stage 5 "Complete" when data was never written.

```bash
# Verify records were actually created/updated
node scripts/verify-airtable-operation.cjs \
  --table=[output_table] \
  --record=[record_id_from_execution] \
  --fields="status:expected_value,field2:expected_value2"
```

**For bulk operations:**
```bash
# Verify count and sample records
node scripts/verify-airtable-operation.cjs \
  --table=[output_table] \
  --after="[execution_start_timestamp]" \
  --expected-count=[number_of_records]
```

**Document with actual script output:**
```markdown
## Read-Back Verification

Command:
node scripts/verify-airtable-operation.cjs --table=Signals --record=recXXX --fields="status:classified,role_category:investigation"

Output:
✅ PASS | record_exists - Record ID: recXXX
✅ PASS | field_value - status: Expected "classified", Actual "classified"
✅ PASS | field_value - role_category: Expected "investigation", Actual "investigation"

SUMMARY: 3/3 checks passed
✅ VERIFICATION PASSED
```

**BLOCKER**: If verification script returns exit code 1 (failed), Stage 5 CANNOT be marked complete.

---

### 4. Output Verification (Supplementary)

In addition to the mandatory read-back verification above, check:

```bash
# Query Airtable for output records
mcp__airtable__search_records
  baseId: appEEWaGtGUwOyOhm
  tableIdOrName: [output_table]
  filterByFormula: "{record_id}='recXXX'"
```

**Verify:**
- Expected records created/updated
- Field values match acceptance criteria
- No unexpected side effects

```markdown
## Output Verification

| Expected Output | Actual | Status |
|-----------------|--------|--------|
| Signal status → "classified" | "classified" | ✅ |
| Force linked | "Kent Police" | ✅ |
| ai_confidence populated | 85 | ✅ |
```

### 5. Metrics Collection

Collect standard metrics for every workflow test:

```markdown
## Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Execution time | 12.3s | <30s | ✅ |
| Records processed | 5 | 5 expected | ✅ |
| Errors | 0 | 0 | ✅ |
| AI calls (if any) | 5 | ≤10 | ✅ |
| Estimated cost | $0.04 | <$0.15 | ✅ |
```

---

## Workflow-Specific Test Patterns

### Classifier Workflows (WF3, Email Classifier)

**Test Cases:**
1. Relevant signal → status=relevant, fields populated
2. Irrelevant signal → status=irrelevant, rejection_reason set
3. Edge case → handled gracefully
4. Already classified → skipped (no duplicate processing)

**Verification:**
```bash
# Check classification output
mcp__airtable__search_records
  tableIdOrName: Signals
  filterByFormula: AND({status}="new",CREATED_TIME()>DATEADD(NOW(),-1,'hours'))
```

### Creator Workflows (WF4, Opportunity Creator)

**Test Cases:**
1. New force signal → opportunity created
2. Existing force opportunity → signal linked to existing
3. Competitor signal → priority_tier=hot
4. Duplicate signal → no duplicate opportunity

**Verification:**
```bash
# Check opportunity creation
mcp__airtable__search_records
  tableIdOrName: Opportunities
  filterByFormula: "{force}='Kent Police'"
```

### Enrichment Workflows (WF5, Decay Scanner)

**Test Cases:**
1. Opportunity with contact → enriched with draft
2. Opportunity without contact → status=needs_contact
3. AI draft → follows Hook→Bridge→Value→CTA
4. Competitor intercept → no competitor names in draft

**Verification:**
```bash
# Check enrichment output
mcp__airtable__get_record
  tableIdOrName: Opportunities
  recordId: recXXX
```

### Scanner/Alert Workflows (Decay Scanner)

**Test Cases:**
1. Contact 10 days cold → warming alert
2. Contact 35 days cold → at-risk alert
3. Contact 65 days cold → cold alert
4. Recently contacted → no alert
5. Existing alert → upsert (not duplicate)

**Verification:**
```bash
# Check alerts created
mcp__airtable__search_records
  tableIdOrName: Decay_Alerts
  filterByFormula: CREATED_TIME()>DATEADD(NOW(),-1,'hours')
```

---

## Error Handling Verification

Every workflow must be tested for error handling:

### 1. API Timeout Test
- How does workflow behave if external API times out?
- Verify: Retry logic works, error logged

### 2. Missing Data Test
- How does workflow behave if expected data missing?
- Verify: Graceful skip, not crash

### 3. Invalid Input Test
- How does workflow behave with malformed input?
- Verify: Validation catches, error message clear

```markdown
## Error Handling

| Scenario | Expected Behavior | Verified |
|----------|-------------------|----------|
| API timeout | Retry 3x, then log error | ⏳ |
| Missing force | Skip record, continue | ⏳ |
| Invalid JSON | Log error, continue | ⏳ |
```

---

## Test Evidence Requirements

Every test must produce evidence:

### Minimum Evidence (ALL REQUIRED)
1. **Execution ID** from n8n
2. **Before/After Airtable counts**
3. **Read-back verification script output** — `node scripts/verify-airtable-operation.cjs` with PASS/FAIL results
4. **Sample output record** showing correct values

### Recommended Evidence
5. **Screenshot of n8n execution log** (for complex workflows)
6. **Execution duration breakdown** (for performance-sensitive workflows)
7. **Cost calculation** (for AI-heavy workflows)

**⚠️ Evidence #3 (read-back verification) is MANDATORY. Without it, Stage 5 cannot be marked complete.**

---

## Rollback Testing

Before marking implementation complete:

### Rollback Verification
- [ ] Backup workflow exists
- [ ] Rollback procedure documented
- [ ] Rollback tested (if high-risk change)

```markdown
## Rollback Plan

Backup: `n8n/workflows/wf5-backup-20260123.json`
Procedure: Import backup via n8n MCP, deactivate current
Tested: [Yes/No]
```

---

## Test Report Template

Use this template for Stage 5 verification:

```markdown
## Stage 5: Verify

### Pre-Test Verification
- [x] Workflow ID `XXX` exists
- [x] Workflow active
- [x] Credentials valid
- [x] Input tables accessible

### Test Data
Method: Injected via scripts/inject-test-signal.cjs
Records: rec123, rec456, rec789

### Execution Test
- Execution ID: `13100`
- Status: success
- Duration: 42.8 seconds
- Errors: none

### Read-Back Verification (MANDATORY)

Command:
```bash
node scripts/verify-airtable-operation.cjs \
  --table=Decay_Alerts \
  --after="2026-01-24T10:00:00Z" \
  --expected-count=15
```

Output:
```
✅ PASS | records_after
     Expected count: 15
     Actual count: 15
     Records: recABC1, recABC2, recABC3, recABC4, recABC5

SUMMARY: 1/1 checks passed
✅ VERIFICATION PASSED - Safe to proceed
```

Field Verification (sample 3 records):
```bash
node scripts/verify-airtable-operation.cjs \
  --table=Decay_Alerts \
  --record=recABC1 \
  --fields="status:cold,alert_type:decay"
```

Output:
```
✅ PASS | record_exists - Record ID: recABC1
✅ PASS | field_value - status: Expected "cold", Actual "cold"
✅ PASS | field_value - alert_type: Expected "decay", Actual "decay"

SUMMARY: 3/3 checks passed
✅ VERIFICATION PASSED
```

### Output Verification (Supplementary)

| Expected | Actual | Status |
|----------|--------|--------|
| 15 alerts created | 15 | ✅ |
| All status="cold" | 15/15 cold | ✅ |
| Upsert (no dupes) | 0 duplicates | ✅ |

### Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Execution time | 42.8s | <120s | ✅ |
| Records processed | 100 | — | ✅ |
| Alerts created | 15 | — | ✅ |
| AI cost estimate | $0.12 | <$0.50 | ✅ |

### Acceptance Criteria

| AC | Description | Status | Evidence |
|----|-------------|--------|----------|
| AC-1 | Decay alerts created | ✅ | 15 records in Decay_Alerts |
| AC-2 | Two-tier thresholds | ✅ | Active pipeline vs Closed Won working |
| AC-3 | AI touchpoint suggestions | ✅ | next_touchpoint_suggestion populated |

### Error Handling
- [x] API timeout: continueOnFail=true on OpenAI node
- [x] Missing contact: Skips gracefully
- [x] Invalid data: Logged and continued
```

---

## Common Issues and Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Execution returns 404 | Workflow ID incorrect | Verify with `n8n_list_workflows` |
| "Missing credentials" | Credential not in n8n | Add credential in n8n UI |
| Timeout during test | Workflow too slow | Increase timeout or batch size |
| No output records | Filter not matching | Check Airtable formula syntax |
| Duplicate records | Upsert not configured | Add matchingColumns to Airtable node |

---

## Integration with Implementation Framework

This protocol is used in **Stage 5: Verify** of the 6-stage implementation framework.

**Reference**: `.claude/rules/implementation-stages.md`

**Key rule**: Stage 5 cannot be skipped. Every acceptance criterion must be tested using this protocol.

---

*This protocol is based on proven testing from Phase 1d (SPEC-010), SPEC-011, and Phase 2a-7 implementations.*
