# MI Platform — Session Status

**Updated**: 17 January 2025
**Phase**: 1 — Core Jobs Pipeline
**Session Goal**: Build WF4: Opportunity Creator

---

## 🎯 Immediate Next Action

> **Build WF4: MI: Opportunity Creator**
> - Triggered when signals marked as `status=relevant`
> - Groups signals by force into opportunities
> - Creates opportunity records in Airtable

**Blockers**: None

**Manual task for James**:
- Activate WF3 schedule in n8n UI (toggle the Active switch)

---

## ✅ Done This Session
- [x] **`/implement` slash command created** ✅
  - Stage-gated spec implementation with external progress tracking
  - Six stages: Parse → Audit → Plan → Build → Verify → Document
  - Survives context limits via IMPL-XXX.md tracker files
  - Explicit gates require user confirmation before proceeding
  - Supports `--status`, `--resume`, `--reset` flags
- [x] **SPEC-003: Signal Classification COMPLETE** ✅
  - **WF3: MI: Jobs Classifier** (`w4Mw2wX9wBeimYP2`)
  - Uses OpenAI gpt-4o-mini for classification
  - Force pattern matching runs BEFORE AI (G-005 compliant)
  - Updates signals: `relevance_score`, `relevance_reason`, `status`, `force`
  - Status logic: score >= 70 → relevant, < 70 → irrelevant
  - Force linking at >= 80% confidence
  - Loop-back to process additional signals until queue empty
  - Tested successfully with 14+ signals
  - Exported to `n8n/workflows/jobs-classifier.json`
- [x] **n8n Airtable node bug workaround**
  - Discovered: Resource Locator fields don't evaluate expressions in loops
  - Solution: Use HTTP Request node for Airtable updates instead of native node
  - AI echo-back pattern: Pass signal_id to AI, have it return in response
- [x] All previous SPEC-001 and SPEC-002 work (see git history)

## 🔄 In Progress
- [ ] Build WF4: MI: Opportunity Creator ← **START HERE**

## ⏳ Up Next (This Week)
1. Activate WF3 schedule (manual in n8n UI)
2. Build WF4: MI: Opportunity Creator workflow
3. Build WF5: MI: Opportunity Enricher workflow
4. Full end-to-end test with real Bright Data scrape

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
| WF3 uses OpenAI gpt-4o-mini (not Claude) | No — per SPEC-003 spec, cost-effective for classification |
| WF3 schedule: Every 15 minutes | No — frequent enough to catch new signals quickly |
| HTTP Request for Airtable updates in loops | No — n8n bug: Resource Locator fields don't eval expressions in loops |
| AI echo-back pattern for signal_id tracking | No — workaround for n8n pairedItem chain breaking through Langchain nodes |

---

## 📊 Phase 1 Progress

**Acceptance criteria**: See [ROADMAP.md](ROADMAP.md#phase-1-core-jobs-pipeline)

```
[██████████] 92% — Core Jobs Pipeline

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
  ✅ /implement command created (stage-gated spec execution)
  ✅ Airtable schema created (4 tables: Forces, Contacts, Signals, Opportunities)
  ✅ 48 forces seeded
  ✅ WF1: Jobs Trigger workflow (RqFcVMcQ7I8t4dIM)
  ✅ WF2: Jobs Receiver workflow (nGBkihJb6279HOHD)
  ✅ SPEC-002: Jobs Ingestion complete (webhook, dedupe, logging)
  ✅ WF3: Jobs Classifier workflow (w4Mw2wX9wBeimYP2) — TESTED & WORKING

Remaining:
  □ Activate WF3 schedule (manual in n8n UI)
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
Indeed jobs (daily) → WF1 triggers → WF2 ingests → WF3 classifies
→ WF4 creates opportunities → WF5 enriches → Monday: 3-5 leads ready to review
```

---

*Last aligned with ANCHOR.md: 17 January 2025*
