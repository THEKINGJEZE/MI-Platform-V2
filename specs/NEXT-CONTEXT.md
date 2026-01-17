# Context Brief: Opportunity Enrichment (SPEC-005)

Generated: 17 January 2025
For: Claude Chat spec drafting

---

## Current State

**Phase**: 1 — Core Jobs Pipeline
**Goal**: Build WF5: Opportunity Enricher
**Blockers**: None

---

## Acceptance Criteria (from ROADMAP.md)

Phase 1 criteria relevant to enrichment:
- [ ] Basic enrichment working (contact lookup, message draft)
- [ ] Can review opportunity and mark as sent
- [ ] End-to-end test: fake job → classified → opportunity → reviewed

---

## Workflow Context

**Upstream**: WF4 (Opportunity Creator) outputs opportunities with `status=researching`
- Creates/updates opportunity records linking signals to forces
- Node 9 is placeholder for SPEC-005 trigger
- New opportunities need: contact lookup, message drafting

**Expected trigger**: Called by WF4 for newly created opportunities OR scheduled pickup of `status=researching` opportunities

**Output goal**: Opportunities with `status=ready` containing:
- Contact (from Contacts table, linked to force)
- Draft message (personalised outreach)
- Priority score
- "Why now" narrative

---

## Existing Assets

### Patterns (reuse these, don't recreate)
- `patterns/force-matching.js` — UK police force name matching (47 patterns, used in classification)
- `patterns/indeed-keywords.json` — Indeed search keywords configuration
- `patterns/job-portal-filters.js` — Filter job portal false positives (G-010)

### Prompts (can extend or reference)
- `prompts/job-classification.md` — Claude prompt for classifying job signals (model: gpt-4o-mini)
- `prompts/email-triage.md` — Claude prompt for email classification

### Reference Data (source of truth)
- `reference-data/uk-police-forces.json` — 48 UK police forces with metadata
- `reference-data/competitors.json` — 7 competitor definitions
- `reference-data/capability-areas.json` — 14 capability areas for classification

### Skills & Rules
- `.claude/skills/force-matching/SKILL.md` — Force identification skill (G-005)
- `.claude/skills/airtable-schema/table-ids.json` — Current Airtable table/field IDs
- `.claude/rules/airtable.md` — Airtable API patterns, rate limits (5 req/s, batch 10)
- `.claude/rules/n8n.md` — n8n workflow structure requirements

---

## Airtable Schema (from table-ids.json)

**Base ID**: `appEEWaGtGUwOyOhm`

| Table | ID | Key Fields |
|-------|-----|------------|
| Forces | `tblbAjBEdpv42Smpw` | name, region, country, size, hubspot_company_id |
| Contacts | `tbl0u9vy71jmyaDx1` | force (linked) |
| Signals | `tblez9trodMzKKqXq` | title, type, source, force, status, opportunity |
| Opportunities | `tblJgZuI3LM2Az5id` | name, force, signals, status, contact |

**Opportunity status values**: researching → ready → sent → replied → meeting → proposal → won/lost/dormant

---

## Applicable Guardrails

| ID | Rule | Relevance |
|----|------|-----------|
| G-002 | Command Queue for Email Actions | DO NOT send emails directly — write to queue |
| G-005 | Fuzzy JS Matching Before AI | Already done in WF3, not needed here |
| G-007 | No CLI Agents (Use n8n) | Build as n8n workflow, not scripts |
| G-011 | Upsert Only (No Loop Delete) | Use upsert when updating opportunities |

---

## Recent Decisions

| Decision | Date | Impact |
|----------|------|--------|
| A2: Airtable as Primary Database | Jan 2025 | Contacts stored in Airtable, not HubSpot |
| A3: Self-Hosted n8n | Jan 2025 | No execution limits for enrichment |
| HTTP Request for Airtable updates in loops | Jan 2025 | n8n bug workaround — use HTTP not native node |
| WF3 uses OpenAI gpt-4o-mini | Jan 2025 | Cost-effective model for AI tasks |

---

## Key Questions for Spec

1. **Contact lookup strategy**:
   - Does Contacts table have data? Or seed from HubSpot?
   - What fields are needed? (name, email, role, phone?)
   - Fallback if no contact exists for force?

2. **Message drafting**:
   - What personalisation variables? (force name, signal titles, role type)
   - Template-based or AI-generated each time?
   - Where is the draft stored? (Opportunities table field? Separate table?)

3. **Priority scoring**:
   - What factors? (signal count, recency, competitor involvement)
   - Numeric score or categorical (hot/warm/cold)?

4. **"Why now" narrative**:
   - AI-generated summary of why this opportunity is timely?
   - Based on signal titles/descriptions?

5. **HubSpot integration**:
   - Does enrichment sync to HubSpot?
   - Or is that a separate workflow?

---

## Notes for Claude Chat

- Reference assets by path (e.g., `patterns/force-matching.js`)
- New prompts go in `prompts/` (e.g., `prompts/opportunity-enrichment.md`)
- Spec output should go in `specs/SPEC-005-opportunity-enricher.md`
- Keep spec under 200 lines
- WF4 has placeholder at Node 9 ready for SPEC-005 integration
- Consider both triggered (from WF4) and scheduled (catch stragglers) execution
