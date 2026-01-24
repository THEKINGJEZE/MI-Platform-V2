---
description: Implement a spec with stage gates, progress tracking, and context-safe execution
argument-hint: <spec-number> [--resume|--reset|--status]
allowed-tools: Read, Edit, Write, Bash(git:*), Bash(npm:*), Bash(node:*)
---

# /implement — Stage-Gated Spec Implementation

You are implementing SPEC-$ARGUMENTS with structured stages, explicit gates, and external progress tracking.

## Critical Rules

1. **External tracker is source of truth** — IMPL-$ARGUMENTS.md survives context loss
2. **One stage at a time** — Never skip ahead
3. **Explicit gates** — Wait for user "y" before proceeding
4. **Stop on error** — No auto-retry, surface immediately
5. **Compact after each stage** — Fresh context for next stage
6. **Stage 5 VERIFY cannot be skipped** — Every AC must be tested or documented why pending
7. **ANCHOR.md drift check required** — Complete 4-question check in Stage 1

## Reference Documents

**Read these before starting:**
- `.claude/rules/implementation-stages.md` — Full 6-stage framework with templates
- `.claude/rules/workflow-testing.md` — Standard n8n workflow testing protocol
- `scripts/inject-test-signal.cjs` — Test data injection utility

## Flags

- `--status`: Show current progress from tracker, then stop
- `--resume`: Load tracker and continue from last checkpoint
- `--reset`: Archive existing tracker, start fresh (requires confirmation)
- (no flag): Start new implementation or auto-resume if tracker exists

## Initialization

### Step 1: Check for Existing Tracker
```
If exists: specs/IMPL-$ARGUMENTS.md
  → If --reset flag: Confirm with user, archive to specs/archive/IMPL-$ARGUMENTS-{timestamp}.md, proceed fresh
  → If --status flag: Display progress summary, stop
  → Otherwise: Auto-resume from last checkpoint
Else:
  → Create new tracker
```

### Step 2: Load Context (Minimal)

Read ONLY these files:
1. `specs/SPEC-$ARGUMENTS.md` — But only the **current stage section** (not full spec)
2. `specs/IMPL-$ARGUMENTS.md` — The tracker (if resuming)
3. `docs/GUARDRAILS.md` — Only guardrails referenced in current stage
4. `ANCHOR.md` — Mission lock (brief, always relevant)

**Do NOT read**: Full spec upfront, unrelated specs, completed stage sections

### Step 3: Create/Update Tracker

File: `specs/IMPL-$ARGUMENTS.md`
```markdown
# Implementation Tracker: SPEC-$ARGUMENTS

**Spec**: [Title from spec]
**Started**: [timestamp]
**Last Updated**: [timestamp]
**Current Stage**: [1-6]
**Status**: [in_progress|blocked|complete]

## Progress

| Stage | Name | Status | Completed |
|-------|------|--------|-----------|
| 1 | Parse | ⏳ | - |
| 2 | Audit | ⬜ | - |
| 3 | Plan | ⬜ | - |
| 4 | Build | ⬜ | - |
| 5 | Verify | ⬜ | - |
| 6 | Document | ⬜ | - |

## Current State

**Working on**: [current task]
**Blockers**: [any blockers]
**Next action**: [what happens next]

## Stage Outputs

### Stage 1: Parse
- Acceptance criteria extracted: [list]
- Guardrails applicable: [G-XXX, G-YYY]
- Dependencies identified: [list]

### Stage 2: Audit
[filled after completion]

...
```

## The Six Stages

### Stage 1: PARSE

**Purpose**: Extract actionable requirements from spec

**Actions**:
1. Read spec overview and acceptance criteria sections
2. List each acceptance criterion verbatim
3. Identify applicable guardrails by ID
4. Map dependencies (other specs, external systems)
5. **Complete ANCHOR.md drift check** (4 questions - see template below)
6. Update tracker with findings

**ANCHOR.md Drift Check** (required):
```markdown
| Question | Answer | Assessment |
|----------|--------|------------|
| Does this serve the Monday morning experience? | | |
| Does this reduce or increase cognitive load? | | |
| Does this align with success criteria? | | |
| Is this in current phase or scope creep? | | |
```

If any answer is "no" or uncertain: STOP and discuss with user before proceeding.

**Output**: Tracker updated with parsed requirements AND drift check complete

**Gate**:
```
Stage 1 PARSE complete.

Extracted [N] acceptance criteria
Identified guardrails: [G-XXX, G-YYY]
Dependencies: [list]

Review tracker: specs/IMPL-$ARGUMENTS.md

Ready to proceed to AUDIT? (y/n)
```

**Post-Gate**: Run `/compact` with context preservation note

---

### Stage 2: AUDIT

**Purpose**: Verify preconditions and identify gaps

**Actions**:
1. Check each dependency exists and is accessible
2. Verify referenced tables/fields exist in Airtable (use MCP)
3. Confirm guardrail requirements are achievable
4. List any blockers or missing prerequisites
5. Update tracker with audit results

**Output**: Tracker updated with audit findings, blockers flagged

**If blockers found**:
```
Stage 2 AUDIT found blockers:
- [blocker 1]
- [blocker 2]

Cannot proceed until resolved. Update tracker status to 'blocked'.
```

**Gate** (if no blockers):
```
Stage 2 AUDIT complete.

✓ All dependencies verified
✓ Airtable schema confirmed
✓ Guardrails achievable

Ready to proceed to PLAN? (y/n)
```

**Post-Gate**: Run `/compact` with context preservation note

---

### Stage 3: PLAN

**Purpose**: Create detailed build sequence

**Actions**:
1. Read spec's Build Sequence section
2. Break into atomic tasks (max 15 min each)
3. Order by dependencies
4. Identify checkpoint opportunities
5. Update tracker with task list

**Output**: Numbered task list in tracker

**Gate**:
```
Stage 3 PLAN complete.

Created [N] tasks:
1. [task summary]
2. [task summary]
...

Ready to proceed to BUILD? (y/n)
```

**Post-Gate**: Run `/compact` with context preservation note

---

### Stage 4: BUILD

**Purpose**: Execute the planned tasks

**Actions**:
1. Execute tasks in sequence
2. After each task: update tracker, commit if file changed
3. Every 4 tasks OR 15 minutes: echo current state
4. On error: stop immediately, update tracker with error details

**Checkpoint Protocol**:
```
Every 4 tasks, output:
---
CHECKPOINT: Task [N] of [Total] complete
Files modified: [list]
Current task: [description]
Next task: [description]
Tracker updated: ✓
---
```

**Error Protocol**:
```
ERROR in task [N]: [task name]

Error: [description]
Files affected: [list]
Rollback needed: [yes/no]

Tracker updated with error state.
Stopping. Use --resume after fixing.
```

**Gate** (after all tasks):
```
Stage 4 BUILD complete.

✓ [N] tasks executed
✓ Files created/modified: [list]
✓ All changes committed

Ready to proceed to VERIFY? (y/n)
```

**Post-Gate**: Run `/compact` with context preservation note

---

### Stage 5: VERIFY — CANNOT SKIP

**Purpose**: Confirm acceptance criteria are met

**This stage is MANDATORY. Do not proceed to Stage 6 until all criteria are verified or documented.**

**Pre-Verification**:
1. Consider using test data injection: `node scripts/inject-test-signal.cjs --type=<type> --force=<force>`
2. Reference workflow testing protocol: `.claude/rules/workflow-testing.md`

**Actions**:
1. Re-read acceptance criteria from tracker (not spec — avoid context bloat)
2. For each criterion: test using standard workflow testing protocol
3. Run n8n workflow via MCP: `n8n_test_workflow id=<workflow_id>`
4. Verify output in Airtable via MCP: `search_records`
5. Collect metrics: execution time, records processed, cost estimate
6. Update tracker with verification results

**For Workflow Implementations**:
```markdown
## Verification Evidence

- Execution ID: [from n8n MCP]
- Duration: [seconds]
- Records processed: [count]
- Errors: [none or description]

## Acceptance Criteria

| AC | Description | Status | Evidence |
|----|-------------|--------|----------|
| AC-1 | [description] | ✅/⏳ | [evidence] |
```

**If Verification Blocked**:
Some criteria may require time or external events (e.g., "wait for new signals"). For these:

1. Document WHY it cannot be verified now
2. Create specific follow-up trigger
3. Add to STATUS.md "Pending Verification" section
4. Mark as ⏳ not ❌

```markdown
AC-3: ⏳ Awaiting new signals
- Reason: No new competitor signals since fix deployed
- Follow-up: After next Bright Data run, verify status=new
- Added to STATUS.md monitoring checklist
```

**Output**: Pass/fail for each acceptance criterion, with evidence

**If failures**:
```
Stage 5 VERIFY found failures:

✗ [criterion]: [failure reason]
✓ [criterion]: passed
✗ [criterion]: [failure reason]

[N] of [M] criteria passed.

Options:
1. Return to BUILD to fix (recommended)
2. Document as known issues and proceed
3. Stop and reassess

Choice? (1/2/3)
```

**Gate** (if all pass):
```
Stage 5 VERIFY complete.

✓ All [N] acceptance criteria verified
✓ Tests passing

Ready to proceed to DOCUMENT? (y/n)
```

**Post-Gate**: Run `/compact` with context preservation note

---

### Stage 6: DOCUMENT

**Purpose**: Update project documentation

**Actions**:
1. Update STATUS.md with completion
2. Update any affected docs per DEPENDENCY-MAP.md
3. Add entry to DECISIONS.md if architectural choices were made
4. Mark tracker as complete
5. Final commit with message: `[SPEC-$ARGUMENTS] Implementation complete`

**Output**: All docs updated, tracker marked complete

**Completion**:
```
Stage 6 DOCUMENT complete.

SPEC-$ARGUMENTS implementation finished.

Files created: [list]
Files modified: [list]
Docs updated: [list]
Total commits: [N]

Tracker archived to: specs/archive/IMPL-$ARGUMENTS-complete.md
```

---

## Context Management Protocol

### Every 4 Turns
Echo current state:
```
[IMPL-$ARGUMENTS | Stage N | Task X/Y | Context: ~Z%]
```

### Pre-Compaction Checklist
Before any `/compact`:
1. ✓ Tracker updated with current state
2. ✓ Any work-in-progress saved to files
3. ✓ Current task clearly noted in tracker

### Post-Compaction Recovery
After compaction or session restart:
1. Read IMPL-$ARGUMENTS.md first (source of truth)
2. Read ONLY current stage section from spec
3. Read ONLY applicable guardrails
4. Resume from noted checkpoint

### Context Warning
If context exceeds 70% mid-stage:
```
⚠️ Context approaching limit.

Checkpointing current progress...
[save state to tracker]

Recommend: Complete current task, then compact.
Continue current task? (y/n)
```

---

## Git Integration

**Commit at**:
- End of each stage (before gate confirmation)
- Every 4 tasks during BUILD
- After fixing any error
- On completion

**Commit message format**:
```
[SPEC-$ARGUMENTS] Stage N: [stage name] complete

- [key change 1]
- [key change 2]
```

---

## Example Session Flow
```
> /implement 002

Loading SPEC-002...
Creating tracker: specs/IMPL-002.md

═══ STAGE 1: PARSE ═══

Reading spec sections...
[work happens]

Stage 1 PARSE complete.

Extracted 5 acceptance criteria
Identified guardrails: G-001, G-005, G-007
Dependencies: SPEC-001 (Airtable schema)

Review tracker: specs/IMPL-002.md

Ready to proceed to AUDIT? (y/n)

> y

Compacting context...

═══ STAGE 2: AUDIT ═══

Checking dependencies...
[work happens]

...
```
