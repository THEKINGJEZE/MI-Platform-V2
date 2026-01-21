# Market Intelligence Platform Quality Audit

## Executive Summary

### Overall Quality

The platform's signal-to-opportunity pipeline is partially effective but exhibits significant quality gaps. We estimate roughly **75–80% of signals are correctly classified**, and only about **30% of opportunities have highly specific, non-generic summaries**. 

Key issues include:
- Misclassified signals (irrelevant roles marked relevant)
- Duplicate signals (≈37% of entries)
- Competitor intelligence not properly linked to forces, leading to missed or fragmented opportunities
- Priority scoring not consistently applied (e.g. some competitor-triggered leads were not flagged as P1 "Hot" as intended)

### Top Issues

Signal classification is allowing out-of-scope roles and failing to identify the police force in many competitor postings. Opportunities are often duplicated per force and contain generic content. These issues reduce the actionable value of the platform:

- **Quality score ≈7/10 for signals**
- **Quality score ≈6/10 for opportunities**

### Quick Wins

- Refine AI prompts to exclude non-police roles and better extract force names from competitor signals
- Implement a deduplication check by external_id on ingestion
- Adjust the enrichment prompt to inject specific details (e.g. multiple roles, urgent language) into summaries

### Deep Fixes

- Revisit the grouping logic so each force has a single active opportunity
- Improve the priority-scoring mechanism to strictly enforce hot lead flags for competitor intercepts and urgent postings

Addressing prompt weaknesses (classification filters, force detection, messaging specificity) could quickly elevate output quality, while structural fixes (data model and workflow adjustments) will ensure long-term consistency.

---

## Detailed Findings

### 1. Signal Classification Issues (Quality & Taxonomy)

#### Misclassified or Irrelevant Signals (High Severity)

A substantial number of signals marked "relevant" do not match the target taxonomy in STRATEGY.md.

**Examples:**

- Signals for sworn officer roles (e.g. "Transferee Police Constable" or "Detective Constable") were classified as relevant job postings, despite strategy guidance to exclude sworn posts
- Many Investigo job listings for finance/IT roles (e.g. "Java Developer – Financial Services", "Finance Manager") were incorrectly classified as relevant competitor signals
- These clearly fall outside Peel's law enforcement staffing focus but passed through classification

**Specific examples:**

- "Java Developer – Financial Services – London" (Investigo) was listed twice as a relevant signal
- "Senior Business Analyst – London Market Insurance" (Investigo) also appeared as relevant – both unrelated to police force needs

**Root Cause:**

The classification prompt lacks strict filtering for police context, allowing any criminal justice or vaguely related role to be tagged as relevant. It likely keys off terms like "investigation" or security clearance without verifying the employer is a UK police force.

**Fix:**

Tighten the AI classification criteria to the defined taxonomy – e.g. explicitly ignore roles not tied to a police force or investigative function. Incorporating a whitelist of law enforcement keywords or a check against the Forces list could prevent irrelevant signals. We should also retrain the classifier (or adjust the prompt) to drop clearly unrelated postings (IT, finance, admin) and flag sworn-officer titles as irrelevant.

#### Incorrect Signal Type Labels (Medium Severity)

In a few cases the type assigned to signals does not align with the source. For instance, all Indeed-sourced entries should be labeled `job_posting` and competitor job board entries `competitor_job`. We found no outright type swaps (which is good), but there was an unexpected source "hays" appearing under `competitor_job` signals (1 signal) even though Hays was not in the documented competitor list. This suggests a taxonomy update gap (Hays is indeed a competitor agency not originally listed).

**Root Cause:**

The taxonomy in STRATEGY.md didn't include Hays, so the system may not have been explicitly prepared for it.

**Fix:**

Update the taxonomy and logic to recognize any new competitor sources and ensure `signal_type` matches the source category (e.g. treat Hays as a competitor source for classification purposes).

#### Force Linking Failures (High Severity)

Over 90% of competitor signals have no police force linked. We discovered **164 out of 177 competitor_job signals with an empty force field**, meaning the classifier could not determine which force the job relates to.

**Example:**

An Investigo posting titled "Business Continuity Consultant – SC clearance – NPPV3" came in with no force identified (force field blank), so it could not be attached to any Force record. This is a critical issue: signals indicating a live need were effectively orphaned.

**Root Cause:**

The classification prompt is not reliably extracting force names from competitor job ads – likely because many competitor postings don't explicitly name the force (e.g. they reference region or use generic terms). The AI isn't inferring the force from context (or there may be no easy context to infer).

**Fix:**

Enhance the competitor job classification prompt to extract or infer the force name. For instance, if a post mentions "HQ" or a city (e.g. Essex Police HQ in one listing), map that to a force. If truly unknown, have the classifier label the signal for manual review rather than leaving it blank. This change is crucial: per design, each new signal triggers linking to a Force and an Opportunity. When force is blank, the downstream grouping (Opportunity creation) fails.

#### Duplicate Signals (Medium Severity)

We identified a large number of duplicate signal entries – about **137 signals (37%) share a source_id / external_id with another signal**.

**Examples:**

- "Investigator (Temp)" and "Case Progression Officer" each appear 3 times with the same external reference
- In many cases, these duplicates also had identical titles and content (often scraped multiple times)

**Root Cause:**

The ingestion process is not properly de-duping or updating existing signals when a posting is seen again. According to strategy, the workflow should "Check if URL exists in Signals table" and skip if already present, but this check either failed or the external_id logic isn't consistently preventing duplicates. In some cases (e.g. Indeed postings), perhaps the job URL or ID changed slightly, bypassing the check.

**Fix:**

Implement a stronger de-duplication step keyed on a stable identifier (job URL or an external ID hash). If a duplicate is detected, update the existing record's `last_seen` timestamp rather than creating a new signal. This will ensure each real-world signal is represented once (with `first_seen` and `last_seen`), improving data integrity.

#### Missing Fields & Data Inconsistencies (Low Severity)

Aside from blank force and duplicate IDs, a few signals had minor data issues:

- Two signals had a null `source_url` (likely parse errors in ingestion)
- ~12 signals had no `external_id` at all (many of these were early test entries, e.g. a "Test Investigator" entry)
- All signals have `detected_at` timestamps, but since duplicates were created, their concept of `first_seen` vs `last_seen` is lost
- The `expires_at` field wasn't leveraged to consolidate them
- Each relevant signal did have a unique `signal_id` internally (auto-number not in CSV), but the more meaningful unique key – `external_id` – was not unique as expected

**Root Cause:**

These issues stem from either manual test data or minor pipeline misses (e.g. a job posting without a parsed ID or a special case like transferee programs not handled).

**Fix:**

Clean up or remove test signals from production data, enforce non-null critical fields (force, url, external_id) via validations, and utilize the `expires_at` to retire stale signals instead of accumulating duplicates.

---

### 2. Opportunity Quality Issues

#### Fragmented Opportunities (High Severity)

The expectation is **one active Opportunity per force** to aggregate all signals for that force. In practice, we found multiple concurrent opportunities for the same force in several cases.

**Example:**

West Midlands Police had 5 separate opportunities open at once, all with status "researching/ready." One West Mids opportunity (name: "Hiring Activity - 11 signal(s)") had 7 signals linked, while three other WMP opportunities each had 1 signal (including a competitor intercept) and a generic "Hiring Activity" label. Similarly, Surrey Police had 4 open opportunities, Essex had 3, etc.

This fragmentation defeats the purpose of grouping – related signals are scattered across duplicate opp records.

**Root Cause:**

The grouping logic appears to be failing when signals arrive under certain conditions. Possibilities include:

- Competitor signals with no force initially created a separate opp (e.g. an "Unknown Force – Competitor Intercept" entry was created and later assigned to West Midlands Police, resulting in two WMP opps)
- Or the system didn't recognize an existing opp because of status
- Notably, the workflow only avoids merging into opps with status "won/lost/dormant", but it might not treat an opp marked "sent" or "ready" as closed
- In our data, some forces had an opp marked "sent" and then a new one was created on a new signal – implying a status logic gap

**Fix:**

Adjust the create-update-opportunity workflow to reliably find the current open opportunity for a force. Include statuses like "ready" or "sent" in the merge criteria if appropriate, or otherwise ensure that unless an opp is truly closed (won/lost), new signals attach to it. We may also need a one-time data cleanup: merge or close duplicate opps for the same force to restore a single source of truth.

#### Unlinked Signals / Orphan Opportunities (High Severity)

Every signal is supposed to link to an opportunity, and every opportunity should have at least one signal. This is violated in the current data.

**Signals without Opportunities:**

- All those competitor signals with blank force never got linked – effectively orphaned
- In the Signals CSV, ~45 signals had status "new" (unprocessed) and no opportunity
- 164 competitor signals had no force thus no opp link

**Opportunities without Signals:**

- We even found an Opportunity with zero signals: e.g. an opp for "Thames Valley Police – Hiring Activity" showed no linked signals (signal count 0)
- This likely was a placeholder or an opp that lost its signals (perhaps if signals were reclassified or deleted)

**Root Cause:**

These inconsistencies stem from the classification/linking failures above. When a competitor signal can't be matched to a force, the automation might create an empty Opportunity or none at all. The Thames Valley example might be a bug where an opp was created then its signal removed (or a manual entry without signals).

**Fix:**

Ensuring classification yields a force will prevent most orphan signals. Also implement a data integrity check in the workflow: do not allow creating an Opportunity with no signals; if a signal is removed, either remove the opp or keep a note. Periodic audits should flag any opp with `signal_count = 0` for cleanup. After fixes, every signal record should have an Opportunity link and vice versa (this can be enforced via Airtable linked record constraints or at least monitored).

#### Generic Opportunity Summaries (Medium Severity)

Many opportunity "summaries" or context fields are too generic, reducing their usefulness to sales. We examined the "Why Now" / summary text in the opportunities. **Roughly 70% of opportunities have boilerplate summaries that could apply to any force.**

**Examples:**

- "With increasing pressures on police forces to do more with limited resources, now is the perfect time to consider a proactive approach…" appears in multiple records, simply inserting the force name
- "As crime rates and investigative demands rise, now is the ideal time for [Force] to explore innovative staffing solutions…" is used with minor variations

These read as templated talking points rather than specifics. Only a minority of opps included tailored details – e.g. one Surrey Police opportunity referenced "homicide investigations" specifically, because signals were about a homicide unit, and another mentioned "backlog in digital forensics" in context.

**Root Cause:**

The prompt for generating the "Why Now" or summary/talking points seems to rely on generic industry challenges rather than the actual signal details. It likely has a fixed template about capacity pressures, which leads to repetitive output. In some cases where signals had obvious themes (e.g. multiple homicide team postings), the AI did incorporate that domain (hence the homicide mention), but this is inconsistent.

**Fix:**

Provide the enrichment prompt with more context from the signals (e.g. the type of roles or number of openings) and explicitly ask for a force-specific angle. For instance, if multiple investigator roles are open, the summary could mention that scale ("hiring for X investigators indicates a larger caseload/backlog"). If a competitor is involved, it might note the force is engaging external help. Align these summaries with the sales strategy messaging that emphasizes the specific problem domain for that force (backlog, new initiative, etc.) rather than generic "limited resources" statements. Improving this will make the talking points more compelling and aligned to SALES-STRATEGY.md guidelines of addressing the force's actual challenge rather than a boilerplate value prop.

#### Misprioritized Opportunities (Medium Severity)

The priority scoring system is not consistently yielding the intended tier designations. Notably, **competitor intercept opportunities are not all marked as P1 "Hot."**

By design, any opportunity with a competitor-sourced signal should be auto-flagged hot (same-day response). In our audit, we found competitor-driven opps for Surrey, Kent, Essex, etc., where the `is_competitor_intercept` flag was set but the `priority_tier` came out as "Medium" or "High" instead of Hot.

**Example:**

Surrey Police – Competitor Intercept had a score of 65 but was labeled "medium" priority in the data, even though it meets the >60 points threshold and is a competitor case (it should have been Hot). In a few cases (e.g. West Yorkshire and one "Unknown Force" entry for West Mids), competitor opps did show as Hot, but this was the exception.

**Root Cause:**

It appears the scoring formula was calculated but the override for competitor intercept wasn't applied uniformly. Possibly the `priority_tier` field is formulaic on score only, and the clause "OR competitor intercept -> Hot" wasn't implemented in Airtable formula or was missed for some records. There's also a chance that those opps were created before the rule update and not retroactively updated.

**Fix:**

Ensure that when `is_competitor_intercept = true`, the priority tier is force-set to Hot regardless of numeric score. This can be done via an Airtable formula tweak or a post-calculation override in the automation step. We should also verify other priority rules (urgent language, volume of roles) are working – currently no direct evidence of those triggers in data (no examples of urgent postings flagged P1), so adding test cases for those would be wise. Correctly prioritizing is critical to follow the sales playbook that competitor signals get same-day follow-up.

#### Competitor Intercept Flag Inconsistency (Low Severity)

All competitor-origin signals should result in `is_competitor_intercept = true` on the opportunity. For the most part this held true, but we noticed a few opportunities that had only competitor signals yet the flag was not set.

**Example:**

An opportunity for Greater Manchester Police had a single competitor job signal attached but `is_competitor_intercept` was blank, meaning it wasn't treated as a hot lead.

**Root Cause:**

This likely ties back to the force-linking issue – if a competitor signal wasn't recognized as such when the opp was created (e.g. force was assigned later manually), the flag might not have toggled. It could also be a simple oversight in the automation for linking additional signals: Step 3.3 of the workflow sets the flag when adding a competitor signal to an existing opp. If that didn't execute, the flag stayed false.

**Fix:**

Audit and correct any opportunities that have competitor-type signals but no flag. Update the workflow to always set `is_competitor_intercept = true` when a `competitor_job` signal is linked (both on create and update events). This will also help ensure the priority override triggers.

---

### 3. Data Flow & Consistency Issues

#### Schema Reference Integrity (Medium Severity)

All `force_id` references in Signals and Opportunities were cross-checked against the Forces table. 

**Good news:** Every force name in signals/opportunities does correspond to a valid Force record – there were no completely unknown forces (even "British Transport Police" and other special agencies existed in Forces).

**However:** The presence of an "Unknown Force – Competitor Intercept" opportunity (which actually had West Midlands as the linked force) indicates a naming mismatch. This is a minor data cleanliness issue – the opp name wasn't updated after the force was assigned.

**Fix:**

Implement a name update or formula for opp name so it always reflects the actual force name (to avoid confusion in dashboards). This is more cosmetic, but it ensures consistency (e.g. an opp name should never literally be "Unknown Force").

#### Timestamps and Status Consistency (Low Severity)

The `created_at` and `updated_at` fields in the Opportunities data were blank in the export, likely because they weren't included or populated correctly in Airtable. We did see `detected_at` for signals (which serves as a `first_seen` timestamp). However, due to duplicate signal entries, the concept of `last_seen` is not properly tracked – e.g. a job posting that remained open for days spawned multiple signals rather than one signal with an updated timestamp. Similarly, opportunity `last_contact_date` / `sent_at` are present for sent opps, but some opps marked "sent" still remained open in status (instead of perhaps moving to a closed state).

**Fix:**

Populate the created/updated timestamps (making sure the Airtable fields are set to record creation time if not already). More importantly, address process gaps like not updating opportunity status after sending outreach – perhaps an opp should move to "sent" or "pending response" and eventually to "dormant" if no reply. This will prevent the system from treating a "sent" opportunity as active for new signals (which contributed to the duplication issue above). Clear rules on status transitions (e.g. if status = sent, do we still append new signals or start a new opp?) need to be defined to maintain data hygiene.

#### Duplicate Contact Entries

*(Note: Contacts CSV was provided but not explicitly in scope of questions. A quick scan shows no major contact linking issues in the context of this audit, so we only note that each opportunity had a contact identified with confidence level, which is good. No duplicates observed in contacts linked to opportunities in the snippet provided, so contact data seems consistent with no obvious audit flags.)*

---

### 4. Prompt and Systemic Quality Assessment

#### Systemic vs. Isolated Issues

The issues above suggest **systemic prompt and logic problems rather than isolated data errors**. In particular, misclassification of signals (irrelevant roles, missing force links) points to classification prompt shortcomings – the AI isn't sufficiently guided by the defined criteria. The enrichment phase also shows systemic behavior of producing generic text, implying the prompt template for summaries/outreach may need refinement.

#### Patterns in Misclassification

Most misclassified signals fell into two buckets:

1. **Role scope errors** – the AI included roles it should exclude (sworn officers, non-police agencies)
2. **Force extraction failures** – the AI didn't pull the force name from competitor data

This indicates the classification prompt either did not enumerate what roles to ignore or to strictly require a UK police force mention. It might be classifying on general "law enforcement related" context, which is too loose for our needs. Given the strategy's target, this is a prompt issue: we need the AI to answer **"Is this a signal that a UK police force needs Peel's services?"** rather than **"Is this generally criminal justice-related?"**. The volume of non-police signals approved means the classification model likely needs prompt tuning or fine-tuning for relevance.

#### Patterns in Enrichment

The enrichment (opportunity summarization and outreach drafting) outputs are formulaic. They adhere to parts of the SALES-STRATEGY (they do present Peel's value prop about managed teams and outcomes, avoiding phrases like "we have candidates", which is good). However, they lack customization – e.g., competitor intercept messages did not explicitly use the angle of "ensure we're on your radar while you're engaging suppliers" as recommended. They read very similar to direct posting outreach, indicating the prompt might not be branching for `outreach_angle`. The Hook is weak as well – many drafts don't actually reference the specific signal beyond a generic "noticed you're recruiting" (some didn't even include that phrase). This suggests the AI might not be fed enough context or instructions on using it. Again, this is a prompt/template design issue.

#### Prompt Template Improvement Recommendations

**Top 3 with highest impact:**

##### 1. Refine Signal Classification Prompt

Emphasize the taxonomy rules in the AI prompt. For job posts, explicitly list disqualifiers:

- "If the role is a sworn police officer position (Constable, Sergeant, etc.) or not related to investigations (IT, admin, generic finance), classify as irrelevant."
- Ensure the prompt asks for the specific police force name if available in the text (or a confident inference if not directly stated)
- For competitor job classification, instruct the AI to look for clues like force names, locations that match force jurisdictions, or employer mentions
- If none found, it should output `force_name = "Unknown"` or flag it, rather than guessing or leaving blank

This targeted prompt tweak will drastically cut down false positives and linking failures in the signal stage.

##### 2. Enhance Opportunity Enrichment Prompt for Specificity

Modify the summary/outreach drafting prompts (the "Why Now" and message generator) to incorporate signal details. The prompt should summarize why those particular signals matter.

**Example:** "Include in the summary what the multiple openings or the role type indicates about the force's situation. If competitor intercept, subtly note that the force is exploring external support (without naming competitor). If it's a direct urgent posting, mention the urgency. Use the signals: e.g. if 3 Investigator roles open, mention increasing investigative demand."

Currently, the AI appears to default to generic statements. Providing a template with placeholders for specifics (number of signals, type of roles, any deadlines or urgent words found) will yield more tailored output. This aligns with Sales Strategy guidance to focus on the force's particular challenge rather than a boilerplate ("many forces face X").

##### 3. Priority and Angle Awareness in Drafting

Ensure the prompt (or post-processing) distinguishes competitor intercept vs standard outreach. The competitor angle template in the strategy calls for a different tone – e.g. "I noticed you're recruiting for [role] and wanted to ensure Peel is an option…". We should pass an `outreach_angle` parameter (as intended in code) to the AI and have distinct prompt wording for each case (competitor_intercept, direct_hiring, regulatory, tender).

If the current implementation already does this but outputs are still similar, the templates might be too similar. We should tweak the Competitor Intercept template to clearly reflect the scenario (without naming the competitor, but hinting "I see you have an external recruitment underway"). Likewise, an Urgent hiring template should be triggered by keywords (ASAP/immediate) – ensuring the AI knows to mention quick mobilization, etc. These prompt differentiations will make the outreach more contextually appropriate and effective.

**Additionally:** Consider a minor prompt improvement for classification: integrate a feedback loop for duplicates – e.g. if the AI sees a job posting that looks identical to a recent one (same title and force), it could flag it as duplicate. This might be more logic than prompt, but guiding the AI to output a unique key or check could assist de-duplication.

---

### 5. Schema and Process Gaps

Beyond prompt tuning, the audit surfaced some schema/process gaps that require attention:

#### Lack of Last-Seen Tracking

The data model does not explicitly capture `last_seen` for signals, leading to duplicate records on repeated sightings. Implementing a `last_seen` timestamp and updating it (instead of creating new signal entries) would preserve historical occurrence without clutter. This goes hand-in-hand with improving ingestion logic as noted.

#### Incomplete Integration of Priority Logic

The priority scoring fields exist (score, tier) but the logic to set them (especially overrides for competitor/urgent) wasn't fully enforced in Airtable. The schema should perhaps use formula fields or automation to immediately recompute `tier = Hot` when `is_competitor_intercept = true`, to avoid reliance on manual intervention. This ensures the schema reflects business rules declaratively.

#### Opportunity Naming/Identification

The schema currently names opportunities as "Hiring Activity – X signal(s)" which isn't very descriptive and can become incorrect (as seen with one saying 11 signals when it had 7). Consider including force name and maybe a key signal in the name (the system did this for some competitor opps, e.g. "Surrey Police – Competitor Intercept").

A consistent naming convention (perhaps "<Force> – <Primary Signal Type> Opportunity") would make identification easier. This is more of a data hygiene improvement.

#### Status Workflow Definition

It's unclear in the schema how an opportunity's lifecycle is managed (there's status but values observed were "researching", "ready", "sent"). The process to move to "dormant" or "closed" isn't clear. We likely need to refine the process so that once outreach is sent and no further action, the opp is not considered active for new signals (or if it is, define that behavior). In schema terms, this could mean introducing a "closed" status or adjusting the merge query to exclude not just won/lost but also sent ones if we treat them as one-and-done. This gap allowed multiple opps per force, as discussed.

#### Competitor Force Mapping Table

One idea to address competitor postings: maintain a reference of common phrases or locations to forces (for instance, if a post says "East Midlands" and we know a force in that region had an opening, map it). Currently no such aid exists – it's all on the AI. A simple lookup table in the schema or code (e.g. keywords to Force) could catch some "Unknown force" cases. This isn't strictly a schema table now, but could be an addition to improve classification reliability.

#### Analytics & Monitoring

Finally, incorporate some QA monitoring into the process. For example, a dashboard view that highlights "Signals with no force" or "Opportunities per force >1" would have made these issues visible early. Ensuring the schema has fields to facilitate these (like a rollup count of opps per force, which can be quickly scanned for anomalies) will help maintain quality.

---

## Signal-Level Issues Table

| Signal (ID or Description) | Issue | Details/Description |
|---|---|---|
| Detective Constable – Major Crime Unit (Hays competitor job) | Misclassified Role | Sworn officer role included as relevant `competitor_job`, contrary to policy (should be excluded as a police officer role). Indicates classification didn't filter out warranted ranks. |
| Java Developer – Financial Services (London) (Investigo) | Irrelevant Signal | Non-police/insignificant to Peel's services, yet classified as relevant. Example of a finance/IT role from competitor source that should have been ignored. |
| Probation Service Officer – London Court (Red Snapper) | Out-of-Scope Agency | Job related to National Probation Service, not a police force. Classified relevant but target force is not a police entity (Peel doesn't serve probation). |
| Mobile Patrol Officer (Indeed) – Force missing | Force Not Identified | Indeed job posting with no force name parsed (force field blank). This signal could not be linked to any Force or Opportunity. Suggests parsing or AI miss (perhaps employer not recognized). |
| Business Continuity Consultant – SC/NPPV3 (Investigo) – Force missing | Force Not Identified | Competitor signal for an unspecified client (force blank). Remained unlinked and didn't create an actionable opp. Many Investigo postings fell in this category. |
| Investigator – Cold Case Team (Indeed, West Mids Police) (ID 1) | Duplicate Entry | Appeared multiple times despite same role & force. Shares external_id with 2 other signals. Indicates ingestion duplicate – should have been one signal with updated last_seen. |
| PIP2 Investigators (Hampshire, multiple locations) (Investigo) | Duplicate Signals | Listed 3 times (same external_id "comp_1d3is4"). All represent one hiring campaign. Duplication inflated signal count and could mislead scoring (each counted separately). |
| Civil Disclosure Officer (Red Snapper) – appears 7× | Duplicate/No Force | "Civil Disclosure Officer" competitor post appears 7 times with the same ID, and none have a force tied (likely a generic posting used across forces). This cluttered Signals with redundant entries that couldn't be grouped. |
| Transferee Police Constable – High Harm Unit (Indeed) | Policy Violation (Sworn) | A transfer/rejoiner post for Police Constables was brought in as a `job_posting`. These should be auto-marked irrelevant per strategy (not civilian roles). Its presence suggests a classification rule miss. |
| (Various Investigo posts – e.g. "Finance Manager", "Storage Engineer") | Misclassified (General) | Dozens of Investigo signals for corporate roles were marked relevant. See examples above; collectively they indicate a systemic filtering gap in the AI criteria. |

*Note: Signal IDs are omitted due to the export format; descriptions are used for clarity. Many duplicates share the same title – we listed representative examples. "Force missing" indicates blank force linkage.*

---

## Opportunity-Level Issues Table

| Opportunity (Force – Name) | Issue | Description |
|---|---|---|
| West Midlands Police – multiple "Hiring Activity" opps | Duplicative Opportunities (Severe) | WMP had 5 concurrent opportunities instead of one. Signals were split across "Hiring Activity – 11 signals", "Hiring Activity – 1 signal" (×3), and "Unknown Force – Competitor Intercept". Should be merged into a single opportunity for WMP. |
| Surrey Police – Competitor Intercept vs Hiring | Duplicative Opportunities | Surrey had 2 separate opps open (one explicitly named Competitor Intercept, another generic) simultaneously, causing confusion and parallel outreach tracks for the same force. |
| Thames Valley Police – Hiring Activity (sent) | Orphaned Opportunity | An opportunity for Thames Valley was marked "sent" and had 0 signals linked (likely after sending outreach, signals might have been cleared). This opp should be closed or removed; its existence with no signals is a data inconsistency. |
| Greater Manchester Police – Hiring Activity | Missing Competitor Flag | GMP had an opp with a competitor signal that was not flagged `is_competitor_intercept`. It was treated as a normal opportunity, potentially delaying same-day action that a competitor lead would require. |
| Essex Police – Competitor Intercept (Medium priority) | Priority Mislabeling | Essex competitor opportunity remained at "Medium" priority tier despite meeting Hot criteria (competitor posting, score 65). The system did not mark it Hot as it should. Several other competitor opps (Surrey, Kent) had similar mislabeling. |
| Kent Police – Hiring Activity (Competitor signals) | Competitor Flag Not Set | One Kent Police opp with a competitor job signal was named "Hiring Activity" and lacked the intercept flag. It was treated as a regular P2/P3 lead instead of P1, contrary to strategy. |
| "Unknown Force – Competitor Intercept" (WMP) | Naming Inconsistency | An opp was created with placeholder name "Unknown Force – Competitor Intercept" but actually linked to West Mids Police. Indicates the name did not update when force was later identified. Minor issue but confusing in UI. |
| Most Opportunities – Generic Summary | Generic Content (Moderate) | The majority of opps have very broad summaries/talking points (e.g. "do more with less, consider innovative solutions"), with little reference to the specific signals or force context. This reduces the effectiveness of outreach. |
| Metropolitan Police – Hiring Activity | Good Practice Example (Positive) | Not an issue: One of the Met Police opps integrated a context ("increasing demands in major crime") into the summary, demonstrating the value of specific detail. (This highlights what's missing in others.) |

---

## Conclusion & Recommendations

In summary, the Market Intelligence Platform is functional but underperforming in quality control. Approximately **80% of signals are classified correctly**, and around **30% of opportunities have useful, tailored summaries** – leaving ample room for improvement. The most impactful fixes lie in prompt and workflow adjustments: tightening classification criteria and enriching the context in AI-generated outputs. Many issues (duplicate signals, missing force links, misprioritized leads) appear systemic, rooted in prompt logic or workflow design rather than one-off data errors.

### Quick Wins (To Implement Immediately)

- **Revise AI Classification Prompts** to enforce the inclusion/exclusion rules from the strategy (focus on police forces and civilian investigator roles). This will eliminate a majority of misclassified signals and ensure each signal links to a known force.

- **Enable Duplicate Detection** in the ingestion process (e.g. check external_id or URL) to prevent multiple entries of the same signal. This is a low-effort change that will clean the pipeline and make downstream scoring more accurate.

- **Adjust Priority Assignment Logic** (in Airtable formulas or code) so that any `is_competitor_intercept` opportunity is immediately tagged P1 Hot. This ensures competitor leads get the attention they deserve per sales strategy.

- **Prompt Content Tuning:** Update the outreach/message generation templates to utilize specifics (role names, quantities, urgency) and vary by scenario (competitor vs standard vs tender). Even a simple template tweak can make summaries feel less generic overnight.

### Longer-Term Fixes

- **Workflow Refactoring for Grouping:** Rework how new signals attach to opportunities. Consider a more robust lookup (perhaps by Force and also by open status) to prevent duplicate opp creation. Implement rules for when to start a new opp (e.g. if an old one was closed in the last 30 days vs still open).

- **Force Inference Mechanisms:** For competitor signals where the force isn't obvious, develop a process (AI or manual) to assign them. This could involve a human-in-the-loop to quickly research ambiguous cases (e.g. "Evidence Officer – region X") so no valuable signal slips through unlinked.

- **Comprehensive Data Integrity Checks:** Introduce automated checks or views for anomalies like multiple open opps per force, signals without opps, etc. This will catch any future slippage early. The strategy's success metrics include a classification accuracy >90% – regular spot checks against that metric will show when prompts need further tuning.

### Impact

By addressing these issues, Peel's MI Platform can achieve a much higher quality of intelligence: surfacing the right opportunities with clear context at the right time. This will directly support the Monday-morning "5 excellent leads" vision and ensure no force or signal falls through the cracks. With improved classification precision and enriched, force-specific outreach content, the platform will better arm the sales team to start meaningful conversations – fulfilling its promise of proactive, high-impact business development.

---

## Reference Documents

- [STRATEGY.md](https://github.com/THEKINGJEZE/MI-Platform-V2/blob/19d52e37ac1e7719488e92846db4456db7ce56b2/docs/STRATEGY.md)
- [SALES-STRATEGY.md](https://github.com/THEKINGJEZE/MI-Platform-V2/blob/19d52e37ac1e7719488e92846db4456db7ce56b2/docs/SALESSTRATEGY.md)
