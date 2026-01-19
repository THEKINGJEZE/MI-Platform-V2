# SPEC-006: Monday Review Experience

**Status**: Ready for implementation  
**Phase**: 1 — Core Jobs Pipeline  
**Source of Truth**: `peel-solutions-mi-platform-strategy.md` Section 11 (Dashboard Design), Section 16 (Operational Procedures)

---

## 1. Overview

**Goal**: Enable James to review and send 3-5 outreach messages in ≤15 minutes every Monday morning.

**Expected Outcome**: An Airtable Interface that presents ready opportunities with draft messages, allowing single-click actions to send, edit, or skip — then moves to the next opportunity automatically.

**Why Airtable Interface**: Phase 1 prioritises speed-to-value over custom UI. Airtable Interfaces provide:
- Zero custom code to maintain
- Native filtering/sorting on Airtable data
- Button actions that trigger n8n webhooks
- Mobile access for on-the-go review

Custom dashboard (per strategy Section 11) is a Phase 2 enhancement once the core pipeline is validated.

---

## 2. Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                       MONDAY REVIEW DATA FLOW                            │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────────┐                                                    │
│   │ Airtable        │                                                    │
│   │ Interface       │                                                    │
│   │ "Monday Review" │                                                    │
│   └────────┬────────┘                                                    │
│            │                                                             │
│   ┌────────▼────────┐    ┌─────────────────┐    ┌─────────────────┐     │
│   │ Opportunities   │───▶│ Filter:         │───▶│ Sort:           │     │
│   │ Table           │    │ status = ready  │    │ priority_score  │     │
│   └─────────────────┘    │ OR status = hot │    │ DESC            │     │
│                          └─────────────────┘    └─────────────────┘     │
│                                                                          │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │                    USER ACTIONS                                   │  │
│   ├──────────────┬──────────────┬──────────────┬────────────────────┤  │
│   │ ✏️ Edit      │ 📧 Send      │ 💼 LinkedIn  │ ⏭️ Skip           │  │
│   │ (inline)     │ (webhook)    │ (copy+open)  │ (webhook)          │  │
│   └──────────────┴──────────────┴──────────────┴────────────────────┘  │
│            │                │              │              │             │
│            │                ▼              ▼              ▼             │
│            │    ┌─────────────────────────────────────────────┐        │
│            │    │           WF6: Send Outreach                │        │
│            │    │    (n8n webhook → email/status update)      │        │
│            │    └─────────────────────────────────────────────┘        │
│            │                         │                                  │
│            ▼                         ▼                                  │
│   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    │
│   │ Airtable        │    │ Outlook         │    │ HubSpot         │    │
│   │ (status update) │    │ (send email)    │    │ (log activity)  │    │
│   └─────────────────┘    └─────────────────┘    └─────────────────┘    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

**User Flow**:
1. James opens Airtable Interface on Monday morning
2. Sees greeting + count: "You have 5 opportunities ready. Estimated time: 12 minutes."
3. Reviews each opportunity card (Why Now, Contact, Message)
4. Takes action: Edit message → Send Email → Next
5. Repeats until queue empty
6. System shows "All done! 🎉"

---

## 3. Airtable Interface Specification

### Interface: "Monday Review"

**Type**: Record review layout (Gallery or List view)

**Data Source**: `Opportunities` table filtered to:
```
OR(
  {status} = "ready",
  {priority_tier} = "hot"
)
```

**Sort Order**: 
1. `priority_tier` = "hot" first
2. Then by `priority_score` descending

### Sections

**Section 1: Summary Header**
- Record count matching filter
- Estimated time (count × 2.5 min)

**Section 2: Hot Leads** (if any)
- Filter: `priority_tier = "hot"`
- Visual: Red/orange accent
- Badge: "🔥 COMPETITOR INTERCEPT" or "🔥 HOT"

**Section 3: Ready to Send**
- Filter: `status = "ready"` AND `priority_tier != "hot"`
- Standard card display

### Opportunity Card Layout

| Element | Field | Notes |
|---------|-------|-------|
| **Header** | `Force Name` (from linked Forces) | Large, prominent |
| **Badge Row** | `priority_tier`, `outreach_channel`, `signal_count` | Visual badges |
| **Why Now** | `why_now` | 2-3 sentences, the hook |
| **Contact** | `contact.name`, `contact.role`, `contact.email` | From linked contact |
| **Message** | `outreach_draft` | Editable long text field |
| **Subject** | `subject_line` | Editable (for email channel) |
| **Actions** | Buttons (see below) | Horizontal button row |

### Button Actions

| Button | Label | Action | Condition |
|--------|-------|--------|-----------|
| Edit | ✏️ Edit | Inline edit of `outreach_draft` | Always shown |
| Send Email | 📧 Send | Trigger webhook → WF6 | `outreach_channel = email` |
| LinkedIn | 💼 LinkedIn | Copy message + open URL | `outreach_channel = linkedin` |
| Skip | ⏭️ Skip | Trigger webhook → update status | Always shown |

---

## 4. Tables

**Reads from**:
- `Opportunities` table (`tblJgZuI3LM2Az5id`)
- `Forces` table (`tblbAjBEdpv42Smpw`) — linked via `force` field
- `Contacts` table (`tbl0u9vy71jmyaDx1`) — linked via `contact` field

**Writes to**:
- `Opportunities` table — status updates, sent timestamps
- HubSpot — email activity logging (via WF6)

### Opportunity Fields Used

| Field | Type | Purpose in Review |
|-------|------|-------------------|
| `status` | Single Select | Filter (ready/hot) + update on action |
| `priority_tier` | Single Select | Sort order, visual badge |
| `priority_score` | Number | Secondary sort |
| `why_now` | Long Text | Display — the narrative hook |
| `outreach_draft` | Long Text | Display + Edit — the message |
| `subject_line` | Single Line | Display + Edit — email subject |
| `outreach_channel` | Single Select | Determines which send button shows |
| `contact` | Link to Contacts | Display contact details |
| `force` | Link to Forces | Display force name |
| `is_competitor_intercept` | Checkbox | Hot lead badge logic |
| `last_contact_date` | Date | Updated on send |
| `sent_at` | Date | Populated on send |
| `skipped_reason` | Single Line | Populated on skip |

### Status Transitions (from Monday Review)

| From | Action | To | Notes |
|------|--------|-----|-------|
| `ready` | Send Email | `sent` | + populate `sent_at`, `last_contact_date` |
| `ready` | LinkedIn | `sent` | + populate `sent_at`, manual send |
| `ready` | Skip | `skipped` | + populate `skipped_reason` (optional) |
| `hot` | Send Email | `sent` | Same as ready |
| `hot` | Skip | `skipped` | Hot leads can be skipped too |

---

## 5. Workflows

### Workflow: `MI: Send Outreach` (WF6)

**Trigger**: Webhook from Airtable Interface button

**Webhook Path**: `/webhook/send-outreach`

**Payload** (from Airtable button):
```json
{
  "opportunity_id": "recXXXXXX",
  "action": "send_email" | "send_linkedin" | "skip",
  "skip_reason": "optional reason"
}
```

#### Node 1: Receive Webhook

**Type**: Webhook

```json
{
  "path": "send-outreach",
  "webhookId": "send-outreach-001",
  "responseMode": "onReceived"
}
```

Return immediate 200 OK (action processes async).

#### Node 2: Fetch Opportunity Details

**Type**: HTTP Request (Airtable API)

```
GET https://api.airtable.com/v0/{{baseId}}/Opportunities/{{opportunity_id}}
```

Include linked records for contact and force.

#### Node 3: Route by Action

**Type**: Switch

| Route | Condition | Next Node |
|-------|-----------|-----------|
| Send Email | `action = "send_email"` | Node 4a |
| Send LinkedIn | `action = "send_linkedin"` | Node 4b |
| Skip | `action = "skip"` | Node 4c |

#### Node 4a: Send Email via Outlook

**Type**: HTTP Request (Microsoft Graph API)

Per strategy Section 10 (Workflow 4.2):

```
POST https://graph.microsoft.com/v1.0/me/sendMail
Headers:
  Authorization: Bearer {{$credentials.outlook}}
  Content-Type: application/json
Body: {
  "message": {
    "subject": "{{subject_line}}",
    "body": {
      "contentType": "Text",
      "content": "{{outreach_draft}}\n\nBest regards,\nJames"
    },
    "toRecipients": [{
      "emailAddress": {
        "address": "{{contact_email}}"
      }
    }]
  },
  "saveToSentItems": true
}
```

On success → Node 5 (Update Opportunity)

#### Node 4b: Handle LinkedIn Send

**Type**: Code

LinkedIn sends are manual (copy message, open URL). This node:
1. Logs the action
2. Proceeds to status update

```javascript
// LinkedIn is manual — user already copied message
// Just update status and log
return {
  json: {
    action: 'send_linkedin',
    status: 'sent',
    sent_at: new Date().toISOString(),
    note: 'LinkedIn message copied, manual send'
  }
};
```

→ Node 5 (Update Opportunity)

#### Node 4c: Handle Skip

**Type**: Code

```javascript
return {
  json: {
    action: 'skip',
    status: 'skipped',
    skipped_at: new Date().toISOString(),
    skipped_reason: $input.item.json.skip_reason || 'No reason provided'
  }
};
```

→ Node 5 (Update Opportunity)

#### Node 5: Update Opportunity **(G-011: upsert pattern)**

**Type**: HTTP Request (Airtable API)

```
PATCH https://api.airtable.com/v0/{{baseId}}/Opportunities/{{opportunity_id}}
Headers:
  Authorization: Bearer {{$credentials.airtable}}
  Content-Type: application/json
Body: {
  "fields": {
    "status": "{{status}}",
    "sent_at": "{{sent_at}}",
    "last_contact_date": "{{sent_at}}",
    "skipped_reason": "{{skipped_reason}}"
  }
}
```

Conditional fields — only include what's relevant to the action.

#### Node 6: Log to HubSpot (Email Only)

**Type**: IF + HTTP Request (HubSpot API)

**Condition**: `action = "send_email"`

Per strategy: "Create HubSpot activity (email sent)"

```
POST https://api.hubapi.com/crm/v3/objects/emails
Headers:
  Authorization: Bearer {{$credentials.hubspot}}
  Content-Type: application/json
Body: {
  "properties": {
    "hs_timestamp": "{{sent_at}}",
    "hubspot_owner_id": "{{owner_id}}",
    "hs_email_direction": "EMAIL",
    "hs_email_status": "SENT",
    "hs_email_subject": "{{subject_line}}",
    "hs_email_text": "{{outreach_draft}}"
  },
  "associations": [{
    "to": {"id": "{{contact_hubspot_id}}"},
    "types": [{"associationCategory": "HUBSPOT_DEFINED", "associationTypeId": 9}]
  }]
}
```

#### Node 7: Log Completion

**Type**: Code

```javascript
console.log('Send Outreach completed:', {
  opportunity_id: $input.item.json.opportunity_id,
  action: $input.item.json.action,
  status: $input.item.json.status,
  timestamp: new Date().toISOString()
});
```

---

## 6. Testing Plan

| Test | Setup | Method | Expected Result |
|------|-------|--------|-----------------|
| Filter shows ready only | Create opps with various statuses | Open Interface | Only `ready` and `hot` visible |
| Hot leads first | Create 1 hot, 2 ready opps | Open Interface | Hot lead at top |
| Send email works | Ready opp with email contact | Click Send Email | Email sent, status=sent, HubSpot logged |
| LinkedIn flow | Ready opp with LinkedIn channel | Click LinkedIn | Message copied, URL opens, status=sent |
| Skip works | Ready opp | Click Skip | Status=skipped, reason saved |
| Edit persists | Ready opp | Edit message, send | Edited message sent (not original) |
| Queue empties | Process all ready opps | Send/skip all | "All done" state shown |
| Time target | 5 ready opps | Time full review | ≤15 minutes |

---

## 7. Acceptance Criteria

From ROADMAP.md Phase 1:

- [ ] Can review opportunity and mark as sent
- [ ] Review interface shows ready opportunities
- [ ] Hot leads visually distinguished and shown first
- [ ] Each opportunity shows: force, contact, why now, draft message
- [ ] Can edit draft message before sending
- [ ] Send Email triggers actual email via Outlook
- [ ] LinkedIn option copies message and opens compose
- [ ] Skip option moves opportunity out of queue
- [ ] Status updates correctly on each action
- [ ] HubSpot activity logged on email send
- [ ] Full review of 5 opportunities takes ≤15 minutes

From ANCHOR.md (immutable success criteria):

- [ ] Monday review time ≤15 minutes
- [ ] System feels like "review and send"
- [ ] Human confirms, system decides
- [ ] ≤3 decisions per lead (review → edit? → send)

---

## 8. Build Sequence

1. **Verify prerequisites**
   - Opportunities exist with `status=ready`
   - Contacts linked with email addresses
   - Outlook API credentials in n8n
   - HubSpot API credentials in n8n

2. **Create Airtable Interface**
   - New Interface: "Monday Review"
   - Configure Gallery/List layout
   - Set filter: `status = ready OR priority_tier = hot`
   - Set sort: priority_tier, priority_score DESC
   - Configure card fields per spec
   - Add button fields (if not exists)

3. **Create button fields in Opportunities table**
   - `btn_send_email` — Button type, URL action to webhook
   - `btn_linkedin` — Button type, URL action (LinkedIn compose + copy)
   - `btn_skip` — Button type, URL action to webhook

4. **Build WF6: Send Outreach**
   - Webhook trigger
   - Fetch opportunity
   - Route by action
   - Email send (Outlook)
   - LinkedIn handler
   - Skip handler
   - Update opportunity
   - HubSpot logging
   - Completion logging

5. **Test incrementally**
   - Test webhook receives payload
   - Test Outlook email send
   - Test Airtable status update
   - Test HubSpot activity creation
   - Test full flow from Interface button

6. **Validate time target**
   - Create 5 test opportunities
   - Time full review cycle
   - Must be ≤15 minutes

---

## 9. Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| SPEC-005: Opportunity Enricher | ✅ Complete | Creates ready opportunities |
| Opportunities with status=ready | ⚠️ Verify | Need test data |
| Outlook API credentials | ⚠️ Verify | Microsoft Graph API |
| HubSpot API credentials | ✅ Configured | For activity logging |
| Airtable Interface feature | ✅ Available | Part of Airtable Pro |

---

## 10. Guardrails Compliance

| Guardrail | Applicable | Implementation |
|-----------|------------|----------------|
| G-002: Command Queue for Emails | **Yes** | ✅ Human clicks Send → webhook → email |
| G-006: Never Direct Outlook Integration | **Yes** | ✅ Goes through n8n, not direct |
| G-007: No CLI Agents | Yes | ✅ Using n8n workflow |
| G-011: Upsert Only | Yes | ✅ PATCH updates, no delete |

**Critical G-002 compliance**: The system never sends email without explicit human action. James must click "Send Email" for each opportunity. This is the "human confirms, system decides" principle from ANCHOR.md.

---

## 11. Files to Create/Update

| File | Action |
|------|--------|
| Airtable Interface "Monday Review" | Create in Airtable UI |
| `n8n/workflows/send-outreach.json` | Create — WF6 workflow export |
| `ROADMAP.md` | Update — check off acceptance criteria |
| `STATUS.md` | Update — mark SPEC-006 complete |

---

## 12. Out of Scope (Phase 2+)

- Custom React dashboard (strategy Section 11 full design)
- Undo buffer (30-second expiry on destructive actions)
- Keyboard shortcuts
- Batch actions (send multiple at once)
- Analytics/metrics display in review UI
- Email templates library
- A/B testing of message variants

---

## 13. Implementation Notes

### Airtable Button Configuration

Airtable buttons can trigger webhooks via URL formula. Configure each button:

**Send Email button**:
```
"https://your-n8n-url/webhook/send-outreach?opportunity_id=" & RECORD_ID() & "&action=send_email"
```

**Skip button**:
```
"https://your-n8n-url/webhook/send-outreach?opportunity_id=" & RECORD_ID() & "&action=skip"
```

**LinkedIn button** (more complex — needs to copy + redirect):
Since Airtable buttons can't copy to clipboard, use a two-step approach:
1. Show message in a prominent field for manual copy
2. Button opens LinkedIn compose URL:
```
"https://www.linkedin.com/messaging/compose/?recipient=" & {contact_linkedin_id}
```

Alternative: Use Airtable Automation to handle LinkedIn flow.

### Outlook API Setup

Requires Microsoft Graph API with `Mail.Send` permission:
1. Register app in Azure AD
2. Grant `Mail.Send` delegated permission
3. Configure OAuth2 credentials in n8n
4. Use refresh token flow for persistent access

### HubSpot Email Logging

The HubSpot email engagement endpoint requires:
- `hs_timestamp` — when email was sent
- `hubspot_owner_id` — who sent it (James's HubSpot user ID)
- Association to contact record

If contact doesn't have `hubspot_id`, skip HubSpot logging (log warning).

---

## Handoff to Claude Code

**Context**: Final Phase 1 workflow — the Monday review experience

**Key references**:
- Table IDs in NEXT-CONTEXT.md
- Airtable rules: `.claude/rules/airtable.md`
- n8n rules: `.claude/rules/n8n.md`
- Outlook API: Microsoft Graph `/me/sendMail`
- HubSpot API: `/crm/v3/objects/emails`

**Workflow naming**: `MI: Send Outreach`

**On completion**:
- Update STATUS.md
- Verify full flow: Interface → Button → Webhook → Email/Update
- Time test with 5 opportunities (must be ≤15 min)
- Confirm HubSpot activity appears
- James does first real Monday review

**Phase 1 completion gate**: After SPEC-006 is validated, Phase 1 acceptance criteria should be fully met. Trigger strategic verification in Chat before marking Phase 1 complete.
