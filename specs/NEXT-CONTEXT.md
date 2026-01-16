# Context Brief: Phase 1b — Competitor Monitoring

Generated: 16 January 2025
For: Claude Chat spec drafting

---

## Current State

**Phase**: 1 — Core Jobs Pipeline
**Goal**: Indeed jobs → classified signals → opportunities
**Blockers**: None — Phase 1 tables need creation first

---

## Acceptance Criteria (from ROADMAP.md)

- [ ] Competitor scrapers running (Red Snapper, Investigo, Reed, Adecco, Service Care)
- [ ] Competitor signals classified and attributed to correct force
- [ ] Hot lead flagging working (competitor signal = higher priority)
- [ ] Alert on hot leads (Slack or email)
- [ ] Interception message template in use

**Dependencies**: Phase 1 complete

---

## Existing Assets

### Patterns (reuse these, don't recreate)
- `patterns/force-matching.js` — UK police force name matching (47 patterns, G-005 compliant)
- `patterns/job-portal-filters.js` — Filter job portal false positives from news (G-010)
- `patterns/indeed-keywords.json` — 30 Indeed search keywords

### Prompts (can extend or reference)
- `prompts/job-classification.md` — Claude prompt for classifying job signals (adapt for competitors)
- `prompts/email-triage.md` — Claude prompt for email classification

### Reference Data (source of truth)
- `reference-data/competitors.json` — 7 competitor definitions (Red Snapper, Investigo, etc.)
- `reference-data/uk-police-forces.json` — 48 UK police forces with metadata
- `reference-data/capability-areas.json` — 14 capability areas for classification

### Skills & Rules
- `.claude/skills/force-matching/` — Force identification skill (enforces G-005)
- `.claude/skills/airtable-schema/` — Airtable table/field quick reference
- `.claude/rules/n8n.md` — n8n workflow structure requirements
- `.claude/rules/airtable.md` — Airtable API patterns and rate limits

---

## Applicable Guardrails

| ID | Rule | Relevance |
|----|------|-----------|
| G-001 | Dumb Scrapers + Smart Agents | Scrape competitor jobs to raw archive first |
| G-003 | Bright Data Over Firecrawl | Competitor sites may block datacenter IPs |
| G-005 | Fuzzy JS Matching Before AI | Attribute jobs to forces via patterns first |
| G-009 | Strict Date Filtering | 24h window to prevent duplicate competitor jobs |
| G-011 | Upsert Only (No Loop Delete) | Safe sync of competitor signals |

---

## Recent Decisions

| Decision | Date | Impact |
|----------|------|--------|
| A4: Two-Layer Claude Architecture | 16 Jan 2025 | Chat designs spec, Code builds |
| A5: Hook-Based Session Management | Jan 2025 | Context injection for workflows |
| A6: Document Hygiene Protocol | 16 Jan 2025 | Keep specs under 200 lines |

---

## Notes for Claude Chat

- Reference assets by path (e.g., `patterns/force-matching.js`)
- Competitors defined in `reference-data/competitors.json` — use these names
- New competitor-specific prompts go in `prompts/`
- Spec output should go in `specs/phase-1b-competitors.md`
- Keep spec under 200 lines
- Phase 1 must complete before Phase 1b can run
