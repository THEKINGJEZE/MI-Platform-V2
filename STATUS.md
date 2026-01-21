# MI Platform — Session Status

**Updated**: 21 January 2025  
**Phase**: 1d — Quality Improvement  
**Status**: ✅ IMPLEMENTATION COMPLETE — Pending deployment & testing

---

## Session Work (21 Jan - Afternoon)

### Phase 1: Classification Fixes (WF3) ✅
- ✅ Fixed gate logic: `confidence >= 70` → `aiResponse.relevant === true`
- ✅ Updated classification prompt with hard gates (sworn officers, non-police orgs, out-of-scope roles)
- ✅ Added schema fields: role_type, seniority, ai_confidence, force_source
- ✅ Classifier now writes all extracted fields to Airtable

### Phase 1b: Deduplication ✅
- ✅ Added lifecycle fields: first_seen, last_seen, scrape_count
- ✅ Implemented upsert in Indeed ingestion (jobs-receiver.json)
- ✅ Implemented upsert in competitor receiver (WF9)

### Phase 2: Opportunity Creator (WF4) ✅
- ✅ Tracks competitor signals in "Code: Filter & Group by Force"
- ✅ Sets is_competitor_intercept flag on create and update
- ✅ Opportunity lookup filter verified correct

### Phase 3: Enrichment (WF5) ✅
- ✅ Added signal fetch nodes for rich context
- ✅ Enrichment prompt now includes actual signal titles and role types
- ✅ Added P1 guardrail (G-013): Competitor intercepts forced to score≥90, tier='hot'

### Phase 4: Data Cleanup Scripts ✅
- ✅ `scripts/cleanup-signals.js` — Reclassify irrelevant signals
- ✅ `scripts/merge-opportunities.js` — Merge duplicate opportunities per force
- ✅ `scripts/recompute-priorities.js` — Fix competitor opportunity priorities

### Phase 5: Agentic Spec ✅
- ✅ `specs/SPEC-010-agentic-enrichment.md` — Multi-agent architecture design

---

## Next Actions

1. **Run cleanup scripts (dry-run first)**:
   ```bash
   node scripts/cleanup-signals.js --dry-run
   node scripts/merge-opportunities.js --dry-run
   node scripts/recompute-priorities.js --dry-run
   ```
2. **Test end-to-end**: Run pipeline with a test signal to verify all changes work together
3. **Monitor for 1 week**: Verify false positive rate drops and competitor signals get P1 priority
4. **After validation**: Implement SPEC-010 (agentic enrichment)

---

## Current State

| Component | Status | Notes |
|-----------|--------|-------|
| Dashboard | ✅ Deployed | https://dashboard.peelplatforms.co.uk/review |
| WF3 (Classification) | ✅ Deployed | Gate logic fixed, writes role_type, seniority |
| WF4 (Opportunity Creator) | ✅ Deployed | G-013 competitor flag added |
| WF5 (Enrichment) | ✅ Deployed | Signal fetch + P1 guardrail added |
| WF9 (Competitor Receiver) | ✅ Deployed | Upsert logic implemented |
| Jobs Receiver | ✅ Deployed | Upsert logic, first_seen/last_seen/scrape_count |
| Cleanup Scripts | ✅ Created | Ready for dry-run |
| Schema | ✅ Updated | New fields added via MCP |

---

## Files Modified This Session

**Workflows**:
- `n8n/workflows/jobs-classifier.json`
- `n8n/workflows/jobs-receiver.json`
- `n8n/workflows/opportunity-creator.json`
- `n8n/workflows/opportunity-enricher.json`
- WF9: MI: Competitor Receiver (via n8n MCP)

**Scripts (new)**:
- `scripts/cleanup-signals.js`
- `scripts/merge-opportunities.js`
- `scripts/recompute-priorities.js`

**Specs (new)**:
- `specs/SPEC-010-agentic-enrichment.md`

**Schema additions**:
- Signals: role_type, seniority, ai_confidence, force_source, first_seen, last_seen, scrape_count

---

## Success Criteria (Phase 1d)

| Metric | Before | Target | Status |
|--------|--------|--------|--------|
| False positive rate | ~80% | <10% | Pending test |
| Duplicate signals | 37-53% | <5% | Pending test |
| Competitor opps flagged P1 | 22% | 100% | Pending test |
| Summaries cite signals | ~15% | >90% | Pending test |
| Opps per force | 1-5 | 1 | Pending cleanup |

---

## Blockers

None — ready for deployment and testing.

---

*Last aligned with ANCHOR.md: 21 January 2025*
