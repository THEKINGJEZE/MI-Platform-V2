# SPEC-012: Email Integration + Relationship Decay Alerts

**Status**: Fallback Approach (Superseded by SPEC-014 for AI components)
**Phase**: 2a
**Priority**: P2 — Fallback if Clawdbot approach fails
**Depends On**: Phase 1d complete ✅, Make.com OAuth valid ✅
**Created**: 23 January 2026
**Updated**: 26 January 2026 — Marked as fallback; SPEC-014 (Clawdbot) is primary approach

---

> ⚠️ **Note**: This spec documents the **n8n AI agent approach** which is now the **fallback**.
>
> **Primary approach**: SPEC-014 (Clawdbot Email Processor) — uses Claude Max + Opus 4.5 via Clawdbot
>
> **What this spec still covers**:
> - Make.com scenarios (email sync, draft creator, email mover) — still needed
> - Airtable schema (Email_Raw, Emails tables) — still needed
> - n8n WF3 (Waiting-For Tracker) — simple pattern matching, stays in n8n
> - n8n WF5 (Contact Auto-Creator) — simple domain check, stays in n8n
> - n8n Email Executor — dumb pipe from Airtable to Make.com, stays in n8n
>
> **What SPEC-014 replaces**:
> - n8n WF1 (Email Classifier) → Clawdbot skill
> - n8n WF2 (Email Drafter) → Clawdbot skill (merged into email-processor)
>
> See `DECISIONS.md I5` for rationale.

---

## Pre-Flight Checklist

Before this spec can be considered complete:

- [x] `/prep-spec relationship-decay-scanner` was run before extending
- [x] `specs/NEXT-CONTEXT.md` was reviewed
- [x] Acceptance criteria copied verbatim from ROADMAP.md
- [x] Guardrails reviewed; applicable ones cited inline (G-XXX)
- [x] Strategy divergence check completed (no divergence — implements Decision I1, I3, I4)
- [x] Testing plan includes 5+ specific test scenarios per workflow
- [x] Build sequence defines implementation order

**Context Brief**: `specs/NEXT-CONTEXT.md` (generated 23 Jan 2026)

---

## 1. Overview

### Problem

James's inbox is a source of anxiety and missed opportunities:
- Important emails get buried in noise
- No systematic way to track what needs response
- "Waiting for" items get forgotten
- Relationships decay without proactive touchpoints
- Email processing takes too long and feels overwhelming

### Solution

An ADHD-optimised email management system with:

1. **AI Classification** — Incoming emails auto-categorised by priority
2. **Draft Generation** — AI drafts responses for urgent emails
3. **Focus Mode** — Process only 5 emails at a time (no overwhelm)
4. **Waiting-For Tracking** — Auto-track sent emails expecting replies
5. **Relationship Decay Alerts** — Proactive nudges before contacts go cold

### Critical Constraint

**n8n cannot directly authenticate to Microsoft Outlook.** All Outlook operations must go through Make.com as a permanent bridge.

### Expected Outcome

| Metric | Before | After |
|--------|--------|-------|
| Time to process 10 emails | 30+ min (scattered) | 10 min (focused) |
| Important emails missed | ~15% | <2% |
| Forgotten follow-ups | Common | Tracked and prompted |
| Relationship decay | Undetected | Alerted at 14 days |

---

## 2. Architecture

### Three-Layer Design

```
┌─────────────────────────────────────────────────────────────────┐
│  MAKE.COM LAYER (Outlook Access)                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Scenario 1: Email Sync (Scheduled every 15 min)               │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│  │   Outlook   │ ──► │  Filter &   │ ──► │  Airtable   │       │
│  │  Get Emails │     │  Transform  │     │   Upsert    │       │
│  └─────────────┘     └─────────────┘     └─────────────┘       │
│                                                                 │
│  Scenario 2: Draft Creator (Webhook from n8n)                  │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│  │   Webhook   │ ──► │   Build     │ ──► │  Outlook    │       │
│  │   Receive   │     │   Draft     │     │Create Draft │       │
│  └─────────────┘     └─────────────┘     └─────────────┘       │
│                                                                 │
│  Scenario 3: Email Mover (Webhook from n8n)                    │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│  │   Webhook   │ ──► │   Lookup    │ ──► │  Outlook    │       │
│  │   Receive   │     │   Folder    │     │ Move Email  │       │
│  └─────────────┘     └─────────────┘     └─────────────┘       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  n8n LAYER (AI Processing)                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  WF1: Email Classification (Chain + Structured Output)          │
│  WF2: Response Drafter (ReAct Agent)                           │
│  WF3: Waiting-For Tracker                                      │
│  WF4: Relationship Decay Scanner                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  AIRTABLE LAYER (State & Queue) — 2 Tables Only                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Email_Raw ──────────────────────► Emails                       │
│  (Make.com sync,                   (AI classified,              │
│   raw archive)                     drafts, waiting-for)         │
│                                                                 │
│  Note: Waiting-For is a FILTERED VIEW on Emails table           │
│        (status = "waiting_for_reply")                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Why Chain for Classification, Agent for Drafting

| Task | Approach | Why |
|------|----------|-----|
| **Classification** | LLM Chain + Structured Output | Deterministic mapping task. ~100ms vs ~500ms. No reasoning needed. |
| **Response Drafting** | ReAct Agent with tools | Complex reasoning IS valuable — look up past emails, check style, self-critique. |

---

## 3. Classification System

### Priority Categories

| Priority | Visual | Triggers | Dashboard Action |
|----------|--------|----------|------------------|
| 🔴 **Urgent** | Red badge | Police sender, open deal, time-sensitive language | Always show in Focus Mode |
| 🟡 **Today** | Yellow badge | Direct question, requires response | Fill remaining Focus slots |
| 🟢 **This Week** | Green badge | Can wait a few days | Show if <5 urgent/today |
| ⚪ **FYI** | Grey badge | Newsletters, notifications | Never in Focus Mode |
| 🗑️ **Archive** | None | Marketing spam, auto-archive | Auto-archived |

### HubSpot Boost Rule

If sender has an **open deal** in HubSpot → boost priority by one level.
- This Week → Today
- Today → Urgent

### Action Types

| Action | When to Use | System Behaviour |
|--------|-------------|------------------|
| **Reply** | Questions, requests, invitations | Queue for draft generation |
| **Forward** | Not for James, relevant to team | Flag for manual forward |
| **FYI** | Updates, confirmations, status | Mark read, no action |
| **Archive** | No value, can ignore | Move to Archive folder |

### Classification Prompt

Use existing `prompts/email-triage.md` with updates for V2 schema fields.

---

## 4. ADHD-First Dashboard UX

### Focus Mode

**The Pattern**: Never show the full inbox. Show only the **top 5 urgent/important emails** in a guided session.

```
┌─────────────────────────────────────────────────────────────────┐
│  EMAIL FOCUS MODE                                 1 of 5         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🔴 URGENT — Police Sender                                       │
│                                                                 │
│  From: Sarah Chen <sarah.chen@kent.police.uk>                   │
│  Subject: Re: Disclosure team support                           │
│  Received: 2 hours ago                                          │
│                                                                 │
│  "Hi James, following up on our call yesterday. We've           │
│  confirmed budget for Q2 and would like to proceed with         │
│  the 3-person team we discussed..."                             │
│                                                                 │
│  💬 Suggested response:                                          │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Thanks Sarah, great news! I'll send over the contract     │ │
│  │ and onboarding details by end of day. Let me know if      │ │
│  │ you need anything before then.                            │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [Edit] [Approve & Create Draft] [Skip] [Archive]               │
│                                                                 │
│  AI Reasoning: Police sender, active deal, direct request       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Volume Limits

| Mode | Max Emails | When |
|------|------------|------|
| **Focus Session** | 5 | Morning Brief, review queue |
| **Quick Scan** | 10 | "Show me more" after Focus |
| **Full View** | 20 | Explicitly requested |
| **Never** | >20 | System caps at 20 visible |

### "Done for Now" Celebration

After completing Focus Mode (5 emails processed):

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        🎉 Email Done!                            │
│                                                                 │
│     You handled 5 emails in 8 minutes                           │
│     3 drafts ready in Outlook                                   │
│     2 archived                                                  │
│                                                                 │
│     [View Drafts in Outlook]  [Show More Emails]  [Exit]        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Skip Without Guilt

- **Skip** moves email to @Review folder (not inbox, not archive)
- Skipped items resurface next day IF still unread
- After 3 skips, item auto-archives with note "Repeatedly skipped"

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `E` | Edit draft |
| `A` | Approve & Create Draft |
| `S` | Skip (move to @Review) |
| `D` | Archive (move to Archive) |
| `J/K` | Navigate emails |

---

## 5. Waiting-For Tracking

### Flow

```
[Sent Items Trigger] ─→ [Detect "Asking For" Pattern]
                                 │
                                 ▼
                    [Create Waiting_For Record]
                                 │
                                 ▼
                    [Daily: Check for Reply]
                                 │
                    ┌────────────┴────────────┐
                    ↓                         ↓
              Reply Found              No Reply (Day 3+)
                    │                         │
                    ↓                         ↓
              Close Record            Draft Follow-up
```

### Patterns to Detect

- "Could you let me know..."
- "Please confirm..."
- "Looking forward to hearing..."
- "When would you be available..."
- Direct questions ending in "?"

### Dashboard Section

```
┌─────────────────────────────────────────────────────────────────┐
│  WAITING FOR REPLIES                                    3 items  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🟡 5 days  Sarah Chen (Kent) — Proposal review                 │
│             "Sent proposal, awaiting feedback"                  │
│             [Draft Follow-up] [Mark Received] [Close]           │
│                                                                 │
│  🟢 2 days  John Smith (Met) — Meeting availability             │
│             "Asked for meeting times"                           │
│             [Draft Follow-up] [Mark Received] [Close]           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Relationship Decay Alerts

### Two-Tier Monitoring Architecture

**Problem**: James has 1000s of contacts. Monitoring all would be overwhelming.

**Solution**: Two-tier decay monitoring:

1. **Micro (Deal-Level)** — Only contacts with active deals
2. **Macro (Organisation-Level)** — Company/force engagement across any contact

### Micro: Deal-Level Decay (Tight Thresholds)

**Scope**: Contacts associated with:
- **Active pipeline deals** — Need momentum to close
- **Closed Won deals** — Existing clients need relationship maintenance

| Deal Stage | Days Since Contact | Status | Action |
|------------|-------------------|--------|--------|
| Active Pipeline | 0-7 | Active | No alert |
| Active Pipeline | 8-14 | Warming | Yellow — "Deal contact going quiet" |
| Active Pipeline | 15-30 | At-Risk | Orange — urgent re-engagement |
| Active Pipeline | 30+ | Cold | Red — "Deal stalling" |
| **Closed Won** | 0-30 | Active | No alert |
| **Closed Won** | 31-60 | Warming | Yellow — "Client check-in due" |
| **Closed Won** | 61-90 | At-Risk | Orange — "Client relationship cooling" |
| **Closed Won** | 90+ | Cold | Red — "Client at risk of churn" |

**Why different thresholds**:
- Active deals need tight follow-up (silence kills deals)
- Clients need regular but less frequent touchpoints (monthly is fine)

### Macro: Organisation-Level Decay (Looser Thresholds)

**Scope**: Companies/Forces — last engagement across ANY contact at that org

| Days Since Contact | Status | Action |
|--------------------|--------|--------|
| 0-30 | Active | No alert |
| 31-60 | Warming | Yellow alert — "Haven't spoken to [Force] in 6 weeks" |
| 61-90 | Cold | Orange alert — suggest re-engagement |
| 90+ | At-Risk | Red alert — "No contact with [Force] in 3 months" |

**Why looser**: Org relationships can be maintained less frequently.

### Data Source: HubSpot (Decision I1)

**Fields used**:
- `notes_last_contacted` — Last logged activity
- `hs_last_sales_activity_timestamp` — Last sales activity
- `hs_sales_email_last_replied` — Email engagement
- Deal associations and pipeline stages

**NOT duplicating to Airtable** — query HubSpot directly via MCP.

### AI-Suggested Touchpoints

**NOT salesy.** Suggestions should be:
- Share a relevant article
- Congratulate on news/achievement
- Check in on previous project
- Ask how things are going
- Reference industry development

### Dashboard Section

```
┌─────────────────────────────────────────────────────────────────┐
│  DEAL CONTACTS GOING COLD                               2 items  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🟠 16 days  Sarah Chen (Kent) — Active Deal: Q2 Team           │
│              Last: Proposal sent, awaiting feedback             │
│              [Draft Follow-up] [Snooze 7 days] [Mark Contacted] │
│                                                                 │
│  🟡 9 days   John Smith (Met) — Active Deal: Disclosure Support │
│              Last: Initial meeting                              │
│              [Draft Follow-up] [Snooze 7 days] [Mark Contacted] │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  CLIENT CHECK-INS DUE                                   2 items  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🟡 45 days  DI Williams (Sussex) — Client: PIP2 Team           │
│              Contract renewal: 3 months                         │
│              Suggestion: "Check how the new team is settling"   │
│              [Draft Check-in] [Snooze 14 days] [Mark Contacted] │
│                                                                 │
│  🟠 72 days  DS Patel (Northumbria) — Client: Disclosure        │
│              Contract renewal: 5 months                         │
│              Suggestion: "Share case study from similar force"  │
│              [Draft Check-in] [Snooze 14 days] [Mark Contacted] │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ORGANISATIONS GOING QUIET                              3 items  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🟠 68 days  Merseyside Police                                  │
│              Last contact: Any — DI Williams (June)             │
│              Suggestion: "Share HMICFRS report on disclosure"   │
│              [Draft Touchpoint] [Snooze 30 days]                │
│                                                                 │
│  🟡 45 days  Greater Manchester Police                          │
│              Last contact: DS Patel (December)                  │
│              Suggestion: "Congratulate on training graduation"  │
│              [Draft Touchpoint] [Snooze 30 days]                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Schema

> **Design Decision**: Option D (2 tables) per DECISIONS.md A11 analysis.
> V2's simplified backend philosophy: 4 existing tables + 2 new tables = 6 total.
> Waiting-For is a **filtered view**, not a separate table.

### Email_Raw Table (NEW)

**Purpose**: Make.com syncs raw emails here. Dumb archive per G-001.

| Field | Type | Purpose |
|-------|------|---------|
| email_id | Text (PK) | Outlook message ID |
| conversation_id | Text | Thread grouping |
| subject | Text | Email subject |
| from_email | Email | Sender email |
| from_name | Text | Sender display name |
| body_preview | Long Text | First 500 chars (keeps size manageable) |
| received_at | DateTime | When received |
| folder | Text | Outlook folder path |
| has_attachments | Checkbox | Has attachments |
| synced_at | DateTime | When synced to Airtable |
| processed | Checkbox | Triggers n8n when false → true |

**Notes**:
- No `body_html` — full body not needed, saves storage
- No `to_email`, `importance`, `is_read` — not needed for classification

### Emails Table (NEW)

**Purpose**: n8n classifies here. Contains drafts, waiting-for tracking, all actions.

| Field | Type | Purpose |
|-------|------|---------|
| email_id | Text (PK) | Same as Email_Raw (1:1 relationship) |
| classification | Select | Urgent/Today/Week/FYI/Archive |
| priority | Number | 1-5 |
| action_type | Select | Reply/Forward/FYI/Archive |
| status | Select | new/draft_ready/approved/sent/waiting_for_reply/done |
| draft_response | Long Text | AI-generated draft |
| key_request | Text | One-sentence summary of what they're asking |
| ai_confidence | Number | 0-100 |
| ai_reasoning | Long Text | Why this classification |
| waiting_since | DateTime | When sent (for Waiting-For tracking) |
| follow_up_draft | Long Text | AI-generated follow-up for overdue items |
| skip_count | Number | Times skipped (auto-archive at 3) |
| actioned_at | DateTime | When user took action |
| force | Link | Link to Forces table |
| contact | Link | Link to Contacts table |
| opportunity | Link | Link to Opportunities table |
| hubspot_contact_id | Text | HubSpot contact ID |
| has_open_deal | Checkbox | HubSpot deal context |

**Notes**:
- No `target_folder` — folder movement is an action, not stored state
- No `created_at` — use Airtable's automatic created time
- `status = "waiting_for_reply"` replaces the separate Waiting_For table

### Waiting-For View (NOT A TABLE)

**Implementation**: Airtable filtered view on Emails table.

```
filterByFormula: AND(
  {status} = "waiting_for_reply",
  {waiting_since} != BLANK()
)
```

**Sort**: `waiting_since` ascending (oldest first)

**Dashboard filter for overdue items**:
```
filterByFormula: AND(
  {status} = "waiting_for_reply",
  {waiting_since} < DATEADD(TODAY(), -3, 'days')
)
```

### Contacts Table Additions

**Purpose**: Relationship decay tracking on existing table.

| Field | Type | Purpose |
|-------|------|---------|
| relationship_status | Select | Active/Warming/Cold/At-Risk |
| last_contact_date | Date | Last meaningful contact |
| decay_alert_sent | DateTime | When last alert sent |
| next_touchpoint_suggestion | Long Text | AI suggestion |

### Schema Summary

| Table | Status | Purpose |
|-------|--------|---------|
| Forces | Existing | 48 UK police forces |
| Contacts | Existing + 4 fields | People at forces + decay tracking |
| Signals | Existing | Raw intelligence |
| Opportunities | Existing | Actionable leads |
| **Email_Raw** | **NEW** | Make.com syncs here (G-001) |
| **Emails** | **NEW** | AI classification + drafts + waiting-for |

**Total: 6 tables** (vs V1's 15+)

---

## 8. Workflows

### WF1: MI: Email Classifier (V2)

**Trigger**: Airtable — new record in Email_Raw (processed = false)

**Flow**:
1. Fetch email record from Email_Raw
2. HubSpot node: Search for contact by email
3. HubSpot node: Get open deals for contact
4. Code node: Force pattern matching (G-005)
5. Code node: Build classification prompt with context
6. LLM Chain + Structured Output Parser
7. Airtable: Create/upsert Emails record (same email_id)
8. If action_type = "Reply" AND priority <= 2: Trigger WF2
9. HTTP: Call Make.com to move email to target folder
10. Airtable: Mark Email_Raw as processed

**Performance target**: <200ms per email

### WF2: MI: Email Drafter (V2)

**Trigger**: Airtable — Emails with action_type = "Reply" AND status = "new"

**Flow**:
1. Fetch email from Email_Raw (for body) and Emails (for classification context)
2. ReAct Agent with tools:
   - `get_past_emails` — Previous correspondence with sender
   - `get_templates` — Response templates
   - `get_force_context` — Force background
   - `get_peel_services` — Service descriptions
   - `self_critique` — Review and improve draft
3. Generate draft following SALES-STRATEGY.md patterns
4. Airtable: Update Emails with draft_response
5. Set status = "draft_ready"

### WF3: MI: Waiting-For Tracker

**Trigger**: Airtable — new record in Email_Raw (folder = "Sent Items")

**Flow**:
1. Code node: Detect "asking for" patterns in body
2. If pattern found:
   - Extract what was requested (key_request field)
   - Create Emails record with status = "waiting_for_reply", waiting_since = NOW()
3. Daily schedule: Query Emails where status = "waiting_for_reply" AND waiting_since < 3 days ago
4. For each overdue:
   - Generate follow-up draft
   - Update follow_up_draft field

### WF4: MI: Relationship Decay Scanner

**Trigger**: Schedule — Daily at 06:00

**Flow (Two-Tier)**:

**Tier 1: Deal-Level Decay (Micro)**
1. HubSpot: Get deals in active pipeline stages + Closed Won
2. HubSpot: Get contacts associated with each deal
3. For each deal-contact:
   - Get `notes_last_contacted`, `hs_last_sales_activity_timestamp`
   - Calculate days since last contact
   - Apply thresholds based on deal stage:
     - Active pipeline: 8/15/30 days (tight)
     - Closed Won (clients): 30/60/90 days (looser)
   - If decaying: Generate touchpoint suggestion
   - Surface in dashboard:
     - Active deals → "Deal Contacts Going Cold"
     - Closed Won → "Client Check-ins Due"

**Tier 2: Organisation-Level Decay (Macro)**
1. HubSpot: Get all companies linked to Forces
2. For each company:
   - Get all associated contacts
   - Find most recent engagement across ANY contact
   - Calculate days since org-level last contact
   - Apply loose thresholds (30/60/90 days)
   - If decaying: Generate touchpoint suggestion
   - Surface in dashboard "Organisations Going Quiet"

**Output**: Two separate dashboard sections, not mixed together

### WF5: MI: Contact Auto-Creator

**Trigger**: Airtable — Emails where `is_public_sector_sender = true` AND `hubspot_contact_id` IS EMPTY

**Flow**:
1. Parse sender email domain
2. Check if UK public sector domain:
   - `*.police.uk`, `*.gov.uk`, `*.nhs.uk`, `*.mod.uk`, `*.parliament.uk`
3. If public sector:
   - HubSpot: Search for existing contact by email
   - If not found:
     - HubSpot: Create contact (name from email headers)
     - HubSpot: Associate with Company (lookup by domain/force)
   - Airtable: Update Emails record with hubspot_contact_id

---

## 8a. WF4: Relationship Decay Scanner — Implementation Details

### Overview

**Name**: `MI: Relationship Decay Scanner`
**Trigger**: Schedule — Daily at 06:00 UK time
**Purpose**: Scan HubSpot for decaying relationships, generate dashboard alerts

### Node-by-Node Specification

```
┌─────────────────┐
│ Schedule Trigger│ Cron: 0 6 * * * (Europe/London)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Set: Config     │ Define thresholds + HubSpot properties
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│ Tier 1 │ │ Tier 2 │  (Parallel branches)
│ Deals  │ │ Orgs   │
└────┬───┘ └────┬───┘
     │          │
     └────┬─────┘
          ▼
┌─────────────────┐
│ Merge Results   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Generate Alerts │ AI touchpoint suggestions (G-012)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Output: JSON    │ Dashboard-consumable format
└─────────────────┘
```

### Node 1: Schedule Trigger

```json
{
  "parameters": {
    "rule": {
      "interval": [{ "field": "cronExpression", "expression": "0 6 * * *" }]
    }
  },
  "type": "n8n-nodes-base.scheduleTrigger",
  "typeVersion": 1.2,
  "position": [0, 0]
}
```

**Timezone**: Set workflow settings to `Europe/London`

### Node 2: Set Config

```javascript
return {
  thresholds: {
    activePipeline: { warming: 8, atRisk: 15, cold: 30 },
    closedWon: { warming: 31, atRisk: 61, cold: 90 },
    organisation: { warming: 31, atRisk: 61, cold: 90 }
  },
  hubspotProperties: [
    'notes_last_contacted',
    'hs_last_sales_activity_timestamp',
    'hs_sales_email_last_replied',
    'hs_email_last_open_date',
    'firstname',
    'lastname',
    'email',
    'company',
    'jobtitle'
  ],
  dealProperties: [
    'dealname',
    'dealstage',
    'closedate',
    'amount'
  ]
};
```

### Node 3a: Tier 1 — Get Active Pipeline Deals

**Type**: HubSpot node (native)
**Operation**: Get All Deals
**Filters**:
- `dealstage` NOT IN closed stages
- OR `dealstage` = closedwon (for client tracking per I4)

**Properties to fetch**: dealname, dealstage, closedate, amount, hs_lastmodifieddate

### Node 3b: Tier 1 — Get Deal Contacts (Loop)

**Type**: HTTP Request (HubSpot API v4 associations)
**URL**: `https://api.hubapi.com/crm/v4/objects/deals/{{ $json.id }}/associations/contacts`

For each deal, get associated contacts.

### Node 3c: Tier 1 — Get Contact Engagement

**Type**: HubSpot node (batch read)
**Input**: Contact IDs from associations
**Properties**: `notes_last_contacted`, `hs_last_sales_activity_timestamp`, `firstname`, `lastname`, `email`

### Node 3d: Tier 1 — Calculate Decay Status

**Type**: Code node

```javascript
const config = $('Set Config').item.json;
const today = new Date();

return $input.all().map(item => {
  const contact = item.json;
  const deal = contact.deal; // Attached in previous merge

  // Get most recent engagement timestamp
  const lastContact = new Date(Math.max(
    new Date(contact.notes_last_contacted || 0),
    new Date(contact.hs_last_sales_activity_timestamp || 0)
  ));

  const daysSinceContact = Math.floor((today - lastContact) / (1000 * 60 * 60 * 24));

  // Determine thresholds based on deal stage
  const isClosedWon = deal.dealstage === 'closedwon';
  const thresholds = isClosedWon
    ? config.thresholds.closedWon
    : config.thresholds.activePipeline;

  // Determine status
  let status = 'active';
  let color = 'green';
  if (daysSinceContact >= thresholds.cold) {
    status = 'cold'; color = 'red';
  } else if (daysSinceContact >= thresholds.atRisk) {
    status = 'at_risk'; color = 'orange';
  } else if (daysSinceContact >= thresholds.warming) {
    status = 'warming'; color = 'yellow';
  }

  // Skip if active (no alert needed)
  if (status === 'active') return null;

  return {
    type: isClosedWon ? 'client_checkin' : 'deal_contact',
    contact: {
      id: contact.hs_object_id,
      name: `${contact.firstname || ''} ${contact.lastname || ''}`.trim(),
      email: contact.email,
      title: contact.jobtitle
    },
    deal: {
      id: deal.hs_object_id,
      name: deal.dealname,
      stage: deal.dealstage
    },
    daysSinceContact,
    status,
    color,
    lastContactDate: lastContact.toISOString(),
    section: isClosedWon ? 'Client Check-ins Due' : 'Deal Contacts Going Cold'
  };
}).filter(Boolean); // Remove nulls (active contacts)
```

### Node 4a: Tier 2 — Get All Companies (Forces)

**Type**: HubSpot node
**Operation**: Search Companies
**Filter**: Companies linked to UK police forces (by domain or name pattern)

Using `patterns/force-matching.js` logic (G-005):
```javascript
// Filter companies that match police force patterns
const forcePatterns = require('patterns/force-matching.js');
```

### Node 4b: Tier 2 — Get Company Contacts

**Type**: HTTP Request (associations)
**URL**: `https://api.hubapi.com/crm/v4/objects/companies/{{ $json.id }}/associations/contacts`

### Node 4c: Tier 2 — Calculate Org-Level Decay

**Type**: Code node

```javascript
const config = $('Set Config').item.json;
const today = new Date();

return $input.all().map(item => {
  const company = item.json;
  const contacts = company.contacts || [];

  // Find most recent engagement across ALL contacts at this org
  let latestContact = null;
  let latestContactName = null;
  let latestDate = new Date(0);

  for (const contact of contacts) {
    const contactDate = new Date(Math.max(
      new Date(contact.notes_last_contacted || 0),
      new Date(contact.hs_last_sales_activity_timestamp || 0)
    ));
    if (contactDate > latestDate) {
      latestDate = contactDate;
      latestContact = contact;
      latestContactName = `${contact.firstname || ''} ${contact.lastname || ''}`.trim();
    }
  }

  const daysSinceContact = Math.floor((today - latestDate) / (1000 * 60 * 60 * 24));
  const thresholds = config.thresholds.organisation;

  // Determine status
  let status = 'active';
  let color = 'green';
  if (daysSinceContact >= thresholds.cold) {
    status = 'cold'; color = 'red';
  } else if (daysSinceContact >= thresholds.atRisk) {
    status = 'at_risk'; color = 'orange';
  } else if (daysSinceContact >= thresholds.warming) {
    status = 'warming'; color = 'yellow';
  }

  if (status === 'active') return null;

  return {
    type: 'organisation',
    organisation: {
      id: company.hs_object_id,
      name: company.name,
      domain: company.domain
    },
    lastContact: {
      name: latestContactName,
      date: latestDate.toISOString()
    },
    daysSinceContact,
    status,
    color,
    section: 'Organisations Going Quiet'
  };
}).filter(Boolean);
```

### Node 5: Merge Results

**Type**: Merge node
**Mode**: Append

Combines Tier 1 (deal contacts + clients) and Tier 2 (organisations) into single array.

### Node 6: Generate AI Touchpoint Suggestions

**Type**: OpenAI node (gpt-4o-mini)
**For each decaying item**, generate a touchpoint suggestion.

**Prompt** (per G-012 — NOT salesy):

```
You are helping maintain a professional relationship. Generate a brief, genuine touchpoint suggestion.

Contact: {{ $json.contact.name }} ({{ $json.contact.title }})
Organisation: {{ $json.organisation.name || $json.deal.name }}
Days since contact: {{ $json.daysSinceContact }}
Context: {{ $json.type }}

Rules:
- NOT salesy — no pitches, no "checking in to see if you need our services"
- Genuine relationship maintenance
- Suggest ONE of these approaches:
  1. Share a relevant industry article or insight
  2. Congratulate on recent news or achievement (if known)
  3. Check in on a previous project or conversation
  4. Reference an industry development that affects them
  5. Simple "how are things going" if long relationship

Output format: Single sentence suggestion (max 50 words)
```

### Node 7: Output JSON

**Type**: Code node

```javascript
// Group by section for dashboard consumption
const items = $input.all().map(i => i.json);

const grouped = {
  deal_contacts_going_cold: items.filter(i => i.section === 'Deal Contacts Going Cold'),
  client_checkins_due: items.filter(i => i.section === 'Client Check-ins Due'),
  organisations_going_quiet: items.filter(i => i.section === 'Organisations Going Quiet'),
  generated_at: new Date().toISOString(),
  total_alerts: items.length
};

return [{ json: grouped }];
```

### Output Storage

**Option A**: Write to Airtable `Decay_Alerts` table (lightweight, for persistence)
**Option B**: Write to JSON file for dashboard API to read
**Option C**: Store in Redis/cache with TTL of 24 hours

**Recommended**: Option A (Airtable) for audit trail and dashboard API compatibility.

### Test Cases (WF4)

1. **Active pipeline contact, 10 days no contact** → Yellow alert in "Deal Contacts Going Cold"
2. **Active pipeline contact, 20 days no contact** → Orange alert
3. **Closed Won contact, 45 days no contact** → Yellow alert in "Client Check-ins Due"
4. **Closed Won contact, 75 days no contact** → Orange alert
5. **Organisation, 70 days no contact across all contacts** → Orange alert in "Organisations Going Quiet"
6. **AI suggestion** → Verify it's non-salesy (no "services", no "opportunity")
7. **Contact with recent activity (3 days)** → No alert (filtered out)

---

## 8b. WF5: Contact Auto-Creator — Implementation Details

### Overview

**Name**: `MI: Contact Auto-Creator`
**Trigger**: Airtable — New record in Emails table with `is_public_sector_sender = true` AND `hubspot_contact_id` IS EMPTY
**Purpose**: Automatically create HubSpot contacts for UK public sector email senders

### Node-by-Node Specification

```
┌─────────────────┐
│ Airtable Trigger│ New Emails where public_sector AND no contact
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Parse Domain    │ Extract domain from sender email
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check Domain    │ Is UK public sector? (G-005 pattern matching)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ HubSpot Search  │ Check if contact already exists
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
 Exists    Not Found
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│ Update │ │ Create │
│ Emails │ │ Contact│
└────────┘ └────┬───┘
               │
               ▼
         ┌────────────┐
         │ Associate  │ Link to Company/Force
         │ Company    │
         └────────────┘
```

### Public Sector Domain Patterns (G-005)

**File**: `patterns/public-sector-domains.js`

```javascript
/**
 * UK Public Sector Domain Patterns
 * Per Decision I3 — includes all UK public sector, not just police
 */

const PUBLIC_SECTOR_PATTERNS = [
  // Police forces
  { pattern: /\.police\.uk$/i, type: 'police', priority: 'high' },

  // Central government
  { pattern: /\.gov\.uk$/i, type: 'government', priority: 'medium' },

  // NHS
  { pattern: /\.nhs\.uk$/i, type: 'nhs', priority: 'medium' },

  // Ministry of Defence
  { pattern: /\.mod\.uk$/i, type: 'defence', priority: 'medium' },

  // Parliament
  { pattern: /\.parliament\.uk$/i, type: 'parliament', priority: 'low' },

  // Universities (optional — per spec)
  { pattern: /\.ac\.uk$/i, type: 'education', priority: 'low' }
];

/**
 * Check if email domain is UK public sector
 * @param {string} email - Email address to check
 * @returns {object|null} - Match info or null
 */
function isPublicSectorDomain(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return null;

  for (const { pattern, type, priority } of PUBLIC_SECTOR_PATTERNS) {
    if (pattern.test(domain)) {
      return { domain, type, priority, matched: true };
    }
  }
  return null;
}

/**
 * Extract force name from police.uk domain
 * Uses patterns/force-matching.js for lookup
 */
function extractForceName(domain) {
  // e.g., kent.police.uk → Kent Police
  const subdomain = domain.replace('.police.uk', '');
  // Lookup in force-matching patterns
  return lookupForce(subdomain);
}

module.exports = { isPublicSectorDomain, extractForceName, PUBLIC_SECTOR_PATTERNS };
```

### Node 1: Airtable Trigger

**Type**: Airtable Trigger
**Table**: Emails
**Trigger on**: Record matches conditions
**Conditions**:
- `is_public_sector_sender` = TRUE
- `hubspot_contact_id` IS EMPTY

### Node 2: Parse Domain

**Type**: Code node

```javascript
const email = $input.item.json.from_email;
const domain = email.split('@')[1]?.toLowerCase();
const name = $input.item.json.from_name || '';

// Parse name into first/last
const nameParts = name.split(' ');
const firstName = nameParts[0] || '';
const lastName = nameParts.slice(1).join(' ') || '';

return {
  email,
  domain,
  firstName,
  lastName,
  originalRecord: $input.item.json
};
```

### Node 3: Check Domain Pattern

**Type**: Code node

```javascript
const { isPublicSectorDomain, extractForceName } = require('patterns/public-sector-domains.js');

const result = isPublicSectorDomain($json.email);

if (!result) {
  // Not public sector — stop processing
  return { skip: true, reason: 'Not UK public sector domain' };
}

let forceName = null;
if (result.type === 'police') {
  forceName = extractForceName($json.domain);
}

return {
  ...$json,
  isPublicSector: true,
  sectorType: result.type,
  priority: result.priority,
  forceName
};
```

### Node 4: IF (Skip Check)

**Type**: IF node
**Condition**: `{{ $json.skip }}` !== true

### Node 5: HubSpot Search Contact

**Type**: HubSpot node
**Operation**: Search
**Object**: Contacts
**Filter**: `email` = `{{ $json.email }}`

### Node 6: IF (Contact Exists)

**Type**: IF node
**Condition**: `{{ $json.results.length }}` > 0

### Node 7a (Exists): Update Emails Record

**Type**: Airtable node
**Operation**: Update Record
**Table**: Emails
**Record ID**: `{{ $('Airtable Trigger').item.json.id }}`
**Fields**:
- `hubspot_contact_id`: `{{ $json.results[0].id }}`

### Node 7b (Not Found): Create HubSpot Contact

**Type**: HubSpot node
**Operation**: Create
**Object**: Contact
**Properties**:
- `email`: `{{ $json.email }}`
- `firstname`: `{{ $json.firstName }}`
- `lastname`: `{{ $json.lastName }}`
- `hs_lead_status`: 'NEW'

### Node 8: Associate with Company

**Type**: HTTP Request (HubSpot associations API)

First, find company by domain:
```
GET /crm/v3/objects/companies/search
Body: { "filterGroups": [{ "filters": [{ "propertyName": "domain", "operator": "EQ", "value": "{{ $json.domain }}" }] }] }
```

If found, create association:
```
PUT /crm/v4/objects/contacts/{{ $json.contactId }}/associations/companies/{{ $json.companyId }}
```

For police domains, also try to match Force using `patterns/force-matching.js`.

### Node 9: Update Emails Record (Final)

**Type**: Airtable node
**Operation**: Update Record
**Fields**:
- `hubspot_contact_id`: `{{ $json.newContactId }}`
- `is_public_sector_sender`: true (confirm)

### Test Cases (WF5)

1. **Email from sarah.chen@kent.police.uk** (no HubSpot contact) → Contact created, linked to Kent Police company
2. **Email from john.smith@kent.police.uk** (contact exists) → No duplicate, Emails record updated with existing ID
3. **Email from jane@example.gov.uk** (government domain) → Contact created, type = 'government'
4. **Email from bob@nhs.uk** → Contact created, type = 'nhs'
5. **Email from alice@gmail.com** → Skipped (not public sector)
6. **Company association** → Verify contact linked to correct company by domain lookup

---

## 8c. WF3: Waiting-For Tracker — Implementation Details

### Overview

**Name**: `MI: Waiting-For Tracker`
**Triggers**:
1. Airtable — New record in Email_Raw with `folder` = "Sent Items"
2. Schedule — Daily at 07:00 for overdue scan
**Purpose**: Track sent emails that expect replies, alert when overdue

### "Asking For" Detection Patterns

**File**: `patterns/waiting-for-patterns.js`

```javascript
/**
 * Patterns that indicate an email is asking for something
 * and expects a reply
 */

const ASKING_PATTERNS = [
  // Direct questions
  { pattern: /\?$/m, type: 'question', weight: 1 },

  // Explicit requests
  { pattern: /could you (please )?(let me know|confirm|send|provide)/i, type: 'request', weight: 2 },
  { pattern: /please (confirm|let me know|advise|send|provide)/i, type: 'request', weight: 2 },
  { pattern: /can you (please )?(confirm|send|let me know)/i, type: 'request', weight: 2 },
  { pattern: /would you (be able to|mind)/i, type: 'request', weight: 1.5 },

  // Anticipation phrases
  { pattern: /looking forward to (hearing|your|receiving)/i, type: 'anticipation', weight: 2 },
  { pattern: /let me know (if|when|what)/i, type: 'anticipation', weight: 1.5 },
  { pattern: /await(ing)? your (response|reply|feedback|confirmation)/i, type: 'anticipation', weight: 2 },

  // Availability requests
  { pattern: /when (would you be|are you) available/i, type: 'scheduling', weight: 2 },
  { pattern: /what times? (work|suit)/i, type: 'scheduling', weight: 1.5 },

  // Decision requests
  { pattern: /what do you think/i, type: 'opinion', weight: 1 },
  { pattern: /your thoughts on/i, type: 'opinion', weight: 1 },
  { pattern: /your feedback (on|would be)/i, type: 'opinion', weight: 1.5 }
];

/**
 * Analyze email body for "asking for" patterns
 * @param {string} body - Email body text
 * @returns {object} - Analysis result
 */
function analyzeForWaitingFor(body) {
  if (!body) return { isWaitingFor: false };

  let totalWeight = 0;
  const matchedPatterns = [];

  for (const { pattern, type, weight } of ASKING_PATTERNS) {
    if (pattern.test(body)) {
      totalWeight += weight;
      matchedPatterns.push(type);
    }
  }

  // Threshold: weight >= 2 indicates "asking for"
  const isWaitingFor = totalWeight >= 2;

  return {
    isWaitingFor,
    confidence: Math.min(totalWeight / 4, 1), // 0-1 scale
    matchedPatterns,
    totalWeight
  };
}

/**
 * Extract what was asked for (for key_request field)
 * Simple heuristic: find sentence containing strongest pattern
 */
function extractKeyRequest(body) {
  const sentences = body.split(/[.!?]+/);

  for (const sentence of sentences) {
    for (const { pattern, weight } of ASKING_PATTERNS) {
      if (weight >= 2 && pattern.test(sentence)) {
        return sentence.trim().substring(0, 200); // Max 200 chars
      }
    }
  }

  return null;
}

module.exports = { analyzeForWaitingFor, extractKeyRequest, ASKING_PATTERNS };
```

### Workflow: Sent Email Detection

```
┌─────────────────┐
│ Airtable Trigger│ Email_Raw where folder = "Sent Items"
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Pattern Analysis│ Check for "asking for" patterns
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
 Asking     Not Asking
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│ Create │ │  Stop  │
│ Emails │ │        │
│ Record │ │        │
└────────┘ └────────┘
```

### Node 1: Airtable Trigger

**Type**: Airtable Trigger
**Table**: Email_Raw
**Conditions**: `folder` = "Sent Items"

### Node 2: Pattern Analysis

**Type**: Code node

```javascript
const { analyzeForWaitingFor, extractKeyRequest } = require('patterns/waiting-for-patterns.js');

const body = $input.item.json.body_preview;
const analysis = analyzeForWaitingFor(body);

if (!analysis.isWaitingFor) {
  return { skip: true };
}

const keyRequest = extractKeyRequest(body);

return {
  email_id: $input.item.json.email_id,
  subject: $input.item.json.subject,
  to_email: $input.item.json.to_email || $input.item.json.from_email, // Sent items
  key_request: keyRequest,
  confidence: analysis.confidence,
  matched_patterns: analysis.matchedPatterns,
  sent_at: $input.item.json.received_at // For sent items, received_at = sent_at
};
```

### Node 3: IF (Is Waiting For)

**Type**: IF node
**Condition**: `{{ $json.skip }}` !== true

### Node 4: Create Emails Record

**Type**: Airtable node
**Operation**: Create Record
**Table**: Emails
**Fields**:
- `email_id`: `{{ $json.email_id }}`
- `status`: "waiting_for_reply"
- `waiting_since`: `{{ $json.sent_at }}`
- `key_request`: `{{ $json.key_request }}`
- `ai_confidence`: `{{ Math.round($json.confidence * 100) }}`

### Workflow: Daily Overdue Scan

```
┌─────────────────┐
│ Schedule Trigger│ Cron: 0 7 * * * (Europe/London)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Airtable Search │ Emails where status="waiting" AND overdue
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Generate Follow │ AI draft follow-up for each overdue item
│ Up Drafts       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Update Emails   │ Set follow_up_draft field
└─────────────────┘
```

### Node: Airtable Search (Overdue Items)

**Type**: Airtable node
**Operation**: Search Records
**Table**: Emails
**Formula**:
```
AND(
  {status} = "waiting_for_reply",
  {waiting_since} < DATEADD(TODAY(), -3, 'days')
)
```

### Node: Generate Follow-Up Drafts

**Type**: OpenAI node (gpt-4o-mini)

**Prompt**:
```
Generate a brief, professional follow-up email for an unanswered request.

Original subject: {{ $json.subject }}
What was asked: {{ $json.key_request }}
Days waiting: {{ Math.floor((Date.now() - new Date($json.waiting_since)) / (1000*60*60*24)) }}

Rules (per G-012, G-015):
- Professional but not pushy
- Acknowledge they may be busy
- Briefly restate the request
- Clear, simple CTA

Format: Just the email body (no subject line, no greeting/signature — those will be added automatically)
Max: 75 words
```

### Test Cases (WF3)

1. **Sent email with "Could you confirm the meeting time?"** → Creates waiting_for_reply record
2. **Sent email with "Thanks for the update"** (no question) → No record created
3. **Sent email with "Looking forward to hearing from you"** → Creates waiting_for_reply record
4. **Waiting item at 4 days old** → Follow-up draft generated
5. **Waiting item at 2 days old** → No draft yet (under threshold)
6. **Reply received** → Dashboard should allow marking as "done"

---

## 8d. Dashboard Components — Implementation Details

Per Decision I4 and ADHD interface design principles, the dashboard requires several new components for Phase 2a-6, 2a-7, and 2a-8.

### Component 1: Relationship Decay Panels

Three separate panels, each showing contacts needing attention at different levels:

#### Panel: "Deal Contacts Going Cold"

**Data Source**: WF4 output filtered by `tier = "deal_level"`

**React Component**:
```tsx
// components/decay/DealContactsDecay.tsx
interface DecayContact {
  contactId: string;
  contactName: string;
  email: string;
  dealName: string;
  dealStage: string;
  daysSinceContact: number;
  status: 'yellow' | 'orange' | 'red';
  suggestedTouchpoint?: string;
  force?: string;
}

export function DealContactsDecay({ contacts }: { contacts: DecayContact[] }) {
  // Group by status for visual priority
  const grouped = {
    red: contacts.filter(c => c.status === 'red'),
    orange: contacts.filter(c => c.status === 'orange'),
    yellow: contacts.filter(c => c.status === 'yellow'),
  };

  return (
    <DecayPanel
      title="Deal Contacts Going Cold"
      icon={<FlameIcon />}
      groups={grouped}
      emptyMessage="All deal contacts are engaged 🎉"
    />
  );
}
```

**Display Rules**:
- Red items always at top
- Show contact name, deal name, days since last contact
- Action buttons: "Send Touchpoint" | "Mark Contacted" | "Snooze 7 days"
- Keyboard: `T` = Send touchpoint, `M` = Mark contacted, `S` = Snooze

**Visual Design** (per uk-police-design-system):
- Red status: `--color-priority-1` background (#DC2626)
- Orange status: `--color-priority-2` background (#F59E0B)
- Yellow status: `--color-priority-3` background (#FACC15)
- Status badge left-aligned, contact info right

#### Panel: "Client Check-ins Due"

**Data Source**: WF4 output filtered by `tier = "deal_level"` AND `isClosedWon = true`

**Differences from Deal Contacts**:
- Different thresholds (30/60/90 vs 8/15/30)
- Different messaging: "Check-in" vs "Follow-up"
- Different icon: handshake vs flame
- Lower urgency styling (no red flashing)

**React Component**:
```tsx
// components/decay/ClientCheckIns.tsx
export function ClientCheckIns({ contacts }: { contacts: DecayContact[] }) {
  return (
    <DecayPanel
      title="Client Check-ins Due"
      icon={<HandshakeIcon />}
      groups={groupByStatus(contacts)}
      emptyMessage="All clients recently contacted 🤝"
      variant="client"  // Different styling - more relaxed
    />
  );
}
```

#### Panel: "Organisations Going Quiet"

**Data Source**: WF4 output filtered by `tier = "org_level"`

**Differences**:
- Shows force name prominently (not individual contact)
- Aggregates all contacts for that org
- "Any contact" counts — not individual tracking
- Suggested action: "Reach out to anyone at [Force]"

**React Component**:
```tsx
// components/decay/OrganisationsQuiet.tsx
interface OrgDecay {
  forceId: string;
  forceName: string;
  daysSinceAnyContact: number;
  status: 'yellow' | 'orange' | 'red';
  contactCount: number;
  lastContactedBy?: string;
  suggestedTouchpoint?: string;
}

export function OrganisationsQuiet({ orgs }: { orgs: OrgDecay[] }) {
  return (
    <DecayPanel
      title="Organisations Going Quiet"
      icon={<BuildingIcon />}
      groups={groupByStatus(orgs)}
      emptyMessage="All organisations active 🏢"
      renderItem={(org) => (
        <OrgDecayCard
          org={org}
          onReachOut={() => showContactPicker(org.forceId)}
        />
      )}
    />
  );
}
```

### Component 2: Waiting-For Section

Shows emails sent by James that are awaiting replies.

**Data Source**: Emails table filtered by `status = "waiting_for_reply"`

**React Component**:
```tsx
// components/email/WaitingForSection.tsx
interface WaitingItem {
  emailId: string;
  subject: string;
  recipientName: string;
  recipientEmail: string;
  sentAt: string;
  waitingDays: number;
  keyRequest: string;  // What was asked
  isOverdue: boolean;  // >3 days
  followUpDraft?: string;
}

export function WaitingForSection({ items }: { items: WaitingItem[] }) {
  const overdue = items.filter(i => i.isOverdue);
  const pending = items.filter(i => !i.isOverdue);

  return (
    <section className="waiting-for-section">
      <SectionHeader
        title="Waiting For Replies"
        count={items.length}
        overdueCount={overdue.length}
      />

      {overdue.length > 0 && (
        <WaitingGroup
          title="Overdue (3+ days)"
          items={overdue}
          variant="urgent"
        />
      )}

      <WaitingGroup
        title="Pending"
        items={pending}
        variant="normal"
      />
    </section>
  );
}
```

**Display Rules**:
- Overdue items (>3 days) highlighted with orange border
- Show: Subject, recipient, days waiting, key request snippet
- Actions: "Send Follow-up" | "Mark Received" | "Cancel"
- Keyboard: `F` = Send follow-up, `R` = Mark received, `X` = Cancel

**Follow-up Flow**:
```tsx
// When user clicks "Send Follow-up"
async function handleSendFollowUp(item: WaitingItem) {
  // 1. Show draft in composer (pre-populated from WF3)
  setComposerContent({
    to: item.recipientEmail,
    subject: `Re: ${item.subject}`,
    body: item.followUpDraft || generateDefaultFollowUp(item),
  });

  // 2. User can edit and send
  // 3. On send: update Emails record status to "followed_up"
}
```

### Component 3: Email Focus Mode

Existing component from Phase 2a-5, but needs integration with new sections.

**Layout Integration**:
```tsx
// pages/review.tsx — Updated layout
export function ReviewPage() {
  const [activeSection, setActiveSection] = useState<
    'opportunities' | 'emails' | 'decay' | 'waiting'
  >('opportunities');

  return (
    <ThreeZoneLayout>
      {/* LEFT: Queue Panel */}
      <QueuePanel>
        <SectionTabs
          active={activeSection}
          onChange={setActiveSection}
          counts={{
            opportunities: opportunityCount,
            emails: emailCount,
            decay: decayCount,
            waiting: waitingCount,
          }}
        />

        {activeSection === 'opportunities' && <OpportunityQueue />}
        {activeSection === 'emails' && <EmailQueue />}
        {activeSection === 'decay' && <DecayQueue />}
        {activeSection === 'waiting' && <WaitingQueue />}
      </QueuePanel>

      {/* CENTER: Context Panel */}
      <ContextPanel section={activeSection} />

      {/* RIGHT: Action Panel */}
      <ActionPanel section={activeSection} />
    </ThreeZoneLayout>
  );
}
```

### API Endpoints

#### GET /api/decay

Returns decay alerts from WF4 output.

```typescript
// pages/api/decay.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Query Airtable for recent decay scan results
  // Or query HubSpot directly if using real-time approach

  const dealContacts = await fetchDecayAlerts('deal_level');
  const clientCheckins = await fetchDecayAlerts('deal_level', { isClosedWon: true });
  const orgQuiet = await fetchDecayAlerts('org_level');

  return res.json({
    dealContacts,
    clientCheckins,
    orgQuiet,
    lastScan: new Date().toISOString(),
  });
}
```

#### GET /api/waiting-for

Returns waiting-for items from Emails table.

```typescript
// pages/api/waiting-for.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const items = await airtable('Emails')
    .select({
      filterByFormula: '{status} = "waiting_for_reply"',
      sort: [{ field: 'waiting_since', direction: 'asc' }],
    })
    .all();

  return res.json({
    items: items.map(formatWaitingItem),
    overdueCount: items.filter(i => isOverdue(i)).length,
  });
}
```

#### POST /api/decay/action

Handles decay panel actions.

```typescript
// pages/api/decay/action.ts
interface DecayActionRequest {
  contactId: string;
  action: 'send_touchpoint' | 'mark_contacted' | 'snooze';
  snooze_days?: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { contactId, action, snooze_days } = req.body as DecayActionRequest;

  switch (action) {
    case 'send_touchpoint':
      // Open composer with suggested touchpoint
      return res.json({ action: 'open_composer', contactId });

    case 'mark_contacted':
      // Update HubSpot contact's last_contact_date
      await hubspot.contacts.update(contactId, {
        properties: { notes_last_contacted: new Date().toISOString() }
      });
      return res.json({ success: true });

    case 'snooze':
      // Set snooze in local state (or Airtable if persistent)
      await airtable('Decay_Snoozes').create({
        contact_id: contactId,
        snoozed_until: addDays(new Date(), snooze_days || 7),
      });
      return res.json({ success: true });
  }
}
```

### Keyboard Shortcuts

Extended shortcuts for new sections:

| Key | Context | Action |
|-----|---------|--------|
| `1` | Global | Switch to Opportunities section |
| `2` | Global | Switch to Emails section |
| `3` | Global | Switch to Decay section |
| `4` | Global | Switch to Waiting-For section |
| `J` / `K` | All queues | Move down / up in list |
| `T` | Decay item | Send touchpoint |
| `M` | Decay item | Mark as contacted |
| `S` | Decay item | Snooze 7 days |
| `F` | Waiting item | Send follow-up |
| `R` | Waiting item | Mark reply received |
| `X` | Waiting item | Cancel waiting |

**Implementation**:
```tsx
// hooks/useKeyboardShortcuts.ts
useKeyboardShortcuts({
  '1': () => setActiveSection('opportunities'),
  '2': () => setActiveSection('emails'),
  '3': () => setActiveSection('decay'),
  '4': () => setActiveSection('waiting'),
  // ... section-specific shortcuts
});
```

### State Management

Using React Query for server state, local state for UI:

```tsx
// hooks/useDecayData.ts
export function useDecayData() {
  return useQuery({
    queryKey: ['decay'],
    queryFn: () => fetch('/api/decay').then(r => r.json()),
    refetchInterval: 5 * 60 * 1000,  // Refresh every 5 min
  });
}

// hooks/useWaitingFor.ts
export function useWaitingFor() {
  return useQuery({
    queryKey: ['waiting-for'],
    queryFn: () => fetch('/api/waiting-for').then(r => r.json()),
    refetchInterval: 5 * 60 * 1000,
  });
}
```

### Test Cases (Dashboard Components)

1. **Decay panel shows red items first** → Items sorted by status (red > orange > yellow)
2. **Empty state when no decay** → Shows celebration message, not blank
3. **Keyboard nav works in decay section** → J/K moves selection, T/M/S triggers actions
4. **Waiting-for shows overdue count** → Badge shows "3 overdue" when 3 items >3 days
5. **Follow-up draft pre-populated** → Composer shows WF3-generated draft
6. **Section tabs show counts** → Each tab badge shows item count
7. **Snooze hides item for 7 days** → Item reappears after snooze period
8. **Mark contacted updates HubSpot** → HubSpot contact's last_contact_date updated

---

## 9. Make.com Scenarios

### Scenario 1: Email Sync

**Schedule**: Every 15 minutes

**Flow**:
1. Microsoft 365 — Get emails from Inbox (last 15 min)
2. Filter — Exclude already-synced (check email_id in Airtable)
3. Iterator — Process each email
4. Airtable — Upsert to Email_Raw
5. HTTP — Trigger n8n WF1 (optional, or use Airtable trigger)

### Scenario 2: Draft Creator

**Trigger**: Webhook

**Input**:
```json
{
  "email_id": "outlook-message-id",
  "reply_to_id": "original-message-id",
  "subject": "Re: Original subject",
  "body": "Draft body content",
  "to": "recipient@example.com"
}
```

**Flow**:
1. Webhook — Receive from n8n
2. Microsoft 365 — Create Draft (reply to original)
3. HTTP Response — Return draft_id

### Scenario 3: Email Mover

**Trigger**: Webhook

**Input**:
```json
{
  "email_id": "outlook-message-id",
  "target_folder": "@Action"
}
```

**Flow**:
1. Webhook — Receive from n8n
2. Microsoft 365 — Get folder ID by name
3. Microsoft 365 — Move email to folder
4. HTTP Response — Success/failure

---

## 10. Implementation Phases

### Phase 2a-1: Make.com Bridge Setup

- [x] Verify Microsoft OAuth credentials still valid (3 connections active)
- [ ] Reactivate/update Email Sync scenario (ID: 8287614)
- [ ] Create Airtable tables: Email_Raw, Emails
- [ ] Add relationship decay fields to existing Contacts table
- [ ] Test Outlook → Make.com → Airtable flow
- [ ] Reactivate Draft Creator webhook scenario (ID: 8260100)
- [ ] Reactivate Email Mover webhook scenario (ID: 8260117)

### Phase 2a-2: n8n Classification

- [ ] Create `MI: Email Classifier (V2)` workflow
- [ ] Implement LLM Chain + Structured Output
- [ ] Add HubSpot enrichment (standard node)
- [ ] Add force pattern matching (G-005)
- [ ] Add null check before upsert (V1 fix)
- [ ] Test classification accuracy on 50 emails
- [ ] Benchmark: Target <200ms per email

### Phase 2a-3: Response Drafting

- [ ] Create `MI: Email Drafter (V2)` workflow
- [ ] Implement ReAct Agent with tools
- [ ] Add self-critique tool
- [ ] Test draft quality on 20 emails
- [ ] Verify SALES-STRATEGY.md compliance

### Phase 2a-4: Outlook Actions

- [ ] Test n8n → Make.com Draft Creator flow
- [ ] Test n8n → Make.com Email Mover flow
- [ ] Verify drafts appear correctly in Outlook
- [ ] Verify emails move to correct folders

### Phase 2a-5: Dashboard Integration

- [ ] Add Email Focus Mode to dashboard
- [ ] Implement volume limits (5/10/20)
- [ ] Add keyboard shortcuts (E/A/S/D)
- [ ] Add progress indicator ("1 of 5")
- [ ] Add "Done for Now" celebration
- [ ] Integration with Morning Brief

### Phase 2a-5b: ADHD UX Checkpoint

**STOP.** Review against ADHD-first principles:

- [ ] Focus Mode implemented? (max 5 visible)
- [ ] Progress indicator showing "X of 5"?
- [ ] Skip button prominent and guilt-free?
- [ ] "Done for now" celebration after 5?
- [ ] Volume caps enforced (never >20)?
- [ ] Time estimate visible?
- [ ] Exit point clear after Focus Mode?
- [ ] Low-energy escape hatch available?

**Must pass before Phase 2a-6.**

### Phase 2a-6: Waiting-For Tracking

- [ ] Create `MI: Waiting-For Tracker` workflow
- [ ] Implement "asking for" pattern detection
- [ ] Use Emails table with status = "waiting_for_reply" (NO separate table)
- [ ] Create Airtable filtered view for Waiting-For items
- [ ] Daily overdue scan workflow
- [ ] Follow-up draft generation
- [ ] Dashboard "Waiting For" section (filter on Emails table)

### Phase 2a-7: Relationship Decay Alerts

- [x] Add schema fields to Contacts
- [x] Create `MI: Relationship Decay Scanner` workflow
- [x] Implement two-tier decay (Deal-Level + Org-Level)
- [x] Query HubSpot for engagement data (Decision I1)
- [x] AI touchpoint suggestions (non-salesy)
- [x] Dashboard sections:
  - [x] "Deal Contacts Going Cold" (active pipeline)
  - [x] "Client Check-ins Due" (Closed Won — existing clients)
  - [ ] "Organisations Going Quiet" (force-level) — Tier 2, deferred

**Implementation Notes (23 Jan 2026)**:
- Workflow: `n8n/workflows/relationship-decay-scanner.json`
- Dashboard API: `/api/decay-alerts` with grouped and stats endpoints
- Types: `dashboard/lib/types/decay.ts`
- Two-tier thresholds per Decision I4:
  - Active Pipeline: 8/15/30 days (warming/at-risk/cold)
  - Closed Won: 31/61/90 days (warming/at-risk/cold)
- Organisation-level tracking deferred to Tier 2 (needs additional data aggregation)

### Phase 2a-8: Contact Auto-Creation

- [ ] Create `MI: Contact Auto-Creator` workflow
- [ ] UK public sector domain detection (not just police):
  - `*.police.uk` — Police forces
  - `*.gov.uk` — Central government
  - `*.nhs.uk` — NHS
  - `*.mod.uk` — Ministry of Defence
  - `*.parliament.uk` — Parliament
  - `*.ac.uk` — Universities (if relevant)
- [ ] Trigger: Email classified with `is_public_sector_sender = true` AND `hubspot_contact_id = null`
- [ ] Create HubSpot contact via standard node (not AI Agent)
- [ ] Link to Company by org/force lookup
- [ ] Update Emails record with new contact ID

---

## 11. Acceptance Criteria

From ROADMAP.md Phase 2a:

- [ ] Email ingestion from Outlook working
- [ ] Email classification working (lead response, opportunity, etc.)
- [ ] Draft responses generated for emails needing reply
- [ ] Email queue in dashboard
- [ ] Can approve draft from dashboard (creates Outlook draft)
- [ ] Relationship decay tracking active (daily scan)
- [ ] Dashboard shows "Relationships Need Attention" section
- [ ] AI-suggested touchpoints for cold contacts

### Additional Success Metrics

| Metric | Target |
|--------|--------|
| Classification accuracy | >90% |
| Time per email (classification) | <200ms |
| Focus Mode completion rate | >80% of sessions complete 5 emails |
| Waiting-For capture rate | >70% of sent requests tracked |
| Relationship decay detected | 100% of contacts >30 days |

---

## 12. Test Plan

**Total Test Cases**: 35+ (minimum 5 per workflow + integration + UX)

### WF4: Relationship Decay Scanner Tests

| # | Scenario | Input | Expected Output | Guardrail |
|---|----------|-------|-----------------|-----------|
| 1 | Active deal contact, 10 days silence | Contact on Open Deal, last_contact = 10 days ago | Yellow alert, tier = "deal_level" | — |
| 2 | Active deal contact, 20 days silence | Contact on Open Deal, last_contact = 20 days ago | Orange alert, tier = "deal_level" | — |
| 3 | Active deal contact, 35 days silence | Contact on Open Deal, last_contact = 35 days ago | Red alert, tier = "deal_level" | — |
| 4 | Closed Won contact, 45 days silence | Contact on Closed Won deal, last_contact = 45 days ago | Yellow alert (client tier) | — |
| 5 | Closed Won contact, 70 days silence | Contact on Closed Won deal, last_contact = 70 days ago | Orange alert (client tier) | — |
| 6 | Closed Won contact, 95 days silence | Contact on Closed Won deal, last_contact = 95 days ago | Red alert (client tier) | — |
| 7 | Organisation with no recent contact | Force with all contacts >60 days | Yellow org-level alert | G-005 |
| 8 | Contact contacted yesterday | Contact with last_contact = 1 day ago | No alert (not in results) | — |
| 9 | AI touchpoint suggestion | Cold contact identified | Non-salesy touchpoint text | G-012 |
| 10 | Force matching on org lookup | Organisation name "Kent Police" | Correctly linked to Kent force | G-005 |

### WF5: Contact Auto-Creator Tests

| # | Scenario | Input | Expected Output | Guardrail |
|---|----------|-------|-----------------|-----------|
| 1 | Police domain email | Email from john@kent.police.uk | HubSpot contact created, force = Kent | G-005 |
| 2 | Gov.uk domain email | Email from jane@homeoffice.gov.uk | HubSpot contact created | — |
| 3 | NHS domain email | Email from dr.smith@nhs.uk | HubSpot contact created | — |
| 4 | Existing contact | Email from existing@kent.police.uk (already in HubSpot) | No duplicate created | G-011 |
| 5 | Personal email domain | Email from james@gmail.com | No action (not public sector) | — |
| 6 | Corporate non-public | Email from sales@vendor.com | No action (not public sector) | — |
| 7 | Company association | New contact from john@surrey.police.uk | Linked to Surrey Police company | G-005 |
| 8 | Emails record updated | New contact created | Emails.hubspot_contact_id populated | G-011 |

### WF3: Waiting-For Tracker Tests

| # | Scenario | Input | Expected Output | Guardrail |
|---|----------|-------|-----------------|-----------|
| 1 | Explicit question sent | Sent email with "Could you confirm...?" | status = waiting_for_reply | — |
| 2 | Request pattern sent | Sent email with "Please let me know..." | status = waiting_for_reply | — |
| 3 | Forward expectation | Sent email with "Looking forward to hearing from you" | status = waiting_for_reply | — |
| 4 | Thank you only | Sent email with "Thanks for the update" (no request) | status = sent (no waiting) | — |
| 5 | Overdue item (4 days) | Waiting item, waiting_since = 4 days ago | Follow-up draft generated | — |
| 6 | Not yet overdue (2 days) | Waiting item, waiting_since = 2 days ago | No follow-up draft | — |
| 7 | Follow-up message quality | Overdue item | Draft < 75 words, has CTA | G-012, G-015 |

### Classification Tests

| # | Scenario | Input | Expected Output | Guardrail |
|---|----------|-------|-----------------|-----------|
| 1 | Police sender | Email from *.police.uk | priority = Urgent | G-005 |
| 2 | Open deal context | Sender has open deal in HubSpot | priority boosted | — |
| 3 | Newsletter | Email with "unsubscribe" link | category = FYI/Archive | — |
| 4 | Direct question | Email containing "?" requesting action | priority = Today | — |
| 5 | Time-sensitive | Email with "urgent", "ASAP", "deadline" | priority = Urgent | — |

### Draft Quality Tests

| # | Scenario | Input | Expected Output | Guardrail |
|---|----------|-------|-----------------|-----------|
| 1 | Structure compliance | Any draft | Hook → Bridge → Value → CTA | G-015 |
| 2 | No commodity pitch | Any draft | Does NOT start with "we have candidates" | G-012 |
| 3 | Word count | Any draft | < 150 words | — |
| 4 | Clear CTA | Any draft | Ends with actionable request | G-015 |

### Integration Tests (End-to-End)

| # | Scenario | Flow | Expected Outcome |
|---|----------|------|------------------|
| 1 | Email ingestion | Outlook → Make.com → Airtable | Email appears in Email_Raw within 15 min |
| 2 | Full classification | Email received → n8n WF1 → classified | Emails table populated with priority |
| 3 | Draft creation | Classification + draft → Make.com → Outlook | Draft appears in Outlook Drafts folder |
| 4 | Email archival | User archives email → Make.com → Outlook | Email moved to Archive folder |
| 5 | Decay scan to dashboard | WF4 runs → API endpoint → Dashboard | Decay panels show alerts |

### Dashboard UX Tests

| # | Scenario | Expected Behaviour |
|---|----------|-------------------|
| 1 | Focus Mode limit | Shows exactly 5 emails (not more) |
| 2 | Progress indicator | Updates as items processed (1 of 5, 2 of 5...) |
| 3 | Completion celebration | "Done!" message after 5 processed |
| 4 | Decay panel sorting | Red items always above orange, orange above yellow |
| 5 | Empty state | Shows celebration message when no items |
| 6 | Keyboard navigation | J/K moves selection in all sections |
| 7 | Section switching | 1/2/3/4 keys switch between tabs |
| 8 | Snooze functionality | Snoozed items hidden for specified duration |

### Performance Benchmarks

| Test | Target | Measurement |
|------|--------|-------------|
| Email classification latency | <200ms | Time from trigger to Airtable update |
| Decay scan duration | <60s for 100 contacts | Full WF4 execution time |
| Dashboard initial load | <2s | Time to first meaningful paint |
| API response time | <500ms | /api/decay, /api/waiting-for endpoints |

---

## 13. Guardrails

| ID | Rule | Applied |
|----|------|---------|
| G-001 | Dumb Scrapers + Smart Agents | Make.com syncs raw, n8n classifies |
| G-002 | Command Queue for Email Actions | Email_Actions table is the queue |
| G-005 | Fuzzy JS Matching Before AI | Force pattern match before classification |
| G-012 | Value Proposition First | Drafts follow SALES-STRATEGY.md |
| G-014 | Contact the Problem Owner | Contact lookup uses problem owner logic |

---

## 14. Make.com Scenarios (Verified 23 Jan 2026)

### Microsoft OAuth Status: ✅ VERIFIED

| Connection | ID | Status |
|------------|-----|--------|
| My Microsoft connection | 6957096 | Active |
| V3 - Peel Solutions | 13210516 | Active |
| V4 | 13211124 | Active |

### Scenarios to Reactivate

| ID | Scenario Name | Purpose | Current Status |
|----|---------------|---------|----------------|
| 8287614 | Email Triage – Queue to Airtable | Sync emails | Inactive (reactivate) |
| 8281903 | Email Triage v3 – n8n Bridge | Trigger n8n | Inactive (reactivate) |
| 8260100 | Agent Tool – Draft Reply | Create Outlook drafts | Inactive (reactivate) |
| 8260117 | Agent Tool – Move Email | Move to folders | Inactive (reactivate) |
| 8260098 | Agent Tool – List Folder Emails | Fetch folder emails | Active |
| 8271736 | Agent Tool – Search Emails | Search emails | Active |

### Other Verified Connections

| Connection | Purpose | Status |
|------------|---------|--------|
| HubSpot CRM (7027325) | Contact/deal enrichment | Active |
| MAKE PAT Airtable (13289916) | Email queue storage | Active |
| OpenAI | AI classification | Active |

---

## 15. n8n V1 Workflows Reference

These V1 workflows exist (archived) and can inform implementation:

| Workflow | ID | Notes |
|----------|-----|-------|
| MI: Agent: Email Review (AI) | OtfcoruU1tnnGySV | 46 nodes, 3 agents |
| MI: Action: Create Outlook Draft | jU7LUo9GjT22B2IM | HTTP → Make.com → Outlook |
| MI: Cleanup: Email Retention | 07emYAEGyg5tr3fl | Weekly cleanup |
| MI: Action: Move Email to Folder | rh4VP47h71ffEiWg | Email mover pattern |

**V1 Failure Point**: Airtable upsert missing email_id on item 10 of 1000. **Fix**: Add null check before upsert.

---

## 16. References

- `prompts/email-triage.md` — Classification prompt
- `docs/SALES-STRATEGY.md` — Message structure requirements
- `skills/adhd-interface-design` — Focus Mode patterns
- Decision A11 — V1 vision reprioritisation (relationship decay)
- `/Users/jamesjeram/.claude/plans/email-agent-research.md` — Full research document

---

*This spec is ready for implementation when Phase 1e is complete and Make.com OAuth is validated.*
