# MCP Servers — Active Integrations

## Overview

MCP (Model Context Protocol) servers extend Claude Code with external tool access.

**Two configurations exist:**
- **User-level** (`~/.claude/`) — stdio-based, desktop/CLI only
- **Project-level** (`.mcp.json`) — HTTP-based, works on web/phone/CLI

## Remote MCP Architecture (Web/Phone Access)

As of January 2026, this project has remote MCP servers deployed to enable Claude Code access from any environment (web, phone, CLI).

```
┌─────────────────────────────────────────────────────────────┐
│                    CLAUDE CODE                               │
├──────────────┬──────────────┬──────────────┬───────────────┤
│   CLI/Mac    │   Desktop    │  Web/Browser │  Phone App    │
└──────┬───────┴──────┬───────┴──────┬───────┴───────┬───────┘
       │              │              │               │
       │ stdio ✓      │ stdio ✓      │ HTTP only ✓   │ HTTP only ✓
       │              │              │               │
       ▼              ▼              ▼               ▼
┌─────────────────────────────────────────────────────────────┐
│                   REMOTE MCP SERVERS (HTTP)                  │
├─────────────────────────────────────────────────────────────┤
│  n8n-remote     │  airtable-remote │  HubSpot     │ Make.com │
│  VPS:3001       │  VPS:3002        │  (Official)  │ (Official)│
│  (Self-hosted)  │  (Self-hosted)   │              │          │
└─────────────────┴──────────────────┴──────────────┴──────────┘
```

### Remote Server Endpoints

| Server | URL | Auth | Status |
|--------|-----|------|--------|
| n8n-remote | `http://72.61.202.117:3001/mcp` | Bearer token | ✅ Active |
| airtable-remote | `http://72.61.202.117:3002/mcp` | Bearer token | ✅ Active |
| hubspot-remote | `https://mcp.hubspot.com/anthropic` | OAuth | ⚠️ Needs auth |
| make | `https://mcp.make.com` | OAuth | ⚠️ Needs auth |

### Configuration Files

- **Project config**: `.mcp.json` (HTTP servers for all environments)
- **Auth token**: `.env.local` → `MCP_AUTH_TOKEN`
- **VPS ecosystem**: `/docker/mcp-servers/ecosystem.config.js`

### VPS Management

```bash
# SSH to VPS
ssh root@72.61.202.117

# Check MCP server status
pm2 status

# View logs
pm2 logs n8n-mcp
pm2 logs airtable-mcp

# Restart servers
pm2 restart all

# Health checks
curl http://72.61.202.117:3001/health
curl http://72.61.202.117:3002/health
```

---

## Active Servers

### n8n (`mcp__n8n-mcp__*`)
**Purpose**: Workflow automation management
**Transport**: HTTP (remote) — works on web/phone
**Endpoint**: `http://72.61.202.117:3001/mcp`
**Key Tools**:
- `n8n_create_workflow`, `n8n_update_full_workflow` — Workflow CRUD
- `n8n_list_workflows`, `n8n_get_workflow` — Query workflows
- `n8n_test_workflow`, `n8n_validate_workflow` — Testing
- `search_nodes`, `get_node` — Node documentation

**Project Usage**: Deploy and manage MI Platform workflows

### Airtable (`mcp__airtable__*`)
**Purpose**: Direct Airtable database operations
**Transport**: HTTP (remote) — works on web/phone
**Endpoint**: `http://72.61.202.117:3002/mcp`
**Key Tools**:
- `list_records`, `search_records` — Query tables
- `create_record`, `update_records`, `delete_records` — CRUD operations
- `list_bases`, `list_tables`, `describe_table` — Schema exploration

**Project Usage**: Main database for Signals, Opportunities, Forces, Contacts

### HubSpot (`mcp__hubspot__*`)
**Purpose**: CRM integration for contact and company management
**Transport**: HTTP (official remote) — works on web/phone
**Endpoint**: `https://mcp.hubspot.com/anthropic`
**Key Tools**:
- `hubspot-search-objects` — Find contacts/companies
- `hubspot-batch-read-objects` — Bulk data retrieval
- `hubspot-list-associations` — Relationship mapping

**Project Usage**: Contact research for opportunity enrichment (WF5)
**Note**: Requires OAuth authentication via `/mcp` command

### Make.com (`mcp__make__*`)
**Purpose**: Additional automation scenarios and integrations
**Transport**: HTTP (official remote) — works on web/phone
**Endpoint**: `https://mcp.make.com`
**Key Tools**:
- `scenarios_list`, `scenarios_run` — Manage scenarios
- Various HubSpot helper tools (calls, meetings, emails, tasks)
- `s8294946_airtable_search_records` — Cross-platform Airtable access

**Project Usage**: Supplementary integrations and HubSpot engagement tracking
**Note**: Requires OAuth authentication via `/mcp` command

### Playwright / Chrome Integration (`mcp__plugin_playwright_playwright__*`)
**Purpose**: Browser automation for UI testing, verification, and web interaction
**Status**: ✅ Active and tested (Jan 2026)
**Key Tools**:
- `browser_navigate`, `browser_click`, `browser_fill_form` — Navigation & interaction
- `browser_take_screenshot`, `browser_snapshot` — Capture page state
- `browser_evaluate`, `browser_run_code` — Run JavaScript in browser
- `browser_console_messages` — Read console logs for debugging
- `browser_tabs` — Manage multiple tabs
- `browser_press_key` — Keyboard input for testing shortcuts

**Project Usage**:
- Dashboard UI verification (`https://dashboard.peelplatforms.co.uk`)
- Testing keyboard navigation (j/k keys)
- Checking console for JavaScript errors
- Recording demo GIFs

**Setup**: Requires Claude Chrome extension. See @.claude/BEST-PRACTICES.md for setup instructions.

### Context7 (`mcp__plugin_context7_context7__*`)
**Purpose**: Documentation retrieval for external libraries
**Key Tools**:
- `resolve-library-id` — Find library documentation
- `query-docs` — Search documentation content

**Project Usage**: Get up-to-date docs for n8n, React, Airtable APIs

### MCP Registry (`mcp__mcp-registry__*`)
**Purpose**: Discover and add new MCP servers
**Key Tools**:
- `search_mcp_registry` — Find available integrations
- `suggest_connectors` — Get recommendations

**Project Usage**: Expand integrations as needed

## Chrome Extension vs Playwright MCP

Two browser automation options exist — they serve different purposes:

| Feature | Chrome Extension | Playwright MCP |
|---------|-----------------|----------------|
| Browser | Your actual Chrome | Headless Chromium |
| Auth | Uses your logged-in sessions | No existing sessions |
| Best for | Testing authenticated apps, real user flows | Scraping, automation |
| Setup | Install extension, run `claude --chrome` | Auto-available |

**For this project**: Use Chrome extension for dashboard testing (you're already logged in).

## Deferred Tools Access

MCP tools are "deferred" — they must be loaded before use via `ToolSearch`:

```
# Direct selection
ToolSearch query: "select:mcp__airtable__search_records"

# Keyword search
ToolSearch query: "hubspot contacts"
```

## Adding New Servers

```bash
claude mcp add
```

Then restart Claude Code for changes to take effect.

## Troubleshooting

### Tool returns error
- Check credentials in `~/.claude/` or environment variables
- Verify the service is accessible
- Some tools require specific scopes or permissions

### Tool not found
- Use `ToolSearch` to load deferred tools before calling
- Check spelling matches exactly

### Remote MCP not connecting
- Check VPS is running: `ssh root@72.61.202.117 'pm2 status'`
- Check health endpoint: `curl http://72.61.202.117:3001/health`
- Verify auth token matches `.env.local` → `MCP_AUTH_TOKEN`
- Check PM2 logs: `ssh root@72.61.202.117 'pm2 logs'`

### OAuth servers need authentication
- Run `/mcp` in Claude Code
- Select the server needing auth
- Complete OAuth flow in browser

### Rate limits
- Airtable: 5 req/sec per base
- HubSpot: Varies by plan
- n8n: Self-hosted, no limits

## Deployment

### Redeploy MCP Servers to VPS

```bash
# From project root
./scripts/deploy-mcp-servers.sh
```

Or manually:
```bash
ssh root@72.61.202.117
cd /docker/mcp-servers
pm2 restart ecosystem.config.js
```

### Adding Auth Token to New Environments

The `MCP_AUTH_TOKEN` must be set in your environment for remote MCPs to authenticate:
```bash
export MCP_AUTH_TOKEN=om+qzbzTox1ccIlB4l7l2NXLFoUWG7McHk/tRqHC2UI=
```

Or add to `.env.local` (already configured in this project).

## Related Documentation

- Airtable patterns: @.claude/rules/airtable.md
- n8n patterns: @.claude/rules/n8n.md
- HubSpot integration: @skills/hubspot-integration/SKILL.md
- Project MCP config: @.mcp.json
- Deployment script: @scripts/deploy-mcp-servers.sh
