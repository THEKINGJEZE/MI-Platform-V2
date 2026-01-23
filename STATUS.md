# MI Platform — Session Status

**Updated**: 23 January 2026
**Phase**: 1d + 2a (Parallel)
**Status**: Jobs monitoring + Email integration starting

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

## Phase 1d Monitoring Period

**Started**: 23 January 2026
**Target End**: 30 January 2026 (1 week)
**Purpose**: Validate quality fixes before moving to Phase 2a

### Daily Checks (Automated via Bright Data)

| Day | Date | New Signals | Classification Quality | Notes |
|-----|------|-------------|----------------------|-------|
| 1 | 23 Jan | TBD | TBD | Monitoring started |
| 2 | 24 Jan | | | |
| 3 | 25 Jan | | | |
| 4 | 26 Jan | | | |
| 5 | 27 Jan | | | |
| 6 | 28 Jan | | | |
| 7 | 29 Jan | | | |

### Success Criteria for Phase Transition

- [ ] 7 days of data collected
- [ ] Classification accuracy >70% (false positive rate <30%)
- [ ] No duplicate signals created
- [ ] Competitor signals correctly flagged P1
- [ ] Data quality audit score >70/100

### Audit Command (Run at end of monitoring)

```bash
node scripts/data-quality-audit.cjs
```

---

## Phase 2a Email Integration — ACTIVE 🔄

**Spec**: `specs/SPEC-012-email-integration.md`
**Rationale**: Email workflow is independent of jobs pipeline — can run in parallel

### Make.com OAuth ✅ VERIFIED

| Connection | ID | Status |
|------------|-----|--------|
| My Microsoft connection | 6957096 | ✅ Active |
| V3 - Peel Solutions | 13210516 | ✅ Active |
| V4 | 13211124 | ✅ Active |

### Phase 2a-1: Make.com Bridge Setup ✅ COMPLETE

- [x] Verify Microsoft OAuth credentials
- [x] Create Airtable tables: Email_Raw (`tblYYyNm7yGbX3Ehj`), Emails (`tblaeAuzLbmzW8ktJ`)
- [x] Add relationship decay fields to Contacts table
- [x] Reactivate Email Sync scenario (ID: 8287614) — renamed to "V2"
- [x] Test Outlook → Make.com → Airtable flow — **10 emails synced successfully**
- [x] Reactivate Draft Creator scenario (ID: 8260100) — ✅ Activated
- [x] Reactivate Email Mover scenario (ID: 8260117) — ✅ Activated

### Phase 2a-2: Email Classifier Workflow ✅ COMPLETE

**n8n Workflow**: `MI: Email Classifier (V2)` (ID: `claAxaAZpqMbqUfr`)
**Status**: ✅ Live and operational

- [x] Create email classifier workflow (19 nodes)
- [x] Implement LLM Chain with gpt-4o-mini (NOT Agent per SPEC-012)
- [x] Add HubSpot contact enrichment (priority boost for open deals)
- [x] Add force pattern matching (G-005 compliance)
- [x] Test classification on synced emails — **21 emails classified successfully**

**Classification Results (23 Jan 2026)**:

| Classification | Count | Examples |
|----------------|-------|----------|
| 🔴 Urgent | 1 | Payment failed |
| 🟡 Today | 1 | Property inquiry |
| 🟢 Week | 3 | Follow-ups, meeting requests |
| ⚪ FYI | 16 | Newsletters, promotions, Google Alerts |

**Workflow Architecture**:
- Schedule: Every 5 minutes
- Fetches unprocessed emails from Email_Raw
- Force pattern matching before AI (G-005)
- HubSpot contact lookup for priority boost
- GPT-4o-mini classification with structured output
- Upserts to Emails table, marks Email_Raw as processed

### Phase 2a-3: Make.com Action Scenarios ✅ COMPLETE

**Activated scenarios** (23 Jan 2026):

| Scenario | ID | Webhook URL | Status |
|----------|-----|-------------|--------|
| Agent Tool – Draft Reply | 8260100 | `https://hook.eu2.make.com/5vldcow7gpmx847e48l7mm12t6jlnr74` | ✅ Active |
| Agent Tool – Move Email | 8260117 | `https://hook.eu2.make.com/9h0gbl5rekjux8yvza6reiysdr3wk3on` | ✅ Active |

### Phase 2a-4: Dashboard Email Queue ✅ COMPLETE

**New dashboard route**: `/email`

**Files created**:
- `dashboard/app/email/page.tsx` — Three-zone email review interface
- `dashboard/components/email-mode/` — Email-specific components
  - `email-queue-panel.tsx` — Queue with Urgent/Today/Week/All filters
  - `email-now-card.tsx` — Current email context display
  - `email-action-panel.tsx` — Draft preview + Approve/Skip/Archive actions
- `dashboard/app/api/emails/route.ts` — Email list API
- `dashboard/app/api/emails/[id]/route.ts` — Email action API
- `dashboard/lib/types/email.ts` — TypeScript types
- `dashboard/lib/airtable.ts` — Added email fetching functions

**Features**:
- J/K keyboard navigation
- E (Approve), S (Skip), D (Archive) shortcuts
- Z to undo (30-second window)
- Make.com webhook integration for Outlook draft creation
- ADHD-first design with Focus Mode filters

### Schema (Option D — 2 tables)

**Email_Raw** (Make.com syncs here):
- email_id, conversation_id, subject, from_email, from_name
- body_preview, received_at, folder, has_attachments
- synced_at, processed

**Emails** (n8n classifies here):
- email_id, classification, priority, action_type, status
- draft_response, key_request, ai_confidence, ai_reasoning
- waiting_since, follow_up_draft, skip_count, actioned_at
- force, contact, opportunity, hubspot_contact_id, has_open_deal

**Contacts additions**:
- relationship_status, last_contact_date, decay_alert_sent, next_touchpoint_suggestion

---

## Phase 2a-5: Live End-to-End Test ✅ COMPLETE

**Tested**: 23 January 2026

| Test | Result | Evidence |
|------|--------|----------|
| Draft Reply webhook | ✅ Pass | Draft created in Outlook Drafts folder |
| Move Email webhook | ✅ Pass | Email moved to Archive |
| Airtable status update | ✅ Pass | Records updated to approved/done |

---

## Phase 2a-6: Email Quality Monitoring Period

**Started**: 23 January 2026
**Target End**: 30 January 2026 (1 week)
**Purpose**: Validate email pipeline quality before considering Phase 2a complete

### Daily Checks

| Day | Date | New Emails | Classification Accuracy | Contact Match Rate | Draft Quality | Notes |
|-----|------|------------|------------------------|-------------------|---------------|-------|
| 1 | 23 Jan | 21 | TBD | TBD | TBD | Initial sync |
| 2 | 24 Jan | | | | | |
| 3 | 25 Jan | | | | | |
| 4 | 26 Jan | | | | | |
| 5 | 27 Jan | | | | | |
| 6 | 28 Jan | | | | | |
| 7 | 29 Jan | | | | | |

### Success Criteria

**Data Completeness**:
- [ ] All synced emails have matching Emails record (no orphans in Email_Raw)
- [ ] No duplicate email_ids in Emails table
- [ ] `processed` flag correctly set in Email_Raw after classification

**Classification Quality**:
- [ ] Classification accuracy >80% (spot-check 10 emails/day)
- [ ] Urgent emails correctly identified (no false negatives)
- [ ] FYI emails don't include actionable items (no false positives)
- [ ] `ai_confidence` scores correlate with actual accuracy

**Contact Identification**:
- [ ] Police sender emails linked to correct Force (>90%)
- [ ] HubSpot contact matches where contact exists (>80%)
- [ ] `has_open_deal` correctly populated when deals exist

**Draft Response Quality**:
- [ ] Drafts follow Peel voice/tone
- [ ] Drafts reference correct context from email
- [ ] No hallucinated information in drafts
- [ ] Drafts are appropriate length (not too long/short)

### Quality Check Commands

```bash
# Count emails by status
# Run in Airtable or via script

# Check for duplicates
# filterByFormula: COUNT(email_id) > 1

# Check orphaned Email_Raw records
# filterByFormula: AND({processed} = TRUE(), FIND(email_id, Emails) = 0)
```

### Manual Review Protocol

Daily (5 min):
1. Open Airtable Emails table
2. Filter to emails classified today
3. Spot-check 5 random classifications — are they correct?
4. Check 2 draft responses — are they appropriate?
5. Log any issues in Notes column above

---

## Next Actions

1. **Merge PR to main** — Email integration branch ready at `stupefied-williams`
2. **Continue Phase 1d monitoring** — track daily signal quality (background)
3. **Daily email quality check** — 5 min spot-check per protocol above
4. **Run jobs audit after monitoring**: `node scripts/data-quality-audit.cjs`

---

## Blockers

None.

---

## Recent Session History

See `docs/archive/status-2026-01.md` for prior work.

---

*Last aligned with ANCHOR.md: 23 January 2026*
