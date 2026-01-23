# Context Brief: Relationship Decay Scanner

Generated: 23 January 2026
For: Spec drafting (see .claude/rules/spec-creation.md)

---

## Current State

**Phase**: 1d + 2a (Parallel)
**Goal**: Quality monitoring + Email integration — next: build relationship decay workflows
**Blockers**: None

---

## Acceptance Criteria (from ROADMAP.md)

Phase 2a acceptance criteria (relevant to relationship decay):

- [ ] Relationship decay tracking active (daily scan)
- [ ] Dashboard shows "Relationships Need Attention" section
- [ ] AI-suggested touchpoints for cold contacts

Schema additions required (from ROADMAP.md):
- `relationship_status` (Single Select: Active/Warming/Cold/At-Risk) on Contacts
- `last_contact_date` (Date) on Contacts
- `decay_alert_sent` (DateTime) on Contacts

---

## Existing Assets

### Patterns (reuse these, don't recreate)
- `patterns/force-matching.js` — UK police force name matching (G-005) — 47 patterns

### Prompts (can extend or reference)
- `prompts/email-triage.md` — Email classification prompt (may inform touchpoint suggestions)
- `prompts/opportunity-enrichment.md` — Enrichment patterns for contact context
- `prompts/contact-research-agent.md` — Contact research prompts
- `prompts/outreach-drafting-agent.md` — Message drafting patterns (for touchpoint suggestions)

### Reference Data (source of truth)
- `reference-data/uk-police-forces.json` — 48 UK police forces with metadata

### Skills & Rules
- `.claude/skills/hubspot-integration/` — HubSpot API patterns, n8n patterns, gotchas
- `.claude/skills/n8n-workflow-patterns/` — Scheduled task patterns (for daily scan)
- `.claude/skills/adhd-interface-design/` — ADHD-first dashboard patterns
- `.claude/skills/airtable-operations/` — Airtable API patterns
- `.claude/rules/n8n.md` — n8n workflow structure requirements

### Related Spec Content (from SPEC-012)
- Section 6: Full two-tier decay architecture already documented
- Section 10 (Phase 2a-7): Implementation phases outlined
- Workflow WF4: MI: Relationship Decay Scanner already described

---

## Applicable Guardrails

| ID | Rule | Relevance |
|----|------|-----------|
| G-005 | Fuzzy JS Matching Before AI | Force lookup when matching org to force |
| G-011 | Upsert Only (No Loop Delete) | When updating contact decay status |
| G-012 | Value Proposition First | AI touchpoint suggestions must NOT be salesy |
| G-015 | Message Structure | Follow-up messages use Hook → Bridge → Value → CTA |

---

## Recent Decisions

| Decision | Date | Impact |
|----------|------|--------|
| **I1**: HubSpot as Primary Data Source | 23 Jan | Query HubSpot directly for engagement data, NOT Airtable copy |
| **I4**: Include Closed Won Contacts | 23 Jan | Two-tier thresholds: Active Pipeline (8/15/30d) + Closed Won (30/60/90d) |
| **A12**: V1 Vision Reprioritisation | 23 Jan | Relationship decay moved to Phase 2a (high ADHD value) |

---

## Strategy Alignment Check

Before drafting, verify:
- SPEC-012 Section 6 already contains detailed decay architecture — this spec should reference, not duplicate
- Decision I1 confirms HubSpot as source — no Airtable duplication
- Decision I4 confirms two-tier (deal-level + org-level) architecture
- Three dashboard sections required: "Deal Contacts Going Cold", "Client Check-ins Due", "Organisations Going Quiet"

**No divergence identified** — implementation spec should follow SPEC-012 §6 design.

---

## Notes for Spec Creation

### What This Spec Should Cover

This is a **focused implementation spec** for:
1. **Phase 2a-7**: MI: Relationship Decay Scanner workflow
2. **Dashboard components**: Three decay panels

It should NOT re-document the architecture (already in SPEC-012 §6).

### Key HubSpot Fields (from Decision I1)
- `notes_last_contacted` — Last logged activity
- `hs_last_sales_activity_timestamp` — Last sales activity
- `hs_sales_email_last_replied` — Email engagement
- Deal associations and pipeline stages

### Output Format
The workflow should output to a format consumable by the dashboard API, not necessarily to Airtable. Consider:
- JSON endpoint for dashboard to fetch
- Or lightweight Airtable table for decay alerts only

### Threshold Logic (from SPEC-012 §6)
| Stage | 8-14d | 15-30d | 30+d |
|-------|-------|--------|------|
| Active Pipeline | Yellow | Orange | Red |
| Closed Won | — | Yellow (31-60d) | Orange (61-90d), Red (90+d) |
| Organisation | Yellow (31-60d) | Orange (61-90d) | Red (90+d) |

### AI Touchpoint Suggestions
Must be **non-salesy**:
- Share relevant article
- Congratulate on news/achievement
- Check in on previous project
- Reference industry development

Reference `prompts/outreach-drafting-agent.md` for tone but adapt for relationship maintenance vs sales outreach.
