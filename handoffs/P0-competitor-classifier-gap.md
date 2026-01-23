# Handoff: P0 Fix — Competitor Signals Must Trigger Classifier

**Priority**: ⚡ URGENT — Do this immediately  
**Effort**: 10-15 minutes  
**Spec**: SPEC-010 Fix 0

---

## Problem

Competitor signals (172 of them) are being created but **never classified**. They bypass WF3 entirely because they're not created with `status=new`.

**Evidence**:
- 92.4% of competitor signals have no force link
- Competitor signals have empty classification fields: `ai_confidence`, `role_type`, `seniority` all blank
- Indeed signals have these fields populated (95%+ have values)

**Root cause**: WF2 (Competitor Receiver) creates signals without setting `status=new`, so WF3 (Jobs Classifier) never picks them up.

---

## Current Flow (Broken)

```
Competitor job received
      ↓
WF2: MI: Competitor Receiver
      ↓
Signal created (status = ??? or "relevant")  ← PROBLEM: status not "new"
      ↓
END (WF3 never sees it)
```

---

## Required Flow (Fixed)

```
Competitor job received
      ↓
WF2: MI: Competitor Receiver
      ↓
Signal created (status = "new")  ← FIX: explicitly set status="new"
      ↓
WF3: MI: Jobs Classifier (runs every 15 min)
      ↓
Picks up signal with status="new"
      ↓
Classifies, sets force, role_type, seniority
      ↓
Updates status to "relevant" or "irrelevant"
```

---

## Fix Required

### Step 1: Find the Create Signal node in WF2

Open n8n workflow: **MI: Competitor Receiver**

Find the node that creates records in the Signals table (likely called "Create Signal" or "Airtable Create").

### Step 2: Ensure status is set to "new"

In the fields being written to Airtable, ensure this field is present:

```json
{
  "type": "competitor_job",
  "source": "{{ competitor_name }}",  // red_snapper, investigo, etc.
  "title": "{{ job.title }}",
  "url": "{{ job.url }}",
  "external_id": "{{ hash }}",
  "raw_data": "{{ JSON.stringify(job) }}",
  "detected_at": "{{ $now.toISOString() }}",
  "status": "new"   // ← THIS IS THE CRITICAL FIX
}
```

**The fix is adding/correcting**: `"status": "new"`

### Step 3: Verify WF3 doesn't filter by source

Open n8n workflow: **MI: Jobs Classifier**

Check the Airtable Search/Fetch node. The filter should be:

```
filterByFormula: {status} = "new"
```

It should **NOT** include a source filter like `{source} = "indeed"`.

If there's a source filter, remove it so both `indeed` and competitor signals get classified.

### Step 4: Test

1. **Create a test signal manually** in Airtable:
   - type: `competitor_job`
   - source: `red_snapper`
   - title: `Test Investigator`
   - status: `new`
   - Leave classification fields blank

2. **Trigger WF3** manually (or wait for 15-min schedule)

3. **Verify** the signal now has:
   - `ai_confidence`: populated (0-100)
   - `role_type`: populated
   - `seniority`: populated
   - `status`: changed to `relevant` or `irrelevant`

---

## Acceptance Criteria

- [ ] New competitor signals created with `status=new`
- [ ] WF3 processes competitor signals on next run
- [ ] Competitor signals get classification fields populated
- [ ] No changes needed to WF3 filter (or filter fixed if it was blocking competitors)

---

## What NOT to Change

- Don't touch the classification prompt yet (that's Fix 1, separate step)
- Don't change how signals are stored in raw_data
- Don't modify WF1 (Indeed Ingestion) — it's working

---

## After This Fix

Once competitor signals flow through WF3:
1. Existing backlog (172 signals) will need backfill script (Fix 4)
2. New competitor signals will be classified going forward
3. We can then upgrade the prompt for better force inference (Fix 1)

---

## STATUS.md Update

After completing, add to STATUS.md:

```markdown
### Pipeline Remediation (SPEC-010)
- [x] Fix 0: Competitor→Classifier gap fixed — competitor signals now created with status=new
- [ ] Fix 1: Upgrade classification prompt (in progress)
- [ ] Fix 2-6: Pending
```
