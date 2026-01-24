# MI Platform — Claude Code Instructions

## 🔒 Mission Lock
**Read first, every session**: @ANCHOR.md  
That file defines WHY. It never changes. If anything conflicts with ANCHOR.md, ANCHOR.md wins.

## Current Focus
**Phase**: 1d + 2a (Parallel)
**Goal**: Jobs monitoring (1d) + Email integration (2a)
**Blocker**: None
**Completed**: Phase 1 (95%), Phase 1b (100%), Phase 1c (100%), SPEC-010 (100%), SPEC-011 (100%)

See @STATUS.md for session-level tracking.

## Tech Stack
| System | Access |
|--------|--------|
| Airtable | `AIRTABLE_API_KEY` + `AIRTABLE_BASE_ID` |
| n8n | `N8N_API_URL` + `N8N_API_KEY` |
| HubSpot | `HUBSPOT_API_KEY` |
| Claude API | `ANTHROPIC_API_KEY` |

Credentials in `.env.local` (never commit).

## Key Commands
```bash
node scripts/health-check.js    # Verify all connections
npm run seed:forces             # Populate 48 police forces
```

## Guardrails (Non-Negotiable)

Before building any workflow, check @docs/GUARDRAILS.md. Key rules:
- **G-001**: Dumb Scrapers + Smart Agents — raw archive first, AI second
- **G-002**: Command Queue for Emails — never send directly
- **G-005**: Fuzzy JS Matching Before AI — patterns before API calls
- **G-008**: Always Include webhookId — required for n8n routes
- **G-011**: Upsert Only (No Loop Delete) — prevent data loss

## Mandatory Agent Usage

These agents MUST be used for specific tasks — not optional.

| Agent | MUST Use When | Why |
|-------|---------------|-----|
| `workflow-builder` | Creating or modifying ANY n8n workflow | Loads 6 n8n skills, enforces logging, error handling |
| `airtable-architect` | Creating/modifying Airtable tables, fields, or queries | Loads airtable-operations skill, enforces G-011 upsert |
| `signal-triage` | Creating/modifying classification prompts or logic | UK police domain expertise, reduces false positives |
| `alignment-checker` | Before major architectural decisions | Catches mission drift early |

**Violation = rework.** Ad-hoc changes without agent review will likely need fixing later.

## Agent Invocation Protocol

### Method 1: Direct Request (Recommended)
```
Use workflow-builder agent to design the email classifier workflow
Use airtable-architect agent to add decay tracking fields to Contacts
Use signal-triage agent to review this classification prompt
```

### Method 2: Task Tool
Use the Task tool with `subagent_type` matching the agent name.

### Method 3: Via Commands (Where Available)
| Command | Agent(s) Used |
|---------|---------------|
| `/check-alignment` | alignment-checker |
| `/doc-audit` | All 5 audit agents (parallel) |

### When to Invoke

| Trigger | Agent | How |
|---------|-------|-----|
| Creating/editing n8n workflow | `workflow-builder` | Direct request before writing JSON |
| Creating/editing Airtable schema | `airtable-architect` | Direct request before any schema change |
| Changing classification logic | `signal-triage` | Direct request with prompt text |
| Major architecture decision | `alignment-checker` | `/check-alignment` or direct request |
| Finished spec implementation | All audit agents | `/doc-audit` |
| Exploring unfamiliar code | `Explore` agent | Use 2-3 in parallel for broad research |

### Skill-Agent Chain (Automatic Injection)

Agents use the `skills:` frontmatter field to **automatically inject skill content at startup**. This is the official Claude Code pattern — skills are preloaded into the agent's context, not discovered later.

```
workflow-builder → injects 7 skills (n8n-*, force-matching)
airtable-architect → injects airtable-operations skill
signal-triage → injects uk-police-market-domain, force-matching
```

Skills provide domain knowledge; agents apply it with enforcement. The full skill content is available immediately when the agent starts.

## Implementation Protocol

When implementing any spec, follow the **6-stage framework**. This is mandatory, not optional.

| Stage | Name | Purpose |
|-------|------|---------|
| 1 | Parse | Extract acceptance criteria, guardrails, dependencies + ANCHOR.md drift check |
| 2 | Audit | Verify schema, APIs, files exist |
| 3 | Plan | Order tasks with dependencies, define checkpoints |
| 4 | Build | Execute and track each task |
| 5 | **Verify** | Test every acceptance criterion — **CANNOT SKIP** |
| 6 | Document | Update STATUS.md, commit, record artifacts |

**Key references:**
- Full framework: @.claude/rules/implementation-stages.md
- Workflow testing: @.claude/rules/workflow-testing.md
- Test data injection: `node scripts/inject-test-signal.cjs --type=<type> --force=<force>`

**Use `/implement <spec-number>`** to start stage-gated implementation with automatic IMPL tracker creation.

**Verification (Stage 5) rules:**
- Every acceptance criterion must be tested or documented why it's pending
- Use n8n MCP to execute workflows: `n8n_test_workflow id=<workflow_id>`
- Verify outputs in Airtable via MCP: `search_records`
- If blocked (e.g., "waiting for new signals"), document follow-up trigger

## Load On-Demand (Never Memorize)
| Topic | Reference |
|-------|-----------|
| **Implementation stages** | @.claude/rules/implementation-stages.md |
| **Workflow testing** | @.claude/rules/workflow-testing.md |
| Sales strategy | @docs/SALES-STRATEGY.md |
| Skills usage guide | @skills/README.md |
| Roadmap | @ROADMAP.md |
| Current spec | See STATUS.md — Phase 1d has no single spec |
| Airtable patterns | @.claude/rules/airtable.md |
| n8n patterns | @.claude/rules/n8n.md |
| Skills usage rules | @.claude/rules/skills-usage.md |
| Full architecture | @docs/architecture.md |
| Decisions | @DECISIONS.md |
| Guardrails | @docs/GUARDRAILS.md |
| Document hygiene | @docs/DOCUMENT-HYGIENE.md |
| Dependency map | @docs/DEPENDENCY-MAP.md |
| Spec creation rules | @.claude/rules/spec-creation.md |
| Reference data | @reference-data/ (forces, competitors, capabilities) |
| Patterns | @patterns/ (force-matching, keywords, filters) |
| AI prompts | @prompts/ (job-classification, email-triage) |
| MCP servers | @.claude/MCP-SERVERS.md (Airtable, HubSpot, n8n, Make) |
| Best practices | @.claude/BEST-PRACTICES.md (writer-reviewer, headless mode) |
| Environment rules | @.claude/ENVIRONMENT-RULES.md (CLI vs Desktop vs Web) |

## Project Skills

Design system and domain skills available in `/skills/`. Read `@skills/README.md` for guidance on which skills to use when.

**Key principle**: Skills are reference material, not requirements. Use what's relevant to current phase.

### UI/UX Skills
| Skill | When to Read |
|-------|--------------|
| `uk-police-design-system` | Colour tokens, typography, spacing, component specs |
| `adhd-interface-design` | Focus modes, cognitive load, Context Capsule pattern |
| `action-oriented-ux` | Three-Zone Model, keyboard navigation, 2-minute loop |
| `b2b-visualisation` | Charts, sparklines, score display, badges |
| `notification-system` | Alerts, toasts, batched delivery, severity tiers |
| `board-dashboard-design` | Executive KPI dashboards (future) |
| `competitive-analysis` | Best-in-class dashboard patterns reference |

### Domain Skills
| Skill | When to Read |
|-------|--------------|
| `uk-police-market-domain` | Police workforce, PIP levels, vetting, HMICFRS |
| `lead-scoring-methodology` | Dual-track scoring (Managed Services + Agency) |
| `intelligence-source-grading` | Data quality scoring, Admiralty Code |

### Integration Skills
| Skill | When to Read |
|-------|--------------|
| `hubspot-integration` | HubSpot ↔ Airtable sync patterns |
| `technical-architecture` | React + n8n + Airtable stack patterns |
| `uk-public-sector-procurement` | Tender APIs, frameworks (Phase 2+) |

## Session Protocol
1. **Start**: Hooks inject context. Read STATUS.md.
2. **Plan First**: For non-trivial tasks, use plan mode (automatic in worktrees). Research before execution.
3. **Checkpoint**: Before risky edits (workflow changes, schema changes), note state for `/rewind`.
4. **Work**: Use @references, not paste. `/compact` every 3-4 turns.
5. **Spec Creation**: Before writing to `specs/SPEC-*.md`:
   - Run `/prep-spec <topic>` first
   - Review `specs/NEXT-CONTEXT.md`
   - Hook will block if context brief missing (exit code 2)
6. **End**: Update STATUS.md. Define next action. git commit && git push.

### When to Use Plan Mode
- New feature implementation (not bug fixes)
- Changes affecting multiple files
- Architectural decisions
- Unclear requirements needing exploration

Plan mode separates research from execution — explore first, then implement.

## Git Commit Protocol
After completing any task that modifies files:
1. Run `git status` to show what changed
2. Ask: "Ready to commit these changes to GitHub?"
3. If yes: `git add . && git commit -m "[scope] description" && git push`
4. Use conventional scope prefixes: `[docs]`, `[config]`, `[scripts]`, `[specs]`, `[fix]`

**Always ask** — never auto-commit without confirmation.

## Context Hygiene
- `/compact` after 3-4 complex exchanges
- `/clear` between unrelated tasks  
- Sub-agents for deep research (keeps main context clean)
- Never paste full files — use `@filename` instead

## Anti-Drift Checkpoints
Every few tool uses, silently verify:
- Am I working on the goal in STATUS.md?
- Would this make James's Monday easier or harder?
- Am I adding complexity or removing it?

Drift detected? → Stop. Summarize. Realign to ANCHOR.md.

## Completion Rules

Completion follows a two-tier system to ensure strategic alignment.

### Spec-Level Completion (Code handles autonomously)
When a spec is fully implemented:
1. Verify all acceptance criteria from ROADMAP.md are met
2. Run the testing plan from the spec
3. If all pass → mark the spec ✅ in ROADMAP.md

### Phase-Level Completion (Requires James confirmation)
Phases must NOT be marked complete without James's confirmation.

When all specs in a phase are complete:
1. Output: "Phase [X] specs complete. Ready for verification."
2. James confirms the phase delivers what the strategy intended
3. Only after James confirms → mark the phase complete in ROADMAP.md

**Why**: Code can verify "did we build what the spec said?" but only James can verify "does this phase actually serve the Monday morning experience per the strategy?"

## Weekly Maintenance (Monday before review)

Run these commands weekly to prevent drift:

| Command | Purpose | Time |
|---------|---------|------|
| `/doc-audit` | Comprehensive documentation alignment check | 2 min |
| `/hygiene-check` | Check document sizes, trigger cleanup | 30 sec |
| `/health-check` | Verify all API connections | 30 sec |
| `node scripts/consistency-check.cjs` | Verify file references valid | 30 sec |
| `node scripts/sync-phase.cjs` | Sync phase from STATUS.md to CLAUDE.md | 10 sec |

**Checklist:**
- [ ] Run `/doc-audit` — review `docs/AUDIT-REPORT.md`
- [ ] Run `/hygiene-check` — archive if docs exceed limits
- [ ] Run `/health-check` — verify Airtable, n8n, HubSpot connected
- [ ] Check `.claude/warnings.log` — review any enforcement bypasses
- [ ] Clear completed items from STATUS.md

## Quick Commands
| Command | Purpose |
|---------|---------|
| `/implement <spec-number>` | Stage-gated spec implementation with progress tracking |
| `/health-check` | Verify all API connections |
| `/check-alignment` | Am I on track? |
| `/deploy-workflow <name>` | Import workflow to n8n |
| `/hygiene-check` | Check document sizes, trigger cleanup |
| `/consistency-check` | Verify document references are valid |
| `/doc-audit` | Comprehensive documentation alignment check |
| `/prep-spec <topic>` | Generate context brief for spec creation |
| `/audit-claude-setup` | Audit Claude Code config against current best practices |
| `git status` | Check uncommitted changes |
| `git add . && git commit -m "[scope] msg" && git push` | Commit and push |
