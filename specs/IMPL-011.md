# Implementation Tracker: SPEC-011

**Spec**: Agent-Based Opportunity Enrichment
**Started**: 2026-01-23
**Last Updated**: 2026-01-23
**Current Stage**: 1
**Status**: in_progress

## Progress

| Stage | Name | Status | Completed |
|-------|------|--------|-----------|
| 1 | Parse | 🔄 | - |
| 2 | Audit | ⬜ | - |
| 3 | Plan | ⬜ | - |
| 4 | Build | ⬜ | - |
| 5 | Verify | ⬜ | - |
| 6 | Document | ⬜ | - |

## Current State

**Working on**: Stage 1 - Parsing acceptance criteria from SPEC-011
**Blockers**: None
**Next action**: Complete parsing, await gate confirmation

## Stage Outputs

### Stage 1: Parse

**Acceptance Criteria Extracted** (from SPEC-011 Section 8):

1. [ ] Contact Research Agent correctly identifies problem owner vs HR
2. [ ] Contact Research Agent checks recent outreach and flags conflicts
3. [ ] Outreach Drafting Agent references all relevant signals
4. [ ] Messages follow Hook → Bridge → Value → CTA structure
5. [ ] Messages are under 100 words
6. [ ] Competitor names never appear in messages
7. [ ] Why Now summary accurately captures opportunity
8. [ ] End-to-end latency < 30 seconds
9. [ ] Cost per enrichment < $0.15

**Guardrails Applicable**:

| ID | Rule | How Applied |
|----|------|-------------|
| G-002 | Command Queue for Email Actions | Drafts go to Airtable, never send directly |
| G-007 | No CLI Agents (Use n8n) | Implement agents as n8n AI Agent nodes |
| G-011 | Upsert Only | Update opportunities, don't delete/recreate |
| G-012 | Value Proposition First | Messages lead with outcome-based delivery |
| G-013 | Competitor Signals Get P1 Priority | Handled upstream (SPEC-010), but agent must leverage |
| G-014 | Contact the Problem Owner | Core function of Contact Research Agent |
| G-015 | Message Structure (Hook → Bridge → Value → CTA) | Outreach Drafting Agent enforces this |

**Dependencies Identified**:

| Dependency | Type | Status |
|------------|------|--------|
| SPEC-010 (Pipeline Remediation) | Spec | ✅ Complete |
| Airtable `role_category` field | Schema | ✅ Exists (from SPEC-010) |
| Airtable `role_detail` field | Schema | ✅ Exists (from SPEC-010) |
| Airtable `why_now` field | Schema | ⬜ May need adding |
| Airtable `outreach_subject` field | Schema | ⬜ May need adding |
| Airtable `outreach_angle` field | Schema | ⬜ May need adding |
| Airtable `contact_confidence` field | Schema | ⬜ May need adding |
| HubSpot API access | External | ⬜ Needs verification |
| n8n AI Agent capability | Platform | ⬜ Needs verification |
| Prompts folder | Files | ✅ Exists |

**Files to Create** (from SPEC-011 Section 9):

| File | Purpose |
|------|---------|
| `prompts/contact-research-agent.md` | Contact Research Agent system prompt |
| `prompts/outreach-drafting-agent.md` | Outreach Drafting Agent system prompt |
| `n8n/workflows/wf5-agent-enrichment.json` | n8n workflow export |

**Architecture Summary**:

```
Trigger: Opportunity status = "researching"
    │
    ▼
┌─────────────────────────────────┐
│ Stage 1: Contact Research Agent │
│ - search_hubspot_contacts       │
│ - get_contact_history           │
│ - get_force_org_structure       │
│ - evaluate_contact_fit          │
└─────────────────────────────────┘
    │
    ▼ (contact_id or null)
    │
┌─────────────────────────────────┐
│ Stage 2: Outreach Drafting Agent│
│ - get_opportunity_signals       │
│ - get_previous_outreach         │
│ - get_force_context             │
│ - get_peel_services             │
│ - draft_message                 │
│ - critique_and_improve          │
└─────────────────────────────────┘
    │
    ▼
Update Opportunity:
 - contact, contact_confidence
 - outreach_draft, outreach_subject
 - outreach_angle, why_now
 - status = "ready" or "needs_contact"
```

### Stage 2: Audit
*Pending Stage 1 completion*

### Stage 3: Plan
*Pending Stage 2 completion*

### Stage 4: Build
*Pending Stage 3 completion*

### Stage 5: Verify
*Pending Stage 4 completion*

### Stage 6: Document
*Pending Stage 5 completion*
