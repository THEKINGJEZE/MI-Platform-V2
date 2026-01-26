# Document Dependency Map

## Purpose

When you change document X, you need to check documents Y and Z. This map prevents drift.

---

## Single Source of Truth Rules

| Information | Single Source | Never Duplicate To |
|-------------|---------------|--------------------|
| Sales strategy (prioritisation, contacts, messaging) | docs/SALES-STRATEGY.md | specs/, prompts/ |
| Spec status and evolution | ROADMAP.md (Spec Index) | specs/, STATUS |
| Schema evolution path | ROADMAP.md (Schema Evolution) | specs/, CLAUDE.md |
| Dashboard evolution path | ROADMAP.md (Dashboard Evolution) | specs/ |
| Skills usage guidance | skills/README.md | CLAUDE.md, specs/ |
| Mission & success criteria | ANCHOR.md | Anywhere (link only) |
| Phase definitions & acceptance criteria | ROADMAP.md | README, STATUS, specs |
| Current session state | STATUS.md | Anywhere |
| Claude Code instructions | CLAUDE.md | README |
| Spec creation rules | .claude/rules/spec-creation.md | specs/ |
| Decisions | DECISIONS.md | Anywhere |
| Commands list | CLAUDE.md | README |
| Document limits | docs/DOCUMENT-HYGIENE.md | Anywhere |
| Architecture diagram | docs/architecture.md | Anywhere |
| Architectural guardrails | docs/GUARDRAILS.md | Anywhere (link only) |
| Platform strategy | docs/STRATEGY.md | Anywhere (reference only) |
| n8n monitoring patterns | docs/STRATEGY-N8N.md | Anywhere (reference only) |
| Agentic architecture | docs/STRATEGY-AGENTS.md | Anywhere (reference only) |
| Clawdbot integration | docs/CLAWDBOT-INTEGRATION.md | Anywhere (reference only) |
| Clawdbot config | clawdbot/config/clawdbot.json | Anywhere |
| Clawdbot skills | clawdbot/workspace/skills/ | Anywhere |
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
| .claude/commands/prep-spec.md | Topic Registry may need new phase entry |

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

### When You Change docs/architecture.md
| Check | Why |
|-------|-----|
| Nothing | It's reference only, others link to it |

### When You Change docs/GUARDRAILS.md
| Check | Why |
|-------|-----|
| Nothing | It's rules reference, nothing depends on it |

### When You Change docs/STRATEGY.md
| Check | Why |
|-------|-----|
| ROADMAP.md | Verify phase definitions still align |
| docs/GUARDRAILS.md | Ensure guardrails referenced in strategy are documented |
| specs/*.md | If workflow specifications changed, check relevant specs |

### When You Change docs/STRATEGY-N8N.md
| Check | Why |
|-------|-----|
| docs/STRATEGY.md | Monitoring patterns should align with main strategy workflows |

### When You Change docs/STRATEGY-AGENTS.md
| Check | Why |
|-------|-----|
| docs/STRATEGY.md | Agent patterns should align with main strategy AI integration |

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

### When You Change docs/SALES-STRATEGY.md
| Check | Why |
|-------|-----|
| prompts/enrichment.md | Message templates may need updating |
| SPEC-005 (Enrichment) | Contact strategy affects enrichment logic |
| skills/lead-scoring-methodology | Priority model alignment |

### When You Change .claude/hooks/*.sh
| Check | Why |
|-------|-----|
| CLAUDE.md | If adding new hooks, mention in session protocol |
| docs/DOCUMENT-HYGIENE.md | If changing hygiene checks |

### When You Add a New Document
| Check | Why |
|-------|-----|
| CLAUDE.md | Add to "Load On-Demand" table if needed |
| This file | Add to dependency map |

### When You Add a New Folder
| Check | Why |
|-------|-----|
| Nothing | We don't maintain directory structure docs (they always drift) |

### When You Create a New Spec
| Check | Why |
|-------|-----|
| ROADMAP.md | Ensure acceptance criteria match |
| ROADMAP.md (Spec Index) | Add to spec index table |
| CLAUDE.md | Update "Current spec" reference if it's the active phase |

### When You Add/Modify a Skill
| Check | Why |
|-------|-----|
| skills/README.md | Update skill inventory table |
| ROADMAP.md | Note which phase skill applies to |

### When You Defer a Spec
| Check | Why |
|-------|-----|
| ROADMAP.md (Spec Index) | Update status to Deferred |
| ROADMAP.md (Future Features) | Add to future features table |
| The spec itself | Add "Why Deferred" section with prerequisites |

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
| Strategy docs referenced incorrectly | Ensure referencing docs/STRATEGY*.md | Link to actual files |

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
| .claude/rules/spec-creation.md | Spec drafting rules | None |
| docs/DOCUMENT-HYGIENE.md | Process doc | None |
| docs/DEPENDENCY-MAP.md | This file | Updated when dependencies change |
| docs/GIT-WORKFLOW.md | Process doc | None |
| docs/architecture.md | Reference | → ROADMAP for phases |
| docs/GUARDRAILS.md | Architectural rules | → All workflow implementations |
| docs/SALES-STRATEGY.md | Sales approach | → SPEC-005, prompts/, enrichment |
| docs/STRATEGY.md | Platform strategy | → ROADMAP, GUARDRAILS, specs |
| docs/STRATEGY-N8N.md | n8n monitoring | → docs/STRATEGY.md |
| docs/STRATEGY-AGENTS.md | Agentic architecture | → docs/STRATEGY.md |
| docs/QUALITY-IMPROVEMENT-PLAN.md | Pipeline fixes | → ROADMAP (Phase 1d), workflows |
| docs/CLAWDBOT-INTEGRATION.md | Clawdbot docs | → clawdbot/, SPEC-014 |
| docs/CLAWDBOT-CRON-SETUP.md | Clawdbot cron | → clawdbot/config/ |
| clawdbot/config/clawdbot.json | Clawdbot main config | None (version controlled) |
| clawdbot/config/exec-approvals.json | Exec allowlist | None (version controlled) |
| clawdbot/workspace/skills/*.md | Clawdbot skills | → SPEC-014 |
| clawdbot/workspace/plans/*.md | Clawdbot plans | → DECISIONS.md |
| .claude/hooks/*.sh | Automation | ← CLAUDE.md, DOCUMENT-HYGIENE |
| specs/*.md | Build specs | ← ROADMAP acceptance criteria |
| skills/*.md | Design patterns | ← skills/README.md |
| skills/README.md | Skills usage guide | → ROADMAP (which phase) |
| reference-data/*.json | Reference data | None (source of truth) |
| patterns/*.js | Reusable patterns | None |
| prompts/*.md | AI prompts | None |
| .claude/commands/prep-spec.md | Spec context generation | ← ROADMAP (Topic Registry) |
