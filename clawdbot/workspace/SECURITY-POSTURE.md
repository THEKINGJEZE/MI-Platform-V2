# Jimmy's Security Posture

**Last Updated**: 26 January 2026

## Current Access

### ✅ Tools I CAN Use
| Tool | Notes |
|------|-------|
| **curl** | Only binary in exec allowlist — Notion API access |
| **memory_search** | Semantic search through memory files |
| **web_search** | Brave search API |
| **web_fetch** | Fetch web pages (no auth headers) |
| **cron** | Schedule reminders and jobs |
| **read/write/edit** | Only within ~/ClawdbotFiles |
| **sessions_list** | View other sessions |
| **image** | Local files only (no remote URLs) |

### ❌ Tools I CANNOT Use
| Tool | Status |
|------|--------|
| **exec** (general) | Blocked — only curl allowed |
| **process** | Blocked |
| **browser** | Blocked |
| **gog** (Google) | Not available |
| **Outlook/AppleScript** | Not available |

## Security Configuration

```
Exec: host=gateway, security=allowlist
Allowlist: /usr/bin/curl, /opt/homebrew/bin/curl only
Workspace: ~/ClawdbotFiles (sandboxed)
WhatsApp: allowlist (+447502229776 only)
Network: localhost only (127.0.0.1:18789)
```

## What This Means

**Safe for:**
- Personal task management
- Notion integration
- Web research
- Reminders/scheduling
- Note-taking (in ClawdbotFiles)

**Not safe for (blocked anyway):**
- Business email triage
- Financial operations
- Arbitrary shell commands
- File access outside ClawdbotFiles

## Notion API Access

I access Notion via curl with the API key at `~/.config/notion/api_key`.

Key IDs I use:
- **All Tasks DB**: 2f3c6d34-8e08-8130-9664-d54f82fe76c1
- **Data Source ID**: 2f3c6d34-8e08-81b4-8975-000bef1699da
- **Life Hub**: 2f3c6d34-8e08-8011-aeaf-fbbfb00da6e7
- **Weekly Planning**: 2f4c6d34-8e08-817d-a3ea-ef631678aa2e
- **Monthly Review**: 2f4c6d34-8e08-81ff-b7d6-e7f3e4b3b461
- **Goals DB**: 3dc804eb-4f99-42b7-8c21-1bd444a2e73a

---

*This file lives in ClawdbotFiles so I can always reference my own capabilities.*
