# MI Platform — Session Status

**Updated**: 16 January 2025 18:00
**Phase**: 1 — Core Jobs Pipeline
**Session Goal**: Complete SPEC-002 Jobs Ingestion

---

## 🎯 Immediate Next Action

> **Build WF3: MI: Jobs Classifier**
> - Triggered when new signals arrive with status="new"
> - Uses Claude API to classify relevance (0-100 score)
> - Updates signal status: relevant/irrelevant
> - Links relevant signals to Forces table

**Blockers**: None

---

## ✅ Done This Session
- [x] Refactored to webhook-based architecture (polling had timeout issues)
  - **WF1: MI: Jobs Trigger** (`RqFcVMcQ7I8t4dIM`) — triggers scrape, returns immediately
  - **WF2: MI: Jobs Receiver** (`nGBkihJb6279HOHD`) — receives webhook, processes jobs
- [x] Webhook config: `https://n8n.srv1190997.hstgr.cloud/webhook/mi-jobs-receiver`
- [x] Force matching with 48 patterns inlined
- [x] Creates signals in Airtable with status="new"
- [x] Created SPEC-001 Airtable schema (4 tables)
- [x] Seeded 48 UK police forces
- [x] Created `.claude/skills/airtable-schema/table-ids.json` artifact
- [x] **Tested webhook architecture end-to-end** ✅
  - Fixed Airtable base ID (was wrong base)
  - Fixed field names to match SPEC-001 schema
  - Test records created successfully in Signals table
- [x] **Force linking working** ✅
  - Added Airtable: Fetch Forces node to get force record IDs
  - Added Merge node to combine jobs with forces lookup
  - Fixed Merge connections (input 0=jobs, input 1=forces)
  - Signals now link to Forces table via `force` field
- [x] **Force pattern alignment with Airtable** ✅
  - Fixed "Avon and Somerset Constabulary" → "Avon and Somerset Police"
  - Fixed "Devon and Cornwall Police" → "Devon & Cornwall Police"
  - Added national forces (NCA, MoD Police, CNC)
  - Updated patterns/force-matching.js to match workflow
- [x] **Fixed webhook payload parsing**
  - Added support for nested body.body structure from MCP test calls
  - Added support for triple-nested body.body.body structure
- [x] **Deduplication implemented and tested** ✅
  - Created external_id field in Airtable Signals table (fld8GCyoVENwehPvL)
  - Added Airtable: Check Existing node to search for duplicates
  - Added Code: Filter New Jobs node to remove duplicates
  - Tested with duplicate URL — correctly filtered (0 records created)
  - Per SPEC-002 Node 6 requirement
- [x] **Enhanced execution logging** ✅
  - Updated Set: Log Summary node with complete metrics per SPEC-002 Node 8
  - Now logs: jobs_fetched, jobs_filtered, jobs_created, jobs_skipped, duration_ms
  - Provides full visibility into pipeline performance

## 🔄 In Progress
- [ ] Build WF3: MI: Jobs Classifier workflow ← **START HERE**

## ⏳ Up Next (This Week)
1. Build WF3: MI: Jobs Classifier workflow
2. Build WF4: MI: Opportunity Creator workflow
3. Full end-to-end test with real Bright Data scrape

---

## ⚠️ Blockers
None

**Manual tasks needed in Airtable UI:**
- Delete "Table 2" (tblfPgxDCh8eSEC25) — default table
- Add rollup fields to Opportunities: `signal_count` (COUNT), `signal_types` (ARRAYJOIN)

## 💡 Decisions Made This Session
| What | Logged? |
|------|---------|
| Webhook-based architecture (not polling) | Yes — polling timed out after 20 attempts |
| Two-workflow design (Trigger + Receiver) | Yes — proven pattern from archived workflows |
| Bright Data delivers to webhook callback | Yes — `deliver.type: 'webhook'` |
| Patterns inlined in Code nodes | No — n8n can't require external files |
| Fixed base ID: appEEWaGtGUwOyOhm | No — was pointing to wrong base |
| Field names match SPEC-001 (`url` not `source_url`) | No — schema alignment |
| Deduplication via Airtable search + filter | No — SPEC-002 requirement, straightforward implementation |
| Enhanced logging with 8 metrics | No — SPEC-002 Node 8 requirement |
| Schedule: Daily 06:00 (not every 4 hours) | No — user preference for less frequent runs |

---

## 📊 Phase 1 Progress

**Acceptance criteria**: See [ROADMAP.md](ROADMAP.md#phase-1-core-jobs-pipeline)

```
[█████████░] 80% — Core Jobs Pipeline

Completed:
  ✅ Project setup
  ✅ Claude Code + MCPs configured
  ✅ Governance documentation
  ✅ Git repository initialized and pushed to GitHub
  ✅ Reference data merged (48 forces, 7 competitors, 14 capabilities)
  ✅ Guardrails documented (11 architectural rules)
  ✅ Reusable patterns created (force-matching, keywords, filters)
  ✅ AI prompts created (job classification, email triage)
  ✅ n8n deployment scripts created
  ✅ Force-matching skill created
  ✅ Prep-spec command created
  ✅ Airtable schema created (4 tables: Forces, Contacts, Signals, Opportunities)
  ✅ 48 forces seeded
  ✅ WF1: Jobs Trigger workflow (RqFcVMcQ7I8t4dIM)
  ✅ WF2: Jobs Receiver workflow (nGBkihJb6279HOHD)
  ✅ SPEC-002: Jobs Ingestion complete (webhook, dedupe, logging)

Remaining:
  □ Jobs classifier workflow (WF3)
  □ Opportunity creator workflow (WF4)
  □ Opportunity enricher workflow (WF5)
  □ End-to-end test with real data
```

---

## 🔧 MCP Status (Verified 16 Jan 2025)

| MCP | Status |
|-----|--------|
| airtable | ✅ Active |
| n8n-mcp | ✅ Active |
| hubspot | ✅ Active |
| playwright | ✅ Active |
| context7 | ✅ Active |

---

## 🚨 Mission Reminder
*From [ANCHOR.md](ANCHOR.md):*
- 3-5 ready-to-send leads every Monday
- ≤15 min review time
- Reduce James's cognitive load

**How Phase 1 delivers the Monday goal:**
```
Indeed jobs (daily) → WF1 ingests → WF2 classifies → WF3 creates opportunities
→ WF4 enriches with contacts + draft messages → Monday: 3-5 leads ready to review
```

---

*Last aligned with ANCHOR.md: 16 January 2025*
