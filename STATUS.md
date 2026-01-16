# MI Platform — Session Status

**Updated**: 16 January 2025
**Phase**: 1 — Core Jobs Pipeline
**Session Goal**: Complete Claude Code self-audit enhancements, prepare for Phase 1 build

---

## 🎯 Immediate Next Action

> **Create Phase 1 tables in cleared MI Platform base:**
> ```
> 1. Create tables per Phase 1 spec (Forces, Jobs_Raw_Archive, Signals, etc.)
> 2. Seed 48 forces from reference-data/uk-police-forces.json
> 3. Update schema-reference.json with real table/field IDs
> 4. Build WF1: MI: Jobs Ingestion workflow
> ```

**Blockers**: None — MI Platform base (`appEEWaGtGUwOyOhm`) cleared and ready

---

## ✅ Done This Session
- [x] Created prep-spec command:
  - `.claude/commands/prep-spec.md` — Generate context briefs for Claude Chat
  - Updated `docs/CHAT-INSTRUCTIONS.md` with Spec Creation Protocol
  - Updated `CLAUDE.md` quick commands table
  - Test output: `specs/NEXT-CONTEXT.md` (81 lines, under 100 limit)

## 🔄 In Progress
- [ ] Create Phase 1 tables in MI Platform base ← **START HERE**
- [ ] Update schema-reference.json with real table/field IDs

## ⏳ Up Next (This Week)
1. Create Phase 1 tables in cleared base
2. Seed forces from reference-data/uk-police-forces.json
3. Update Airtable schema skill with real IDs
4. Build WF1: MI: Jobs Ingestion workflow

---

## ⚠️ Blockers
None — MI Platform base cleared and ready

## 💡 Decisions Made This Session
| What | Logged? |
|------|---------|
| Phase 1 spec defines 4 workflows with clear sequence | Pending |
| Force-matching skill enforces G-005 guardrail | Pending |
| n8n scripts use ESM modules (matches package.json) | Pending |

---

## 📊 Phase 1 Progress

**Acceptance criteria**: See [ROADMAP.md](ROADMAP.md#phase-1-core-jobs-pipeline)

```
[████░░░░░░] 45% — Core Jobs Pipeline

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

Remaining:
  □ Create Phase 1 tables in Airtable
  □ Seed 48 forces
  □ Indeed ingestion workflow (WF1)
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
