# Specs Directory

## Purpose

Phase implementation specifications. Each phase from [ROADMAP.md](../ROADMAP.md) gets a detailed spec here.

## Spec Structure

Each spec should include:

1. **Pre-Flight Checklist** — Compliance evidence (see template below)
2. **Overview** — Goal and expected outcome
3. **Architecture** — Data flow diagram
4. **Tables** — Airtable schema requirements
5. **Workflows** — n8n workflows to build (with guardrail references)
6. **Testing Plan** — How to verify it works (5+ specific scenarios)
7. **Acceptance Criteria** — Copied from ROADMAP.md (source of truth)
8. **Build Sequence** — Order of operations
9. **Dependencies** — What's needed before building

### Pre-Flight Checklist Template

Every new spec MUST include this section at the top (after status/metadata):

```markdown
## Pre-Flight Checklist

Before this spec can be considered complete:

- [ ] `/prep-spec <topic>` was run before drafting
- [ ] `specs/NEXT-CONTEXT.md` was reviewed
- [ ] Acceptance criteria copied verbatim from ROADMAP.md
- [ ] Guardrails reviewed; applicable ones cited inline (G-XXX)
- [ ] Strategy divergence check completed (see table below if diverging)
- [ ] Testing plan includes 5+ specific test scenarios
- [ ] Build sequence defines implementation order

**Specs missing this checklist are incomplete.**
```

**Note**: The spec creation hook (`.claude/hooks/pre-edit-check.sh`) will block creation of new specs if `specs/NEXT-CONTEXT.md` doesn't exist. Run `/prep-spec <topic>` first.

**Grandfathered Specs**: Specs SPEC-001 through SPEC-011 and SPEC-1b predate this requirement (Decision A13, January 2026). They are exempt as they are already implemented.

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
| [SPEC-012-email-integration.md](SPEC-012-email-integration.md) | 2a | 📝 Fallback (n8n approach) |
| [SPEC-014-clawdbot-email-processor.md](SPEC-014-clawdbot-email-processor.md) | 2a | ✅ Ready |

## Archived Specs

Completed phase specs stay here for reference. They don't move to archive.

---

*Specs are the "what to build" — GUARDRAILS.md is the "how to build it safely"*

---

## Implementation Tracker (IMPL-XXX.md)

Every spec implementation MUST have an IMPL tracker. This tracks progress through the 6-stage implementation framework.

### When to Create

Create `specs/IMPL-XXX.md` when starting implementation of `SPEC-XXX`.

### Template Location

See `.claude/rules/implementation-stages.md` for the full IMPL tracker template.

### Quick Reference

| Stage | Name | Purpose |
|-------|------|---------|
| 1 | Parse | Extract acceptance criteria, guardrails, dependencies |
| 2 | Audit | Verify schema, APIs, files exist |
| 3 | Plan | Order tasks with dependencies |
| 4 | Build | Execute and track each task |
| 5 | Verify | Test every acceptance criterion — **CANNOT SKIP** |
| 6 | Document | Update STATUS.md, commit, record artifacts |

---

## Mandatory Verification Checklist

Every spec implementation MUST complete these verification steps before marking complete.

### Pre-Build

- [ ] ANCHOR.md drift check (4 questions answered)
- [ ] Schema fields verified via Airtable MCP
- [ ] Dependencies verified (prior specs complete)
- [ ] IMPL-XXX.md created with Stage 1 complete

### Post-Build

- [ ] Workflow deployed and active in n8n
- [ ] Test execution completed (capture execution ID)
- [ ] Output records verified in Airtable
- [ ] All acceptance criteria marked ✅ or documented why ⏳

### If Verification Blocked

For any acceptance criterion that cannot be immediately verified:

1. Document WHY in the IMPL tracker
2. Create specific follow-up trigger ("After next Bright Data run...")
3. Add to STATUS.md "Pending Verification" section
4. Set calendar reminder or monitoring task

**Example:**
```markdown
AC-3: ⏳ Awaiting new signals
- Reason: No new competitor signals since fix deployed
- Follow-up: After next Bright Data run, verify status=new
- Added to STATUS.md monitoring checklist
```

### Documentation

- [ ] IMPL-XXX.md updated to Stage 6 (all stages complete)
- [ ] STATUS.md updated with completion
- [ ] Git commit with all artifacts listed
- [ ] Follow-up items documented if any verification pending

---

## Test Data Injection

To avoid "waiting for real signals" delays during verification:

```bash
# Inject test competitor signal
node scripts/inject-test-signal.cjs --type=competitor --force=Kent

# Inject test direct signal
node scripts/inject-test-signal.cjs --type=direct --force=Hampshire

# Inject test email
node scripts/inject-test-signal.cjs --type=email

# Clean up test records
node scripts/inject-test-signal.cjs --cleanup
```

Test records are prefixed with "TEST:" for easy identification and cleanup.

---

## Workflow Testing Protocol

See `.claude/rules/workflow-testing.md` for the standard n8n workflow testing protocol.

**Key steps:**
1. Pre-test verification (workflow exists, credentials valid)
2. Test data preparation (existing or injected)
3. Execution test via n8n MCP
4. Output verification via Airtable MCP
5. Metrics collection (time, records, cost)

---

## Active IMPL Trackers

| Tracker | Spec | Status |
|---------|------|--------|
| [IMPL-010.md](IMPL-010.md) | SPEC-010 Pipeline Remediation | ✅ Complete |
| [IMPL-011.md](IMPL-011.md) | SPEC-011 Agent Enrichment | ✅ Complete |
