# MI Platform Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SIGNAL SOURCES                                 │
├────────────┬────────────┬────────────┬────────────┬────────────────────┤
│   Indeed   │ Competitor │  Tenders   │  HMICFRS   │   Google News      │
│    Jobs    │   Sites    │   (FTS)    │  Reports   │                    │
└─────┬──────┴─────┬──────┴─────┬──────┴─────┬──────┴─────────┬──────────┘
      │            │            │            │                │
      └────────────┴────────────┴────────────┴────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │      n8n INGEST       │
                    │    (Bright Data +     │
                    │     scheduled jobs)   │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │   AIRTABLE: Signals   │
                    │    (raw intelligence) │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │   n8n CLASSIFICATION  │
                    │  (Claude API triage)  │
                    └───────────┬───────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
        ┌──────────┐     ┌──────────┐     ┌──────────┐
        │  Archive │     │  Manual  │     │  Create  │
        │  (noise) │     │  Review  │     │   Opp    │
        └──────────┘     └──────────┘     └────┬─────┘
                                               │
                              ┌────────────────▼────────────────┐
                              │   AIRTABLE: Opportunities       │
                              │   (actionable leads)            │
                              └────────────────┬────────────────┘
                                               │
                              ┌────────────────▼────────────────┐
                              │   n8n ENRICHMENT                │
                              │   • Contact research            │
                              │   • Message drafting            │
                              │   • Priority scoring            │
                              └────────────────┬────────────────┘
                                               │
                              ┌────────────────▼────────────────┐
                              │       MONDAY DASHBOARD          │
                              │   "5 leads ready to send"       │
                              └────────────────┬────────────────┘
                                               │
                                        [James Reviews]
                                               │
                              ┌────────────────▼────────────────┐
                              │         HUBSPOT SYNC            │
                              │   (activities, contacts)        │
                              └─────────────────────────────────┘
```

## Data Flow Summary

1. **Ingest** (scheduled) → Raw signals into Airtable
2. **Classify** (triggered) → AI determines relevance
3. **Create Opportunity** (triggered) → For high-relevance signals
4. **Enrich** (triggered) → Contact research + message drafting
5. **Review** (Monday) → James approves and sends
6. **Sync** (real-time) → HubSpot tracks activities

## Phase Breakdown

See [ROADMAP.md](../ROADMAP.md) for current phases and acceptance criteria.

## Full Strategy Documentation

The complete strategy specifications are stored as **Claude Chat Project Knowledge files**:
- `peel-solutions-mi-platform-strategy.md` — Full platform strategy
- `mi-platform-monitoring-and-agents.md` — Monitoring + agentic design
- `mi-platform-agentic-deep-dive.md` — n8n AI agent implementation

These are uploaded to Claude Chat (desktop app) and provide strategic context for architecture decisions. They are not stored in this repository.
