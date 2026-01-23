# Claude Code Environment Selection Rules

**Purpose**: Guide for choosing CLI vs Desktop vs Web environments

---

## Quick Reference

| Scenario | Best Environment |
|----------|-----------------|
| Quick one-off task | CLI |
| Code review | Desktop |
| Long development session | Desktop or CLI |
| CI/CD automation | CLI (headless) |
| Background tasks | Web |
| No local checkout | Web |
| Parallel sessions | Desktop + worktrees |
| Remote/mobile access | Web |

---

## CLI (`claude` command)

### Use When:
- Running one-off commands: `claude -p "explain this error"`
- Script integration: `cat file.txt | claude -p "summarize"`
- CI/CD pipelines: need `--output-format json`
- Want latest features (CLI gets them first)
- Headless automation needed

### Key Flags:
```bash
# Headless mode (no interactive prompts)
claude -p "prompt"

# Resume sessions
claude --continue           # Resume last session
claude --resume <id>        # Resume specific session
claude --fork-session <id>  # Fork from a session

# Output formats
claude -p "prompt" --output-format json
claude -p "prompt" --output-format stream-json

# Permission modes
claude --permission-mode plan      # Read-only exploration
claude --permission-mode acceptEdits  # Auto-accept edits

# Cloud execution
claude --remote             # Run on Anthropic cloud VM
```

---

## Desktop App

### Use When:
- Code review (built-in diff viewer)
- Long sessions (more comfortable)
- Git worktrees for parallel work
- Need stable version (bundled)
- Visual debugging preferred
- Working with images (drag-and-drop)

### Exclusive Features:
- **Diff viewer**: Review changes with line-level commenting
- **Parallel sessions**: Native git worktree support
- **Cloud session launching**: Start web sessions from Desktop
- **Automatic PATH**: Extracts shell environment

### Keyboard Shortcuts:
| Action | Shortcut |
|--------|----------|
| Accept suggestion | Tab |
| Auto-accept edits | Shift+Tab (once) |
| Plan mode (read-only) | Shift+Tab (twice) |
| Extended thinking | Option+T |
| Paste image | Ctrl+V or Cmd+V |

---

## Web (`claude.ai/code`)

### Use When:
- No local repository checkout needed
- Background execution required
- Running multiple parallel tasks
- Remote/mobile access needed
- Want to teleport session to terminal later

### Exclusive Features:
```bash
# Background execution (prefix with &)
& npm run test              # Run tests in background
& npm run build             # Build in background

# Teleport session to local terminal
/teleport                   # From web to local
claude --teleport           # Pull from CLI
```

### Environment Detection:
```bash
# Check if running on web
if [ "$CLAUDE_CODE_REMOTE" = "true" ]; then
  echo "Running on web"
fi
```

### Persisting Environment:
```bash
# Persist env vars across sessions (web only)
export CLAUDE_ENV_FILE=/path/to/env-setup.sh
```

---

## Special Scenarios

### For Code Review
**Use Desktop** — Diff viewer with line comments

### For CI/CD Integration
**Use CLI** — Headless with JSON output
```bash
claude -p "Review this PR" --output-format json
```

### For Research/Exploration
**Use CLI or Desktop with Plan Mode**
```bash
claude --permission-mode plan
# Or: Shift+Tab twice in Desktop
```

### For Parallel Development
**Use Desktop with Git Worktrees**
1. Desktop creates worktrees in `~/.claude-worktrees/`
2. `.worktreeinclude` copies env files

### For Long-Running Tasks
**Use Web with Background Execution**
```bash
& npm run full-test
# Then teleport when ready
```

---

## Session Management

### Naming Sessions
```bash
/rename "Feature: Authentication"
```

### Resuming Sessions
```bash
claude --continue           # Resume last
claude --resume abc123      # Resume specific
```

### Forking Sessions
```bash
claude --fork-session abc123  # Branch from existing
```

---

## MI Platform Specific

For this project, typical workflow:

1. **Daily development**: CLI or Desktop (preference)
2. **Spec implementation**: CLI with `/implement` command
3. **Code review before commit**: Desktop diff viewer
4. **Background builds/tests**: Web with `&` prefix
5. **Parallel feature work**: Desktop with worktrees

**Current worktree**: This project is already in a worktree at:
- Worktree: `/Users/jamesjeram/.claude-worktrees/MI-Platform-V2/pedantic-cerf`
- Main repo: `/Users/jamesjeram/Documents/MI-Platform-V2`
