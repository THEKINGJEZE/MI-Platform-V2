# Document Hygiene Protocol

## The Problem We're Solving

Documents grow unbounded → exceed context windows → get ignored → become stale → cause drift.

**Previous project**: 300+ decisions, unusable STATUS history, bloated CLAUDE.md

## Core Principle

> **Keep only what's actively needed. Archive the rest. Git is the true history.**

---

## Document Limits

| Document | Max Size | Rotation | Archive To |
|----------|----------|----------|------------|
| ANCHOR.md | ~100 lines | Never (immutable) | N/A |
| CLAUDE.md | ~80 lines | Never | N/A |
| STATUS.md | ~100 lines | Weekly | `docs/archive/status-YYYY-MM.md` |
| DECISIONS.md | 20 decisions | Monthly | `docs/archive/decisions-YYYY-MM.md` |

---

## Per-Document Rules

### ANCHOR.md
- **Never modify** — it's the mission definition
- If mission changes, that's a new project
- Protected by Claude Code permissions

### CLAUDE.md
- **Lean index only** — links to details, not details themselves
- If it's growing, you're putting too much in it
- Details go in `docs/` or `.claude/` folders

### STATUS.md
- **Current state only** — not a changelog
- "Done This Session" gets cleared when session ends
- Weekly: Archive completed items, reset progress bars
- Keep: Current phase, blockers, next action

### DECISIONS.md
- **Max 20 active** — adding #21 means archiving one
- **Tier 1** (architectural) stays forever
- **Tier 2** (phase) archived when phase completes
- **Tier 3** (implementation) archived when feature ships
- Monthly archive rotation regardless

---

## Archive Process

### Weekly (Sunday or Monday Morning)

1. **STATUS.md Cleanup**
   ```bash
   # Check STATUS.md length
   wc -l STATUS.md
   ```
   - If >100 lines, archive completed sections
   - Reset "Done This Session" 
   - Update progress percentages

2. **Quick Alignment Check**
   - Does STATUS.md reflect reality?
   - Any decisions made but not logged?
   - Any drift from ANCHOR.md?

### Monthly (1st of Month)

1. **DECISIONS.md Rotation**
   - Count active decisions
   - Archive completed Tier 2/3 decisions
   - Move to `docs/archive/decisions-YYYY-MM.md`
   - Update archive log table

2. **STATUS.md Deep Clean**
   - Archive previous month's history
   - Keep only current phase context

### Phase Completion

1. Archive all Tier 2 decisions for that phase
2. Archive all Tier 3 decisions for that phase
3. Update STATUS.md with new phase info
4. Celebrate 🎉

---

## Archive File Format

### decisions-YYYY-MM.md
```markdown
# Archived Decisions — [Month Year]

Archived from active DECISIONS.md on [date].
These decisions were relevant during Phase X.

## Decisions

### [Original decision content, copied verbatim]

---

*Archived because: [phase complete / feature shipped / superseded by X]*
```

### status-YYYY-MM.md
```markdown
# Status Archive — [Month Year]

## Summary
- Phase: X
- Key accomplishments: [list]
- Decisions made: [count]

## Weekly Snapshots

### Week of [date]
[Relevant STATUS.md snapshot]
```

---

## What NOT to Log

| Don't Log | Why | Instead |
|-----------|-----|---------|
| Every small choice | Noise | Git commit message |
| Obvious decisions | Wastes space | Nothing |
| "We decided to do X the normal way" | Default doesn't need logging | Nothing |
| Session-level debugging steps | Temporary | Nothing |
| Things you can see in git history | Redundant | `git log` |

---

## Hygiene Checklist

### Before Adding a Decision
- [ ] Will Claude need this next week?
- [ ] Does this affect multiple components?
- [ ] Is this non-obvious?
- [ ] Would I be confused later without it?

If <3 checkboxes → don't log it

### Before Ending a Session
- [ ] STATUS.md updated?
- [ ] Any decisions worth logging?
- [ ] Git committed?

### Weekly
- [ ] STATUS.md under 100 lines?
- [ ] DECISIONS.md under 20 active?
- [ ] Everything still aligned with ANCHOR.md?

### Monthly
- [ ] Archive stale decisions
- [ ] Archive old STATUS history
- [ ] Review ANCHOR.md alignment

---

## Recovery: When Documents Are Already Bloated

If you inherit a bloated document:

1. **Extract the current truth** — what's actually relevant now?
2. **Archive everything else** — bulk move to archive folder
3. **Reset to template** — start fresh with just current state
4. **Don't try to curate 300 items** — just archive and move on
