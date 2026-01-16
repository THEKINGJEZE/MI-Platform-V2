# Job Classification Prompt

## Purpose
Classify job postings for relevance to UK police/law enforcement sector.
Used in Indeed receiver and competitor jobs receiver workflows.

## Model
`gpt-4o-mini` (or Claude equivalent)

## Source
Extracted from MI-Platform-Fresh-Start `indeed-receiver-bright-data.json`

---

## System Message

```
You are a Jobs Screening Agent for UK Police sector recruitment intelligence.
```

---

## User Prompt Template

```
Analyze this job posting and determine if it is relevant to the UK police/law enforcement sector.

## JOB DETAILS
Title: {{ $json.job_title }}
Employer: {{ $json.company_name }}
Location: {{ $json.location }}
Region: {{ $json.region }}
Description: {{ $json.description_text }}

## CRITICAL: LAW ENFORCEMENT SCOPE
This filter targets the **UK law enforcement and criminal justice sector**, which extends beyond just police forces.

## TASK 1 - POLICE/LAW ENFORCEMENT RELEVANCE
**ALWAYS ACCEPT if ANY of these are true:**
- Employer IS a UK police force
- Employer IS a police-related body (College of Policing, NCA, IOPC)
- Job title contains "police"
- Employer IS a known police recruitment agency (Red Snapper, Matrix SCM, etc.)

## LAW ENFORCEMENT FUNCTIONS (Accept)
- Serious Crime Investigation
- Criminal Justice
- Intelligence
- Forensics
- Public Protection
- Security Vetting

## KEYWORD INDICATORS (Strong Accept)
- PACE, CPIA, PIP, ABE, MAPPA, MARAC
- Disclosure, Case File, Criminal Justice Unit
- Digital Forensics, HOLMES, Major Incident Room
- Safeguarding, Child Protection, Vulnerable Adult

## REJECT ONLY if ALL of these are true:
- Employer is private sector (banks, tech, retail) with NO law enforcement connection
- Role is generic (IT Support, HR Admin, Finance) with NO law enforcement context
- Employer is NHS/healthcare (UNLESS role is "Police Custody" healthcare)
- Location is outside UK

## OUTPUT FORMAT
Respond in JSON format ONLY with these keys:
```

---

## Expected Output Schema

```json
{
  "relevant": true,
  "confidence": 85,
  "reasoning": "Direct police employer (Metropolitan Police Service) posting for Investigation role",
  "force": "Metropolitan Police Service",
  "force_confidence": 95,
  "rejection_reason": null,
  "role_type": "Investigation"
}
```

### Field Definitions

| Field | Type | Description |
|-------|------|-------------|
| `relevant` | boolean | Whether job is relevant to police sector |
| `confidence` | number | 0-100 confidence score |
| `reasoning` | string | Brief explanation of decision |
| `force` | string\|null | Identified UK police force if applicable |
| `force_confidence` | number | 0-100 confidence in force identification |
| `rejection_reason` | string\|null | If rejected, why |
| `role_type` | string | Category: Investigation, Intelligence, Custody, etc. |

---

## Confidence Scoring Rules

| Score | Action | Description |
|-------|--------|-------------|
| **>70%** | Accept | Auto-process, create signal |
| **50-70%** | Review | Flag for manual check |
| **<50%** | Reject | Archive, don't create signal |

---

## Integration Notes

1. **Before AI**: Run `patterns/force-matching.js` to pre-match forces (faster, free)
2. **AI handles**: Ambiguous employers, complex role descriptions
3. **After AI**: Store raw response in `Jobs_Raw_Archive`, clean record in `Signals`
