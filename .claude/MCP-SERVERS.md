# MCP Servers — Active Integrations

## Overview

MCP (Model Context Protocol) servers extend Claude Code with external tool access. These are configured at the user level (`~/.claude/`) and available to all projects.

## Active Servers

### Airtable (`mcp__airtable__*`)
**Purpose**: Direct Airtable database operations
**Key Tools**:
- `list_records`, `search_records` — Query tables
- `create_record`, `update_records`, `delete_records` — CRUD operations
- `list_bases`, `list_tables`, `describe_table` — Schema exploration

**Project Usage**: Main database for Signals, Opportunities, Forces, Contacts

### HubSpot (`mcp__hubspot__*`)
**Purpose**: CRM integration for contact and company management
**Key Tools**:
- `hubspot-search-objects` — Find contacts/companies
- `hubspot-batch-read-objects` — Bulk data retrieval
- `hubspot-list-associations` — Relationship mapping

**Project Usage**: Contact research for opportunity enrichment (WF5)

### n8n (`mcp__n8n-mcp__*`)
**Purpose**: Workflow automation management
**Key Tools**:
- `n8n_create_workflow`, `n8n_update_full_workflow` — Workflow CRUD
- `n8n_list_workflows`, `n8n_get_workflow` — Query workflows
- `n8n_test_workflow`, `n8n_validate_workflow` — Testing
- `search_nodes`, `get_node` — Node documentation

**Project Usage**: Deploy and manage MI Platform workflows

### Make.com (`mcp__make__*`)
**Purpose**: Additional automation scenarios and integrations
**Key Tools**:
- `scenarios_list`, `scenarios_run` — Manage scenarios
- Various HubSpot helper tools (calls, meetings, emails, tasks)
- `s8294946_airtable_search_records` — Cross-platform Airtable access

**Project Usage**: Supplementary integrations and HubSpot engagement tracking

### Playwright (`mcp__plugin_playwright_playwright__*`)
**Purpose**: Browser automation for web scraping and UI testing
**Key Tools**:
- `browser_navigate`, `browser_click`, `browser_fill_form` — Navigation
- `browser_take_screenshot`, `browser_snapshot` — Capture state
- `browser_evaluate` — Run JavaScript in browser context

**Project Usage**: Available for future dashboard testing or web scraping

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

### Rate limits
- Airtable: 5 req/sec per base
- HubSpot: Varies by plan
- n8n: Self-hosted, no limits

## Related Documentation

- Airtable patterns: @.claude/rules/airtable.md
- n8n patterns: @.claude/rules/n8n.md
- HubSpot integration: @skills/hubspot-integration/SKILL.md
