# Specs Directory

## Purpose

Phase implementation specifications. Each phase from [ROADMAP.md](../ROADMAP.md) gets a detailed spec here.

## Spec Structure

Each spec should include:

1. **Overview** — Goal and expected outcome
2. **Architecture** — Data flow diagram
3. **Tables** — Airtable schema requirements
4. **Workflows** — n8n workflows to build (with guardrail references)
5. **Testing Plan** — How to verify it works
6. **Acceptance Criteria** — Copied from ROADMAP.md (source of truth)
7. **Build Sequence** — Order of operations
8. **Dependencies** — What's needed before building

## Strategy Divergence Check

**Every spec must answer this before implementation.**

### Question: Does this spec implement what the strategy document specifies?

- **If YES** → No action needed, proceed with build
- **If NO** → Complete the divergence table and checklist below

### Divergence Table (required if spec differs from strategy)

| Strategy Section | Strategy Says | Spec Does Instead | Rationale |
|------------------|---------------|-------------------|-----------|
| e.g. Section 11 | React dashboard | Airtable Interface | Speed-to-value for Phase 1 |

### Approval Checklist (all required for any divergence)

- [ ] Divergence documented in table above
- [ ] Reviewed using alignment-checker agent
- [ ] James explicitly approved the trade-off
- [ ] Decision logged in DECISIONS.md (Tier 2 minimum)

**Specs with undocumented strategy divergence must not be implemented.**

## Naming Convention

`phase-{number}-{short-name}.md`

Examples:
- `phase-1-core-pipeline.md`
- `phase-1b-competitors.md`
- `phase-2a-email.md`

## Active Specs

| Spec | Phase | Status |
|------|-------|--------|
| [SPEC-001-airtable-schema.md](SPEC-001-airtable-schema.md) | 1 | ✅ Complete |
| [SPEC-002-jobs-ingestion.md](SPEC-002-jobs-ingestion.md) | 1 | ✅ Complete |
| [SPEC-003-signal-classification.md](SPEC-003-signal-classification.md) | 1 | ✅ Complete |
| [SPEC-004-opportunity-creator.md](SPEC-004-opportunity-creator.md) | 1 | ✅ Complete |
| [SPEC-005-opportunity-enricher.md](SPEC-005-opportunity-enricher.md) | 1 | ✅ Complete |
| [SPEC-006-monday-review.md](SPEC-006-monday-review.md) | 1 | 🔀 Absorbed into SPEC-009 |
| [SPEC-008-morning-brief.md](SPEC-008-morning-brief.md) | Future | ⏸️ Deferred |
| [SPEC-009-dashboard-v1-migration.md](SPEC-009-dashboard-v1-migration.md) | 1c | ✅ Ready |
| [SPEC-1b-competitor-monitoring.md](SPEC-1b-competitor-monitoring.md) | 1b | ✅ Complete |

## Archived Specs

Completed phase specs stay here for reference. They don't move to archive.

---

*Specs are the "what to build" — GUARDRAILS.md is the "how to build it safely"*
