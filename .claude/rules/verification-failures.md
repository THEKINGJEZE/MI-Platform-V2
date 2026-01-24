# When Verification Fails

## Purpose

This document defines what to do when the read-back verification script (`verify-airtable-operation.cjs`) returns failures. Verification failures are NOT bugs to be ignored — they indicate the workflow did NOT work as expected.

---

## Immediate Actions

When verification fails (exit code 1):

### 1. DO NOT Mark Stage 5 Complete

Stage 5 cannot be marked complete if ANY verification check fails. This is non-negotiable.

### 2. Document the Failure

```markdown
## Verification Failure

**Command run:**
node scripts/verify-airtable-operation.cjs --table=Signals --record=recXXX --fields="status:classified"

**Output:**
❌ FAIL | field_value
     Field: status
     Expected: "classified"
     Actual: "new"

SUMMARY: 0/1 checks passed
⚠️ VERIFICATION FAILED - DO NOT MARK AS COMPLETE

**Possible causes:**
- [List hypotheses]

**Next steps:**
- [Debugging actions to take]
```

### 3. Investigate Before Retry

Do NOT just re-run the workflow. First understand WHY it failed.

---

## Debugging Steps

### Step 1: Check Airtable UI Directly

Open the Airtable base in a browser and manually check:
- Does the record exist?
- What are the actual field values?
- Are there any error notes or system fields?

**If record doesn't exist in UI**: The write failed completely. Check API response logs.

**If record exists but values wrong**: The write succeeded but with incorrect data. Check workflow logic.

### Step 2: Check n8n Execution Log

```bash
# Get recent executions
mcp__n8n-mcp__n8n_executions workflowId=<id> limit=5
```

Look for:
- Execution status (success vs error)
- Any warning messages
- Timeout indicators
- Partial completion notes

### Step 3: Check for Rate Limiting

If multiple records failed but some succeeded:
- Airtable rate limit is 5 requests/second/base
- Look for 429 errors in logs
- Add delays between batch operations

### Step 4: Check Field Types

Common silent failures:
- Writing text to a number field
- Writing name instead of record ID to linked field
- Writing to a formula/computed field (impossible)
- Case mismatch on single-select values

---

## Common Causes and Fixes

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Record not found | Write failed silently | Check API response for error field; retry with logging |
| Field empty | Formula field can't be written | Use a different field that allows writes |
| Wrong linked record | Used name instead of record ID | Always use `recXXX` format for linked records |
| Partial records | Rate limited | Add 200ms delays; reduce batch size to 10 |
| Field value "null" | Missing data in source | Add null checks before write |
| Unexpected string | Type coercion | Enable `typecast: true` in Airtable node |
| All records show same value | Loop variable not updating | Check Code node variable scope |

---

## When to Escalate

Escalate to human review if:

1. **Repeated failures with same cause**: Pattern suggests systemic issue
2. **Data corruption detected**: Records have inconsistent state
3. **Rate limiting persistent**: Need to rearchitect batch approach
4. **Unknown failure mode**: Can't determine root cause

**Escalation format:**
```markdown
## Escalation Required

**Issue**: [Brief description]
**Attempts**: [What was tried]
**Evidence**: [Logs, screenshots, script output]
**Hypothesis**: [Best guess at cause]
**Recommendation**: [What you think should be done]
```

---

## Recovery Procedures

### After Fixing the Issue

1. Re-run the workflow
2. Run verification script again
3. Include BOTH the failed and successful outputs in documentation
4. Only then mark Stage 5 complete

### If Data is Corrupted

1. Document which records are affected
2. Create cleanup script or manual fix plan
3. Execute cleanup
4. Verify cleanup with script
5. Re-run workflow
6. Verify final state

### If Rollback Required

1. Deactivate the broken workflow
2. Import backup workflow from `n8n/workflows/backup/`
3. Activate backup workflow
4. Verify backup works with test data
5. Document rollback in IMPL tracker

---

## Verification Checklist

Before marking ANY workflow implementation complete:

- [ ] Ran `verify-airtable-operation.cjs` with appropriate flags
- [ ] Script output shows "VERIFICATION PASSED"
- [ ] All expected records exist
- [ ] All expected field values match
- [ ] Script output is included in IMPL tracker
- [ ] No ⏳ (pending) items left without documented follow-up

---

## Key Principle

> **A passing workflow execution is NOT proof of success.**
>
> Only a passing verification script confirms data was written correctly.
>
> If verification fails, the workflow failed — regardless of what the execution status said.
