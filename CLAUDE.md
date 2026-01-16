# MI Platform — Claude Code Instructions

## 🔒 Mission Lock
**Read first, every session**: @ANCHOR.md  
That file defines WHY. It never changes. If anything conflicts with ANCHOR.md, ANCHOR.md wins.

## Current Focus
**Phase**: 1 — Core Jobs Pipeline  
**Goal**: Indeed jobs → classified signals → opportunities  
**Blocker**: None  

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
| Roadmap | @ROADMAP.md |
| Current spec | @specs/consistency-checker.md (build this first) |
| Schema | @.claude/skills/airtable-schema/SKILL.md |
| Airtable patterns | @.claude/rules/airtable.md |
| n8n patterns | @.claude/rules/n8n.md |
| Full architecture | @docs/architecture.md |
| Decisions | @DECISIONS.md |
| Guardrails | @docs/GUARDRAILS.md |
| Document hygiene | @docs/DOCUMENT-HYGIENE.md |
| Dependency map | @docs/DEPENDENCY-MAP.md |
| Chat↔Code sync | @docs/SYNC-PROTOCOL.md |
| Reference data | @reference-data/ (forces, competitors, capabilities) |
| Patterns | @patterns/ (force-matching, keywords, filters) |
| AI prompts | @prompts/ (job-classification, email-triage) |

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

## Quick Commands
| Command | Purpose |
|---------|---------|
| `/health-check` | Verify all API connections |
| `/check-alignment` | Am I on track? |
| `/deploy-workflow <name>` | Import workflow to n8n |
| `/hygiene-check` | Check document sizes, trigger cleanup |
| `/consistency-check` | Verify document references are valid |
| `/prep-spec <topic>` | Generate context brief for spec creation |
| `git status` | Check uncommitted changes |
| `git add . && git commit -m "[scope] msg" && git push` | Commit and push |
