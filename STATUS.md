# MI Platform — Session Status

**Updated**: 23 January 2026
**Phase**: 1d — Quality Improvement
**Status**: ✅ SPEC-010 Implementation Complete — Monitoring Period

---

## SPEC-010 Pipeline Remediation — Complete ✅

**Tracker**: `specs/IMPL-010.md`
**All 6 stages complete**: Parse → Audit → Plan → Build → Verify → Document

### Fixes Deployed

| Fix | Description | Status |
|-----|-------------|--------|
| Fix 0 | Competitor signals get status=new | ✅ Deployed |
| Fix 1 | v2.1 classification prompt + new fields | ✅ Deployed |
| Fix 2-3 | Signal/Opportunity deduplication | ✅ Already in place |
| Fix 4+6 | Backfill script executed | ✅ 383 signals processed |

### Files Changed

- **Airtable**: role_category (renamed), role_detail (created)
- **n8n**: MI: Competitor Receiver (status=new), MI: Jobs Classifier (v2.1 prompt)
- **Scripts**: `scripts/backfill-classification.cjs`

### Verification Results

- ✅ Schema fields verified (role_category, role_detail, ai_confidence)
- ✅ Workflows updated and active
- ✅ Classification working (false positives rejected correctly)
- ✅ Backfill complete: 383 signals re-classified, ~47% relevant, ~140 forces linked
- ⏳ Awaiting new competitor signals to verify Fix 0 end-to-end

---

## Current State

| Component | Status | Notes |
|-----------|--------|-------|
| Dashboard | ✅ Live | https://dashboard.peelplatforms.co.uk/review |
| WF3 (Classification) | ✅ Updated | v2.1 prompt deployed |
| WF5 (Agent Enrichment) | ✅ v2.2 Live | Deployed & tested (hybrid HubSpot + GPT-4.1-mini) |
| WF9 (Competitor Receiver) | ✅ Fixed | status=new |
| Data Quality | ⏳ Monitoring | Target: >70/100 health score |

---

## SPEC-011 Agent Enrichment — Complete ✅

**Tracker**: `specs/IMPL-011.md`
**All 6 stages complete**: Parse → Audit → Plan → Build → Verify → Document

### Implementation Summary

**Approach**: Proper n8n AI Agents with tool-calling + hybrid HubSpot integration
- Contact Research Agent: 3 tools (contact history, org structure, fit evaluation)
- Outreach Drafting Agent: 5 tools (signals, previous outreach, force context, Peel services, self-critique)
- Both agents use `@n8n/n8n-nodes-langchain.agent` with **GPT-4.1-mini**
- HubSpot contacts pre-fetched via standard n8n node (not agent tool)

**Key Files**:
- `n8n/workflows/wf5-agent-enrichment.json` — 33-node workflow with AI Agents (v2.2)
- `n8n/workflows/wf5-agent-enrichment-backup-20260123.json` — Pre-v2.1 backup
- `n8n/workflows/opportunity-enricher-backup.json` — Original backup
- `reference-data/peel-services.json` — Service reference data
- `prompts/contact-research-agent.md` — Updated to v2.0 (hybrid approach)

**n8n Workflow**: `MI: Agent Enrichment (SPEC-011)` (ID: `c8TY69N65fGzQNai`)
**Status**: ✅ v2.2 deployed and tested

### Live Test Results (23 Jan 2026)

| Check | Result |
|-------|--------|
| Workflow triggers via webhook | ✅ |
| HubSpot contacts pre-fetched | ✅ |
| Contact summary reduces tokens | ✅ |
| Agent uses tools with correct parameters | ✅ |
| Agent returns structured JSON | ✅ |
| Airtable update succeeds | ✅ |
| Tool schema errors fixed (v2.2) | ✅ |
| Execution time | ~7 seconds |

### HubSpot Data Validation (23 Jan 2026) ✅

| Check | Result |
|-------|--------|
| Company IDs valid | ✅ 48/48 (100%) |
| Sample contacts (Kent) | ✅ 89 contacts found |
| Sample contacts (North Wales) | ✅ 30 contacts found |
| Data foundation | ✅ Solid |

### HubSpot Integration Issue — FIXED ✅

**Problem**: HTTP Request Tool for HubSpot returned 404, despite valid company IDs and contacts existing.

**Root cause**: HTTP Request Tools in n8n agent context don't properly inherit credential authentication.

**Solution implemented (v2.1)**:
1. ✅ Standard n8n HTTP Request node pre-fetches contacts (reliable auth)
2. ✅ Code node summarizes contacts (~2K tokens vs 50K)
3. ✅ Agent evaluates pre-fetched summary
4. ✅ Model switched to GPT-4.1-mini (optimized for tool calling, 83% cheaper than GPT-4o)

### v2.2 Changes Summary

| Change | Before | After |
|--------|--------|-------|
| HubSpot fetch | Agent HTTP Tool (broken) | Standard n8n node |
| Contact data | Agent searches on demand | Pre-fetched & summarized |
| Model | GPT-4o | GPT-4.1-mini |
| Max iterations | 5 | 3 |
| Tool schemas | Missing (caused errors) | All HTTP tools have inputSchema |
| Estimated cost/opp | ~$0.04 | ~$0.008 |

---

## Next Actions

1. **Monitor WF5 for 1 week** — verify ongoing enrichment quality
2. **Monitor classification quality** — verify ongoing signal quality
3. **Run audit after monitoring**: `node scripts/data-quality-audit.cjs`

---

## Blockers

None.

---

## Recent Session History

See `docs/archive/status-2026-01.md` for prior work.

---

*Last aligned with ANCHOR.md: 23 January 2026*
