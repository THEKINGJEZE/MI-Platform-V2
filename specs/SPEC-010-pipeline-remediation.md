# SPEC-010: Pipeline Remediation

**Status**: Ready for Implementation  
**Phase**: 1 (Critical Fix)  
**Priority**: P0 — Blocking Monday Review functionality  
**Source of Truth**: Data Quality Audit (23 Jan 2026)

---

## 1. Overview

**Problem**: The jobs pipeline has a 17/100 health score. Critical failures:
- 92.4% of competitor signals have no force link (never classified)
- 70% of all relevant signals are orphaned (no force = no opportunity)
- 23.4% duplicate signal rate
- 14 forces have multiple opportunities (should be 1 per force)
- False positives include sworn officers and private security roles
- Role classification too narrow (misses many valid role types)

**Goal**: Fix the pipeline so signals flow correctly from ingestion → classification → opportunities with accurate force linking and deduplication.

**Expected Outcome**: Health score >70/100. All signals (Indeed AND competitor) are classified with force inference. One opportunity per force. False positive rate <5%.

---

## 2. Root Causes

| Issue | Root Cause | Evidence |
|-------|------------|----------|
| Competitor signals not classified | WF2 creates signals but doesn't set `status=new`, so WF3 never processes them | 172 competitor signals with empty classification fields |
| Force inference fails | Pattern matching only works when "Police" in text; no geographic reasoning | 70% of relevant signals have no force |
| Duplicate signals | Deduplication check not working (timing or key mismatch) | 94 external_ids appear 2-3 times |
| Duplicate opportunities | WF4 upsert check not finding existing opportunities | 14 forces have 2-5 opportunities each |
| False positives | Classification prompt doesn't explicitly reject sworn officers, probation, security | DC, Probation Officer, Mobile Patrol marked relevant |
| Role type gaps | Single select with 8 options can't cover all valid role types | HOLMES indexers, vetting, safeguarding don't fit |

---

## 3. Schema Changes

### Signals Table — Field Updates

| Change | Old | New | Notes |
|--------|-----|-----|-------|
| Rename field | `role_type` | `role_category` | Broader buckets |
| Add field | — | `role_detail` | Free text for specifics |
| Update options | 8 narrow options | 6 broad categories | See below |

### role_category Options (New)

Replace current `role_type` options with:

| Option | Covers |
|--------|--------|
| `investigation` | Investigators, case builders, statement takers, reviewers |
| `criminal_justice` | Disclosure, case progression, court liaison, file prep |
| `intelligence` | Analysts, researchers, HOLMES indexers, MIR support |
| `forensics` | Digital forensics, CSI, exhibits, hi-tech crime |
| `specialist` | Vetting, financial (POCA), licensing, safeguarding leads, counter-terrorism |
| `support` | CJ admin, contact handlers, witness care, custody assistants |

### role_detail Field (New)

| Property | Value |
|----------|-------|
| Field name | `role_detail` |
| Type | Single line text |
| Purpose | AI-generated specific description |
| Examples | "PIP2 Fraud Investigator", "HOLMES Indexer - Major Crime", "Vetting Officer - SC/DV" |

**Why two-tier?** Any enumerated list eventually misses something new. Broad categories for filtering + free text for specifics means the system handles new role types without schema changes.

---

## 4. Fixes Required

### Fix 0: Competitor Receiver → Classifier Gap (P0) ⚡ URGENT

**Problem**: WF2 (Competitor Receiver) creates signals that never get classified.

**Current behaviour**:
```
Competitor job → WF2 → Signal created (status=undefined or relevant) → END
```

**Required behaviour**:
```
Competitor job → WF2 → Signal created (status="new") → WF3 picks up on next run
```

**Implementation**:
1. In WF2 "Create Signal" node, ensure `status` field is set to `"new"`
2. Verify WF3 filter includes competitor signals (no source filter blocking them)

**Acceptance criteria**:
- [ ] New competitor signals have `status=new`
- [ ] WF3 processes competitor signals on next scheduled run
- [ ] Competitor signals get classification fields populated

**Effort**: 10 minutes

---

### Fix 1: Upgrade Classification Prompt (P1)

**Problem**: Current prompt doesn't do geographic force inference, properly reject false positives, or handle the full range of role types.

**Solution**: Replace classification prompt with `prompts/signal-triage-agent.md` v2.1

**Key changes**:
1. **Geographic force inference** — AI maps locations to police force boundaries
2. **Explicit rejection gates** — Sworn officers, probation, private security
3. **Source awareness** — Competitor sources mean employer is the client
4. **Standardised force names** — Return official names consistently
5. **Two-tier role classification** — `role_category` (6 options) + `role_detail` (free text)

**Implementation**:
1. New prompt file: `prompts/signal-triage-agent.md` ✅
2. Update Airtable schema (see Section 3)
3. Update WF3 to use new prompt
4. Update WF3 to write `role_category` and `role_detail` fields

**Acceptance criteria**:
- [ ] "Birmingham" location → "West Midlands Police" force
- [ ] "Detective Constable" → `relevant=false`, `rejection_reason="Gate 1: Sworn officer"`
- [ ] "Mobile Patrol Officer" at Securitas → `relevant=false`
- [ ] "HOLMES Indexer" → `role_category="intelligence"`, `role_detail="HOLMES Indexer - Major Incident Room"`
- [ ] "Vetting Officer" → `role_category="specialist"`, `role_detail="Vetting Officer - Security Clearance"`

**Effort**: 1-2 hours

---

### Fix 2: Signal Deduplication (P1)

**Problem**: Same `external_id` appears multiple times in Signals table.

**Solution**: Pre-fetch existing IDs at batch start, check before each create.

**Implementation**:
```javascript
// At start of batch processing
const existingSignals = await airtable.search('Signals', {
  fields: ['external_id'],
  filterByFormula: `{detected_at} >= "${oneDayAgo}"` // 24h window
});
const existingIdSet = new Set(existingSignals.map(r => r.fields.external_id));

// For each job:
if (existingIdSet.has(job.external_id)) {
  // Skip - already exists
  continue;
}
existingIdSet.add(job.external_id); // Prevent dupe in same batch
// Create signal...
```

**Acceptance criteria**:
- [ ] Running WF2 twice with same data creates 0 new duplicates
- [ ] `external_id` is unique per source within 24h window

**Effort**: 1 hour

---

### Fix 3: Opportunity Deduplication (P2)

**Problem**: Multiple opportunities exist for same force. Should be 1 active opportunity per force.

**Current issue**: The `RECORD_ID({force})` filter syntax may not work correctly.

**Solution**: Change filter approach in WF4.

**Implementation**:
```javascript
// Option: Fetch all active opps, filter in code
const activeOpps = await airtable.search('Opportunities', {
  filterByFormula: `NOT(OR({status}="won", {status}="lost", {status}="dormant"))`,
  fields: ['force', 'status', 'signals']
});

const existingForForce = activeOpps.find(opp => 
  opp.fields.force && opp.fields.force.includes(forceId)
);

if (existingForForce) {
  // Update existing - link signal
} else {
  // Create new
}
```

**Acceptance criteria**:
- [ ] New signal for force with existing active opportunity → links to existing
- [ ] Maximum 1 active opportunity per force

**Effort**: 1 hour

---

### Fix 4: Backfill Existing Signals (P2)

**Problem**: 367 existing signals have empty classification fields.

**Solution**: One-time backfill script to re-classify with new prompt.

**Implementation**:
```javascript
// scripts/backfill-classification.js

const signals = await airtable.search('Signals', {
  filterByFormula: `OR({ai_confidence} = BLANK(), {force} = BLANK())`,
  fields: ['title', 'raw_data', 'source', 'status', 'id']
});

console.log(`Backfilling ${signals.length} signals...`);

for (const signal of signals) {
  const rawData = JSON.parse(signal.fields.raw_data);
  
  const result = await classifySignal({
    signal_id: signal.id,
    title: signal.fields.title,
    company: rawData.company || rawData.employer || rawData.company_name,
    location: rawData.location,
    description: rawData.description || rawData.description_text,
    source: signal.fields.source
  });
  
  // Lookup force ID from name
  const forceId = result.force_name ? await lookupForce(result.force_name) : null;
  
  await airtable.update(signal.id, {
    ai_confidence: result.confidence,
    role_category: result.role_category,  // NEW FIELD
    role_detail: result.role_detail,       // NEW FIELD
    seniority: result.seniority,
    force: forceId ? [forceId] : null,
    force_source: result.force_inference_method,
    status: result.relevant ? 'relevant' : 'irrelevant',
    relevance_score: result.confidence,
    relevance_reason: result.reasoning
  });
  
  await sleep(200); // Rate limit
}
```

**Acceptance criteria**:
- [ ] All signals have `ai_confidence` populated
- [ ] All relevant signals have `force` linked (where inferable)
- [ ] `role_category` and `role_detail` populated for all signals

**Effort**: 30 min script + overnight run

---

### Fix 5: Merge Duplicate Opportunities (P3)

**Problem**: 14 forces have multiple opportunities. Need to consolidate.

**Solution**: One-time merge script.

**Implementation**:
```javascript
// scripts/merge-duplicate-opportunities.js

const opps = await airtable.search('Opportunities', {
  filterByFormula: `NOT(OR({status}="won", {status}="lost"))`,
  fields: ['force', 'signals', 'status', 'created_at']
});

// Group by force
const byForce = {};
for (const opp of opps) {
  const forceId = opp.fields.force?.[0];
  if (!forceId) continue;
  if (!byForce[forceId]) byForce[forceId] = [];
  byForce[forceId].push(opp);
}

// Merge duplicates
for (const [forceId, forceOpps] of Object.entries(byForce)) {
  if (forceOpps.length <= 1) continue;
  
  // Keep newest
  forceOpps.sort((a, b) => new Date(b.fields.created_at) - new Date(a.fields.created_at));
  const keep = forceOpps[0];
  const merge = forceOpps.slice(1);
  
  // Collect all signals
  const allSignals = new Set(keep.fields.signals || []);
  for (const dup of merge) {
    for (const sigId of (dup.fields.signals || [])) {
      allSignals.add(sigId);
    }
  }
  
  // Update keeper
  await airtable.update(keep.id, { signals: Array.from(allSignals) });
  
  // Mark duplicates dormant
  for (const dup of merge) {
    await airtable.update(dup.id, {
      status: 'dormant',
      notes: `Merged into ${keep.id}`
    });
  }
}
```

**Acceptance criteria**:
- [ ] Each force has max 1 active opportunity
- [ ] Signals from merged opps preserved on kept record

**Effort**: 30 min

---

### Fix 6: Competitor Flag Propagation (P3)

**Problem**: Opportunities with competitor signals not flagged `is_competitor_intercept=true`.

**Solution**: Fix WF4 logic + backfill script.

**WF4 fix**:
```javascript
// When linking signal to opportunity:
if (signal.source !== 'indeed') {
  await airtable.update(opportunity.id, {
    is_competitor_intercept: true,
    competitor_detected: signal.source,
    priority_tier: 'hot' // Per G-013
  });
}
```

**Backfill**:
```javascript
// scripts/fix-competitor-flags.js
const opps = await airtable.search('Opportunities', {
  filterByFormula: `{is_competitor_intercept} = FALSE()`
});

for (const opp of opps) {
  const signals = await getLinkedSignals(opp.fields.signals);
  const hasCompetitor = signals.some(s => 
    ['red_snapper', 'investigo', 'reed', 'hays', 'adecco', 'service_care'].includes(s.fields.source)
  );
  
  if (hasCompetitor) {
    await airtable.update(opp.id, {
      is_competitor_intercept: true,
      priority_tier: 'hot'
    });
  }
}
```

**Acceptance criteria**:
- [ ] All opportunities with competitor signals have `is_competitor_intercept=true`
- [ ] All competitor opportunities have `priority_tier=hot`

**Effort**: 30 min

---

## 5. Implementation Sequence

```
Pre-work (5 min):
└── Update Airtable schema: rename role_type → role_category, add role_detail

Day 1 (Immediate - Do Now):
├── Fix 0: Competitor→Classifier gap (10 min) ⚡
└── Fix 1: Deploy new classification prompt (1-2 hours)

Day 2:
├── Fix 2: Signal deduplication logic (1 hour)
└── Fix 4: Run backfill script (overnight)

Day 3:
├── Fix 3: Opportunity deduplication logic (1 hour)
├── Fix 5: Merge duplicate opportunities (30 min)
└── Fix 6: Competitor flag propagation (30 min)

Day 4:
└── Run data quality audit, verify health score >70
```

---

## 6. Testing Plan

| Test | Setup | Expected Result |
|------|-------|-----------------|
| Competitor classification | Create signal: source=red_snapper, status=new | Gets classified with force inferred |
| Location→Force | Signal: location="Birmingham" | force="West Midlands Police" |
| Sworn officer rejection | Title="Detective Constable" | relevant=false, rejection_reason set |
| Two-tier classification | Title="HOLMES Indexer" | role_category="intelligence", role_detail contains "HOLMES" |
| Specialist role | Title="Vetting Officer" | role_category="specialist", role_detail="Vetting Officer..." |
| No duplicates | Run WF2 twice with same data | Zero new signals second run |
| One opp per force | New signal for force with existing opp | Links to existing, no new opp |
| Competitor flag | Competitor signal creates opp | is_competitor_intercept=true |

---

## 7. Acceptance Criteria (Overall)

After all fixes, data quality audit should show:

| Metric | Before | Target |
|--------|--------|--------|
| Health Score | 17/100 | >70/100 |
| Force Link Rate | 30% | >80% |
| Competitor Signals Classified | 0% | 100% |
| Duplicate Signal Rate | 23% | <5% |
| Forces with Multiple Opps | 14 | 0 |
| False Positive Rate | ~12% | <5% |

---

## 8. Files to Create/Update

| File | Action | Status |
|------|--------|--------|
| `prompts/signal-triage-agent.md` | Create — new classification prompt v2.1 | ✅ Done |
| `prompts/job-classification.md` | Keep as backup | — |
| `scripts/backfill-classification.js` | Create — one-time backfill | To do |
| `scripts/merge-duplicate-opportunities.js` | Create — one-time merge | To do |
| `scripts/fix-competitor-flags.js` | Create — one-time fix | To do |
| n8n: `MI: Competitor Receiver` | Update — set status=new | To do |
| n8n: `MI: Jobs Classifier` | Update — use new prompt, write new fields | To do |
| n8n: `MI: Opportunity Creator` | Update — fix upsert logic | To do |
| Airtable: Signals table | Update — rename field, add field | To do |
| `STATUS.md` | Update — track remediation progress | To do |

---

## 9. Airtable Changes Checklist

**Before deploying prompt changes:**

- [ ] Rename `role_type` field to `role_category`
- [ ] Update `role_category` options to: `investigation`, `criminal_justice`, `intelligence`, `forensics`, `specialist`, `support`
- [ ] Add new field `role_detail` (Single line text)
- [ ] Verify WF3 writes to correct field names

---

## 10. Guardrails Compliance

| Guardrail | Fix | Status |
|-----------|-----|--------|
| G-001: Dumb Scrapers + Smart Agents | Fix 1 | ✅ Enhanced agent prompt |
| G-005: JS Before AI | N/A | Keep existing pattern match as fast path |
| G-011: Upsert Only | Fix 2, 3 | Fix deduplication logic |
| G-013: Competitor = P1 | Fix 6 | Ensure flag propagation |

---

## 11. Rollback Plan

If new classification prompt causes issues:
1. Revert WF3 to use `prompts/job-classification.md`
2. Rename `role_category` back to `role_type` if needed
3. New signals will classify with old prompt
4. Re-run backfill with old prompt if needed

Keep both prompt files during testing.

---

## 12. Success Metrics

Run data quality audit before/after each fix:
```bash
node scripts/data-quality-audit.cjs
```

Track:
- Health score trend (17 → target >70)
- Force link rate (30% → target >80%)
- Duplicate rate (23% → target <5%)
- Role classification coverage (should be 100% after backfill)
