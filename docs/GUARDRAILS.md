# MI Platform — Guardrails

## Purpose

Non-negotiable architectural rules extracted from lessons learned in MI-Platform-Fresh-Start.
These patterns were validated through failure — violating them caused real problems.

**Before building any workflow, verify your approach against these guardrails.**

---

## Quick Reference

| ID | Rule | TL;DR |
|----|------|-------|
| G-001 | Dumb Scrapers + Smart Agents | Scrape first, classify later |
| G-002 | Command Queue for Email Actions | Never send directly |
| G-003 | Bright Data Over Firecrawl | Residential proxies required |
| G-004 | Self-Hosted n8n | No cloud execution limits |
| G-005 | Fuzzy JS Matching Before AI | Pattern match first, AI fallback |
| G-006 | Never Direct Outlook Integration | Sync to Airtable, then process |
| G-007 | No CLI Agents (Use n8n) | Visual debugging > SSH debugging |
| G-008 | Always Include webhookId | Required for n8n route registration |
| G-009 | Strict Date Filtering | 24h window prevents duplicates |
| G-010 | Filter Job Portal False Positives | URL check before AI |
| G-011 | Upsert Only (No Loop Delete) | Prevent accidental data loss |

---

## G-001: Dumb Scrapers + Smart Agents

**Rule**: Scrapers dump 100% raw data to `*_Raw_Archive` tables. AI processes asynchronously to clean tables.

**Why**: Initial scrapers filtered during collection → data loss when filters too aggressive → debugging impossible without raw data.

**Violation Sign**: Scraper code contains `if` statements filtering results before storage.

**Pattern**:
```
[Scraper] → Raw_Archive table → [AI Agent] → Clean/Operational table
```

**Applied To**: Jobs, Competitor Jobs, Emails, News, Procurement, Regulatory signals.

---

## G-002: Command Queue for Email Actions

**Rule**: AI writes commands (Draft, Reply, Forward, Move) to `Email_Actions` table. Separate executor workflows perform Outlook operations.

**Why**: Direct AI → Outlook = no review opportunity, scattered actions, difficult debugging.

**Violation Sign**: AI workflow contains Outlook API call nodes directly.

**Pattern**:
```
[AI Classification] → Email_Actions table → [Executor Workflow] → Outlook
```

**Fields Required**: `Action`, `Email_ID`, `Draft_Content`, `Status`, `Executed_At`

---

## G-003: Bright Data Over Firecrawl

**Rule**: Use Bright Data with residential proxies for all web scraping.

**Why**: Firecrawl blocked by Indeed and UK Police sites (403/404, <20% success). Bright Data residential IPs bypass Cloudflare (>95% success).

**Violation Sign**: Using Firecrawl, Crawlee with datacenter proxies, or direct HTTP requests.

**Active Dataset**: `gd_l4dx9j9sscpvs7no2` (Indeed, 30 keywords)

---

## G-004: Self-Hosted n8n

**Rule**: Run n8n on VPS, not cloud.

**Why**: Cloud hit execution limits, couldn't install CLI tools, no co-located scripts.

**Violation Sign**: Workflows deployed to n8n.cloud or hitting execution quotas.

**Benefits**: No limits, full control, CLI tools on same VPS, fixed cost.

---

## G-005: Fuzzy JS Matching Before AI

**Rule**: Run hardcoded JavaScript pattern matching BEFORE falling back to AI for force identification.

**Why**: AI = 200ms + $0.002 per call. JS = <1ms + free. Pattern covers ~85% of cases.

**Violation Sign**: Every job immediately sent to AI for force identification.

**Pattern**:
```javascript
// patterns/force-matching.js
const match = lookupForce(company_name);
if (match) {
  // Use match, skip AI
} else {
  // Fall back to AI
}
```

**Reference**: `patterns/force-matching.js` (47 patterns)

---

## G-006: Never Direct Outlook Integration

**Rule**: Sync emails to Airtable first, process Airtable records, write actions to queue.

**Why**: Direct Outlook manipulation caused race conditions, complex error recovery, state divergence.

**Violation Sign**: AI workflow reads from Outlook AND writes back to Outlook in same workflow.

**Pattern**:
```
[Email Sync] → Email_Raw_Archive → [AI Processing] → Email_Actions → [Executor] → Outlook
```

---

## G-007: No CLI Agents (Use n8n)

**Rule**: Implement agent logic as n8n AI Agent nodes, not Python/Bash CLI scripts.

**Why**: CLI agents failed silently (SSH issues, env drift, no UI). n8n provides visual debugging, built-in retry, credential reuse.

**Violation Sign**: Creating new Python/Bash scripts in `/home/claude-agent/` for scheduled tasks.

**Exception**: One-off scripts for data migration or testing (not production automation).

---

## G-008: Always Include webhookId

**Rule**: Webhook nodes MUST include explicit `webhookId` property.

**Why**: Without `webhookId`, n8n doesn't register the route → 404 errors even though workflow exists.

**Violation Sign**: Webhook returns 404 but workflow JSON exists.

**Required Pattern**:
```json
{
  "parameters": {
    "path": "workflow-name",
    "webhookId": "unique-id-here",
    "responseMode": "onReceived"
  }
}
```

---

## G-009: Strict Date Filtering

**Rule**: Enforce "Last 24 hours" date filter in both Bright Data config AND n8n trigger.

**Why**: Without filter, scraper returns entire active job pool (1000+) → duplicates, quota exhaustion, Airtable bloat.

**Violation Sign**: Same job appears 50+ times in archive table.

**Configuration**:
```json
{
  "discover_by": "keyword",
  "time_filter": "last 24 hours"
}
```

**Timing**: Must run daily at same time to maintain 24h window.

---

## G-010: Filter Job Portal False Positives

**Rule**: Apply URL regex filter BEFORE AI classification for news signals.

**Why**: Google News picked up "Careers" pages as news (80% false positives).

**Violation Sign**: News table full of job listing URLs.

**Pattern**:
```javascript
// patterns/job-portal-filters.js
const JOB_PORTAL_PATTERNS = [/careers/i, /jobs/i, /vacancies/i, ...];
// Check URL before sending to AI
```

**Reference**: `patterns/job-portal-filters.js`

---

## G-011: Upsert Only (No Loop Delete)

**Rule**: Use upsert operations for sync workflows. Never use find → delete → create loops.

**Why**: Documentation Sync workflow accidentally deleted ALL nodes in table when filter didn't apply correctly.

**Violation Sign**: Workflow has "Find Old Records" → "Delete Records" → "Create Records" pattern with loop.

**Safe Pattern**:
```json
{
  "operation": "upsert",
  "matchFields": ["Workflow ID", "Node Name"],
  "updateFields": ["...all properties..."]
}
```

**Trade-off**: Orphaned records accumulate (acceptable vs data loss risk).

---

## When to Reference This Document

- **Before building a new workflow**: Check which guardrails apply
- **When debugging failures**: Violation of these rules is often the cause
- **During code review**: Verify guardrails aren't violated
- **When proposing architecture changes**: Must justify deviation from guardrails

---

## Updating Guardrails

New guardrails should only be added when:
1. A pattern has been validated through actual failure
2. The rule applies broadly (not a one-off edge case)
3. Violation would cause significant damage (data loss, cost, reliability)

Document in format:
- **Rule**: What to do
- **Why**: What happened when we didn't
- **Violation Sign**: How to detect the mistake
