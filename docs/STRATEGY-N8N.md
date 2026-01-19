# MI Platform: Advanced Agentic Architecture
## Deep Dive into n8n AI Agent Implementation

---

# Executive Summary

This document provides a detailed technical design for implementing intelligent agents within the MI Platform using n8n's latest AI capabilities (2025). Based on research into n8n's current feature set, this architecture leverages:

- **AI Agent nodes** with LangChain integration
- **Multi-agent orchestration** via AI Agent Tool nodes
- **Persistent memory** using PostgreSQL/Redis backends
- **Vector stores** for semantic search and RAG patterns
- **MCP (Model Context Protocol)** for external tool integration
- **Structured output parsers** for reliable JSON responses
- **Custom workflow tools** for agent-to-workflow integration

The goal: Transform the MI Platform from a collection of linear workflows into an intelligent system that reasons, adapts, and improves over time.

---

# Part 1: n8n AI Agent Capabilities (2025)

## 1.1 Core Agent Architecture

n8n implements AI agents through a hierarchical node system built on LangChain:

```
┌─────────────────────────────────────────────────────────────────┐
│                        AI AGENT NODE                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    System Prompt                         │   │
│  │  "You are a Signal Triage Agent..."                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌──────────┐  ┌──────────┐  │  ┌──────────┐  ┌──────────┐    │
│  │   LLM    │  │  Memory  │  │  │  Tools   │  │  Output  │    │
│  │ Connector│  │ Connector│  │  │ Connector│  │  Parser  │    │
│  └────┬─────┘  └────┬─────┘  │  └────┬─────┘  └────┬─────┘    │
│       │             │        │       │             │           │
│       ▼             ▼        │       ▼             ▼           │
│  ┌──────────┐  ┌──────────┐  │  ┌──────────┐  ┌──────────┐    │
│  │ Claude/  │  │ Postgres │  │  │ HTTP     │  │Structured│    │
│  │ OpenAI   │  │ Memory   │  │  │ Request  │  │  JSON    │    │
│  └──────────┘  └──────────┘  │  │ Tool     │  │  Parser  │    │
│                              │  └──────────┘  └──────────┘    │
│                              │       │                         │
│                              │  ┌──────────┐                   │
│                              │  │ Workflow │                   │
│                              │  │   Tool   │                   │
│                              │  └──────────┘                   │
│                              │       │                         │
│                              │  ┌──────────┐                   │
│                              │  │  Vector  │                   │
│                              │  │  Store   │                   │
│                              │  └──────────┘                   │
└─────────────────────────────────────────────────────────────────┘
```

## 1.2 Available Agent Types

n8n provides several agent patterns:

| Agent Type | Use Case | Key Feature |
|------------|----------|-------------|
| **Tools Agent** | General purpose with tool calling | Iterates until task complete |
| **Conversational Agent** | Multi-turn chat | Maintains conversation context |
| **ReAct Agent** | Complex reasoning | Explicit reasoning steps |
| **Plan-and-Execute** | Multi-step tasks | Plans before acting |

For the MI Platform, we'll primarily use the **Tools Agent** pattern, which:
- Receives a task/query
- Decides which tools to use
- Executes tools iteratively
- Returns structured output

## 1.3 Memory Systems

n8n supports multiple memory backends:

| Memory Type | Persistence | Use Case | Configuration |
|-------------|-------------|----------|---------------|
| **Simple Buffer** | Session only | Testing, prototypes | Built-in, no config |
| **Window Buffer** | Session only | Cost control, recent context | Configurable window size |
| **PostgreSQL** | Persistent | Production conversations | Requires Postgres credentials |
| **Redis** | Persistent | Fast, ephemeral memory | Requires Redis connection |
| **MongoDB** | Persistent | Document-based history | Requires MongoDB Atlas |
| **Zep** | Persistent + Semantic | Long-term memory with search | Specialized service |
| **Vector Store** | Persistent | Semantic recall over history | Any supported vector DB |

**Recommendation for MI Platform**: 
- Use **PostgreSQL Memory** for agent conversation persistence
- Use **Simple Vector Store** for semantic search over historical signals/patterns

## 1.4 Tool System

Tools extend agent capabilities beyond text generation:

### Built-in Tools
| Tool | Purpose |
|------|---------|
| Calculator | Mathematical operations |
| Wikipedia | Knowledge lookup |
| SerpAPI | Web search |
| Wolfram Alpha | Computational knowledge |

### Custom Tools (Most Powerful)
| Tool Type | Purpose | How It Works |
|-----------|---------|--------------|
| **HTTP Request Tool** | Call any API | Agent specifies URL, method, body |
| **Custom Code Tool** | Run JavaScript/Python | Agent triggers code execution |
| **Call n8n Workflow Tool** | Execute other workflows | Agent calls workflows as functions |
| **AI Agent Tool** | Call other agents | Hierarchical multi-agent |
| **MCP Client Tool** | External MCP servers | Protocol-based tool access |
| **Vector Store Tool** | Semantic search | RAG over documents |

### The `$fromAI()` Function
n8n's killer feature for tools — lets the LLM dynamically populate parameters:

```javascript
// Instead of hardcoding parameters:
{
  "force_name": "Hampshire Constabulary"
}

// The agent can specify them:
{
  "force_name": "$fromAI('force_name', 'The name of the police force to search')"
}
```

The LLM sees the description and fills in the value based on context.

## 1.5 Output Parsers

For structured, reliable outputs:

| Parser | Purpose | Configuration |
|--------|---------|---------------|
| **Structured Output Parser** | Enforce JSON schema | Define JSON Schema |
| **Auto-fixing Output Parser** | Self-correct malformed output | Uses secondary LLM |
| **Custom Output Parser** | Flexible parsing | JavaScript code |

**Critical for MI Platform**: All agent outputs should use Structured Output Parser with defined schemas to ensure consistent data structure.

## 1.6 Multi-Agent Patterns

n8n supports four architectural patterns:

### Pattern 1: Single Agent with Tools
```
User → AI Agent → [Tools] → Response
```
Simple, suitable for most tasks.

### Pattern 2: Sequential Agents (Chained)
```
User → Agent 1 → Agent 2 → Agent 3 → Response
```
Each agent handles a specific step.

### Pattern 3: Hierarchical Agents (Supervisor)
```
                    ┌─────────────┐
                    │ Supervisor  │
                    │   Agent     │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │  Research   │ │  Analysis   │ │   Writing   │
    │   Agent     │ │   Agent     │ │   Agent     │
    └─────────────┘ └─────────────┘ └─────────────┘
```
Supervisor delegates to specialist agents.

### Pattern 4: Collaborative Agents (Team)
```
    ┌─────────────┐
    │   Agent A   │◄────────────┐
    └──────┬──────┘             │
           │                    │
           ▼                    │
    ┌─────────────┐             │
    │   Agent B   │─────────────┤
    └──────┬──────┘             │
           │                    │
           ▼                    │
    ┌─────────────┐             │
    │   Agent C   │─────────────┘
    └─────────────┘
```
Agents collaborate, passing context between each other.

**For MI Platform**: We'll use **Hierarchical Agents** with a lightweight orchestration layer.

---

# Part 2: MI Platform Agent Designs

## 2.1 Overview: Four Intelligent Agents

| Agent | Replaces | Primary Function |
|-------|----------|------------------|
| **Signal Triage Agent** | classify-signal workflow | Classify signals with reasoning |
| **Contact Research Agent** | Part of enrich-opportunity | Multi-source contact discovery |
| **Outreach Composer Agent** | Message drafting | Context-aware, self-critiquing drafts |
| **Opportunity Analyst Agent** | Priority scoring | Holistic assessment + "Why Now" narrative |

## 2.2 Agent 1: Signal Triage Agent

### Purpose
Classify incoming signals (jobs, tenders, news) with reasoning capabilities. Handle edge cases that trip up simple prompts.

### Why Agent > Linear Workflow

| Scenario | Linear Workflow | Agent Approach |
|----------|-----------------|----------------|
| "Police Staff Investigator" | ✅ Easy match | ✅ Easy match |
| "Project Support Officer - Criminal Justice" | ❓ Ambiguous | ✅ Reasons through context |
| "Digital Forensic Analyst - Hampshire" | ⚠️ Might misclassify | ✅ Checks role examples |
| "Investigator (via Reed)" | ❓ Which force? | ✅ Searches for context |

### n8n Implementation

```
┌─────────────────────────────────────────────────────────────────┐
│                    SIGNAL TRIAGE AGENT                          │
│                                                                 │
│  Trigger: Webhook (new signal created)                         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    AI Agent Node                         │   │
│  │                                                          │   │
│  │  Model: Claude 3.5 Sonnet (via Anthropic node)          │   │
│  │  Max Iterations: 5                                       │   │
│  │                                                          │   │
│  │  System Prompt: [See below]                             │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│           │              │              │              │        │
│           ▼              ▼              ▼              ▼        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐  │
│  │ Search     │  │ Search     │  │ Get Role   │  │ Structured│  │
│  │ Forces DB  │  │ Similar    │  │ Examples   │  │ Output    │  │
│  │ (Workflow) │  │ Signals    │  │ (Workflow) │  │ Parser    │  │
│  │            │  │ (Workflow) │  │            │  │           │  │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘  │
│                                                                 │
│  Output → Update Signal record in Airtable                     │
│        → If relevant, trigger create-opportunity workflow       │
│        → If uncertain, add to human review queue               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### System Prompt

```
You are a Signal Triage Agent for Peel Solutions, a company that provides 
managed investigator teams to UK police forces.

YOUR TASK: Determine if a job posting or signal is relevant to our business.

RELEVANT signals are CIVILIAN roles at UK police forces involving:
- Investigators (fraud, safeguarding, serious crime, cold case, etc.)
- Disclosure officers / Disclosure managers
- Case handlers / Case progression officers
- Intelligence analysts / Research officers
- Review officers / File preparation officers
- Statement takers

NOT RELEVANT:
- Sworn police officers (PC, DC, DS, DI, etc.) or PCSOs
- IT / Technology roles
- Administrative roles (unless investigation-related)
- Senior leadership (Chief officers, PCCs, CEOs)
- Roles at non-police organisations
- Volunteer roles

YOU HAVE ACCESS TO THESE TOOLS:
1. search_forces_database - Look up if an organisation is a UK police force
2. search_similar_signals - Find how we classified similar roles before
3. get_role_examples - See examples of relevant and irrelevant roles

YOUR PROCESS:
1. Read the signal carefully
2. Identify the employer - is this a UK police force? Use search_forces_database if unsure
3. Identify the role type - is this investigative/disclosure work?
4. If the role title is ambiguous, use search_similar_signals to see past classifications
5. If you're still uncertain (confidence < 70%), recommend human review

OUTPUT your decision as JSON with these fields:
- decision: "relevant" | "irrelevant" | "needs_review"
- confidence: 0-100
- force_name: standardised police force name or null
- role_type: "investigator" | "disclosure" | "case_handler" | "analyst" | "other"
- reasoning: step-by-step explanation of your decision
- similar_signals_found: list of IDs if you searched for similar signals
```

### Tool: search_forces_database

**Implementation**: Call n8n Workflow Tool

```
┌─────────────────────────────────────────────────────────────────┐
│  Workflow: tool-search-forces                                   │
│                                                                 │
│  [Webhook Trigger]                                              │
│       │                                                         │
│       │  Input: { "query": "Hampshire Constabulary" }          │
│       ▼                                                         │
│  [Airtable Search]                                              │
│       │                                                         │
│       │  Table: Forces                                          │
│       │  Filter: name CONTAINS {query} OR short_name CONTAINS  │
│       │          {query} OR aliases CONTAINS {query}           │
│       ▼                                                         │
│  [IF: Found?]                                                   │
│       │                                                         │
│       ├─ Yes → [Format Response]                               │
│       │         {                                               │
│       │           "found": true,                                │
│       │           "force": {                                    │
│       │             "name": "Hampshire Constabulary",           │
│       │             "short_name": "Hampshire",                  │
│       │             "region": "South East",                     │
│       │             "size": "large"                             │
│       │           }                                             │
│       │         }                                               │
│       │                                                         │
│       └─ No → [Format Response]                                │
│                {                                                │
│                  "found": false,                                │
│                  "suggestion": "This may not be a UK police    │
│                                 force. Verify before           │
│                                 classifying as relevant."      │
│                }                                                │
│                                                                 │
│  [Respond to Webhook]                                           │
└─────────────────────────────────────────────────────────────────┘
```

### Tool: search_similar_signals

**Implementation**: Vector Store search over historical signals

```
┌─────────────────────────────────────────────────────────────────┐
│  Workflow: tool-search-similar-signals                          │
│                                                                 │
│  [Webhook Trigger]                                              │
│       │                                                         │
│       │  Input: { "role_title": "Project Support Officer",     │
│       │           "description": "Criminal justice..." }       │
│       ▼                                                         │
│  [Generate Embedding]                                           │
│       │                                                         │
│       │  OpenAI Embeddings: text-embedding-3-small             │
│       │  Text: {role_title} + {description}                    │
│       ▼                                                         │
│  [Query Vector Store]                                           │
│       │                                                         │
│       │  Collection: historical_signals                         │
│       │  Similarity: cosine                                     │
│       │  Limit: 5                                               │
│       │  Filter: status IN ["relevant", "irrelevant"]          │
│       ▼                                                         │
│  [Format Response]                                              │
│       {                                                         │
│         "similar_signals": [                                    │
│           {                                                     │
│             "signal_id": "sig_123",                            │
│             "title": "Project Coordinator - Crime",            │
│             "classification": "irrelevant",                     │
│             "reasoning": "Admin role, not investigative",       │
│             "similarity": 0.89                                  │
│           },                                                    │
│           ...                                                   │
│         ]                                                       │
│       }                                                         │
│                                                                 │
│  [Respond to Webhook]                                           │
└─────────────────────────────────────────────────────────────────┘
```

### Output Parser Schema

```json
{
  "type": "object",
  "properties": {
    "decision": {
      "type": "string",
      "enum": ["relevant", "irrelevant", "needs_review"]
    },
    "confidence": {
      "type": "number",
      "minimum": 0,
      "maximum": 100
    },
    "force_name": {
      "type": ["string", "null"]
    },
    "role_type": {
      "type": "string",
      "enum": ["investigator", "disclosure", "case_handler", "analyst", "other"]
    },
    "reasoning": {
      "type": "string"
    },
    "similar_signals_found": {
      "type": "array",
      "items": { "type": "string" }
    }
  },
  "required": ["decision", "confidence", "reasoning"]
}
```

### Memory Configuration

For the Signal Triage Agent, we use **session-based memory only** (Simple Buffer) since each signal is classified independently. However, we persist the reasoning to Airtable for human review and future vector store training.

---

## 2.3 Agent 2: Contact Research Agent

### Purpose
Find the best person to contact at a police force, searching across multiple sources with reasoning about who's most appropriate.

### Why Agent > Linear Workflow

| Scenario | Linear Workflow | Agent Approach |
|----------|-----------------|----------------|
| HubSpot has perfect contact | ✅ Works | ✅ Works |
| HubSpot has weak contact | ⚠️ Uses anyway | ✅ Evaluates, may search further |
| No HubSpot contact | ❌ Needs manual | ✅ Tries LinkedIn, website |
| Multiple contacts found | ⚠️ Picks first | ✅ Evaluates seniority, relevance |
| Contact info outdated | ❌ Fails silently | ✅ Can verify/update |

### n8n Implementation

```
┌─────────────────────────────────────────────────────────────────┐
│                  CONTACT RESEARCH AGENT                         │
│                                                                 │
│  Trigger: Called by enrich-opportunity workflow                 │
│                                                                 │
│  Input: { "force_name": "Hampshire Constabulary",              │
│           "role_context": "investigator hiring",               │
│           "existing_contacts": [...] }                         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    AI Agent Node                         │   │
│  │                                                          │   │
│  │  Model: Claude 3.5 Sonnet                               │   │
│  │  Max Iterations: 8                                       │   │
│  │                                                          │   │
│  │  System Prompt: [See below]                             │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│       │         │         │         │         │                │
│       ▼         ▼         ▼         ▼         ▼                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ Search  │ │ Search  │ │ Search  │ │ Get     │ │Structured│  │
│  │ HubSpot │ │LinkedIn │ │ Force   │ │ Contact │ │ Output   │  │
│  │Contacts │ │ (Bright │ │ Website │ │ Prefs   │ │ Parser   │  │
│  │(Workflow)│ │  Data)  │ │(Scraper)│ │(Workflow)│ │          │  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
│                                                                 │
│  Output → Contact record for opportunity                       │
│        → Alternatives for fallback                             │
│        → Confidence assessment                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### System Prompt

```
You are a Contact Research Agent for Peel Solutions. Your task is to find the 
best person to contact at {{force_name}} regarding staffing for investigative roles.

CONTEXT:
We're reaching out because: {{role_context}}
Existing contacts we know: {{existing_contacts}}

IDEAL CONTACTS (in priority order):
1. Head of HR / HR Director — decision maker for staffing
2. Resourcing Manager / Talent Acquisition Lead — handles recruitment
3. Head of PVP / Head of Crime / Head of Investigations — understands the need
4. Workforce Planning Manager — strategic staffing decisions
5. Anyone with "resourcing", "recruitment", or "workforce" in title

YOU HAVE ACCESS TO THESE TOOLS:
1. search_hubspot_contacts — Search our CRM for known contacts at this force
2. search_linkedin — Search LinkedIn for people at this force (via Bright Data)
3. search_force_website — Scrape the force's staff directory page
4. get_contact_preferences — Retrieve our preferences for contact types

YOUR PROCESS:
1. First, check existing_contacts — if any match ideal profiles, evaluate them
2. Search HubSpot for contacts at this force
3. Evaluate HubSpot results — do any match ideal profiles?
4. If no strong HubSpot match, search LinkedIn for the force + relevant titles
5. If LinkedIn finds candidates, check if we can find their email
6. As a last resort, try the force website staff directory
7. Evaluate all candidates found and recommend the best one

EVALUATION CRITERIA:
- Role match to ideal profiles (weight: 40%)
- Seniority level (weight: 25%)
- Contact info availability (weight: 20%)
- Recency of interaction if known (weight: 15%)

OUTPUT your findings as JSON with these fields:
- found: boolean
- recommended_contact: {name, role, email, linkedin_url, source, confidence}
- alternatives: array of other potential contacts
- search_summary: what you searched and found
- recommendation_reasoning: why you chose this person
```

### Tool: search_hubspot_contacts

```
┌─────────────────────────────────────────────────────────────────┐
│  Workflow: tool-search-hubspot-contacts                         │
│                                                                 │
│  [Webhook Trigger]                                              │
│       │                                                         │
│       │  Input: { "company_name": "Hampshire Constabulary",    │
│       │           "role_keywords": ["HR", "Resourcing"] }      │
│       ▼                                                         │
│  [HubSpot Node: Search Contacts]                                │
│       │                                                         │
│       │  Filter: company_name CONTAINS {company_name}          │
│       │  Properties: firstname, lastname, email, jobtitle,     │
│       │              last_activity_date, hs_lead_status        │
│       ▼                                                         │
│  [Code Node: Filter & Rank]                                     │
│       │                                                         │
│       │  // Rank by role match and recency                     │
│       │  contacts.sort((a, b) => {                             │
│       │    const roleScore = scoreRole(a.jobtitle);            │
│       │    const recencyScore = scoreRecency(a.last_activity); │
│       │    return (roleScore * 0.7 + recencyScore * 0.3);      │
│       │  });                                                    │
│       ▼                                                         │
│  [Format Response]                                              │
│       {                                                         │
│         "contacts_found": 3,                                    │
│         "contacts": [                                           │
│           {                                                     │
│             "name": "Sarah Chen",                               │
│             "role": "Head of Resourcing",                       │
│             "email": "sarah.chen@hampshire.police.uk",          │
│             "last_activity": "2024-11-15",                      │
│             "relevance_score": 0.92                             │
│           },                                                    │
│           ...                                                   │
│         ]                                                       │
│       }                                                         │
│                                                                 │
│  [Respond to Webhook]                                           │
└─────────────────────────────────────────────────────────────────┘
```

### Tool: search_linkedin

```
┌─────────────────────────────────────────────────────────────────┐
│  Workflow: tool-search-linkedin                                 │
│                                                                 │
│  [Webhook Trigger]                                              │
│       │                                                         │
│       │  Input: { "company": "Hampshire Police",               │
│       │           "titles": ["Head of HR", "Resourcing"] }     │
│       ▼                                                         │
│  [HTTP Request: Bright Data LinkedIn Scraper]                   │
│       │                                                         │
│       │  POST https://api.brightdata.com/linkedin/search       │
│       │  Body: {                                                │
│       │    "company": "Hampshire Police",                       │
│       │    "title_keywords": ["Head of HR", "Resourcing"],     │
│       │    "country": "UK",                                     │
│       │    "limit": 10                                          │
│       │  }                                                      │
│       ▼                                                         │
│  [Code Node: Parse & Enrich]                                    │
│       │                                                         │
│       │  // Extract relevant fields                             │
│       │  // Attempt email pattern matching                      │
│       │  // firstname.lastname@force.police.uk                  │
│       ▼                                                         │
│  [Format Response]                                              │
│       {                                                         │
│         "profiles_found": 5,                                    │
│         "profiles": [                                           │
│           {                                                     │
│             "name": "Sarah Chen",                               │
│             "title": "Head of Resourcing",                      │
│             "linkedin_url": "linkedin.com/in/sarahchen",        │
│             "inferred_email": "sarah.chen@hampshire.police.uk", │
│             "email_confidence": "likely"                        │
│           },                                                    │
│           ...                                                   │
│         ]                                                       │
│       }                                                         │
│                                                                 │
│  [Respond to Webhook]                                           │
└─────────────────────────────────────────────────────────────────┘
```

### Output Parser Schema

```json
{
  "type": "object",
  "properties": {
    "found": { "type": "boolean" },
    "recommended_contact": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "role": { "type": "string" },
        "email": { "type": ["string", "null"] },
        "linkedin_url": { "type": ["string", "null"] },
        "source": { 
          "type": "string", 
          "enum": ["hubspot", "linkedin", "website", "manual"] 
        },
        "confidence": { 
          "type": "string", 
          "enum": ["verified", "likely", "guess"] 
        }
      }
    },
    "alternatives": {
      "type": "array",
      "items": { "$ref": "#/properties/recommended_contact" }
    },
    "search_summary": { "type": "string" },
    "recommendation_reasoning": { "type": "string" }
  },
  "required": ["found", "search_summary"]
}
```

---

## 2.4 Agent 3: Outreach Composer Agent

### Purpose
Create compelling, personalised outreach messages with context awareness and self-critique capabilities.

### Why Agent > Linear Workflow

| Scenario | Linear Workflow | Agent Approach |
|----------|-----------------|----------------|
| Standard job posting | ✅ Works | ✅ Works |
| Multiple signals for same force | ⚠️ May mention each separately | ✅ Synthesizes intelligently |
| Competitor interception | ⚠️ Generic template | ✅ Tailored angle |
| Previous outreach exists | ❌ May duplicate | ✅ Checks and varies |
| Complex regulatory context | ⚠️ May be insensitive | ✅ Reasons about tone |

### n8n Implementation

```
┌─────────────────────────────────────────────────────────────────┐
│                  OUTREACH COMPOSER AGENT                        │
│                                                                 │
│  Trigger: Called after Contact Research Agent completes        │
│                                                                 │
│  Input: { "opportunity": {...},                                │
│           "contact": {...},                                    │
│           "signals": [...],                                    │
│           "relationship_history": {...} }                      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    AI Agent Node                         │   │
│  │                                                          │   │
│  │  Model: Claude 3.5 Sonnet                               │   │
│  │  Max Iterations: 5                                       │   │
│  │                                                          │   │
│  │  System Prompt: [See below]                             │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│       │         │         │         │         │                │
│       ▼         ▼         ▼         ▼         ▼                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ Get     │ │ Get     │ │ Get     │ │ Self    │ │Structured│  │
│  │Previous │ │Successful│ │ Force   │ │Critique │ │ Output   │  │
│  │Outreach │ │Templates │ │  Intel  │ │  Tool   │ │ Parser   │  │
│  │(Workflow)│ │(Workflow)│ │(Workflow)│ │ (Code)  │ │          │  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
│                                                                 │
│  Output → Draft message                                        │
│        → Subject line                                          │
│        → Channel recommendation                                │
│        → Self-critique notes                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### System Prompt

```
You are an Outreach Composer Agent for Peel Solutions. Your task is to write 
compelling, personalised outreach messages that start conversations with 
police force contacts.

CONTEXT FOR THIS MESSAGE:
- Recipient: {{contact.name}}, {{contact.role}} at {{force_name}}
- Signals: {{signals_summary}}
- Relationship: {{relationship_status}}
- Last contact: {{last_contact_info}}
- Outreach angle: {{outreach_angle}}

OUR COMPANY:
- Peel Solutions provides managed investigator teams to police forces
- Our model: outcome-based delivery, not just agency temps
- We handle recruitment, management, and quality assurance
- Differentiator: We take responsibility for results, not just filling seats

YOU HAVE ACCESS TO THESE TOOLS:
1. get_previous_outreach — See what we've sent to this force/contact before
2. get_successful_templates — Retrieve messages that got positive responses
3. get_force_intel — Get additional context about this force
4. self_critique — Evaluate your draft against quality criteria

YOUR PROCESS:
1. Review all context about this opportunity
2. Check what we've sent to this force before (avoid repetition)
3. Look at successful templates for inspiration
4. Determine the right angle based on outreach_angle:
   - "direct_hiring" → Reference their job posting directly
   - "competitor_intercept" → Frame as proactive market awareness (NEVER mention competitor)
   - "tender" → Professional, reference the procurement opportunity
   - "regulatory" → Sensitive, offer help without citing their challenges
   - "proactive" → General introduction based on market activity
5. Write an initial draft
6. Use self_critique to evaluate:
   - Is it specific enough? (References actual context)
   - Is it too long? (Target: under 100 words)
   - Is it too salesy? (Should be consultative)
   - Would I respond to this?
7. Refine based on critique
8. Output final version

MESSAGE REQUIREMENTS:
- Under 100 words (80 ideal)
- Reference specific, current context
- Clear call to action (usually: brief conversation)
- Professional but warm tone
- Sign off as "James"

AVOID:
- Mentioning competitors by name
- Being pushy or using sales language
- Generic platitudes ("hope this finds you well")
- Repeating previous outreach verbatim
- Citing regulatory challenges directly

OUTPUT your message as JSON with these fields:
- message: the final outreach message
- subject_line: suggested email subject
- channel_recommendation: "email" or "linkedin"
- angle_used: which outreach angle you applied
- reasoning: why this approach
- self_critique_notes: what you refined and why
```

### Tool: self_critique (Custom Code Tool)

This is the "agentic magic" — the agent can call this tool to evaluate its own draft:

```javascript
// Custom Code Tool: self_critique
// Input: { "draft": "...", "context": {...} }

const draft = $input.item.json.draft;
const context = $input.item.json.context;

const critique = {
  word_count: draft.split(/\s+/).length,
  issues: [],
  score: 100
};

// Check length
if (critique.word_count > 120) {
  critique.issues.push("Too long - target under 100 words");
  critique.score -= 20;
}

// Check for generic phrases
const genericPhrases = [
  "hope this finds you well",
  "I wanted to reach out",
  "touching base",
  "circle back"
];
genericPhrases.forEach(phrase => {
  if (draft.toLowerCase().includes(phrase)) {
    critique.issues.push(`Contains generic phrase: "${phrase}"`);
    critique.score -= 10;
  }
});

// Check for competitor mentions
const competitors = ["red snapper", "investigo", "reed", "adecco"];
competitors.forEach(comp => {
  if (draft.toLowerCase().includes(comp)) {
    critique.issues.push(`CRITICAL: Mentions competitor "${comp}"`);
    critique.score -= 50;
  }
});

// Check for specific context reference
if (!draft.includes(context.force_name) && !draft.includes(context.contact_name)) {
  critique.issues.push("Missing specific reference to force or contact");
  critique.score -= 15;
}

// Check for call to action
const ctaPhrases = ["call", "chat", "conversation", "discuss", "connect"];
const hasCTA = ctaPhrases.some(cta => draft.toLowerCase().includes(cta));
if (!hasCTA) {
  critique.issues.push("Missing clear call to action");
  critique.score -= 10;
}

critique.recommendation = critique.score >= 70 
  ? "Good to send with minor tweaks"
  : "Needs significant revision";

return { json: critique };
```

### Output Parser Schema

```json
{
  "type": "object",
  "properties": {
    "message": { "type": "string" },
    "subject_line": { "type": "string" },
    "channel_recommendation": { 
      "type": "string", 
      "enum": ["email", "linkedin"] 
    },
    "angle_used": { 
      "type": "string", 
      "enum": ["direct_hiring", "competitor_intercept", "tender", "regulatory", "proactive"] 
    },
    "reasoning": { "type": "string" },
    "self_critique_notes": { "type": "string" }
  },
  "required": ["message", "subject_line", "channel_recommendation"]
}
```

---

## 2.5 Agent 4: Opportunity Analyst Agent

### Purpose
Provide holistic assessment of opportunities, combining quantitative scoring with qualitative reasoning. Generate the "Why Now" narrative for the dashboard.

### Why Agent > Formula

| Aspect | Formula Scoring | Agent Analysis |
|--------|-----------------|----------------|
| Multiple signals | Counts them | Evaluates relevance of combination |
| Signal timing | Uses decay curve | Reasons about urgency |
| Relationship context | Binary (warm/cold) | Considers nuance |
| Market context | Ignores | Can factor in |
| Narrative | None | Generates "Why Now" |

### n8n Implementation

```
┌─────────────────────────────────────────────────────────────────┐
│                  OPPORTUNITY ANALYST AGENT                      │
│                                                                 │
│  Trigger: Called after all enrichment complete                 │
│                                                                 │
│  Input: { "opportunity": {...},                                │
│           "signals": [...],                                    │
│           "contact": {...},                                    │
│           "force_profile": {...},                              │
│           "draft_message": {...} }                             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    AI Agent Node                         │   │
│  │                                                          │   │
│  │  Model: Claude 3.5 Sonnet                               │   │
│  │  Max Iterations: 3                                       │   │
│  │                                                          │   │
│  │  System Prompt: [See below]                             │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│       │         │         │         │                          │
│       ▼         ▼         ▼         ▼                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │ Get     │ │ Get     │ │Calculate│ │Structured│              │
│  │ Similar │ │ Market  │ │ Base    │ │ Output   │              │
│  │ Opps    │ │ Context │ │ Score   │ │ Parser   │              │
│  │(Workflow)│ │(Workflow)│ │(Formula)│ │          │              │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
│                                                                 │
│  Output → Final priority score                                 │
│        → Priority tier (hot/high/medium/low)                   │
│        → "Why Now" narrative                                   │
│        → Risk assessment                                       │
│        → Recommended action                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### System Prompt

```
You are an Opportunity Analyst Agent for Peel Solutions. Your task is to 
provide a holistic assessment of a business development opportunity.

OPPORTUNITY DETAILS:
- Force: {{force_name}}
- Signals: {{signals_summary}}
- Contact: {{contact_summary}}
- Relationship: {{relationship_status}}
- Base Score (formula): {{calculated_score}}

YOU HAVE ACCESS TO THESE TOOLS:
1. get_similar_opportunities — Find how similar opportunities performed
2. get_market_context — Current market conditions and trends
3. calculate_base_score — Run the standard scoring formula

YOUR ASSESSMENT FRAMEWORK:

1. SIGNAL STRENGTH (0-30 points)
   - How many signals? What types?
   - How recent? (Decay: today=full, 14+ days=minimal)
   - How specific to our services?
   - Do signals reinforce each other?

2. TIMING (0-20 points)
   - Is this urgent? (competitor intercept, tender deadline)
   - Is the need likely still active?
   - Are we early or late to this opportunity?

3. FIT (0-20 points)
   - Does this force typically use external providers?
   - Is the role type our sweet spot?
   - Have we had success with similar forces?

4. RELATIONSHIP (0-15 points)
   - Do we have a good contact?
   - What's our history with this force?
   - Is the contact likely to respond?

5. COMPETITION (0-15 points)
   - Are competitors already active?
   - Can we differentiate?
   - Are we displacing an incumbent?

GENERATE A "WHY NOW" NARRATIVE:
Write 2-3 sentences explaining why this opportunity matters and why we should 
act now. This will appear in the dashboard. Be specific and compelling.

OUTPUT your assessment as JSON:
- final_score: 0-100
- tier: "hot" | "high" | "medium" | "low"
- why_now: 2-3 sentence narrative for dashboard
- component_scores: breakdown by category
- risks: potential issues to be aware of
- recommended_action: "immediate" | "this_week" | "monitor" | "deprioritise"
- reasoning: full explanation
```

### Output Parser Schema

```json
{
  "type": "object",
  "properties": {
    "final_score": { "type": "number", "minimum": 0, "maximum": 100 },
    "tier": { "type": "string", "enum": ["hot", "high", "medium", "low"] },
    "why_now": { "type": "string" },
    "component_scores": {
      "type": "object",
      "properties": {
        "signal_strength": { "type": "number" },
        "timing": { "type": "number" },
        "fit": { "type": "number" },
        "relationship": { "type": "number" },
        "competition": { "type": "number" }
      }
    },
    "risks": {
      "type": "array",
      "items": { "type": "string" }
    },
    "recommended_action": {
      "type": "string",
      "enum": ["immediate", "this_week", "monitor", "deprioritise"]
    },
    "reasoning": { "type": "string" }
  },
  "required": ["final_score", "tier", "why_now", "recommended_action"]
}
```

---

# Part 3: Multi-Agent Orchestration

## 3.1 The Enrichment Pipeline

When a signal is classified as relevant, the agents work in sequence:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENRICHMENT ORCHESTRATOR                      │
│                                                                 │
│  Trigger: Signal marked as relevant                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Step 1: Create/Update Opportunity                       │   │
│  │  (Linear workflow - no agent needed)                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Step 2: Contact Research Agent                         │   │
│  │                                                          │   │
│  │  Input: force_name, role_context, existing_contacts      │   │
│  │  Output: recommended_contact, alternatives               │   │
│  │                                                          │   │
│  │  [If no contact found → Queue for manual, continue]     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Step 3: Outreach Composer Agent                        │   │
│  │                                                          │   │
│  │  Input: opportunity, contact, signals, relationship      │   │
│  │  Output: message, subject_line, channel                  │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Step 4: Opportunity Analyst Agent                       │   │
│  │                                                          │   │
│  │  Input: opportunity, signals, contact, draft, force      │   │
│  │  Output: final_score, tier, why_now                      │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Step 5: Update Opportunity Record                       │   │
│  │  (Linear workflow)                                       │   │
│  │                                                          │   │
│  │  - Save contact                                          │   │
│  │  - Save draft message                                    │   │
│  │  - Save priority score + why_now                         │   │
│  │  - Set status = "ready"                                  │   │
│  │  - If hot lead, trigger alert                            │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 3.2 Implementing in n8n: AI Agent Tool Pattern

n8n's **AI Agent Tool** node allows agents to call other agents. Here's how to structure the orchestration:

```
┌─────────────────────────────────────────────────────────────────┐
│  Workflow: enrichment-orchestrator                              │
│                                                                 │
│  [Webhook Trigger]                                              │
│       │                                                         │
│       │  Input: { "opportunity_id": "opp_123" }                │
│       ▼                                                         │
│  [Airtable: Get Opportunity + Signals + Force]                  │
│       │                                                         │
│       ▼                                                         │
│  [Execute Sub-Workflow: contact-research-agent]                 │
│       │                                                         │
│       │  Uses "Execute Workflow" node, NOT AI Agent Tool       │
│       │  (Agents are called as sub-workflows, not nested)       │
│       ▼                                                         │
│  [IF: Contact Found?]                                           │
│       │                                                         │
│       ├─ No → [Airtable: Flag for Manual] → [Continue]         │
│       │                                                         │
│       └─ Yes ↓                                                  │
│              │                                                  │
│  [Execute Sub-Workflow: outreach-composer-agent]                │
│       │                                                         │
│       ▼                                                         │
│  [Execute Sub-Workflow: opportunity-analyst-agent]              │
│       │                                                         │
│       ▼                                                         │
│  [Airtable: Update Opportunity]                                 │
│       │                                                         │
│       │  - contact, draft, score, why_now, status              │
│       ▼                                                         │
│  [IF: Is Hot Lead?]                                             │
│       │                                                         │
│       └─ Yes → [Slack Alert: Hot Lead Ready]                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 3.3 Error Handling for Agents

Agents can fail in unique ways. Here's the error handling pattern:

```
┌─────────────────────────────────────────────────────────────────┐
│  Agent Error Handling Pattern                                   │
│                                                                 │
│  [AI Agent Node]                                                │
│       │                                                         │
│       ├─ On Success → [Validate Output Schema]                 │
│       │                      │                                  │
│       │                      ├─ Valid → Continue                │
│       │                      │                                  │
│       │                      └─ Invalid → [Retry with Feedback]│
│       │                                         │               │
│       │                                         └─ Max 2 retries│
│       │                                                         │
│       └─ On Error → [Check Error Type]                         │
│                          │                                      │
│                          ├─ Rate Limit → [Wait + Retry]        │
│                          │                                      │
│                          ├─ Max Iterations → [Use Partial]     │
│                          │                                      │
│                          ├─ Tool Error → [Retry Without Tool]  │
│                          │                                      │
│                          └─ Unknown → [Log + Fallback]         │
│                                                                 │
│  Fallback: Use linear workflow version if agent fails          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Retry with Feedback Pattern

When an agent produces invalid output, feed the error back:

```javascript
// In the retry workflow
const previousOutput = $input.item.json.agent_output;
const validationError = $input.item.json.validation_error;

const retryPrompt = `
Your previous output was invalid:
${JSON.stringify(previousOutput)}

Error: ${validationError}

Please try again, ensuring your output matches the required JSON schema.
`;

// Pass to agent with augmented prompt
```

---

# Part 4: Memory & Context Management

## 4.1 Memory Strategy by Agent

| Agent | Memory Type | Persistence | Why |
|-------|-------------|-------------|-----|
| Signal Triage | None (stateless) | No | Each signal classified independently |
| Contact Research | Session buffer | No | Single task, no conversation |
| Outreach Composer | Session + Context | No | Needs full opp context, not history |
| Opportunity Analyst | Session + Context | No | Analytical, not conversational |
| System-wide | Vector Store | Yes | Historical patterns, successful templates |

## 4.2 Vector Store for Historical Learning

Create a vector store of historical data for agents to query:

```
┌─────────────────────────────────────────────────────────────────┐
│  Collections in Vector Store (Qdrant/Pinecone/Simple)           │
│                                                                 │
│  1. historical_signals                                          │
│     - Embeddings of job titles + descriptions                   │
│     - Metadata: classification, confidence, reasoning           │
│     - Use: Signal Triage Agent finds similar past signals       │
│                                                                 │
│  2. successful_outreach                                         │
│     - Embeddings of messages that got responses                 │
│     - Metadata: force, role_type, angle, response_type          │
│     - Use: Outreach Composer finds winning templates            │
│                                                                 │
│  3. force_profiles                                              │
│     - Embeddings of force descriptions + history                │
│     - Metadata: relationship, preferences, past outcomes        │
│     - Use: Analyst Agent understands force context              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Populating the Vector Store

Run weekly to update historical data:

```
┌─────────────────────────────────────────────────────────────────┐
│  Workflow: update-vector-stores (Weekly)                        │
│                                                                 │
│  [Schedule Trigger: Sunday 2am]                                 │
│       │                                                         │
│       ▼                                                         │
│  [Airtable: Get Signals from last 90 days]                     │
│       │                                                         │
│       │  Filter: status IN ["relevant", "irrelevant"]          │
│       │          AND manually_reviewed = true                   │
│       ▼                                                         │
│  [Loop: For Each Signal]                                        │
│       │                                                         │
│       ├─ [OpenAI Embeddings: Generate]                         │
│       │       Text: title + description                        │
│       │                                                         │
│       └─ [Vector Store: Upsert]                                │
│               Collection: historical_signals                    │
│               ID: signal_id                                     │
│               Metadata: {                                       │
│                 classification, confidence,                     │
│                 reasoning, force, role_type                     │
│               }                                                 │
│                                                                 │
│  [Airtable: Get Successful Outreach]                           │
│       │                                                         │
│       │  Filter: opportunity.status = "replied" OR "won"       │
│       ▼                                                         │
│  [Loop: For Each Message]                                       │
│       │                                                         │
│       └─ [Vector Store: Upsert]                                │
│               Collection: successful_outreach                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# Part 5: Agent Monitoring & Evaluation

## 5.1 Agent-Specific Metrics

| Metric | How to Measure | Target |
|--------|----------------|--------|
| **Triage Accuracy** | Manual review sample | >90% |
| **Contact Success Rate** | Found vs. manual fallback | >75% |
| **Draft Quality** | Human edit percentage | <20% edits |
| **Why Now Usefulness** | User feedback | >4/5 rating |
| **Iteration Efficiency** | Avg iterations per task | <4 |
| **Cost per Opportunity** | Total agent costs / opps processed | <£0.10 |

## 5.2 Logging Agent Decisions

Add to System_Logs table:

| Field | Type | Purpose |
|-------|------|---------|
| `agent_name` | Text | Which agent |
| `input_summary` | Text | What was sent to agent |
| `output_summary` | Text | What agent returned |
| `iterations` | Number | Tool calls made |
| `tools_used` | JSON | Which tools, how many times |
| `tokens_input` | Number | Prompt tokens |
| `tokens_output` | Number | Completion tokens |
| `duration_ms` | Number | Total processing time |
| `confidence` | Number | Agent's self-reported confidence |
| `human_override` | Boolean | Did user change the output? |

## 5.3 Weekly Agent Review

```
┌─────────────────────────────────────────────────────────────────┐
│  Workflow: agent-weekly-review (Monday 6am)                     │
│                                                                 │
│  [Schedule Trigger]                                             │
│       │                                                         │
│       ▼                                                         │
│  [Airtable: Get Agent Logs from Last Week]                     │
│       │                                                         │
│       ▼                                                         │
│  [Code: Calculate Metrics]                                      │
│       │                                                         │
│       │  // Per agent:                                          │
│       │  - Total executions                                     │
│       │  - Success rate                                         │
│       │  - Avg iterations                                       │
│       │  - Avg cost                                             │
│       │  - Human override rate                                  │
│       │  - Common tool usage                                    │
│       ▼                                                         │
│  [LLM: Analyze Patterns]                                        │
│       │                                                         │
│       │  "Review these agent metrics and identify:              │
│       │   - Agents performing well                              │
│       │   - Agents needing prompt tuning                        │
│       │   - Tools that are underused or overused               │
│       │   - Cost optimization opportunities"                    │
│       ▼                                                         │
│  [Slack: Send Weekly Agent Report]                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# Part 6: Implementation Roadmap

## 6.1 Phased Agent Introduction

| Phase | Week | Agent | Approach |
|-------|------|-------|----------|
| 1 | 1-4 | None | Linear workflows only |
| 1.5 | 5 | Signal Triage | Replace classify-signal |
| 2 | 6-7 | Contact Research | Replace contact finding logic |
| 2 | 8 | Outreach Composer | Replace message drafting |
| 3 | 9 | Opportunity Analyst | Add holistic scoring |
| 4 | 10+ | Refinement | Tune, monitor, optimize |

## 6.2 Week 5: Signal Triage Agent Implementation

**Day 1**: Set up infrastructure
- Create vector store for historical signals
- Build tool-search-forces workflow
- Build tool-search-similar-signals workflow

**Day 2**: Build agent workflow
- Create signal-triage-agent workflow
- Configure AI Agent node with Claude
- Attach tools
- Add output parser

**Day 3**: Test with sample data
- Run 20 historical signals through agent
- Compare to manual classifications
- Identify edge cases

**Day 4**: Tune and validate
- Adjust system prompt based on failures
- Add edge case handling to tools
- Re-test

**Day 5**: Deploy with fallback
- Keep linear workflow as fallback
- Route 50% traffic to agent
- Monitor accuracy

## 6.3 Rollback Strategy

If an agent underperforms:

```
┌─────────────────────────────────────────────────────────────────┐
│  Agent Rollback Pattern                                         │
│                                                                 │
│  [Router Node]                                                  │
│       │                                                         │
│       │  Expression: $env.USE_SIGNAL_TRIAGE_AGENT               │
│       │                                                         │
│       ├─ true → [Signal Triage Agent]                          │
│       │              │                                          │
│       │              └─ On Error → [Linear Classify Workflow]  │
│       │                                                         │
│       └─ false → [Linear Classify Workflow]                    │
│                                                                 │
│  Environment variable controls routing                          │
│  Can switch off instantly if issues arise                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# Part 7: Cost Optimization

## 7.1 Model Selection Strategy

| Task | Recommended Model | Why | Cost/1K tokens |
|------|-------------------|-----|----------------|
| Signal Triage | Claude 3.5 Haiku | Fast, good enough | $0.00025 |
| Contact Research | Claude 3.5 Sonnet | Needs reasoning | $0.003 |
| Outreach Composer | Claude 3.5 Sonnet | Quality matters | $0.003 |
| Opportunity Analyst | Claude 3.5 Haiku | Structured task | $0.00025 |
| Self-Critique | Claude 3.5 Haiku | Simple evaluation | $0.00025 |

## 7.2 Token Optimization

### Prompt Compression
- Remove unnecessary context from system prompts
- Use concise tool descriptions
- Limit historical data sent to agents

### Caching
- Cache force database lookups
- Cache successful template embeddings
- Cache recent agent decisions (for duplicates)

### Smart Tool Usage
- Order tools by cost (cheaper first)
- Limit max iterations per agent
- Use early termination when confident

## 7.3 Estimated Monthly Costs (Hybrid System)

| Component | Volume | Cost/Unit | Monthly |
|-----------|--------|-----------|---------|
| Signal Triage | 800 signals | $0.005 | $4.00 |
| Contact Research | 80 opps | $0.03 | $2.40 |
| Outreach Composer | 80 opps | $0.03 | $2.40 |
| Opportunity Analyst | 80 opps | $0.01 | $0.80 |
| Vector Store queries | 200 | $0.001 | $0.20 |
| **Total** | | | **~$10/month** |

Still very economical for the intelligence gained.

---

# Summary: The Agentic MI Platform

## What Changes

| Component | Before (Linear) | After (Agentic) |
|-----------|-----------------|-----------------|
| Signal Classification | Single prompt, brittle | Reasons through ambiguity |
| Contact Finding | Fixed sequence | Dynamic multi-source search |
| Message Drafting | One-shot generation | Self-critiquing refinement |
| Priority Scoring | Formula only | Holistic + narrative |
| Adaptability | None | Learns from history |
| Error Handling | Fails or guesses | Reasons and retries |

## What Stays the Same

- Ingestion workflows (linear, scheduled)
- Database operations (CRUD)
- Sending actions (Outlook, LinkedIn)
- Monitoring (formulaic checks)
- Alerting (rule-based)

## Key Architectural Decisions

1. **Agents as sub-workflows** — Not nested AI Agent Tool nodes
2. **Tools as separate workflows** — Modular, testable, reusable
3. **Structured output parsers** — Reliable JSON from all agents
4. **Vector store for learning** — Agents improve over time
5. **Graceful fallbacks** — Linear workflows as backup
6. **Comprehensive logging** — Every agent decision tracked

## Next Steps

1. **Week 1-4**: Build linear system (as per main doc)
2. **Week 5**: Implement Signal Triage Agent
3. **Week 6**: Add Contact Research Agent
4. **Week 7-8**: Add Outreach Composer Agent
5. **Week 9**: Add Opportunity Analyst Agent
6. **Week 10+**: Monitor, tune, optimize

The agents make the system smarter. The linear workflows keep it reliable. Together, they deliver on the promise: **ready-to-send leads with 95% of the work done automatically**.

---

*Document version: 1.0*
*Based on n8n capabilities as of January 2025*
