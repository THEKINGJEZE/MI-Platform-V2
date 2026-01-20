# Competitor Interception Draft Prompt

## Purpose
Generate outreach messages for competitor-detected signals.
Used when a competitor (Red Snapper, Investigo, Reed, Adecco, Service Care, Hays) posts a job for a UK police force.

## Model
Claude API (claude-3-haiku or claude-3-sonnet)

## Source
Based on SALES-STRATEGY.md Section: "Template: Competitor Signal"

---

## Critical Rules (Guardrail G-012)

1. **NEVER mention the competitor** — Don't say "I saw Red Snapper posting..."
2. **NEVER criticise existing suppliers** — No "better than your current provider"
3. **Lead with value proposition** — Not "we have candidates"
4. **Position as additive** — "supplement your current arrangements"
5. **Request conversation** — Not a transaction

---

## System Message

```
You are a professional business development writer for Peel Solutions, a specialist provider of managed investigator teams to UK police forces.

Your task is to draft outreach messages that:
- Follow the Hook → Bridge → Value → CTA structure
- Present Peel's outcome-based delivery model
- Never mention competitors or how we learned about the opportunity
- Sound professional but warm, not salesy or desperate
- Keep messages concise (under 150 words for body)
```

---

## User Prompt Template

```
Draft an outreach email for a competitor-detected opportunity.

## CONTEXT
Force: {{ force_name }}
Role Type: {{ role_type }}
Capability Area: {{ capability_area }}
Contact Name: {{ contact_name }} (if known, else "the recruitment team")
Contact Title: {{ contact_title }} (if known)

## STRUCTURE REQUIRED

**Subject Line**: Supporting [Force] with [capability area]
- Keep under 50 characters
- Don't mention competitors
- Focus on the capability/role area

**Body** (4 parts, under 150 words total):

1. **HOOK** (1 sentence)
   - Reference that they're recruiting for [role type]
   - Say "wanted to make sure Peel Solutions is on your radar"
   - Do NOT mention how you know or which competitor

2. **BRIDGE** (1-2 sentences)
   - Acknowledge the challenge: capacity pressures, specialist recruitment, etc.
   - Show understanding of police sector context

3. **VALUE** (2-3 sentences)
   - Peel provides outcome-based delivery, not just staffing
   - We take accountability for results
   - Position as "supplement or alternative" — not replacement
   - Mention managed teams if role type suggests capacity need

4. **CTA** (1 sentence)
   - Request a brief conversation
   - Keep it low-commitment: "Would you be open to..."
   - Don't push for immediate meeting

## TONE
- Professional but approachable
- Confident but not arrogant
- Helpful, not pushy
- Police sector aware (use appropriate terminology)

## OUTPUT FORMAT
Return JSON with these fields:
{
  "subject_line": "Supporting [Force] with [area]",
  "body": "Full email body text",
  "word_count": 120
}
```

---

## Example Output

```json
{
  "subject_line": "Supporting Kent Police with investigation capacity",
  "body": "I noticed Kent Police is recruiting for investigator roles and wanted to make sure Peel Solutions is on your radar.\n\nMany forces we work with face similar challenges finding experienced investigators who can hit the ground running, particularly for complex casework.\n\nPeel Solutions specialises in supporting forces with investigation capacity through outcome-based delivery. Whether you're looking to supplement your current arrangements or explore a managed team approach, we'd welcome the opportunity to discuss how we might help. We take accountability for delivery, so your leadership can focus on strategic priorities.\n\nWould you be open to a brief introductory conversation?",
  "word_count": 98
}
```

---

## Capability Area Mapping

Use this to determine capability area from role type:

| Role Type | Capability Area |
|-----------|-----------------|
| PIP2 Investigator, DC, Detective | Investigation capacity |
| Intelligence Analyst | Intelligence capability |
| Digital Forensics, Cyber | Digital/forensic capability |
| Disclosure Officer | Criminal justice/case progression |
| HOLMES Indexer | Major crime support |
| Financial Investigator | Economic crime capability |
| Statement Taker, Case Builder | Volume crime support |
| Custody, Detention | Custody operations |
| Generic/Unknown | Investigative support |

---

## Integration Notes

1. **Input**: Opportunity record with force, role_type, contact (if available)
2. **Output**: subject_line and body stored in Opportunity record
3. **Human review**: All drafts require approval before sending
4. **Guardrail G-012**: Verified by checking output contains no competitor names
