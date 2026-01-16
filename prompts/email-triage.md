# Email Triage Prompt

## Purpose
Classify incoming emails for priority, action type, and folder routing.
Used in email review agent workflows.

## Model
`gpt-4o-mini` (or Claude equivalent)

## Source
Extracted from MI-Platform-Fresh-Start `email-review-agent.json`

---

## System Message

```
You classify emails for Peel Solutions (UK police sector consulting). Return JSON only.
```

---

## User Prompt Template

```
Classify this email for Peel Solutions (UK police sector). Use JSON.

Email:
From Name: {{ $json.fromName }}
From Email: {{ $json.fromEmail }}
Subject: {{ $json.subject }}
Body Preview: {{ $json.bodyPreview }}
Police Sender: {{ $json.policeSender }}
HubSpot Contact ID: {{ $json.hubspotContactId }}
Has Open Deal: {{ $json.hasOpenDeal }}

Return JSON only with keys:
priority, action_type, target_folder, key_request, create_outlook_draft, draft_response, confidence, reasoning.
```

---

## Priority Rules

| Priority | Indicator | Visual | Description |
|----------|-----------|--------|-------------|
| **Urgent** | Red | 🔴 | Subject contains urgent/asap/deadline/today OR police sender OR time-sensitive request |
| **Today** | Yellow | 🟡 | Direct question/request that needs response soon |
| **This Week** | Green | 🟢 | Informational or follow-up that can wait a few days |
| **FYI** | White | ⚪ | Newsletters, notifications, noreply, unsubscribe, low value |

### HubSpot Boost Rule
- If `Has Open Deal` is `true`, boost priority up one level
- Example: "This Week" becomes "Today" if open deal exists

---

## Action Types

| Action | Description | When to Use |
|--------|-------------|-------------|
| **Reply** | Needs response from James | Questions, requests, invitations |
| **Forward** | Route to someone else | Not for James, relevant to team |
| **FYI** | Read but no action needed | Updates, confirmations, status |
| **Archive** | No value, can ignore | Marketing, spam, notifications |

---

## Target Folders

| Folder | Maps To | Description |
|--------|---------|-------------|
| **@Action** | Priority 🔴🟡 | Needs immediate attention |
| **@Review** | Priority 🟢 | Can review later this week |
| **Archive** | Priority ⚪ | Move out of inbox |

---

## Expected Output Schema

```json
{
  "priority": "🔴 Urgent",
  "action_type": "Reply",
  "target_folder": "@Action",
  "key_request": "Requesting proposal for disclosure team surge support",
  "create_outlook_draft": true,
  "draft_response": "Thank you for reaching out. I'll review the requirements and send a proposal by end of day...",
  "confidence": 90,
  "reasoning": "Police sender from Kent Police with direct request for services"
}
```

### Field Definitions

| Field | Type | Description |
|-------|------|-------------|
| `priority` | string | One of: 🔴 Urgent, 🟡 Today, 🟢 This Week, ⚪ FYI |
| `action_type` | string | One of: Reply, Forward, FYI, Archive |
| `target_folder` | string | One of: @Action, @Review, Archive |
| `key_request` | string | 1 concise sentence summarizing what's needed |
| `create_outlook_draft` | boolean | Only true if priority 🔴/🟡 AND action=Reply |
| `draft_response` | string\|null | Draft reply text if `create_outlook_draft` is true |
| `confidence` | number | 0-100 confidence in classification |
| `reasoning` | string | Brief explanation of decision |

---

## Draft Response Guidelines

When `create_outlook_draft` is true:

1. **Keep it short** — Under 80 words
2. **Professional but warm** — Match James's tone
3. **Include next step** — What happens next / when they'll hear back
4. **Don't commit to specifics** — James will review before sending

---

## Integration Notes

1. **Input source**: `Email_Raw_Archive` table (synced from Outlook)
2. **Output**: Write classification to same record + create `Email_Actions` command
3. **Executor**: Separate workflow creates Outlook draft from command
4. **Safety**: AI never sends directly — always creates draft for review (DEC-301)
