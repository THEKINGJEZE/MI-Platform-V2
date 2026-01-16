# Document Dependency Map

## Purpose

When you change document X, you need to check documents Y and Z. This map prevents drift.

---

## Single Source of Truth Rules

| Information | Single Source | Never Duplicate To |
|-------------|---------------|--------------------|
| Mission & success criteria | ANCHOR.md | Anywhere (link only) |
| Phase definitions & acceptance criteria | ROADMAP.md | README, STATUS, specs |
| Current session state | STATUS.md | Anywhere |
| Claude Code instructions | CLAUDE.md | README |
| Claude Chat instructions | docs/CHAT-INSTRUCTIONS.md | README |
| Decisions | DECISIONS.md | Anywhere |
| Commands list | CLAUDE.md | README |
| Document limits | docs/DOCUMENT-HYGIENE.md | Anywhere |
| Architecture diagram | docs/architecture.md | Anywhere |
| Architectural guardrails | docs/GUARDRAILS.md | Anywhere (link only) |
| Reference data (forces, etc.) | reference-data/*.json | Anywhere (link only) |
| Reusable patterns | patterns/*.js | Anywhere (link only) |
| AI prompts | prompts/*.md | Anywhere (link only) |
| Directory structure | *Don't maintain anywhere* | — |

**If you find the same information in two places, one is wrong. Delete the duplicate.**

---

## Change Impact Matrix

### When You Change ANCHOR.md
**Answer: You don't.** It's immutable. If mission changes, that's a new project.

### When You Change ROADMAP.md
| Check | Why |
|-------|-----|
| STATUS.md | Current phase reference might need updating |
| specs/phase-X.md | Spec should match roadmap acceptance criteria |

### When You Change CLAUDE.md
| Check | Why |
|-------|-----|
| Nothing | README links to it, doesn't copy |

### When You Change STATUS.md
| Check | Why |
|-------|-----|
| Nothing | It's session-level, nothing depends on it |

### When You Change DECISIONS.md
| Check | Why |
|-------|-----|
| Relevant specs | If decision affects a spec, note it there |

### When You Change docs/CHAT-INSTRUCTIONS.md
| Check | Why |
|-------|-----|
| Claude Chat Project Knowledge | Re-upload to Claude desktop app if substantive changes |

### When You Change docs/architecture.md
| Check | Why |
|-------|-----|
| Nothing | It's reference only, others link to it |

### When You Change docs/GUARDRAILS.md
| Check | Why |
|-------|-----|
| Nothing | It's rules reference, nothing depends on it |

### When You Change reference-data/*.json
| Check | Why |
|-------|-----|
| patterns/force-matching.js | Force names must match |
| Airtable seed scripts | If forces/competitors changed |

### When You Change patterns/*.js
| Check | Why |
|-------|-----|
| Workflows using patterns | If exported function signatures changed |

### When You Change prompts/*.md
| Check | Why |
|-------|-----|
| Workflows using prompts | If prompt structure changed |

### When You Change .claude/hooks/*.sh
| Check | Why |
|-------|-----|
| CLAUDE.md | If adding new hooks, mention in session protocol |
| docs/DOCUMENT-HYGIENE.md | If changing hygiene checks |

### When You Add a New Document
| Check | Why |
|-------|-----|
| CLAUDE.md | Add to "Load On-Demand" table if Claude Code needs it |
| docs/CHAT-INSTRUCTIONS.md | Add to "Key Process Docs" if Claude Chat needs it |
| This file | Add to dependency map |

### When You Add a New Folder
| Check | Why |
|-------|-----|
| Nothing | We don't maintain directory structure docs (they always drift) |

### When You Create a New Spec
| Check | Why |
|-------|-----|
| ROADMAP.md | Ensure acceptance criteria match |
| CLAUDE.md | Update "Current spec" reference if it's the active phase |

### When You Complete a Phase
| Check | Why |
|-------|-----|
| ROADMAP.md | Check off acceptance criteria |
| STATUS.md | Update current phase |
| CLAUDE.md | Update "Current spec" reference |
| DECISIONS.md | Archive phase-level decisions |
| specs/phase-X.md | Mark as complete |

---

## Pre-Change Checklist

**Before making any document changes, ask:**

1. [ ] What is the single source of truth for this information?
2. [ ] Am I updating the source, or creating a duplicate?
3. [ ] What other documents reference or depend on this?
4. [ ] Should I link instead of copy?

**After making changes:**

1. [ ] Check all items in the impact matrix above
2. [ ] Verify no duplication was introduced
3. [ ] Update this map if a new dependency was discovered

---

## Common Drift Patterns to Avoid

| Pattern | Problem | Solution |
|---------|---------|----------|
| "Phase 1 Goals" in README | Duplicates ROADMAP.md | Link to ROADMAP.md |
| Progress list in STATUS.md | Duplicates ROADMAP.md criteria | Link to ROADMAP, track differently |
| Directory tree in README | Always drifts | Don't maintain it |
| Command list in multiple places | One gets stale | Single source in CLAUDE.md |
| Acceptance criteria in multiple places | They'll diverge | Single source in ROADMAP.md |
| Instructions repeated | Maintenance burden | Link to source doc |
| Strategy docs referenced as local files | They're Project Knowledge, not in repo | Note they're in Claude Chat |

---

## Recovery: When Drift Has Occurred

1. Identify the **single source** for that information
2. Update the single source to be correct
3. Delete duplicates in other documents
4. Replace with links if reference is needed
5. Add to this dependency map if pattern was missing

---

## Document Inventory

All documents that contain project information:

| Document | Type | Dependencies |
|----------|------|--------------|
| ANCHOR.md | Immutable mission | None (source of truth) |
| ROADMAP.md | Phase definitions | → STATUS, specs |
| STATUS.md | Session state | ← ROADMAP |
| CLAUDE.md | Claude Code config | → all detail docs |
| DECISIONS.md | Decision log | → relevant specs |
| README.md | Entry point | → all key docs (links only) |
| docs/CHAT-INSTRUCTIONS.md | Claude Chat config | → Claude Chat Project Knowledge |
| docs/SYNC-PROTOCOL.md | Process doc | None |
| docs/DOCUMENT-HYGIENE.md | Process doc | None |
| docs/DEPENDENCY-MAP.md | This file | Updated when dependencies change |
| docs/GIT-WORKFLOW.md | Process doc | None |
| docs/architecture.md | Reference | → ROADMAP for phases |
| docs/GUARDRAILS.md | Architectural rules | → All workflow implementations |
| .claude/hooks/*.sh | Automation | ← CLAUDE.md, DOCUMENT-HYGIENE |
| specs/*.md | Build specs | ← ROADMAP acceptance criteria |
| reference-data/*.json | Reference data | None (source of truth) |
| patterns/*.js | Reusable patterns | None |
| prompts/*.md | AI prompts | None |
