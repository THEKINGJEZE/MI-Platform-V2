# SPEC-010: Agentic Enrichment Workflow

> ⚠️ **SUPERSEDED**: This spec was drafted but never implemented. The actual agent enrichment
> was implemented as **SPEC-011** (`specs/SPEC-011-agent-enrichment.md`) with a hybrid HubSpot
> approach. The SPEC-010 number was reused for Pipeline Remediation (`SPEC-010-pipeline-remediation.md`).
>
> **Do not implement this spec** — refer to SPEC-011 for the active agent enrichment workflow.

**Status**: Superseded (never implemented)
**Created**: 2025-01-21
**Superseded by**: SPEC-011 Agent Enrichment (implemented January 2026)
**Phase**: N/A
**Depends on**: N/A
**Supersedes**: None

---

## Overview

Replace the current sequential enrichment workflow (WF5) with an intelligent agentic system that can autonomously research contacts, personalize messages, and ensure quality before human review.

**Current state (WF5)**:
- Linear flow: fetch opportunity → lookup contact → generate message → update Airtable
- Limited to existing contacts in Airtable/HubSpot
- Generic AI prompts without signal-specific grounding
- No quality verification before human review

**Proposed state**:
- Multi-agent architecture with specialized capabilities
- Autonomous contact discovery via web search, LinkedIn, force websites
- Signal-grounded message drafting following SALES-STRATEGY templates
- Quality gates ensuring Hook→Bridge→Value→CTA structure
- Confidence scoring for human review prioritization

---

## Strategic Context

### Why Agentic?

From ANCHOR.md success criteria:
- "Human confirms, system decides" — AI recommends, James approves
- ≤15 minute Monday review time
- 3-5 quality leads per week

The current enrichment workflow produces generic outputs that require significant human editing. An agentic approach can:
1. Research contacts autonomously when Airtable/HubSpot lacks data
2. Ground messages in specific signal details (not boilerplate)
3. Self-verify quality before presenting to human
4. Prioritize opportunities by confidence level

### Guardrails Applied

- **G-012**: Value Proposition First — Messages lead with outcome-based delivery
- **G-013**: Competitor Signals Get P1 Priority — Enforced in scoring
- **G-014**: Contact the Problem Owner — Target operational leaders, not HR
- **G-015**: Message Structure (Hook→Bridge→Value→CTA) — Verified by quality agent

---

## Architecture

### Agent Orchestration

```
[Opportunity Ready (status="researching")]
    │
    ├─→ [Contact Research Agent]
    │       • Input: force_name, signal_details, role_types
    │       • Tools: web_search, linkedin_lookup, force_website_scrape
    │       • Output: contact_candidates[] with confidence_scores
    │
    ├─→ [Contact Selection Agent]
    │       • Input: contact_candidates[], signal_context
    │       • Logic: Apply G-014 (problem owner priority)
    │       • Output: selected_contact with reasoning
    │
    ├─→ [Message Drafting Agent]
    │       • Input: force_context, signal_details, contact, outreach_angle
    │       • Templates: SALES-STRATEGY message templates
    │       • Output: draft_subject, draft_body, talking_points
    │
    ├─→ [Quality Verification Agent]
    │       • Input: draft_message, signal_context, guardrails
    │       • Checks: G-012, G-015 compliance
    │       • Output: approved | revision_needed with feedback
    │
    └─→ [Scoring Agent]
            • Input: signal_strength, contact_confidence, message_quality
            • Logic: Compute priority_score, apply G-013 for competitors
            • Output: priority_score, priority_tier, reasoning
```

### Agent Details

#### 1. Contact Research Agent

**Purpose**: Find the "problem owner" for the capability gap indicated by signals.

**Inputs**:
- `force_name`: Police force name
- `signal_details[]`: Array of {title, type, role_type, source}
- `existing_contacts[]`: Known contacts from Airtable/HubSpot

**Tools**:
- `web_search(query)`: Search web for force contacts, org charts
- `linkedin_search(force, role_keywords)`: Find LinkedIn profiles matching criteria
- `force_website_scrape(force)`: Extract leadership team from force website

**Contact Targeting (per G-014)**:

| Role Being Hired | Target Contact Role |
|------------------|---------------------|
| PIP2 Investigators | Head of Crime, Head of Investigations |
| Digital Forensics | Head of Digital/Cyber, Forensic Services Manager |
| Intelligence Analyst | Head of Intelligence |
| Disclosure Officer | Head of Criminal Justice |
| HOLMES Indexer | Head of Major Crime |

**Output**:
```json
{
  "contact_candidates": [
    {
      "name": "John Smith",
      "role": "Head of Crime",
      "email": "john.smith@force.police.uk",
      "linkedin_url": "https://linkedin.com/in/johnsmith",
      "source": "force_website",
      "confidence": 85,
      "reasoning": "Listed as Head of Crime on leadership page, directly owns investigation capacity"
    }
  ],
  "research_notes": "Found via force.police.uk/about/leadership"
}
```

#### 2. Contact Selection Agent

**Purpose**: Choose the best contact from candidates, applying problem-owner logic.

**Selection Criteria** (in priority order):
1. Direct problem owner (owns the capability gap) — weight: 40%
2. Email availability (can reach directly) — weight: 25%
3. Relationship history (warm > cold) — weight: 20%
4. Seniority level (decision-maker authority) — weight: 15%

**Output**:
```json
{
  "selected_contact": {
    "name": "John Smith",
    "role": "Head of Crime",
    "email": "john.smith@force.police.uk",
    "confidence": 85
  },
  "selection_reasoning": "Selected as direct problem owner for investigator capacity. Has verifiable email. No prior relationship but role aligns with signal."
}
```

#### 3. Message Drafting Agent

**Purpose**: Generate personalized outreach following SALES-STRATEGY templates.

**Template Selection**:
| Outreach Angle | Template |
|----------------|----------|
| `direct_hiring` | Standard Signal template |
| `competitor_intercept` | Competitor Signal template |
| `urgent` | Urgent Signal template |
| `volume` | Volume Signal template |
| `fallback_hr` | HR Fallback template |

**Message Requirements** (per G-012, G-015):
1. **Hook**: Reference specific signal(s) by name
2. **Bridge**: Acknowledge the challenge they're facing
3. **Value**: Present Peel's outcome-based approach (never "we have candidates")
4. **CTA**: Request a conversation (not a transaction)

**Output**:
```json
{
  "subject_line": "Supporting Hampshire with PIP2 Investigator capacity",
  "draft_body": "I noticed Hampshire Constabulary is recruiting for PIP2 Investigators...",
  "talking_points": [
    "Investigation backlog challenges facing forces",
    "Outcome-based delivery model",
    "Recent success with similar-sized force"
  ],
  "template_used": "direct_hiring",
  "signal_references": ["PIP2 Investigator - Hampshire Constabulary"]
}
```

#### 4. Quality Verification Agent

**Purpose**: Ensure message meets guardrails before human review.

**Checks**:
- [ ] Hook references actual signal title
- [ ] No "we have candidates" language (G-012)
- [ ] Follows Hook→Bridge→Value→CTA structure (G-015)
- [ ] Under 100 words (concise)
- [ ] Ends with clear CTA
- [ ] No competitor criticism (collaborative tone)
- [ ] Signed off with "James"

**Output**:
```json
{
  "approved": true,
  "checks_passed": ["hook_references_signal", "no_candidates_language", "structure_correct", "length_ok", "has_cta"],
  "checks_failed": [],
  "revision_suggestions": null
}
```

If revision needed:
```json
{
  "approved": false,
  "checks_passed": ["no_candidates_language", "length_ok"],
  "checks_failed": ["hook_references_signal", "structure_correct"],
  "revision_suggestions": "Hook should reference the specific job title. Add Bridge section acknowledging investigation capacity challenges."
}
```

#### 5. Scoring Agent

**Purpose**: Compute priority score ensuring G-013 compliance.

**Scoring Formula**:
```
priority_score = (
  signal_strength * 0.35 +
  contact_confidence * 0.25 +
  message_quality * 0.20 +
  timing_urgency * 0.20
)
```

**G-013 Override**: If `is_competitor_intercept = true`, force `priority_score >= 90` and `priority_tier = 'hot'`.

**Output**:
```json
{
  "priority_score": 85,
  "priority_tier": "high",
  "scoring_breakdown": {
    "signal_strength": 90,
    "contact_confidence": 85,
    "message_quality": 80,
    "timing_urgency": 75
  },
  "reasoning": "Strong signal (PIP2 role), verified contact, solid message. Standard timing."
}
```

---

## Implementation Approach

### Option A: n8n AI Agent Nodes (Recommended)

Use n8n's built-in AI Agent nodes with tool definitions:

```
[Trigger] → [AI Agent: Contact Research]
              └── Tools: HTTP Request (web), Code (parse)
         → [AI Agent: Message Draft]
              └── Tools: Airtable (templates), Code (format)
         → [AI Agent: Quality Check]
              └── Tools: Code (validation)
         → [Update Opportunity]
```

**Pros**:
- Visual debugging in n8n
- Built-in error handling
- Credential reuse
- Retry logic

**Cons**:
- Limited tool complexity
- May need multiple nodes per agent

### Option B: Claude Tool Use (Single Call)

Single Claude API call with all tools defined:

```json
{
  "tools": [
    {"name": "web_search", "description": "..."},
    {"name": "lookup_airtable_contact", "description": "..."},
    {"name": "draft_message", "description": "..."},
    {"name": "verify_quality", "description": "..."}
  ],
  "system": "You are an opportunity enrichment agent..."
}
```

**Pros**:
- Single API call
- Natural multi-step reasoning
- Full context in one request

**Cons**:
- More complex error handling
- Harder to debug
- Potential for runaway tool use

### Option C: Hybrid (Recommended for MVP)

Orchestrator in n8n, complex reasoning in Claude:

1. n8n fetches opportunity context
2. Claude call for contact research (with web search tool)
3. n8n stores contact candidate
4. Claude call for message drafting (with template context)
5. n8n validates structure (deterministic checks)
6. n8n updates Airtable

---

## Schema Additions

**Opportunities table** (new fields):

| Field | Type | Purpose |
|-------|------|---------|
| `research_confidence` | Number (0-100) | Confidence in contact research |
| `research_sources` | Long Text | Sources used for contact discovery |
| `quality_check_passed` | Checkbox | Did message pass quality verification? |
| `quality_check_notes` | Long Text | Quality agent feedback |
| `scoring_breakdown` | Long Text | JSON of score components |

**Contacts table** (new fields):

| Field | Type | Purpose |
|-------|------|---------|
| `discovery_source` | Single Select | airtable, hubspot, web_search, linkedin, force_website |
| `discovery_confidence` | Number (0-100) | How confident are we in this contact? |

---

## Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | Contact research finds contacts not in Airtable/HubSpot | Test with force having no existing contacts |
| 2 | Problem owner targeting works (G-014) | Investigator signal → Head of Crime target |
| 3 | Messages reference specific signal titles | Grep draft for signal title substring |
| 4 | No "we have candidates" in any draft | Grep check |
| 5 | Hook→Bridge→Value→CTA structure enforced | Quality agent passes check |
| 6 | Competitor signals get P1/Hot (G-013) | Score >= 90, tier = 'hot' |
| 7 | Monday review time ≤ 15 min for 5 opps | User testing |
| 8 | Quality gates catch policy violations | Test with bad input |

---

## Testing Plan

### Unit Tests (per agent)

1. **Contact Research**
   - Input: Force with no known contacts
   - Expected: Returns at least 1 candidate with confidence > 50

2. **Contact Selection**
   - Input: 3 candidates (HR, Head of Crime, Admin)
   - Expected: Selects Head of Crime (problem owner)

3. **Message Drafting**
   - Input: PIP2 Investigator signal, Head of Crime contact
   - Expected: Message hooks on "PIP2 Investigator", uses direct_hiring template

4. **Quality Verification**
   - Input: Message saying "we have candidates available"
   - Expected: `approved: false`, cites G-012 violation

5. **Scoring**
   - Input: Competitor signal opportunity
   - Expected: `priority_score >= 90`, `priority_tier: 'hot'`

### Integration Test

1. Create test opportunity with 2 signals (1 competitor)
2. Run agentic enrichment
3. Verify:
   - Contact found (not from existing Airtable)
   - Message references both signal titles
   - Priority = P1/Hot
   - Quality check passed
   - status = 'ready'

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Web search returns irrelevant results | Add domain filtering (police.uk, linkedin.com) |
| Contact discovery finds wrong person | Confidence scoring + human review |
| Message quality varies | Quality agent + deterministic checks |
| Cost (multiple Claude calls per opp) | Batch processing, caching, model selection |
| Rate limits on LinkedIn | Graceful fallback to force website |

---

## Cost Estimate

Per opportunity enriched:
- Contact research: ~2,000 tokens input, ~500 output = ~$0.008 (Claude Haiku)
- Message drafting: ~1,500 tokens input, ~300 output = ~$0.006
- Quality check: ~800 tokens input, ~200 output = ~$0.003
- Scoring: ~500 tokens input, ~200 output = ~$0.002

**Total**: ~$0.02 per opportunity

At 50 opportunities/week = ~$1/week = ~$4/month

---

## Implementation Phases

### Phase 5a: Enhanced Message Drafting
- Improve current WF5 with signal-specific prompting (done in Quality Improvement Plan)
- Add quality checks as deterministic validation
- Add scoring breakdown

### Phase 5b: Contact Research Agent
- Add web search tool for contact discovery
- Implement problem-owner targeting logic
- Store discovery source and confidence

### Phase 5c: Full Agentic Pipeline
- Orchestrate all agents
- Add revision loop for failed quality checks
- Implement confidence-based human review queue

---

## Dependencies

- **Quality Improvement Plan**: Phases 1-4 must be complete
- **WF5 Enricher**: Current workflow as baseline
- **SALES-STRATEGY.md**: Message templates and contact targeting rules
- **GUARDRAILS.md**: G-012, G-013, G-014, G-015 definitions

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `n8n/workflows/opportunity-enricher-agentic.json` | Create (new workflow) |
| `prompts/contact-research.md` | Create (agent prompt) |
| `prompts/message-drafting-agentic.md` | Create (agent prompt) |
| `prompts/quality-verification.md` | Create (agent prompt) |
| Airtable Opportunities table | Add new fields |
| Airtable Contacts table | Add new fields |
| `ROADMAP.md` | Add Phase 5b/5c |
| `STATUS.md` | Update on implementation |

---

## Success Metrics

After 4 weeks of agentic enrichment:
- Contact research success rate > 70% (finds usable contact)
- Message quality check pass rate > 85%
- Monday review time maintained at ≤ 15 min
- Human edit rate < 30% (messages mostly ready to send)
- No policy violations in sent messages

---

*This spec defines the agentic enrichment system. Implementation starts after Quality Improvement Plan is validated.*
