# MI Platform — Session Status

**Updated**: 16 January 2025  
**Phase**: 1 — Core Jobs Pipeline  
**Session Goal**: Merge battle-tested assets from Fresh-Start, then build

---

## 🎯 Immediate Next Action

> **Create Airtable base and seed data:**
> ```
> 1. Create Airtable base with full schema
> 2. Seed 48 UK police forces (reference-data/uk-police-forces.json)
> 3. Seed 7 competitors (reference-data/competitors.json)
> ```

**Blockers**: None — ready to proceed. Dashboard V1 review complete (`docs/archive/dashboard-v1-review.md`).

---

## ✅ Done This Session
- [x] Merged reference data from MI-Platform-Fresh-Start:
  - `reference-data/uk-police-forces.json` (48 forces)
  - `reference-data/competitors.json` (7 competitors)
  - `reference-data/capability-areas.json` (14 capability areas)
- [x] Created reusable patterns:
  - `patterns/force-matching.js` (50 fuzzy patterns)
  - `patterns/indeed-keywords.json` (30 search keywords)
  - `patterns/job-portal-filters.js` (URL filters)
- [x] Created AI prompts:
  - `prompts/job-classification.md`
  - `prompts/email-triage.md`
- [x] Created `docs/GUARDRAILS.md` (11 architectural rules from lessons learned)
- [x] Updated CLAUDE.md with guardrails section
- [x] Updated docs/DEPENDENCY-MAP.md with new files
- [x] Dashboard V1 review completed (`docs/archive/dashboard-v1-review.md`)

## 🔄 In Progress
- [ ] Create Airtable base for MI Platform V2 ← **START HERE**
- [ ] Seed 48 UK police forces
- [ ] Seed 7 competitors

## ⏳ Up Next (This Week)
1. Create Airtable base with schema
2. Seed reference data
3. Create Phase 1 spec (`specs/phase-1-core-pipeline.md`)
4. Deploy first n8n workflow

---

## ⚠️ Blockers
None — MCPs are working, governance docs in place

## 💡 Decisions Made This Session
| What | Logged? |
|------|---------|
| Two-layer Claude architecture (Chat=strategy, Code=execution) | ☑️ A4 |
| Document hygiene protocol with size limits | ☑️ A6 |
| Single source of truth + dependency map | ☑️ A7 |

---

## 📊 Phase 1 Progress

**Acceptance criteria**: See [ROADMAP.md](ROADMAP.md#phase-1-core-jobs-pipeline)

```
[███░░░░░░░] 25% — Core Jobs Pipeline

Completed:
  ✅ Project setup
  ✅ Claude Code + MCPs configured
  ✅ Governance documentation
  ✅ Reference data merged (48 forces, 7 competitors, 14 capabilities)
  ✅ Guardrails documented (11 architectural rules)
  ✅ Reusable patterns created (force-matching, keywords, filters)
  ✅ AI prompts created (job classification, email triage)

Remaining:
  □ Airtable base + schema
  □ Data seeded
  □ Indeed ingestion workflow
  □ Signal classification
  □ Opportunity creation + enrichment
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

---

*Last aligned with ANCHOR.md: 16 January 2025*
