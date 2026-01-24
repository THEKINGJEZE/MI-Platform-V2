---
description: Complete session with full verification and summary
argument-hint: [--skip-commit]
allowed-tools: Read, Bash(git:*), Bash(node:*)
---

# /end-session — Session Completion Protocol

Complete the current session with mandatory verification steps and structured summary.

## Flags

- `--skip-commit`: Skip git commit prompt (for WIP sessions)

## Protocol

Execute these steps in order. Do not skip any step.

### Step 1: Verify Session State

Check for uncommitted work:

```bash
git status --porcelain
```

If changes exist, note them for Step 5.

### Step 2: Update STATUS.md

Read STATUS.md and verify:
- [ ] "Completed This Session" section reflects what was actually done
- [ ] "Next Actions" are clear and actionable
- [ ] Current phase and status are accurate
- [ ] Any blockers are documented

If STATUS.md needs updates, make them now.

### Step 3: Decision Log Check

Ask yourself:
- Were any implementation decisions made this session?
- Did we deviate from specs or make architectural choices?
- Were any bugs fixed in ways that changed behavior?

If yes to any → Log to DECISIONS.md (or remind user to update Airtable Decision Log).

### Step 4: ANCHOR.md Drift Check

Silently verify (do not output unless issues found):
- Does today's work serve the Monday morning experience?
- Did we reduce or increase cognitive load?
- Are we still aligned with success criteria?
- Did we stay within current phase scope?

If drift detected → Note it in the summary.

### Step 5: Git Commit (Unless --skip-commit)

If uncommitted changes exist:

```bash
git status
git diff --stat
```

Ask user: "Ready to commit these changes? (y/n/skip)"

If yes:
```bash
git add .
git commit -m "[scope] description

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
git push
```

### Step 6: Generate Session Summary

Output this structured summary:

```markdown
## Session Summary

**Date**: [today's date]
**Duration**: [if known]

### Completed
- [bullet list of what was done]

### Artifacts Created/Modified
- [list files created or significantly modified]

### Decisions Made
- [any implementation decisions, or "None"]

### Next Actions
1. [most important next step]
2. [second priority]
3. [optional third]

### Notes for Next Session
- [any context that should persist]
- [any pending verifications]
```

### Step 7: Confirm Completion

Output:
```
═══════════════════════════════════════════════════════════════
  ✅ SESSION COMPLETE
═══════════════════════════════════════════════════════════════

STATUS.md: [Updated / Already current]
Git: [Committed and pushed / Uncommitted changes remain / Clean]
Decisions: [Logged / None this session]

Next session: Start with "[first next action]"
═══════════════════════════════════════════════════════════════
```

---

## Why This Protocol Exists

1. **STATUS.md as memory** — Next session starts by reading STATUS.md
2. **Decision Log continuity** — Decisions survive context loss
3. **Git as checkpoint** — Clean commits enable `/rewind`
4. **Structured handoff** — Clear next steps prevent "where was I?"

---

## Quick Version (If Pressed for Time)

If user says "quick end" or session is being interrupted:

1. Run `git status`
2. Note any uncommitted changes
3. Output one-line summary: "Session ended. [N files uncommitted]. Next: [action]"
4. Remind: "Run /end-session next time for full protocol"
