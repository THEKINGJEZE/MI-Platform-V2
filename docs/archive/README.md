# Archive Directory

## Purpose

Storage for rotated documents that are no longer actively needed but should be preserved for reference.

## What Goes Here

| Document Type | Naming Pattern | When to Archive |
|---------------|----------------|-----------------|
| STATUS.md history | `status-YYYY-MM.md` | Monthly rotation |
| DECISIONS.md overflow | `decisions-YYYY-MM.md` | When >20 active decisions |
| Completed phase specs | Keep in `/specs/` | Don't archive specs |
| Historical reviews | `*-review.md` | After review is actioned |

## Archive Process

See [DOCUMENT-HYGIENE.md](../DOCUMENT-HYGIENE.md) for the full archival protocol.

**Quick summary**:
1. Copy content to archive file with appropriate name
2. Remove from active document
3. Update any references to point to archive location

## Current Contents

- `dashboard-v1-review.md` — Review of V1 dashboard before V2 rebuild

## Notes

- Git is the true history — archives are for context, not permanent record
- Don't archive everything — only what Claude might need to reference later
- Specs don't get archived — they stay in `/specs/` as reference
