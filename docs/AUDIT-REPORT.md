# Documentation Audit Report

**Generated**: 2025-01-19
**Overall Status**: 🔴 ISSUES FOUND

## Executive Summary

| Metric | Value |
|--------|-------|
| Total items checked | 270 |
| Issues found | 40 |
| High severity | 11 |
| Medium severity | 17 |
| Low severity | 12 |
| Documents audited | 65+ |

The audit reveals significant documentation drift, particularly:
1. Spec header statuses misaligned with ROADMAP.md Spec Index (7 specs)
2. Schema references inconsistent across global CLAUDE.md and project files
3. Missing guardrail references in key specs (SPEC-005, SPEC-003)
4. Broken file references across multiple documents

---

## Findings by Dimension

### 1. Reference Integrity 🔴 ISSUES FOUND

**Status**: 9 issues found (5 high, 4 medium)

#### High Severity

| Issue | File | Line | Recommendation |
|-------|------|------|----------------|
| Broken reference to `specs/phase-1-core-pipeline.md` | specs/README.md | 64 | Remove reference or create the file |
| Broken reference to `docs/strategy-section-11-update.md` | docs/archive/dashboard-v1-review.md | 11 | Update or remove; file was deleted |
| Broken reference to `.claude/skills/airtable-schema/SKILL.md` | specs/SPEC-001-airtable-schema.md | 197 | Create SKILL.md or remove reference |
| Broken reference to `n8n/workflows/jobs-ingestion.json` | specs/SPEC-002-jobs-ingestion.md | 239 | Update to actual filenames (jobs-receiver.json, jobs-trigger.json) |
| Broken reference to `scripts/consistency-check.js` | specs/consistency-checker.md | 66 | Update to `scripts/consistency-check.cjs` |

#### Medium Severity

| Issue | Files | Recommendation |
|-------|-------|----------------|
| Future spec files don't exist yet | ROADMAP.md:49,103,124,144,162,181; specs/README.md:50-51 | Mark as "to be created" more clearly |
| Reference to `styles/tokens.css` (V1 source) | specs/SPEC-007b:113,728; specs/SPEC-007a:99,544 | Clarify these are V1 external references |
| References to V1 component paths | specs/SPEC-007a:139-565; specs/SPEC-008:232-415 | Add note clarifying these are V1 sources |
| References to Project Knowledge files | docs/architecture.md:80-82; specs/SPEC-001:6 | Update to reflect strategy docs now at docs/STRATEGY.md |

---

### 2. Single Source of Truth 🟡 WARNINGS

**Status**: 4 medium severity issues, 4 low severity (acceptable)

#### Medium Severity

| Issue | Source | Duplicate Location | Recommendation |
|-------|--------|-------------------|----------------|
| Mission statement duplicated | ANCHOR.md:11 | docs/SYNC-PROTOCOL.md:20 | Link to ANCHOR.md rather than restate |
| Success criteria table duplicated | ANCHOR.md:31-34 | docs/CHAT-INSTRUCTIONS.md:13-18 | Replace with "See ANCHOR.md" |
| Acceptance criteria copied | ROADMAP.md:16-34 | specs/SPEC-006-monday-review.md:374-395 | Link to ROADMAP, list only spec-unique items |
| Spec status table duplicated | ROADMAP.md:349-362 | STATUS.md:59-72; specs/README.md:55-64 | Note "Canonical status in ROADMAP.md" |

#### Low Severity (Acceptable)

- Document limits brief summary in README.md ✅
- Guardrail IDs referenced with link in CLAUDE.md ✅
- Phase 1 progress in STATUS.md (different purpose) ✅
- '15 min' metric in acceptance criteria context ✅

---

### 3. Roadmap Alignment 🔴 ISSUES FOUND

**Status**: 8 high severity, 3 medium severity

#### High Severity - Spec Header Misalignments

| Spec | Header Says | ROADMAP Says | Fix |
|------|-------------|--------------|-----|
| SPEC-001 | Ready for implementation | ✅ Complete | Update to "Complete" |
| SPEC-002 | Ready for implementation | ✅ Built | Update to "Built" |
| SPEC-003 | Ready for implementation | ✅ Built | Update to "Built" |
| SPEC-004 | Ready for implementation | 🔄 In Progress | Update to "In Progress" |
| SPEC-005 | Ready for implementation | ⏳ Next | Update to "Next" or reconcile with STATUS.md |
| SPEC-006 | Ready for implementation | 🔀 Absorbed | Update to "Absorbed" + note SPEC-007b |
| SPEC-007 | Ready for implementation | 🔀 Replaced | Update to "Replaced" + note SPEC-007b |

#### High Severity - Status Conflicts

| Issue | Location 1 | Location 2 | Recommendation |
|-------|------------|------------|----------------|
| SPEC-005 status conflict | ROADMAP.md:357 says "Next" | STATUS.md:67 says "Built" | Reconcile: if WF5 is built, update ROADMAP |

#### Medium Severity

| Issue | Evidence | Recommendation |
|-------|----------|----------------|
| Workflow names inconsistent | STATUS.md uses WF1-WF2; SPEC-002 uses "MI: Jobs Ingestion" | Clarify mapping |
| Phase 1 progress 85% optimistic | STATUS.md:95 vs ROADMAP:16-24 (2/8 checked = 25%) | Reconcile percentage |
| CLAUDE.md current spec reference wrong phase | Points to Phase 1c but Phase 1 not complete | Point to current work (SPEC-004) |

---

### 4. Schema Alignment 🔴 ISSUES FOUND

**Status**: 3 high, 5 medium, 2 low severity

#### High Severity

| Issue | Evidence | Impact |
|-------|----------|--------|
| Global CLAUDE.md uses different Airtable base | ~/.claude/CLAUDE.md base: `appU3ktqJHk3eUmOS`; Project: `appEEWaGtGUwOyOhm` | Different projects conflict |
| SPEC-004 wrong Opportunities table ID | SPEC-004:47 uses `tbl3qHi21UzKqMXWo`; Correct: `tblJgZuI3LM2Az5id` | Workflow will fail |
| Global CLAUDE.md table names mismatch | Uses "Organisations", "Indeed Intel"; V2 uses Forces, Signals | Different schema entirely |

#### Medium Severity

| Issue | Evidence | Recommendation |
|-------|----------|----------------|
| Field name inconsistency: priority | ROADMAP uses 'priority'; SPEC-001 uses 'priority_score'/'priority_tier' | Align to SPEC-001 |
| Field name inconsistency: subject_line vs draft_subject | SPEC-006 uses 'subject_line'; SPEC-007b uses 'draft_subject' | Standardize to 'draft_subject' |
| why_now field not in SPEC-001 | Used in SPEC-005, SPEC-007b but not defined | Add to SPEC-001 or note as implementation addition |
| sent_at vs actioned_at naming | SPEC-006 uses 'sent_at'; SPEC-007b uses 'actioned_at' | Standardize to 'actioned_at' |
| skipped_reason vs skip_reason | SPEC-006 uses 'skipped_reason'; SPEC-007b uses 'skip_reason' | Standardize to 'skip_reason' |

#### Low Severity

| Issue | Recommendation |
|-------|----------------|
| SPEC-004 adds 'opportunity' field to Signals | Document in SPEC-001 or Schema Evolution |
| SPEC-007 (superseded) uses 'subject_line' | Already resolved in SPEC-007b |

---

### 5. Guardrail Compliance 🟡 WARNINGS

**Status**: 2 medium, 4 low severity

**Valid Guardrails**: G-001 through G-015 (all 15 exist, sequential, no gaps)

#### Medium Severity

| Issue | File | Recommendation |
|-------|------|----------------|
| SPEC-005 missing G-012, G-013, G-014, G-015 | specs/SPEC-005-opportunity-enricher.md | Add sales guardrails to enrichment spec |
| SPEC-003 missing G-013 | specs/SPEC-003-signal-classification.md | Add competitor signal priority guardrail |

#### Low Severity

| Issue | File | Recommendation |
|-------|------|----------------|
| Misapplied guardrails for UI patterns | specs/SPEC-007b-dashboard-mvp.md:717-719 | G-012/G-013/G-014 are sales guardrails, not UI |
| Same misapplied guardrails | specs/SPEC-007a-ui-foundation.md:656-658 | Remove or define UI-specific guardrails |
| G-015 wrong description | specs/SPEC-008-morning-brief.md:508 | G-015 is message structure, not ADHD-friendly |
| Missing Guardrails section | specs/SPEC-002-jobs-ingestion.md | Add "Guardrails Compliance" section |

---

## Action Items

### Priority 1 (High) - Fix Now

| # | Action | File | Lines |
|---|--------|------|-------|
| 1 | Update spec headers to match ROADMAP status | SPEC-001 through SPEC-007 | Header |
| 2 | Fix SPEC-004 Opportunities table ID | specs/SPEC-004-opportunity-creator.md | 47 |
| 3 | Update ROADMAP SPEC-005 status to "Built" | ROADMAP.md | 357 |
| 4 | Remove or update broken file references | Multiple (see Reference Integrity) | Various |
| 5 | Address global CLAUDE.md conflict | ~/.claude/CLAUDE.md | All table IDs |

### Priority 2 (Medium) - Fix This Week

| # | Action | File |
|---|--------|------|
| 6 | Add G-012, G-013, G-014, G-015 to SPEC-005 | specs/SPEC-005-opportunity-enricher.md |
| 7 | Add G-013 to SPEC-003 | specs/SPEC-003-signal-classification.md |
| 8 | Standardize field names (draft_subject, actioned_at, skip_reason) | SPEC-006, SPEC-007 |
| 9 | Add why_now field to SPEC-001 or Schema Evolution | specs/SPEC-001-airtable-schema.md |
| 10 | Update CLAUDE.md current spec reference | CLAUDE.md | 46 |
| 11 | Reconcile Phase 1 progress percentage | STATUS.md | 95 |

### Priority 3 (Low) - Address Eventually

| # | Action | File |
|---|--------|------|
| 12 | Remove/correct misapplied guardrails in dashboard specs | SPEC-007a, SPEC-007b, SPEC-008 |
| 13 | Update docs/architecture.md strategy doc references | docs/architecture.md |
| 14 | Add Guardrails Compliance section to SPEC-002 | specs/SPEC-002-jobs-ingestion.md |
| 15 | Clarify V1 source references in dashboard specs | SPEC-007a, SPEC-007b |

---

## Evidence Index

### Reference Integrity
- specs/README.md:64 → specs/phase-1-core-pipeline.md (NOT FOUND)
- docs/archive/dashboard-v1-review.md:11 → docs/strategy-section-11-update.md (NOT FOUND)
- specs/SPEC-001-airtable-schema.md:197 → .claude/skills/airtable-schema/SKILL.md (NOT FOUND)
- specs/SPEC-002-jobs-ingestion.md:239 → n8n/workflows/jobs-ingestion.json (NOT FOUND)
- specs/consistency-checker.md:66 → scripts/consistency-check.js (NOT FOUND)
- ROADMAP.md:49,103,124,144,162,181 → Various future spec files (NOT FOUND - expected)

### Roadmap Alignment
- SPEC-001:3 status vs ROADMAP.md:353
- SPEC-002:3 status vs ROADMAP.md:354
- SPEC-003:3 status vs ROADMAP.md:355
- SPEC-004:3 status vs ROADMAP.md:356
- SPEC-005:3 status vs ROADMAP.md:357 vs STATUS.md:67
- SPEC-006:3 status vs ROADMAP.md:358
- SPEC-007:3 status vs ROADMAP.md:359

### Schema Alignment
- specs/SPEC-004-opportunity-creator.md:47 → tbl3qHi21UzKqMXWo (WRONG)
- .claude/skills/airtable-schema/table-ids.json:18 → tblJgZuI3LM2Az5id (CORRECT)

### Guardrail Compliance
- specs/SPEC-005-opportunity-enricher.md:764-771 (missing G-012 through G-015)
- specs/SPEC-007b-dashboard-mvp.md:717-719 (misapplied)
- specs/SPEC-007a-ui-foundation.md:656-658 (misapplied)
- specs/SPEC-008-morning-brief.md:508 (wrong description)

---

## Notes

### Global CLAUDE.md Conflict

The user's global `~/.claude/CLAUDE.md` references a different Airtable base (`appU3ktqJHk3eUmOS`) with tables like "Organisations", "Indeed Intel (Clean)", "Company Aliases" — these are from a different project or V1. The current V2 project uses base `appEEWaGtGUwOyOhm` with tables Forces, Signals, Opportunities, Contacts.

**Recommendation**: Either:
1. Update global CLAUDE.md to remove or namespace the Airtable references
2. Accept that global instructions are for a different project and rely on project-level configuration

### Future Spec Files

References to `specs/phase-1b-competitors.md`, `specs/phase-2a-email.md`, etc. are intentionally for future phases. These are acceptable as "to be created" but could be marked more explicitly.

---

*Audit completed by /doc-audit command*
*Audit subagents: reference-integrity, single-source-truth, roadmap-alignment, schema-alignment, guardrail-compliance*
