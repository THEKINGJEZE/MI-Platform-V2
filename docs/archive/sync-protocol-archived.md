# ARCHIVED: Claude Chat ↔ Claude Code Synchronization Protocol

**Archived**: 23 January 2026
**Reason**: Superseded by Decision A11 (Single-Layer Claude Architecture)
**See**: DECISIONS.md (A11)

---

*The content below is preserved for historical reference only. This protocol is no longer active.*

---

## Overview

This project uses two Claude interfaces with distinct roles:

| Interface | Role | When to Use |
|-----------|------|-------------|
| **Claude Chat** (Desktop) | Strategic thinking | Architecture, planning, analysis, decisions |
| **Claude Code** (CLI) | Execution | Building, testing, deploying, debugging |

This document defines how they stay synchronized.

---

## Shared Truth (Both Must Reference)

### Immutable: ANCHOR.md
Both Claudes must treat this as gospel. It defines:
- Mission (3-5 leads, 15 min Monday)
- User constraints (ADHD-first)
- Success criteria
- What we're NOT building

**Neither Claude should recommend anything that conflicts with ANCHOR.md.**

### Current State: STATUS.md
Both Claudes should know:
- Current phase
- Session goal
- Blockers
- Next action

**Claude Chat**: Ask James for current STATUS if starting fresh
**Claude Code**: Hooks auto-inject this

### Decisions: DECISIONS.md
Major decisions get logged here so both Claudes can reference them.

---

## Handoff Patterns

### Pattern A: Chat → Code (Specification Handoff)

When Claude Chat designs something for Claude Code to build:

```markdown
## Handoff: [Component Name]

**Purpose**: Why this exists
**Implementation**: What to build

### Files to Create/Modify
- `path/to/file.js` — [what it does]

### Specification
[Detailed spec]

### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

### STATUS.md Update
Add to "Done This Session":
- [x] [What was built]

Update "In Progress" or "Up Next" accordingly.
```

**James copies this to Claude Code session.**

---

### Pattern B: Code → Chat (Decision Request)

When Claude Code encounters something needing strategic decision:

```markdown
## Decision Needed: [Topic]

**Context**: What I was building when this came up
**Options**:
1. Option A — [tradeoffs]
2. Option B — [tradeoffs]

**My lean**: Option X because Y
**Blocking on**: Need confirmation before proceeding
```

**James pastes this into Claude Chat for discussion.**

---

### Pattern C: Context Refresh (Starting Fresh)

When starting a new Chat or Code session:

**For Claude Chat**, James provides:
```
Current STATUS.md contents:
[paste]

Recent from DECISIONS.md:
[paste any recent decisions]

What I need to think through:
[the question/topic]
```

**For Claude Code**, hooks handle this automatically.

---

## Daily Workflow (Example)

```
Morning: Open Claude Code
         → Hooks inject STATUS.md context
         → Continue building from where left off

Midday:  Hit a design question
         → Create "Decision Needed" in Code
         → Open Claude Chat, paste question
         → Chat thinks through, recommends
         → James decides
         → Update DECISIONS.md
         → Return to Code with answer

Evening: Code session ending
         → Stop hook prompts STATUS update
         → Code updates STATUS.md
         → Commit changes
```

---

## Weekly Alignment Check

Every Monday morning (while reviewing leads):

1. **Check STATUS.md** — Does it reflect reality?
2. **Check DECISIONS.md** — Any decisions need revisiting?
3. **Check against ANCHOR.md** — Any drift?

If drift detected:
- Stop feature work
- Document what drifted
- Realign before continuing

---

## Anti-Decay Mechanisms

### Claude Code Has:
- `SessionStart` hook — Injects context
- `PreCompact` hook — Forces STATUS update
- `Stop` hook — Prompts for alignment check
- Permission deny on ANCHOR.md edits

### Claude Chat Needs:
- **Project instructions** (docs/CHAT-INSTRUCTIONS.md)
- **Project Knowledge files** (the 3 strategy docs)
- **Manual context refresh** when starting fresh
- **Built-in anti-drift questions** in instructions

### Both Rely On:
- James as the synchronization layer
- ANCHOR.md as immutable truth
- STATUS.md as current state
- DECISIONS.md as decision memory

---

## Red Flags (Either Claude)

Stop and realign if:

| Red Flag | Action |
|----------|--------|
| Suggesting Phase 2+ features during Phase 1 | Stop, check STATUS.md |
| Adding complexity without clear benefit | Stop, check ANCHOR.md |
| Conflicting recommendations between Claudes | Stop, reconcile via DECISIONS.md |
| STATUS.md not updated in >24h of work | Stop, update before continuing |
| DECISIONS.md missing recent major decisions | Log them now |

---

## Summary

1. **ANCHOR.md** is the single source of truth for mission
2. **STATUS.md** is the single source of truth for current state
3. **DECISIONS.md** captures decisions both Claudes should know
4. **Claude Chat** thinks, **Claude Code** builds
5. **James** is the synchronization layer between them
6. **Handoff patterns** ensure context transfers cleanly
