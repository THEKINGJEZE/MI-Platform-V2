# MI Platform Audit: Detailed Findings

**Quality Score: 3/10**

---

## Executive Summary

### Top 3 Issues by Impact (Monday Review Experience)

1. **Noise flood:** Most "relevant" signals are not in the target role taxonomy (investigator/disclosure/case handler/analyst/review). This creates opportunities for uniform fitters, probation officers, police constables, finance roles, etc. (violates STRATEGY classification intent)

2. **Force matching + linking breakdown:** 66% of signals have no force; 73% of signals have no linked opportunity; competitor signals frequently have no extracted client force → orphan signals and missed consolidation

3. **Priority tiering is wrong:** 48/50 opportunities have a priority_tier that contradicts the score thresholds (hot should be 60+), and competitor intercepts often aren't "hot" (contrary to SALES-STRATEGY and STRATEGY)

### Quick Wins (1–2 Days)

- Hard-filter irrelevant job families before AI (constable/sergeant/PCSO/probation/IDVA/finance/admin/IT/etc.)
- Require competitor scrapers to return job-detail URLs (not listing pages) + enforce unique (source, external_id) upsert
- Fix priority tier formula mapping to STRATEGY thresholds and set all competitor intercepts = hot

### Deeper Fixes (1–2 Weeks)

- Rework classification prompt to force output of role_type + is_relevant with strict negative examples, plus deterministic post-validation
- Replace opportunity creation logic with true "1 active opportunity per force" consolidation

---

## Questions (Direct Answers)

### 1) What % of Signals Are Correctly Classified?

**Estimated ~23% correct** (title-based audit vs STRATEGY's target roles).

**Reason:** The system currently marks almost everything "relevant" and does not reliably gate to the allowed role taxonomy.

### 2) What % of Opportunities Have Useful (Not Generic) Summaries?

Using a strict "useful" definition aligned to your Monday workflow (must mention the force + the actual role/capability implied by the signal): **~16%**.

Most "why_now" blurbs are force-generic and not tied to the actual signal(s).

### 3) Top 3 Prompt Improvements with Biggest Impact

1. **Add a hard relevance gate + forced role_type selection** (investigator/disclosure/case_handler/analyst/review/other) and strict negative examples (constable, probation, finance, admin, IT)

2. **Force-matching prompt must return** "matched_force_id + evidence + confidence" and output null if not found. Then drop signals with null force from opportunity creation

3. **Enrichment prompt must quote the signal(s)** (job title(s) + what it implies) and produce force-specific talking points + a clear CTA question (SALES-STRATEGY hook/bridge/value/CTA)

### 4) Forces Being Missed/Mismatched Systematically?

Yes:

- **243/367 signals (66%)** have no force at all → systematic miss
- **Competitor signals** often have no client force extracted (raw matched_force is frequently null)
- **Indeed ingestion** includes many non-police employers (e.g., "Google", "easyJet"), which then fail force match

This is a pipeline gating issue + force extraction weakness.

### 5) Is Priority Scoring Working as Intended?

**No:**

- **48/50 opportunities** have tiers inconsistent with STRATEGY thresholds (hot ≥ 60)
- **7/9 competitor intercept opportunities** are not marked "hot", contradicting "competitor signals = highest priority"

---

## Detailed Findings

### Issue 1 — Relevance Classification Is Effectively "Always Relevant"

**Severity: High**

#### Evidence

Signals marked relevant but clearly out-of-scope:

- Detective Constable
- Transferee Police Constable
- Probation Services Officer
- Uniform Fitter/Storesperson
- IDVA
- Claims Team Manager
- Finance SME

All appear as "relevant" with high relevance scores.

#### Root Cause

The classifier is not enforcing STRATEGY's role taxonomy gate and is not applying strong negative examples.

#### Recommended Fix

- Add deterministic pre-AI filters (title keyword blacklist)
- In the classification prompt: require is_relevant=false unless role_type ∈ {investigator, disclosure, case_handler, analyst, review} and employer is a UK police force

---

### Issue 2 — Force Matching Failure Creates Orphan Signals + Wrong Attribution

**Severity: High**

#### Evidence

- 66% of signals have force empty
- Many competitor signals have matched_force missing

#### Root Cause

Force extraction isn't required, isn't validated, and pipeline still stores/uses orphan signals.

#### Recommended Fix

- Force-match must be mandatory: if no force match, set status=ignored and do not generate opportunities
- Add a post-processor that validates force against Forces table canonical names + aliases

---

### Issue 3 — Duplicate Processing / Bad Uniqueness Keys

**Severity: High**

#### Evidence

- 223 signals are duplicates of (source, external_id) (same job created multiple times)
- 218 signals share duplicate URLs
- Competitor scrapers often store listing-page URLs (e.g., `https://www.weareinvestigo.com/jobs`, `https://www.rsr.ltd/latest-jobs/`) for many different jobs → destroys URL uniqueness

#### Root Cause

Upsert logic is not enforcing STRATEGY's de-dupe expectations (should update last_seen, not insert duplicates).

#### Recommended Fix

- Use (source, external_id) as the unique key for upsert
- Store job detail URL, not listing URL; reject records without a detail URL
- Add first_seen/last_seen (or make detected_at/expires_at behave like them)

---

### Issue 4 — Date Handling Incomplete (Expires/Last_seen Missing)

**Severity: Medium**

#### Evidence

Expires_at is empty for 100% of signals.

#### Root Cause

The "refresh vs expire" lifecycle isn't implemented.

#### Recommended Fix

- On each scrape: if job seen again → update last_seen; if not seen for N days → set expires_at and close opportunity if no other active signals

---

### Issue 5 — Opportunity Consolidation Broken (Multiple Opps per Force)

**Severity: High**

#### Evidence

13 forces have >1 opportunity (e.g., West Midlands Police has 5; Surrey has 4).

#### Root Cause

Opportunity creation does not enforce "one active opportunity per force" rule.

#### Recommended Fix

- Before creating: query for existing open opportunity for that force; if exists → append signals and recompute priority/enrichment
- Add an Airtable automation or script to merge duplicates nightly

---

### Issue 6 — Priority Tiers Don't Follow Strategy Thresholds; Competitor Intercept Not Prioritised

**Severity: High**

#### Evidence

- 48/50 opportunities have tier inconsistent with score mapping
- 7/9 competitor intercept opps are not "hot"

#### Root Cause

Tier formula/logic drift from STRATEGY + competitor override not applied.

#### Recommended Fix

- Implement tier derivation exactly per STRATEGY thresholds (hot/high/medium/low)
- If is_competitor_intercept=true, force tier=hot and response_window = same day

---

### Issue 7 — Enrichment Output Not Tied Tightly to the Actual Signals

**Severity: High**

#### Evidence

- Opportunities whose signals include uniform fitter / probation / admin still get "why_now" framed around investigation pressures
- "why_now" often lacks explicit mention of the actual job title(s) driving the lead

#### Root Cause

Enrichment prompt is writing a generic Peel pitch, not a signal-grounded narrative (violates SALES-STRATEGY's "hook on trigger, bridge to value, force-specific talking points").

#### Recommended Fix

Require enrichment prompt to include:

- "Trigger facts" (job title(s), date posted/source)
- "Inference" (what it implies for capacity/backlog)
- 3 force-specific talking points (not generic)
- Strong CTA question (one sentence)

---

## Signal-Level Issues (Examples)

**Note:** The CSV export doesn't include Airtable record IDs; I'm using CSV row numbers + external_id as stable identifiers.

| Issue | Evidence |
|-------|----------|
| Irrelevant roles marked relevant | Rows include titles like Detective Constable, Transferee Police Constable, Probation Services Officer, Uniform Fitter/Storesperson, IDVA, Claims Team Manager marked "relevant" with high scores |
| Force missing (orphan signals) | 243/367 signals have force empty |
| Duplicates | 223 duplicates of (source, external_id) |
| Bad URLs for competitor signals | Many competitor rows share listing URLs (Investigo/RSR), not job-detail URLs |
| expires_at missing | 367/367 |

*If you want, I can output a full "problem signals" table (all rows) as a downloadable CSV, but it will be long.*

---

## Opportunity-Level Issues (Examples)

| Issue | Evidence |
|-------|----------|
| Multiple opportunities per force | 13 forces duplicated (e.g., West Midlands Police 5 opps; Surrey 4) |
| Competitor intercept not "hot" | 7/9 competitor opps are medium/high instead of hot |
| Outreach angle mis-set | Most competitor opps are proactive instead of competitor_intercept |
| Likely noise opportunities | Opportunities built from signals like uniform fitter, probation, admin, finance, etc |
| Timestamps missing | created_at / updated_at are empty for all opportunities |

---

## Prompt Improvement Recommendations

### Classification Prompt (High Impact)

Add a mandatory schema and hard gates:

**Output fields (must):**
- is_relevant
- role_type
- force_name
- force_confidence
- reason
- drop_reason_if_false

**Hard rule:** is_relevant=true only if:

1. Employer or client is a UK police force, and
2. role_type ∈ {investigator, disclosure, case_handler, analyst, review}

**Negative examples:** Explicitly include constable/sergeant/probation/finance/admin/IT/HR/vehicle tech/volunteer.

### Force Matching Prompt

- Provide the model the canonical Forces list + alias list (from Forces table)
- Require "evidence string" (exact text snippet that matches the force) + confidence
- If confidence < threshold → return null and pipeline drops signal

### Enrichment Prompt (Summary + Talking Points + CTA)

- Force the model to cite the triggering job titles and connect them to Peel's broader value proposition, not "we fill roles"
- Require 3 talking points each referencing:
  - Force context (region/size/known pressures from Forces table fields)
  - A concrete Peel outcome (time-to-train, case throughput, disclosure backlog reduction, etc.)
- Require a single CTA question (e.g., "Open to a 15-minute call this week to compare your current backlog vs target throughput?")

---

## Schema / Process Gaps (Structural)

1. **Signals missing lifecycle fields:** expires_at/last_seen not implemented

2. **No stored role_type on signals:** Per STRATEGY classification output → you can't audit or drive opportunity logic properly

3. **Opportunity naming not unique:** "Hiring Activity - N signal(s)" makes linking and human review harder; should be {Force} - Hiring Activity or {Force} - Competitor Intercept

4. **Opportunity timestamps not populated:** created_at, updated_at empty

5. **Contacts enrichment fields missing:** department/seniority are empty for all contacts, weakening targeting

---

## What I Did Not Fully Complete

*Due to export limitations:*

- The CSV export doesn't include Airtable record IDs, so I can't reference recXXXX IDs. I used CSV row numbers + external_id instead
- Linked fields in CSV (signals↔opportunities) are ambiguous because opportunity names repeat; I audited linkage using presence/absence + force counts rather than true Airtable link IDs

---

## Next Steps (Recommended Order)

1. **Stop the bleeding:** Add deterministic filters + drop orphan-force signals before opportunity creation

2. **Fix competitor scrapers:** Ensure job-detail URLs + extract client force, otherwise ignore

3. **Repair scoring & tiers:** Enforce STRATEGY mapping and competitor override

4. **Rewrite prompts** (classification + enrichment) with forced outputs and grounding

5. **Consolidation rule:** Exactly one active opportunity per force

---

## Appendix: Potential Deliverables

If you want, I can generate two concrete deliverables from your exports:

- **"Problem Signals" CSV:** All 367 signals with issue flags + recommended action (drop / fix force / dedupe)
- **"Problem Opportunities" CSV:** All 50 opps with issue flags + merge targets + corrected tier
