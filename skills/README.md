# Skills Reference

**Purpose**: Guide for using skills ported from V1
**Created**: 2025-01-19
**Updated**: 2025-01-23

---

## What Are Skills?

Skills are codified knowledge from V1 development — patterns, methodologies, and domain expertise that were validated through real usage. They are:

- **Reference material** for design and architecture decisions
- **NOT requirements** for every phase
- **Progressively implemented** as the system matures

Think of skills as a library, not a checklist.

---

## Skills Architecture

Skills are organised across two locations:

### `.claude/skills/` — Auto-Discovered Skills (Active)

These skills are automatically loaded by Claude Code when relevant to the current task. They have `user-invocable: false` in their frontmatter, meaning Claude uses them proactively without cluttering the `/` command menu.

| Skill | Purpose | When Claude Uses It |
|-------|---------|---------------------|
| `uk-police-market-domain` | Domain expertise for signal interpretation | Police workforce, PIP levels, vetting, HMICFRS context |
| `uk-police-design-system` | Visual design system (tokens, components) | Any UI/frontend work |
| `adhd-interface-design` | Cognitive load patterns, focus modes | UX decisions, interface design |
| `action-oriented-ux` | Queue/action interface patterns | Building review flows, keyboard nav |
| `technical-architecture` | React/n8n/Airtable stack patterns | Architecture decisions, data layer |
| `force-matching` | UK police force pattern matching (G-005) | Force identification in workflows |
| `airtable-operations` | Airtable API patterns for MI Platform | Airtable CRUD, batch ops, filters |
| `n8n-code-javascript` | JavaScript in n8n Code nodes | Writing JS in n8n, $input/$json syntax |
| `n8n-code-python` | Python in n8n Code nodes | Writing Python in n8n |
| `n8n-expression-syntax` | n8n expression validation | {{}} syntax, $json/$node variables |
| `n8n-mcp-tools-expert` | n8n-mcp MCP tools usage | Searching nodes, validating configs |
| `n8n-node-configuration` | Operation-aware node configuration | Configuring nodes, property dependencies |
| `n8n-validation-expert` | Validation error interpretation | Fixing validation errors, false positives |
| `n8n-workflow-patterns` | Proven workflow architectural patterns | Building new workflows, webhook patterns |

### `skills/` — Reference Skills (Deferred)

These skills remain as reference documentation for future phases. They contain valuable patterns but require infrastructure that doesn't exist yet.

| Skill | Purpose | Prerequisite |
|-------|---------|--------------|
| `b2b-visualisation` | Score displays, trends, charts | Scoring model implemented |
| `board-dashboard-design` | Kanban layouts | Pipeline view feature |
| `competitive-analysis` | Competitor signal interpretation | Already covered by domain skill |
| `hubspot-integration` | CRM sync patterns | Phase 2a |
| `intelligence-source-grading` | Signal reliability scoring | Phase 2+ |
| `lead-scoring-methodology` | Dual-track scoring | Schema expansion |
| `notification-system` | Alerts, digests, batched delivery | Overnight tracking |
| `uk-public-sector-procurement` | Tender/framework knowledge | Phase 2b |

---

## Skill Categories

### Design & UX Skills (Use for any frontend work)

| Skill | Use When | Phase |
|-------|----------|-------|
| `uk-police-design-system` | Building any UI component | All phases |
| `adhd-interface-design` | Designing new interaction patterns | All phases |
| `action-oriented-ux` | Building queue/action interfaces | Phase 1c+ |
| `b2b-visualisation` | Displaying scores, trends, charts | Phase 2+ |
| `board-dashboard-design` | Building Kanban/board views | Phase 2+ |
| `notification-system` | Implementing alerts, toasts, digests | Phase 2+ |

### Domain Knowledge Skills (Reference for understanding context)

| Skill | Use When | Phase |
|-------|----------|-------|
| `uk-police-market-domain` | Understanding forces, hiring patterns | All phases |
| `uk-public-sector-procurement` | Working with tenders, frameworks | Phase 2b |
| `competitive-analysis` | Analysing competitor activity | Phase 1b |
| `intelligence-source-grading` | Evaluating signal quality | Phase 2+ |

### Technical Skills (Patterns for implementation)

| Skill | Use When | Phase |
|-------|----------|-------|
| `technical-architecture` | Architecture decisions, data layer | All phases |
| `hubspot-integration` | CRM sync, contact management | Phase 2a+ |
| `lead-scoring-methodology` | Implementing dual-track scoring | Phase 2+ |

---

## When to Use Each Skill

### Phase 1 (Current)

**Required skills:**
- `uk-police-design-system` — Design tokens for dashboard
- `uk-police-market-domain` — Understanding force data
- `technical-architecture` — Data fetching patterns

**Reference only (don't implement yet):**
- `lead-scoring-methodology` — Schema doesn't support dual-track yet
- `notification-system` — No overnight summaries yet
- `b2b-visualisation` — No score breakdowns yet

### Phase 1b (Competitors)

**Adds:**
- `competitive-analysis` — Interpreting competitor signals
- `intelligence-source-grading` — Ranking signal reliability

### Phase 1c (Dashboard MVP)

**Adds:**
- `action-oriented-ux` — Three-Zone Model implementation
- `adhd-interface-design` — Progress feedback, undo patterns

### Phase 2+ (Future)

**Adds:**
- `lead-scoring-methodology` — When schema supports dual-track
- `notification-system` — When overnight activity exists
- `hubspot-integration` — When CRM sync needed
- `uk-public-sector-procurement` — When tender monitoring starts

---

## Skill File Structure

### Auto-Discovered Skills (`.claude/skills/`)

```
.claude/skills/
└── {skill-name}/
    └── SKILL.md           # Main documentation with frontmatter
```

**Required frontmatter:**
```yaml
---
name: skill-name
description: Brief description for Claude to match against tasks
user-invocable: false
---
```

Setting `user-invocable: false` means Claude loads the skill automatically when the task matches the description — no `/skill-name` command needed.

### Reference Skills (`skills/`)

```
skills/
└── {skill-name}/
    ├── SKILL.md           # Main documentation
    └── references/        # Supporting files (optional)
        ├── {topic}.md
        └── ...
```

The `SKILL.md` file contains:
- Purpose and scope
- Core patterns and principles
- Examples and templates
- Integration notes

---

## How to Reference Skills

When working on a component or feature:

1. **Identify relevant skills** from the table above
2. **Read the SKILL.md** for patterns and principles
3. **Check references/** for specific examples
4. **Apply patterns** that match current phase requirements
5. **Don't over-implement** — use only what's needed now

### Example: Building the Queue Panel

Relevant skills:
- `uk-police-design-system` → Design tokens, badge variants
- `action-oriented-ux` → Queue Panel specifications
- `adhd-interface-design` → Selection highlighting, keyboard nav

Not relevant yet:
- `lead-scoring-methodology` → MVP doesn't show scores
- `notification-system` → No alerts in queue

---

## Skills vs Specs

| Skills | Specs |
|--------|-------|
| Patterns and principles | Specific implementations |
| Reference material | Build instructions |
| Multiple phases | Single deliverable |
| "How to think about X" | "Build X with these steps" |

Skills inform specs. Specs don't need to implement everything a skill describes.

---

## Adding New Skills

### For Active Skills (Claude should auto-use)

1. Create `.claude/skills/{skill-name}/SKILL.md`
2. Add frontmatter with `user-invocable: false`
3. Write a clear `description` that helps Claude match tasks
4. Document patterns and principles
5. Update the "Auto-Discovered Skills" table in this README

### For Reference Skills (Future/deferred)

1. Create `skills/{skill-name}/SKILL.md`
2. Document the pattern with examples
3. Add supporting files to `references/` if needed
4. Update the "Reference Skills" table in this README
5. Note the prerequisite for activation

---

## Skill Dependencies

Some skills build on others:

```
uk-police-design-system (foundation)
    ├── action-oriented-ux (uses design tokens)
    ├── adhd-interface-design (uses design tokens)
    └── b2b-visualisation (uses design tokens)

uk-police-market-domain (foundation)
    ├── lead-scoring-methodology (uses domain knowledge)
    ├── competitive-analysis (uses domain knowledge)
    └── intelligence-source-grading (uses domain knowledge)

technical-architecture (foundation)
    └── hubspot-integration (uses data patterns)
```

---

## Current Skill Inventory

### Active (Auto-Discovered by Claude)

| Skill | Location | Description |
|-------|----------|-------------|
| `action-oriented-ux` | `.claude/skills/` | Three-Zone Model, 2-minute loops |
| `adhd-interface-design` | `.claude/skills/` | ADHD-optimised patterns |
| `airtable-operations` | `.claude/skills/` | Airtable API patterns for MI Platform |
| `force-matching` | `.claude/skills/` | UK police force pattern matching |
| `n8n-code-javascript` | `.claude/skills/` | JavaScript in n8n Code nodes |
| `n8n-code-python` | `.claude/skills/` | Python in n8n Code nodes |
| `n8n-expression-syntax` | `.claude/skills/` | n8n expression validation |
| `n8n-mcp-tools-expert` | `.claude/skills/` | n8n-mcp MCP tools usage |
| `n8n-node-configuration` | `.claude/skills/` | Operation-aware node configuration |
| `n8n-validation-expert` | `.claude/skills/` | Validation error interpretation |
| `n8n-workflow-patterns` | `.claude/skills/` | Proven workflow patterns |
| `technical-architecture` | `.claude/skills/` | Data layer patterns |
| `uk-police-design-system` | `.claude/skills/` | Design tokens, components |
| `uk-police-market-domain` | `.claude/skills/` | Domain knowledge |

### Deferred (Reference Only)

| Skill | Location | Description | Prerequisite |
|-------|----------|-------------|--------------|
| `b2b-visualisation` | `skills/` | Score displays, trends | Scoring model |
| `board-dashboard-design` | `skills/` | Kanban layouts | Pipeline view |
| `competitive-analysis` | `skills/` | Competitor signal interpretation | Covered by domain skill |
| `hubspot-integration` | `skills/` | CRM patterns | Phase 2a |
| `intelligence-source-grading` | `skills/` | Signal reliability | Phase 2+ |
| `lead-scoring-methodology` | `skills/` | Dual-track scoring | Schema expansion |
| `notification-system` | `skills/` | Alerts, digests | Overnight tracking |
| `uk-public-sector-procurement` | `skills/` | Tender/framework knowledge | Phase 2b |

---

## Key Principle

> **Skills are aspirational. Specs are actionable.**

Don't try to implement every skill pattern immediately. Use skills to inform good design decisions within the scope of the current phase.

---

*Last updated: 23 January 2026*
