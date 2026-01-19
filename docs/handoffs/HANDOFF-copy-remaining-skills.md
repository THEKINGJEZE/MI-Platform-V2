# Handoff: Copy Remaining Skills from V1 to V2

**Context**: We're migrating skills from the old MI Platform project to V2. Most skills have been copied, but 3 remain.

**Source**: `/Users/jamesjeram/Documents/mi-platform/.claude/skills/`
**Destination**: `/Users/jamesjeram/Documents/MI-Platform-V2/skills/`

---

## Skills to Copy

### 1. competitive-analysis (Useful)
**Source**: `/Users/jamesjeram/Documents/mi-platform/.claude/skills/competitive-analysis/`
**Files**: SKILL.md only (no references folder)

### 2. board-dashboard-design (Future)
**Source**: `/Users/jamesjeram/Documents/mi-platform/.claude/skills/board-dashboard-design/`
**Files**: SKILL.md only (no references folder)

### 3. uk-public-sector-procurement (Future)
**Source**: `/Users/jamesjeram/Documents/mi-platform/.claude/skills/uk-public-sector-procurement/`
**Files**: 
- SKILL.md
- references/api-endpoints.md
- references/cpv-keywords.md
- references/frameworks.md
- references/thresholds.md
- references/timing-windows.md

---

## Skill Format Requirements

Each skill must follow this structure:

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter (required)
│   │   ├── name: skill-name (required)
│   │   ├── description: When to use this skill (required)
│   │   └── model: haiku (optional - for lightweight skills)
│   └── Markdown body with instructions
└── references/ (optional)
    └── *.md files for detailed reference material
```

### SKILL.md Format

```markdown
---
name: skill-name
description: One-line description of what this skill does and when to use it. This is the trigger - make it clear and comprehensive.
---

# Skill Title

## Purpose
What this skill is for.

## Quick Reference
Tables and key information for fast lookup.

## Detailed Sections
...

## Reference Files
Links to files in references/ folder if they exist.
```

### Key Rules

1. **YAML frontmatter is mandatory** - `name` and `description` fields required
2. **Description is the trigger** - Claude Code uses this to decide when to load the skill
3. **Keep SKILL.md under 500 lines** - Move detailed content to `references/` folder
4. **Don't create extra files** - No README.md, CHANGELOG.md, etc.
5. **Copy entire folder** - Include `references/` subdirectory if it exists

---

## Copy Commands

```bash
# 1. competitive-analysis
cp -r "/Users/jamesjeram/Documents/mi-platform/.claude/skills/competitive-analysis" \
      "/Users/jamesjeram/Documents/MI-Platform-V2/skills/"

# 2. board-dashboard-design  
cp -r "/Users/jamesjeram/Documents/mi-platform/.claude/skills/board-dashboard-design" \
      "/Users/jamesjeram/Documents/MI-Platform-V2/skills/"

# 3. uk-public-sector-procurement
cp -r "/Users/jamesjeram/Documents/mi-platform/.claude/skills/uk-public-sector-procurement" \
      "/Users/jamesjeram/Documents/MI-Platform-V2/skills/"
```

---

## Verification

After copying, verify:

```bash
# List all skills
ls -la /Users/jamesjeram/Documents/MI-Platform-V2/skills/

# Should show 13 directories:
# - action-oriented-ux
# - adhd-interface-design
# - b2b-visualisation
# - board-dashboard-design (NEW)
# - competitive-analysis (NEW)
# - hubspot-integration
# - intelligence-source-grading
# - lead-scoring-methodology
# - notification-system
# - technical-architecture
# - uk-police-design-system
# - uk-police-market-domain
# - uk-public-sector-procurement (NEW)
```

---

## Post-Copy: Update CLAUDE.md

Add this section to `/Users/jamesjeram/Documents/MI-Platform-V2/CLAUDE.md`:

```markdown
## Project Skills

Design system and domain skills are available in `/skills/`. Read the relevant SKILL.md before building components or making domain-specific decisions.

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
```

---

## Skills NOT Copied (Meta/Tooling)

These skills are Claude Code tooling, not domain knowledge. They live in the old project only:

- `ai-project-setup` — Project bootstrapping patterns
- `cc-mastery` — Claude Code usage patterns
- `pipeline-orchestration` — Agent chaining patterns
- `sub-agent-creator` — Sub-agent creation patterns

If needed later, they can be copied, but they're not specific to MI Platform.

---

## Acceptance Criteria

- [ ] All 3 skills copied with correct folder structure
- [ ] Each SKILL.md has valid YAML frontmatter
- [ ] uk-public-sector-procurement includes all 5 reference files
- [ ] CLAUDE.md updated with skills table
- [ ] `ls skills/` shows 13 directories
