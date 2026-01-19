# MI Platform — Claude Code Instructions

## 🔒 Mission Lock
**Read first, every session**: @ANCHOR.md  
That file defines WHY. It never changes. If anything conflicts with ANCHOR.md, ANCHOR.md wins.

## Current Focus
**Phase**: 1 — Core Jobs Pipeline  
**Goal**: Fix WF2/WF4 bugs, complete E2E test  
**Blocker**: WF2 deduplication, WF4 consolidation  
**Next Phase**: 1c — Dashboard MVP (SPEC-007b)  

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

## Load On-Demand (Never Memorize)
| Topic | Reference |
|-------|-----------|
| Sales strategy | @docs/SALES-STRATEGY.md |
| Skills usage guide | @skills/README.md |
| Roadmap | @ROADMAP.md |
| Current spec | @specs/SPEC-007b-dashboard-mvp.md (Phase 1c) |
| Airtable patterns | @.claude/rules/airtable.md |
| n8n patterns | @.claude/rules/n8n.md |
| Skills usage rules | @.claude/rules/skills-usage.md |
| Full architecture | @docs/architecture.md |
| Decisions | @DECISIONS.md |
| Guardrails | @docs/GUARDRAILS.md |
| Document hygiene | @docs/DOCUMENT-HYGIENE.md |
| Dependency map | @docs/DEPENDENCY-MAP.md |
| Chat↔Code sync | @docs/SYNC-PROTOCOL.md |
| Reference data | @reference-data/ (forces, competitors, capabilities) |
| Patterns | @patterns/ (force-matching, keywords, filters) |
| AI prompts | @prompts/ (job-classification, email-triage) |

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
2. **Work**: Use @references, not paste. /compact every 3-4 turns.
3. **End**: Update STATUS.md. Define next action. git commit && git push.

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

### Phase-Level Completion (Requires Chat verification)
Phases must NOT be marked complete by Code alone.

When all specs in a phase are complete:
1. Output: "Phase [X] specs complete. Ready for strategic verification in Chat."
2. James verifies in Chat that the phase delivers what the strategy intended
3. Only after James confirms → mark the phase complete in ROADMAP.md

**Why**: Code can verify "did we build what the spec said?" but only Chat can verify "does this phase actually serve the Monday morning experience per the strategy?"

## Quick Commands
| Command | Purpose |
|---------|---------|
| `/implement <spec-number>` | Stage-gated spec implementation with progress tracking |
| `/health-check` | Verify all API connections |
| `/check-alignment` | Am I on track? |
| `/deploy-workflow <name>` | Import workflow to n8n |
| `/hygiene-check` | Check document sizes, trigger cleanup |
| `/consistency-check` | Verify document references are valid |
| `/prep-spec <topic>` | Generate context brief for spec creation |
| `git status` | Check uncommitted changes |
| `git add . && git commit -m "[scope] msg" && git push` | Commit and push |
