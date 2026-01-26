# TOOLS.md - Local Notes

## Notion

**Integration**: Jimmy
**API Key**: ~/.config/notion/api_key
**API Version**: 2025-09-03

### Key Page/Database IDs
| Page | ID |
|------|-----|
| Life Hub | 2f3c6d34-8e08-8011-aeaf-fbbfb00da6e7 |
| Tasks | 2f3c6d34-8e08-80b2-8093-d9c65113a982 |
| All Tasks DB | 2f3c6d34-8e08-8130-9664-d54f82fe76c1 |
| All Tasks (data_source_id) | 2f3c6d34-8e08-81b4-8975-000bef1699da |
| Brain Dump | 2f3c6d34-8e08-8024-b58b-e569f520372f |
| Weekly Planning | 2f4c6d34-8e08-817d-a3ea-ef631678aa2e |
| Monthly Review | 2f4c6d34-8e08-81ff-b7d6-e7f3e4b3b461 |
| Goals DB | 3dc804eb-4f99-42b7-8c21-1bd444a2e73a |
| Flat Moving Plan | 2f3c6d34-8e08-80fc-9d80-e79a77bc26c7 |
| Relationship | 2f3c6d34-8e08-8052-a5d3-c360f2f858da |
| Marketing | 2f3c6d34-8e08-80bf-b115-c59646012a81 |
| Projects | 2f3c6d34-8e08-8010-b43f-ca2b691f5278 |

### Notion API via curl
```bash
NOTION_KEY=$(cat ~/.config/notion/api_key)
curl -s "https://api.notion.com/v1/..." \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03"
```

## User Info

- **Name**: James Jeram
- **Location**: Farnham, UK (moving to Birmingham late Jan/Feb 2026)
- **Work**: Peel Solutions (Director)
- **Has ADHD**: Yes — needs help with admin, task management

## Cron Jobs Active

| Job | Schedule | Purpose |
|-----|----------|---------|
| weekly-planning-sunday | Sun 6pm UK | Remind to do weekly planning |
| weekly-planning-monday-backup | Mon 8am UK | Backup reminder if not done |

## Security Notes

- Exec restricted to `curl` and `make-curl` only (allowlist)
- Workspace limited to ~/ClawdbotFiles
- See SECURITY-POSTURE.md and SECURITY-REVIEW.md for details

### Exec Allowlist Configuration

**Config file**: `~/.clawdbot/exec-approvals.json`

**Current allowlist entries**:
| Binary | Path | Purpose |
|--------|------|---------|
| curl | /usr/bin/curl | Notion API, general HTTP (requires approval) |
| curl | /opt/homebrew/bin/curl | Homebrew curl (requires approval) |
| make-curl | ~/ClawdbotFiles/bin/make-curl | Make.com webhooks ONLY (auto-approved) |

### make-curl Wrapper

Domain-restricted curl that only allows calls to Make.com webhooks.

**Location**: `~/ClawdbotFiles/bin/make-curl`

**Allowed domains**:
- `hook.eu2.make.com` (current)
- `hook.eu*.make.com` (future EU regions)
- `hook.us*.make.com` (future US regions)

**Usage**:
```bash
source ~/ClawdbotFiles/.env.makecom
make-curl -s -X POST "$MAKECOM_EMAIL_SEARCH" -H "Content-Type: application/json" -d '{"query": "test"}'
```

**Security benefits**:
- Auto-approved (no manual confirmation needed)
- Blocks any non-Make.com URLs
- Prevents prompt injection data exfiltration
- All calls logged via Make.com

**If you need to call a different domain**: Use regular `curl` (requires manual approval)

---

*This file is my quick reference for IDs, settings, and environment specifics.*
