# MI Platform — Session Status

**Updated**: 23 January 2026
**Phase**: 1d + 2a (Parallel)
**Status**: Email integration complete (monitoring), Relationship decay spec ready

---

## Session Handoff Summary (23 Jan 2026)

### What Was Completed This Session

| Task | Status | Evidence |
|------|--------|----------|
| Email sync (Make.com → Airtable) | ✅ | 21 emails synced |
| Email classifier workflow | ✅ | `n8n/workflows/email-classifier.json` deployed |
| Email dashboard (`/email`) | ✅ | Three-zone layout with J/K/E/S/D keys |
| Live end-to-end test | ✅ | Draft created in Outlook, email archived |
| SPEC-012 refinements | ✅ | Two-tier decay, UK public sector contacts, client tracking |
| DECISIONS.md updated | ✅ | I1 (HubSpot data source), I2 (LLM Chain) |

### Current Session (This Session)

**Branch consolidation & audit completed:**
- ✅ Merged 4 feature branches to main (stupefied-williams, vigilant-banzai, distracted-kapitsa, pedantic-cerf)
- ✅ Deep dive audit: workflow JSON, spec cross-references, skill files, dashboard components
- ✅ Fixed send-outreach.json (missing id/active fields)
- ✅ Marked SPEC-010-agentic-enrichment.md as superseded (naming collision fix)
- ✅ Moved workflow backups to archive/
- ✅ Fixed force-matching skill missing `user-invocable: false`
- ✅ Removed 5 duplicate skills from skills/ (now single source in .claude/skills/)
- ✅ Updated skills/README.md with 8 new n8n skills

**All changes merged to main and pushed to GitHub.**

### Next Session

1. **Daily email quality check** — 5 min spot-check per monitoring protocol
2. **Build remaining Phase 2a features**:
   - WF4: Relationship Decay Scanner (two-tier: deals + orgs)
   - WF5: Contact Auto-Creator (UK public sector domains)
   - Dashboard sections for decay alerts

### Key Decisions (Prior Session)

| Decision | Reference |
|----------|-----------|
| HubSpot as primary data source for engagement | DECISIONS.md I1 |
| Two-tier decay: Deal-level (8/15/30d) + Org-level (30/60/90d) | SPEC-012 §6 |
| Include Closed Won contacts (clients need check-ins) | SPEC-012 §6 |
| UK public sector contact auto-creation (not just police) | SPEC-012 §10 Phase 2a-8 |

### Branch State

- **Current branch**: `dreamy-jemison` (worktree)
- **Main branch**: At commit `5804935` (all branches merged + audit fixes)
- **Remote**: Synchronized with origin/main

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

1. **Continue Phase 1d monitoring** — track daily signal quality (background)
2. **Monitor WF5 enrichment quality** — verify HubSpot hybrid approach working
3. **Daily email quality check** — 5 min spot-check per protocol above
4. **Build Phase 2a-7**: Relationship Decay Scanner workflow
5. **Build Phase 2a-8**: Contact Auto-Creator workflow
6. **Run jobs audit after monitoring**: `node scripts/data-quality-audit.cjs`

---

## Blockers

None.

---

## Recent Session History

See `docs/archive/status-2026-01.md` for prior work.

---

*Last aligned with ANCHOR.md: 23 January 2026*
