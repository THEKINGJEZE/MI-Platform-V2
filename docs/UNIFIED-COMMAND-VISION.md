# MI Platform — Unified Command Vision

**Created:** 2026-01-07
**Status:** Planning
**Purpose:** Expand MI Platform from market intelligence to unified daily action system

---

## The Reframe

The MI Platform was never really about "market intelligence" — it was about **reducing cognitive load for business development**. Market intelligence (signals, opportunities, leads) is just one input.

The natural evolution: **One place to see what to do, then do it.**

| Current State | Target State |
|---------------|--------------|
| Intelligence signals only | All inputs requiring action |
| Lead prioritization | Work prioritization |
| "Ready-to-send" outreach | "Ready-to-do" anything |
| Morning Brief (leads) | Morning Brief (your whole day) |
| No social presence | Consistent, guided social engagement |

---

## The ADHD Problem This Solves

| Challenge | How Unified System Helps |
|-----------|--------------------------|
| **Volume overwhelm** | Single prioritized list, not 5 inboxes |
| **Decision fatigue** | System decides priority, you execute |
| **Priority blindness** | AI surfaces what matters, buries what doesn't |
| **Follow-up black hole** | Automated tracking, nudges, draft follow-ups |
| **Context switching** | One dashboard, all sources |
| **Forgetting tasks** | Everything captured, nothing falls through |
| **Social inconsistency** | Daily curated engagement queue, 15 min routine |

---

## Architecture

```
                         ┌─────────────────────────┐
                         │   YOUR DASHBOARD        │
                         │   "What Should I Do?"   │
                         │                         │
                         │   • Today's Priority    │
                         │   • Next Action         │
                         │   • 2-Minute Loop       │
                         └───────────┬─────────────┘
                                     │
      ┌───────────┬─────────────┼─────────────┬───────────┐
      │           │             │             │           │
┌─────▼─────┐ ┌──────▼──────┐ ┌─────▼─────┐ ┌─────▼─────┐
│  Signals  │ │   Emails    │ │   Tasks   │ │  Social   │
│  (Intel)  │ │  (Outlook)  │ │ (HubSpot) │ │ (LI + X)  │
└─────┬─────┘ └──────┬──────┘ └─────┬─────┘ └─────┬─────┘
      │             │             │             │
      │             │             │             │
      │    ┌────────────────────┼────────────────────┐    │
      │    │                    │                    │    │
      │    │         ┌──────────▼──────────┐         │    │
      │    │         │      HUBSPOT        │         │    │
      └────┼────────►│  (Source of Truth)  │◄────────┼────┘
           │         │                     │         │
           │         │  • Contacts         │         │
           │         │  • Companies/Forces │         │
           │         │  • Deals            │         │
           │         │  • Activities       │         │
           │         │  • Tasks            │         │
           │         │  • Email Sync       │         │
           │         │  • Meeting Notes    │         │
           │         └─────────────────────┘         │
           │                    ▲                    │
           │                    │                    │
           │         ┌──────────┴──────────┐         │
           │         │   Meeting Notes     │         │
           │         │   (AI Transcriber)  │         │
           │         └─────────────────────┘         │
           │                                         │
           └─────────────────────────────────────────┘
```

### Key Principles

1. **HubSpot is the system of record** — all relationship data lives there
2. **Dashboard is the action layer** — presents, prioritizes, enables quick action
3. **n8n orchestrates** — moves data, triggers AI, creates drafts
4. **Airtable stores working data** — signals, opportunities, action queue
5. **95/5 Rule** — system handles 95%, James reviews 5%

---

## Input Sources

### 1. Market Intelligence (Existing)
- HMICFRS ratings
- Job postings (hiring signals)
- Procurement notices (FTS, Contracts Finder)
- News mentions
- Competitor activity

**Becomes:** Opportunities with outreach drafts

### 2. Email (New — Phase 1)
- Incoming emails requiring response
- Emails you've sent awaiting reply ("waiting-for")
- Follow-up reminders
- AI-classified priority

**Becomes:** Reply actions with drafts, follow-up nudges

### 3. Tasks (New — Phase 2)
- HubSpot tasks (manual or from meetings)
- Meeting action items (auto-created by AI transcriber)
- Recurring tasks
- Deadline-driven work

**Becomes:** Prioritized task list with context

### 4. Meetings (New — Phase 3)
- Meeting prep reminders
- Post-meeting follow-up tasks
- Meeting notes context for outreach
- Relationship timeline

**Becomes:** Prep briefs, follow-up actions, enriched context

### 5. Social Engagement (New — Phase 5)
- LinkedIn posts from priority contacts
- Twitter/X posts from industry influencers
- Curated daily engagement queue
- AI-suggested comments

**Becomes:** Daily 15-minute engagement session (3 comments + 2 likes)

---

## The Unified Action Model

Every item — regardless of source — gets scored and presented consistently:

| Source | Action Type | Example |
|--------|-------------|---------|
| MI signal | Outreach | "Reach out to West Midlands (HMICFRS Inadequate)" |
| Email received | Reply | "Reply to Sarah Chen @ Kent Police" |
| Email sent | Follow-up | "Chase Durham tender response (3 days)" |
| HubSpot task | Task | "Send NCA case study (from Monday meeting)" |
| Meeting upcoming | Prep | "Prepare for Met Police call (2pm)" |
| Meeting completed | Follow-up | "Send summary to attendees" |
| Social post | Engage | "Comment on Sarah Chen's LinkedIn post" |

### Priority Scoring (Unified)

All actions scored 0-100:

| Factor | Weight | Inputs |
|--------|--------|--------|
| **Urgency** | 30% | Deadline proximity, days waiting, meeting time |
| **Relationship** | 25% | HubSpot score, contact history, deal value |
| **Signal Strength** | 20% | Source reliability, signal type, recency |
| **Effort** | 15% | Draft ready? Quick reply? Complex task? |
| **Strategic Fit** | 10% | Service match, force priority tier |

Low-effort + high-urgency items bubble to top (quick wins first).

---

## Morning Brief (Expanded)

```
┌─────────────────────────────────────────────────────────────┐
│  TUESDAY 7 JANUARY — MORNING BRIEF                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔴 DO FIRST (3 items)                                      │
│                                                             │
│  1. Reply to Sarah Chen @ Kent Police                       │
│     └─ Asked about PIP2 availability — 2 days waiting       │
│     └─ [Draft Ready] [Open Email] [Mark Done]               │
│                                                             │
│  2. Follow up: Durham tender response                       │
│     └─ You said you'd send proposal Monday — it's Tuesday   │
│     └─ [Draft Ready] [Open Email] [Mark Done]               │
│                                                             │
│  3. NEW SIGNAL: West Midlands HMICFRS Inadequate            │
│     └─ Announced yesterday — high priority target           │
│     └─ [View Intel] [Draft Outreach] [Snooze]               │
│                                                             │
│  📅 TODAY'S MEETINGS                                         │
│                                                             │
│  • 14:00 — Met Police framework call                        │
│    └─ [View Prep Brief] [Join Meeting]                      │
│                                                             │
│  📱 SOCIAL ENGAGEMENT (15 min)                               │
│                                                             │
│  Today's goal: 3 comments, 2 likes (0/5 done)               │
│  • Sarah Chen posted about training program [Comment]       │
│  • Police Federation shared workforce article [Comment]     │
│  • HMICFRS announced new framework [Comment]                │
│  • Durham Police team photo [Like]                          │
│  • John Smith shared your article [Like]                    │
│  [Start Engagement Session]                                 │
│                                                             │
│  🟡 DO TODAY (7 items)                                       │
│                                                             │
│  • Task: Send NCA case study (from Monday meeting)          │
│  • Email: Respond to James Wright @ Notts                   │
│  • Review: 4 new job signals                                │
│  • Task: Update proposal template                           │
│  ...                                                        │
│                                                             │
│  ⚪ THIS WEEK (12 items)                                     │
│                                                             │
│  [Collapsed — click to expand]                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Email Subsystem Detail

### Email Processing Flow

```
Outlook Inbox
      │
      ▼
n8n: Fetch new emails (every 15 min)
      │
      ▼
AI Classification
      │
      ├──► 🔴 Urgent (client, time-sensitive)
      ├──► 🟡 Today (needs response, moderate priority)  
      ├──► 🟢 This Week (can wait)
      ├──► ⚪ FYI (newsletters, notifications)
      └──► 🗑️ Archive (auto-archive, extract if relevant)
      │
      ▼
Store in Airtable (Email Actions table)
      │
      ▼
For replies: AI drafts response
      │
      ▼
Surface in Dashboard
```

### "Waiting For" Tracking

```
You send email
      │
      ▼
n8n detects: "James asked for X"
      │
      ▼
Create "Waiting For" record
      │
      ├──► Day 2: No reply — low priority reminder
      ├──► Day 5: No reply — medium priority, draft follow-up
      └──► Day 7+: High priority — "Still waiting on X"
      │
      ▼
When reply received: Auto-close waiting-for
```

### AI Response Drafting

For common patterns, AI drafts in James's voice:

| Pattern | Draft Type |
|---------|------------|
| Meeting request | Check calendar, propose times |
| "Can you send X?" | Acknowledge, note to attach |
| Question about services | Answer from knowledge base |
| Introduction | Polite acknowledgment |
| Follow-up needed | Context-aware chase |

**Key:** Drafts are suggestions. James reviews and sends (2 minutes, not 20).

---

## Meeting Integration Detail

### Meeting Notes → Actions

```
Meeting happens
      │
      ▼
AI Transcriber records & transcribes
      │
      ▼
Auto-sync to HubSpot
      │
      ├──► Meeting logged on Contact/Company
      ├──► Tasks created from action items
      └──► Notes stored for context
      │
      ▼
n8n pulls new HubSpot tasks
      │
      ▼
Surface in Dashboard with meeting context
```

### Meeting Prep Brief

Before meetings, dashboard shows:

```
┌─────────────────────────────────────────────────────────────┐
│  PREP BRIEF: Met Police Framework Call                      │
│  Today 14:00 — 30 minutes                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ATTENDEES                                                  │
│  • Sarah Johnson (Procurement Lead) — Met Police            │
│  • You                                                      │
│                                                             │
│  RELATIONSHIP CONTEXT                                       │
│  • Last contact: 12 days ago (email)                        │
│  • Deal stage: Proposal Sent                                │
│  • Deal value: £180,000                                     │
│                                                             │
│  LAST MEETING (18 Dec)                                      │
│  • Discussed framework rates                                │
│  • They mentioned budget approval needed in January         │
│  • Action: You to send updated rate card ✅ (sent 20 Dec)   │
│                                                             │
│  RECENT SIGNALS                                             │
│  • Met posted 3 investigator roles (2 Jan)                  │
│  • No HMICFRS issues                                        │
│                                                             │
│  SUGGESTED TALKING POINTS                                   │
│  • Follow up on budget approval status                      │
│  • Mention new PIP2 accredited investigators available      │
│  • Confirm framework start date                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Email Foundation (Target: This Week)

**Goal:** Get email flowing into the system

**Tasks:**
1. Resolve Azure/Outlook credentials with IT
2. Build n8n workflow: Fetch emails from Outlook
3. AI classification (Urgent/Today/Week/FYI/Archive)
4. Store in Airtable (new Email Actions table)
5. Simple dashboard view of email queue
6. AI draft responses for top emails

**Success:** Morning email digest with 3 priority emails + drafts

**Dependencies:**
- Outlook API access via Azure
- OpenAI/Claude for classification

### Phase 2: Unified Task View + Relationship Health (Target: +1 Week)

**Goal:** Single priority list combining signals + emails + tasks + relationship alerts

**Tasks:**
1. Pull HubSpot tasks into Airtable
2. Create unified "Actions" table (or view)
3. Unified priority scoring across all sources
4. "Waiting-for" tracking for sent emails
5. Dashboard: Single priority queue
6. **Relationship Decay Alerts** — Flag contacts going cold
7. **Deal Health Monitor** — Flag deals at risk

**Success:** One list showing everything to do, ranked, with proactive alerts for relationships and deals going stale

**Dependencies:**
- Phase 1 complete
- HubSpot task sync
- HubSpot deal data access

### Phase 3: Meeting Integration + Pre-Call Briefs (Target: +2 Weeks)

**Goal:** Meeting context flows into system, with briefs for ALL calls (scheduled and ad-hoc)

**Tasks:**
1. Confirm meeting notes syncing to HubSpot
2. Pull meeting-created tasks into dashboard
3. Meeting prep briefs (auto-generated for scheduled meetings)
4. **Pre-Call Briefs** — On-demand briefs for ad-hoc calls
5. Post-meeting follow-up reminders
6. Meeting context in outreach drafts

**Success:** Prep brief before meetings, on-demand brief before any call, auto-created follow-up tasks appear in queue

**Dependencies:**
- Phase 2 complete
- AI transcriber → HubSpot sync working
- Calendar integration (for scheduled meetings)

### Phase 4: Full Morning Brief (Target: +3 Weeks)

**Goal:** Complete daily command center

**Tasks:**
1. Combine all sources into Morning Brief
2. Mobile-friendly view
3. One-tap actions (reply, complete, snooze)
4. Daily/weekly summaries
5. "End of day" wind-down (what's left, what's tomorrow)

**Success:** Open dashboard in morning, see exactly what to do, do it, done

### Phase 5: Social Engagement (Target: +4 Weeks)

**Goal:** Consistent daily social presence with minimal friction

**Specs:**
- Platforms: LinkedIn + Twitter/X (equal priority)
- Priority accounts: Police contacts, industry influencers
- Daily target: 3 comments + 2 likes
- Time budget: 15 minutes/day

**Tasks:**
1. Build priority accounts list (police contacts + influencers)
2. n8n workflow: Fetch recent posts from priority accounts
3. AI scoring: Which posts are worth engaging with?
4. AI comment suggestions in James's voice
5. Dashboard: Daily engagement queue
6. "Engagement Session" mode (guided 15-min flow)
7. Streak tracking and consistency metrics

**Success:** Every day, 5 curated posts ready to engage with, suggested comments, done in 15 minutes

**Technical approach:**
- LinkedIn: RSS feeds or scraping (API is restrictive)
- Twitter/X: API or RSS
- No auto-posting (TOS risk) — system curates, you click
- Claude in Chrome for seamless "open post" → engage flow

### Phase 6: Weekly Planning Session (Target: +5 Weeks)

**Goal:** Structured weekly planning to set priorities and prevent drift

**Specs:**
- When: Sunday evening or Monday morning
- Duration: 15-20 minutes
- Output: Confirmed weekly priorities + calendar blocks

**Tasks:**
1. Auto-generate "Week Ahead" view from all sources
2. AI suggests top 3-5 priorities for the week
3. Review interface: Confirm, adjust, or defer items
4. Calendar integration: Block focus time for big items
5. End-of-week review: What got done, what slipped, celebrate wins
6. Weekly metrics summary

**Success:** Every Monday, clear view of the week with confirmed priorities. Every Friday, quick review of accomplishments.

**Dependencies:**
- Phase 4 complete (Morning Brief working)
- Calendar write access

---

## Social Engagement Subsystem Detail

### The ADHD Social Problem

| Challenge | How System Helps |
|-----------|------------------|
| **Inconsistency** | Daily curated queue makes it routine |
| **Overwhelm** | Only see 5 posts, not infinite feed |
| **Comment paralysis** | AI suggests what to say |
| **Time sink** | 15-min session mode, then done |
| **No habit** | Part of Morning Brief, tracked streak |

### Priority Account Tiers

| Tier | Who | Why |
|------|-----|-----|
| 🔴 **High** | Active prospects/clients | Direct relationship value |
| 🔴 **High** | Police contacts at target forces | Warm relationships |
| 🟡 **Medium** | Industry influencers | Visibility, thought leadership |
| 🟡 **Medium** | HMICFRS, Home Office, NPCC accounts | Stay informed, show engagement |
| 🟢 **Low** | General network | Maintain presence |

### Daily Engagement Flow

```
n8n: Fetch posts from priority accounts (daily 06:00)
      │
      ▼
AI Scoring
      │
      ├──► Relevance to your work?
      ├──► Engagement potential? (likes, comments already)
      ├──► Relationship value? (prospect vs stranger)
      └──► Recency? (last 24h preferred)
      │
      ▼
Top 5 posts selected
      │
      ├──► 3 for commenting (higher value)
      └──► 2 for liking (quick wins)
      │
      ▼
AI drafts comments for top 3
      │
      ▼
Store in Airtable (Social Engagement table)
      │
      ▼
Surface in Dashboard
```

### Engagement Session Mode

A focused 15-minute mode:

```
┌─────────────────────────────────────────────────────────────┐
│  ENGAGEMENT SESSION                          1 of 5 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📝 COMMENT on LinkedIn                                      │
│                                                             │
│  Sarah Chen • Head of Investigations @ Kent Police          │
│  Posted 4 hours ago                                         │
│                                                             │
│  "Excited to announce our new investigator training         │
│  program launching next month! This will help us            │
│  develop the next generation of detectives..."              │
│                                                             │
│  💬 Suggested comment:                                       │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Congratulations Sarah! This sounds like a great      │ │
│  │ initiative. Always good to see forces investing in   │ │
│  │ development. Happy to chat if you ever need external │ │
│  │ support during the transition.                       │ │
│  └───────────────────────────────────────────────────────┘ │
│  [Edit] [Copy & Open Post] [Skip] [Done]                    │
│                                                             │
│  Why this post: Active prospect, relevant topic,            │
│  high engagement potential                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Workflow:
1. See post + suggested comment
2. Edit if needed (or use as-is)
3. Click "Copy & Open Post" → Claude in Chrome opens LinkedIn/Twitter
4. Paste comment, post
5. Click "Done" → next post
6. After 5: "Session complete! 🎉"

### Consistency Tracking

```
This Week:
Mon: ✅ 5/5
Tue: ⏳ 2/5 (in progress)
Wed: —
Thu: —
Fri: —

Streak: 1 day
This month: 12/20 days (60%)
Goal: 80% consistency
```

### AI Comment Guidelines

Comments should be:
- **Authentic** — Sound like James, not generic AI
- **Value-adding** — Not just "Great post!"
- **Relationship-aware** — Warmer for prospects, professional for strangers
- **Subtle BD** — Mention expertise when natural, never salesy

Examples:

| Post Type | Comment Style |
|-----------|---------------|
| Achievement announcement | Congratulate + relate to your experience |
| Industry challenge | Empathise + offer perspective |
| News/policy change | Share informed take |
| Question/discussion | Answer helpfully |
| Team/culture post | Supportive, humanising |

---

## Relationship Decay Alert Subsystem

### The Problem

Relationships go cold without you noticing. You meant to stay in touch with Sarah at Kent Police, but suddenly it's been 90 days and you've lost momentum.

### How It Works

```
n8n: Daily scan of HubSpot contacts (06:00)
      │
      ▼
For each contact, calculate:
      │
      ├──► Days since last activity
      ├──► Contact tier (prospect/client/other)
      ├──► Deal value associated
      └──► Relationship score from HubSpot
      │
      ▼
Apply decay thresholds:
      │
      ├──► Active clients: Alert at 30 days
      ├──► Hot prospects: Alert at 14 days
      ├──► Warm prospects: Alert at 30 days
      └──► General network: Alert at 60 days
      │
      ▼
Create "Relationship Alert" action
      │
      ▼
AI suggests touchpoint (not salesy)
      │
      ▼
Surface in Morning Brief
```

### Alert Tiers

| Days Silent | Contact Type | Alert Level | Suggested Action |
|-------------|--------------|-------------|------------------|
| 14+ | Hot prospect | 🟡 Warming | "Check in on proposal" |
| 30+ | Active client | 🟡 Warming | "Schedule catch-up" |
| 30+ | Warm prospect | 🟠 Cooling | "Share relevant article" |
| 45+ | Any prospect | 🔴 Cold | "Re-engage or archive" |
| 60+ | General network | 🟡 Warming | "Quick LinkedIn touchpoint" |

### Suggested Touchpoints

Not every touchpoint needs to be a sales pitch:

| Touchpoint Type | Example |
|-----------------|--------|
| Share content | "Saw this article on police workforce — thought of you" |
| Congratulate | "Noticed Durham got Good rating — congrats!" |
| Ask for input | "Working on a piece about X — would value your perspective" |
| Simple check-in | "Been a while — how's the new role going?" |
| Offer value | "We've got capacity if you need surge support" |

### Dashboard View

```
┌─────────────────────────────────────────────────────────────┐
│  🔔 RELATIONSHIPS NEED ATTENTION                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔴 Sarah Chen @ Kent Police                                 │
│     └─ 45 days since last contact (was hot prospect)        │
│     └─ Deal: £120k proposal sent                            │
│     └─ [Email] [LinkedIn] [Call] [Snooze 7d]                │
│                                                             │
│  🟡 Mike Thompson @ Durham                                   │
│     └─ 32 days since last contact (active client)           │
│     └─ Suggested: "Schedule quarterly review"               │
│     └─ [Email] [LinkedIn] [Call] [Snooze 7d]                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Deal Health Monitor Subsystem

### The Problem

Deals stall without you noticing. A proposal sits unanswered, a conversation goes quiet, and suddenly you've lost a deal you could have saved.

### How It Works

```
n8n: Daily scan of HubSpot deals (06:00)
      │
      ▼
For each open deal, calculate:
      │
      ├──► Days in current stage
      ├──► Days since last activity
      ├──► Expected close date vs today
      └──► Deal value
      │
      ▼
Apply health scoring:
      │
      ├──► 🟢 Healthy: Recent activity, on track
      ├──► 🟡 At Risk: Slowing down, needs attention
      └──► 🔴 Critical: Stalled, overdue, or going cold
      │
      ▼
Create "Deal Alert" for at-risk/critical
      │
      ▼
AI suggests re-engagement action
      │
      ▼
Surface in Morning Brief
```

### Health Criteria

| Status | Criteria | Example |
|--------|----------|---------|  
| 🟢 **Healthy** | Activity in last 7 days, on schedule | "Met yesterday, next step confirmed" |
| 🟡 **At Risk** | No activity 7-14 days, or stage stalled 2+ weeks | "Proposal sent 12 days ago, no response" |
| 🔴 **Critical** | No activity 14+ days, past expected close, or explicit concern | "Expected close was last week, radio silence" |

### Deal Dashboard Section

```
┌─────────────────────────────────────────────────────────────┐
│  💰 PIPELINE HEALTH                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Total Pipeline: £485,000 across 6 deals                    │
│  🟢 Healthy: £200k (2)  🟡 At Risk: £185k (3)  🔴 Critical: £100k (1) │
│                                                             │
│  DEALS NEEDING ATTENTION                                    │
│                                                             │
│  🔴 Kent Police — PIP2 Framework (£120,000)                  │
│     └─ Stage: Proposal Sent (18 days)                       │
│     └─ Last activity: 18 days ago                           │
│     └─ Expected close: 5 days overdue                       │
│     └─ [Chase Email] [Call Contact] [Update Stage]          │
│                                                             │
│  🟡 Durham — Surge Support (£85,000)                         │
│     └─ Stage: Negotiation (12 days)                         │
│     └─ Last activity: 9 days ago                            │
│     └─ Suggested: "Follow up on contract terms"             │
│     └─ [Email] [Call] [Snooze 3d]                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### AI Re-engagement Suggestions

| Situation | Suggested Action |
|-----------|------------------|
| Proposal unanswered | "Check if they have questions, offer to walk through" |
| Meeting promised but not scheduled | "Suggest specific times" |
| Waiting on their internal process | "Ask for status update, offer to help with business case" |
| Price objection last discussed | "Share case study showing ROI" |
| Radio silence | "Soft check-in, acknowledge they're busy" |

---

## Pre-Call Brief Subsystem

### The Problem

You're about to call Sarah at Kent Police. You know you've spoken before, but... what did you discuss? What's the deal status? What should you mention?

Walking into calls unprepared wastes opportunities and damages credibility.

### How It Works

**Two modes:**

1. **Scheduled Meetings** — Auto-generated brief appears 30 min before
2. **Ad-hoc Calls** — On-demand brief when you're about to call someone

```
Trigger: "Brief me on Sarah Chen" or click [Get Brief] on contact
      │
      ▼
Pull from HubSpot:
      │
      ├──► Contact details + role
      ├──► Company/Force info
      ├──► All associated deals
      ├──► Recent activities (emails, calls, meetings)
      ├──► Meeting notes from AI transcriber
      └──► Tasks related to this contact
      │
      ▼
Pull from MI Platform:
      │
      ├──► Recent signals for their force
      ├──► Opportunities linked to force
      └──► Competitor activity at their force
      │
      ▼
AI synthesises into brief
      │
      ▼
Display in dashboard or mobile
```

### Pre-Call Brief Format

```
┌─────────────────────────────────────────────────────────────┐
│  📞 PRE-CALL BRIEF: Sarah Chen                               │
│  Kent Police • Head of Investigations                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  QUICK CONTEXT                                              │
│  • Last spoke: 18 days ago (email about proposal)           │
│  • Relationship: Warm — 3 meetings, 12 emails                │
│  • Her priority: Building investigation capacity             │
│                                                             │
│  ACTIVE DEAL                                                │
│  • PIP2 Framework — £120,000 — Proposal Sent                 │
│  • Status: 🔴 Overdue — expected close was 5 days ago         │
│  • Last update: Waiting on budget approval                  │
│                                                             │
│  LAST CONVERSATION (18 Dec)                                 │
│  • She liked the proposal structure                         │
│  • Concern: Budget timing — needs sign-off from CC          │
│  • You offered to present to senior team                    │
│  • She said she'd come back "early January"                 │
│                                                             │
│  RECENT SIGNALS (Kent Police)                               │
│  • Posted 2 investigator roles (3 Jan) — confirms need      │
│  • No HMICFRS concerns                                      │
│                                                             │
│  SUGGESTED TALKING POINTS                                   │
│  • "Did budget approval come through?"                      │
│  • "Saw you posted investigator roles — we have PIP2s"      │
│  • "Happy to present to CC if that would help"              │
│                                                             │
│  [Copy Brief] [Open in HubSpot] [Start Call]                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Mobile-Friendly Version

For when you're about to call from your phone:

```
Sarah Chen • Kent Police

⏰ 18 days since last contact
💰 £120k deal — Proposal Sent (🔴 Overdue)

🗣️ Last time:
• Waiting on budget approval
• Offered to present to CC

💡 Ask about:
• Budget approval status
• New investigator roles posted
```

---

## Weekly Planning Session Subsystem

### The Problem

Without structure, weeks blur together. You react to whatever's loudest rather than what's most important. ADHD makes this worse — without external structure, drift happens.

### How It Works

**Two sessions per week:**

1. **Monday Planning** (15-20 min) — Set the week's priorities
2. **Friday Review** (10 min) — What got done, what slipped, celebrate wins

```
Monday 07:00: System generates "Week Ahead" view
      │
      ▼
Pulls from all sources:
      │
      ├──► Meetings scheduled this week
      ├──► Tasks due this week
      ├──► Deals with expected close dates this week
      ├──► Relationship alerts (going cold)
      ├──► New signals/opportunities
      └──► Carryover from last week (not completed)
      │
      ▼
AI suggests top 3-5 priorities
      │
      ▼
You review and confirm
      │
      ▼
System creates calendar blocks for focus time
      │
      ▼
Priorities locked — visible all week
```

### Monday Planning Interface

```
┌─────────────────────────────────────────────────────────────┐
│  📅 WEEK OF 6 JANUARY — PLANNING SESSION                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  THIS WEEK'S LANDSCAPE                                      │
│  • 4 meetings scheduled                                     │
│  • 12 tasks due                                             │
│  • 2 deals expected to close                                │
│  • 3 relationships need attention                           │
│  • 5 new signals to review                                  │
│                                                             │
│  🎯 AI-SUGGESTED PRIORITIES                                  │
│                                                             │
│  1. ☐ Close Kent Police deal (£120k)                        │
│       └─ Overdue, high value, chase this week              │
│                                                             │
│  2. ☐ Prepare for Met Police meeting (Wed)                  │
│       └─ £180k opportunity, needs prep                      │
│                                                             │
│  3. ☐ Re-engage Durham contact (32 days cold)               │
│       └─ Active client, relationship at risk               │
│                                                             │
│  4. ☐ Review West Midlands opportunity                      │
│       └─ New HMICFRS signal, time-sensitive                 │
│                                                             │
│  5. ☐ Complete proposal template update                     │
│       └─ Carried over from last week                        │
│                                                             │
│  [Confirm Priorities] [Add Item] [Defer Item]               │
│                                                             │
│  📆 BLOCK FOCUS TIME                                         │
│  System suggests: Tue 9-11am, Thu 2-4pm                     │
│  [Accept] [Modify]                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Friday Review Interface

```
┌─────────────────────────────────────────────────────────────┐
│  🎉 WEEK OF 6 JANUARY — REVIEW                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🏆 WINS THIS WEEK                                           │
│  • Closed Kent Police deal! (£120k) 🎉                        │
│  • Great Met Police meeting — moved to negotiation          │
│  • 5/5 social engagement days                               │
│                                                             │
│  📊 THIS WEEK'S NUMBERS                                      │
│  • Emails processed: 47                                     │
│  • Tasks completed: 9/12 (75%)                              │
│  • Meetings held: 4                                         │
│  • Pipeline added: £85k                                     │
│  • Pipeline closed: £120k                                   │
│                                                             │
│  ➡️ CARRYING TO NEXT WEEK                                    │
│  • Proposal template update (again...)                      │
│  • West Midlands outreach (deprioritised)                   │
│                                                             │
│  💡 INSIGHT                                                   │
│  "You completed 75% of tasks. Proposal template has         │
│  slipped 3 weeks — consider breaking it into smaller        │
│  chunks or delegating."                                     │
│                                                             │
│  [Done — Start Weekend!]                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Why This Helps ADHD

| ADHD Challenge | How Weekly Planning Helps |
|----------------|---------------------------|
| **No external structure** | Creates artificial deadlines and checkpoints |
| **Forgetting priorities** | Locked priorities visible all week |
| **Overwhelm** | AI narrows to 3-5 things that matter |
| **Time blindness** | Calendar blocks create structure |
| **No sense of progress** | Friday review shows accomplishments |
| **Carryover guilt** | System tracks it, no mental load |

---

## New Airtable Tables Needed

### Email Actions

| Field | Type | Purpose |
|-------|------|---------|
| Email ID | Text | Outlook message ID |
| Subject | Text | Email subject |
| From | Text | Sender email |
| From Name | Text | Sender display name |
| Received | DateTime | When received |
| Priority | Select | 🔴 Urgent / 🟡 Today / 🟢 Week / ⚪ FYI |
| Status | Select | New / Draft Ready / Sent / Archived |
| Draft Response | Long Text | AI-generated draft |
| Force | Link | Link to Forces table if relevant |
| Contact | Link | Link to HubSpot contact |
| Action Type | Select | Reply / Follow-up / FYI / Archive |
| Due Date | Date | When to action by |

### Waiting For

| Field | Type | Purpose |
|-------|------|---------|
| Email ID | Text | Original sent email ID |
| Sent To | Text | Recipient |
| Sent Date | DateTime | When you sent |
| Summary | Text | What you asked for |
| Status | Select | Waiting / Received / Closed |
| Days Waiting | Formula | Days since sent |
| Follow-up Draft | Long Text | AI draft follow-up |
| Force | Link | Link to Forces table |

### Unified Actions (View or Table)

Could be a view combining:
- Opportunities (from MI signals)
- Email Actions (from Outlook)
- HubSpot Tasks (from meetings/manual)

Or a separate table that references all three.

### Social Engagement

| Field | Type | Purpose |
|-------|------|---------|  
| Post ID | Text | Platform-specific post ID |
| Platform | Select | LinkedIn / Twitter |
| Author | Text | Who posted |
| Author Tier | Select | 🔴 High / 🟡 Medium / 🟢 Low |
| Post URL | URL | Link to original post |
| Post Preview | Long Text | First 280 chars of post |
| Posted At | DateTime | When they posted |
| Engagement Type | Select | Comment / Like |
| Suggested Comment | Long Text | AI-drafted comment |
| Status | Select | Pending / Done / Skipped |
| Engaged At | DateTime | When you engaged |
| Force | Link | Link to Forces if police contact |
| Contact | Link | Link to HubSpot contact |

### Priority Accounts

| Field | Type | Purpose |
|-------|------|---------|  
| Name | Text | Person/org name |
| Platform | Select | LinkedIn / Twitter / Both |
| Profile URL | URL | Link to profile |
| Tier | Select | 🔴 High / 🟡 Medium / 🟢 Low |
| Category | Select | Police Contact / Industry Influencer / Competitor / Other |
| Force | Link | Link to Forces if applicable |
| Contact | Link | Link to HubSpot contact |
| Notes | Long Text | Why they matter |
| Last Engaged | Date | When you last interacted |

---

## Technical Considerations

### Outlook Integration via n8n

**Required:**
- Azure AD App Registration
- Microsoft Graph API permissions:
  - `Mail.Read` — Read emails
  - `Mail.Send` — Send emails (for drafts)
  - `Calendars.Read` — Read calendar (for meeting prep)
- OAuth2 credentials in n8n

**n8n Nodes:**
- Microsoft Outlook node (or HTTP Request to Graph API)
- Trigger: Schedule (every 15 min) or Webhook

### HubSpot Sync Considerations

**Already working:**
- Company/Force sync
- Contact sync
- Activity logging

**To add:**
- Task sync (bidirectional?)
- Meeting notes (read from HubSpot)

**Rule:** HubSpot is source of truth for relationship data. Don't create shadow copies.

### AI Processing

**Classification:** GPT-4 or Claude for email triage
**Drafting:** Claude (better tone matching) or GPT-4
**Context:** RAG from HubSpot data for personalization

---

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Inbox zero (processed) | Daily | Email Actions table: 0 "New" at end of day |
| Response time | <24h for urgent | Average time from received to replied |
| Follow-up rate | 100% | Waiting-for items closed or chased |
| Morning Brief usage | Daily | Dashboard opens per day |
| Task completion | 80% | HubSpot tasks completed on time |
| Context switching | -50% | Self-reported (fewer apps open) |
| Social consistency | 80% | Days with 5/5 engagements / work days |
| Social streak | 5+ days | Consecutive days of full engagement |
| Relationships maintained | <5 alerts | Decay alerts per week |
| Deal health | >70% healthy | Percentage of pipeline in green status |
| Weekly planning | 100% | Monday planning completed every week |
| Pre-call prep | 100% | Brief viewed before every call |

---

## Open Questions

1. **Email sending:** Send via Outlook directly, or draft-and-notify?
2. **Task creation:** Can dashboard create HubSpot tasks, or one-way sync?
3. **Mobile:** Separate mobile view, or responsive dashboard?
4. **Notifications:** Slack? Push? Email digest only?
5. **Personal vs Work:** Does this extend beyond BD? (e.g., all work email)
6. **Social post fetching:** RSS feeds vs scraping vs API — what's reliable?
7. **Cross-platform:** Same engagement queue for LinkedIn + Twitter, or separate?

---

## Future Items (Out of Scope for Now)

These are noted for future consideration but **not part of the current 5-phase plan**:

### Weekly Blog / Content Creation

James wants to post original content, including a weekly blog. This is a separate workstream:

**Potential approach:**
- Weekly prompt based on signals/news: "Write about [topic]"
- AI drafts blog post in James's voice
- James reviews, edits, publishes
- Auto-share to LinkedIn + Twitter
- Track engagement/performance

**Why separate:** Content creation is a different muscle from engagement. Get engagement habit established first, then layer in content.

**When to revisit:** After Phase 5 is working (consistent 80% engagement rate).

### Other Future Ideas

- **Competitor monitoring:** Track what competitors are posting
- **Engagement analytics:** Which posts/comments drive most profile views?
- **Network growth:** Suggested connections to make
- **Content calendar:** Plan posts in advance
- **Repurposing:** Turn meeting insights into content

---

## Next Steps

1. **Today:** Create this document ✅
2. **Today/Tomorrow:** Work with IT on Azure/Outlook credentials
3. **Once credentials work:** Build Phase 1 email workflow
4. **Parallel:** Continue BUILD.md items for current MI Platform fixes

---

*This document will evolve. Update as decisions are made.*
