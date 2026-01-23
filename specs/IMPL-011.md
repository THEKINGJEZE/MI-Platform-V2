# Implementation Tracker: SPEC-011

**Spec**: Agent-Based Opportunity Enrichment
**Started**: 2026-01-23
**Last Updated**: 2026-01-23
**Current Stage**: 1
**Status**: in_progress

## Progress

| Stage | Name | Status | Completed |
|-------|------|--------|-----------|
| 1 | Parse | ✅ | 2026-01-23 |
| 2 | Audit | ✅ | 2026-01-23 |
| 3 | Plan | 🔄 | - |
| 4 | Build | ⬜ | - |
| 5 | Verify | ⬜ | - |
| 6 | Document | ⬜ | - |

## Current State

**Working on**: Stage 3 - Creating build plan
**Blockers**: None
**Next action**: Confirm plan, proceed to BUILD stage

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
| Airtable `why_now` field | Schema | ✅ Exists |
| Airtable `subject_line` field | Schema | ✅ Exists (SPEC calls it outreach_subject) |
| Airtable `outreach_angle` field | Schema | ✅ Exists |
| Airtable `contact_confidence` field | Schema | ✅ Exists |
| Airtable `contact_type` field | Schema | ✅ Exists (Problem Owner/Deputy/HR Fallback) |
| HubSpot API access | External | ✅ Verified (scopes: contacts.read, companies.read) |
| n8n AI Agent capability | Platform | ⚠️ Current WF5 uses HTTP→OpenAI, needs migration |
| Prompts folder | Files | ✅ Exists with both agent prompts |

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

**Airtable Schema Verification**:

| Field | Table | Exists | Notes |
|-------|-------|--------|-------|
| why_now | Opportunities | ✅ | multilineText |
| subject_line | Opportunities | ✅ | singleLineText (spec calls it outreach_subject) |
| outreach_angle | Opportunities | ✅ | singleSelect (direct_hiring, competitor_intercept, etc.) |
| outreach_draft | Opportunities | ✅ | multilineText |
| contact_confidence | Opportunities | ✅ | singleSelect (verified, likely, guess) |
| contact_type | Opportunities | ✅ | singleSelect (Problem Owner, Deputy, HR Fallback) |
| is_competitor_intercept | Opportunities | ✅ | checkbox |
| status | Opportunities | ✅ | includes "researching", "ready" |
| hubspot_id | Contacts | ✅ | singleLineText |
| relationship_status | Contacts | ✅ | singleSelect |
| last_interaction | Contacts | ✅ | dateTime |
| research_confidence | Contacts | ✅ | number |

**HubSpot API Verification**:

- ✅ Connection verified
- ✅ Scopes: `crm.objects.contacts.read`, `crm.objects.companies.read`
- ✅ Hub ID: 144989374
- ✅ Owner: James Jeram (james@peelsolutions.co.uk)

**Existing Workflow Analysis** (n8n/workflows/opportunity-enricher.json):

- Workflow ID: `Lb5iOr1m93kUXBC0`
- Current approach: Linear HTTP calls → OpenAI gpt-4o-mini
- Contact lookup: Airtable → HubSpot fallback (works well)
- G-013 enforcement: ✅ Already implemented (competitor intercepts → P1)
- Key limitation: Single AI call, no tool-using agents

**Agent Prompts**:

- ✅ `prompts/contact-research-agent.md` — exists
- ✅ `prompts/outreach-drafting-agent.md` — exists

**Technical Decision Required**:

SPEC-011 specifies n8n AI Agent nodes with tools. Current WF5 uses HTTP→OpenAI.

**Options**:
1. **Full n8n AI Agent migration** — Use n8n's native AI Agent node with tool definitions
2. **Enhanced HTTP approach** — Keep HTTP calls but add multi-step reasoning
3. **Hybrid** — Use AI Agent for contact research (complex), HTTP for drafting (simpler)

**Recommendation**: Option 3 (Hybrid) — AI Agent node for contact research (needs tool calling for HubSpot/Airtable), standard AI call for drafting (single-shot generation).

**Blockers**: None identified. All schema and API dependencies satisfied.

### Stage 3: Plan

**Implementation Approach**: Hybrid (per audit recommendation)
- **Contact Research**: AI Agent with tool calling (complex multi-source lookup)
- **Outreach Drafting**: Enhanced single AI call (predictable generation)

**Build Sequence** (18 tasks, ordered by dependency):

#### Phase A: Preparation (Tasks 1-3)

| # | Task | Description | Depends On |
|---|------|-------------|------------|
| 1 | Create Peel Services reference | Create `reference-data/peel-services.json` for get_peel_services tool | — |
| 2 | Back up current WF5 | Copy `opportunity-enricher.json` to `opportunity-enricher-backup.json` | — |
| 3 | Create workflow skeleton | New WF5 with trigger, fetch opp, fetch force nodes (reuse from current) | 2 |

#### Phase B: Contact Research Agent (Tasks 4-9)

| # | Task | Description | Depends On |
|---|------|-------------|------------|
| 4 | Build search_hubspot_contacts tool | HTTP node to HubSpot search API with company filter | 3 |
| 5 | Build get_contact_history tool | Airtable lookup for contact + linked opportunities | 3 |
| 6 | Build get_force_org_structure tool | Airtable lookup on Forces + linked Contacts | 3 |
| 7 | Build evaluate_contact_fit tool | AI sub-call for fit assessment | 3 |
| 8 | Integrate Contact Research Agent | n8n AI Agent node with tools 4-7, system prompt from prompts/contact-research-agent.md | 4,5,6,7 |
| 9 | Add contact routing logic | Branch: contact found → continue, not found → status="needs_contact" | 8 |

#### Phase C: Outreach Drafting (Tasks 10-13)

| # | Task | Description | Depends On |
|---|------|-------------|------------|
| 10 | Build signal fetching | Fetch all linked signals with details (reuse from current WF5) | 9 |
| 11 | Build previous outreach lookup | Search Opportunities with status=sent for this force | 9 |
| 12 | Build enhanced AI context | Combine signals, contact, force context, Peel services | 10,11 |
| 13 | Build Outreach Drafting AI call | Single AI call with comprehensive context, self-critique in prompt | 12 |

#### Phase D: Integration & Verification (Tasks 14-18)

| # | Task | Description | Depends On |
|---|------|-------------|------------|
| 14 | Build opportunity update | Write all enrichment fields to Airtable | 13 |
| 15 | Add batch loop handling | Process multiple "researching" opportunities | 14 |
| 16 | Test: problem owner selection | Verify agent selects Head of Crime over HR | 15 |
| 17 | Test: competitor intercept | Verify no competitor names in message, P1 priority | 15 |
| 18 | Deploy and verify | Import to n8n, activate, verify with real opportunity | 16,17 |

**Checkpoint Strategy**:
- After Task 3: Skeleton working, can fallback to backup
- After Task 9: Contact Research Agent complete, testable
- After Task 15: Full workflow complete, ready for testing
- After Task 18: Production deployment

**Rollback Plan**:
- Keep `opportunity-enricher-backup.json` available
- Both workflows deployed during testing
- Disable new WF5 and re-enable backup if issues

### Stage 4: Build
*Pending Stage 3 completion*

### Stage 5: Verify
*Pending Stage 4 completion*

### Stage 6: Document
*Pending Stage 5 completion*
