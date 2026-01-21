# MI Platform Audit Report

## Executive Summary

**Overall quality score: 3/10**

### Key Metrics

#### Signals (367 total)
- 322 (88%) marked relevant, but only ~20% appear to match the target roles + police-force requirement in STRATEGY.md (i.e., ~80% look like false positives)
- 66% have no force set (orphanable)
- 73% have no linked opportunity
- 53% are duplicate URLs (same job ingested multiple times)

#### Competitor Signals (177 total)
- 93% missing force
- 93% share a non-job-specific listing URL (so dedupe + traceability fail)

#### Opportunities (50 total across 30 forces)
- 13/30 forces (43%) have multiple opportunities (should be 1 per force per STRATEGY.md)
- 26/50 (52%) appear to be built on zero target-role signals (noise)
- Competitor intercept opportunities: 9 total → 7/9 (78%) are not "hot" despite SALES-STRATEGY requiring competitor signals to be top priority
- created_at / updated_at are blank for 100% of opportunities (can't audit lifecycle)

### Top 3 Issues by Impact on Monday-Morning Review

1. **Relevance gating is effectively broken** → large volume of irrelevant signals becoming "relevant" and even generating/sending outreach
2. **Competitor ingestion is not actionable** (listing-page URLs + missing force) → you're missing the highest-priority leads
3. **Opportunity consolidation + priority tiering aren't aligned to strategy** → too many opportunities, wrong prioritisation, hard to trust the top 3–5

### Quick Wins

*Highest leverage, fastest execution:*

- **Enforce hard gates:** no force = no opportunity, role_type not in taxonomy = irrelevant, non-police org = irrelevant
- **Fix competitor scraper** to store job-detail URLs + stable job IDs, not listing pages
- **Fix priority tier mapping:** competitor intercept ⇒ always Hot/P1

### Deeper Fixes

- **Implement the role_type + seniority fields end-to-end** (signals → rollups → opportunity messaging + contact targeting)
- **Add upsert + last_seen** (stop creating duplicates; track persistence)

### Downloads

- `signals_audit_issues.csv`
- `opportunities_audit_issues.csv`

---

## Detailed Findings

### Issue 1: Relevance Gating Is Not Being Applied Correctly (False Positives Flood)

**Severity: High**

#### Evidence

- ~80% of signals with status = relevant appear not to match the STRATEGY target-role + police-force rules
- Example signals marked relevant but clearly out-of-scope:
  - Signals row_id 97/100: Environment Agency roles (non-police org) marked relevant, force missing
  - Signals row_id 58: Police Treatment Centres role marked relevant (not a police force)
  - Signals row_id 3: Detective Constable (sworn officer) marked relevant
- In at least 12 signals, the relevance_reason text itself says "not a police force / not law enforcement aligned" yet status is still relevant (strong indicator the boolean output is ignored/mis-parsed)

#### Root Cause

The workflow is setting status = relevant regardless of the classifier's relevant boolean (or the classifier JSON is being parsed incorrectly and defaults to "relevant").

#### Recommended Fix

- Update the classification step to persist and enforce:
  - relevant boolean → map to status = relevant/irrelevant
  - if relevant = false: do not create/update opportunities; optionally archive/ignore the signal
- Add an automated QA check: "If relevance_reason contains 'not a police force' then status must be irrelevant"

---

### Issue 2: Signals Schema Is Missing Key STRATEGY Taxonomy Outputs (role_type + seniority)

**Severity: High**

#### Evidence

- STRATEGY.md's job classification requires outputting role_type and seniority
- The exported Signals table does not contain role_type/seniority fields, and Opportunity rollups show only signal_types = job_posting/competitor_job (not service categories)

#### Root Cause

Either the prompt isn't being used, or the pipeline isn't writing the model outputs into fields, so downstream grouping/prioritisation can't work.

#### Recommended Fix

- Add fields to Signals:
  - `role_type` (investigator/disclosure/case_handler/analyst/review/other)
  - `seniority` (junior/mid/senior/manager)
  - `classifier_confidence`
  - `relevant` (boolean) separate from status
- Update opportunity rollups to use role_type + seniority, not type

---

### Issue 3: Competitor Signals Are Non-Actionable (URL + Force Extraction Failures)

**Severity: High**

#### Evidence

- 93% of competitor signals share listing URLs:
  - `https://www.weareinvestigo.com/jobs`
  - `https://www.rsr.ltd/latest-jobs/`
- 93% of competitor signals have no force set
- Result: competitor "P1" leads are mostly unmatchable and undedupable

#### Root Cause

- Scraper is storing the listing page URL rather than a job-detail URL and not extracting a stable job identifier
- Competitor classification prompt requires extracting force_name, but that output isn't making it into structured fields

#### Recommended Fix

- Scrape job-detail pages and store:
  - `source_url` = job detail URL
  - `source_id` = stable job id/reference (from page or hash of URL)
- In competitor classifier:
  - Require force_name to be matched to your Forces table
  - If no force match: relevant=false or needs_review=true (don't surface as a lead)

---

### Issue 4: Duplicate Signal Creation (No Upsert / No first_seen–last_seen Model)

**Severity: High**

#### Evidence

- 53% of signals are duplicates by URL
- Example: the same Indeed job URL appears 3 times with the same detected_at (Signals row_id 260/267/278)
- expires_at is blank for all signals; no first_seen/last_seen fields exist in this export

#### Root Cause

- Ingestion is doing insert-only instead of upsert on a canonical key
- No "job still live" tracking (last_seen) → duplicates accumulate

#### Recommended Fix

- Introduce:
  - `canonical_job_id` (Indeed jk, competitor job ref)
  - `first_seen`, `last_seen`
- Change pipeline to:
  - Upsert on canonical_job_id + source
  - Update last_seen every run
  - Only create a new signal when canonical id is new

---

### Issue 5: Force Matching Gaps and Over-Matching Edge Cases

**Severity: Medium–High**

#### Evidence

- Missing forces in force list leads to unmatched signals:
  - Signals row_id 20 shows Police Scotland activity but no force link (your Forces table appears England/Wales-only)
- Ambiguous org labels cause wrong attribution:
  - Signals row_id 51: company "Essex Police and Kent Police" was linked to Kent but location suggests Essex
- Over-broad matching:
  - Signals row_id 116: NHS trust name contains "Hampshire and Isle of Wight…" and gets linked to Hampshire Constabulary (false match)

#### Root Cause

- Alias rules incomplete (Scotland/NI missing)
- Matching logic sometimes treats geographic phrases as force proof without requiring "Police/Constabulary" markers

#### Recommended Fix

- Add Scotland + NI forces to Forces table (Police Scotland, PSNI) and aliases
- Tighten matching rules:
  - Only match by geography when police markers exist (Police/Constabulary)
  - Treat "PCC", "Police Federation", "IOPC", "Police Treatment Centres" as non-force orgs
  - For "X Police and Y Police" cases: use location as tie-break or flag needs_review

---

### Issue 6: Opportunity Consolidation Logic Is Failing (Multiple Opps per Force)

**Severity: High**

#### Evidence

- 13 forces have 2–5 opportunities
- Example: West Midlands Police has 5 opportunities (opportunity row_id 6, 33, 48, 49, 50)
- This violates STRATEGY: "one record per force with active signals"

#### Root Cause

- "Find existing opportunity" step is likely filtering on the wrong status set (your statuses are ready/sent/skipped vs STRATEGY's lifecycle states)
- Or force linkage is inconsistent across signals, causing parallel opportunities

#### Recommended Fix

- Consolidation query should be: `force_id == X AND status NOT IN (won, lost, dormant, skipped)` (adjust to your actual status values)
- Add a unique constraint concept:
  - `opportunity_key = force_id + "active"` (enforced via automation)

---

### Issue 7: Priority Scoring/Tiering Is Not Aligned to SALES-STRATEGY

**Severity: High**

#### Evidence

- Competitor intercept opps (9 total): 7/9 not Hot
- 48 opportunities have priority_score >= 60 but are not Hot (tier mismatch)
- 5 opportunities have signal_types = competitor_job but are not marked competitor intercept

#### Root Cause

- Tier mapping logic is wrong or not applied after enrichment
- Competitor signals aren't reliably setting is_competitor_intercept

#### Recommended Fix

- Hard-rule:
  - If any linked signal is competitor_job ⇒ priority_tier = Hot/P1 and outreach_angle = competitor_intercept
- Recompute tier from score with a deterministic formula and write it back (don't rely on stale values)

---

### Issue 8: Opportunity Summaries Are Generic; They Rarely Cite the Actual Job(s)

**Severity: Medium–High**

#### Evidence

- Only 1/50 opportunity summaries mention an actual signal title (detected via string match)
- Only 3/50 outreach drafts mention a signal title
- 52% of opportunities are built on non-target signals, which forces generic copy

#### Root Cause

- Either the enrichment prompt isn't getting the signal titles/descriptions, or it's not constrained to cite them
- Noise signals dilute the "why now"

#### Recommended Fix

- Enrichment prompt must:
  - Include job_titles[] and 1–2 key snippets per job
  - Require: summary contains (a) the role(s) and (b) what that implies operationally
  - Generate 3 talking points as bullets tied to the force context (add a talking_points field)

---

## Signal-Level Issues

Sample of high-impact signal problems (see CSV for full list):

| row_id | title | company | type | status | force | url | issues |
|--------|-------|---------|------|--------|-------|-----|--------|
| 3 | Detective Constable | West Midlands Police | job_posting | relevant | West Midlands Police | (indeed viewjob) | false_positive_relevant, sworn_role |
| 51 | Uniform Fitter/Storesperson… | Essex Police and Kent Police | job_posting | relevant | Kent Police | (indeed viewjob) | false_positive_relevant |
| 58 | Housekeeping Assistant | The Police Treatment Centres | job_posting | relevant | — | (indeed viewjob) | missing_force, false_positive_relevant |
| 81 | — | — | job_posting | relevant | — | — | missing_title_url, missing_force |
| 97 | Environmental Crime Officer… | Environment Agency | job_posting | relevant | — | (indeed viewjob) | non_police_org, missing_force |
| 116 | Team Administrator… | Hampshire…NHS Foundation Trust | job_posting | relevant | Hampshire Constabulary | (indeed viewjob) | suspect_force_match |
| 163 | Investigations… | Red Snapper Group | competitor_job | relevant | — | rsr.ltd/latest-jobs | competitor_listing_url, missing_force |
| 260 | Serious Collision…Investigation Officer | Dyfed-Powys Police | job_posting | new | Dyfed-Powys Police | (indeed viewjob) | duplicate_url, duplicate_external_id |
| 267 | (same as above) | Dyfed-Powys Police | job_posting | new | Dyfed-Powys Police | (indeed viewjob) | duplicate_url, duplicate_external_id |
| 278 | (same as above) | Dyfed-Powys Police | job_posting | new | Dyfed-Powys Police | (indeed viewjob) | duplicate_url, duplicate_external_id |

**Full list:** `signals_audit_issues.csv`

---

## Opportunity-Level Issues

Sample of high-impact opportunity problems (see CSV for full list):

| row_id | force | name | status | signal_count | signals | tier | score | issues |
|--------|-------|------|--------|--------------|---------|------|-------|--------|
| 16 | Sussex Police | Hiring Activity… | sent | 1 | Remote Evidence Facilitator Volunteer | medium | 65 | no_target_signals |
| 17 | Thames Valley Police | Hiring Activity… | sent | 0 | — | medium | 65 | no_signals |
| 19 | Essex Police | Hiring Activity… | sent | 1 | People Partner | medium | 65 | no_target_signals |
| 37 | Surrey Police | Surrey Police – Competitor Intercept… | ready | 1 | (competitor job) | medium | 55 | competitor_not_hot |
| 6 | West Midlands Police | Hiring Activity… | ready | 2 | … | medium | 65 | duplicate_force |
| 50 | West Midlands Police | Unknown Force – Competitor Intercept… | ready | 1 | … | medium | 55 | duplicate_force, competitor_not_hot |

**Full list:** `opportunities_audit_issues.csv`

---

## Prompt Improvement Recommendations

### Top 3 Changes with Biggest Impact

#### 1. Add Hard Relevance Gates + Enforce Structured Output

- **Require:** force_name must map to a Forces record OR relevant=false
- **Require:** role_type must be one of the taxonomy values OR relevant=false
- **Explicitly exclude:** sworn roles, non-police orgs, generic admin/HR/IT (even if "Police Staff")

#### 2. Make Competitor Prompt Extract Force + Job-Detail ID Mandatory

- If competitor posting does not contain the force: set relevant=false (or needs_review=true) and do not generate an opportunity
- Output competitor_insight must be stored and rolled up to the opportunity

#### 3. Enrichment Prompt Must Cite the Signal(s)

**Inputs:** pass job_titles[], job_urls[], and 1–2 key description snippets

**Output requirements:**
- **summary:** 1–2 sentences including the role(s) and "what that suggests"
- **talking_points:** 3 bullets tied to role_type + force context
- **recommended_approach:** choose channel + CTA aligned to SALES-STRATEGY (competitor = P1, fast follow-up)

---

## Schema/Process Gaps

1. **Missing/unused fields vs STRATEGY**
   - Signals: role_type, seniority, relevant boolean, first_seen, last_seen, expires_at are not present/used in the export

2. **Opportunity timestamps missing**
   - created_at/updated_at blank → lifecycle QA impossible

3. **Record IDs not exported**
   - CSV has no Airtable record_id; auditing and dedupe debugging would be easier if you add it as a field

4. **Opportunity "talking_points" field absent**
   - You can't deliver "ready-to-send leads with minimal review" without explicit talking points (separate from the email draft)

---

## Answers to Your Questions

### 1. % Signals Correctly Classified

~20% of signals currently marked relevant appear to match STRATEGY's target role + police-force criteria (≈80% likely false positives).

### 2. % Opportunities with Useful (Not Generic) Summaries

- Using "mentions force + mentions correct role area" as a minimum bar: **~26%**
- Using a stricter "force + role + signal-specific context" bar (closer to "ready-to-send"): **~10–15%** (≈12% in this dataset)

### 3. Top 3 Prompt Improvements

- Hard relevance gates + enforced taxonomy output (role_type/seniority + relevant boolean)
- Competitor prompt: force extraction + job-detail URL/ID mandatory
- Enrichment prompt: must cite the job(s) and output 3 force-specific talking points

### 4. Forces Missed/Mismatched Systematically

- **Police Scotland / PSNI signals** exist but can't match if forces table is England/Wales-only
- **Competitor postings:** force missing in 93% of competitor signals → systemic miss
- **Over-matching:** some geographic phrases lead to false matches (e.g., NHS org mapped to a force)

### 5. Priority Scoring Working as Intended per SALES-STRATEGY?

**No.** Competitor signals are not consistently Hot/P1, and score→tier mapping is inconsistent.

---

## Reference Documents Used

*Source of truth:*
- STRATEGY.md
- SALES-STRATEGY.md
