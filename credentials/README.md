# Credentials Folder

## Purpose

This folder stores API credentials and environment files that should never be committed to git.

## Setup Instructions

Copy the following files from `MI-Platform-Fresh-Start/credentials/`:

```
credentials/
├── .env.local           # All API keys and secrets
├── airtable-token.txt   # Airtable personal access token
├── n8n-api-key.txt      # n8n API authentication
├── hubspot-token.txt    # HubSpot private app token
└── claude-api-key.txt   # Anthropic API key
```

## Security

- This folder is git-ignored (contents never committed)
- Only `README.md` and `.gitkeep` are tracked
- Never share these files or commit them

## Verification

After copying credentials, verify access:

```bash
node scripts/health-check.js
```

All systems should show ✅ connected.

## What Goes Here

| File | Purpose |
|------|---------|
| `.env.local` | Primary environment variables file |
| `*-token.txt` | Individual token files for backup reference |
| `*.pem` | Certificate files (if needed) |
| `*.key` | Private key files (if needed) |

## What Does NOT Go Here

- Configuration files (those go in project root)
- Schema definitions (those go in `.claude/skills/`)
- Reference data (that goes in `reference-data/`)

---

*This folder structure protects sensitive data while keeping documentation visible.*
