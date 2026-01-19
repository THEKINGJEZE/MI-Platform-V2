# Claude Code Capabilities Reference

**Purpose**: Quick lookup for "What can Claude Code do?" and "What tool should I use?"
**Audience**: Future Claude Code sessions, James reviewing capabilities
**Last Updated**: 16 January 2026
**Status**: Living document, update when capabilities change

**This is a REFERENCE, not a tutorial. For learning, see README.md → CLAUDE.md → specific docs.**

---

## Quick Jump

| Section | Quick Answer |
|---------|--------------|
| [Core Capabilities](#2-core-capabilities-overview) | "I need to X → use Y" decision matrix |
| [Sub-Agents](#3-sub-agents) | When to use specialized agents (alignment, workflow, triage) |
| [Slash Commands](#4-slash-commands) | `/project:*` commands for common operations |
| [Skills System](#5-skills-system) | Airtable schema and how to create new skills |
| [MCP Integrations](#6-mcp-integrations) | Airtable, n8n, HubSpot, Playwright, Context7 tools |
| [Built-in Tools](#7-built-in-tools) | Bash, Read/Write/Edit, Grep/Glob permissions |
| [Project Config](#8-project-configuration) | Hooks, autoload, settings.json structure |
| [Common Patterns](#9-common-patterns--best-practices) | Research, build, debug, wrap-up workflows |
| [Limitations](#10-limitations--gotchas) | What you can't do, easy mistakes, performance tips |
| [Cross-Reference](#11-cross-reference-directory) | Links to all related docs |
| [Extension Guide](#12-extension-guide) | How to add agents, commands, skills, hooks |

---

## 1. Front Matter

### Capability Categories

| Category | Count | Examples |
|----------|-------|----------|
| **Specialized Agents** | 8 | alignment-checker, workflow-builder, signal-triage, audit-* (5) |
| **Slash Commands** | 6 | /check-alignment, /health-check, /consistency-check, /deploy-workflow, /hygiene-check, /doc-audit |
| **Skills** | 1 | force-matching |
| **MCP Integrations** | 5 | Airtable (12 tools), n8n (16 tools), HubSpot (6 tools), Playwright (17 tools), Context7 (2 tools) |
| **Built-in Tools** | 10+ | Bash, Read, Write, Edit, Grep, Glob, WebSearch, TodoWrite, Task, AskUserQuestion |

### Common Questions

**"How do I build an n8n workflow?"** → Use `workflow-builder` agent ([Section 3](#3-sub-agents))

**"Is my work aligned with the mission?"** → Use `/project:check-alignment` command ([Section 4](#4-slash-commands))

**"How do I interact with Airtable?"** → Use Airtable MCP tools ([Section 6](#6-mcp-integrations))

**"Can I send emails?"** → No, write to command queue (G-002) ([Section 10](#10-limitations--gotchas))

**"What files auto-load at session start?"** → ANCHOR.md, CLAUDE.md, STATUS.md ([Section 8](#8-project-configuration))

---

## 2. Core Capabilities Overview

### Decision Matrix: "I Need To..." → "Use This"

| I Need To... | Use This | Notes |
|--------------|----------|-------|
| **Build n8n workflow** | `workflow-builder` agent | Sonnet model, can write, knows n8n patterns |
| **Check mission alignment** | `/project:check-alignment` command OR `alignment-checker` agent | Command = 30s self-check, Agent = thorough audit |
| **Test API connections** | `/project:health-check` command | Verifies Airtable, n8n, HubSpot, Claude API |
| **Find broken doc references** | `/project:consistency-check` command | Missing files, fact mismatches |
| **Check document sizes** | `/project:hygiene-check` command | Warns if STATUS.md >100 lines, DECISIONS.md >20 |
| **Deploy workflow to n8n** | `/project:deploy-workflow <name>` command | Imports workflow JSON to n8n instance |
| **Explore codebase** | `Explore` agent (via Task tool) | For open-ended "how does X work?" questions |
| **Design signal classification** | `signal-triage` agent | UK police domain expert |
| **Create Airtable record** | `mcp__airtable__create_record` | MCP tool, requires base/table ID |
| **List Airtable records** | `mcp__airtable__list_records` | Use filterByFormula for targeted queries |
| **Search Airtable** | `mcp__airtable__search_records` | Better than list when filtering needed |
| **Create n8n workflow** | `mcp__n8n-mcp__n8n_create_workflow` | Requires nodes[], connections{}, name |
| **Update n8n workflow** | `mcp__n8n-mcp__n8n_update_partial_workflow` | Incremental updates (prefer over full update) |
| **Validate n8n workflow** | `mcp__n8n-mcp__n8n_validate_workflow` | Checks nodes, connections, expressions |
| **Test n8n workflow** | `mcp__n8n-mcp__n8n_test_workflow` | Executes workflow (webhook/form/chat triggers) |
| **Get HubSpot objects** | `mcp__hubspot__hubspot-list-objects` | Must call hubspot-get-user-details first |
| **Search HubSpot** | `mcp__hubspot__hubspot-search-objects` | Complex filter groups with AND/OR logic |
| **Scrape with browser** | Playwright MCP tools | When JavaScript required (navigate, click, type, snapshot) |
| **Get library docs** | Context7 MCP | Up-to-date docs better than web search |
| **Search files by pattern** | `Glob` tool | `**/*.js`, `src/**/*.tsx` patterns |
| **Search file contents** | `Grep` tool | Regex search across files |
| **Read file** | `Read` tool | Absolute path required |
| **Edit file** | `Edit` tool | Exact string replacement (must read first) |
| **Create file** | `Write` tool | Only for NEW files (prefer Edit for existing) |
| **Run git command** | `Bash` tool | git status, diff, log, commit, push allowed |
| **Run node script** | `Bash` tool | `node scripts/*.js` allowed |
| **Search web** | `WebSearch` tool | Better than WebFetch for current info |
| **Track tasks** | `TodoWrite` tool | In-session task management |
| **Ask user question** | `AskUserQuestion` tool | Multiple choice with 2-4 options |

---

## 3. Sub-Agents

Claude Code has **3 specialized agents** for specific domains. Invoke via `Task` tool with `subagent_type` parameter.

### alignment-checker

**Model**: Haiku (fast, low-cost)
**Mode**: Plan (read-only)
**Tools**: Read, Grep, Glob

**When to Use**:
- Before making architectural decisions
- Before major refactors
- When uncertain if work aligns with mission
- When you sense potential scope creep
- Proactively every few hours of work

**What It Does**:
- Reads ANCHOR.md (immutable mission)
- Reads STATUS.md (current goals)
- Reads DECISIONS.md (historical context)
- Compares current work to success criteria
- Returns traffic light: 🟢 Aligned | 🟡 Tangential | 🔴 Drifted

**Example Invocation**:
```javascript
Task(
  subagent_type="alignment-checker",
  prompt="Audit current work against ANCHOR.md. I'm building X feature for Y reason."
)
```

**Location**: `.claude/agents/alignment-checker.md`

---

### workflow-builder

**Model**: Sonnet (reasoning required)
**Mode**: Default (can write)
**Tools**: Read, Write, Edit, Grep, Glob, Bash, n8n-mcp

**When to Use**:
- Creating new n8n workflows
- Modifying existing workflows
- Debugging workflow issues
- Need n8n-specific knowledge (node types, expressions)

**What It Does**:
- Understands n8n node types and patterns
- Enforces workflow standards (logging, error handling)
- Knows expression syntax (`{{ $json.field }}`)
- Outputs complete workflow JSON ready to import

**Focus**: n8n implementation ONLY, not business logic or API design

**Example Invocation**:
```javascript
Task(
  subagent_type="workflow-builder",
  prompt="Create n8n workflow that scrapes Indeed jobs every 4 hours and stores to Airtable Raw Archive table. Follow guardrail G-001 (dumb scraper pattern)."
)
```

**Standard Pattern Enforced**:
```
[Trigger] → [Set Variables] → [Log Start] → [Main Logic] → [Log Success/Failure] → [Alert if needed]
```

**Location**: `.claude/agents/workflow-builder.md`

---

### signal-triage

**Model**: Sonnet
**Mode**: Default
**Tools**: Read, Grep, Glob, Bash

**When to Use**:
- Designing signal classification logic
- Testing classification accuracy
- Debugging misclassifications
- Need UK police domain knowledge

**What It Does**:
- Understands UK police force structures (43 territorial forces)
- Knows relevant job titles (Investigator, Disclosure Officer, etc.)
- Identifies competitor postings (Red Snapper, Investigo, etc.)
- Classifies signals as high/medium/low/irrelevant relevance
- Returns JSON with force_match, confidence, recommended_action

**Does NOT Do**: Workflow implementation, API design

**Example Invocation**:
```javascript
Task(
  subagent_type="signal-triage",
  prompt="Design classification logic for Indeed job signals. Need to identify investigator roles at police forces vs noise (officer recruitment, IT roles)."
)
```

**Output Format**:
```json
{
  "signal_type": "job_posting",
  "relevance": "high",
  "confidence": 85,
  "force_match": "Hampshire Constabulary",
  "is_competitor_posting": false,
  "recommended_action": "create_opportunity"
}
```

**Location**: `.claude/agents/signal-triage.md`

---

### General Agent Usage Tips

**Parallel Invocation**: When multiple agents needed, invoke in single message:
```javascript
// Good - parallel execution
Task(subagent_type="alignment-checker", ...),
Task(subagent_type="workflow-builder", ...)

// Bad - sequential (slower)
Task(subagent_type="alignment-checker", ...)
[wait for result]
Task(subagent_type="workflow-builder", ...)
```

**Model Selection**: Agents have defaults but you can override:
- Use Haiku for simple/fast operations (alignment checks)
- Use Sonnet for complex reasoning (workflow building)

**Hooks Don't Run**: Sub-agents don't get SessionStart, PreCompact, or Stop hooks

---

## 4. Slash Commands

### Quick Reference

| Command | Speed | Output | Use When |
|---------|-------|--------|----------|
| `/project:check-alignment` | 10s | Traffic light (🟢🟡🔴) | Before major work, proactively every few hours |
| `/project:health-check` | 2s | API connection status (✅/❌) | Session start, when APIs failing |
| `/project:consistency-check` | 3s | Missing refs, fact mismatches | Weekly maintenance, before commits |
| `/project:deploy-workflow` | 30s | n8n workflow imported | After building workflow |
| `/project:hygiene-check` | 5s | Doc size warnings | Weekly/monthly cleanup |
| `/project:doc-audit` | 60s | AUDIT-REPORT.md with findings | Deep alignment check, before releases |

---

### check-alignment

**Purpose**: Quick self-check (30 seconds) to detect mission drift

**What It Does**:
1. Prompts you to answer:
   - What am I working on?
   - What does STATUS.md say the goal is?
   - Does #1 serve Monday morning experience?
2. Provides traffic light framework

**Output**:
- 🟢 GREEN: Direct progress, proceed
- 🟡 YELLOW: Tangential, pause and discuss
- 🔴 RED: Scope creep, stop and realign

**When to Run**:
- Before starting new feature work
- When feeling uncertain about direction
- Proactively every 2-3 hours of work
- When user requests alignment check

**If Yellow/Red**:
1. Stop current work
2. Summarize where you are
3. Ask James for direction
4. Update STATUS.md with decision

**For Deeper Analysis**: Invoke `alignment-checker` agent instead

**Location**: `.claude/commands/check-alignment.md`

---

### health-check

**Purpose**: Verify all system API connections working

**What It Does**: Runs `node scripts/health-check.js` which tests:
- Airtable (GET Forces table)
- n8n (GET workflows)
- HubSpot (GET contacts)
- Claude API (POST messages)

**Output**: ✅/❌ for each service + error details if failed

**When to Run**:
- Start of session (catch credential issues early)
- When MCP tools returning errors
- After changing .env.local credentials

**Troubleshooting**:
| Issue | Check |
|-------|-------|
| Airtable 401 | API key correct? Has base access? |
| Airtable 404 | Base ID correct? Table exists? |
| n8n connection refused | n8n running? URL correct? |
| n8n 401 | API key enabled in n8n settings? |
| HubSpot 401 | Private app has CRM scopes? |
| Claude 401 | API key valid? Has credits? |

**Manual Verification**: See `.claude/commands/health-check.md` for curl commands

**Location**: `.claude/commands/health-check.md`

---

### consistency-check

**Purpose**: Verify document references exist and facts match across docs

**What It Does**: Runs `node scripts/consistency-check.cjs` which:
- Scans all `.md` files for `@filename`, `[text](path)`, backtick paths
- Verifies each referenced file exists
- Checks cross-document facts (phase names, force counts)
- Validates command dependencies (workflow files, scripts)

**Output**:
```
✅ File references: 47 checked, 0 missing
❌ Cross-document facts: 1 mismatch
   - Phase: STATUS.md says "Phase 1", CLAUDE.md says "Phase 2"
✅ Commands: all dependencies exist
```

**When to Run**:
- Weekly maintenance
- Before git commits (optional)
- After restructuring docs
- When references broken suspected

**Exit Code**: 1 on failures (for future CI integration)

**Location**: `.claude/commands/consistency-check.md`
**Script**: `scripts/consistency-check.cjs`

---

### deploy-workflow

**Purpose**: Import or update n8n workflow from project JSON files

**What It Does**: Imports workflow JSON to n8n instance via API

**Usage**:
```bash
/project:deploy-workflow <workflow-name>
```

**Example**:
```bash
/project:deploy-workflow ingest-indeed-jobs
```

**What Happens**:
1. Reads `n8n/workflows/<name>.json`
2. POSTs to n8n API
3. Returns workflow ID
4. Activates workflow if specified

**Prerequisites**:
- Workflow JSON exists in `n8n/workflows/`
- n8n API credentials in `.env.local`
- Workflow validated (use n8n validate tool first)

**Common Issues**:
- Missing `webhookId` property (G-008)
- Invalid node references
- Credential names don't match n8n instance

**Location**: `.claude/commands/deploy-workflow.md`
**Script**: `n8n/scripts/import-workflow.js`

---

### hygiene-check

**Purpose**: Verify document sizes within limits, trigger cleanup if needed

**What It Does**: Manual checklist that verifies:
- STATUS.md <100 lines
- DECISIONS.md <20 active decisions
- No documents exceeding context window limits

**Output**: Warnings + action items if limits exceeded

**When to Run**:
- Weekly Sunday/Monday
- Monthly (1st of month for archive rotation)
- After adding multiple decisions
- When documents feel bloated

**Actions If Warnings**:
- STATUS.md >100: Archive completed sections
- DECISIONS.md >20: Archive Tier 2/3 decisions
- See `docs/DOCUMENT-HYGIENE.md` for archive process

**Location**: `.claude/commands/hygiene-check.md`
**Reference**: `docs/DOCUMENT-HYGIENE.md`

---

### doc-audit

**Purpose**: Comprehensive documentation alignment audit across 5 dimensions

**What It Does**: Spawns 5 specialized subagents to audit:
1. **Reference Integrity** — Validates all @references, markdown links, file paths exist
2. **Single Source of Truth** — Detects duplicated information per DEPENDENCY-MAP.md rules
3. **Roadmap Alignment** — Verifies STATUS.md/specs match ROADMAP.md criteria
4. **Schema Alignment** — Checks schema references match SPEC-001
5. **Guardrail Compliance** — Verifies G-XXX references are valid and complete

**Output**: Creates `docs/AUDIT-REPORT.md` with:
- Executive summary (pass/warn/fail)
- Findings by dimension with severity levels
- Action items table prioritized by severity
- Evidence index with file:line references

**Arguments**:
- `--fix`: Append suggested fix instructions to report

**When to Run**:
- Before major releases
- Weekly maintenance
- After restructuring documentation
- When drift suspected across documents

**Example**:
```bash
/doc-audit           # Full audit, generate report
/doc-audit --fix     # Audit with fix suggestions
```

**Subagents Used**:
- `audit-reference-integrity` (Haiku)
- `audit-single-source-truth` (Haiku)
- `audit-roadmap-alignment` (Sonnet)
- `audit-schema-alignment` (Haiku)
- `audit-guardrail-compliance` (Haiku)

**Location**: `.claude/commands/doc-audit.md`
**Subagents**: `.claude/agents/audit-*.md`

---

## 5. Skills System

### Current State

**Skills Exist**: 1 (`force-matching`)

**Skills Are**: Reusable knowledge bundles with quick reference + supporting data files

**Location**: `.claude/skills/<skill-name>/`

---

### Creating New Skills

**Pattern**:
```
.claude/skills/
  skill-name/
    SKILL.md              ← Quick reference (load this)
    data.json             ← Supporting data
    examples.md           ← Usage examples (optional)
```

**SKILL.md Template**:
```markdown
# [Skill Name] Skill

## Quick Reference
[Tables/matrices with key info]

## Common Operations
[Code examples]

## For Full Details
[Link to supporting files]
```

**Registration**:
1. Create skill folder
2. Add to CLAUDE.md "Load On-Demand" table
3. Document in this file (Section 5)

**Skill Ideas**:
- `guardrails` — Quick guardrail reference (G-001 to G-011)
- `uk-police-forces` — Force matching patterns
- `n8n-node-types` — Node quick reference
- `competitor-intel` — Competitor signatures

---

## 6. MCP Integrations

### Overview

**5 MCP servers** with **53+ tools** available:

| MCP | Tools | Primary Use |
|-----|-------|-------------|
| **Airtable** | 12 | Database CRUD, schema management |
| **n8n** | 16 + docs | Workflow automation, validation, testing |
| **HubSpot** | 6 | CRM objects, search, associations |
| **Playwright** | 17 | Browser automation, scraping |
| **Context7** | 2 | Library documentation lookup |

**All MCP tools** prefixed with `mcp__<server>__<tool-name>`

---

### Airtable MCP (12 tools)

**Purpose**: Interact with Airtable base without direct API calls

**Base ID**: `appU3ktqJHk3eUmOS` (UK Policing - Market Intelligence)

#### Core CRUD Operations

**list_records** — Paginated list of records
```javascript
mcp__airtable__list_records({
  baseId: "appU3ktqJHk3eUmOS",
  tableId: "tblcrBDFKtCQQtI0J",  // Organisations
  maxRecords: 100,
  filterByFormula: "{Status}='Active'",
  sort: [{ field: "Name", direction: "asc" }]
})
```

**search_records** — Text search across fields
```javascript
mcp__airtable__search_records({
  baseId: "appU3ktqJHk3eUmOS",
  tableId: "tblcrBDFKtCQQtI0J",
  searchTerm: "Hampshire",
  fieldIds: ["fldName", "fldRegion"]  // Optional: specific fields
})
```

**get_record** — Single record by ID
```javascript
mcp__airtable__get_record({
  baseId: "appU3ktqJHk3eUmOS",
  tableId: "tblcrBDFKtCQQtI0J",
  recordId: "recXXXXXXXXXXXXX"
})
```

**create_record** — Create new record
```javascript
mcp__airtable__create_record({
  baseId: "appU3ktqJHk3eUmOS",
  tableId: "tbll7SO0KTzlR2rPu",  // Indeed Intel (Clean)
  fields: {
    "source": "indeed",
    "title": "Disclosure Officer",
    "force": ["recForceID"],  // Linked record (array)
    "detected_at": "2026-01-16T10:00:00Z"
  }
})
```

**update_records** — Batch update (max 10)
```javascript
mcp__airtable__update_records({
  baseId: "appU3ktqJHk3eUmOS",
  tableId: "tbll7SO0KTzlR2rPu",
  records: [
    { id: "rec1", fields: { "status": "Reviewed" } },
    { id: "rec2", fields: { "status": "Reviewed" } }
  ]
})
```

**delete_records** — Batch delete
```javascript
mcp__airtable__delete_records({
  baseId: "appU3ktqJHk3eUmOS",
  tableId: "tblWBPgFjASpJczz8",  // Raw Archive (cleanup)
  recordIds: ["rec1", "rec2"]
})
```

#### Schema Operations

**list_bases** — List accessible bases
**list_tables** — List tables in base (use `detailLevel` parameter)
**describe_table** — Get table schema
**create_table** — Create new table
**create_field** — Add field to table
**update_field** — Modify field properties

#### Common Gotchas

❌ **Rate Limit**: 5 requests/second (add 200ms delays in loops)
❌ **Batch Limit**: Max 10 records per create/update/delete
❌ **Linked Records**: Must be arrays: `["recID"]` not `"recID"`
❌ **FilterByFormula**: Use Airtable formula syntax, not SQL
❌ **TypeCast**: Add `typecast: true` for flexible value handling

#### Reference

**Patterns**: `.claude/rules/airtable.md`

---

### n8n MCP (16 tools + documentation)

**Purpose**: Build, validate, test, and deploy n8n workflows programmatically

#### Workflow CRUD

**n8n_list_workflows** — List all workflows
```javascript
mcp__n8n-mcp__n8n_list_workflows({
  limit: 100,
  active: true  // Optional filter
})
```

**n8n_get_workflow** — Get workflow by ID
```javascript
mcp__n8n-mcp__n8n_get_workflow({
  id: "123",
  mode: "full"  // full | details | structure | minimal
})
```

**n8n_create_workflow** — Create new workflow
```javascript
mcp__n8n-mcp__n8n_create_workflow({
  name: "MI: Jobs Research Agent",
  nodes: [ /* node definitions */ ],
  connections: { /* connections */ },
  settings: { /* optional */ }
})
```

**n8n_update_full_workflow** — Replace entire workflow
**n8n_update_partial_workflow** — Incremental updates (PREFERRED)
```javascript
mcp__n8n-mcp__n8n_update_partial_workflow({
  id: "123",
  operations: [
    { type: "addNode", node: { /* ... */ } },
    { type: "updateNode", nodeId: "abc", updates: { /* ... */ } },
    { type: "addConnection", from: "node1", to: "node2" }
  ]
})
```

**n8n_delete_workflow** — Permanently delete

#### Validation & Testing

**n8n_validate_workflow** — Check structure, connections, expressions
```javascript
mcp__n8n-mcp__n8n_validate_workflow({
  id: "123",
  options: {
    validateNodes: true,
    validateConnections: true,
    validateExpressions: true
  }
})
```

**n8n_autofix_workflow** — Auto-fix common issues
```javascript
mcp__n8n-mcp__n8n_autofix_workflow({
  id: "123",
  applyFixes: true,  // false = preview mode
  fixTypes: ["expression-format", "typeversion-correction"]
})
```

**n8n_test_workflow** — Execute workflow
```javascript
mcp__n8n-mcp__n8n_test_workflow({
  workflowId: "123",
  triggerType: "webhook",  // webhook | form | chat
  data: { /* payload */ },
  waitForResponse: true
})
```

**n8n_executions** — Manage execution history
```javascript
mcp__n8n-mcp__n8n_executions({
  action: "list",  // list | get | delete
  workflowId: "123",
  status: "error"  // Optional filter
})
```

#### Discovery

**search_nodes** — Find n8n node types
```javascript
mcp__n8n-mcp__search_nodes({
  query: "airtable",
  includeExamples: true  // Include template configs
})
```

**get_node** — Node documentation
```javascript
mcp__n8n-mcp__get_node({
  nodeType: "nodes-base.httpRequest",
  detail: "standard",  // minimal | standard | full
  mode: "info"  // info | docs | search_properties
})
```

**search_templates** — Find workflow templates
```javascript
mcp__n8n-mcp__search_templates({
  searchMode: "keyword",  // keyword | by_nodes | by_task
  query: "airtable automation"
})
```

#### Version Control

**n8n_workflow_versions** — Manage workflow history
```javascript
mcp__n8n-mcp__n8n_workflow_versions({
  mode: "list",  // list | get | rollback | delete | prune
  workflowId: "123"
})
```

#### Health

**n8n_health_check** — Verify n8n connectivity
**tools_documentation** — Get n8n MCP tool docs

#### Common Gotchas

❌ **Missing webhookId**: Webhook nodes MUST have `webhookId` property (G-008)
❌ **Typeversion**: Always use latest typeVersion for nodes
❌ **Credentials**: Reference by name, don't embed in JSON
❌ **Validate First**: Always validate before deploy

#### Reference

**Patterns**: `.claude/rules/n8n.md`
**Agent**: Use `workflow-builder` for complex workflows

---

### HubSpot MCP (6 core tools)

**Purpose**: Read HubSpot CRM data (write operations coming later)

**Status**: ⚠️ Needs permission update (non-blocking for Phase 1)

#### User Context

**hubspot-get-user-details** — MUST call first
```javascript
mcp__hubspot__hubspot-get-user-details()
```

Returns: User ID, Hub ID, permissions, owner ID (for filtering)

#### Objects

**hubspot-list-objects** — Paginated list
```javascript
mcp__hubspot__hubspot-list-objects({
  objectType: "contacts",  // companies, deals, tickets, etc.
  limit: 100,
  properties: ["firstname", "lastname", "email"]
})
```

**hubspot-search-objects** — Advanced search
```javascript
mcp__hubspot__hubspot-search-objects({
  objectType: "companies",
  query: "Hampshire Police",  // Text search
  filterGroups: [  // Complex filters
    {
      filters: [
        { propertyName: "industry", operator: "EQ", value: "Public Safety" }
      ]
    }
  ]
})
```

**hubspot-batch-read-objects** — Get multiple by ID
```javascript
mcp__hubspot__hubspot-batch-read-objects({
  objectType: "contacts",
  inputs: [{ id: "123" }, { id: "456" }]
})
```

#### Associations

**hubspot-get-association-definitions** — Valid relationship types
**hubspot-list-associations** — Get related objects
```javascript
mcp__hubspot__hubspot-list-associations({
  objectType: "contacts",
  objectId: "123",
  toObjectType: "companies"
})
```

#### Reference

**Note**: More HubSpot tools exist but require permission updates

---

### Playwright MCP (17 browser tools)

**Purpose**: Automate browser interactions for scraping JavaScript-heavy sites

#### Navigation

**browser_navigate** — Go to URL
```javascript
mcp__playwright__browser_navigate({
  url: "https://example.com"
})
```

**browser_navigate_back** — Go back
**browser_tabs** — List/create/close/select tabs

#### Interaction

**browser_click** — Click element
```javascript
mcp__playwright__browser_click({
  element: "Search button",
  ref: "ref_from_snapshot"  // From browser_snapshot
})
```

**browser_type** — Type text
**browser_fill_form** — Fill multiple fields
**browser_press_key** — Keyboard input
**browser_hover** — Hover over element
**browser_drag** — Drag and drop
**browser_select_option** — Select dropdown

#### Inspection

**browser_snapshot** — Accessibility tree (BETTER than screenshot)
```javascript
mcp__playwright__browser_snapshot()
```

Returns: Text representation of page for AI to "see"

**browser_take_screenshot** — Visual screenshot
**browser_console_messages** — Console logs
**browser_network_requests** — Network activity
**browser_evaluate** — Run JavaScript

#### Utility

**browser_wait_for** — Wait for text/time
**browser_handle_dialog** — Handle alerts/confirms
**browser_file_upload** — Upload files
**browser_close** — Close browser
**browser_resize** — Change window size
**browser_install** — Install browser binaries

#### When to Use Playwright

✅ **Use When**:
- Site requires JavaScript to render content
- Need to interact with forms/buttons
- Checking visual state
- Testing workflows

❌ **Don't Use When**:
- Simple static HTML (use WebFetch)
- APIs available (use HTTP directly)
- Content in feeds/sitemaps

#### Reference

**Note**: Bright Data preferred for Indeed scraping (G-003)

---

### Context7 MCP (2 tools)

**Purpose**: Get up-to-date library documentation

#### Tools

**resolve-library-id** — Find library ID
```javascript
mcp__context7__resolve-library-id({
  libraryName: "react",
  query: "User's question about React hooks"
})
```

Returns: Context7-compatible library ID (e.g., `/facebook/react`)

**query-docs** — Get documentation
```javascript
mcp__context7__query-docs({
  libraryId: "/facebook/react",
  query: "How to use useEffect cleanup function"
})
```

Returns: Relevant docs and code examples

#### When to Use

✅ **Better than WebSearch for**:
- Current API documentation
- Code examples for libraries
- Best practices for frameworks

❌ **Don't Use for**:
- General questions
- News/articles
- Project-specific code

#### Gotchas

- Must call `resolve-library-id` first (unless user provides ID)
- Max 3 calls per question (cost/latency)

---

## 7. Built-in Tools

### Permission Model

Claude Code uses **allowlist-based permissions** with specific denials.

#### Allowed ✅

**Bash Commands**:
- `node *` — Run Node.js scripts
- `npm *` — Package management
- `python3 *` — Python scripts
- `git status`, `git diff`, `git log *` — Read-only git
- `git add *`, `git commit *`, `git push *` — Git write operations
- `cat *`, `ls *`, `head *`, `tail *`, `wc *` — File reading
- `grep *`, `find *` — Searching
- `curl *` — HTTP requests
- `chmod *` — Permissions (local settings)
- `tree *` — Directory visualization
- `git init *`, `git remote *` — Git setup

**File Operations**:
- `Read` — Read any file (absolute paths)
- `Write` — Create new files
- `Edit` — Modify existing files (exact string replacement)

**Search**:
- `Glob` — Pattern-based file finding (`**/*.js`)
- `Grep` — Content search with regex

**Web**:
- `WebSearch` — Google search (US only)
- `WebFetch` — Fetch URL content

**Other**:
- `TodoWrite` — Task tracking
- `Task` — Invoke sub-agents
- `AskUserQuestion` — Multiple choice questions
- `EnterPlanMode` / `ExitPlanMode` — Planning workflow

#### Denied ❌

**Bash Commands**:
- `rm -rf *` — Destructive deletion
- `sudo *` — Elevated privileges

**File Operations**:
- `Write(ANCHOR.md)` — Mission file is immutable
- `Edit(ANCHOR.md)` — Mission file is immutable

### Best Practices

**Use Specialized Tools Over Bash**:
```javascript
// Good
Read("/path/to/file.txt")

// Bad - works but suboptimal
Bash("cat /path/to/file.txt")
```

**Reasons**:
- Specialized tools handle errors better
- Better user experience (no terminal output shown)
- More efficient (no shell overhead)

**Reserve Bash For**:
- Actual system commands (git, node, npm)
- Piped operations
- Operations requiring shell features

**Never Use Bash For Communication**:
```javascript
// Bad - don't do this
Bash("echo 'I found 3 issues'")

// Good - output directly
"I found 3 issues"
```

### File Operation Patterns

**Reading Files**:
```javascript
// Single file
Read("/path/to/file.js")

// Multiple files in parallel
Read("/path/to/file1.js"),
Read("/path/to/file2.js"),
Read("/path/to/file3.js")
```

**Editing Files** (must read first):
```javascript
// 1. Read file first
Read("/path/to/file.js")

// 2. Edit with exact string match
Edit({
  file_path: "/path/to/file.js",
  old_string: "const x = 1;",  // Must match exactly
  new_string: "const x = 2;"
})
```

**Creating Files**:
```javascript
Write({
  file_path: "/path/to/new-file.js",
  content: "// File content here"
})
```

**Preference**: ALWAYS edit existing files rather than create new ones

---

## 8. Project Configuration

### .claude/settings.json

**Purpose**: Core Claude Code configuration

**Location**: `.claude/settings.json`

#### Sections

**permissions**: Allowlist + denylist for tools and bash commands

**hooks**: Lifecycle automation (SessionStart, PreCompact, Stop)

**defaultModel**: Model to use (sonnet, opus, haiku)

**context.autoLoad**: Files injected at session start

#### Hooks System

```
SessionStart (command hook)
  ↓ Executes: .claude/hooks/session-start.sh
  ↓ Shows: Phase, goals, blockers, doc health, git status
  ↓ Purpose: Auto-inject context, prevent cold starts

PreCompact (command hook)
  ↓ Executes: .claude/hooks/pre-compact.sh
  ↓ Checks: STATUS.md last updated >30 min?
  ↓ Purpose: Prevent info loss during context compression

Stop (prompt hook)
  ↓ Shows: Checklist prompt
  ↓ Questions: STATUS updated? Next action clear? Any drift?
  ↓ Purpose: Force alignment check before exit
```

**Hook Files**:
- `.claude/hooks/session-start.sh`
- `.claude/hooks/pre-compact.sh`

#### Auto-Load Files

**3 files** injected at every session start:
1. `ANCHOR.md` — Immutable mission
2. `CLAUDE.md` — Session instructions
3. `STATUS.md` — Current state

**Why**: Ensures Claude Code always knows mission and current goals

#### Default Model

**Default**: `sonnet` (Claude 3.5 Sonnet)

**Can Override**: Use `model` parameter in Task tool calls
```javascript
Task(
  subagent_type="alignment-checker",
  model="haiku"  // Override to Haiku for speed
)
```

---

### .claude/settings.local.json

**Purpose**: Machine-specific overrides (credentials, extended permissions)

**Location**: `.claude/settings.local.json`

**Not Tracked**: In git (credentials stay local)

**Contains**:
- MCP tool permissions (85+ tools)
- Additional bash permissions (chmod, tree, git init)
- WebSearch permission

**Why Separate**: Core settings shared across machines, local settings stay private

#### Extension Pattern

**To add MCP permissions**:
1. Edit `.claude/settings.local.json`
2. Add to `permissions.allow` array
3. Format: `"mcp__<server>__<tool-name>"`
4. Don't commit (keep local)

---

### Agent Configuration

**Location**: `.claude/agents/<name>.md`

**Format**: YAML frontmatter + markdown instructions

**Example Structure**:
```yaml
---
name: agent-name
description: When to use this agent
tools:
  - Read
  - Write
model: sonnet
permissionMode: default  # default | plan
---

[Markdown instructions for agent]
```

**Registration**: Agents auto-discovered, no manual registration needed

---

### Command Configuration

**Location**: `.claude/commands/<name>.md`

**Format**: YAML frontmatter + markdown instructions

**Invocation**: `/project:<name>` (e.g., `/project:health-check`)

**Structure**:
```yaml
---
name: command-name
description: What this command does
---

# Command Name

[Instructions for execution]
```

---

## 9. Common Patterns & Best Practices

### Pattern A: Research Phase

**Goal**: Understand codebase/feature before building

**Steps**:
1. **Use Explore agent** (NOT manual Glob/Grep) for open-ended questions
   ```javascript
   Task(
     subagent_type="Explore",
     prompt="How does signal classification work in this project?",
     model="haiku"  // Fast for exploration
   )
   ```

2. **Use Grep** for needle-in-haystack (specific class/function)
   ```javascript
   Grep({
     pattern: "class SignalClassifier",
     output_mode: "files_with_matches"
   })
   ```

3. **Read critical files** identified by exploration
   ```javascript
   Read("src/classification/signal-classifier.js")
   ```

4. **Use AskUserQuestion** for clarifications
   ```javascript
   AskUserQuestion({
     questions: [{
       question: "Which classification approach do you prefer?",
       header: "Approach",
       options: [
         { label: "Rule-based", description: "Fast, deterministic" },
         { label: "AI-based", description: "Flexible, learns" }
       ]
     }]
   })
   ```

5. **Document findings** (don't rely on memory)
   - Write to plan file if in plan mode
   - Update STATUS.md if relevant
   - Log decision if architectural

**Anti-Pattern**: Don't manually Glob/Grep for exploration — use Explore agent

---

### Pattern B: Building Phase

**Goal**: Implement feature with confidence

**Steps**:
1. **Check alignment first**
   ```javascript
   // Option 1: Quick self-check
   /project:check-alignment

   // Option 2: Thorough audit
   Task(
     subagent_type="alignment-checker",
     prompt="Audit: Building X feature for Y reason"
   )
   ```

2. **Load relevant rules**
   ```
   @.claude/rules/airtable.md  // If using Airtable
   @.claude/rules/n8n.md       // If building workflow
   @docs/GUARDRAILS.md         // Always check guardrails
   ```

3. **Invoke specialist agent** if domain-specific
   ```javascript
   Task(
     subagent_type="workflow-builder",
     prompt="Create n8n workflow for X"
   )
   ```

4. **Build incrementally** (test as you go)
   - Write small piece
   - Test immediately
   - Verify output
   - Continue

5. **Update STATUS.md continuously**
   - Mark todos in_progress
   - Mark todos completed
   - Add blockers if stuck

6. **Validate against GUARDRAILS.md**
   - Check relevant G-00X rules
   - Verify not violating patterns

**Anti-Pattern**: Don't build entire feature then test — test incrementally

---

### Pattern C: Debugging Phase

**Goal**: Diagnose and fix issue systematically

**Steps**:
1. **Check system health**
   ```bash
   /project:health-check
   ```

2. **Check document consistency** (if doc-related)
   ```bash
   /project:consistency-check
   ```

3. **Review recent changes**
   ```bash
   git log --oneline -10
   git diff HEAD~3  # Last 3 commits
   ```

4. **Use MCP tools to inspect live state**
   ```javascript
   // Check Airtable records
   mcp__airtable__list_records({
     tableId: "tblXXX",
     filterByFormula: "{Status}='Error'"
   })

   // Check n8n executions
   mcp__n8n-mcp__n8n_executions({
     action: "list",
     workflowId: "123",
     status: "error"
   })
   ```

5. **Cross-reference GUARDRAILS.md**
   - Is G-001 violated? (scraper filtering during collection)
   - Is G-008 violated? (missing webhookId)
   - Is G-009 violated? (no date filter)

6. **Use Grep to find related code**
   ```javascript
   Grep({
     pattern: "function_name",
     output_mode: "content"
   })
   ```

**Anti-Pattern**: Don't guess randomly — follow systematic debugging

---

### Pattern D: Session Wrap-up

**Goal**: Capture state before exiting

**Steps**:
1. **Update STATUS.md**
   - Move completed items to "Done This Session"
   - Update "In Progress"
   - Note blockers
   - Define clear next action

2. **Run hygiene check** if modified docs
   ```bash
   /project:hygiene-check
   ```

3. **Commit changes**
   ```bash
   git add .
   git commit -m "[scope] message"
   ```
   See `docs/GIT-WORKFLOW.md` for commit conventions

4. **Push to GitHub**
   ```bash
   git push
   ```

5. **Stop hook will verify**
   - Prompts: STATUS updated? Next action clear? Any drift?
   - Address gaps before exiting

**Anti-Pattern**: Don't exit without updating STATUS.md — you'll forget context

---

## 10. Limitations & Gotchas

### Cannot Do

❌ **Direct Database Queries**: Must use Airtable MCP tools, no raw SQL

❌ **Browse Complex Web Without Playwright**: WebFetch limited to simple static pages

❌ **Send Emails Directly**: Write to Airtable Email_Actions command queue (G-002)

❌ **Modify ANCHOR.md**: Permission denied — mission is immutable

❌ **Access Claude Chat Project Knowledge**: Files uploaded to Claude desktop app not in repo

❌ **Run Interactive Commands**: No support for `git rebase -i`, `git add -i`, etc.

❌ **Access Production Secrets**: `.env.local` not tracked, each machine has own credentials

### Easy to Forget

⚠️ **Batch Limits**: Airtable max 10 records per create/update/delete

⚠️ **Rate Limits**: Airtable 5 req/sec — add delays in loops

⚠️ **Hooks Don't Run in Sub-Agents**: Agents don't get SessionStart, PreCompact, Stop

⚠️ **Credentials Not in Git**: `.env.local` stays local, don't commit

⚠️ **webhookId Required**: n8n webhook nodes MUST have webhookId property (G-008)

⚠️ **Model Selection**: Use Haiku for simple agents (alignment-checker), Sonnet for complex

⚠️ **Read Before Edit**: Must Read file before using Edit tool

⚠️ **Linked Records Are Arrays**: Airtable: `["recID"]` not `"recID"`

⚠️ **Date Filters Critical**: Without "last 24h" filter, scraper returns entire pool (G-009)

⚠️ **Upsert Over Delete Loops**: Never use find→delete→create pattern (G-011)

### Performance Tips

⚡ **Parallel Agent Invocation**: Multiple Task calls in single message

⚡ **Batch Airtable Operations**: 10 records per request faster than 10 requests

⚡ **Cache Reference Data**: Don't re-read `forces.json` 50 times

⚡ **Use /compact**: Clear context when it gets large (PreCompact hook protects you)

⚡ **Haiku for Simple Tasks**: alignment-checker uses Haiku (fast, cheap)

⚡ **Grep Before Read**: Find files first, read only relevant ones

⚡ **filterByFormula Over Client-Side**: Filter at API level, not after fetching all

### Common Mistake Patterns

**Mistake**: Building entire feature without alignment check
**Fix**: Run `/project:check-alignment` before starting

**Mistake**: Manual Glob/Grep for codebase exploration
**Fix**: Use Explore agent for open-ended questions

**Mistake**: Forgetting to update STATUS.md during work
**Fix**: Mark todos in_progress/completed as you go

**Mistake**: Creating new file when Edit would work
**Fix**: Prefer Edit over Write for existing files

**Mistake**: Using bash for file operations
**Fix**: Use Read/Write/Edit tools instead

**Mistake**: Violating guardrails unknowingly
**Fix**: Check `docs/GUARDRAILS.md` before building

**Mistake**: Exiting without git commit
**Fix**: Stop hook reminds you to commit

---

## 11. Cross-Reference Directory

### Architecture & Rules

| Topic | Document |
|-------|----------|
| Architectural rules (G-001 to G-011) | [docs/GUARDRAILS.md](GUARDRAILS.md) |
| Full architecture diagram | [docs/architecture.md](architecture.md) |
| Mission definition (immutable) | [ANCHOR.md](../ANCHOR.md) |

### API & Integration Patterns

| Topic | Document |
|-------|----------|
| Airtable API patterns | [.claude/rules/airtable.md](../.claude/rules/airtable.md) |
| n8n workflow patterns | [.claude/rules/n8n.md](../.claude/rules/n8n.md) |

### Process & Workflows

| Topic | Document |
|-------|----------|
| Git commit conventions | [docs/GIT-WORKFLOW.md](GIT-WORKFLOW.md) |
| Document maintenance | [docs/DOCUMENT-HYGIENE.md](DOCUMENT-HYGIENE.md) |
| Chat↔Code handoffs | [docs/SYNC-PROTOCOL.md](SYNC-PROTOCOL.md) |
| Dependency tracking | [docs/DEPENDENCY-MAP.md](DEPENDENCY-MAP.md) |

### Project State

| Topic | Document |
|-------|----------|
| Current work & session state | [STATUS.md](../STATUS.md) |
| Phase roadmap & acceptance criteria | [ROADMAP.md](../ROADMAP.md) |
| Active decisions | [DECISIONS.md](../DECISIONS.md) |
| Session instructions | [CLAUDE.md](../CLAUDE.md) |

### Reference Data

| Topic | Location |
|-------|----------|
| UK police forces (48) | [reference-data/uk-police-forces.json](../reference-data/uk-police-forces.json) |
| Competitors (7) | [reference-data/competitors.json](../reference-data/competitors.json) |
| Capability areas (14) | [reference-data/capability-areas.json](../reference-data/capability-areas.json) |

### Reusable Patterns

| Topic | Location |
|-------|----------|
| Force name fuzzy matching | [patterns/force-matching.js](../patterns/force-matching.js) |
| Indeed search keywords | [patterns/indeed-keywords.json](../patterns/indeed-keywords.json) |
| Job portal URL filters | [patterns/job-portal-filters.js](../patterns/job-portal-filters.js) |

### AI Prompts

| Topic | Location |
|-------|----------|
| Job signal classification | [prompts/job-classification.md](../prompts/job-classification.md) |
| Email triage & drafting | [prompts/email-triage.md](../prompts/email-triage.md) |

---

## 12. Extension Guide

### Adding a New Agent

**Purpose**: Create specialized agent for specific domain or task type

**Steps**:

1. **Create agent file**: `.claude/agents/agent-name.md`

2. **Define structure**:
```yaml
---
name: agent-name
description: When to use this agent (shown in Task tool)
tools:
  - Read
  - Write
  - Grep
model: sonnet  # or haiku
permissionMode: default  # or plan (read-only)
---

# Agent Instructions

[Markdown instructions describing agent's role, knowledge, output format]
```

3. **Document in this file**: Add to Section 3 (Sub-Agents)

4. **Test invocation**:
```javascript
Task(
  subagent_type="agent-name",
  prompt="Test task"
)
```

5. **Update CLAUDE.md** if agent should be mentioned in quick reference

**Example Agent Ideas**:
- `api-designer` — Design REST APIs with best practices
- `test-writer` — Generate tests for code
- `doc-writer` — Create documentation from code

---

### Adding a New Command

**Purpose**: Create reusable operation accessible via `/project:command-name`

**Steps**:

1. **Create command file**: `.claude/commands/command-name.md`

2. **Define structure**:
```yaml
---
name: command-name
description: What this command does
---

# Command Name

## Purpose
[What it does]

## Usage
```bash
/project:command-name [args]
```

## What It Does
[Step-by-step]

## When to Run
[Triggering scenarios]

## Output
[What to expect]

## Troubleshooting
[Common issues]
```

3. **Add to CLAUDE.md**: "Quick Commands" table

4. **Document in this file**: Add to Section 4 (Slash Commands)

5. **Test**: `/project:command-name`

**Example Command Ideas**:
- `test-phase` — Run end-to-end test for current phase
- `backup-db` — Create Airtable base backup
- `generate-report` — Create weekly status report

---

### Adding a New Skill

**Purpose**: Package reusable knowledge with supporting data

**Steps**:

1. **Create skill folder**: `.claude/skills/skill-name/`

2. **Create SKILL.md** (quick reference):
```markdown
# [Skill Name] Skill

## Quick Reference
[Tables/matrices with key info]

## Common Operations
[Code examples]

## For Full Details
[Link to supporting files]
```

3. **Add supporting files**:
   - `data.json` — Structured data
   - `examples.md` — Usage examples
   - `schema.json` — Schema if applicable

4. **Reference in CLAUDE.md**: Add to "Load On-Demand" table

5. **Document in this file**: Add to Section 5 (Skills System)

6. **Test loading**: `@.claude/skills/skill-name/SKILL.md`

**Example Skill Ideas**:
- `guardrails` — Quick G-00X reference with examples
- `uk-police-forces` — Force matching patterns
- `competitor-intel` — Competitor signatures and patterns

---

### Adding a New Hook

**Purpose**: Automate actions at specific lifecycle events

**Steps**:

1. **Create hook script**: `.claude/hooks/hook-name.sh`

2. **Write bash script**:
```bash
#!/bin/bash
# [Hook Name] — [Purpose]

# Your automation here
echo "Hook output shown to Claude"
```

3. **Make executable**: `chmod +x .claude/hooks/hook-name.sh`

4. **Add to settings.json**:
```json
{
  "hooks": {
    "HookEvent": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/hook-name.sh"
          }
        ]
      }
    ]
  }
}
```

**Available Hook Events**:
- `SessionStart` — When Claude Code starts
- `PreCompact` — Before context compression
- `Stop` — When Claude Code exits
- `OnEdit` — After file edits
- `PrePush` — Before git push

5. **Document behavior**: Add to Section 8 (Project Configuration) in this file

6. **Test**: Trigger hook event

**Example Hook Ideas**:
- `pre-push` — Run tests before git push
- `on-edit` — Update DEPENDENCY-MAP.md on file changes
- `weekly-cleanup` — Archive old decisions on Sundays

---

### Adding MCP Permissions

**Purpose**: Enable new MCP tool access

**Steps**:

1. **Edit settings.local.json**:
```json
{
  "permissions": {
    "allow": [
      "mcp__server__tool-name",
      "mcp__server__another-tool"
    ]
  }
}
```

2. **Test tool access**:
```javascript
mcp__server__tool-name({ /* params */ })
```

3. **Document tool**: Add to Section 6 (MCP Integrations) in this file

4. **Don't commit**: Keep `.claude/settings.local.json` local

**Note**: Never commit `.env.local` or settings with credentials

---

## Document Maintenance

### Update This Document When

**Capabilities Change**:
- Adding/removing an agent → Update Section 3
- Adding/removing a command → Update Section 4
- Adding/removing a skill → Update Section 5
- New MCP tools available → Update Section 6
- Permission model changes → Update Section 7
- Hook behavior changes → Update Section 8
- New common patterns emerge → Update Section 9
- New limitations discovered → Update Section 10

**Cross-References Change**:
- New document created → Update Section 11
- Document renamed/moved → Update all references
- New extension pattern → Update Section 12

### Update Protocol

1. **Edit this file** (docs/CLAUDE-CODE-CAPABILITIES.md)

2. **Update DEPENDENCY-MAP.md** if cross-references changed

3. **Update CLAUDE.md** if affects "Load On-Demand" table

4. **Commit with message**:
```bash
git add docs/CLAUDE-CODE-CAPABILITIES.md
git commit -m "docs: update Claude Code capabilities — [what changed]"
git push
```

5. **Update "Last Updated" date** at top of this file

---

## Version History

- **v1.0** (2026-01-16): Initial comprehensive reference based on codebase exploration
  - 12 sections covering all capability categories
  - Decision matrices for quick lookup
  - 3 agents, 5 commands, 1 skill, 5 MCPs documented
  - Common patterns and gotchas included
  - 680 lines total
