# Document Hygiene Check

Run this command when documents feel bloated or during weekly maintenance.

## What This Checks

1. **STATUS.md** — Should be <100 lines (current state only)
2. **DECISIONS.md** — Should have <20 active decisions
3. **CLAUDE.md** — Should be <80 lines (lean index)
4. **Archive freshness** — Has monthly rotation happened?

## Execution Steps

```bash
# 1. Check document sizes
echo "=== Document Sizes ===" 
wc -l STATUS.md DECISIONS.md CLAUDE.md ANCHOR.md

# 2. Count active decisions
echo "=== Active Decisions ==="
grep -c "^#### [A-Z][0-9]*:" DECISIONS.md

# 3. Check last archive date
echo "=== Last Archive ==="
ls -la docs/archive/ 2>/dev/null || echo "No archives yet"

# 4. Check STATUS.md freshness
echo "=== STATUS.md Last Modified ==="
stat -f "%Sm" STATUS.md 2>/dev/null || stat -c "%y" STATUS.md
```

## If Documents Need Cleanup

### STATUS.md Over 100 Lines
1. Copy "Done This Session" and completed items to `docs/archive/status-YYYY-MM.md`
2. Reset "Done This Session" to empty
3. Keep only: current phase, current blockers, next action, progress bar

### DECISIONS.md Over 20 Decisions
1. Identify Tier 2/3 decisions that are complete
2. Move them to `docs/archive/decisions-YYYY-MM.md`
3. Update the Archive Log table in DECISIONS.md

### CLAUDE.md Over 80 Lines
1. Move detailed content to appropriate files:
   - Rules → `.claude/rules/`
   - Skills → `.claude/skills/`
   - Docs → `docs/`
2. Replace with `@reference` links

## After Cleanup
- Commit changes with message: "chore: document hygiene — archived stale content"
- Update STATUS.md with cleanup note
