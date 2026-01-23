# SPEC-011: Agent-Based Opportunity Enrichment

**Status**: ✅ Complete
**Phase**: 1e (Agentic Enrichment)
**Priority**: P1 — After SPEC-010 pipeline fixes
**Depends On**: SPEC-010 (classification must work first)
**Implementation**: WF5 v2.2 deployed and live

---

## 1. Overview

### Problem

Current enrichment (WF5) is linear and misses nuance:
- Picks first/random contact when multiple exist at a force
- Doesn't consider contact fit for the specific role type
- Doesn't check if we recently contacted the same person
- References only one signal even when multiple exist
- Can't search beyond HubSpot for contacts
- Messages are template-ish, not truly contextual

### Solution

Replace linear enrichment with two specialised AI agents:

1. **Contact Research Agent** — Finds the best contact for this specific opportunity
2. **Outreach Drafting Agent** — Creates contextual, compelling messages

### Expected Outcome

| Metric | Before (Linear) | After (Agent) |
|--------|-----------------|---------------|
| Contact selection quality | First match | Best fit for role |
| Message personalisation | Template + merge fields | Contextual synthesis |
| Multi-signal handling | Single reference | Synthesizes all signals |
| Recent outreach awareness | None | Checks and adapts |
| Edge case handling | Fails/flags | Reasons through |

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│  WF5: OPPORTUNITY ENRICHMENT (Agent-Based)                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Trigger: Opportunity with status = "researching"                       │
│           OR new signal linked to existing opportunity                  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  STAGE 1: CONTACT RESEARCH AGENT                                │   │
│  │                                                                 │   │
│  │  Input: opportunity_id, force_id, role_category, role_detail   │   │
│  │                                                                 │   │
│  │  Tools:                                                         │   │
│  │  • search_hubspot_contacts                                      │   │
│  │  • get_contact_history                                          │   │
│  │  • get_force_org_structure                                      │   │
│  │  • evaluate_contact_fit                                         │   │
│  │                                                                 │   │
│  │  Output:                                                        │   │
│  │  • contact_id (or null if none found)                          │   │
│  │  • contact_confidence: high/medium/low                         │   │
│  │  • selection_reasoning: why this contact                       │   │
│  │  • backup_contacts: other options if primary fails             │   │
│  │  • research_notes: what we learned                             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              │                                          │
│                              ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  STAGE 2: OUTREACH DRAFTING AGENT                               │   │
│  │                                                                 │   │
│  │  Input: opportunity_id, contact_id, selection_reasoning        │   │
│  │                                                                 │   │
│  │  Tools:                                                         │   │
│  │  • get_opportunity_signals                                      │   │
│  │  • get_previous_outreach                                        │   │
│  │  • get_force_context                                            │   │
│  │  • get_peel_services                                            │   │
│  │  • draft_message                                                │   │
│  │  • critique_and_improve                                         │   │
│  │                                                                 │   │
│  │  Output:                                                        │   │
│  │  • outreach_draft: the message                                 │   │
│  │  • outreach_subject: email subject line                        │   │
│  │  • outreach_angle: direct/competitor/regulatory/etc            │   │
│  │  • key_points: what signals/context referenced                 │   │
│  │  • why_now_summary: 1-sentence "Why Now" for dashboard         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              │                                          │
│                              ▼                                          │
│  Update Opportunity:                                                    │
│  • contact = contact_id                                                │
│  • contact_confidence = from agent                                     │
│  • outreach_draft = from agent                                         │
│  • outreach_angle = from agent                                         │
│  • why_now = from agent                                                │
│  • status = "ready" (if contact found) or "researching" (if not)      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Tool Specifications

### 3.1 Contact Research Agent Tools

#### Tool: search_hubspot_contacts

**Purpose**: Search HubSpot for contacts at a specific police force.

**Input**:
```json
{
  "force_name": "Hampshire Constabulary",
  "force_hubspot_id": "12345678"
}
```

**Output**:
```json
{
  "contacts": [
    {
      "contact_id": "rec_abc123",
      "hubspot_id": "501",
      "name": "Sarah Chen",
      "role": "Head of Resourcing",
      "department": "HR",
      "email": "sarah.chen@hampshire.police.uk",
      "email_verified": true,
      "last_interaction": "2025-01-10",
      "interaction_count": 3,
      "relationship_status": "warm"
    },
    {
      "contact_id": "rec_def456",
      "hubspot_id": "502",
      "name": "Mike Thompson",
      "role": "Head of Crime",
      "department": "Crime",
      "email": "mike.thompson@hampshire.police.uk",
      "email_verified": true,
      "last_interaction": "2024-11-15",
      "interaction_count": 1,
      "relationship_status": "cold"
    }
  ],
  "total_found": 2
}
```

**n8n Implementation**: HTTP Request node to HubSpot API → Search contacts by company ID.

---

#### Tool: get_contact_history

**Purpose**: Get interaction history with a specific contact.

**Input**:
```json
{
  "contact_id": "rec_abc123"
}
```

**Output**:
```json
{
  "contact_id": "rec_abc123",
  "name": "Sarah Chen",
  "interactions": [
    {
      "date": "2025-01-10",
      "type": "email_sent",
      "subject": "Disclosure capacity support",
      "outcome": "opened",
      "opportunity_id": "opp_xyz"
    },
    {
      "date": "2024-12-01",
      "type": "meeting",
      "subject": "Introductory call",
      "outcome": "positive",
      "notes": "Interested in managed teams for 2025"
    }
  ],
  "total_interactions": 2,
  "last_outreach_date": "2025-01-10",
  "days_since_last_outreach": 13,
  "overall_sentiment": "positive"
}
```

**n8n Implementation**: Airtable search (Contacts + linked interactions) or HubSpot engagement API.

---

#### Tool: get_force_org_structure

**Purpose**: Get known organisational structure for a force (from Forces table + any cached research).

**Input**:
```json
{
  "force_id": "rec_force_123"
}
```

**Output**:
```json
{
  "force_name": "Hampshire Constabulary",
  "known_departments": [
    {
      "name": "Crime",
      "head": "ACC Mike Thompson",
      "known_contacts": ["mike.thompson@hampshire.police.uk"]
    },
    {
      "name": "PVP / Safeguarding",
      "head": "Det Supt Jane Williams",
      "known_contacts": []
    },
    {
      "name": "HR / Resourcing",
      "head": "Sarah Chen",
      "known_contacts": ["sarah.chen@hampshire.police.uk"]
    }
  ],
  "website": "https://www.hampshire.police.uk",
  "careers_url": "https://www.hampshire.police.uk/careers",
  "notes": "Previously used Red Snapper for investigator staffing"
}
```

**n8n Implementation**: Airtable lookup on Forces table.

---

#### Tool: evaluate_contact_fit

**Purpose**: AI evaluates whether a contact is a good fit for this specific opportunity.

**Input**:
```json
{
  "contact": {
    "name": "Sarah Chen",
    "role": "Head of Resourcing",
    "department": "HR"
  },
  "opportunity": {
    "role_category": "investigation",
    "role_detail": "PIP2 Fraud Investigator",
    "is_competitor_intercept": true
  }
}
```

**Output**:
```json
{
  "fit_score": 65,
  "fit_assessment": "medium",
  "reasoning": "Sarah is in HR/Resourcing which handles recruitment, so she's relevant for staffing conversations. However, for a specialist fraud investigation role, the Head of Economic Crime or Head of Investigations would be a better primary contact as they own the problem. Sarah is a good secondary contact if we can't reach the problem owner.",
  "recommendation": "secondary",
  "ideal_contact_profile": "Head of Economic Crime, Head of Fraud, or Head of Investigations"
}
```

**n8n Implementation**: AI node with evaluation prompt (no external API needed).

---

### 3.2 Outreach Drafting Agent Tools

#### Tool: get_opportunity_signals

**Purpose**: Get all signals linked to this opportunity.

**Input**:
```json
{
  "opportunity_id": "rec_opp_123"
}
```

**Output**:
```json
{
  "opportunity_id": "rec_opp_123",
  "force_name": "Hampshire Constabulary",
  "signals": [
    {
      "signal_id": "rec_sig_1",
      "type": "competitor_job",
      "source": "red_snapper",
      "title": "PIP2 Fraud Investigator",
      "role_category": "investigation",
      "role_detail": "PIP2 Fraud Investigator",
      "detected_at": "2025-01-20",
      "age_days": 3
    },
    {
      "signal_id": "rec_sig_2",
      "type": "job_posting",
      "source": "indeed",
      "title": "Financial Investigator",
      "role_category": "specialist",
      "role_detail": "Financial Investigator - POCA",
      "detected_at": "2025-01-18",
      "age_days": 5
    }
  ],
  "signal_count": 2,
  "has_competitor_signal": true,
  "competitor_sources": ["red_snapper"],
  "primary_role_category": "investigation",
  "combined_context": "Hampshire is actively recruiting investigation capacity - both fraud investigators and financial investigators. Red Snapper is also recruiting for them, indicating urgent need."
}
```

**n8n Implementation**: Airtable lookup on Signals linked to opportunity.

---

#### Tool: get_previous_outreach

**Purpose**: Get previous outreach to this force (to avoid repetition and reference appropriately).

**Input**:
```json
{
  "force_id": "rec_force_123",
  "contact_id": "rec_contact_456"
}
```

**Output**:
```json
{
  "force_id": "rec_force_123",
  "force_name": "Hampshire Constabulary",
  "previous_outreach": [
    {
      "date": "2025-01-10",
      "contact_name": "Sarah Chen",
      "subject": "Disclosure capacity support",
      "angle": "direct_hiring",
      "outcome": "opened_no_reply",
      "message_preview": "I noticed Hampshire is recruiting disclosure officers..."
    },
    {
      "date": "2024-11-01",
      "contact_name": "Mike Thompson",
      "subject": "Investigation support - Peel Solutions",
      "angle": "proactive",
      "outcome": "replied_positive",
      "message_preview": "I wanted to introduce Peel Solutions..."
    }
  ],
  "days_since_last_outreach": 13,
  "total_outreach_count": 2,
  "angles_used": ["direct_hiring", "proactive"],
  "should_avoid": "Don't repeat disclosure angle to Sarah - already sent recently. Consider different contact or different angle."
}
```

**n8n Implementation**: Airtable search on Opportunities with status=sent for this force + HubSpot activities.

---

#### Tool: get_force_context

**Purpose**: Get broader context about the force for message personalisation.

**Input**:
```json
{
  "force_id": "rec_force_123"
}
```

**Output**:
```json
{
  "force_name": "Hampshire Constabulary",
  "region": "South East",
  "size": "large",
  "officer_count": 3200,
  "current_relationship": "warm",
  "competitor_incumbent": ["Red Snapper"],
  "peel_investigating_rating": "Good",
  "peel_pvp_rating": "Requires Improvement",
  "recent_news": null,
  "contract_history": [
    {
      "competitor": "Red Snapper",
      "service": "Agency investigators",
      "value": "£200k/yr",
      "end_date": "2025-06-30"
    }
  ],
  "notes": "Met at Police Federation conference 2024. Interested in managed teams model."
}
```

**n8n Implementation**: Airtable lookup on Forces table.

---

#### Tool: get_peel_services

**Purpose**: Get relevant Peel service descriptions for the opportunity context.

**Input**:
```json
{
  "role_category": "investigation",
  "is_volume": true
}
```

**Output**:
```json
{
  "primary_service": {
    "name": "Managed Investigation Teams",
    "description": "Outcome-based investigator teams under Statement of Works. We recruit, manage, and quality assure - you direct the work.",
    "key_benefits": [
      "Outcome accountability, not just bums on seats",
      "We handle recruitment and retention",
      "Scales up/down with demand",
      "Quality assured delivery"
    ],
    "typical_use_cases": [
      "Backlog clearance",
      "Volume crime capacity",
      "Specialist investigation surge"
    ]
  },
  "secondary_service": {
    "name": "Individual Placements",
    "description": "Experienced investigators placed into your team structure.",
    "when_to_mention": "If they want to maintain direct management"
  },
  "differentiator": "Unlike traditional agencies, we take accountability for outcomes - not just filling seats."
}
```

**n8n Implementation**: Static lookup or Airtable reference table.

---

#### Tool: draft_message

**Purpose**: Generate a draft outreach message.

**Input**:
```json
{
  "contact": {
    "name": "Mike Thompson",
    "role": "Head of Crime"
  },
  "force": "Hampshire Constabulary",
  "signals_summary": "Recruiting PIP2 fraud investigators (competitor via Red Snapper) and financial investigators",
  "outreach_angle": "competitor_intercept",
  "previous_outreach_note": "We emailed Sarah in HR 2 weeks ago about disclosure - no reply. First contact with Mike.",
  "peel_service": "Managed Investigation Teams",
  "key_points_to_include": [
    "Reference fraud/financial investigation capacity need",
    "Don't mention Red Snapper by name",
    "Position as alternative approach",
    "Mike is problem owner - speak to outcomes"
  ]
}
```

**Output**:
```json
{
  "subject": "Investigation capacity - Peel Solutions",
  "body": "Hi Mike,\n\nI understand Hampshire is looking at fraud and financial investigation capacity at the moment. Many forces we work with face similar challenges finding experienced investigators, particularly for specialist financial work.\n\nPeel Solutions provides managed investigation teams - a slightly different model to traditional agency placements. We take accountability for outcomes rather than just filling seats, which several forces have found more effective for larger or specialist requirements.\n\nI'd welcome the opportunity to share what's worked elsewhere, even if just for future reference. Would you have time for a brief conversation this week?\n\nJames",
  "word_count": 89,
  "angle_used": "competitor_intercept",
  "signals_referenced": ["fraud_investigators", "financial_investigators"]
}
```

**n8n Implementation**: AI node with drafting prompt.

---

#### Tool: critique_and_improve

**Purpose**: Self-critique the draft and improve it.

**Input**:
```json
{
  "draft": "Hi Mike,\n\nI understand Hampshire is looking at fraud and financial investigation capacity...",
  "criteria": [
    "Does it follow Hook → Bridge → Value → CTA structure?",
    "Is it under 100 words?",
    "Does it avoid mentioning competitors by name?",
    "Does it sound human, not templated?",
    "Does it speak to the problem owner's concerns?"
  ]
}
```

**Output**:
```json
{
  "critique": [
    {"criterion": "Hook → Bridge → Value → CTA", "pass": true, "note": "Good structure"},
    {"criterion": "Under 100 words", "pass": true, "note": "89 words"},
    {"criterion": "No competitor names", "pass": true, "note": "Good - no mention of Red Snapper"},
    {"criterion": "Human tone", "pass": true, "note": "Conversational, not robotic"},
    {"criterion": "Problem owner focus", "pass": true, "note": "Speaks to outcomes, not process"}
  ],
  "overall_assessment": "Good draft, no changes needed",
  "improved_draft": null,
  "changes_made": []
}
```

**n8n Implementation**: AI node with critique prompt.

---

## 4. Agent Prompts

### 4.1 Contact Research Agent Prompt

**File**: `prompts/contact-research-agent.md`

```markdown
# Contact Research Agent

## Role

You are a Contact Research Agent for Peel Solutions. Your job is to find the best contact for a sales outreach opportunity at a UK police force.

## Context

Peel Solutions provides managed investigator teams and staffing to UK police forces. When we detect a hiring signal (job posting, competitor activity), we want to contact the right person - ideally the "problem owner" who feels the pain of understaffing, not just HR.

## Your Goal

Find the best contact for this opportunity. "Best" means:
1. **Problem owner** > HR/Recruitment (the person whose team needs the capacity)
2. **Verified email** > Unverified
3. **Warm relationship** > Cold
4. **Recent interaction** can be good (familiar) or bad (just emailed, should wait)

## Tools Available

- `search_hubspot_contacts` - Find contacts at this force in our CRM
- `get_contact_history` - Get interaction history with a contact
- `get_force_org_structure` - Get known org structure for this force
- `evaluate_contact_fit` - Evaluate if a contact fits this specific opportunity

## Process

1. **Understand the opportunity**: What role category? What's the signal? Is it urgent (competitor)?

2. **Search HubSpot**: See who we know at this force.

3. **Evaluate each contact**: 
   - Are they the problem owner for this role type?
   - When did we last contact them?
   - What's our relationship status?

4. **Check for conflicts**:
   - Did we email them in the last 7 days? (Too soon)
   - Did we email them about the same topic recently? (Need different angle)

5. **Decide**:
   - If good contact found → Return as primary
   - If only HR available → Return but note "problem owner preferred"
   - If no contacts → Return null, note what profile we need

## Contact Fit by Role Category

| Role Category | Ideal Contact | Acceptable | Avoid |
|---------------|---------------|------------|-------|
| investigation | Head of Crime, Head of Investigations, Det Supt | HR/Resourcing | Finance, Comms |
| criminal_justice | Head of CJ, Custody Manager, Court Liaison Lead | HR/Resourcing | IT, Estates |
| intelligence | Head of Intelligence, Intel Manager | HR/Resourcing | Finance |
| forensics | Head of Forensics, Digital Forensics Manager | HR/Resourcing | General admin |
| specialist | Depends on specialism (Vetting Manager, Head of PSD, Economic Crime Lead) | HR/Resourcing | — |
| support | HR/Resourcing is actually appropriate here | — | — |

## Output Format

Return JSON:
```json
{
  "contact_id": "rec_xxx or null",
  "contact_name": "Name or null",
  "contact_role": "Role or null",
  "contact_email": "email or null",
  "contact_confidence": "high/medium/low/none",
  "selection_reasoning": "Why this contact, or why none found",
  "days_since_last_contact": 30,
  "safe_to_contact": true,
  "backup_contacts": [
    {"contact_id": "rec_yyy", "name": "Name", "role": "Role", "why_backup": "Reason"}
  ],
  "ideal_contact_profile": "If no good contact, describe who we should look for",
  "research_notes": "Any useful info discovered"
}
```

## Rules

1. **Never recommend contacting someone we emailed < 7 days ago** (set safe_to_contact = false)
2. **Problem owner > HR** - Always prefer the person whose team needs the capacity
3. **Explain your reasoning** - Your reasoning helps James make the final call
4. **If no contacts, that's OK** - Return null with a clear ideal_contact_profile
5. **Note backup options** - If primary is unavailable, who else?
```

---

### 4.2 Outreach Drafting Agent Prompt

**File**: `prompts/outreach-drafting-agent.md`

```markdown
# Outreach Drafting Agent

## Role

You are an Outreach Drafting Agent for Peel Solutions. Your job is to write compelling, personalised outreach messages for sales opportunities at UK police forces.

## Context

Peel Solutions provides managed investigator teams and staffing to UK police forces. When we detect hiring signals (job postings, competitor activity), we reach out to offer our services. 

The person reviewing these messages (James) has ADHD - he needs messages that are ready to send with minimal editing. Quality over quantity.

## Your Goal

Write an outreach message that:
1. References the specific signal(s) that triggered this opportunity
2. Speaks to the contact's likely concerns (not generic)
3. Positions Peel's value without being salesy
4. Has a clear, low-friction call to action
5. Sounds human, not templated

## Tools Available

- `get_opportunity_signals` - Get all signals for this opportunity
- `get_previous_outreach` - See what we've sent this force before
- `get_force_context` - Get context about this force
- `get_peel_services` - Get relevant service descriptions
- `draft_message` - Generate a draft
- `critique_and_improve` - Self-critique and refine

## Process

1. **Gather context**:
   - What signals triggered this opportunity?
   - Who are we contacting and what's their role?
   - What's our history with this force?
   - What have we sent them before?

2. **Determine angle**:
   - `competitor_intercept` - We know competitor is active (don't mention them)
   - `direct_hiring` - They're hiring directly, we can help
   - `regulatory` - HMICFRS/Reg28 pressure (be sensitive)
   - `proactive` - No specific signal, just good timing
   - `follow_up` - Following up on previous outreach

3. **Check for conflicts**:
   - Did we use this angle recently? Try a different one.
   - Did we mention the same role type? Reference something new.

4. **Draft the message**:
   - Follow Hook → Bridge → Value → CTA structure
   - Keep under 100 words
   - Make it specific to their situation

5. **Self-critique**:
   - Does it sound templated? Fix it.
   - Is the CTA clear? Clarify it.
   - Would James need to edit it? Minimise that.

## Message Structure: Hook → Bridge → Value → CTA

| Section | Purpose | Length |
|---------|---------|--------|
| **Hook** | Reference their specific situation | 1-2 sentences |
| **Bridge** | Acknowledge the challenge | 1 sentence |
| **Value** | Position Peel's approach | 2-3 sentences |
| **CTA** | Request conversation (low friction) | 1 sentence |

## Angle-Specific Guidance

### Competitor Intercept
- NEVER mention the competitor by name
- NEVER say "I saw you're using agencies" 
- DO say "I understand you're looking at [capability] capacity"
- Position as "making sure Peel is on your radar" / "offering a different approach"

### Direct Hiring  
- Reference the specific role(s) they're recruiting
- Acknowledge recruitment challenges
- Offer managed teams as alternative to piecemeal hiring

### Regulatory
- NEVER say "I saw your HMICFRS rating"
- DO say "We work with forces on [area] improvement"
- Be helpful, not ambulance-chasing
- Offer expertise, not criticism

### Multi-Signal
- Synthesize multiple signals into coherent narrative
- "You're clearly scaling up investigation capacity" (references 3 job posts)
- Don't list every signal - create a story

## Output Format

Return JSON:
```json
{
  "subject": "Email subject line",
  "body": "Full message body",
  "word_count": 85,
  "outreach_angle": "competitor_intercept",
  "signals_referenced": ["PIP2 fraud posting", "Financial investigator posting"],
  "key_points": ["Referenced fraud/financial capacity need", "Positioned managed teams", "Problem-owner language"],
  "why_now_summary": "Hampshire is actively recruiting fraud and financial investigators - competitor also active",
  "critique_notes": "Draft passed all criteria, no changes needed",
  "confidence": "high"
}
```

## Rules

1. **Under 100 words** - Respect their time
2. **Never mention competitors by name** - Even if that's how we know
3. **Hook → Bridge → Value → CTA** - Every message
4. **Specific > Generic** - Reference their actual situation
5. **Problem owner language** - Speak to outcomes, not process
6. **Sign as James** - Just "James", not "James Sherwood" or full signature
7. **No fluff** - Every sentence earns its place
8. **Self-critique** - If it's not good enough, improve it before returning
```

---

## 5. n8n Implementation Guide

### Workflow Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  WF5: Agent-Based Enrichment                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Trigger: Airtable - Opportunity status = "researching"      │
│                                                                 │
│  2. Fetch Opportunity: Get full record + force details          │
│                                                                 │
│  3. AI Agent Node: Contact Research Agent                       │
│     ├─ System prompt: contact-research-agent.md                 │
│     ├─ Tools:                                                   │
│     │   ├─ search_hubspot_contacts (HTTP Request → HubSpot)    │
│     │   ├─ get_contact_history (Airtable lookup)               │
│     │   ├─ get_force_org_structure (Airtable lookup)           │
│     │   └─ evaluate_contact_fit (Sub-AI call)                  │
│     └─ Output: contact_id, confidence, reasoning                │
│                                                                 │
│  4. Branch: Contact found?                                      │
│     ├─ Yes → Continue to drafting                              │
│     └─ No → Update opp status="needs_contact", exit            │
│                                                                 │
│  5. AI Agent Node: Outreach Drafting Agent                      │
│     ├─ System prompt: outreach-drafting-agent.md               │
│     ├─ Tools:                                                   │
│     │   ├─ get_opportunity_signals (Airtable lookup)           │
│     │   ├─ get_previous_outreach (Airtable lookup)             │
│     │   ├─ get_force_context (Airtable lookup)                 │
│     │   ├─ get_peel_services (Static/Airtable)                 │
│     │   ├─ draft_message (Sub-AI call)                         │
│     │   └─ critique_and_improve (Sub-AI call)                  │
│     └─ Output: draft, subject, angle, why_now                   │
│                                                                 │
│  6. Update Opportunity: Write all fields                        │
│     ├─ contact = contact_id                                    │
│     ├─ contact_confidence = from agent                         │
│     ├─ outreach_draft = body                                   │
│     ├─ outreach_subject = subject                              │
│     ├─ outreach_angle = angle                                  │
│     ├─ why_now = why_now_summary                               │
│     └─ status = "ready"                                        │
│                                                                 │
│  7. Done                                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### n8n AI Agent Configuration

**Agent Type**: Tools Agent (not Conversational)

**Model**: `gpt-4o` or `claude-3-5-sonnet` (need strong reasoning)

**Temperature**: 0.3 (mostly deterministic, slight creativity for messages)

**Max Iterations**: 5 (prevent infinite loops)

**Tool Definition Example** (for n8n):

```json
{
  "name": "search_hubspot_contacts",
  "description": "Search HubSpot CRM for contacts at a specific police force. Returns list of contacts with their roles, emails, and relationship status.",
  "parameters": {
    "type": "object",
    "properties": {
      "force_name": {
        "type": "string",
        "description": "Name of the police force, e.g., 'Hampshire Constabulary'"
      },
      "force_hubspot_id": {
        "type": "string", 
        "description": "HubSpot company ID for the force"
      }
    },
    "required": ["force_name"]
  }
}
```

---

## 6. Cost Estimate

| Component | Cost per Enrichment | Notes |
|-----------|---------------------|-------|
| Contact Research Agent | ~$0.02-0.04 | 2-4 tool calls + reasoning |
| Outreach Drafting Agent | ~$0.03-0.05 | 3-5 tool calls + drafting |
| **Total per opportunity** | ~$0.05-0.10 | |

**Monthly estimate** (20 opportunities/week):
- Linear WF5: ~$0.80/month
- Agent WF5: ~$4-8/month

Acceptable cost increase for significantly better output quality.

---

## 7. Testing Plan

| Test | Setup | Expected Result |
|------|-------|-----------------|
| Multiple contacts | Force with 3 HubSpot contacts | Agent selects best fit, explains why |
| No contacts | Force with no HubSpot contacts | Returns null, provides ideal profile |
| Recent outreach | Contact emailed 3 days ago | Agent marks safe_to_contact=false |
| Multi-signal | Opportunity with 3 signals | Message synthesizes all, doesn't list |
| Competitor intercept | Competitor signal present | Message doesn't mention competitor |
| Self-critique | Draft has issue | Agent identifies and fixes before returning |

---

## 8. Acceptance Criteria

- [ ] Contact Research Agent correctly identifies problem owner vs HR
- [ ] Contact Research Agent checks recent outreach and flags conflicts
- [ ] Outreach Drafting Agent references all relevant signals
- [ ] Messages follow Hook → Bridge → Value → CTA structure
- [ ] Messages are under 100 words
- [ ] Competitor names never appear in messages
- [ ] Why Now summary accurately captures opportunity
- [ ] End-to-end latency < 30 seconds
- [ ] Cost per enrichment < $0.15

---

## 9. Files to Create

| File | Purpose |
|------|---------|
| `prompts/contact-research-agent.md` | Contact Research Agent system prompt |
| `prompts/outreach-drafting-agent.md` | Outreach Drafting Agent system prompt |
| `n8n/wf5-agent-enrichment.json` | n8n workflow export |
| Update `SPEC-005` | Mark as superseded by SPEC-011 |

---

## 10. Rollback Plan

If agent-based enrichment causes issues:
1. Disable WF5 agent workflow
2. Re-enable linear WF5 workflow
3. Both should remain deployed during testing period

---

## 11. Dependencies

- **SPEC-010 complete**: Classification must work before enrichment makes sense
- **HubSpot API access**: For contact search
- **Airtable schema**: `why_now` field may need adding to Opportunities table
