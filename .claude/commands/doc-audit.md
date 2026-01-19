---
description: Comprehensive documentation alignment audit across roadmap, specs, status, schema, and guardrails
argument-hint: "[--fix] (optional: generate fix suggestions)"
allowed-tools: Read, Grep, Glob, Task, Write
---

# /doc-audit — Documentation Alignment Audit

You are the doc-audit orchestrator for MI Platform. Your job is to detect drift, duplication, and misalignment across project documentation.

## Mission Context

This project builds a Market Intelligence Platform. Documentation alignment is critical because:
- Multiple documents reference each other (ROADMAP → specs → STATUS)
- DEPENDENCY-MAP.md defines single-source-of-truth rules
- Schema definitions must match implementations
- Guardrails must be referenced correctly in specs/workflows

## Document Hierarchy (from DEPENDENCY-MAP.md)

| Document | Role | Key Rule |
|----------|------|----------|
| ANCHOR.md | Immutable mission | Never changes |
| ROADMAP.md | Phase definitions, acceptance criteria | Source of truth for phases |
| STATUS.md | Current session state | Must reflect ROADMAP phase |
| DECISIONS.md | Decision log | Max 20 active |
| specs/*.md | Build specifications | Must match ROADMAP criteria |
| docs/GUARDRAILS.md | Architectural rules | Must be referenced by ID |
| .claude/skills/airtable-schema/ | Schema IDs | Must match SPEC-001 |

## Audit Process

### Step 1: Discovery

Use Glob to identify all relevant documents:
- `*.md` (root level)
- `docs/*.md`
- `specs/*.md`
- `.claude/skills/airtable-schema/*.json`
- `.claude/commands/*.md`
- `.claude/agents/*.md`
- `patterns/*.js`
- `prompts/*.md`

### Step 2: Run 5 Subagent Audits

Spawn each audit agent using the Task tool with Explore subagent_type. Each returns findings in a structured format.

**Audit Dimensions (spawn in parallel for efficiency):**

1. **Reference Integrity** — Validate all @references, markdown links, file paths exist
2. **Single Source of Truth** — Detect duplicated information per DEPENDENCY-MAP.md rules
3. **Roadmap Alignment** — Verify STATUS.md/specs match ROADMAP.md criteria
4. **Schema Alignment** — Check schema references match SPEC-001, validate field references
5. **Guardrail Compliance** — Verify guardrail references (G-XXX) are valid and complete

For each audit, read the detailed instructions from `.claude/agents/audit-*.md` and use Task with Explore type:

```
Task(
  subagent_type="Explore",
  prompt="[Read .claude/agents/audit-reference-integrity.md for full instructions] Audit all file references in markdown documents. Check @references, [markdown links](path), and `backtick paths`. Return structured findings with file:line evidence.",
  model="haiku"
)
```

**Agent instruction files** (contain detailed audit logic):
- `.claude/agents/audit-reference-integrity.md`
- `.claude/agents/audit-single-source-truth.md`
- `.claude/agents/audit-roadmap-alignment.md` (use model="sonnet" for reasoning)
- `.claude/agents/audit-schema-alignment.md`
- `.claude/agents/audit-guardrail-compliance.md`

**Alternative**: If custom agents are registered (check `Task` available types), you can use:
```
Task(subagent_type="audit-reference-integrity", prompt="Run full audit", model="haiku")
```

### Step 3: Aggregate Results

Combine all subagent outputs into a single report.

## Report Structure

Create `docs/AUDIT-REPORT.md`:

```markdown
# Documentation Audit Report

**Generated**: [timestamp]
**Overall Status**: 🟢 PASS | 🟡 WARNINGS | 🔴 ISSUES FOUND

## Executive Summary

- Total items checked: X
- Issues found: Y (Z high, A medium, B low)
- Documents audited: N

## Findings by Dimension

### 1. Reference Integrity [STATUS]
[findings or "✅ All references valid"]

### 2. Single Source of Truth [STATUS]
[findings or "✅ No duplications detected"]

### 3. Roadmap Alignment [STATUS]
[findings or "✅ STATUS and specs align with ROADMAP"]

### 4. Schema Alignment [STATUS]
[findings or "✅ Schema references are consistent"]

### 5. Guardrail Compliance [STATUS]
[findings or "✅ All guardrails properly referenced"]

## Action Items

| Priority | Issue | File | Recommendation |
|----------|-------|------|----------------|
| 🔴 | ... | ... | ... |
| 🟡 | ... | ... | ... |

## Evidence Index

[All file:line-range references collected]
```

## Execution Rules

1. **Efficiency**: Use Grep/Glob first, then targeted reads. Never load entire large files.
2. **Evidence**: Every finding MUST include file:line-range evidence.
3. **No changes**: This is audit-only. Never modify source documents (except writing report).
4. **Severity guide**:
   - 🔴 High: Broken references, missing required content, schema mismatches
   - 🟡 Medium: Duplicated information, outdated dates, inconsistent terminology
   - 🟢 Low: Style inconsistencies, minor suggestions

## If --fix Argument Provided

Append a "Suggested Fixes" section with specific edit instructions for each issue:

```markdown
## Suggested Fixes

### Fix for [issue title]
**File**: [path]
**Current (lines X-Y)**:
```
[content]
```
**Replace with**:
```
[fixed content]
```
```

## Error Handling

If a subagent fails or returns invalid JSON:
1. Note the failure in the report
2. Continue with other audits
3. Mark that dimension as "⚠️ Audit incomplete"

## Output

After completing the audit:
1. Write `docs/AUDIT-REPORT.md` with all findings
2. Output a summary to the user:
   - Overall status (pass/warn/fail)
   - Count of issues by severity
   - Top 3 action items if any

## Example Invocation

```
/doc-audit
```

Runs full audit and generates report.

```
/doc-audit --fix
```

Runs audit and includes fix suggestions in report.
