# Peel Solutions Market Intelligence Platform
## Complete Strategy & Architecture Document

**Version**: 1.0  
**Date**: January 2025  
**Author**: James (Director, Peel Solutions)  
**Status**: Final

---

# Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Strategic Context](#2-strategic-context)
3. [Platform Vision](#3-platform-vision)
4. [Design Principles](#4-design-principles)
5. [Intelligence Sources](#5-intelligence-sources)
6. [Data Architecture](#6-data-architecture)
7. [The Signal-to-Opportunity Pipeline](#7-the-signal-to-opportunity-pipeline)
8. [Competitor Interception Strategy](#8-competitor-interception-strategy)
9. [Priority Scoring System](#9-priority-scoring-system)
10. [Workflow Specifications](#10-workflow-specifications)
11. [Dashboard Design](#11-dashboard-design)
12. [AI Integration](#12-ai-integration)
13. [Technology Stack](#13-technology-stack)
14. [Implementation Roadmap](#14-implementation-roadmap)
15. [Success Metrics](#15-success-metrics)
16. [Operational Procedures](#16-operational-procedures)
17. [Appendices](#17-appendices)

---

# 1. Executive Summary

## The Problem

Peel Solutions provides managed investigator teams and staffing solutions to UK police forces. Business development currently relies on manual monitoring of job boards, occasional tender searches, and relationship-based outreach. This approach is:

- **Reactive** — we find opportunities after competitors
- **Inconsistent** — dependent on available time and attention
- **Unscalable** — can't systematically cover 43 police forces
- **Time-consuming** — hours spent on research that could be automated

## The Solution

A Market Intelligence Platform that automates business development by:

1. **Monitoring** multiple signal sources (job postings, tenders, regulatory reports, news)
2. **Classifying** signals to identify genuine opportunities
3. **Enriching** opportunities with contact information and drafted outreach
4. **Presenting** 3-5 ready-to-send leads every Monday morning

## The Outcome

| Metric | Before | After |
|--------|--------|-------|
| Time to find opportunities | Hours/week | Automated |
| Outreach preparation time | 30+ min/lead | 2 min/lead |
| Coverage of police forces | Partial | All 43 forces |
| Competitor visibility | Minimal | Real-time |
| Response to competitor activity | None | Same-day interception |

**Target state**: 15 minutes on Monday morning to review and send a week's worth of personalised outreach.

---

# 2. Strategic Context

## About Peel Solutions

Peel Solutions is a UK-based consultancy specialising in law enforcement services. Core offerings:

- **Teams-as-a-Service**: Managed investigator teams with outcome-based delivery
- **Staffing Solutions**: Temporary and contract placements for police forces
- **Consultancy**: Operational improvement for investigations and disclosure
- **Training**: Professional development for law enforcement personnel

## Target Market

- 43 territorial police forces in England, Wales, Scotland, and Northern Ireland
- Regional Organised Crime Units (ROCUs)
- National Crime Agency (NCA)
- British Transport Police and other specialist forces
- Police and Crime Commissioners (PCCs)

## The Sales Motion

```
Signal Detected → Contact Identified → Outreach Sent → Conversation Started → Opportunity Won
```

**Signals that indicate a force needs us**:
- Posting jobs for investigators, disclosure officers, case handlers
- Publishing tenders for staffing services
- Receiving poor HMICFRS ratings for investigations
- Appearing in news for case backlogs or capacity issues
- Using competitor agencies (indicating willingness to use external support)

## Competitive Landscape

| Competitor | Model | Strengths | Weaknesses |
|------------|-------|-----------|------------|
| Red Snapper Group | Agency staffing | Large candidate pool, established | Transactional, no outcomes |
| Investigo | Agency staffing | Public sector focus | Same as above |
| Reed | Generalist agency | Scale, brand recognition | Not specialist |
| Adecco | Generalist agency | Global reach | Not specialist |
| Service Care Solutions | Agency staffing | Police sector presence | Transactional model |

**Our Differentiation**: Managed teams with outcome-based delivery, not just individual placements. We take responsibility for results, not just filling seats.

---

# 3. Platform Vision

## The Monday Morning Experience

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   Good morning, James.                                              │
│                                                                     │
│   You have 5 opportunities ready to send.                          │
│   Estimated time: 12 minutes.                                       │
│                                                                     │
│   🔥 2 Hot Leads (competitor interceptions — act today)            │
│   📬 3 Standard Leads (weekly outreach)                            │
│                                                                     │
│   [Start Review →]                                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## The 95/5 Principle

| System Does (95%) | Human Does (5%) |
|-------------------|-----------------|
| Find job postings | Review the draft |
| Classify relevance | Add personal touch |
| Identify the right contact | Decide to send or skip |
| Draft the outreach message | Click send |
| Prioritise opportunities | Relationship judgment |
| Track responses | Take meetings |

## What Success Looks Like

**Week 1**: First ready-to-send leads from Indeed  
**Month 1**: Consistent weekly pipeline of 5+ opportunities  
**Month 3**: Full signal coverage (jobs, tenders, competitors)  
**Month 6**: Measurable increase in conversations and wins  

---

# 4. Design Principles

## ADHD-Optimised Workflow

The platform is designed for a user with ADHD, prioritising:

| Principle | Implementation |
|-----------|----------------|
| **Minimise decisions** | System decides, user confirms |
| **Single focus** | One opportunity at a time, not a list of 50 |
| **Clear priority** | Hot leads first, then Monday queue |
| **Visual feedback** | Progress indicators, status badges |
| **2-minute loops** | Review → tweak → send → next |
| **No rabbit holes** | Everything needed is on one screen |

## Quality Over Quantity

- 5 excellent leads beats 50 garbage ones
- High confidence required before surfacing to user
- Clear reasoning for why each lead matters
- Easy to skip without guilt

## Extensible Architecture

- Design for Phase 1, but don't require rewrites for Phase 5
- All signal types use the same pipeline pattern
- New sources slot in without restructuring
- Single-person maintainable

---

# 5. Intelligence Sources

## Overview

The platform monitors six categories of intelligence, implemented across phases:

| Source Category | Specific Sources | Signal Type | Phase |
|-----------------|------------------|-------------|-------|
| **Job Postings** | Indeed | Direct hiring intent | 1 |
| **Competitor Jobs** | Red Snapper, Investigo, Reed, Adecco, Service Care | Competitor activity + hiring intent | 1b |
| **Procurement** | Find a Tender, Contracts Finder | Tender opportunities | 2b |
| **Contract Awards** | Find a Tender, Contracts Finder | Competitor wins, contract intel | 3 |
| **Regulatory** | HMICFRS PEEL Reports, Reg 28 Reports | Forces under pressure | 4 |
| **News** | Google News, Force press releases | Breaking developments | 5 |

## Source Details

### 5.1 Job Postings (Phase 1)

**Source**: Indeed UK  
**URL**: indeed.co.uk  
**Method**: Bright Data web scraping  
**Frequency**: Every 4 hours during business hours  

**Search Queries**:
```
"police investigator"
"disclosure officer" + police
"case handler" + police
"case progression officer"
"intelligence analyst" + police
"review officer" + police
```

**Relevance Criteria**:
- Posted by UK police force
- Civilian role (not sworn officer)
- Investigation/disclosure/case handling function
- NOT: IT, admin, senior leadership, PCSOs

### 5.2 Competitor Job Boards (Phase 1b)

| Source | URL | Notes |
|--------|-----|-------|
| Red Snapper | redsnapper.jobs | Primary competitor |
| Investigo | investigo.co.uk/jobs | Public sector focus |
| Reed | reed.co.uk | Filter for police |
| Adecco | adecco.co.uk | Public sector section |
| Service Care | servicecare.org.uk | Police sector |

**Method**: Bright Data web scraping  
**Frequency**: Every 4 hours (time-sensitive for interception)  

**Intelligence Value**:
- Which forces use which competitors
- Live hiring needs (confirmed by competitor activity)
- Opportunity for immediate interception outreach

### 5.3 Procurement Notices (Phase 2b)

**Sources**:
- Find a Tender Service (FTS): find-tender.service.gov.uk
- Contracts Finder: contractsfinder.service.gov.uk

**Method**: API queries  
**Frequency**: Daily at 7am  

**Search Criteria**:
- Buyer: Police forces, PCCs, Home Office
- CPV Codes: 79610000, 79620000, 79630000 (staffing services)
- Keywords: investigator, disclosure, agency staff, managed service

**Notice Types**:
| Type | Meaning | Action |
|------|---------|--------|
| Contract Notice | Live tender | Pursue or monitor |
| PIN | Coming soon | Early awareness |
| Award Notice | Someone won | Intel (Phase 3) |
| DPS Notice | Framework opportunity | Get on the list |

### 5.4 Contract Awards (Phase 3)

**Sources**: Same as procurement (FTS, Contracts Finder)  
**Filter**: Award notices only  

**Intelligence Value**:
- Who won (competitor tracking)
- Contract value and duration
- Contract end dates (future opportunities)

### 5.5 Regulatory Signals (Phase 4)

**HMICFRS PEEL Reports**:
- Source: hmicfrs.justiceinspectorates.gov.uk
- Frequency: Weekly check
- Key Areas: "Investigating Crime", "Protecting Vulnerable People"
- Trigger: Ratings of "Requires Improvement" or "Inadequate"

**Reg 28 Reports**:
- Source: judiciary.uk/prevention-of-future-deaths
- Frequency: Weekly check
- Filter: Reports mentioning police, investigation failures

**Intelligence Value**: Forces under regulatory pressure may need external help to improve.

### 5.6 News & Events (Phase 5)

**Sources**:
- Google News API (or SerpAPI)
- Police force press releases (RSS)
- Trade publications (Police Professional)

**Keywords**:
```
"[force name]" + backlog
"[force name]" + investigation delays
"[force name]" + staffing shortage
"[force name]" + disclosure failures
```

**Intelligence Value**: Breaking context for outreach timing and framing.

---

# 6. Data Architecture

## Overview

Four core tables handle all data. The design is intentionally minimal but extensible.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   SIGNALS   │────▶│OPPORTUNITIES│────▶│  CONTACTS   │
│             │     │             │     │             │
│ Raw intel   │     │ Actionable  │     │ People to   │
│ from sources│     │ leads       │     │ reach       │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       └───────────────────┴───────────────────┘
                           │
                    ┌─────────────┐
                    │   FORCES    │
                    │             │
                    │ Reference   │
                    │ data        │
                    └─────────────┘
```

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

## Table 2: Opportunities

The main working table. One record per police force with active signals.

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

## Table 5: Emails (Phase 2a)

For email inbox management.

| Field | Type | Description |
|-------|------|-------------|
| `email_id` | Auto Number | Unique identifier |
| `outlook_id` | Text | Outlook message ID |
| `thread_id` | Text | Conversation thread |
| `from_email` | Email | Sender |
| `from_name` | Text | Sender name |
| `subject` | Text | Subject line |
| `body_preview` | Long Text | First 500 chars |
| `body_full` | Long Text | Full content |
| `received_at` | DateTime | When received |
| `category` | Single Select | `lead_response`, `opportunity`, `follow_up_needed`, `fyi_only`, `newsletter`, `internal`, `spam` |
| `priority` | Single Select | `urgent`, `normal`, `low` |
| `status` | Single Select | `new`, `needs_response`, `draft_ready`, `responded`, `archived`, `snoozed` |
| `contact` | Link → Contacts | Matched contact |
| `opportunity` | Link → Opportunities | Related opportunity |
| `draft_response` | Long Text | AI-generated draft |
| `snooze_until` | DateTime | Resurface date |

## Table 6: Tender_Responses (Phase 2b)

For tenders being actively pursued.

| Field | Type | Description |
|-------|------|-------------|
| `response_id` | Auto Number | Unique identifier |
| `signal` | Link → Signals | The tender |
| `status` | Single Select | `considering`, `pursuing`, `drafting`, `submitted`, `won`, `lost`, `no_bid` |
| `decision_deadline` | DateTime | Bid/no-bid decision date |
| `submission_deadline` | DateTime | Tender deadline |
| `assigned_to` | Text | Who's writing |
| `bid_value` | Currency | Our proposed price |
| `documents` | Attachments | Response docs |
| `debrief_notes` | Long Text | Post-decision notes |

---

# 7. The Signal-to-Opportunity Pipeline

## Overview

Every signal, regardless of source, follows the same pipeline:

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  INGEST  │───▶│ CLASSIFY │───▶│  GROUP   │───▶│  ENRICH  │───▶│ PRESENT  │
│          │    │          │    │          │    │          │    │          │
│ Scrape/  │    │ Is this  │    │ Link to  │    │ Find     │    │ Show in  │
│ fetch    │    │ relevant?│    │ force &  │    │ contact, │    │ queue    │
│ data     │    │ Which    │    │ existing │    │ draft    │    │          │
│          │    │ force?   │    │ opps     │    │ message  │    │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
   Scheduled      On arrival      On relevant      On grouped       On ready
```

## Stage 1: INGEST

**Purpose**: Get raw data from sources into the Signals table.

| Source | Frequency | Method |
|--------|-----------|--------|
| Indeed | Every 4 hours | Bright Data API |
| Competitor sites | Every 4 hours | Bright Data API |
| FTS/Contracts Finder | Daily 7am | Direct API |
| HMICFRS | Weekly | Web scrape |
| Reg 28 | Weekly | Web scrape |
| Google News | Every 6 hours | API |

**Output**: New record in Signals table with `status = new`

## Stage 2: CLASSIFY

**Purpose**: Determine if signal is relevant and identify the police force.

**Trigger**: New signal created  
**Method**: Claude API call  
**Output**: Signal updated with relevance score, force link, status = `relevant` or `irrelevant`

**Classification Logic**:
- Is this about a UK police force?
- Is this a role/service we provide?
- Is this actionable intelligence?

## Stage 3: GROUP

**Purpose**: Link signals to opportunities, grouping by force.

**Trigger**: Signal marked as relevant  
**Logic**:
1. Check if Opportunity exists for this force (status not in `won`, `lost`, `dormant`)
2. If exists: Link signal, recalculate priority
3. If not exists: Create new Opportunity, link signal

**Output**: Opportunity created or updated with linked signal

## Stage 4: ENRICH

**Purpose**: Make the opportunity ready for action.

**Trigger**: Opportunity needs enrichment  
**Steps**:
1. **Contact Finding**:
   - Search HubSpot for contacts at this force
   - Check for verified contacts from previous outreach
   - If none found, flag for manual research
2. **Message Drafting**:
   - Gather context from all linked signals
   - Determine outreach angle
   - Call Claude API to draft message
3. **Priority Calculation**:
   - Apply scoring formula
   - Determine priority tier

**Output**: Opportunity with contact, draft message, priority score, status = `ready`

## Stage 5: PRESENT

**Purpose**: Surface ready opportunities in the dashboard.

**Criteria for Presentation**:
- Status = `ready`
- Has contact (any confidence level)
- Has draft message
- Not contacted in last 7 days

**Presentation Order**:
1. Hot Leads (competitor interceptions, urgent tenders)
2. High priority (strong signals, warm relationships)
3. Medium priority (standard opportunities)

## Sales Strategy

Detailed sales methodology documented in `docs/SALES-STRATEGY.md`, covering:
- Lead prioritisation model (P1/P2/P3 classification)
- Contact strategy (target problem owner, not HR)
- Messaging framework (Hook → Bridge → Value → CTA)
- Follow-up cadence (standard 21-day, accelerated 7-day for P1)

The Monday Review interface implements this strategy through pre-generated messages and priority queuing.

---

# 8. Competitor Interception Strategy

## Strategic Intent

When a competitor posts a job for a police force, we don't just log it — we immediately contact that force to introduce ourselves as an alternative.

## The Logic

If Red Snapper posts "Investigator - Hampshire Police", this tells us:
1. ✅ Hampshire has a live need right now
2. ✅ Hampshire is willing to use external providers
3. ✅ Hampshire may not know about us or our model
4. ✅ Speed matters — the competitor is actively recruiting

## Interception Workflow

```
Competitor posts job
        │
        ▼
Scraped within 4 hours
        │
        ▼
Classified as relevant
        │
        ▼
Flagged as HOT LEAD ←─── Higher priority than Indeed jobs
        │
        ▼
Alert sent (Slack/email)
        │
        ▼
Contact identified (fast-track)
        │
        ▼
Message drafted (interception angle)
        │
        ▼
Appears in Hot Leads queue
        │
        ▼
User sends same day / next morning
```

## Priority Differences

| Signal Source | Base Points | Response Window | Queue Placement |
|---------------|-------------|-----------------|-----------------|
| Indeed (direct) | 15 | Monday review | Standard queue |
| Competitor job | 25 | Same day | Hot Leads (top) |
| Tender | 20-30 | 48 hours | Standard queue |
| Regulatory | 15 | Weekly review | Standard queue |

## Message Framing

**Critical Rule**: Never mention the competitor or how you know about the need.

| Do | Don't |
|----|-------|
| "I understand you're looking at investigator capacity..." | "I saw Red Snapper is recruiting for you..." |
| "We work with forces on exactly this type of requirement..." | "I noticed your job posting..." |
| "Happy to share what's worked elsewhere..." | "I heard you're using agencies..." |

**The Narrative**: This is proactive market awareness, not surveillance. If asked how you knew:

> "We keep close to the market and try to reach out when we think we might be able to help."

## Interception Message Template

```
Hi [Name],

I wanted to reach out as I understand [Force] may be looking at 
[investigator/disclosure/case handler] capacity at the moment.

We work with several forces providing managed investigation teams — 
a slightly different model to traditional agency placements that some 
forces have found more effective for larger or ongoing requirements.

Happy to share what's worked elsewhere if useful, even if just for 
future reference. Would a brief call this week work?

James
```

## Tracking Interception Success

| Metric | Definition | Target |
|--------|------------|--------|
| Interception Rate | % of competitor leads where we got a response | >15% |
| Win Rate | % of interceptions that led to work | >5% |
| Time to Response | Hours from detection to outreach sent | <24 hours |
| Competitor Coverage | % of competitor postings we intercept | >80% |

---

# 9. Priority Scoring System

## Formula

```
Priority Score = Signal Strength + Recency + Relationship + Modifiers - Decay
```

## Signal Strength (0-50 points)

| Signal Type | Points Each | Maximum |
|-------------|-------------|---------|
| Competitor job posting | 25 | 40 |
| Direct job posting (Indeed) | 15 | 30 |
| Active tender (deadline >7 days) | 20 | 20 |
| Active tender (deadline <7 days) | 30 | 30 |
| HMICFRS concern | 15 | 15 |
| Reg 28 report | 15 | 15 |
| News mention | 5 | 10 |
| Contract ending soon | 10 | 10 |

**Multiple Signal Bonus**:
| Condition | Bonus |
|-----------|-------|
| 2+ signal types for same force | +10 |
| 3+ signals in 7 days | +10 |
| Multiple competitors active | +15 |

## Recency (0-20 points)

| Age of Newest Signal | Points |
|---------------------|--------|
| Today | 20 |
| 1-3 days | 15 |
| 4-7 days | 10 |
| 8-14 days | 5 |
| 15+ days | 0 |

## Relationship (0-20 points)

| HubSpot Status | Points |
|---------------|--------|
| Active customer | 20 |
| Recent meeting/proposal | 18 |
| Replied to outreach | 15 |
| Opened emails | 10 |
| Cold (no engagement) | 5 |
| No relationship | 0 |

## Decay (0 to -20 points)

| Last Outreach | Penalty |
|--------------|---------|
| Never contacted | 0 |
| 30+ days ago | 0 |
| 14-30 days ago | -5 |
| 7-14 days ago | -15 |
| Under 7 days | Hidden from queue |

## Priority Tiers

| Tier | Score Range | Queue Placement | Response Window |
|------|-------------|-----------------|-----------------|
| 🔥 Hot | 60+ OR competitor intercept | Top of queue | Same day |
| 🔴 High | 45-59 | Priority section | Within 48 hours |
| 🟡 Medium | 30-44 | Standard queue | Monday review |
| 🟢 Low | <30 | Bottom / hidden | As time allows |

## Example Calculations

**Hampshire Police (Competitor Intercept)**:
- Red Snapper posting (25) + posted yesterday (20) + warm contact (15) = **60 points → Hot**

**Kent Police (Multi-Signal)**:
- 2 Indeed postings (30) + HMICFRS concern (15) + posted 5 days ago (10) + cold contact (5) = **60 points → Hot**

**Surrey Police (Single Signal)**:
- 1 Indeed posting (15) + posted today (20) + no relationship (0) = **35 points → Medium**

---

# 10. Workflow Specifications

## Workflow Overview

| # | Name | Trigger | Purpose |
|---|------|---------|---------|
| 1.1 | ingest-indeed-jobs | Schedule (4h) | Scrape Indeed |
| 1.2 | ingest-competitor-jobs | Schedule (4h) | Scrape competitor sites |
| 2.1 | classify-signal | New signal | AI classification |
| 3.1 | create-update-opportunity | Relevant signal | Group signals |
| 4.1 | enrich-opportunity | Opportunity needs enrichment | Find contact, draft message |
| 4.2 | alert-hot-lead | Competitor signal ready | Send notification |
| 5.1 | send-outreach | User clicks send | Dispatch via Outlook |
| 6.1 | ingest-tenders | Schedule (daily) | Fetch FTS/Contracts Finder |
| 6.2 | classify-tender | New tender | AI classification |
| 7.1 | ingest-awards | Schedule (daily) | Fetch award notices |
| 7.2 | process-award-intel | New award | Update competitor data |
| 8.1 | ingest-hmicfrs | Schedule (weekly) | Scrape PEEL reports |
| 8.2 | ingest-reg28 | Schedule (weekly) | Scrape Reg 28 reports |
| 9.1 | ingest-news | Schedule (6h) | Fetch news articles |
| 9.2 | classify-news | New news signal | AI classification |
| 10.1 | ingest-emails | Schedule (15min) | Fetch Outlook inbox |
| 10.2 | classify-email | New email | AI classification |
| 10.3 | draft-email-response | Email needs response | AI drafting |
| 10.4 | send-email-response | User clicks send | Reply via Outlook |

## Workflow 1.1: ingest-indeed-jobs

**Trigger**: Schedule — Every 4 hours (8am, 12pm, 4pm, 8pm weekdays)

**Steps**:
```
1. Call Bright Data API
   - Endpoint: Indeed UK scraper
   - Queries: ["police investigator", "disclosure officer uk police", 
               "case handler police", "intelligence analyst police"]
   - Filters: Location = UK, Posted within 7 days
   
2. For each job returned:
   a. Check if URL exists in Signals table
   b. If new:
      - Create Signal record
      - type = "job_posting"
      - source = "indeed"
      - status = "new"
      - detected_at = now()
      
3. Log completion (count of new signals)
```

**Error Handling**: On failure, retry 3x with backoff, then alert via Slack.

## Workflow 1.2: ingest-competitor-jobs

**Trigger**: Schedule — Every 4 hours (offset by 1 hour from Indeed)

**Steps**:
```
1. For each competitor source:
   [red_snapper, investigo, reed, adecco, service_care]
   
   a. Call Bright Data API with source-specific scraper
   b. Filter for police/law enforcement roles
   
2. For each job returned:
   a. Check if URL exists in Signals table
   b. If new:
      - Create Signal record
      - type = "competitor_job"
      - source = [competitor name]
      - competitor_source = [competitor name]
      - status = "new"
      
3. Log completion by source
```

## Workflow 2.1: classify-signal

**Trigger**: Airtable webhook — New Signal with status = "new"

**Steps**:
```
1. Get signal record (title, raw_data, source)

2. Call Claude API:
   - Model: claude-3-5-haiku
   - Prompt: [See Section 12.2]
   
3. Parse response:
   - relevance_score
   - relevance_reason
   - force_name
   - role_type
   
4. Look up or create Force record

5. Update Signal:
   - Link to Force
   - Set relevance fields
   - status = "relevant" or "irrelevant"
   
6. If relevant AND competitor_job:
   - Set is_urgent = true
   - Trigger alert-hot-lead workflow
   
7. If relevant:
   - Trigger create-update-opportunity workflow
```

## Workflow 3.1: create-update-opportunity

**Trigger**: Called by classify-signal (or Airtable automation)

**Steps**:
```
1. Get signal and linked force

2. Search Opportunities:
   - Filter: force = signal.force
   - Filter: status NOT IN ("won", "lost", "dormant")
   
3. If existing opportunity found:
   a. Link signal to opportunity
   b. Update signal_count (rollup auto-updates)
   c. If signal is competitor_job, set is_competitor_intercept = true
   
4. If no existing opportunity:
   a. Create new Opportunity
   b. Link force
   c. Link signal
   d. Set status = "researching"
   e. Set is_competitor_intercept based on signal type
   
5. Trigger enrich-opportunity workflow
```

## Workflow 4.1: enrich-opportunity

**Trigger**: Called by create-update-opportunity OR scheduled daily

**Steps**:
```
1. Get opportunity with force and signals

2. CONTACT FINDING: **(G-014: Contact the Problem Owner)**
   a. Check if opportunity already has verified contact → skip

   b. Search HubSpot for contacts at this force:
      - Filter by company = force.hubspot_company_id
      - Sort by: last_interaction DESC
      - Target problem owner (Head of Crime, Head of Investigations) — HR is fallback only

   c. If HubSpot contact found:
      - Link or create Contact record
      - Set contact_confidence = "verified"

   d. If no HubSpot contact:
      - Flag for manual LinkedIn research
      - Set contact_confidence = "guess" if any lead found
      - OR leave contact blank and status = "researching"

3. MESSAGE DRAFTING: **(G-012: Value Proposition First, G-015: Message Structure)**
   a. Gather context:
      - All linked signals (titles, dates)
      - Force details
      - Contact details
      - Relationship history

   b. Determine outreach_angle:
      - is_competitor_intercept → "competitor_intercept"
      - has tender signal → "tender"
      - has regulatory signal → "regulatory"
      - else → "direct_hiring"

   c. Call Claude API:
      - Model: claude-3-5-sonnet
      - Prompt: [See Section 12.3, varies by angle]
      - **Structure**: Hook → Bridge → Value → CTA (never "we have candidates")

   d. Save draft to outreach_draft

4. SCORING: **(G-013: Competitor Signals Get P1 Priority)**
   a. Calculate priority_score (formula)
   b. Set priority_tier
   c. If is_competitor_intercept → automatically set priority = P1

5. UPDATE STATUS:
   - If has contact + has draft → status = "ready"
   - If missing contact → status = "researching"
   
6. If is_competitor_intercept AND status = "ready":
   - Trigger alert-hot-lead
```

## Workflow 4.2: alert-hot-lead

**Trigger**: Called when competitor-sourced opportunity is ready

**Steps**:
```
1. Get opportunity details

2. Send Slack message:
   Channel: #mi-alerts
   Message:
   """
   🎯 COMPETITOR INTERCEPT OPPORTUNITY
   
   Force: {force.name}
   Source: {competitor_source} job posting
   Role: {signal.title}
   Posted: {time_ago}
   
   Contact: {contact.name} ({contact.role}) ✓
   Draft: Ready
   
   → [Review in Dashboard](dashboard_url)
   """
   
3. Optionally send email alert
```

## Workflow 5.1: send-outreach

**Trigger**: Webhook from dashboard (user clicks "Send")

**Steps**:
```
1. Get opportunity, contact, draft

2. Determine channel:
   - If contact.email verified → email
   - Else → LinkedIn (manual)
   
3. IF EMAIL:
   a. Call Make.com webhook:
      - to: contact.email
      - subject: Generated based on context
      - body: outreach_draft
      - from: james@peelsolutions.co.uk
      
   b. On success:
      - Update opportunity.status = "sent"
      - Update opportunity.last_contact_date = now()
      - Update opportunity.next_action_date = now() + 7 days
      - Update contact.last_interaction = now()
      
   c. Create HubSpot activity (email sent)
   
4. IF LINKEDIN:
   a. Copy message to clipboard
   b. Open LinkedIn compose URL
   c. Update opportunity as above
   d. Log as manual send

5. Return success to dashboard
```

---

# 11. Dashboard Design

## Design Philosophy

The dashboard follows the **"Technical Luxury"** aesthetic — precision engineering meets high-end elegance. Every pixel earns its place. Speed is a feature.

**Core Principles** (from `uk-police-design-system` skill):
- Dark mode primary — reduces eye strain, professional aesthetic
- Semantic colour only — Status, Priority, Interaction; else neutral
- Keyboard first — every action accessible without mouse
- ADHD optimised — single focus, progress feedback, undo safety net

## Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PEEL SOLUTIONS                                    [Settings] [Profile]     │
│  Market Intelligence Platform                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [Queue]  [Pipeline]  [Signals]  [Forces]  [Email]  [Tenders]              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## View 1: Queue (Home) — The Three-Zone Model

The primary view. What you see Monday morning. Implements the **Three-Zone Model** from the `action-oriented-ux` skill.

### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Progress] Today: 3 of 12 ████░░░░░░ 25% • Avg: 1:42      [Refresh]       │
├────────────┬──────────────────────────────────────┬─────────────────────────┤
│            │                                      │                         │
│  QUEUE     │           NOW CARD                   │    COMPOSER DOCK        │
│  PANEL     │           (Context)                  │    (Actions)            │
│  (280px)   │           (flexible)                 │    (320px)              │
│            │                                      │                         │
│  Filter:   │  ┌────────────────────────────┐     │  Subject: ...           │
│  [Ready]   │  │ Force Name           Score │     │                         │
│  [Sent]    │  │ Capability                 │     │  Message body...        │
│  [All]     │  │                            │     │                         │
│            │  │ Why:    Context capsule    │     │  ─────────────────────  │
│  ─────────│  │ Next:   Recommended action │     │                         │
│  > Item 1  │  │ When:   Timing indicator   │     │  [Send Email]           │
│    Item 2  │  │ Source: Signal summary     │     │                         │
│    Item 3  │  │                            │     │  [Skip] [Dismiss]       │
│    ...     │  │ [Score breakdown grid]     │     │                         │
│            │  └────────────────────────────┘     │                         │
├────────────┴──────────────────────────────────────┴─────────────────────────┤
│  [J/K] navigate  •  [E] Send  •  [S] Skip  •  [D] Dismiss  •  [?] Shortcuts │
└─────────────────────────────────────────────────────────────────────────────┘
```

### The Three Zones

| Zone | Width | Purpose | Key Features |
|------|-------|---------|--------------|
| **Queue Panel** | 280px fixed | Prioritised opportunity list | Filter tabs, priority indicators, signal badges, J/K navigation |
| **Now Card** | Flexible | Current opportunity context | Context Capsule (What/Why/Next/When/Source), score breakdown, contact card |
| **Composer Dock** | 320px fixed | Action workspace | Draft message, Send/Skip/Dismiss buttons, keyboard hints |

### Why Three Zones Beat Vertical Scroll

The original vertical scroll design was theoretical. V1 testing revealed:

| Vertical Scroll | Three-Zone Model |
|-----------------|------------------|
| Context lost when scrolling | Context always visible |
| No progress feedback | Progress bar shows completion |
| Keyboard nav awkward | J/K moves through queue naturally |
| Message editing requires expansion | Message always visible in dock |
| No visual isolation | Active opportunity centred, rest dimmed |

The Three-Zone Model enables the **2-Minute Lead Loop** (from `action-oriented-ux`):
- 0:00-0:05 — System highlights next lead (auto-selected)
- 0:05-0:30 — User scans "Why now" in Context Capsule
- 0:30-1:30 — User reviews/edits draft in Composer Dock
- 1:30-2:00 — Send and auto-advance to next

### Context Capsule Pattern

Every opportunity displays the **Context Capsule** (from `adhd-interface-design`):

| Field | Icon | Content |
|-------|------|--------|
| **Why** | 💡 | AI-generated context summary — why this matters now |
| **Next** | → | Recommended channel + action |
| **When** | ⏱️ | Timing indicator (urgent, this week, anytime) |
| **Source** | 🏢 | Signal count + types (job posting, tender, etc.) |

This replaces working memory — users don't need to remember context from previous screens.

### Progress Feedback

The session header provides **dopamine feedback** (from `adhd-interface-design`):

```
Today: 3 of 12 ████░░░░░░ 25% • Avg: 1:42
```

- Progress bar colour shifts: <50% muted → 50-75% warning → 75-99% action → 100% success
- Average time per lead encourages efficiency
- Creates momentum and completion satisfaction

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `J` / `K` | Move down/up in queue |
| `E` | Send email |
| `S` | Skip (move to next) |
| `D` | Dismiss (opens reason modal) |
| `Z` | Undo last action (30s window) |
| `?` | Show keyboard shortcuts |

### Undo Safety Net

Every action is reversible for 30 seconds (from `adhd-interface-design`):

```
┌─────────────────────────┐
│  ✓ Actioned: Kent Police │  ← Toast with
│  Press Z to undo (28s)   │    countdown bar
│  ████████████░░░░░░░░░░  │
└─────────────────────────┘
```

This enables fast, confident decisions — mistakes are recoverable.

## Entry Point: Morning Brief (Optional)

Before entering the Queue, users can complete the **Morning Brief** — a 2-minute ritual from `adhd-interface-design`:

1. **Energy Check** — "How's your energy today?" [LOW] [MEDIUM] [HIGH]
2. **Overnight Summary** — What changed while you were away
3. **Rule of Three** — Lock in top 3 priorities for the day
4. **Go** — Enter Focus Mode with a closed-world set of tasks

The Morning Brief is optional but recommended for ADHD users. It creates psychological closure ("I've decided what to do today") and prevents the overwhelm of opening to 20 items.

See SPEC-008 for full specification.

## View 2: Pipeline

Kanban view of all opportunities by status.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  📊 PIPELINE                                                              │
├──────────────┬──────────────┬──────────────┬──────────────┬─────────────┤
│ Researching  │ Ready        │ Sent         │ Replied      │ Won         │
│ (4)          │ (5)          │ (12)         │ (3)          │ (2)         │
├──────────────┼──────────────┼──────────────┼──────────────┼─────────────┤
│              │              │              │              │             │
│ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │ ┌─────────┐│
│ │ Durham   │ │ │Hampshire │ │ │ Met      │ │ │ Essex    │ │ │ Avon   ││
│ │ needs    │ │ │ 🔥 Hot   │ │ │ 5d ago   │ │ │ meeting  │ │ │ £150k  ││
│ │ contact  │ │ │          │ │ │          │ │ │ Friday   │ │ │        ││
│ └──────────┘ │ └──────────┘ │ └──────────┘ │ └──────────┘ │ └─────────┘│
│              │              │              │              │             │
│ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │ ┌─────────┐│
│ │ Cumbria  │ │ │ Kent     │ │ │ Surrey   │ │ │ Thames V │ │ │ Dorset ││
│ │          │ │ │ 🔥 Hot   │ │ │ 3d ago   │ │ │ proposal │ │ │ £80k   ││
│ └──────────┘ │ └──────────┘ │ └──────────┘ │ └──────────┘ │ └─────────┘│
│              │              │              │              │             │
└──────────────┴──────────────┴──────────────┴──────────────┴─────────────┘
```

### Click Actions

- Click card → Opens opportunity detail modal
- Drag card → Changes status (with confirmation for key transitions)

## View 3: Signals

Raw intelligence feed for reference/debugging.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  📡 SIGNALS                               [Filter ▼]  [Last 7 days ▼]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Source     │ Title                              │ Force      │ Status  │
│  ──────────────────────────────────────────────────────────────────────│
│  ⚡ R.Snapper│ Investigator                      │ Hampshire  │ ✓ Ready │
│  ⚡ Investigo│ Disclosure Officer                │ Kent       │ ✓ Ready │
│  📋 Indeed  │ Case Handler                      │ West Mids  │ ✓ Ready │
│  📋 Indeed  │ Intelligence Analyst              │ West Mids  │ ✓ Ready │
│  ✗ Indeed   │ IT Project Manager                │ Hampshire  │ Filtered│
│  📋 Indeed  │ Disclosure Officer                │ Surrey     │ ✓ Ready │
│  ⚠️ HMICFRS │ PEEL: Requires Improvement        │ West Mids  │ ✓ Linked│
│  📰 News    │ Backlog concerns raised           │ Notts      │ ✓ Linked│
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## View 4: Forces

Reference view with intelligence summary per force.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🏛️ FORCES                                           [Search forces]    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Force                    │ Signals │ Competitor │ PEEL    │ Relation  │
│  ────────────────────────────────────────────────────────────────────  │
│  Hampshire Constabulary   │ 3 🔴    │ Red Snapper│ Good    │ Warm      │
│  Kent Police              │ 2 🔴    │ Investigo  │ Good    │ Cold      │
│  West Midlands Police     │ 4 🔴    │ Multiple   │ RI ⚠️   │ None      │
│  Metropolitan Police      │ 1 🟡    │ —          │ Adequate│ Active    │
│  ...                                                                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Force Detail Modal

```
┌─────────────────────────────────────────────────────────────────────────┐
│  HAMPSHIRE CONSTABULARY                                          [×]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  OVERVIEW                                                               │
│  Region: South East                    Officers: ~3,200                 │
│  Website: hampshire.police.uk          Relationship: Warm               │
│                                                                         │
│  ──────────────────────────────────────────────────────────────────    │
│                                                                         │
│  ACTIVE SIGNALS                                                         │
│  • ⚡ Red Snapper posting: Investigator (8 hours ago)                   │
│  • 📋 Indeed posting: Disclosure Officer (3 days ago)                   │
│                                                                         │
│  ──────────────────────────────────────────────────────────────────    │
│                                                                         │
│  COMPETITOR ACTIVITY                                                    │
│  Red Snapper: 3 postings (last 90 days)                                │
│  Investigo: 1 posting (last 90 days)                                   │
│                                                                         │
│  ──────────────────────────────────────────────────────────────────    │
│                                                                         │
│  REGULATORY STATUS                                                      │
│  PEEL 2024: Investigating Crime — Good                                 │
│             Protecting Vulnerable People — Good                         │
│                                                                         │
│  ──────────────────────────────────────────────────────────────────    │
│                                                                         │
│  CONTACTS                                                               │
│  • Sarah Chen — Head of Resourcing (verified)                          │
│  • Mike Thompson — HR Director (HubSpot)                               │
│                                                                         │
│  ──────────────────────────────────────────────────────────────────    │
│                                                                         │
│  CONTRACT HISTORY                                                       │
│  • Red Snapper — Agency Investigators (2023-2025, £200k/yr)            │
│                                                                         │
│  ──────────────────────────────────────────────────────────────────    │
│                                                                         │
│  INTERACTION HISTORY                                                    │
│  • 15 Nov 2024 — Email sent (no reply)                                 │
│  • 03 Sep 2024 — Met at conference                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## View 5: Email (Phase 2a)

Email triage queue.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  📧 EMAIL                                                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  NEEDS RESPONSE                                              5 emails   │
│  ─────────────────────────────────────────────────────────────────      │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ From: Sarah Chen (Hampshire Police)              2 hours ago      │ │
│  │ Subject: Re: Investigator capacity                                │ │
│  │                                                                   │ │
│  │ "Thanks James, this sounds interesting. Could you send over      │ │
│  │ some more details about your managed team model?"                │ │
│  │                                                                   │ │
│  │ DRAFT RESPONSE:                                                  │ │
│  │ ┌─────────────────────────────────────────────────────────────┐  │ │
│  │ │ Hi Sarah,                                                   │  │ │
│  │ │                                                             │  │ │
│  │ │ Absolutely — I've attached our capability overview...       │  │ │
│  │ └─────────────────────────────────────────────────────────────┘  │ │
│  │                                                                   │ │
│  │ [✏️ Edit]  [📧 Send]  [📁 Archive]  [⏰ Snooze]                   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## View 6: Tenders (Phase 2b)

Active tender opportunities.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  📋 TENDERS                                                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ACTIVE                                                    3 tenders    │
│  ─────────────────────────────────────────────────────────────────      │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ Kent Police — Agency Investigator Framework                       │ │
│  │ Value: £500,000 (2 years)          Deadline: 15 Feb 2025         │ │
│  │ Fit: STRONG                                                       │ │
│  │                                                                   │ │
│  │ [📄 View Docs]  [✅ Pursue]  [❌ No Bid]                          │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# 12. AI Integration

## Overview

| Task | Model | Trigger | Est. Cost |
|------|-------|---------|-----------|
| Signal Classification | Claude 3.5 Haiku | Each new signal | £0.001/signal |
| Tender Classification | Claude 3.5 Haiku | Each new tender | £0.001/tender |
| News Classification | Claude 3.5 Haiku | Each new article | £0.001/article |
| Contact Research | Claude 3.5 Sonnet | Each opportunity | £0.01/opp |
| Message Drafting | Claude 3.5 Sonnet | Each opportunity | £0.01/opp |
| Email Classification | Claude 3.5 Haiku | Each email | £0.001/email |
| Email Response Drafting | Claude 3.5 Sonnet | Each response needed | £0.01/email |

**Estimated Monthly Cost** (200 signals/week, 20 opportunities/week, 100 emails/week):
- Classification: ~£1.00
- Research + Drafting: ~£2.00
- Email handling: ~£1.50
- **Total: ~£5/month**

## Supplementary Documentation

For advanced AI architecture and n8n implementation patterns, see:
- `docs/STRATEGY-AGENTS.md` — Advanced agentic architecture, n8n AI Agent nodes, multi-agent orchestration
- `docs/STRATEGY-N8N.md` — Workflow monitoring, reliability patterns, failure recovery

## 12.1 Signal Classification Prompt (Jobs)

```
You are classifying job postings for Peel Solutions, a company that provides 
managed investigator teams to UK police forces.

RELEVANT jobs are civilian roles at UK police forces:
- Investigators (any type: fraud, safeguarding, serious crime, etc.)
- Disclosure officers / Disclosure managers
- Case handlers / Case progression officers
- Intelligence analysts / Research officers
- Review officers
- Statement takers
- File preparation officers

NOT RELEVANT:
- Sworn police officers (PC, DC, DS, etc.) or PCSOs
- IT / Technology roles
- Administrative roles (unless investigation-related)
- Senior leadership (Chief officers, PCCs, CEOs)
- Roles at non-police organisations
- Volunteer roles

JOB POSTING:
Title: {{title}}
Employer: {{employer}}
Location: {{location}}
Description: {{description}}

Respond with valid JSON only, no other text:
{
  "relevant": boolean,
  "confidence": number (0-100),
  "force_name": string or null (standardised name e.g. "Hampshire Constabulary"),
  "role_type": "investigator" | "disclosure" | "case_handler" | "analyst" | "review" | "other",
  "seniority": "senior" | "standard" | "junior" | "unknown",
  "reasoning": string (one sentence explaining decision)
}
```

## 12.2 Competitor Job Classification Prompt

```
You are classifying job postings from a competitor staffing agency.
The job is posted by {{source}} (a staffing agency), not by the police force directly.

Extract which police force this role is actually for.

JOB POSTING:
Title: {{title}}
Posted by: {{source}}
Description: {{description}}

Respond with valid JSON only:
{
  "relevant": boolean,
  "confidence": number (0-100),
  "force_name": string or null (the actual police force client, not the agency),
  "role_type": "investigator" | "disclosure" | "case_handler" | "analyst" | "other",
  "reasoning": string (one sentence),
  "competitor_insight": string (what this tells us about the force's needs)
}
```

## 12.3 Message Drafting Prompts

### Standard Outreach (Indeed Jobs)

```
Write a short outreach message for a police force contact.

CONTEXT:
- Recipient: {{contact_name}}, {{contact_role}} at {{force_name}}
- They recently posted: {{job_titles}}
- Last contact: {{last_contact_info}}

OUR COMPANY:
- Peel Solutions provides managed investigator teams to police forces
- Our model: outcome-based delivery, not just agency temps
- We handle recruitment, management, and quality assurance

RULES:
- Reference their specific job posting(s)
- Maximum 80 words
- Suggest a conversation, don't hard sell
- Sound human, not templated
- Professional but warm tone
- Sign off as "James" only

Write the message only, no preamble or explanation:
```

### Competitor Interception Outreach

```
Write an outreach message for a police force contact.

IMPORTANT CONTEXT:
- We know (through market intelligence) that {{force_name}} is actively 
  seeking {{role_type}} support
- A competitor staffing agency is recruiting for them
- Do NOT mention the competitor or how we know
- Frame this as proactive outreach based on market awareness

RECIPIENT:
- Name: {{contact_name}}
- Role: {{contact_role}}
- Force: {{force_name}}
- Relationship: {{relationship_status}}

OUR DIFFERENTIATOR:
- We offer managed investigator teams, not individual placements
- Outcome-based delivery model
- We handle recruitment, management, and quality
- Often more cost-effective than traditional agency temps

THE ASK:
- Brief conversation to introduce our approach
- No pressure, offer value even if just for future reference
- Position as worth comparing to their current approach

RULES:
- Never mention competitor name or that we saw their posting
- Keep under 100 words
- Sound like genuine proactive outreach, not surveillance
- Professional but warm
- Sign as "James"

Write the message only:
```

### Tender-Related Outreach

```
Write an outreach message related to an upcoming tender.

CONTEXT:
- Recipient: {{contact_name}}, {{contact_role}} at {{force_name}}
- Tender: {{tender_title}}
- Deadline: {{tender_deadline}}
- Our fit: {{fit_assessment}}

PURPOSE:
- Express interest in the opportunity
- Offer to discuss requirements before formal submission
- Position us as a credible bidder

RULES:
- Reference the specific tender
- Keep professional and formal (procurement context)
- Under 100 words
- Sign as "James"

Write the message only:
```

### Regulatory Context Outreach

```
Write an outreach message for a force with regulatory challenges.

IMPORTANT:
- {{force_name}} has received a {{rating}} rating from HMICFRS for {{area}}
- Do NOT directly reference the inspection or rating
- Frame as proactive support, not ambulance-chasing
- Be sensitive — this is a difficult situation for them

RECIPIENT:
- Name: {{contact_name}}
- Role: {{contact_role}}

ANGLE:
- We help forces improve investigation capacity
- Share what's worked elsewhere
- Offer expertise, not criticism

RULES:
- Never say "I saw your HMICFRS report"
- Position as "we work with forces on these challenges"
- Under 100 words
- Warm but professional
- Sign as "James"

Write the message only:
```

## 12.4 Email Classification Prompt

```
Classify this email for a business development inbox.

EMAIL:
From: {{from_name}} <{{from_email}}>
Subject: {{subject}}
Body: {{body_preview}}

CONTEXT:
- Known contact: {{contact_match}} (if matched)
- Related opportunity: {{opportunity_match}} (if matched)

CATEGORIES:
- lead_response: Reply to our outreach (HIGH PRIORITY)
- opportunity: Inbound business inquiry (HIGH PRIORITY)
- follow_up_needed: They asked a question or requested something
- fyi_only: CC'd or purely informational
- newsletter: Marketing email or automated newsletter
- internal: From colleague or team member
- spam: Junk or irrelevant
- unknown: Cannot determine

Respond with JSON only:
{
  "category": string,
  "priority": "urgent" | "normal" | "low",
  "needs_response": boolean,
  "reasoning": string (one sentence),
  "key_request": string or null (what they're asking for, if anything)
}
```

## 12.5 Email Response Drafting Prompt

```
Draft a response to this email.

ORIGINAL EMAIL:
From: {{from_name}}, {{role}} at {{force}}
Subject: {{subject}}
Body: {{body}}

CONTEXT:
- Relationship: {{relationship_status}}
- Related opportunity: {{opportunity_details}}
- What they're asking: {{key_request}}
- Thread history: {{thread_summary}}

OUR SERVICES:
- Managed investigator teams (outcome-based, not just temps)
- Disclosure officers, case handlers, analysts
- Flexible engagement models

RULES:
- Be helpful and responsive
- Match their tone (formal/informal)
- Address their specific request directly
- If meeting requested, suggest 2-3 times this week
- Keep under 150 words unless detailed response needed
- Sign as "James"

Draft the response only:
```

---

# 13. Technology Stack

## Components

| Component | Tool | Purpose | Cost |
|-----------|------|---------|------|
| Database | Airtable (Pro) | All structured data | ~£20/month |
| Automation | n8n (self-hosted) | All workflows | VPS cost only |
| Web Scraping | Bright Data | Indeed, competitors, news | ~£50-100/month |
| AI | Claude API | Classification, drafting | ~£5/month |
| CRM | HubSpot (Free/Starter) | Contact management, activities | £0-45/month |
| Email Integration | Make.com | Outlook send/receive | ~£15/month |
| Dashboard | Next.js + Vercel | User interface | £0 (free tier) |
| Server | VPS (Hetzner/DO) | n8n, scheduled tasks | ~£10/month |
| Alerts | Slack | Notifications | £0 |

**Total Estimated Cost**: £100-200/month

## Airtable Configuration

### API Setup
- Generate API key in Airtable settings
- Base ID from URL: airtable.com/[BASE_ID]/...
- Use official Airtable.js library

### Automation Triggers
- Use Airtable Automations to trigger n8n webhooks
- Trigger on: Record created, Field updated
- Alternative: n8n polls Airtable every 5 minutes

## n8n Configuration

### Self-Hosted Setup
```bash
# Docker compose on VPS
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### Credentials Required
- Airtable API key
- Claude API key
- Bright Data API credentials
- HubSpot API key
- Make.com webhook URLs

### Error Handling
- Add error handler node to every workflow
- On error: Log to Airtable "Errors" table + Slack alert
- Implement retries with exponential backoff

## Make.com Setup

### Scenario 1: Fetch Emails
- Trigger: Webhook (called by n8n)
- Action: Outlook 365 → Get Messages
- Return: JSON to n8n

### Scenario 2: Send Email
- Trigger: Webhook (with to, subject, body)
- Action: Outlook 365 → Send Email
- Return: Success/failure

## Dashboard Tech Stack

### Next.js 14 Structure
```
/app
  /page.tsx           # Queue view (home)
  /pipeline/page.tsx  # Pipeline kanban
  /signals/page.tsx   # Signal feed
  /forces/page.tsx    # Forces directory
  /email/page.tsx     # Email queue (Phase 2a)
  /tenders/page.tsx   # Tenders (Phase 2b)
  /api
    /opportunities/route.ts
    /signals/route.ts
    /send/route.ts
/components
  /OpportunityCard.tsx
  /MessageEditor.tsx
  /ActionButtons.tsx
/lib
  /airtable.ts        # Airtable client
  /actions.ts         # Server actions
```

### Key Libraries
- `airtable` - Official Airtable client
- `tailwindcss` - Styling
- `@tanstack/react-query` - Data fetching
- `sonner` - Toast notifications

### Deployment
- Push to GitHub
- Connect to Vercel
- Set environment variables
- Deploy

---

# 14. Implementation Roadmap

## Timeline Overview

| Phase | Focus | Duration | Weeks |
|-------|-------|----------|-------|
| 1 | Jobs Pipeline (Indeed) | 4 weeks | 1-4 |
| 1b | Competitor Interception | 2 weeks | 5-6 |
| 2a | Email Management | 3 weeks | 7-9 |
| 2b | Tenders & Procurement | 3 weeks | 10-12 |
| 3 | Contract Awards | 2 weeks | 13-14 |
| 4 | Regulatory Signals | 3 weeks | 15-17 |
| 5 | News & Events | 2 weeks | 18-19 |
| 6 | Advanced Features | Ongoing | 20+ |

**Total to Full Platform**: ~5 months

---

## Phase 1: Jobs Pipeline (Weeks 1-4)

### Week 1: Foundation

**Days 1-2: Airtable Setup**
- Create base with 4 core tables
- Copy field schemas exactly
- Create essential views
- Test API access

**Days 3-5: Manual Process**
- Manually find 5-10 relevant jobs on Indeed
- Add to Signals table manually
- Classify manually (learn the criteria)
- Find contacts manually
- Write outreach manually
- Send emails manually

**Outcome**: Understand the full process before automating.

### Week 2: Basic Dashboard

**Days 1-3: Next.js Setup**
- Initialize Next.js project
- Connect to Airtable API
- Build Queue page (read-only)
- Display opportunities from Airtable

**Days 4-5: Basic Interactions**
- Add "Mark as Sent" button
- Add status updates
- Test full flow: Airtable → Dashboard → Airtable

**Outcome**: Can see and act on opportunities from one place.

### Week 3: Automation - Classification

**Days 1-2: n8n Setup**
- Install n8n on VPS
- Configure credentials
- Build classify-signal workflow
- Test with sample data

**Days 3-4: Airtable Integration**
- Set up webhook trigger (new signals)
- Connect classification workflow
- Test end-to-end

**Day 5: Tuning**
- Review classification accuracy
- Adjust prompts
- Handle edge cases

**Outcome**: New signals auto-classify.

### Week 4: Automation - Full Pipeline

**Days 1-2: Indeed Ingestion**
- Set up Bright Data Indeed scraper
- Build ingest-indeed-jobs workflow
- Schedule for every 4 hours

**Days 3-4: Enrichment**
- Build enrich-opportunity workflow
- Connect HubSpot for contacts
- Implement message drafting

**Day 5: Send Workflow**
- Build send-outreach workflow
- Connect to Make.com (Outlook)
- Test full loop

**Outcome**: End-to-end automated pipeline working.

### Phase 1 Exit Criteria
- [ ] Indeed jobs flowing automatically (10+/week)
- [ ] Classification accuracy >90%
- [ ] 3-5 ready-to-send opportunities weekly
- [ ] Successfully sent 10+ outreach messages
- [ ] At least one response received

---

## Phase 1b: Competitor Interception (Weeks 5-6)

### Week 5: Scraping Setup

**Days 1-2: Bright Data Configuration**
- Set up scrapers for each competitor:
  - Red Snapper (redsnapper.jobs)
  - Investigo (investigo.co.uk)
  - Reed (reed.co.uk)
  - Service Care (servicecare.org.uk)
  - Adecco (adecco.co.uk)

**Days 3-4: Ingestion Workflow**
- Build ingest-competitor-jobs workflow
- Set schedule: every 4 hours
- Add competitor_source field population

**Day 5: Classification Update**
- Update classification prompt for competitors
- Test extraction of actual force name
- Handle edge cases

### Week 6: Interception Pipeline

**Days 1-2: Hot Leads Logic**
- Add is_competitor_intercept flag
- Update priority scoring
- Build alert-hot-lead workflow

**Days 3-4: Dashboard Updates**
- Add Hot Leads section to Queue
- Show competitor badge
- Update message templates

**Day 5: Testing & Refinement**
- Review first week of competitor data
- Tune scraper accuracy
- Test interception outreach

### Phase 1b Exit Criteria
- [ ] All 5 competitor sources scraping
- [ ] Competitor jobs correctly attributed (>85%)
- [ ] Hot Leads appearing within 4 hours
- [ ] At least 2 interception outreaches sent
- [ ] Competitor Activity view showing patterns

---

## Phase 2a: Email Management (Weeks 7-9)

### Week 7: Email Ingestion

**Days 1-2: Airtable Setup**
- Create Emails table
- Set up views (Needs Response, Snoozed, etc.)

**Days 3-4: Make.com Integration**
- Build Outlook fetch scenario
- Connect to n8n webhook
- Build ingest-emails workflow

**Day 5: Testing**
- Run with live inbox
- Verify email capture
- Handle duplicates

### Week 8: Email Classification

**Days 1-2: Classification Workflow**
- Build classify-email workflow
- Implement category logic
- Connect to Contacts/Opportunities

**Days 3-4: Response Drafting**
- Build draft-email-response workflow
- Create drafting prompts
- Test with sample emails

**Day 5: End-to-End Testing**
- Process 20+ real emails
- Review draft quality
- Refine prompts

### Week 9: Email Queue UI

**Days 1-2: Dashboard View**
- Build Email Queue page
- Display emails needing response
- Show draft responses

**Days 3-4: Actions**
- Implement Send button
- Add Archive, Snooze functionality
- Build send-email-response workflow

**Day 5: Go Live**
- Process real inbox through system
- Measure time savings
- Refine as needed

### Phase 2a Exit Criteria
- [ ] Emails ingesting every 15 minutes
- [ ] Classification accuracy >85%
- [ ] Response drafts need <30% editing
- [ ] Inbox processing time <20 min/day
- [ ] Snooze/follow-up reminders working

---

## Phase 2b: Tenders & Procurement (Weeks 10-12)

### Week 10: API Integration

**Days 1-2: FTS Setup**
- Register for API access
- Understand data structure
- Build test queries

**Days 3-4: Ingestion Workflow**
- Build ingest-tenders workflow
- Add Contracts Finder
- Schedule daily

**Day 5: Testing**
- Run historical queries
- Verify data capture
- Handle edge cases

### Week 11: Tender Classification

**Days 1-2: Classification Workflow**
- Build classify-tender workflow
- Implement fit assessment
- Extract key requirements

**Days 3-4: Opportunity Integration**
- Link tenders to opportunities
- Update priority scoring
- Set deadline reminders

**Day 5: Tender_Responses Table**
- Create table for pursuit tracking
- Build basic workflow

### Week 12: Tender UI

**Days 1-2: Dashboard View**
- Build Tenders page
- Display active opportunities
- Show key details

**Days 3-4: Actions**
- Implement Pursue/No Bid
- Add document links
- Build reminder system

**Day 5: Go Live**
- Review first week of tenders
- Pursue at least one opportunity
- Refine as needed

### Phase 2b Exit Criteria
- [ ] FTS + Contracts Finder ingesting daily
- [ ] Relevant tenders surfaced within 24 hours
- [ ] Classification accuracy >80%
- [ ] At least one tender pursued
- [ ] Deadline reminders working

---

## Phase 3: Contract Awards (Weeks 13-14)

### Week 13: Award Ingestion

**Days 1-3: Workflow Updates**
- Add award notice filtering to tender workflow
- Extract winner, value, dates
- Create award signals

**Days 4-5: Intelligence Processing**
- Build process-award-intel workflow
- Update Force records with contract data
- Set renewal reminders

### Week 14: UI & Integration

**Days 1-2: Force Detail Updates**
- Add contract history section
- Show competitor wins
- Display renewal dates

**Days 3-4: Backfill**
- Query historical awards (2 years)
- Populate Force records
- Verify data quality

**Day 5: Refinement**
- Review competitor tracking
- Test renewal reminders
- Document patterns

### Phase 3 Exit Criteria
- [ ] Award notices ingesting automatically
- [ ] Competitor wins tracked
- [ ] Contract end dates captured
- [ ] 10+ forces have contract history
- [ ] Renewal reminders working

---

## Phase 4: Regulatory Signals (Weeks 15-17)

### Week 15: HMICFRS Integration

**Days 1-2: Scraper Setup**
- Map HMICFRS website structure
- Build Bright Data scraper
- Test data extraction

**Days 3-4: Ingestion Workflow**
- Build ingest-hmicfrs workflow
- Parse PEEL ratings
- Create signals for concerns

**Day 5: Force Updates**
- Update all 43 forces with current ratings
- Backfill historical data

### Week 16: Reg 28 & Analysis

**Days 1-2: Reg 28 Scraper**
- Map Judiciary website
- Build scraper
- Filter for police-related

**Days 3-4: Analysis Workflow**
- Build assess-regulatory-pressure workflow
- Create sensitivity guidelines
- Generate outreach angles

**Day 5: Testing**
- Review signal quality
- Test outreach drafts
- Refine sensitivity

### Week 17: UI Integration

**Days 1-2: Forces Under Pressure View**
- Add regulatory section to dashboard
- Show ratings and concerns
- Link to opportunities

**Days 3-4: Outreach Integration**
- Add regulatory angle to message drafting
- Test sensitive messaging
- Review outputs

**Day 5: Go Live**
- Monitor first week
- Refine as needed
- Document guidelines

### Phase 4 Exit Criteria
- [ ] All 43 forces have current PEEL ratings
- [ ] New reports detected within 1 week
- [ ] Reg 28 reports captured
- [ ] Sensitive outreach angles generated
- [ ] At least 1 regulatory-triggered opportunity pursued

---

## Phase 5: News & Events (Weeks 18-19)

### Week 18: News Ingestion

**Days 1-2: API Setup**
- Configure Google News API (or SerpAPI)
- Define keyword sets
- Test queries

**Days 3-4: Ingestion Workflow**
- Build ingest-news workflow
- Set 6-hour schedule
- Implement deduplication

**Day 5: Classification**
- Build classify-news workflow
- Test relevance filtering
- Tune for noise reduction

### Week 19: Integration & Refinement

**Days 1-2: Keyword Tuning**
- Review first week of results
- Adjust keywords
- Filter noise

**Days 3-4: UI Updates**
- Add news to Signal Feed
- Include in Force profiles
- Show as context

**Day 5: Go Live**
- Monitor output quality
- Verify useful context
- Document usage guidelines

### Phase 5 Exit Criteria
- [ ] News monitoring running without flooding
- [ ] Relevant articles captured
- [ ] Classification filtering noise correctly
- [ ] News providing useful context
- [ ] No embarrassing outreach triggered

---

## Phase 6: Advanced Features (Ongoing)

### 6a: Signal Correlation Engine
- Detect multi-signal opportunities
- Generate "Why Now" narratives
- Surface high-conviction leads

### 6b: Relationship Intelligence
- Full HubSpot activity sync
- Sentiment tracking
- Relationship health scores

### 6c: Win/Loss Analysis
- Outcome tracking
- Pattern identification
- Approach optimization

### 6d: Market Dashboard
- Regional visualization
- Trend analysis
- Competitive overview

### 6e: Team Scaling
- Multi-user support
- Role permissions
- Performance tracking

---

# 15. Success Metrics

## Leading Indicators (Weekly)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Signals ingested | 50+/week | Airtable count |
| Classification accuracy | >90% | Manual spot-check (10 signals) |
| Ready opportunities | 5+/week | Dashboard count |
| Hot Leads surfaced | 2+/week | Dashboard count |
| Review time per opp | <3 minutes | Self-timing |

## Lagging Indicators (Monthly)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Outreach sent | 20+/month | HubSpot activities |
| Response rate | >10% | Replies / Sent |
| Meetings booked | 2+/month | Calendar |
| Proposals sent | 1+/month | HubSpot deals |
| Win rate | >20% | Won / Proposals |

## System Health (Daily)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Workflow failures | 0 | n8n error log |
| Scraping success | >95% | Bright Data dashboard |
| API response time | <2s | Airtable logs |
| Dashboard uptime | >99% | Vercel analytics |

## Quarterly Review Questions

1. Are we finding opportunities before competitors?
2. Is the quality of leads improving?
3. What signal sources are most valuable?
4. What outreach angles are working?
5. Where are we losing deals and why?

---

# 16. Operational Procedures

## Daily (2 minutes)

**Morning Check**:
- [ ] Any Hot Leads requiring action?
- [ ] Any failed workflows (check Slack)?
- [ ] Any urgent emails?

## Monday (15 minutes)

**Weekly Outreach Session**:
1. Open Queue view
2. Review Hot Leads first (if any)
3. Review each Ready opportunity:
   - Read "Why Now" summary
   - Review contact details
   - Review draft message
   - Edit if needed
   - Click Send or Skip
4. Note any patterns or feedback

## Wednesday (10 minutes)

**Mid-Week Follow-Up**:
- [ ] Check Sent opportunities (any replies?)
- [ ] Review Researching opportunities (stuck?)
- [ ] Process Email queue

## Friday (15 minutes)

**Weekly Review**:
- [ ] Update any opportunities with new status
- [ ] Check Pipeline view for overall health
- [ ] Review any tenders with upcoming deadlines
- [ ] Log any wins or losses

## Monthly (1 hour)

**System Review**:
- [ ] Review success metrics
- [ ] Check signal quality (spot-check 20)
- [ ] Tune AI prompts if needed
- [ ] Add/remove search keywords
- [ ] Update competitor list if needed
- [ ] Clean dormant opportunities
- [ ] Review Forces data for accuracy

---

# 17. Appendices

## Appendix A: Complete Airtable Field Reference

*[Detailed field specifications in Section 6]*

## Appendix B: AI Prompts Library

*[All prompts in Section 12]*

## Appendix C: UK Police Forces Reference

| Force | Region | Size |
|-------|--------|------|
| Avon and Somerset | South West | Large |
| Bedfordshire | East | Medium |
| Cambridgeshire | East | Medium |
| Cheshire | North West | Medium |
| City of London | London | Small |
| Cleveland | North East | Medium |
| Cumbria | North West | Small |
| Derbyshire | East Midlands | Medium |
| Devon and Cornwall | South West | Large |
| Dorset | South West | Medium |
| Durham | North East | Medium |
| Essex | East | Large |
| Gloucestershire | South West | Medium |
| Greater Manchester | North West | Large |
| Hampshire | South East | Large |
| Hertfordshire | East | Medium |
| Humberside | Yorkshire | Medium |
| Kent | South East | Large |
| Lancashire | North West | Large |
| Leicestershire | East Midlands | Medium |
| Lincolnshire | East Midlands | Medium |
| Merseyside | North West | Large |
| Metropolitan | London | Large |
| Norfolk | East | Medium |
| Northamptonshire | East Midlands | Medium |
| Northumbria | North East | Large |
| North Yorkshire | Yorkshire | Medium |
| Nottinghamshire | East Midlands | Medium |
| South Yorkshire | Yorkshire | Large |
| Staffordshire | West Midlands | Medium |
| Suffolk | East | Medium |
| Surrey | South East | Medium |
| Sussex | South East | Large |
| Thames Valley | South East | Large |
| Warwickshire | West Midlands | Small |
| West Mercia | West Midlands | Large |
| West Midlands | West Midlands | Large |
| West Yorkshire | Yorkshire | Large |
| Wiltshire | South West | Medium |
| Dyfed-Powys | Wales | Small |
| Gwent | Wales | Medium |
| North Wales | Wales | Medium |
| South Wales | Wales | Large |
| Police Scotland | Scotland | Large |
| PSNI | Northern Ireland | Large |
| British Transport Police | National | Medium |

## Appendix D: Competitor Reference

| Competitor | Website | Focus | Notes |
|------------|---------|-------|-------|
| Red Snapper Group | redsnapper.jobs | Police staffing | Primary competitor |
| Investigo | investigo.co.uk | Public sector | Growing police presence |
| Reed | reed.co.uk | Generalist | Large scale |
| Adecco | adecco.co.uk | Generalist | Global reach |
| Service Care Solutions | servicecare.org.uk | Criminal justice | Niche player |
| Hays | hays.co.uk | Generalist | Some police work |
| Brook Street | brookstreet.co.uk | Public sector | Occasional police |

## Appendix E: Glossary

| Term | Definition |
|------|------------|
| ADHD | Attention Deficit Hyperactivity Disorder |
| CPV | Common Procurement Vocabulary (EU classification) |
| DPS | Dynamic Purchasing System |
| FTS | Find a Tender Service (UK procurement) |
| HMICFRS | His Majesty's Inspectorate of Constabulary and Fire & Rescue Services |
| Hot Lead | Time-sensitive competitor interception opportunity |
| PCC | Police and Crime Commissioner |
| PCSO | Police Community Support Officer |
| PEEL | HMICFRS assessment framework (Effectiveness, Efficiency, Legitimacy) |
| PIN | Prior Information Notice (procurement) |
| PVP | Protecting Vulnerable People (police department) |
| Reg 28 | Regulation 28 — Coroner's prevention of future death report |
| RI | Requires Improvement (HMICFRS rating) |
| Signal | Raw intelligence from any source |
| Opportunity | Actionable lead combining multiple signals |

## Appendix F: Error Handling Reference

| Error Type | Response | Alert? |
|------------|----------|--------|
| Scraper timeout | Retry 3x, then skip | Yes |
| API rate limit | Back off, retry in 1 hour | No |
| Classification failure | Flag for manual review | Yes |
| HubSpot sync failure | Queue for retry | Yes |
| Email send failure | Notify user, retry option | Yes |
| Dashboard error | Show error state, log | Yes |

---

# Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2025 | James | Initial complete version |

---

*End of Document*
