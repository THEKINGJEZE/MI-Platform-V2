# SPEC-013: Social Engagement System

**Phase**: 3
**Status**: Planned
**Created**: 23 January 2026
**Dependencies**: Phase 2a complete (Email + Relationship Decay working)

---

## Goal

Create a daily 15-minute social engagement routine that addresses ADHD inconsistency through AI-curated content and guided sessions.

**Success metric**: 80% engagement consistency (days with 5/5 engagements completed)

---

## The ADHD Problem This Solves

| Challenge | How System Helps |
|-----------|------------------|
| **Inconsistency** | Daily curated queue makes it routine |
| **Overwhelm** | Only see 5 posts, not infinite feed |
| **Comment paralysis** | AI suggests what to say |
| **Time sink** | 15-min session mode, then done |
| **No habit** | Part of Morning Brief, tracked streak |

---

## Scope

### In Scope
- Priority accounts list (police contacts + industry influencers)
- Daily post fetching from LinkedIn and Twitter/X
- AI scoring to select top 5 posts worth engaging with
- AI-suggested comments in James's voice
- Dashboard engagement queue (3 to comment, 2 to like)
- "Engagement Session" guided mode
- Streak tracking and consistency metrics

### Out of Scope
- Auto-posting (TOS risk)
- Content creation/blogging (separate workstream)
- Competitor monitoring via social
- Network growth suggestions

---

## User Flow

### Daily Routine

1. **06:00** — n8n workflow fetches posts from priority accounts
2. **06:05** — AI scores and selects top 5 posts
3. **06:10** — AI drafts suggested comments for top 3
4. **Morning Brief** — Shows "Social Engagement (0/5)" section
5. **User clicks "Start Engagement Session"**
6. **Guided flow**: See post → Edit comment if needed → Copy & Open → Engage → Mark Done → Next
7. **After 5** — "Session complete! 🎉" + streak updated

### Engagement Session Interface

```
┌─────────────────────────────────────────────────────────────┐
│  ENGAGEMENT SESSION                          1 of 5         │
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

---

## Priority Account Tiers

| Tier | Who | Why |
|------|-----|-----|
| 🔴 **High** | Active prospects/clients | Direct relationship value |
| 🔴 **High** | Police contacts at target forces | Warm relationships |
| 🟡 **Medium** | Industry influencers | Visibility, thought leadership |
| 🟡 **Medium** | HMICFRS, Home Office, NPCC accounts | Stay informed, show engagement |
| 🟢 **Low** | General network | Maintain presence |

---

## AI Comment Guidelines

Comments should be:
- **Authentic** — Sound like James, not generic AI
- **Value-adding** — Not just "Great post!"
- **Relationship-aware** — Warmer for prospects, professional for strangers
- **Subtle BD** — Mention expertise when natural, never salesy

| Post Type | Comment Style |
|-----------|---------------|
| Achievement announcement | Congratulate + relate to your experience |
| Industry challenge | Empathise + offer perspective |
| News/policy change | Share informed take |
| Question/discussion | Answer helpfully |
| Team/culture post | Supportive, humanising |

---

## Technical Approach

### Post Fetching

| Platform | Method | Limitation |
|----------|--------|------------|
| LinkedIn | RSS feeds or scraping | API is restrictive; may need Bright Data |
| Twitter/X | API (v2) | Rate limits; may need paid tier |

**No auto-posting** — TOS risk. System curates, James clicks.

### AI Scoring

Each post scored 0-100 based on:
- **Relevance** (40%) — Is it about policing, investigations, workforce?
- **Relationship** (30%) — Author tier, existing HubSpot relationship
- **Engagement potential** (20%) — Likes/comments already, discussion starter
- **Recency** (10%) — Prefer last 24h

Top 5 selected: 3 for commenting (highest scores), 2 for liking (quick wins).

### Workflow Architecture

```
n8n: Fetch posts (daily 06:00)
      │
      ▼
For each priority account:
      │
      ├──► LinkedIn RSS/scrape
      └──► Twitter API
      │
      ▼
Deduplicate + store raw
      │
      ▼
AI scoring (Claude)
      │
      ▼
Top 5 selected
      │
      ▼
AI drafts comments for top 3
      │
      ▼
Store in Social_Engagement table
      │
      ▼
Surface in Dashboard
```

---

## Schema

### Social_Engagement Table

| Field | Type | Purpose |
|-------|------|---------|
| post_id | Text | Platform-specific post ID |
| platform | Select | LinkedIn / Twitter |
| author | Text | Who posted |
| author_tier | Select | High / Medium / Low |
| post_url | URL | Link to original post |
| post_preview | Long Text | First 280 chars of post |
| posted_at | DateTime | When they posted |
| engagement_type | Select | Comment / Like |
| suggested_comment | Long Text | AI-drafted comment |
| status | Select | Pending / Done / Skipped |
| engaged_at | DateTime | When James engaged |
| force | Link | Link to Forces if police contact |
| contact | Link | Link to HubSpot contact |
| session_date | Date | Which day's queue this belongs to |

### Priority_Accounts Table

| Field | Type | Purpose |
|-------|------|---------|
| name | Text | Person/org name |
| platform | Select | LinkedIn / Twitter / Both |
| profile_url | URL | Link to profile |
| tier | Select | High / Medium / Low |
| category | Select | Police Contact / Industry Influencer / Competitor / Other |
| force | Link | Link to Forces if applicable |
| contact | Link | Link to HubSpot contact |
| notes | Long Text | Why they matter |
| last_engaged | Date | When James last interacted |
| fetch_url | URL | RSS feed or profile URL for scraping |

---

## Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Daily completion | 5/5 posts | Social_Engagement status=Done per day |
| Weekly consistency | 80% | Days with 5/5 / work days |
| Streak | Track current | Consecutive days of full engagement |
| Monthly engagement | 100+ interactions | Total Done per month |

### Dashboard Metrics Display

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

---

## Acceptance Criteria

- [ ] Priority accounts list maintained in Airtable
- [ ] n8n workflow fetches posts from LinkedIn + Twitter daily
- [ ] AI scoring selects top 5 posts
- [ ] AI-suggested comments generated for top 3
- [ ] Dashboard shows daily engagement queue
- [ ] "Engagement Session" mode works (guided flow)
- [ ] "Copy & Open Post" opens post in new tab
- [ ] Streak tracking visible
- [ ] 80% consistency achievable in first month

---

## Future Enhancements (Out of Scope)

- Content calendar / post scheduling
- Engagement analytics (which comments drive profile views)
- Competitor monitoring via social
- Network growth suggestions
- Blog/content creation workflow

---

## References

- V1 UNIFIED-COMMAND-VISION.md (Social Engagement Subsystem section)
- Decision A11 (V1 vision reprioritisation)
- ADHD Interface Design skill (habit formation, streak tracking)

---

*This spec is a placeholder. Full implementation details to be added when Phase 2a is complete.*
