# MI Platform: Monitoring & Agentic Architecture
## Addendum to Main Strategy Document

---

# Part 1: Workflow Monitoring & Reliability

## The Problem

Workflows break silently. You don't notice until you realise you haven't had any leads for a week and discover the Indeed scraper has been failing since Tuesday.

Common failure modes:
- **Scraper breaks** — Website changed structure
- **API rate limits** — Too many requests, temporarily blocked
- **Credential expiry** — API keys, OAuth tokens expire
- **Upstream outages** — Airtable, HubSpot, Claude API down
- **Data anomalies** — Unexpected format causes parsing errors
- **Silent degradation** — Scraper works but returns fewer results

## Workflow Inventory

At full build-out, the system has approximately **22 workflows**:

| Phase | Workflows | Type |
|-------|-----------|------|
| 1 | ingest-indeed-jobs | Scheduled |
| 1 | classify-signal | Triggered |
| 1 | create-update-opportunity | Triggered |
| 1 | enrich-opportunity | Triggered |
| 1 | send-outreach | Webhook |
| 1b | ingest-competitor-jobs | Scheduled |
| 1b | alert-hot-lead | Triggered |
| 2a | ingest-emails | Scheduled |
| 2a | classify-email | Triggered |
| 2a | draft-email-response | Triggered |
| 2a | send-email-response | Webhook |
| 2b | ingest-tenders | Scheduled |
| 2b | classify-tender | Triggered |
| 2b | create-tender-response | Triggered |
| 3 | ingest-awards | Scheduled |
| 3 | process-award-intel | Triggered |
| 4 | ingest-hmicfrs | Scheduled |
| 4 | ingest-reg28 | Scheduled |
| 4 | assess-regulatory-signal | Triggered |
| 5 | ingest-news | Scheduled |
| 5 | classify-news | Triggered |
| — | **monitoring-heartbeat** | Scheduled |
| — | **monitoring-daily-digest** | Scheduled |

That's **22 workflows** — enough that manual monitoring is impractical.

---

## Monitoring Architecture

### New Table: `System_Logs`

| Field | Type | Purpose |
|-------|------|---------|
| `log_id` | Auto Number | Unique identifier |
| `workflow_name` | Single Select | Which workflow |
| `execution_id` | Text | n8n execution ID |
| `event_type` | Single Select | `start`, `success`, `failure`, `warning`, `heartbeat` |
| `timestamp` | DateTime | When it happened |
| `duration_ms` | Number | How long it took |
| `records_processed` | Number | Items handled |
| `records_created` | Number | New records created |
| `error_message` | Long Text | Error details if failed |
| `error_node` | Text | Which node failed |
| `metadata` | Long Text | Additional context (JSON) |

### New Table: `System_Health`

Rolling metrics for degradation detection.

| Field | Type | Purpose |
|-------|------|---------|
| `metric_id` | Auto Number | Unique identifier |
| `workflow_name` | Single Select | Which workflow |
| `date` | Date | Which day |
| `executions` | Number | How many times it ran |
| `successes` | Number | Successful runs |
| `failures` | Number | Failed runs |
| `avg_duration_ms` | Number | Average duration |
| `total_records` | Number | Records processed |
| `anomaly_flag` | Checkbox | Auto-flagged if unusual |

---

## Monitoring Workflows

### Workflow: monitoring-heartbeat

**Trigger**: Schedule — Every 30 minutes

**Purpose**: Detect if scheduled workflows are running as expected.

```
1. Define expected schedules:
   - ingest-indeed-jobs: Every 4 hours
   - ingest-competitor-jobs: Every 4 hours
   - ingest-emails: Every 15 minutes
   - ingest-tenders: Daily
   - ingest-news: Every 6 hours

2. For each scheduled workflow:
   a. Query System_Logs for last successful run
   b. Calculate time since last success
   c. If overdue by >50% of interval:
      - Log warning to System_Logs
      - Send Slack alert

3. Check n8n API for any failed executions in last 30 min:
   - If failures found, send immediate Slack alert

4. Log heartbeat completion to System_Logs
```

**Slack Alert Format**:
```
⚠️ WORKFLOW ALERT

Workflow: ingest-indeed-jobs
Status: OVERDUE
Last Success: 6 hours ago (expected: every 4 hours)

Action: Check n8n dashboard for errors
→ [Open n8n](https://your-n8n-url/executions)
```

### Workflow: monitoring-daily-digest

**Trigger**: Schedule — Daily at 7am

**Purpose**: Summary of system health for peace of mind.

```
1. Query System_Logs for last 24 hours

2. Calculate per-workflow stats:
   - Executions (success/fail)
   - Records processed
   - Average duration

3. Detect anomalies:
   - Significant drop in records (>50% vs 7-day avg)
   - Increased failure rate
   - Unusual duration (>2x normal)

4. Generate daily digest

5. Send to Slack
```

**Daily Digest Format**:
```
📊 MI PLATFORM DAILY DIGEST — Monday 13 Jan

SYSTEM STATUS: ✅ Healthy

INGESTION (Last 24h)
├─ Indeed: 47 jobs scraped (✓ normal)
├─ Competitors: 23 jobs scraped (✓ normal)  
├─ Emails: 34 processed
└─ Tenders: 3 new notices

PROCESSING
├─ Signals classified: 70 (68 relevant)
├─ Opportunities updated: 12
├─ Messages drafted: 8
└─ Outreach sent: 5

FAILURES: None ✅

ANOMALIES: None ✅

→ [Open Dashboard](https://your-dashboard-url)
```

**Anomaly Alert Example**:
```
📊 MI PLATFORM DAILY DIGEST — Monday 13 Jan

SYSTEM STATUS: ⚠️ Attention Needed

...

ANOMALIES DETECTED:
⚠️ Indeed jobs down 73% vs last week (47 → 13)
   Possible cause: Scraper blocked or search terms issue
   Action: Check Bright Data dashboard

⚠️ classify-signal avg duration up 340% (1.2s → 5.3s)
   Possible cause: Claude API slowdown
   Action: Monitor, may resolve automatically
```

---

## Error Handling Pattern

Every workflow should follow this pattern:

```
┌─────────────┐
│   START     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Log Start  │──────────────────────────────┐
│  to System  │                              │
│  Logs       │                              │
└──────┬──────┘                              │
       │                                     │
       ▼                                     │
┌─────────────┐                              │
│             │                              │
│  Main       │◄─── Retry logic here         │
│  Workflow   │     (3 attempts)             │
│  Logic      │                              │
│             │                              │
└──────┬──────┘                              │
       │                                     │
       ├─────── On Success ─────┐            │
       │                        │            │
       ▼                        ▼            │
┌─────────────┐          ┌─────────────┐     │
│  Log        │          │ Log Success │     │
│  Failure    │          │ + Metrics   │     │
└──────┬──────┘          └─────────────┘     │
       │                                     │
       ▼                                     │
┌─────────────┐                              │
│ Slack Alert │                              │
│ (if critical)│                             │
└─────────────┘                              │
```

### n8n Implementation

**Start of every workflow** — Add these nodes:

```
[Start] → [Set Variables] → [Log Start] → [Main Logic...]
              │
              └─ Set: workflow_name, start_time, execution_id
```

**End of every workflow** — Add error handling:

```
[Main Logic] → [Success Path] → [Log Success] → [End]
     │
     └─ On Error → [Log Failure] → [Check Severity] → [Slack Alert?] → [End]
```

**Log Start Node** (HTTP Request to Airtable):
```json
{
  "workflow_name": "{{$node['Set Variables'].json.workflow_name}}",
  "execution_id": "{{$execution.id}}",
  "event_type": "start",
  "timestamp": "{{$now.toISOString()}}",
  "metadata": "{}"
}
```

**Log Success Node**:
```json
{
  "workflow_name": "{{$node['Set Variables'].json.workflow_name}}",
  "execution_id": "{{$execution.id}}",
  "event_type": "success",
  "timestamp": "{{$now.toISOString()}}",
  "duration_ms": "{{Date.now() - $node['Set Variables'].json.start_time}}",
  "records_processed": "{{$node['Main Logic'].json.count}}",
  "records_created": "{{$node['Create Records'].json.created_count}}"
}
```

---

## Degradation Detection

Beyond failures, detect when things are working but degrading.

### Metrics to Track

| Metric | Warning Threshold | Critical Threshold |
|--------|-------------------|-------------------|
| Indeed jobs/day | <20 (vs 50 avg) | <10 |
| Competitor jobs/day | <10 (vs 25 avg) | <5 |
| Classification accuracy | <85% | <70% |
| Avg classification time | >5s (vs 1.5s avg) | >10s |
| HubSpot sync failures | >5% | >20% |
| Email fetch failures | >2/day | >5/day |

### Weekly Degradation Check

Add to `monitoring-daily-digest` or create separate workflow:

```
1. Query System_Health for last 7 days

2. Calculate rolling averages per metric

3. Compare today vs 7-day average

4. Flag anomalies where:
   - Records < 50% of average
   - Duration > 200% of average
   - Failure rate > 10%

5. If anomalies found:
   - Set anomaly_flag = true in System_Health
   - Include in daily digest
   - If critical, send immediate alert
```

---

## Alerting Tiers

Not all failures need immediate attention.

| Tier | Response | Examples |
|------|----------|----------|
| 🔴 Critical | Immediate Slack + Email | Send workflow failed, all ingestion down |
| 🟡 Warning | Daily digest | One scraper failing, degraded performance |
| 🟢 Info | Weekly summary | Minor anomalies, self-resolved issues |

### Slack Alert Configuration

```javascript
// Critical — Immediate
if (error.severity === 'critical') {
  sendSlackMessage({
    channel: '#mi-alerts',
    text: `🔴 CRITICAL: ${workflow_name} failed`,
    blocks: [/* detailed error info */]
  });
}

// Warning — Batched
if (error.severity === 'warning') {
  // Queue for daily digest
  await airtable.create('System_Logs', {
    event_type: 'warning',
    // ...
  });
}
```

---

## Quick Health Check Endpoint

Add a simple HTTP endpoint to check system status:

### Workflow: health-check

**Trigger**: Webhook (GET /health)

**Response**:
```json
{
  "status": "healthy",
  "last_check": "2025-01-13T08:00:00Z",
  "workflows": {
    "ingest-indeed-jobs": {
      "last_success": "2025-01-13T07:45:00Z",
      "status": "ok"
    },
    "ingest-competitor-jobs": {
      "last_success": "2025-01-13T06:30:00Z", 
      "status": "ok"
    }
  },
  "alerts": []
}
```

Use this to:
- Display status indicator in dashboard header
- Set up external uptime monitoring (UptimeRobot, Healthchecks.io)

---

# Part 2: Agentic Architecture

## Why Agents?

Linear workflows are great for predictable, repeatable tasks. But some tasks need **reasoning**:

| Task | Linear Workflow | Agentic Approach |
|------|-----------------|------------------|
| Scrape Indeed | ✅ Perfect fit | Overkill |
| Classify signal | ⚠️ Works but brittle | ✅ Handles edge cases |
| Find contact | ❌ Complex branching | ✅ Dynamic search |
| Draft message | ⚠️ One-shot | ✅ Draft → critique → refine |
| Handle ambiguity | ❌ Fails or guesses | ✅ Reasons through it |

## n8n Agentic Capabilities

n8n now has AI Agent nodes that can:
- **Use tools** — Call other n8n nodes as tools
- **Reason** — Think through problems step-by-step
- **Loop** — Keep working until task complete
- **Decide** — Choose different paths based on context
- **Remember** — Maintain context within a session

### Key Nodes

| Node | Purpose |
|------|---------|
| AI Agent | Core agent that reasons and uses tools |
| Tool Workflow | Expose n8n workflow as a tool |
| Chat Memory | Maintain conversation context |
| Vector Store | Semantic search over documents |

---

## Agentic Components in MI Platform

I recommend converting **4 key processes** to agentic:

### 1. Signal Triage Agent

**Replaces**: classify-signal workflow

**Why Agent**: Classification isn't always clear-cut. "Police Staff Investigator" is obvious. "Project Support Officer - Criminal Justice" is ambiguous. An agent can reason through edge cases.

**Tools Available**:
- `search_force_database` — Look up force by name/alias
- `search_previous_signals` — Find similar past signals
- `get_role_examples` — Retrieve examples of relevant/irrelevant roles
- `request_human_review` — Flag for manual decision if truly uncertain

**Agent Prompt**:
```
You are a Signal Triage Agent for Peel Solutions, a company providing 
managed investigator teams to UK police forces.

Your task: Determine if a job posting signal is relevant to our business.

RELEVANT signals are:
- Civilian investigative roles at UK police forces
- Includes: investigators, disclosure officers, case handlers, analysts
- Does NOT include: sworn officers, IT, admin, leadership

You have access to these tools:
- search_force_database: Look up if an organisation is a police force
- search_previous_signals: Find how we classified similar roles before
- get_role_examples: See examples of relevant and irrelevant roles

PROCESS:
1. Identify the employer — is this a UK police force?
2. Identify the role type — is this investigative/disclosure work?
3. If uncertain, use tools to research
4. If still uncertain after research, flag for human review

OUTPUT (JSON):
{
  "decision": "relevant" | "irrelevant" | "needs_review",
  "confidence": 0-100,
  "force_name": "standardised name or null",
  "role_type": "investigator|disclosure|case_handler|analyst|other",
  "reasoning": "step-by-step explanation",
  "similar_signals": ["IDs of similar past signals if found"]
}
```

**Flow**:
```
New Signal → Signal Triage Agent → 
  ├─ relevant → create-update-opportunity
  ├─ irrelevant → mark and archive
  └─ needs_review → queue for human
```

### 2. Contact Research Agent

**Replaces**: Part of enrich-opportunity workflow

**Why Agent**: Finding the right contact requires dynamic searching across multiple sources with reasoning about who's best.

**Tools Available**:
- `search_hubspot_contacts` — Search our CRM
- `search_hubspot_by_company` — Get all contacts at a company
- `search_linkedin` — Find people on LinkedIn (via Bright Data or manual)
- `search_force_website` — Scrape force staff directory
- `get_contact_preferences` — What roles do we prefer to contact?
- `verify_email` — Check if email is deliverable

**Agent Prompt**:
```
You are a Contact Research Agent for Peel Solutions.

Your task: Find the best person to contact at {{force_name}} about 
staffing for investigative roles.

IDEAL CONTACTS (in order of preference):
1. Head of HR / HR Director
2. Resourcing Manager / Talent Acquisition Lead
3. Head of PVP / Head of Crime / Head of Investigations
4. Workforce Planning Manager
5. Anyone with "resourcing", "recruitment", or "workforce" in title

PROCESS:
1. First, search our HubSpot CRM — we may already know someone
2. If HubSpot has contacts, evaluate if any match ideal profiles
3. If no good HubSpot match, search LinkedIn for the force
4. If LinkedIn finds candidates, try to find their email
5. Verify email if possible
6. Return the best contact found with confidence level

RULES:
- Prefer verified contacts over unverified
- Prefer recent interactions over old
- If multiple good options, choose most senior
- If nothing found, say so — don't guess

OUTPUT (JSON):
{
  "found": true | false,
  "contact": {
    "name": "",
    "role": "",
    "email": "" | null,
    "linkedin_url": "" | null,
    "source": "hubspot|linkedin|website",
    "confidence": "verified|likely|guess"
  },
  "alternatives": [/* other potential contacts */],
  "search_summary": "what you searched and found",
  "recommendation": "why this person is the best choice"
}
```

**Flow**:
```
Opportunity needs contact → Contact Research Agent →
  ├─ found (verified) → proceed to drafting
  ├─ found (likely) → proceed with flag
  └─ not found → queue for manual research
```

### 3. Outreach Drafting Agent

**Replaces**: Message drafting in enrich-opportunity

**Why Agent**: Good outreach requires understanding context and may benefit from self-critique and refinement.

**Tools Available**:
- `get_opportunity_context` — All signals, history, relationship
- `get_previous_outreach` — What we've sent to this force before
- `get_successful_templates` — Messages that got replies
- `critique_draft` — Self-evaluate a draft
- `get_force_intel` — Everything we know about this force

**Agent Prompt**:
```
You are an Outreach Drafting Agent for Peel Solutions.

Your task: Write a compelling, personalised outreach message for 
{{contact_name}} at {{force_name}}.

CONTEXT:
{{opportunity_context}}

APPROACH:
1. Review all context about this opportunity
2. Check what we've sent to this force before (avoid repetition)
3. Look at our successful templates for inspiration
4. Write an initial draft
5. Critique your own draft — is it specific enough? Too salesy?
6. Refine based on critique
7. Output final version

MESSAGE REQUIREMENTS:
- Under 100 words
- Reference specific, current context (not generic)
- Sound human, not templated
- Clear ask (usually: brief conversation)
- Professional but warm
- Sign as "James"

AVOID:
- Mentioning competitors by name
- Being pushy or salesy
- Generic platitudes ("hope this finds you well")
- Repeating previous outreach verbatim

OUTPUT (JSON):
{
  "message": "the final outreach message",
  "subject_line": "if email, suggested subject",
  "channel_recommendation": "email|linkedin",
  "reasoning": "why this angle and approach",
  "self_critique": "what you refined and why"
}
```

**Flow**:
```
Opportunity ready for draft → Outreach Drafting Agent →
  Output: message + subject + reasoning → save to opportunity
```

### 4. Opportunity Qualification Agent

**New capability**: Not in original design

**Why Agent**: With multiple signals, deciding priority requires reasoning, not just formula.

**Tools Available**:
- `get_all_signals` — All signals for this opportunity
- `get_force_history` — Our full history with this force
- `get_market_context` — What's happening in the market
- `get_similar_opportunities` — How did similar opps perform?
- `calculate_base_score` — Run the standard formula

**Agent Prompt**:
```
You are an Opportunity Qualification Agent for Peel Solutions.

Your task: Assess the overall quality and priority of an opportunity.

OPPORTUNITY:
Force: {{force_name}}
Signals: {{signals_summary}}
Relationship: {{relationship_status}}
Base Score: {{calculated_score}}

EVALUATE:
1. Signal Strength
   - How many signals? What types?
   - How recent? How specific to our services?
   
2. Timing
   - Is this urgent (competitor intercept, tender deadline)?
   - Is the need likely still active?
   
3. Fit
   - Does this force typically use external providers?
   - Have we had success with similar forces?
   
4. Relationship
   - Do we have a good contact?
   - What's our history here?
   
5. Competition
   - Are competitors already active?
   - Can we differentiate?

OUTPUT (JSON):
{
  "final_score": 0-100,
  "tier": "hot|high|medium|low",
  "confidence": 0-100,
  "why_now": "2-3 sentence summary for the dashboard",
  "risks": ["potential issues to be aware of"],
  "recommended_action": "immediate|this_week|monitor|deprioritise",
  "reasoning": "full explanation of assessment"
}
```

---

## Agentic Architecture Diagram

```
                              INGESTION (Linear Workflows)
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        │                               │                               │
        ▼                               ▼                               ▼
┌───────────────┐             ┌───────────────┐             ┌───────────────┐
│ Indeed Jobs   │             │ Competitor    │             │ Tenders       │
│ Scraper       │             │ Jobs Scraper  │             │ API Fetch     │
└───────┬───────┘             └───────┬───────┘             └───────┬───────┘
        │                             │                             │
        └─────────────────────────────┼─────────────────────────────┘
                                      │
                                      ▼
                        ┌─────────────────────────┐
                        │   SIGNAL TRIAGE AGENT   │ ◄── Agentic
                        │                         │
                        │   Classifies, reasons   │
                        │   through edge cases    │
                        └────────────┬────────────┘
                                     │
                        ┌────────────┼────────────┐
                        │            │            │
                        ▼            ▼            ▼
                   Relevant    Irrelevant   Needs Review
                        │            │            │
                        │            ▼            ▼
                        │        Archive      Human Queue
                        │
                        ▼
              ┌───────────────────┐
              │ Create/Update     │ ◄── Linear Workflow
              │ Opportunity       │
              └─────────┬─────────┘
                        │
                        ▼
            ┌─────────────────────────┐
            │ CONTACT RESEARCH AGENT  │ ◄── Agentic
            │                         │
            │ Multi-source search     │
            │ with reasoning          │
            └────────────┬────────────┘
                         │
            ┌────────────┼────────────┐
            │            │            │
            ▼            ▼            ▼
         Found      Found (weak)  Not Found
            │            │            │
            │            │            ▼
            │            │      Manual Queue
            │            │
            └────────────┼
                         │
                         ▼
            ┌─────────────────────────┐
            │ OUTREACH DRAFTING AGENT │ ◄── Agentic
            │                         │
            │ Context-aware drafting  │
            │ with self-critique      │
            └────────────┬────────────┘
                         │
                         ▼
            ┌─────────────────────────┐
            │ OPPORTUNITY QUAL AGENT  │ ◄── Agentic
            │                         │
            │ Holistic assessment     │
            │ "Why Now" generation    │
            └────────────┬────────────┘
                         │
                         ▼
              ┌───────────────────┐
              │ Ready for Review  │
              │ (Dashboard Queue) │
              └─────────┬─────────┘
                        │
                        ▼
              ┌───────────────────┐
              │ Human Review      │
              │ (2 min per opp)   │
              └─────────┬─────────┘
                        │
                        ▼
              ┌───────────────────┐
              │ SEND WORKFLOW     │ ◄── Linear Workflow
              │ (Outlook/LinkedIn)│
              └───────────────────┘
```

---

## n8n Agent Implementation

### Basic Agent Node Setup

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Trigger   │────▶│   AI Agent  │────▶│   Output    │
│   (webhook  │     │   Node      │     │   Handler   │
│   or other) │     │             │     │             │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │  Tool 1  │ │  Tool 2  │ │  Tool 3  │
        │ (n8n     │ │ (n8n     │ │ (n8n     │
        │ workflow)│ │ workflow)│ │ workflow)│
        └──────────┘ └──────────┘ └──────────┘
```

### Agent Node Configuration

```json
{
  "agent": {
    "model": "claude-3-5-sonnet",
    "systemMessage": "You are a Signal Triage Agent...",
    "maxIterations": 5,
    "tools": [
      {
        "name": "search_force_database",
        "description": "Search for a police force by name",
        "workflow": "tool-search-forces"
      },
      {
        "name": "search_previous_signals", 
        "description": "Find similar signals we've classified before",
        "workflow": "tool-search-signals"
      }
    ]
  }
}
```

### Tool Workflow Example: search_force_database

```
[Webhook Trigger] 
    │
    │  Input: { "query": "Hampshire Constabulary" }
    │
    ▼
[Airtable Search]
    │
    │  Search Forces table
    │  Filter: name CONTAINS query OR short_name CONTAINS query
    │
    ▼
[Format Response]
    │
    │  Output: { 
    │    "found": true, 
    │    "force": { "name": "Hampshire Constabulary", ... }
    │  }
    │
    ▼
[Respond to Webhook]
```

---

## Hybrid Architecture Benefits

| Aspect | Pure Workflows | Pure Agents | Hybrid (Recommended) |
|--------|---------------|-------------|---------------------|
| Predictability | ✅ High | ❌ Lower | ✅ Where needed |
| Flexibility | ❌ Low | ✅ High | ✅ Where needed |
| Cost | ✅ Low | ❌ Higher | ⚠️ Moderate |
| Debugging | ✅ Easy | ❌ Harder | ⚠️ Mixed |
| Edge cases | ❌ Fails | ✅ Handles | ✅ Handles |
| Speed | ✅ Fast | ⚠️ Slower | ⚠️ Mixed |

### Where to Use Each

**Linear Workflows (Keep as-is)**:
- All ingestion/scraping — predictable, scheduled
- Database operations — CRUD is straightforward
- Sending emails/messages — simple action
- Monitoring — formulaic checks
- Alerting — rule-based

**Agentic (Convert)**:
- Signal classification — reasoning through ambiguity
- Contact research — multi-source with decisions
- Message drafting — context-aware with refinement
- Opportunity qualification — holistic assessment

---

## Implementation Plan for Agentic Components

### Phase 1 (Weeks 1-4): Start Simple
- Build linear workflows as originally planned
- Get the system working end-to-end
- Collect data on where classification fails

### Phase 1.5 (Week 5): First Agent
- Convert classify-signal to Signal Triage Agent
- Build tool workflows
- Compare accuracy vs linear version
- Keep linear as fallback

### Phase 2 (Weeks 6-8): Expand Agents
- Add Contact Research Agent
- Add Outreach Drafting Agent
- Monitor quality and cost

### Phase 3 (Week 9+): Optimise
- Add Opportunity Qualification Agent
- Tune prompts based on results
- Optimise for cost/speed
- Build agent monitoring

---

## Agent Monitoring Additions

Add to System_Logs table:

| Field | Type | Purpose |
|-------|------|---------|
| `agent_name` | Text | Which agent |
| `iterations` | Number | How many tool calls |
| `tools_used` | Text | Which tools invoked |
| `tokens_used` | Number | API token consumption |
| `final_decision` | Text | What agent decided |

Track:
- **Agent accuracy** — Spot-check decisions weekly
- **Tool usage patterns** — Which tools most useful
- **Iteration counts** — Agents looping too much?
- **Cost per decision** — Are agents cost-effective?

---

## Cost Implications

| Component | Linear Cost | Agentic Cost | Notes |
|-----------|-------------|--------------|-------|
| Signal Classification | £0.001/signal | £0.005-0.02/signal | Multiple tool calls |
| Contact Research | £0.01/opp | £0.02-0.05/opp | More thorough |
| Message Drafting | £0.01/opp | £0.02-0.03/opp | Self-critique loop |
| Qualification | £0 (formula) | £0.01-0.02/opp | New capability |

**Estimated Monthly Impact**:
- Linear: ~£5/month
- Hybrid with agents: ~£15-25/month

Still very reasonable for the quality improvement.

---

## Summary

### Monitoring Recommendations

1. **Add System_Logs and System_Health tables** to track everything
2. **Build monitoring-heartbeat workflow** — runs every 30 mins
3. **Build monitoring-daily-digest workflow** — morning summary
4. **Implement standard error handling pattern** in all workflows
5. **Set up Slack alerts** with severity tiers
6. **Add health check endpoint** for external monitoring

### Agentic Recommendations

1. **Start with linear workflows** — get system working first
2. **Convert to agents incrementally** — classification first
3. **Keep linear fallbacks** — agents can fail
4. **Monitor agent performance** — accuracy, cost, speed
5. **Use hybrid approach** — agents for reasoning, workflows for actions

### Updated Workflow Count

| Type | Count | Examples |
|------|-------|----------|
| Scheduled (linear) | 8 | Ingestion workflows |
| Triggered (linear) | 6 | Create opportunity, send, etc. |
| Webhook (linear) | 3 | Send actions, health check |
| Monitoring (linear) | 2 | Heartbeat, daily digest |
| **Agentic** | **4** | Triage, research, drafting, qualification |
| Tool workflows | ~8 | Supporting tools for agents |
| **Total** | **~31** | But well-organised and monitored |

The additional complexity is worth it for reliability and intelligence.
