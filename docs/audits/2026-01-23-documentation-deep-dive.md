# Claude Code Documentation Deep Dive — Gap Analysis & Recommendations

**Date**: 23 January 2026
**Auditor**: Claude Code
**Scope**: Full review of code.claude.com and platform.claude.com documentation

---

## Executive Summary

This audit reviewed all major Claude Code documentation pages to identify gaps between official best practices and our current MI Platform configuration.

**Overall Assessment**: The MI Platform has an **exceptionally mature** Claude Code setup — more sophisticated than most projects. We're using ~85% of available features effectively. The remaining gaps are primarily in:

1. **Environment-specific rules** (CLI vs Desktop vs Web)
2. **Advanced hook patterns** (prompt-based hooks)
3. **Session management features** (teleporting, forking)
4. **Agent SDK integration** (for CI/CD automation)

---

## Documentation Reviewed

| Page | URL | Key Learnings |
|------|-----|---------------|
| Desktop | code.claude.com/docs/en/desktop | Diff view, git worktrees, .worktreeinclude |
| Web | code.claude.com/docs/en/claude-code-on-the-web | Async execution, teleporting, CLAUDE_ENV_FILE |
| Features | code.claude.com/docs/en/features-overview | Full feature matrix |
| Common Workflows | code.claude.com/docs/en/common-workflows | Plan mode, session resumption, headless mode |
| How It Works | code.claude.com/docs/en/how-claude-code-works | Agentic loop, context management |
| Sub-agents | code.claude.com/docs/en/sub-agents | Custom agents, hooks, skills |
| Agent SDK | platform.claude.com/docs/en/agent-sdk | Python/TypeScript SDK for automation |
| Hooks | code.claude.com/docs/en/hooks | All hook types, input/output schemas |
| MCP | code.claude.com/docs/en/mcp | Server configuration, scopes |
| Settings | code.claude.com/docs/en/settings | Full settings reference |

---

## Current Configuration Inventory

### Project Configuration (`.claude/`)

| Component | Count | Status |
|-----------|-------|--------|
| Agents | 11 | ✅ Excellent |
| Commands | 9 | ✅ Good |
| Skills | 14 | ✅ Good |
| Hooks | 6 | ✅ Excellent |

### Global Configuration (`~/.claude/`)

| Component | Count | Status |
|-----------|-------|--------|
| Skills | 21 | ✅ Excellent |
| Plugins | 8 | ✅ Good |

### MCP Servers

| Server | Transport | Status |
|--------|-----------|--------|
| context7 | stdio | ✅ Connected |
| playwright | stdio | ✅ Connected |
| n8n-mcp | stdio | ✅ Connected |
| airtable | stdio | ✅ Connected |
| hubspot | stdio | ✅ Connected |
| make | HTTP | ✅ Connected |
| serena | stdio | ✗ Failed |

---

## CLI vs Desktop vs Web — When to Use Each

Based on documentation review, here are recommended rules:

### Use CLI (`claude` command) When:

| Scenario | Why CLI |
|----------|---------|
| Headless automation | `-p "prompt"` flag, JSON output |
| CI/CD pipelines | `--output-format json`, non-interactive |
| One-off quick tasks | Faster startup than Desktop |
| Unix pipe integration | `cat file.txt \| claude -p "summarize"` |
| Script integration | Can be called from bash/Python |
| Latest features | CLI gets features before Desktop |

**CLI-specific flags discovered:**
```bash
claude -p "prompt"              # Headless mode
claude --continue               # Resume last session
claude --resume <id>            # Resume specific session
claude --fork-session <id>      # Fork from session
claude --output-format json     # Structured output
claude --permission-mode plan   # Read-only exploration
claude --remote                 # Run on cloud VM
claude --teleport              # Pull web session to terminal
```

### Use Desktop App When:

| Scenario | Why Desktop |
|----------|-------------|
| Code review | Built-in diff viewer with line comments |
| Git worktrees | Native parallel session support |
| Visual debugging | Better for seeing changes |
| Stable version needed | Bundled Claude Code version |
| Long sessions | More comfortable for extended work |
| Image handling | Drag-and-drop support |

**Desktop-specific features:**
- Diff view for reviewing changes before commit
- Line-level commenting in diffs
- Git worktree integration with `.worktreeinclude`
- Cloud session launching
- Automatic PATH extraction

### Use Web (`claude.ai/code`) When:

| Scenario | Why Web |
|----------|---------|
| No local checkout needed | Works with remote repos |
| Background execution | `&` prefix for async tasks |
| Parallel long-running tasks | Multiple background sessions |
| Remote/mobile access | Browser-based |
| Teleporting sessions | Pull to terminal when ready |

**Web-specific features:**
```bash
& npm run test          # Run in background
& npm run build         # Another background task
/teleport               # Pull session to local terminal
```

**Environment detection:**
- `CLAUDE_CODE_REMOTE=true` when running on web

---

## Gap Analysis

### What We're Using Excellently ✅

#### 1. Hook Architecture
**Best Practice**: Use hooks for deterministic automation
**Our Status**: 6 hooks configured covering full lifecycle

| Hook | Our Implementation | Alignment |
|------|-------------------|-----------|
| SessionStart | Context injection | ✅ |
| PreToolUse | Pre-edit consistency check | ✅ |
| PreCompact | Forces STATUS.md freshness | ✅ |
| PostToolUse | Auto-syncs phase changes | ✅ |
| Stop | Alignment questions before close | ✅ |
| Notification | macOS desktop alerts | ✅ |

#### 2. Custom Subagents
**Best Practice**: Create specialized agents for complex tasks
**Our Status**: 11 agents with domain-specific expertise

| Agent | Tools | Purpose |
|-------|-------|---------|
| workflow-builder | Read, Write, Edit, Bash, n8n-mcp | n8n workflows |
| signal-triage | Read, Grep, Glob, Bash | UK police signals |
| alignment-checker | Read, Grep, Glob | Mission drift detection |
| 5 audit agents | Read-only | Diagnostics |
| 3 doc audit agents | Read, Grep, Glob | Setup auditing |

#### 3. Skills System
**Best Practice**: Use skills for domain knowledge
**Our Status**: 14 project skills + 21 global skills

**Project Skills:**
- 6 design/domain skills (uk-police, adhd-interface, etc.)
- 7 n8n skills
- 1 airtable-operations skill

**Global Skills:**
- anthropic: pdf, docx, xlsx, pptx, skill-creator, mcp-builder, webapp-testing
- n8n: 7 workflow skills
- daymade: github-ops, mermaid-tools, markdown-tools, ui-designer, repomix-safe-mixer

#### 4. MCP Integration
**Best Practice**: Connect external tools via MCP
**Our Status**: 6 connected servers (1 failing)

- ✅ context7, playwright, n8n-mcp, airtable, hubspot, make
- ✗ serena (needs fixing)

#### 5. Permissions
**Best Practice**: Allowlist safe commands, deny dangerous ones
**Our Status**: Well-configured

```json
{
  "allow": ["Bash(npm *)", "Bash(git *)", "Read", "Write", "Edit"],
  "deny": ["Bash(rm -rf *)", "Bash(sudo *)", "Write(ANCHOR.md)"]
}
```

---

### What We're Partially Using ⚠️

#### 1. Plan Mode
**Best Practice**: Use `--permission-mode plan` or Shift+Tab twice for research
**Our Status**: Used but not documented in CLAUDE.md

**Recommendation**: Add plan mode guidance to session protocol:
```markdown
## Session Protocol
...
3. **Deep Research**: Use Shift+Tab twice for plan mode (read-only exploration)
```

#### 2. Extended Thinking
**Best Practice**: Toggle with Option+T, configure MAX_THINKING_TOKENS
**Our Status**: Not explicitly configured

**Recommendation**: Add to settings.json:
```json
{
  "alwaysThinkingEnabled": false,
  "env": {
    "MAX_THINKING_TOKENS": "50000"
  }
}
```

#### 3. Session Management
**Best Practice**: Use `--continue`, `--resume`, `--fork-session`
**Our Status**: Not documented or leveraged

**Recommendation**: Document session patterns:
```bash
claude --continue           # Resume last session
claude --resume abc123      # Resume specific session
/rename "Feature: Auth"     # Name current session
```

#### 4. Prompt-Based Hooks
**Best Practice**: Use `type: "prompt"` for intelligent decisions
**Our Status**: Only using for Stop hook

**Recommendation**: Our Stop hook already uses prompt-based:
```json
{
  "type": "prompt",
  "prompt": "Before finishing: (1) Is STATUS.md updated?..."
}
```

Consider adding for complex PreToolUse decisions.

---

### What We're NOT Using ❌

#### 1. Git Worktrees for Parallel Sessions
**Best Practice**: Use git worktrees with .worktreeinclude
**Our Status**: We're IN a worktree but not leveraging parallel sessions

**We Are Already In a Worktree:**
- Working dir: `/Users/jamesjeram/.claude-worktrees/MI-Platform-V2/pedantic-cerf`
- Main repo: `/Users/jamesjeram/Documents/MI-Platform-V2`

**Recommendation**: Create `.worktreeinclude` for env files:
```
.env.local
.env
```

#### 2. Teleporting Sessions
**Best Practice**: Use `/teleport` or `--teleport` to pull web sessions
**Our Status**: Not using

**Recommendation**: Document for when working remotely:
```bash
# On web: Start long task with &
& npm run full-test

# Later on terminal:
claude --teleport
```

#### 3. Agent SDK for CI/CD
**Best Practice**: Use Agent SDK for automated pipelines
**Our Status**: Not using

**Potential Use Cases:**
- Pre-commit code review: `npm run claude:review`
- Automated spec validation
- PR description generation

**Example Integration:**
```python
from claude_agent_sdk import query, ClaudeAgentOptions

async for message in query(
    prompt="Review staged changes for quality issues",
    options=ClaudeAgentOptions(
        allowed_tools=["Read", "Glob", "Grep"],
        permission_mode="bypassPermissions"
    )
):
    print(message)
```

#### 4. Sandbox Mode
**Best Practice**: Use `sandbox.enabled: true` for dangerous operations
**Our Status**: Not configured

**Recommendation**: Consider for unattended workflows:
```json
{
  "sandbox": {
    "enabled": true,
    "autoAllowBashIfSandboxed": true,
    "excludedCommands": ["git"]
  }
}
```

#### 5. Custom File Suggestion
**Best Practice**: Use `fileSuggestion` for custom @ autocomplete
**Our Status**: Not configured

**Recommendation**: Could create script for frequently-used files:
```json
{
  "fileSuggestion": {
    "type": "command",
    "command": ".claude/hooks/file-suggestion.sh"
  }
}
```

#### 6. Status Line Customization
**Best Practice**: Custom status line for project context
**Our Status**: Not configured

**Recommendation**:
```json
{
  "statusLine": {
    "type": "command",
    "command": ".claude/hooks/statusline.sh"
  }
}
```

---

## Recommendations

### Priority 1: Quick Wins (Do Now)

| # | Item | Effort | Impact |
|---|------|--------|--------|
| 1 | Create `.worktreeinclude` file | 5 min | Medium |
| 2 | Fix serena MCP server | 10 min | Low |
| 3 | Add plan mode to CLAUDE.md session protocol | 5 min | Medium |
| 4 | Document CLI vs Desktop vs Web rules | 15 min | High |

### Priority 2: Medium Effort

| # | Item | Effort | Impact |
|---|------|--------|--------|
| 5 | Add Agent SDK for pre-commit review | 1 hour | High |
| 6 | Create custom statusline.sh | 30 min | Medium |
| 7 | Configure extended thinking settings | 10 min | Medium |

### Priority 3: Exploration

| # | Item | Effort | Impact |
|---|------|--------|--------|
| 8 | Sandbox mode for automation | 30 min | Low |
| 9 | Custom file suggestion script | 1 hour | Low |

---

## Specific Actions

### Action 1: Create `.worktreeinclude`

```bash
# In project root
echo ".env.local
.env" > .worktreeinclude
```

### Action 2: Fix serena MCP Server

```bash
claude mcp remove serena
# Or update if needed for LSP features
```

### Action 3: Add CLI/Desktop/Web Rules to CLAUDE.md

Add to Session Protocol section:
```markdown
## Environment Selection

| Use Case | Environment | Why |
|----------|-------------|-----|
| Daily development | CLI or Desktop | Personal preference |
| Code review | Desktop | Diff viewer |
| Headless automation | CLI | `-p` flag, JSON output |
| Background tasks | Web | `&` prefix |
| Remote access | Web | Browser-based |
| Parallel sessions | Desktop + worktrees | Native support |
```

### Action 4: Create Environment Rules Document

Create `.claude/ENVIRONMENT-RULES.md`:
```markdown
# Claude Code Environment Selection Rules

## When to Use CLI
- Quick one-off tasks
- Script integration
- CI/CD pipelines
- Headless mode needed

## When to Use Desktop
- Code review (use diff viewer)
- Long sessions
- Visual debugging
- Parallel worktrees

## When to Use Web
- No local checkout needed
- Background execution
- Remote/mobile access
- Want to teleport session later
```

---

## Summary

| Category | Current | Possible | Gap |
|----------|---------|----------|-----|
| Hooks | 6 | 9+ | 3 |
| Agents | 11 | 11 | 0 |
| Skills | 35 | 35+ | 0 |
| Commands | 9 | 9 | 0 |
| MCP Servers | 5/6 | 6/6 | 1 |
| Plan Mode | Partial | Full | Minor |
| Session Mgmt | Unused | Full | Medium |
| Agent SDK | Unused | Full | Large |
| Sandbox | Unused | Full | Low priority |

**Overall Score: 85%** — Excellent configuration, minor gaps in advanced features.

---

*This audit replaces the previous best practices audit at `.claude/plans/drifting-wobbling-yao.md`*
