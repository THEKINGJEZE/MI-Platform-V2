# MI Platform Data Quality Audit Report

**Generated**: 2026-01-22T00:30:00.000Z
**Deployment Date**: 21 January 2025
**Overall Health Score**: 17/100

---

## Executive Summary

This comprehensive audit reveals **significant data quality issues** in the MI Platform pipeline. The root causes are:

1. **No re-classification of existing data** — Workflow fixes were deployed but only affect NEW signals
2. **Upsert deduplication not working** — Competitor signals create duplicates instead of updating
3. **Force matching failing** — 70% of relevant signals have no force link
4. **Competitor flagging incomplete** — Only 74% compliance on P1/hot priority

### Score Breakdown

| Penalty | Impact | Root Cause |
|---------|--------|------------|
| New fields completion 11.7% | -39.1 | Existing signals never re-classified |
| Duplicate rate 23.4% | -20.0 | Upsert check not finding existing records |
| Forces with multiple opps: 13 | -15.0 | Opportunity upsert by force not working |
| Competitor compliance 73.7% | -5.3 | WF4 not detecting all competitor signals |
| False positive rate 11.7% | -3.5 | Classification prompt improvements needed |

---

## Root Cause Analysis

### Issue 1: New Classification Fields Not Populated (0-12%)

**Fields Affected**: `role_type`, `seniority`, `ai_confidence`, `force_source`, `first_seen`, `last_seen`, `scrape_count`

**Root Cause**: The Jobs Classifier (WF3) only processes signals with `status = "new"`. All 367 existing signals have `status = "relevant"` or `"irrelevant"` — they were classified by the OLD workflow before it was updated.

**Evidence**:
- Classifier execution logs show 0 signals processed per run
- All signals in table already have status ≠ "new"
- New fields exist in schema but 0% populated on existing data

**Solution**: Create a one-time backfill script to re-classify existing signals OR mark them for re-processing.

### Issue 2: Duplicate Signals (23.4%)

**Pattern**: Same `external_id` appears 2-3 times (e.g., `comp_1d3is4` appears 3x)

**Root Cause**: The "Check: Existing Signal" query in the receiver workflows returns ALL signals (no filter), then builds a lookup map. However, competitor signals are being created BEFORE the lookup completes, or the lookup key doesn't match.

**Evidence**:
```
comp_1d3is4 appears in:
  - recA2qXlDpRsGtebA (21 Jan 06:36)
  - recGI6fOePniRZJKt (20 Jan 12:02)
  - recJp4wCRUpQMNq8a (20 Jan 11:19)
```

**Solution**: Fix the upsert timing OR add unique constraint on external_id + source.

### Issue 3: Orphaned Signals — No Force Link (70%)

**Stats**: 221 of 315 relevant signals have no force linked

**Root Cause**:
1. Pattern matching finds ~27 forces (7.4% via pattern)
2. AI force extraction runs but confidence often < 80%
3. Location field contains force area (e.g., "Birmingham") but isn't used for inference

**Examples of orphaned signals**:
- "Mobile Patrol Officer" (indeed) — no company info
- "Civil Disclosure Officer" (red_snapper) — location=Birmingham but not mapped
- "Case Investigator" (indeed) — generic title, no force context

**Solution**: Improve force inference from location field; lower AI confidence threshold; add manual force assignment workflow.

### Issue 4: Competitor Flag Compliance (73.7%)

**Issue**: 19 opportunities have competitor signals, but only 14 are flagged `is_competitor_intercept=true`

**Root Cause**: The Opportunity Creator checks `signal.type` but may miss some competitor signals if they're added later.

**Non-Compliant Examples**:
- "Hiring Activity - 1 signal(s)" — is_competitor_intercept=undefined
- "Surrey Police - Competitor Intercept" — flagged but priority_tier=medium (should be hot)

**Solution**: Re-run competitor detection on existing opportunities; fix priority tier assignment.

---

## Detailed Metrics

### Signal Statistics

| Metric | Value |
|--------|-------|
| Total Signals | 367 |
| Relevant | 315 (85.8%) |
| Irrelevant | 52 (14.2%) |
| Job Postings | 190 (51.8%) |
| Competitor Jobs | 177 (48.2%) |

### Source Distribution

| Source | Count | % |
|--------|-------|---|
| Indeed | 190 | 51.8% |
| Investigo | 100 | 27.2% |
| Red Snapper | 75 | 20.4% |
| Reed | 1 | 0.3% |
| Hays | 1 | 0.3% |

### Field Completion Analysis

| Field | Completion | Notes |
|-------|------------|-------|
| type | 100% | ✅ Working |
| source | 100% | ✅ Working |
| title | 99.5% | ✅ Working |
| url | 99.5% | ✅ Working |
| external_id | 96.7% | ⚠️ 12 signals missing |
| status | 100% | ✅ Working |
| detected_at | 100% | ✅ Working |
| relevance_score | 63.5% | ⚠️ Old signals lack |
| relevance_reason | 64.0% | ⚠️ Old signals lack |
| force | 33.8% | ❌ Critical gap |
| role_type | 11.7% | ❌ New field, not backfilled |
| seniority | 11.7% | ❌ New field, not backfilled |
| ai_confidence | 11.7% | ❌ New field, not backfilled |
| force_source | 7.4% | ❌ New field, not backfilled |
| first_seen | 0% | ❌ New field, never set |
| last_seen | 0% | ❌ New field, never set |
| scrape_count | 0% | ❌ New field, never set |

### Opportunity Statistics

| Metric | Value |
|--------|-------|
| Total Opportunities | 50 |
| Ready for Review | 29 |
| Dormant | 17 |
| Sent | 3 |
| Skipped | 1 |

### Priority Distribution

| Priority | Count | % |
|----------|-------|---|
| Hot | 10 | 20% |
| High | 18 | 36% |
| Medium | 22 | 44% |

### Duplicate Analysis

| Duplicate Type | Affected Records |
|----------------|------------------|
| By external_id | 211 signals (86 unique IDs duplicated) |
| By URL | 216 signals (24 unique URLs duplicated) |
| By title+company | 250 signals (92 combinations duplicated) |

---

## False Positive Analysis

### Detected False Positives: 37 (11.7% of relevant signals)

**Breakdown by Issue Type**:
| Type | Count | Examples |
|------|-------|----------|
| Out of Scope | 15 | "Mobile Patrol Officer", "Finance Business Partner" |
| Non-Police Org | 12 | "Probation Services Officer" |
| Contradiction | 6 | AI said "not police" but marked relevant |
| Sworn Officer | 5 | "Detective Constable", "Police Constable" |

**Sample False Positives**:
1. Mobile Patrol Officer — security role, not police
2. Finance Business Partner / Group Systems — finance role
3. Facilities Coordinator (Caretaker) — facilities role
4. Probation Services Officer — HMPPS, not police
5. Detective Constable — sworn officer, should be rejected

---

## Action Plan

### Priority 1: Critical Fixes (This Week)

#### 1.1 Create Backfill Script for Classification Fields
```javascript
// scripts/backfill-classification.js
// Mark all signals for re-processing OR run AI classification directly
// Populate: role_type, seniority, ai_confidence
```

#### 1.2 Fix Duplicate Detection
- Add filterByFormula to "Check: Existing Signal" query
- Verify external_id is being generated correctly
- Consider adding Airtable unique constraint

#### 1.3 Fix Competitor Flag Detection
- Run script to detect opportunities with competitor signals
- Set is_competitor_intercept=true, priority_tier=hot

### Priority 2: Quality Improvements (Next Week)

#### 2.1 Improve Force Matching
- Add location → force mapping (Birmingham → West Midlands, etc.)
- Lower AI force confidence threshold from 80% to 60%
- Create manual force assignment interface

#### 2.2 Merge Duplicate Opportunities
- Run merge script: `node scripts/merge-opportunities.js`
- Consolidate to 1 opportunity per force

#### 2.3 Tighten Classification Prompts
- Add more explicit rejection keywords
- Test with known false positive examples

### Priority 3: Monitoring (Ongoing)

- Run this audit weekly
- Track metrics trend over time
- Alert on regression

---

## Recommendations Summary

| Action | Impact | Effort | Priority |
|--------|--------|--------|----------|
| Backfill classification fields | HIGH | MEDIUM | P1 |
| Fix duplicate detection | HIGH | LOW | P1 |
| Fix competitor flagging | HIGH | LOW | P1 |
| Improve force matching | MEDIUM | MEDIUM | P2 |
| Merge duplicate opportunities | MEDIUM | LOW | P2 |
| Tighten classification prompts | MEDIUM | MEDIUM | P2 |
| Add location→force mapping | MEDIUM | LOW | P2 |
| Weekly audit automation | LOW | LOW | P3 |

---

## Verification Checklist

After implementing fixes, verify:

- [ ] New signals get role_type, seniority, ai_confidence populated (should be 100%)
- [ ] Duplicate rate < 5%
- [ ] All competitor opportunities flagged is_competitor_intercept=true
- [ ] All competitor opportunities priority_tier=hot
- [ ] Force link rate > 80%
- [ ] False positive rate < 10%
- [ ] 1 opportunity per force (no duplicates)

---

*Generated by MI Platform Data Quality Audit Script*
*Run: `node scripts/data-quality-audit.cjs <signals-file> <opportunities-file>`*
