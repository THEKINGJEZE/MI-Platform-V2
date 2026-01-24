---
description: Initialize session with context loading and goal setting
argument-hint: [goal description]
allowed-tools: Read, Bash(git:*), Bash(node:*)
---

# /start-session — Session Initialization Protocol

Initialize a new working session with full context loading and goal clarification.

## Usage

```
/start-session                    # Interactive goal setting
/start-session implement SPEC-012 # Specific goal
/start-session continue           # Resume from STATUS.md next actions
```

## Protocol

### Step 1: Load Context (Automatic)

The SessionStart hook already runs `session-start.sh` which provides:
- Current phase and status
- Document health check
- Consistency check
- Recently modified files
- Mission reminder

If this didn't display, run manually:
```bash
bash .claude/hooks/session-start.sh
```

### Step 2: Check Previous Session State

Read STATUS.md and look for:
- "Completed This Session" — what was done last time
- "Next Actions" — what should be done now
- Any blockers or pending verifications

### Step 3: Set Session Goal

If goal provided in arguments:
- Confirm the goal aligns with current phase
- Check if goal matches "Next Actions" in STATUS.md

If no goal provided:
- Read "Next Actions" from STATUS.md
- Ask: "Continue with [first next action]? Or specify different goal."

If `continue` argument:
- Automatically pick up first item from "Next Actions"

### Step 4: ANCHOR.md Alignment Check

For the stated goal, verify:
- [ ] Serves the Monday morning experience
- [ ] Reduces cognitive load (not increases)
- [ ] Aligns with success criteria
- [ ] Within current phase scope

If any concern → Flag before proceeding.

### Step 5: Load Relevant Context

Based on the goal type, read appropriate references:

| Goal Type | Load These |
|-----------|------------|
| Implement spec | SPEC-XXX.md, IMPL-XXX.md (if exists), GUARDRAILS.md |
| Workflow work | .claude/rules/workflow-testing.md, n8n patterns |
| Schema work | .claude/rules/airtable.md, SPEC-001 schema |
| Bug fix | STATUS.md, relevant workflow/code files |
| Documentation | DEPENDENCY-MAP.md, relevant docs |

### Step 6: Confirm Ready

Output session header:

```
═══════════════════════════════════════════════════════════════
  SESSION STARTED
═══════════════════════════════════════════════════════════════

📍 Phase: [current phase]
🎯 Goal: [session goal]
📋 Approach: [brief plan]

Relevant context loaded:
- [list of files read]

Ready to begin.
═══════════════════════════════════════════════════════════════
```

---

## Integration with Existing Hooks

This command complements the automatic `SessionStart` hook:

| Automatic (Hook) | Manual (/start-session) |
|------------------|-------------------------|
| Always runs | Runs when user says "start session" |
| Context injection | Goal setting |
| Health checks | Alignment verification |
| Generic | Goal-specific context loading |

**Best practice**: Session start hook runs automatically, then user can optionally run `/start-session [goal]` for explicit goal setting.

---

## Quick Start (If Pressed for Time)

If user says "quick start":
1. Read STATUS.md "Next Actions"
2. Output: "Continuing with: [first action]. Phase: [phase]. Ready."
3. Begin work immediately

---

## Examples

**Explicit goal:**
```
User: /start-session implement SPEC-012
Claude: [Loads SPEC-012, checks alignment, outputs session header]
```

**Continue from last session:**
```
User: /start-session continue
Claude: [Reads STATUS.md, picks up "Next Actions", confirms and begins]
```

**Interactive:**
```
User: start session
Claude: [Hook runs automatically, then asks about goal based on STATUS.md]
```
