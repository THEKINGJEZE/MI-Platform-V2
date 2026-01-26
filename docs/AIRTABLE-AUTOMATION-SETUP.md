# Airtable Automation Setup: Email Executor Trigger

**Created**: 26 January 2026
**Purpose**: Automatically trigger n8n Email Executor when Emails table status changes

---

## Overview

The n8n Email Executor workflow (`PWy1PYwJ24Me0LV7`) bridges Airtable to Make.com for email actions. It needs to be triggered automatically when:
- Status changes to `approved` (create draft in Outlook)
- Status changes to `sent` (send the email)
- Status changes to `archived` (move to archive folder)

Airtable Automations cannot be created via API — they must be configured in the Airtable UI.

---

## Webhook URL

```
https://n8n.srv1190997.hstgr.cloud/webhook/email-executor
```

**Method**: GET
**Query Parameters**:
- `record_id` — Airtable record ID (e.g., `rec09pIEiFMi3Zyrp`)
- `status` — New status value (e.g., `approved`, `sent`, `archived`)
- `previous_status` — Previous status value (e.g., `pending`, `approved`)

**Example**:
```
https://n8n.srv1190997.hstgr.cloud/webhook/email-executor?record_id=recXXX&status=approved&previous_status=pending
```

---

## Setup Instructions

### Step 1: Open Airtable Automations

1. Go to **MI Platform** base: `https://airtable.com/appEEWaGtGUwOyOhm`
2. Click the **Automations** button in the top bar
3. Click **Create automation**

### Step 2: Create Trigger

1. **Trigger type**: "When a record matches conditions"
2. **Table**: Emails (`tblaeAuzLbmzW8ktJ`)
3. **View**: (select a view that includes all records, or leave blank)
4. **Conditions**:
   - Field: `status`
   - Condition: "is any of"
   - Values: `approved`, `sent`, `archived`

5. **Watch field**: Check "When record enters view" AND "When record is updated"

### Step 3: Create Action - Send Webhook

1. Click **Add action**
2. **Action type**: "Send a webhook"
3. **URL**:
   ```
   https://n8n.srv1190997.hstgr.cloud/webhook/email-executor
   ```
4. **Method**: GET
5. **Query parameters** (click "Add query parameter"):

   | Parameter | Value |
   |-----------|-------|
   | `record_id` | `{Record ID}` (use the Airtable dynamic field picker) |
   | `status` | `{status}` (use the dynamic field picker) |
   | `previous_status` | (see note below) |

### Note: Previous Status Tracking

Airtable doesn't natively track the previous value of a field. Options:

**Option A (Simple)**: Don't send `previous_status` — n8n will infer action from current status:
- `approved` → create_draft
- `sent` → send_email (but this needs `previous_status=approved` currently)
- `archived` → archive

**Option B (Recommended)**: Add a `previous_status` field to Emails table:
1. Add a new field: `previous_status` (Single line text or Single select)
2. Before changing status, copy current status to `previous_status`
3. Then change status
4. Automation sends both values

**Option C**: Modify n8n workflow to not require `previous_status`:
- `approved` → always create_draft
- `sent` → always send_email
- `archived` → always archive

### Step 4: Test the Automation

1. Click **Test automation**
2. Select a record with status = `approved`
3. Check n8n executions for the Email Executor workflow
4. Verify the webhook was received correctly

### Step 5: Activate

1. Click **Turn on automation** in the top right
2. Verify it's active (green indicator)

---

## Alternative: Multiple Automations

Create 3 separate automations for cleaner logic:

### Automation 1: Create Draft
- **Trigger**: status = `approved`
- **Action**: Webhook with `status=approved&previous_status=pending`

### Automation 2: Send Email
- **Trigger**: status = `sent`
- **Action**: Webhook with `status=sent&previous_status=approved`

### Automation 3: Archive
- **Trigger**: status = `archived`
- **Action**: Webhook with `status=archived&previous_status=approved`

---

## Verifying the Setup

After activating, test by:

1. Change an Emails record status to `approved`
2. Check n8n execution log for `PWy1PYwJ24Me0LV7`
3. Verify Make.com received the webhook (check scenario 8260100 for draft creation)
4. Check Outlook for the draft

---

## Current n8n Workflow Logic

The Email Executor (`PWy1PYwJ24Me0LV7`) determines action based on status + previous_status:

```javascript
if (status === 'approved' && previousStatus === 'pending') {
  action = 'create_draft';
} else if (status === 'sent' && previousStatus === 'approved') {
  action = 'send_email';
} else if (status === 'archived') {
  action = 'archive';
}
```

If the logic needs simplification (e.g., just use current status), update the workflow.

---

## Related Files

- n8n workflow: `n8n/workflows/email-executor.json`
- n8n workflow ID: `PWy1PYwJ24Me0LV7`
- Make.com scenarios: 8260100 (Create Draft), 8260117 (Archive)
- Emails table: `tblaeAuzLbmzW8ktJ`

---

*Automation must be configured manually in Airtable UI — no API available.*
