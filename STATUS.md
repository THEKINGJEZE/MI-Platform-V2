# MI Platform — Session Status

**Updated**: 26 January 2026
**Phase**: 1d + 2a (Parallel)
**Status**: Phase 2a-8 complete — Contact Auto-Creator deployed ✅

---

## Current State

| Component | Status | Notes |
|-----------|--------|-------|
| Dashboard | ✅ Live | https://dashboard.peelplatforms.co.uk/review |
| WF3 (Classification) | ✅ Updated | v2.1 prompt deployed |
| WF5 (Agent Enrichment) | ✅ v2.2 Live | Hybrid HubSpot + GPT-4.1-mini |
| WF9 (Competitor Receiver) | ✅ Fixed | status=new |
| Email Classifier | ✅ Live | MI: Email Classifier (V2) |
| Decay Scanner | ✅ Tested | WF4 ID: j7pvULBq70hKD47j — 15 alerts generated |
| Contact Auto-Creator | ✅ Active | ID: YqLYjvJea9zeIy8l — Runs every 10 min |
| Email Executor | ✅ Fixed | ID: PWy1PYwJ24Me0LV7 — Now fetches email_id for archive |
| Email Status Poller | ✅ Fixed | ID: hNc60oB6UvOG5cZv — Bug fixed, reactivated |
| Data Quality | ⏳ Monitoring | Target: >70/100 health score |
| Remote MCP Servers | ✅ Live | n8n + Airtable on VPS:3001/3002 |

---

## Active Monitoring (Ends 30 Jan 2026)

### Phase 1d: Jobs Pipeline Quality
- [ ] 7 days of data collected
- [ ] Classification accuracy >70%
- [ ] Competitor signals correctly flagged P1

### Phase 2a-6: Email Pipeline Quality
- [ ] Classification accuracy >80%
- [ ] Contact match rate >80%
- [ ] Draft quality acceptable

**Daily check (5 min)**: Spot-check 5 classifications + 2 drafts in Airtable.

---

## Next Actions

1. ~~**Create API tokens**~~ ✅ Done
2. ~~**Deploy n8n executor**~~ ✅ Done — ID: `PWy1PYwJ24Me0LV7`
3. ~~**Configure Make.com webhooks**~~ ✅ Found — Existing scenarios 8260100, 8260117
4. ~~**Set n8n env vars**~~ ✅ Done — Added to `/docker/n8n/.env` and `docker-compose.yml`, container restarted
5. ~~**Test end-to-end flow**~~ ✅ Done — Clawdbot→Airtable→n8n working
6. ~~**Fix n8n archive action**~~ ✅ Done — Now sends `email_id` (Make.com scenario issue separate)
7. ~~**Document Airtable Automation setup**~~ ✅ Done — `docs/AIRTABLE-AUTOMATION-SETUP.md`
8. ~~**Document Clawdbot cron setup**~~ ✅ Done — `docs/CLAWDBOT-CRON-SETUP.md`
9. ~~**Configure Airtable Automation**~~ ✅ Replaced — n8n Email Status Poller (ID: `hNc60oB6UvOG5cZv`)
10. ~~**Activate Email Status Poller**~~ ✅ Done — Activated via n8n MCP
11. **Configure Clawdbot cron** — Manual setup on Mac Mini (see docs)
12. ~~**Make.com archive scenario**~~ ✅ Verified working — 404s expected when emails moved/deleted
13. **Daily email quality check** — 5 min spot-check per monitoring protocol

---

## Key Decisions (Active)

| Decision | Reference |
|----------|-----------|
| HubSpot as primary data source for engagement | DECISIONS.md I1 |
| Two-tier decay: Deal-level (8/15/30d) + Org-level (30/60/90d) | SPEC-012 §6 |
| Hook-enforced spec creation (hard block) | DECISIONS.md A13 |
| Hook enforcement expansion (warnings for workflow/schema/prompt/phase) | DECISIONS.md A14 |
| **Clawdbot replaces n8n AI for email processing** | DECISIONS.md I5, SPEC-014 |

---

## Blockers

- **Calendar webhooks**: Microsoft connection (ID: 6957096) needs `Calendars.Read` + `Calendars.ReadWrite` scopes — requires admin reauthorization in Make.com

---

## Completed This Session

- ✅ Created `make-curl` wrapper for domain-restricted Make.com webhooks
- ✅ Configured Clawdbot exec allowlist for auto-approval of Make.com calls
- ✅ Standardized Make.com scenario naming (all now "Agent Tool – X" format)
- ✅ Fixed incorrect scenario IDs in documentation (List: 8271886, Delete: 8271894, Availability: 8271181)
- ✅ Updated `~/ClawdbotFiles/.env.makecom` with correct names/IDs
- ✅ Updated Clawdbot skills: `outlook-email/SKILL.md`, `outlook-calendar/SKILL.md`
- ✅ Debugged calendar webhook timeout — root cause: Microsoft connection missing Calendar OAuth scopes
- ⏳ Calendar permissions deferred (requires admin authority)

---

## Completed Work (Archived)

See `docs/archive/status-2026-01.md` for:
- Clawdbot Make.com auto-approval setup (26 Jan)
- SPEC-014 implementation and verification (26 Jan)
- n8n Email Status Poller setup (26 Jan)
- Phase 2a Email Integration details
- Branch consolidation summary

---

*Last aligned with ANCHOR.md: 26 January 2026*
