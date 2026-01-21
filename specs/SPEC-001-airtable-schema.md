# SPEC-001: Airtable Schema

**Status**: Complete  
**Phase**: 1 — Core Jobs Pipeline  
**Dependencies**: None (foundational)  
**Source of Truth**: `peel-solutions-mi-platform-strategy.md` Section 6

---

## Objective

Create the Airtable schema exactly as specified in the strategy document. This is the foundation everything else builds on.

---

## Tables Overview

The strategy defines 6 tables for the core platform (Section 6), with 2 additional tables for email/tender tracking in later phases:

| Table | Phase | Purpose |
|-------|-------|---------|
| **Signals** | 1 | Raw intelligence from all sources |
| **Opportunities** | 1 | Actionable leads (one per force with active signals) |
| **Contacts** | 1 | People at police forces |
| **Forces** | 1 | Reference data for 43+ police forces |
| Emails | 2a | Email inbox management |
| Tender_Responses | 2b | Active tender pursuit tracking |

**Phase 1 scope**: Create all 4 core tables. Emails and Tender_Responses deferred.

---

## Table 1: Signals

Raw intelligence as it arrives from all sources.

| Field | Type | Description |
|-------|------|-------------|
| `signal_id` | Auto Number | Unique identifier |
| `type` | Single Select | `job_posting`, `competitor_job`, `tender`, `contract_award`, `hmicfrs`, `reg28`, `news` |
| `source` | Single Select | `indeed`, `red_snapper`, `investigo`, `reed`, `adecco`, `service_care`, `fts`, `contracts_finder`, `hmicfrs`, `judiciary`, `google_news` |
| `force` | Link → Forces | Which police force this relates to |
| `title` | Text | Job title, tender name, headline |
| `url` | URL | Source link |
| `raw_data` | Long Text | Full scraped content (JSON) |
| `relevance_score` | Number (0-100) | AI-assigned relevance |
| `relevance_reason` | Long Text | AI explanation |
| `status` | Single Select | `new`, `processing`, `relevant`, `irrelevant`, `merged` |
| `detected_at` | DateTime | When we found it |
| `expires_at` | DateTime | When it becomes stale |
| `competitor_source` | Single Select | Which competitor (if applicable) |
| `tender_deadline` | DateTime | Submission deadline (tenders) |
| `tender_value` | Currency | Estimated value (tenders) |
| `tender_reference` | Text | Official reference (tenders) |
| `hmicfrs_rating` | Single Select | Rating given (regulatory) |
| `award_winner` | Text | Who won (awards) |
| `contract_end_date` | Date | When contract ends (awards) |

**Phase 1d Additions** (Quality Improvement):
| Field | Type | Description |
|-------|------|-------------|
| `role_type` | Single Select | `investigator`, `forensic`, `intelligence`, `disclosure`, `other` |
| `seniority` | Single Select | `senior`, `mid`, `junior`, `unknown` |
| `ai_confidence` | Number (0-100) | Classification confidence score |
| `force_source` | Single Select | `matched`, `inferred`, `manual` — how force was identified |
| `first_seen` | DateTime | First scrape timestamp (for deduplication) |
| `last_seen` | DateTime | Most recent scrape timestamp |
| `scrape_count` | Number | Times seen in scrapes |

**Note on G-001**: The strategy's `raw_data` field serves the same purpose as a separate archive table — full JSON preserved for debugging. The `status` field tracks processing state. This satisfies G-001's intent without a separate table.

---

## Table 2: Opportunities

One record per police force with active signals.

| Field | Type | Description |
|-------|------|-------------|
| `opportunity_id` | Auto Number | Unique identifier |
| `force` | Link → Forces | Which police force |
| `signals` | Link → Signals | All related signals (multiple) |
| `signal_count` | Rollup | Count of linked signals |
| `signal_types` | Rollup | Types of signals present |
| `priority_score` | Formula | Calculated priority |
| `priority_tier` | Formula | `hot`, `high`, `medium`, `low` |
| `status` | Single Select | `researching`, `ready`, `sent`, `replied`, `meeting`, `proposal`, `won`, `lost`, `dormant` |
| `contact` | Link → Contacts | Primary contact |
| `contact_confidence` | Single Select | `verified`, `likely`, `guess` |
| `outreach_draft` | Long Text | Message to send |
| `outreach_channel` | Single Select | `email`, `linkedin` |
| `outreach_angle` | Single Select | `direct_hiring`, `competitor_intercept`, `tender`, `regulatory`, `proactive` |
| `last_contact_date` | DateTime | When we last reached out |
| `next_action_date` | DateTime | Follow-up reminder |
| `is_competitor_intercept` | Checkbox | Time-sensitive interception? |
| `competitor_detected` | Single Select | Which competitor triggered |
| `notes` | Long Text | Free-form notes |
| `created_at` | DateTime | Record creation |
| `updated_at` | DateTime | Last modification |

---

## Table 3: Contacts

People at police forces. Syncs bidirectionally with HubSpot.

| Field | Type | Description |
|-------|------|-------------|
| `contact_id` | Auto Number | Unique identifier |
| `hubspot_id` | Text | HubSpot contact ID |
| `name` | Text | Full name |
| `first_name` | Text | First name |
| `force` | Link → Forces | Which force |
| `role` | Text | Job title |
| `department` | Single Select | `HR`, `Resourcing`, `PVP`, `Crime`, `Professional Standards`, `Procurement`, `Other` |
| `seniority` | Single Select | `Director`, `Head`, `Manager`, `Officer`, `Unknown` |
| `email` | Email | Work email |
| `linkedin_url` | URL | LinkedIn profile |
| `phone` | Phone | If known |
| `relationship_status` | Single Select | `unknown`, `cold`, `warm`, `active`, `champion` |
| `last_interaction` | DateTime | Last contact date |
| `interaction_count` | Number | Total interactions |
| `source` | Text | How we found them |
| `verified` | Checkbox | Email confirmed working |
| `notes` | Long Text | Relationship notes |

---

## Table 4: Forces

Reference data for all UK police forces.

| Field | Type | Description |
|-------|------|-------------|
| `force_id` | Auto Number | Unique identifier |
| `name` | Text | Full name (e.g., "Hampshire Constabulary") |
| `short_name` | Text | Short name (e.g., "Hampshire") |
| `region` | Single Select | Geographic region |
| `country` | Single Select | `England`, `Wales`, `Scotland`, `Northern Ireland` |
| `size` | Single Select | `large`, `medium`, `small` |
| `officer_count` | Number | Approximate strength |
| `website` | URL | Force website |
| `careers_url` | URL | Careers page |
| `procurement_url` | URL | Procurement page |
| `hubspot_company_id` | Text | HubSpot company ID |
| `current_relationship` | Single Select | `none`, `prospect`, `active`, `customer`, `former_customer` |
| `competitor_incumbent` | Multiple Select | Known competitors |
| `peel_investigating` | Single Select | Current PEEL rating |
| `peel_pvp` | Single Select | Current PEEL rating |
| `peel_last_inspection` | Date | Last inspection date |
| `active_contracts` | Long Text | Known contracts (JSON) |
| `contract_renewals` | Long Text | Upcoming renewals (JSON) |
| `notes` | Long Text | Force-specific notes |

---

## Creation Order

Create in dependency order:

1. **Forces** — no dependencies
2. **Contacts** — links to Forces
3. **Signals** — links to Forces
4. **Opportunities** — links to Forces, Signals, Contacts

---

## Seeding: Forces Table

After Forces table created, populate from `reference-data/uk-police-forces.json`:

**Field mapping:**
- Match JSON fields to table fields by name
- Set `current_relationship` = `none` for all
- Leave PEEL fields empty (Phase 4)
- Leave HubSpot IDs empty (populated during HubSpot sync)

**Verification:** 43+ records (strategy says 43 territorial forces, reference data has 48 including specialist forces)

---

## Formula Fields

**Opportunities.priority_score** and **priority_tier** require formulas. For Phase 1, create as Number and Single Select respectively — formulas will be configured after we validate the scoring logic works.

**Opportunities.signal_count** and **signal_types** are Rollup fields:
- `signal_count`: COUNT of linked Signals
- `signal_types`: ARRAYJOIN of Signal.type values

---

## Acceptance Criteria

| Criteria | Verification |
|----------|--------------|
| 4 tables exist in MI Platform base | Airtable UI shows Forces, Signals, Opportunities, Contacts |
| Field names match strategy exactly | Compare to this spec |
| Linked record relationships work | Create test records with links |
| Forces seeded with reference data | 43+ records in Forces table |
| Rollup fields calculate | Link test signal, verify count updates |

---

## Files to Create/Update

| File | Action |
|------|--------|
| `.claude/skills/airtable-schema/table-ids.json` | Create — store tableId and fieldId values after creation |
| `STATUS.md` | Update — mark schema creation complete |

**Note:** We're creating a minimal `table-ids.json` for IDs only, not duplicating the full schema. The strategy document remains the source of truth for schema design.

---

## Handoff to Claude Code

**Context**: Foundation schema — every Phase 1 workflow depends on these tables existing

**Source of truth**: `peel-solutions-mi-platform-strategy.md` Section 6 (in project knowledge files)

**Reference data**: `reference-data/uk-police-forces.json` for seeding Forces

**On completion**:
- All 4 tables created with correct fields
- Forces seeded
- Table/field IDs captured in `table-ids.json`
- STATUS.md updated
