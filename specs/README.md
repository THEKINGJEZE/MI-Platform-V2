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

## Naming Convention

`phase-{number}-{short-name}.md`

Examples:
- `phase-1-core-pipeline.md`
- `phase-1b-competitors.md`
- `phase-2a-email.md`

## Active Specs

| Spec | Phase | Status |
|------|-------|--------|
| [phase-1-core-pipeline.md](phase-1-core-pipeline.md) | 1 | Building |

## Archived Specs

Completed phase specs stay here for reference. They don't move to archive.

---

*Specs are the "what to build" — GUARDRAILS.md is the "how to build it safely"*
