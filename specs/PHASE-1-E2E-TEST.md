# Phase 1 End-to-End Test Plan

**Created**: 18 January 2025
**Purpose**: Verify the complete Phase 1 pipeline works as designed before strategic sign-off

---

## Overview

Phase 1 implements the core jobs pipeline:
```
WF1 (Trigger) → Bright Data → WF2 (Receiver) → WF3 (Classifier) → WF4 (Creator) → WF5 (Enricher) → Ready leads
```

This test plan validates each stage and the complete flow.

---

## Test Execution Checklist

### Test 1: Manual Pipeline Trigger
**Purpose**: Verify full flow from WF1 trigger through to enriched opportunities

**Steps**:
1. Open n8n UI
2. Navigate to WF1: `MI: Jobs Trigger` (RqFcVMcQ7I8t4dIM)
3. Execute workflow manually
4. Wait for Bright Data to complete (~2-5 minutes)
5. Check WF2 webhook received data
6. Wait for WF3 schedule (15 min max) or trigger manually
7. Verify signals classified in Airtable
8. Wait for WF4 schedule (15 min max) or trigger manually
9. Verify opportunities created
10. Wait for WF5 schedule (15 min max) or trigger manually
11. Verify opportunities enriched with contacts and drafts

**Expected Results**:
- [ ] WF1 triggers Bright Data successfully
- [ ] WF2 receives webhook and creates signals
- [ ] WF3 classifies signals (status: relevant/irrelevant)
- [ ] WF4 creates opportunities from relevant signals
- [ ] WF5 enriches opportunities (status: ready)
- [ ] At least one opportunity has: contact linked, outreach_draft populated, priority_score set

**Pass Criteria**: Full pipeline executes without errors, produces at least one ready opportunity

---

### Test 2: Irrelevant Signal Filtering
**Purpose**: Verify non-police jobs are correctly filtered out

**Steps**:
1. Check Airtable Signals table for status=irrelevant signals
2. Verify at least 3 irrelevant signals exist
3. Spot-check: Do they look genuinely irrelevant? (e.g., NHS jobs, private sector)
4. Verify none have linked opportunities

**Expected Results**:
- [ ] Irrelevant signals have relevance_score < 70
- [ ] Irrelevant signals have relevance_reason explaining why
- [ ] No opportunities linked to irrelevant signals
- [ ] Spot-check passes (signals look correctly classified)

**Pass Criteria**: Filtering is accurate, no false negatives in quick review

---

### Test 3: Force Matching (G-005 Compliance)
**Purpose**: Verify pattern matching runs BEFORE AI classification

**Steps**:
1. Open WF3: `MI: Jobs Classifier` in n8n
2. Verify Code node with force patterns exists BEFORE AI agent node
3. Check Airtable: Find signals with force linked
4. Verify at least one signal matched via pattern (not AI)
5. Check n8n execution logs: Pattern match should appear before AI call

**Expected Results**:
- [ ] WF3 has pattern matching before AI (architecture check)
- [ ] At least 1 signal has force linked via pattern match
- [ ] Execution logs show pattern evaluation before AI

**Pass Criteria**: G-005 guardrail is enforced in workflow structure

---

### Test 4: Deduplication
**Purpose**: Verify duplicate job URLs are not created

**Steps**:
1. Note current count of signals in Airtable
2. Trigger WF1 again (or wait for next scheduled run)
3. After WF2 completes, count signals again
4. Verify: new signals should be genuinely new jobs, not duplicates

**Alternative test** (if no new jobs):
1. Manually note a `url` from an existing signal
2. Try to create a new signal with same URL via API
3. Verify it's rejected or deduplicated

**Expected Results**:
- [ ] No duplicate URLs in Signals table
- [ ] Deduplication logic in WF2 is working

**Pass Criteria**: `url` field maintains uniqueness

---

### Test 5: Opportunity Consolidation
**Purpose**: Verify multiple signals for same force consolidate to one opportunity

**Steps**:
1. Find a force with multiple relevant signals
2. Check Opportunities table for that force
3. Verify only ONE open opportunity exists (not one per signal)
4. Verify the opportunity's linked signals include all relevant signals for that force

**Expected Results**:
- [ ] Single opportunity per force (for open status)
- [ ] Multiple signals correctly linked to same opportunity
- [ ] `signal_count` rollup field shows correct count
- [ ] `signal_types` rollup shows all signal types

**Pass Criteria**: No duplicate opportunities for same force

---

### Test 6: Monday Morning Experience
**Purpose**: Simulate James's Monday review workflow

**Steps**:
1. Open Airtable Opportunities table
2. Filter: status = "ready"
3. Count opportunities (target: 3-5)
4. For each ready opportunity, verify:
   - Force name visible
   - Contact linked (or "No contact found" note)
   - Outreach draft exists and looks reasonable
   - Priority score set
   - why_now field populated
5. Time how long review takes (target: <15 minutes for 5 leads)

**Expected Results**:
- [ ] 3-5 ready opportunities (after ~1 week of data)
- [ ] Each has enough context to decide "send or skip"
- [ ] Outreach drafts require minimal editing
- [ ] Total review time <15 minutes

**Pass Criteria**: Monday experience matches ANCHOR.md goals

---

### Test 7: Production Burn-In (1 Week)
**Purpose**: Verify system stability over sustained operation

**Duration**: 7 days of normal operation

**Daily Checks**:
- [ ] Day 1: All workflows ran, no errors
- [ ] Day 2: All workflows ran, no errors
- [ ] Day 3: All workflows ran, no errors
- [ ] Day 4: All workflows ran, no errors
- [ ] Day 5: All workflows ran, no errors
- [ ] Day 6: All workflows ran, no errors
- [ ] Day 7: All workflows ran, no errors

**End-of-Week Metrics**:
- Total signals ingested: ___
- Signals classified as relevant: ___
- Signals classified as irrelevant: ___
- Opportunities created: ___
- Opportunities enriched to ready: ___
- Errors encountered: ___

**Pass Criteria**: No critical errors, consistent daily operation

---

## Cleanup Instructions

After testing, clean up test data:

1. **Keep production data** — Real signals and opportunities from Bright Data
2. **Delete test signals** — Any manually created test records
3. **Reset opportunity statuses** — If any were marked "sent" during testing, reset if not actually sent

**Do NOT delete**:
- Real Bright Data signals (even if irrelevant — archive value)
- Real opportunities (track for Monday review)

---

## Completion Criteria

Phase 1 E2E testing is complete when:

- [ ] Tests 1-6 all pass
- [ ] Test 7 burn-in shows stable operation for 1 week
- [ ] No critical bugs discovered
- [ ] James has done at least one real Monday review

**After completion**: Ready for Phase 1 strategic verification in Claude Chat

---

## Test Results Log

| Test | Date | Result | Notes |
|------|------|--------|-------|
| Test 1: Manual Trigger | | | |
| Test 2: Irrelevant Filter | | | |
| Test 3: Force Matching | | | |
| Test 4: Deduplication | | | |
| Test 5: Consolidation | | | |
| Test 6: Monday Experience | | | |
| Test 7: Burn-In | | | |

---

*This test plan supports Phase 1 sign-off per [ROADMAP.md](../ROADMAP.md) acceptance criteria.*
