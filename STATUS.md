# MI Platform — Session Status

**Updated**: 20 January 2025 (PM)
**Phase**: 1c — Dashboard MVP
**Status**: Deployed, pending timing validation

### Session Work (20 Jan PM)
- ✅ Audited competitor signal pipeline (WF9 is self-contained)
- ✅ Fixed status inconsistency: competitor signals now `status: "relevant"` (was "new")
- ✅ Deleted duplicate "MI: Send Outreach" workflow (`M5d8dnDehvOBq65s`)
- ✅ Tested with real Bright Data exports — 10+ competitor signals created correctly
- ✅ Generated context brief for SPEC-007a (`specs/NEXT-CONTEXT.md`)
- ✅ **SPEC-007a COMPLETE** — All 6 stages implemented:
  - Stage 1 PARSE: 16 acceptance criteria extracted
  - Stage 2 AUDIT: All 6 schema fields verified
  - Stage 3 PLAN: 18-task build sequence
  - Stage 4 BUILD: 18 tasks across 6 phases completed
  - Stage 5 VERIFY: All 16 acceptance criteria passed
  - Stage 6 DOCUMENT: Project docs updated

---

## Current State

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: Core Pipeline | 95% | WF1-6 built, bugs fixed, pending 1-week burn-in |
| Phase 1b: Competitors | 100% | WF9 live, Bright Data connected |
| Phase 1c: Dashboard | 95% | Deployed, pending ≤15 min timing test |

**Live URL**: https://dashboard.peelplatforms.co.uk/review

---

## Next Action

> **Deploy dashboard updates** — Push SPEC-007a UI enhancements to production
>
> Dashboard now includes: Priority sorting (P1→P2→P3), Context Capsule, Signal Pattern Cards, Contact Confidence indicators

---

## Active Workflows

| Workflow | ID | Status |
|----------|-----|--------|
| WF1: Jobs Trigger | — | Active |
| WF2: Jobs Receiver | — | Active |
| WF3: Jobs Classifier | — | Active |
| WF4: Opportunity Creator | — | Active |
| WF5: Opportunity Enricher | — | Active |
| WF6: Send Outreach | `AeEDcJ5FD2YGCSV1` | Active |
| WF9: Competitor Receiver | `VLbSZp5cGp1OUQZy` | Active |

**Archived**: WF8 (`rt3K4H5NAco5VeI0`) — Bright Data handles scheduling
**Deleted**: Duplicate "MI: Send Outreach" (`M5d8dnDehvOBq65s`) — superseded by `AeEDcJ5FD2YGCSV1`

---

## Bright Data Collectors

| Competitor | Collector ID | Status |
|------------|-------------|--------|
| Investigo | `c_mkeaif24wc2xinpo6` | Live |
| Red Snapper | `c_mke54t691ndre24s37` | Live |

Webhook: `https://n8n.srv1190997.hstgr.cloud/webhook/competitor-receiver`

---

## Spec Status

| Spec | Status |
|------|--------|
| SPEC-001: Airtable Schema | Complete |
| SPEC-002: Jobs Ingestion | Built |
| SPEC-003: Signal Classification | Built |
| SPEC-004: Opportunity Creator | Built |
| SPEC-005: Opportunity Enricher | Built |
| SPEC-007b: Dashboard MVP | Deployed |
| SPEC-1b: Competitor Monitoring | Complete |
| SPEC-007a: Full UI | ✅ Complete — pending deploy |
| SPEC-008: Morning Brief | Deferred |

---

## Blockers

None.

---

## Schema Status

**4 tables**: Forces (48), Signals, Opportunities, Contacts

Dashboard field mapping (SPEC-007b → Airtable):
- `draft_subject` → `subject_line`
- `draft_body` → `outreach_draft`
- `actioned_at` → `sent_at`
- `skip_reason` → `skipped_reason`

---

## Session History

See `docs/archive/status-2025-01.md` for January work details.

---

*Last aligned with ANCHOR.md: 20 January 2025*
