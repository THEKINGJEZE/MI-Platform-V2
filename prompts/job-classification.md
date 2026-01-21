# Job Classification Prompt

## Purpose
Classify job postings for relevance to UK police/law enforcement sector.
Used in Indeed receiver and competitor jobs receiver workflows.

## Model
`gpt-4o-mini` (or Claude equivalent)

## Source
Originally from MI-Platform-Fresh-Start; Updated 2025-01 for hard gates and role classification.

---

## System Message

```
You are a Jobs Screening Agent for UK Police sector recruitment intelligence. You MUST include the signal_id in your response exactly as provided.
```

---

## User Prompt Template

```
SIGNAL_ID: {{ signal_id }}

Analyze this job posting and determine if it is relevant to Peel Solutions' target market.

## JOB DETAILS
Title: {{ job_title }}
Employer: {{ company_name }}
Location: {{ location }}
Description: {{ description_text }}

## PEEL SOLUTIONS TARGET MARKET
Peel Solutions provides **civilian staff** (not sworn officers) to UK police forces for:
- Investigation support (PIP2 investigators, case builders, statement takers)
- Disclosure and criminal justice (disclosure officers, case file prep)
- Intelligence (analysts, researchers, indexers)
- Digital forensics (examiners, technicians)

## HARD REJECTION GATES (Return relevant=false immediately)

### Gate 1: Sworn Police Officer Roles (ALWAYS REJECT)
REJECT if job title contains ANY of:
- "Detective Constable", "Detective Sergeant", "Detective Inspector", "DCI", "DCS"
- "Police Constable", "PC", "Sergeant", "Inspector"
- "PCSO", "Police Community Support Officer"
- "Special Constable"
These are warranted officers - Peel provides civilian staff only.

### Gate 2: Non-Police Organisations (ALWAYS REJECT)
REJECT if employer is ANY of these (unless role explicitly mentions police):
- NHS, Hospital, Health Trust, CCG
- Environment Agency
- Probation Service, HMPPS
- Private banks (Barclays, HSBC, Lloyds, etc.)
- Private tech companies (unless government contractor)
- Retail (Tesco, Sainsbury's, etc.)
- Local councils (unless "Police and Crime Commissioner" or similar)
- IOPC (oversight body, not operational)

### Gate 3: Out-of-Scope Roles (REJECT)
REJECT if role is clearly NOT relevant to police operations:
- Pure IT support (helpdesk, network admin - NOT digital forensics)
- Finance/Accounting (unless fraud investigation related)
- HR/Recruitment (unless police resourcing team)
- Facilities/Maintenance
- Volunteer roles
- Administrative assistant (unless "Criminal Justice Admin" or similar)
- Communications/PR

## ACCEPTANCE CRITERIA (If passed all gates)

**ACCEPT if employer IS a UK police force** (43 territorial + specialist forces)
Examples: Metropolitan Police, Kent Police, Hampshire Constabulary, British Transport Police, etc.

**ACCEPT if employer IS a police staffing agency** posting FOR a police force:
- Red Snapper, Investigo, Reed, Adecco, Service Care, Hays, Matrix SCM

**ACCEPT if role clearly involves police functions:**
- Investigation: PIP2, Investigator, Case Builder, Statement Taker
- Disclosure: Disclosure Officer, CPIA, Unused Material
- Criminal Justice: CJ Unit, Case File, Charging
- Intelligence: Analyst, Intelligence Officer, HOLMES, Indexer
- Forensics: Digital Forensics, Hi-Tech Crime, CSI, SOCO
- Safeguarding: Public Protection, MASH, Child Protection

**KEYWORD TRIGGERS (Strong Accept):**
- PACE, CPIA, PIP, ABE, MAPPA, MARAC, RASSO
- HOLMES, MIR, Major Incident Room
- Vetting, SC, DV, NPPV
- Crime, Criminal, Custody, Detainee

## ROLE TYPE CLASSIFICATION (Required Field)

Classify the role into ONE of these categories:
- `investigator` - PIP investigators, case builders, statement takers, interview roles
- `disclosure` - Disclosure officers, CPIA roles, unused material handlers
- `case_handler` - Criminal justice, case file prep, court liaison
- `analyst` - Intelligence analysts, researchers, data analysts (police context)
- `forensics` - Digital forensics, hi-tech crime, CSI roles
- `review` - Review officers, quality assurance, case reviewers
- `other` - If relevant but doesn't fit above (explain in reasoning)

## SENIORITY CLASSIFICATION (Required Field)

Classify the seniority level:
- `director` - Director, Chief, Head of Department
- `head` - Head of, Lead, Principal, Senior Manager
- `manager` - Manager, Supervisor, Team Leader
- `officer` - Standard professional role (Officer, Investigator, Analyst, etc.)
- `unknown` - Cannot determine from job title

## OUTPUT FORMAT
You MUST respond with valid JSON containing these EXACT keys:

{
  "signal_id": "<COPY THE SIGNAL_ID FROM INPUT EXACTLY>",
  "relevant": true/false,
  "confidence": 0-100,
  "reasoning": "Brief explanation of decision",
  "force": "UK police force name if identified, or null",
  "force_confidence": 0-100,
  "rejection_reason": "If rejected, which gate triggered. Otherwise null",
  "role_type": "investigator|disclosure|case_handler|analyst|forensics|review|other",
  "seniority": "director|head|manager|officer|unknown"
}

IMPORTANT:
- If role_type is "other" AND employer is NOT a police force → set relevant=false
- Include the signal_id exactly as provided in the input
- Be conservative: when in doubt, set relevant=false (reduces false positives)
```

---

## Expected Output Schema

```json
{
  "signal_id": "recABC123xyz",
  "relevant": true,
  "confidence": 85,
  "reasoning": "Metropolitan Police posting for PIP2 Investigator - core target role",
  "force": "Metropolitan Police Service",
  "force_confidence": 95,
  "rejection_reason": null,
  "role_type": "investigator",
  "seniority": "officer"
}
```

### Rejection Example

```json
{
  "signal_id": "recXYZ789",
  "relevant": false,
  "confidence": 95,
  "reasoning": "Gate 1 rejection - Detective Constable is a sworn officer role",
  "force": "Kent Police",
  "force_confidence": 90,
  "rejection_reason": "Gate 1: Sworn police officer role (Detective Constable)",
  "role_type": "investigator",
  "seniority": "officer"
}
```

### Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `signal_id` | string | Yes | Echo back the input signal_id exactly |
| `relevant` | boolean | Yes | Whether job is relevant to Peel's target market |
| `confidence` | number | Yes | 0-100 confidence in the decision |
| `reasoning` | string | Yes | Brief explanation (1-2 sentences) |
| `force` | string\|null | Yes | UK police force name if identified |
| `force_confidence` | number | Yes | 0-100 confidence in force identification |
| `rejection_reason` | string\|null | Yes | Gate that triggered rejection, or null |
| `role_type` | string | Yes | One of: investigator, disclosure, case_handler, analyst, forensics, review, other |
| `seniority` | string | Yes | One of: director, head, manager, officer, unknown |

---

## Validation Rules

The workflow should validate:
1. `signal_id` is present and matches input
2. `relevant` is boolean
3. `role_type` is one of the allowed values
4. `seniority` is one of the allowed values
5. If `relevant=false`, `rejection_reason` should explain why

---

## Integration Notes

1. **Before AI**: Run `patterns/force-matching.js` to pre-match forces (faster, free)
2. **AI handles**: Ambiguous employers, role classification, gate evaluation
3. **After AI**:
   - If `relevant=true`: status='relevant', write role_type and seniority to Signals
   - If `relevant=false`: status='irrelevant', log rejection_reason
4. **Fallback**: If AI fails to parse, default to `relevant=false` with parsing error
