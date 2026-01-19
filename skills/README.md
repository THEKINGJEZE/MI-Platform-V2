# Skills Reference

**Purpose**: Guide for using skills ported from V1  
**Created**: 2025-01-19  
**Updated**: 2025-01-19

---

## What Are Skills?

Skills are codified knowledge from V1 development — patterns, methodologies, and domain expertise that were validated through real usage. They are:

- **Reference material** for design and architecture decisions
- **NOT requirements** for every phase
- **Progressively implemented** as the system matures

Think of skills as a library, not a checklist.

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

Each skill follows this structure:

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

If you develop a new pattern worth preserving:

1. Create `skills/{skill-name}/SKILL.md`
2. Document the pattern with examples
3. Add supporting files to `references/` if needed
4. Add to this README's skill table
5. Note which phase the skill applies to

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

| Skill | Description | Status |
|-------|-------------|--------|
| `action-oriented-ux` | Three-Zone Model, 2-minute loops | Ready for 1c |
| `adhd-interface-design` | ADHD-optimised patterns | Ready for 1c |
| `b2b-visualisation` | Score displays, trends | Deferred |
| `board-dashboard-design` | Kanban layouts | Deferred |
| `competitive-analysis` | Competitor signal interpretation | Ready for 1b |
| `hubspot-integration` | CRM patterns | Deferred |
| `intelligence-source-grading` | Signal reliability | Deferred |
| `lead-scoring-methodology` | Dual-track scoring | Deferred |
| `notification-system` | Alerts, digests | Deferred |
| `technical-architecture` | Data layer patterns | Active |
| `uk-police-design-system` | Design tokens, components | Active |
| `uk-police-market-domain` | Domain knowledge | Active |
| `uk-public-sector-procurement` | Tender/framework knowledge | Deferred |

---

## Key Principle

> **Skills are aspirational. Specs are actionable.**

Don't try to implement every skill pattern immediately. Use skills to inform good design decisions within the scope of the current phase.

---

*Last updated: 19 January 2025*
