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
| WF5 (Agent Enrichment) | ✅ Tested | ID: c8TY69N65fGzQNai (live test passed) |
| WF9 (Competitor Receiver) | ✅ Fixed | status=new |
| Data Quality | ⏳ Monitoring | Target: >70/100 health score |

---

## SPEC-011 Agent Enrichment — Complete ✅

**Tracker**: `specs/IMPL-011.md`
**All 6 stages complete**: Parse → Audit → Plan → Build → Verify → Document

### Implementation Summary

**Approach**: Proper n8n AI Agents with tool-calling
- Contact Research Agent: 4 tools (HubSpot search, contact history, org structure, fit evaluation)
- Outreach Drafting Agent: 5 tools (signals, previous outreach, force context, Peel services, self-critique)
- Both agents use `@n8n/n8n-nodes-langchain.agent` with GPT-4o

**Key Files**:
- `n8n/workflows/wf5-agent-enrichment.json` — 31-node workflow with AI Agents
- `n8n/workflows/opportunity-enricher-backup.json` — Backup of original
- `reference-data/peel-services.json` — Service reference data

**n8n Workflow**: `MI: Agent Enrichment (SPEC-011)` (ID: `c8TY69N65fGzQNai`)
**Status**: ✅ Live tested and activated

### Live Test Results (23 Jan 2026)

| Check | Result |
|-------|--------|
| Workflow triggers via webhook | ✅ |
| Agent uses tools with correct parameters | ✅ |
| Agent returns structured JSON | ✅ |
| Airtable update succeeds | ✅ |
| Graceful error handling | ✅ |
| Execution time | ~9 seconds |

### HubSpot Data Validation (23 Jan 2026) ✅

| Check | Result |
|-------|--------|
| Company IDs valid | ✅ 48/48 (100%) |
| Sample contacts (Kent) | ✅ 89 contacts found |
| Sample contacts (North Wales) | ✅ 30 contacts found |
| Data foundation | ✅ Solid |

### HubSpot Integration Issue Identified

**Problem**: HTTP Request Tool for HubSpot returns 404, despite valid company IDs and contacts existing.

**Root cause**: Used HTTP Request Tool instead of standard HubSpot n8n node. No HubSpot Tool node exists for AI Agents.

**Decision**: Refactor to **hybrid approach**:
1. Use standard HubSpot node to batch-fetch contact IDs + basic info (reliable auth)
2. Code node creates summary (name, title - keeps token count low)
3. Agent evaluates summary, picks top 2-3 candidates
4. Agent tool fetches full details only for selected candidates

This handles scalability (100+ contacts per force) while using reliable standard nodes.

---

## Next Actions

1. **Refactor WF5 HubSpot integration** — implement hybrid approach (standard node + agent)
2. **Monitor for 1 week** — verify ongoing classification quality
3. **Run audit after monitoring**: `node scripts/data-quality-audit.cjs`

---

## Blockers

None.

---

## Recent Session History

See `docs/archive/status-2026-01.md` for prior work.

---

*Last aligned with ANCHOR.md: 23 January 2026*
