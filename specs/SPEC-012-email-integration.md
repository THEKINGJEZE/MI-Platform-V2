# SPEC-012: Email Integration + Relationship Decay Alerts

**Status**: Spec Written (Pending Phase 1d completion)
**Phase**: 2a
**Priority**: P1 — After Phase 1d monitoring passes
**Depends On**: Phase 1d complete, Make.com OAuth valid ✅
**Created**: 23 January 2026
**Updated**: 23 January 2026 — Schema updated to Option D (2 tables)

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

### Logic

Daily scan for contacts where:
- `last_contact_date` > 14 days AND
- Contact has `relationship_status` = Active or Warming AND
- No recent outreach in pipeline

### Decay Thresholds

| Days Since Contact | Status | Action |
|--------------------|--------|--------|
| 0-14 | Active | No alert |
| 15-30 | Warming | Yellow alert, suggest touchpoint |
| 31-45 | Cold | Orange alert, stronger prompt |
| 45+ | At-Risk | Red alert, urgent re-engagement |

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
│  RELATIONSHIPS NEED ATTENTION                           4 items  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🟠 32 days  Sarah Chen (Kent)                                  │
│              Suggestion: "Congratulate on the training launch   │
│              you saw on LinkedIn last week"                     │
│              [Draft Touchpoint] [Snooze 7 days] [Mark Contacted]│
│                                                                 │
│  🟡 18 days  John Smith (Met)                                   │
│              Suggestion: "Share HMICFRS report on disclosure    │
│              backlogs — relevant to their situation"            │
│              [Draft Touchpoint] [Snooze 7 days] [Mark Contacted]│
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

**Flow**:
1. Query Contacts where:
   - `last_contact_date` < TODAY() - 14
   - `relationship_status` IN (Active, Warming)
2. For each decaying contact:
   - Calculate decay severity
   - Generate touchpoint suggestion (non-salesy)
   - Update `next_touchpoint_suggestion`
   - Update `relationship_status` if threshold crossed
   - If > 30 days: Set `decay_alert_sent` = NOW()

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

- [ ] Add schema fields to Contacts
- [ ] Create `MI: Relationship Decay Scanner` workflow
- [ ] Implement decay thresholds
- [ ] AI touchpoint suggestions (non-salesy)
- [ ] Dashboard "Relationships Need Attention" section

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

### Classification Tests

1. **Police sender** → Should be Urgent
2. **Open deal context** → Should boost priority
3. **Newsletter** → Should be FYI/Archive
4. **Direct question** → Should be Today
5. **Time-sensitive language** → Should be Urgent

### Draft Quality Tests

1. Draft follows Hook → Bridge → Value → CTA structure
2. Draft doesn't lead with "we have candidates"
3. Draft is under 150 words
4. Draft ends with clear CTA

### Integration Tests

1. Outlook email → Make.com → Airtable (within 15 min)
2. Classification → Draft → Outlook draft created
3. Skip email → Moves to @Review folder
4. Archive email → Moves to Archive folder

### ADHD UX Tests

1. Focus Mode shows exactly 5 emails
2. Progress indicator updates correctly
3. Celebration appears after 5 processed
4. "Show More" reveals next batch (max 10)
5. Skip count increments, auto-archives at 3

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
