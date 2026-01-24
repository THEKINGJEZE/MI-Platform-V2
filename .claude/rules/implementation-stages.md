# Implementation Stages Framework

## Purpose

This document defines the **mandatory 6-stage implementation framework** for all spec implementations. Claude Code MUST follow this framework to ensure consistent, verifiable implementations.

**This framework is auto-loaded when working on specs or workflows.**

---

## The 6 Stages

Every implementation follows these stages in order. No stage can be skipped.

| Stage | Name | Purpose | Outputs |
|-------|------|---------|---------|
| 1 | **Parse** | Extract requirements from spec | Acceptance criteria list, guardrails, dependencies |
| 2 | **Audit** | Verify prerequisites exist | Schema verified, APIs accessible, files located |
| 3 | **Plan** | Order tasks with dependencies | Numbered task list, dependency graph, checkpoints |
| 4 | **Build** | Execute implementation | Working code/workflows, task-by-task status |
| 5 | **Verify** | Test against acceptance criteria | Every AC marked ✅ or documented why ⏳ |
| 6 | **Document** | Record completion | IMPL tracker complete, STATUS.md updated, git commit |

---

## Stage 1: Parse

**Goal**: Understand exactly what must be built.

### Required Outputs

1. **Acceptance Criteria List**
   - Copy verbatim from spec or ROADMAP.md
   - Number each criterion (AC-1, AC-2, etc.)
   - These become your verification checklist

2. **Guardrails Applicable**
   - List every G-XXX that applies
   - Note HOW each guardrail affects implementation

3. **Dependencies Identified**
   - Prior specs that must be complete
   - Schema fields that must exist
   - APIs that must be accessible
   - Files that must be present

4. **ANCHOR.md Drift Check**
   ```markdown
   | Question | Answer | Assessment |
   |----------|--------|------------|
   | Does this serve the Monday morning experience? | | |
   | Does this reduce or increase cognitive load? | | |
   | Does this align with success criteria? | | |
   | Is this in current phase or scope creep? | | |
   ```

### Example (from IMPL-010)

```markdown
### Stage 1: Parse

**Acceptance Criteria Extracted:**
- AC-0.1: New competitor signals have status=new
- AC-1.1: "Birmingham" location → "West Midlands Police" force
- AC-2.1: Running WF2 twice creates 0 new duplicates

**Guardrails Applicable:**
- G-001: Dumb Scrapers + Smart Agents
- G-005: Fuzzy JS Matching Before AI
- G-011: Upsert Only, No Loop Delete
- G-013: Competitor Signals = P1

**Dependencies:**
- Airtable: role_type field exists → needs rename to role_category
- n8n: MI: Jobs Classifier active
- Prompt: signal-triage-agent.md v2.1 exists
```

---

## Stage 2: Audit

**Goal**: Verify everything needed exists before building.

### Required Checks

1. **Schema Verification**
   ```markdown
   | Field | Status | Notes |
   |-------|--------|-------|
   | role_category | ✅ Exists | fldXXXXX |
   | role_detail | ❌ Missing | Need to create |
   ```

2. **Workflow Verification**
   ```markdown
   | Workflow | ID | Status |
   |----------|-----|--------|
   | MI: Jobs Classifier | w4Mw... | ✅ Active |
   ```

3. **API/Credential Verification**
   - HubSpot scopes confirmed
   - Airtable base accessible
   - n8n credentials valid

4. **File Verification**
   ```markdown
   | File | Status |
   |------|--------|
   | prompts/signal-triage-agent.md | ✅ Exists |
   | scripts/backfill.js | ❌ To Create |
   ```

### Blockers

If any critical dependency is missing:
1. Document the blocker
2. Create task to resolve it
3. Do NOT proceed to Stage 3 until resolved

---

## Stage 3: Plan

**Goal**: Create ordered task list with dependencies.

### Required Outputs

1. **Numbered Task List**
   ```markdown
   | # | Task | Est | Depends On |
   |---|------|-----|------------|
   | 1 | Create role_detail field | 2m | — |
   | 2 | Update classifier prompt | 10m | 1 |
   | 3 | Deploy workflow | 5m | 2 |
   ```

2. **Dependency Graph** (for complex implementations)
   ```
   [1-4] Schema Changes
       ↓
   [5-7] Fix 0: Competitor status
       ↓
   [8-11] Fix 1: Classification
   ```

3. **Checkpoints**
   - After which tasks can you verify progress?
   - What's the rollback point if something fails?

### Risk Mitigation

Document for each risk:
- What could go wrong
- How to detect it
- How to recover

---

## Stage 4: Build

**Goal**: Execute tasks and track progress.

### Required Tracking

Update task status as you work:

```markdown
| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Create role_detail field | ✅ | fld14RHz2PyP8RZrr |
| 2 | Update classifier prompt | ✅ | v2.1 deployed |
| 3 | Deploy workflow | ⏳ | In progress |
```

### Artifacts Created

Track everything created:
```markdown
| Artifact | Type | Location/ID |
|----------|------|-------------|
| role_detail | Airtable field | fld14RHz2PyP8RZrr |
| MI: Jobs Classifier | n8n workflow | w4Mw2wX9wBeimYP2 |
| backfill-classification.cjs | Script | scripts/ |
```

---

## Stage 5: Verify — CANNOT SKIP

**Goal**: Prove every acceptance criterion is met.

### This stage is mandatory.

You cannot proceed to Stage 6 without completing verification.

### Verification Methods

1. **n8n Workflow Testing**
   - Use `n8n_test_workflow` via MCP
   - Capture execution ID
   - Check execution log for errors
   - Verify output records in Airtable

2. **Airtable Verification**
   - Query output table with MCP
   - Verify expected records created
   - Check field values match criteria

3. **Metrics Collection**
   - Execution time
   - Records processed
   - Error count
   - Cost estimate (if AI involved)

### Required Output

Every acceptance criterion must be marked:

```markdown
| AC | Description | Status | Evidence |
|----|-------------|--------|----------|
| AC-1 | Classifier uses v2.1 prompt | ✅ | Workflow updated, tested |
| AC-2 | Force matching before AI | ✅ | Code node at position 3 |
| AC-3 | Deduplication working | ⏳ | Awaiting new signals |
```

### If Verification Blocked

For any criterion marked ⏳:
1. Document WHY it cannot be verified now
2. Create follow-up task with specific trigger
3. Add to STATUS.md "Pending Verification" section

**Example:**
```markdown
AC-3: ⏳ Awaiting new signals
- Reason: No new competitor signals since fix deployed
- Follow-up: After next Bright Data run, verify status=new
- Added to STATUS.md monitoring checklist
```

---

## Stage 6: Document

**Goal**: Record completion for future reference.

### Required Updates

1. **IMPL Tracker**
   - Mark all stages complete
   - Add "Implementation Summary" section
   - List all artifacts with IDs

2. **STATUS.md**
   - Update current state
   - Add to "Completed This Session"
   - Update any monitoring items

3. **Git Commit**
   ```bash
   git add .
   git commit -m "[spec] SPEC-XXX: Brief description

   - Artifact 1: ID
   - Artifact 2: ID

   Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
   git push
   ```

4. **Verification Pending** (if any)
   - Document in STATUS.md what needs monitoring
   - Set specific follow-up trigger

---

## IMPL Tracker Template

Create `specs/IMPL-XXX.md` using this structure:

```markdown
# Implementation Tracker: SPEC-XXX

**Spec**: [Name]
**Started**: [ISO timestamp]
**Last Updated**: [ISO timestamp]
**Current Stage**: [1-6]
**Status**: [In Progress / Complete / Blocked]

## Progress

| Stage | Name | Status | Completed |
|-------|------|--------|-----------|
| 1 | Parse | ⏳ | |
| 2 | Audit | | |
| 3 | Plan | | |
| 4 | Build | | |
| 5 | Verify | | |
| 6 | Document | | |

## Current State

**Working on**: [Current task]
**Blockers**: [None or description]
**Next action**: [Specific next step]

## ANCHOR.md Drift Check

| Question | Answer | Assessment |
|----------|--------|------------|
| Does this serve the Monday morning experience? | | |
| Does this reduce or increase cognitive load? | | |
| Does this align with success criteria? | | |
| Is this in current phase or scope creep? | | |

## Stage Outputs

### Stage 1: Parse
[Fill as you complete]

### Stage 2: Audit
[Fill as you complete]

### Stage 3: Plan
[Fill as you complete]

### Stage 4: Build
[Fill as you complete]

### Stage 5: Verify
[Fill as you complete]

### Stage 6: Document
[Fill as you complete]
```

---

## Quick Reference: Stage Checklist

```
□ Stage 1: Parse
  □ Acceptance criteria extracted
  □ Guardrails listed with application
  □ Dependencies identified
  □ ANCHOR.md drift check complete

□ Stage 2: Audit
  □ Schema fields verified
  □ Workflows verified
  □ APIs/credentials verified
  □ Files located
  □ No blockers (or blockers documented)

□ Stage 3: Plan
  □ Tasks numbered with dependencies
  □ Checkpoints defined
  □ Rollback plan documented

□ Stage 4: Build
  □ Each task tracked (✅/⏳/❌)
  □ Artifacts recorded with IDs
  □ Issues documented as encountered

□ Stage 5: Verify — MANDATORY
  □ Every AC tested
  □ Every AC marked ✅ or documented why ⏳
  □ Execution evidence captured
  □ Metrics collected

□ Stage 6: Document
  □ IMPL tracker complete
  □ STATUS.md updated
  □ Git committed and pushed
  □ Follow-up items in STATUS.md if any
```

---

*This framework is based on proven patterns from IMPL-010 and IMPL-011 implementations.*
