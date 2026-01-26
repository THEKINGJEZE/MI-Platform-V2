# Context Brief: Clawdbot Email Processor

Generated: 26 January 2026
For: Spec drafting (see .claude/rules/spec-creation.md)

---

## Current State

**Phase**: 1d + 2a (Parallel)
**Goal**: Clawdbot Email Processor (SPEC-014) — primary approach for Phase 2a email integration
**Blockers**: None

---

## Acceptance Criteria (from ROADMAP.md Phase 2a)

- [ ] Email ingestion from Outlook working
- [ ] Email classification working (lead response, opportunity, etc.)
- [ ] Draft responses generated for emails needing reply
- [ ] Email queue in dashboard
- [ ] Can send response from dashboard
- [ ] Relationship decay tracking active (daily scan)
- [ ] Dashboard shows "Relationships Need Attention" section
- [ ] AI-suggested touchpoints for cold contacts

---

## Existing Assets

### Prompts (can extend or reference)
- `prompts/email-triage.md` — Classification with Urgent/Today/Week/FYI/Archive priorities, HubSpot boost rule
- `prompts/relationship-touchpoint.md` — AI touchpoint suggestions for cold contacts

### Schemas (from SPEC-012)
- **Email_Raw**: message_id, thread_id, sender_email, sender_name, subject, body_preview, received_at, has_attachments, importance, synced_at, processed
- **Emails**: email_raw (link), classification, priority, action_type, target_folder, key_request, draft_response, confidence, contact (link), status, processed_at, human_decision, sent_at, skip_reason

### Plans
- `~/ClawdbotFiles/plans/CLAWDBOT-EMAIL-PROCESSOR-PLAN.md` — Full approved architecture, security, credentials

### Existing Spec (fallback)
- `specs/SPEC-012-email-integration.md` — n8n approach (fallback), contains schema definitions

---

## Applicable Guardrails

| ID | Rule | Relevance |
|----|------|-----------|
| G-002 | Command Queue for Email Actions | AI writes to Emails table, executor performs Outlook ops |
| G-006 | Never Direct Outlook Integration | Sync to Airtable first, process, write actions to queue |
| G-001 | Dumb Scrapers + Smart Agents | Raw emails to Email_Raw first, AI to Emails table |
| G-012 | Value Proposition First | Drafts must lead with Peel's value proposition |
| G-015 | Message Structure (Hook → Bridge → Value → CTA) | AI drafts follow four-part structure |

---

## Recent Decisions

| Decision | Date | Impact |
|----------|------|--------|
| I5: Clawdbot Replaces n8n AI | 26 Jan 2026 | Primary architecture for SPEC-014 |
| I4: Include Closed Won in Decay | 26 Jan 2026 | Two-tier thresholds (active: 8/15/30d, clients: 30/60/90d) |
| I1: HubSpot as Primary Data Source | 26 Jan 2026 | Use HubSpot for engagement data |

---

## Clawdbot Architecture

```
Outlook → Make.com → Airtable (Email_Raw)
                          │
                     CLAWDBOT (cron + curl every 3h)
                          │
          1. Read emails via Airtable API
          2. Look up sender in HubSpot (read-only)
          3. Classify with Opus 4.5 + context
          4. Draft responses
          5. Write back to Airtable
          6. WhatsApp James if uncertain
                          │
                AIRTABLE (Emails table)
                          │
                N8N EXECUTOR (simple, no AI)
                          │
                MAKE.COM → OUTLOOK
```

### Security Layers
1. **Scoped Airtable token**: Read Email_Raw, Contacts, Forces; Write Emails only
2. **Read-only HubSpot token**: crm.objects.*.read ONLY
3. **Sub-agent isolation**: Web research delegated to tool-restricted sub-agents
4. **Prompt hardening**: All external content treated as untrusted
5. **Human review**: No email sent without approval

### What Clawdbot Replaces
- WF1: Email Classifier → Clawdbot skill
- WF2: Email Drafter → Clawdbot skill
- WF4: Decay Scanner → Clawdbot cron

### What Stays in n8n
- WF3: Waiting-For Tracker (simple pattern matching)
- WF5: Contact Auto-Creator (simple domain check)
- Email Executor (dumb pipe: Airtable → Make.com)

---

## Notes for Spec Creation

- Clawdbot skill goes in `~/ClawdbotFiles/skills/email-processor/`
- Spec output goes in `specs/SPEC-014-clawdbot-email-processor.md`
- Keep spec under 200 lines
- Include Pre-Flight Checklist section per specs/README.md
