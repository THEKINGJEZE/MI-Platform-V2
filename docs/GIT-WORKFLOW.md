# Git Workflow

## Commit Conventions

Use conventional commit format for clear history:

```
[scope] Brief description

Optional detailed explanation if needed.
```

### Scopes

| Scope | When to Use | Example |
|-------|-------------|---------|
| `setup` | Infrastructure, tooling | `[setup] Add git workflow docs` |
| `docs` | Documentation only | `[docs] Update ANCHOR.md mission` |
| `schema` | Airtable schema changes | `[schema] Add Signals table` |
| `workflow` | n8n workflow changes | `[workflow] Create Indeed ingestion` |
| `patterns` | Reusable patterns | `[patterns] Add force-matching.js` |
| `scripts` | Build/utility scripts | `[scripts] Create health-check.js` |
| `fix` | Bug fixes | `[fix] Correct Indeed date filter` |
| `refactor` | Code restructure | `[refactor] Extract email patterns` |

### Examples

```bash
git commit -m "[setup] Initialize git repository"
git commit -m "[schema] Create Forces and Signals tables"
git commit -m "[workflow] Add Indeed job scraper with 24h filter"
git commit -m "[fix] Resolve force matching false positives"
```

## Daily Workflow

### Session End (Standard)
```bash
git add .
git commit -m "[scope] What you built"
git push
```

### Mid-Session Checkpoint
```bash
git add .
git commit -m "[wip] Checkpoint: [what's working so far]"
# Don't push WIP commits unless needed for backup
```

### Multiple Changes
```bash
# Separate logical changes into commits
git add patterns/
git commit -m "[patterns] Add Indeed keyword filters"

git add workflows/
git commit -m "[workflow] Create classification agent"

git push
```

## Integration Points

### STATUS.md Updates
Always commit STATUS.md changes with the work they describe:
```bash
git add STATUS.md src/
git commit -m "[workflow] Complete Indeed ingestion

- Created n8n workflow
- Added to STATUS.md Done list"
git push
```

### DECISIONS.md Updates
Commit decisions with the code they affect:
```bash
git add DECISIONS.md workflows/
git commit -m "[workflow] Use polling over webhooks for Indeed

Decision: D-015 logged in DECISIONS.md"
git push
```

### Document Hygiene
Commit hygiene cleanup separately:
```bash
git add STATUS.md DECISIONS.md
git commit -m "[docs] Weekly hygiene: archive old decisions"
git push
```

## Branching Strategy

**For this project: main branch only**

Why:
- Single developer (James + Claude)
- Linear workflow
- No parallel feature development
- Simplicity over process

If you need to experiment:
```bash
# Create throwaway branch
git checkout -b experiment-force-matching
# Try things
# If it works, merge back
git checkout main
git merge experiment-force-matching
git branch -d experiment-force-matching
```

## What to Commit

### Always Commit
- Source code (scripts, workflows)
- Documentation (STATUS.md, DECISIONS.md, etc.)
- Configuration files (package.json, .gitignore)
- Reference data (uk-police-forces.json)
- Patterns and prompts

### Never Commit
- `.env` or `.env.local` files
- API keys or tokens
- credentials/ folder contents (except README.md)
- node_modules/
- *.log files
- OS artifacts (.DS_Store)

### Ask First
- Large binary files
- Generated files
- Temporary debug scripts

## Commit Frequency

**Guideline**: Commit at natural stopping points

- End of session (always)
- After completing a feature
- After fixing a bug
- After documenting decisions
- Before switching tasks

**Don't**: Commit every single file change (too noisy)
**Don't**: Wait days without committing (lose progress)

## Recovery Scenarios

### Undo Last Commit (Not Pushed)
```bash
git reset --soft HEAD~1
# Files stay staged, commit undone
```

### Discard Uncommitted Changes
```bash
git checkout -- filename
# Or discard everything:
git reset --hard HEAD
```

### Recover Deleted File
```bash
git checkout HEAD -- path/to/file
```

## GitHub Integration

**Repository**: https://github.com/THEKINGJEZE/MI-Platform-V2

### First Time Setup
```bash
git remote add origin git@github.com:THEKINGJEZE/MI-Platform-V2.git
git push -u origin main
```

### After Setup
```bash
git push  # Pushes to origin/main automatically
```

## Pre-Commit Checklist

Before every commit:
- [ ] STATUS.md reflects what was done?
- [ ] Any decisions logged in DECISIONS.md?
- [ ] No credentials in changed files?
- [ ] Commit message follows [scope] convention?

## Alignment with Document Hygiene

Git supports the document hygiene protocol:

- **Weekly archives**: Commit when rotating decisions/status
- **Size limits**: Git history preserves removed content
- **Single source of truth**: Git shows when duplicates diverge

---

*This workflow keeps history clean, commits meaningful, and integration seamless.*
