# Clawdbot Integration

**Created**: 26 January 2026
**Status**: Configured and Active
**Purpose**: Conversational interface layer for MI Platform via WhatsApp

---

## Overview

Clawdbot is installed on the Mac Mini as a WhatsApp-based AI assistant that can interact with MI Platform data. It runs as a LaunchAgent (auto-starts on boot) and uses Claude Opus 4.5 via OAuth (Claude Max subscription).

**Key Use Case**: Email triage and opportunity review via WhatsApp when away from desk.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLAWDBOT ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐      ┌──────────────┐      ┌──────────────────┐  │
│  │ WhatsApp │ ───▶ │   Gateway    │ ───▶ │   Claude Opus    │  │
│  │   DMs    │      │ (localhost)  │      │   4.5 (OAuth)    │  │
│  └──────────┘      └──────────────┘      └──────────────────┘  │
│        │                  │                       │             │
│        │                  │                       ▼             │
│        │                  │              ┌──────────────────┐  │
│        │                  │              │   Docker Sandbox │  │
│        │                  │              │   (Workspace)    │  │
│        │                  │              └──────────────────┘  │
│        │                  │                       │             │
│        │                  ▼                       ▼             │
│        │          ┌──────────────┐      ┌──────────────────┐  │
│        │          │  exec (curl) │      │ ~/ClawdbotFiles  │  │
│        │          │  Host-side   │      │   (sandboxed)    │  │
│        │          │  Allowlist   │      └──────────────────┘  │
│        │          └──────────────┘                             │
│        │                  │                                     │
│        ▼                  ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    EXTERNAL APIS                          │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  Notion API  │  Web Search  │  Web Fetch  │  Memory      │  │
│  │  (via curl)  │  (native)    │  (native)   │  (symlinked) │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Configuration Files

### Location

All Clawdbot config lives outside this repo at `~/.clawdbot/`:

| File | Purpose |
|------|---------|
| `clawdbot.json` | Main configuration |
| `exec-approvals.json` | Exec command allowlist |
| `.env` | API keys (encrypted) |
| `credentials/` | WhatsApp session data |

### Key Configuration: clawdbot.json

```json
{
  "agents": {
    "defaults": {
      "model": { "primary": "anthropic/claude-opus-4-5" },
      "workspace": "/Users/jamesjeram/ClawdbotFiles",
      "sandbox": {
        "mode": "all",
        "workspaceAccess": "rw"
      }
    }
  },
  "tools": {
    "exec": {
      "host": "gateway",
      "security": "allowlist"
    },
    "sandbox": {
      "tools": {
        "deny": ["process", "browser", "apply_patch"],
        "allow": ["exec", "cron", "read", "write", "edit", "web_search", "web_fetch", "memory_search", "sessions_list", "image"]
      }
    }
  },
  "channels": {
    "whatsapp": {
      "dmPolicy": "allowlist",
      "allowFrom": ["+447502229776"]
    }
  }
}
```

### Key Configuration: exec-approvals.json

This file restricts the `exec` tool to only allow `curl` commands:

```json
{
  "version": 1,
  "defaults": {
    "security": "allowlist",
    "ask": "on-miss",
    "askFallback": "deny"
  },
  "agents": {
    "main": {
      "security": "allowlist",
      "allowlist": [
        {"pattern": "/usr/bin/curl"},
        {"pattern": "/opt/homebrew/bin/curl"}
      ]
    }
  }
}
```

**Critical Settings Explained**:

| Setting | Value | Why |
|---------|-------|-----|
| `tools.exec.host` | `"gateway"` | Runs exec on Mac host (not Docker) so allowlist is enforced |
| `tools.exec.security` | `"allowlist"` | Enforces the exec-approvals.json allowlist |
| `defaults.askFallback` | `"deny"` | Commands not in allowlist are blocked (no prompting) |

---

## Security Boundaries

### What Clawdbot CAN Do

| Capability | Notes |
|------------|-------|
| Read/write files in `~/ClawdbotFiles` | Sandboxed workspace |
| Read/write memory files | `~/ClawdbotFiles/memory/` (moved from ~/clawd/memory) |
| Search the web | Native tool |
| Fetch web pages | Native tool |
| Make HTTP requests via curl | For APIs (Notion, etc.) |
| Search memory files | `~/ClawdbotFiles/memory/` (native, not symlinked) |
| Schedule tasks (cron) | For reminders |
| Send WhatsApp messages | To James only (allowlist) |

### What Clawdbot CANNOT Do

| Blocked | How |
|---------|-----|
| Run shell commands (ls, cat, rm, bash) | Not in exec allowlist |
| Access files outside workspace | Docker sandbox isolation |
| Control browser | Tool denied |
| Spawn processes | Tool denied |
| Apply patches outside sandbox | Tool denied |
| Access SSH keys, credentials, etc. | Outside workspace |
| Contact unknown WhatsApp numbers | DM allowlist |

### Prompt Injection Damage Limitation

Even if an attacker successfully injects a prompt via web content, they can only:
- Read/write files in `~/ClawdbotFiles` (nothing sensitive there)
- Search the web
- Make HTTP requests via curl (potential exfiltration risk, but limited)
- Send WhatsApp messages to James (annoying, not dangerous)

They **cannot** access the main filesystem, run arbitrary commands, or exfiltrate credentials.

---

## MI Platform Integration: Email Processor (SPEC-014)

### Decision (26 January 2026)

Clawdbot will replace n8n AI agents for email processing. This is documented in:
- **Full plan**: `~/ClawdbotFiles/plans/CLAWDBOT-EMAIL-PROCESSOR-PLAN.md`
- **Spec**: `specs/SPEC-014-clawdbot-email-processor.md` (to be created)

### Architecture

```
OUTLOOK ──► MAKE.COM ──► AIRTABLE (Email_Raw)
                              │
                              ▼
                         CLAWDBOT
                    (cron + curl every 3h)
                              │
                    1. Read emails via Airtable API
                    2. Look up sender in HubSpot (read-only)
                    3. Classify with Opus 4.5 + context
                    4. Draft responses
                    5. Write back to Airtable
                    6. WhatsApp James if uncertain
                              │
                              ▼
                    AIRTABLE (Emails table)
                              │
                              ▼
                    N8N EXECUTOR (simple, no AI)
                              │
                              ▼
                    MAKE.COM ──► OUTLOOK
```

### Why Clawdbot Instead of n8n AI Agents

| Aspect | n8n AI Agents | Clawdbot |
|--------|---------------|----------|
| Cost | ~$50-95/mo (API fees) | ~$15/mo (uses Claude Max quota) |
| Quality | gpt-4o-mini | Opus 4.5 |
| Memory | None | Persistent across sessions |
| Human-in-loop | Dashboard only | WhatsApp + Dashboard |
| Security | Full n8n access | Sandboxed, curl-only |

### Security Enhancements

| Layer | Purpose |
|-------|---------|
| Scoped Airtable token | Read Email_Raw, Write Emails only |
| Read-only HubSpot token | Context lookup, no write access |
| Sub-agent isolation | Web search delegated to restricted sub-agents |
| Prompt hardening | System prompt treats all content as untrusted |
| Human review | No email sent without approval |

### API Access (~/ClawdbotFiles/.env.*)

| Service | File | Scope |
|---------|------|-------|
| Airtable | `.env.airtable` | Read Email_Raw, Contacts, Forces; Write Emails |
| HubSpot | `.env.hubspot` | crm.objects.*.read ONLY |

### Sub-Agent Configuration

Add to `~/.clawdbot/clawdbot.json`:

```json
{
  "tools": {
    "subagents": {
      "tools": {
        "allow": ["web_search", "web_fetch"]
      }
    }
  }
}
```

This ensures web research is delegated to sub-agents that cannot access curl or files.

### Implementation Status

- [x] Plan approved
- [x] SPEC-014 created (`specs/SPEC-014-clawdbot-email-processor.md`)
- [x] Sub-agent isolation configured (`~/.clawdbot/clawdbot.json`)
- [x] API credentials created (`~/ClawdbotFiles/.env.airtable`, `.env.hubspot`)
- [x] Email-processor skill built (`~/ClawdbotFiles/skills/email-processor/SKILL.md`)
- [x] n8n executor workflow built (`n8n/workflows/email-executor.json`)
- [ ] End-to-end testing complete

---

## Other Potential Integrations

| Integration | How | Value |
|-------------|-----|-------|
| **Opportunity status** | Query Airtable Opportunities via curl | Quick status checks on the go |
| **Daily digest** | Cron job sends morning brief to WhatsApp | ADHD-friendly: info comes to you |
| **Quick approvals** | Reply "approve" to send drafted emails | Reduce friction for routine tasks |

---

## Operational Commands

### Check Gateway Status

```bash
launchctl list | grep clawdbot
# Should show com.clawdbot.gateway
```

### Restart Gateway

```bash
launchctl kickstart -k gui/$(id -u)/com.clawdbot.gateway
```

### View Logs

```bash
# Gateway logs
tail -f ~/Library/Logs/clawdbot/gateway.log

# Or via clawdbot CLI
clawdbot logs
```

### Security Audit

```bash
clawdbot security audit
```

### Update Clawdbot

```bash
clawdbot update
```

---

## Known Limitations

| Limitation | Impact | Workaround |
|------------|--------|------------|
| Image tool: remote URLs blocked | Can't analyze images from URLs | Fetch image via web_fetch, save locally |
| No direct Airtable access | Can't query MI Platform tables natively | Use curl + n8n webhook proxy |
| Sandbox path: `/workspace/` | API keys at `~/.config/` not accessible in sandbox | `host: "gateway"` runs curl on host |
| Rate limits | Clawdbot uses Claude Max quota | Monitor usage, switch to Sonnet if needed |

---

## Upstream Security Concerns

Clawdbot (the npm package) has known vulnerabilities from an Argus Security audit (January 2026):

- 8 critical vulnerabilities (plaintext tokens, CSRF bypass, etc.)
- 263 secret leaks detected
- 20 CVEs in dependencies

**Mitigation**: Our hardened config (sandbox, exec allowlist, DM allowlist) limits damage even if Clawdbot code is exploited. Do NOT use Clawdbot for sensitive data.

**Reference**: Full security review at `~/ClawdbotFiles/SECURITY-REVIEW.md`

---

## Quick Reference

| Item | Value |
|------|-------|
| Version | 2026.1.23-1 |
| Install location | `~/.npm-global/lib/node_modules/clawdbot` |
| Config location | `~/.clawdbot/` |
| Workspace | `~/ClawdbotFiles` |
| Gateway port | 18789 (localhost only) |
| Model | Claude Opus 4.5 (OAuth) |
| WhatsApp number | +447502229776 (allowlist) |

---

*This document records Clawdbot configuration for MI Platform integration planning. Configuration files are outside this repo at ~/.clawdbot/.*
