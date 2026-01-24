---
description: Verify Airtable records exist with correct values (MANDATORY after any write operation)
---

# Verify Airtable Records

## Purpose

**TRUST BUT VERIFY**: After ANY Airtable create/update operation, you MUST use this command to confirm records were actually written with the correct values.

This is MANDATORY because:
- Airtable API can return HTTP 200 success when operations silently fail
- Linked record updates fail silently when foreign table has formula primary field
- Rate limiting can cause silent failures
- Previous sessions have marked Stage 5 "Complete" when data was never written

## Quick Usage

### After Creating a Record

```bash
node scripts/verify-airtable-operation.cjs \
  --table=Signals \
  --record=recXXXXX \
  --fields="status:new,source:indeed,role_category:investigation"
```

### After Running a Workflow

```bash
node scripts/verify-airtable-operation.cjs \
  --table=Signals \
  --filter="{status}='classified'" \
  --expected-count=5
```

### After Bulk Operations

```bash
node scripts/verify-airtable-operation.cjs \
  --table=Opportunities \
  --after="2026-01-24T10:00:00Z" \
  --expected-count=3
```

## Full Options

| Option | Description | Example |
|--------|-------------|---------|
| `--table` | Table name | `Signals`, `Opportunities`, `Contacts` |
| `--record` | Specific record ID | `recABC123xyz` |
| `--field` | Single field to check | `status` |
| `--expected` | Expected value for single field | `classified` |
| `--fields` | Multiple fields as "field:value,..." | `"status:new,source:indeed"` |
| `--filter` | Airtable filterByFormula | `"{status}='new'"` |
| `--expected-count` | Expected number of records | `5` |
| `--after` | ISO timestamp for records created after | `"2026-01-24T10:00:00Z"` |
| `--wait` | Milliseconds to wait (default: 500) | `1000` |
| `--json` | Output as JSON for parsing | (flag only) |

## When to Use

### ALWAYS Use After:
- Creating new records via MCP or script
- Running n8n workflows that write to Airtable
- Batch update operations
- Upserting records
- Claiming a workflow "succeeded"

### Example Verification Evidence

When documenting Stage 5 verification, include the actual output:

```markdown
## Read-Back Verification

Command:
\`\`\`bash
node scripts/verify-airtable-operation.cjs \
  --table=Signals \
  --record=rec123abc \
  --fields="status:classified,role_category:investigation,force_source:matched"
\`\`\`

Output:
\`\`\`
✅ PASS | record_exists
     Record ID: rec123abc

✅ PASS | field_value
     Field: status
     Expected: "classified"
     Actual: "classified"

✅ PASS | field_value
     Field: role_category
     Expected: "investigation"
     Actual: "investigation"

✅ PASS | field_value
     Field: force_source
     Expected: "matched"
     Actual: "matched"

SUMMARY: 4/4 checks passed
✅ VERIFICATION PASSED - Safe to proceed
\`\`\`
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All verifications passed |
| 1 | One or more verifications failed |

**If exit code is 1, DO NOT mark Stage 5 complete.**

## Common Failures

| Symptom | Likely Cause | Action |
|---------|--------------|--------|
| Record not found | Write failed silently | Check API response, retry operation |
| Field empty | Formula field can't be written | Use different field, check field type |
| Wrong value | Type mismatch or case sensitivity | Check data types, normalize values |
| Count mismatch | Partial write or rate limiting | Add delays, reduce batch size |

## Integration with Implementation Stages

During Stage 5 (Verify):

1. Run the workflow
2. Note the record IDs from the execution output
3. **IMMEDIATELY** run this verification command
4. Include the output in your verification evidence
5. Only mark Stage 5 complete if ALL checks pass

**⚠️ NEVER claim success without running this verification.**
