# MI Platform — Session Status

**Updated**: 16 January 2025
**Phase**: 1 — Core Jobs Pipeline
**Session Goal**: Build Phase 1 workflows

---

## 🎯 Immediate Next Action

> **Test WF1: MI: Jobs Ingestion workflow**
> ```
> 1. Open workflow in n8n UI: https://n8n.srv1190997.hstgr.cloud/workflow/RqFcVMcQ7I8t4dIM
> 2. Run manual test
> 3. Verify signals created in Airtable Signals table
> ```

**Blockers**: None

---

## ✅ Done This Session
- [x] Created WF1: MI: Jobs Ingestion workflow (ID: `RqFcVMcQ7I8t4dIM`)
  - 18 nodes, polling Bright Data every 4 hours
  - Force matching with 47 patterns inlined
  - Creates signals in Airtable with status="new"
- [x] Created SPEC-001 Airtable schema (4 tables)
- [x] Seeded 48 UK police forces
- [x] Created `.claude/skills/airtable-schema/table-ids.json` artifact
- [x] Added Spec Drafting Hard Rules to CHAT-INSTRUCTIONS.md — enforces prep-spec gate before spec drafting

## 🔄 In Progress
- [ ] Test WF1 with manual trigger ← **START HERE**
- [ ] Build WF2: MI: Jobs Classifier workflow

## ⏳ Up Next (This Week)
1. Test WF1: MI: Jobs Ingestion workflow
2. Build WF2: MI: Jobs Classifier workflow
3. Build WF3: MI: Opportunity Creator workflow

---

## ⚠️ Blockers
None

**Manual tasks needed in Airtable UI:**
- Delete "Table 2" (tblfPgxDCh8eSEC25) — default table
- Add rollup fields to Opportunities: `signal_count` (COUNT), `signal_types` (ARRAYJOIN)

## 💡 Decisions Made This Session
| What | Logged? |
|------|---------|
| WF1: Polling approach (not webhooks) for Bright Data integration | No — per SPEC-002 |
| WF1: Simplified dedup for MVP (external_id generated but not checked) | No — iteration 1 |
| WF1: Patterns inlined in Code nodes (n8n can't require external files) | No — technical |
| Rollup fields (signal_count, signal_types) must be added manually in Airtable UI | No — API limitation |

---

## 📊 Phase 1 Progress

**Acceptance criteria**: See [ROADMAP.md](ROADMAP.md#phase-1-core-jobs-pipeline)

```
[███████░░░] 70% — Core Jobs Pipeline

Completed:
  ✅ Project setup
  ✅ Claude Code + MCPs configured
  ✅ Governance documentation
  ✅ Git repository initialized and pushed to GitHub
  ✅ Reference data merged (48 forces, 7 competitors, 14 capabilities)
  ✅ Guardrails documented (11 architectural rules)
  ✅ Reusable patterns created (force-matching, keywords, filters)
  ✅ AI prompts created (job classification, email triage)
  ✅ Phase 1 spec created (specs/phase-1-core-pipeline.md)
  ✅ n8n deployment scripts created
  ✅ Force-matching skill created
  ✅ Prep-spec command created
  ✅ Airtable schema created (4 tables: Forces, Contacts, Signals, Opportunities)
  ✅ 48 forces seeded
  ✅ WF1: Jobs Ingestion workflow created (RqFcVMcQ7I8t4dIM)

Remaining:
  □ Test WF1 end-to-end
  □ Jobs classifier workflow (WF2)
  □ Opportunity creator workflow (WF3)
  □ Opportunity enricher workflow (WF4)
  □ End-to-end test
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
