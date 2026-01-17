# SPEC-004: Opportunity Creator

**Status**: Ready for implementation  
**Phase**: 1 — Core Jobs Pipeline  
**Source of Truth**: `peel-solutions-mi-platform-strategy.md` Section 7 (Stage 3: GROUP), Section 10 (Workflow 3.1)

---

## 1. Overview

**Goal**: Group relevant signals into Opportunity records, one per police force.

**Expected Outcome**: When signals are classified as `status = relevant`, they are linked to an existing Opportunity for that force, or a new Opportunity is created. Signals without a matched force are skipped (logged but not processed). This sets up opportunities for enrichment in SPEC-005.

---

## 2. Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Signals    │────▶│    Check     │────▶│   Create or  │
│   (relevant, │     │   Force      │     │   Link to    │
│   unlinked)  │     │   Exists     │     │  Opportunity │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                     ┌──────────────┐     ┌──────▼───────┐
                     │   Trigger    │◀────│   Update     │
                     │   Enrichment │     │   Signal     │
                     │   (SPEC-005) │     │   Link       │
                     └──────────────┘     └──────────────┘
```

**Data Flow**:
1. Workflow fetches signals with `status = relevant` and no opportunity linked
2. Skip signals where `force` is null (log warning)
3. For each force: find or create opportunity **(G-011: upsert pattern)**
4. Link signal to opportunity
5. Update signal to mark as processed
6. Trigger enrichment workflow (SPEC-005 placeholder)

---

## 3. Tables

**Reads from**: 
- `Signals` table (`tblez9trodMzKKqXq`) — relevant signals needing grouping
- `Opportunities` table (`tbl3qHi21UzKqMXWo`) — check for existing opportunities

**Writes to**:
- `Opportunities` table — create new or update existing
- `Signals` table — link to opportunity

**Opportunity creation fields**:

| Airtable Field | Value | Notes |
|----------------|-------|-------|
| `force` | Link to force record | From signal.force |
| `status` | `researching` | Initial status per strategy doc |
| `created_at` | Current timestamp | When opportunity created |
| `signals` | Link to signal(s) | Linked record field |

**Signal update fields**:

| Airtable Field | Value | Notes |
|----------------|-------|-------|
| `opportunity` | Link to opportunity record | New field (add if not exists) |

**Opportunity status values** (from strategy doc Section 6):
- `researching` — initial, needs enrichment
- `ready` — enriched, ready for review
- `sent` — outreach sent
- `replied` — got response
- `meeting` — meeting scheduled
- `proposal` — proposal sent
- `won` — deal won
- `lost` — deal lost
- `dormant` — inactive, may revisit

---

## 4. Workflows

### Workflow: `MI: Opportunity Creator`

**Trigger**: Schedule — every 15 minutes (aligned with classifier)

#### Node 1: Fetch Relevant Signals Without Opportunity

**Type**: Airtable Search  

```
Table: Signals
Filter: AND(
  {status} = "relevant",
  {opportunity} = BLANK()
)
Max Records: 50
Sort: detected_at ASC (oldest first)
```

If no records returned, exit workflow early (no signals to process).

#### Node 2: Filter Signals With Force

**Type**: Code  
**Guardrail**: Signals without force cannot create opportunities

```javascript
const withForce = [];
const withoutForce = [];

for (const item of $input.all()) {
  const signal = item.json;
  if (signal.force && signal.force.length > 0) {
    withForce.push(item);
  } else {
    withoutForce.push({
      signal_id: signal.id,
      title: signal.title,
      reason: 'No force linked - cannot create opportunity'
    });
  }
}

// Log skipped signals
if (withoutForce.length > 0) {
  console.log('Skipped signals (no force):', JSON.stringify(withoutForce));
}

return withForce;
```

#### Node 3: Group Signals by Force

**Type**: Code

```javascript
// Group signals by force ID
const signalsByForce = {};

for (const item of $input.all()) {
  const signal = item.json;
  // force is a linked record array - get the first ID
  const forceId = Array.isArray(signal.force) ? signal.force[0] : signal.force;
  
  if (!signalsByForce[forceId]) {
    signalsByForce[forceId] = [];
  }
  signalsByForce[forceId].push({
    signal_id: signal.id,
    signal_record_id: signal.id, // Airtable record ID
    title: signal.title,
    detected_at: signal.detected_at
  });
}

// Return one item per force with all its signals
return Object.entries(signalsByForce).map(([forceId, signals]) => ({
  json: {
    force_id: forceId,
    signals: signals,
    signal_count: signals.length
  }
}));
```

#### Node 4: Find Existing Opportunity for Force

**Type**: HTTP Request (Airtable API)  
**Guardrail**: G-011 (use upsert pattern, not delete-create)

For each force group, search for open opportunity:

```
GET https://api.airtable.com/v0/{{baseId}}/Opportunities
Headers:
  Authorization: Bearer {{$credentials.airtable}}
Query params:
  filterByFormula: AND(
    RECORD_ID({force}) = "{{force_id}}",
    NOT(OR(
      {status} = "won",
      {status} = "lost",
      {status} = "dormant"
    ))
  )
  maxRecords: 1
  sort[0][field]: created_at
  sort[0][direction]: desc
```

**Note**: Use HTTP Request node (not native Airtable node) for updates in loops per n8n bug workaround.

#### Node 5: Create or Update Opportunity

**Type**: Code + HTTP Request  
**Guardrail**: G-011 (upsert pattern)

```javascript
const forceGroup = $input.item.json;
const existingOpp = $node['Find Existing Opportunity'].json.records?.[0];

if (existingOpp) {
  // Existing opportunity found - add signals to it
  const existingSignals = existingOpp.fields.signals || [];
  const newSignalIds = forceGroup.signals.map(s => s.signal_record_id);
  const allSignals = [...new Set([...existingSignals, ...newSignalIds])];
  
  return {
    json: {
      action: 'update',
      opportunity_id: existingOpp.id,
      signal_ids: newSignalIds,
      all_signal_ids: allSignals,
      force_id: forceGroup.force_id
    }
  };
} else {
  // No existing opportunity - create new
  return {
    json: {
      action: 'create',
      force_id: forceGroup.force_id,
      signal_ids: forceGroup.signals.map(s => s.signal_record_id),
      status: 'researching'
    }
  };
}
```

#### Node 6: Execute Airtable Operation

**Type**: IF (branch on action) + HTTP Request

**Create branch**:
```
POST https://api.airtable.com/v0/{{baseId}}/Opportunities
Headers:
  Authorization: Bearer {{$credentials.airtable}}
  Content-Type: application/json
Body: {
  "records": [{
    "fields": {
      "force": ["{{force_id}}"],
      "status": "researching",
      "signals": {{signal_ids}}
    }
  }]
}
```

**Update branch**:
```
PATCH https://api.airtable.com/v0/{{baseId}}/Opportunities
Headers:
  Authorization: Bearer {{$credentials.airtable}}
  Content-Type: application/json
Body: {
  "records": [{
    "id": "{{opportunity_id}}",
    "fields": {
      "signals": {{all_signal_ids}}
    }
  }]
}
```

#### Node 7: Update Signal Records

**Type**: HTTP Request (batch)

Link each signal to its opportunity:

```
PATCH https://api.airtable.com/v0/{{baseId}}/Signals
Headers:
  Authorization: Bearer {{$credentials.airtable}}
  Content-Type: application/json
Body: {
  "records": [
    {
      "id": "{{signal_record_id}}",
      "fields": {
        "opportunity": ["{{opportunity_id}}"]
      }
    }
    // ... more signals
  ]
}
```

Batch in groups of 10 with 200ms delay per `.claude/rules/airtable.md`.

#### Node 8: Log Completion

**Type**: Code

```javascript
const stats = {
  workflow: 'MI: Opportunity Creator',
  timestamp: new Date().toISOString(),
  signals_processed: $input.all().length,
  opportunities_created: $input.all().filter(i => i.json.action === 'create').length,
  opportunities_updated: $input.all().filter(i => i.json.action === 'update').length,
  signals_skipped_no_force: // from Node 2 count
};

console.log('Opportunity Creator completed:', JSON.stringify(stats));
return [{ json: stats }];
```

#### Node 9: Trigger Enrichment (Placeholder)

**Type**: Code (placeholder for SPEC-005)

```javascript
// Placeholder: Will trigger enrichment workflow for opportunities with status=researching
// For now, just log that enrichment would be triggered

const opportunitiesForEnrichment = $input.all()
  .filter(i => i.json.action === 'create')
  .map(i => i.json.opportunity_id);

console.log('Opportunities ready for enrichment:', opportunitiesForEnrichment);

// When SPEC-005 is built, this will call the enrichment webhook
// HTTP Request to enrichment workflow webhook
```

---

## 5. Testing Plan

| Test | Setup | Method | Expected Result |
|------|-------|--------|-----------------|
| New opportunity creation | Signal for Hampshire with `status=relevant`, no existing opp | Run workflow | New opportunity created, signal linked |
| Signal added to existing opp | Signal for Hampshire, existing Hampshire opp with `status=researching` | Run workflow | Signal linked to existing opp, no new opp created |
| Force null handling | Signal with `status=relevant` but `force=null` | Run workflow | Signal skipped, logged, no error |
| Multiple forces in batch | 3 signals for 3 different forces | Run workflow | 3 opportunities created (or updated) |
| Closed opp ignored | Signal for Hampshire, existing Hampshire opp with `status=won` | Run workflow | New opportunity created (old one closed) |

**Test data**: Create test signals with `status=relevant` via manual Airtable entry or use output from WF3 classifier.

---

## 6. Acceptance Criteria

From ROADMAP.md Phase 1:

- [ ] Opportunities created from relevant signals
- [ ] Signals grouped by force (one opportunity per force)
- [ ] Existing open opportunities reused (not duplicated)
- [ ] Signals without force are handled gracefully (skipped, logged)
- [ ] Closed opportunities (won/lost/dormant) don't receive new signals
- [ ] Signal-to-opportunity link tracked in both directions

---

## 7. Build Sequence

1. **Verify prerequisites**
   - `Opportunities` table exists with required fields
   - `Signals` table has `opportunity` linked record field
   - Test signals exist with `status=relevant` and `force` linked
   - Airtable API credentials in n8n

2. **Add `opportunity` field to Signals table** (if not exists)
   - Type: Link to Opportunities
   - Single record (one signal → one opportunity)

3. **Build workflow nodes** (in order)
   - Schedule trigger (15 min)
   - Airtable fetch (relevant, unlinked signals)
   - Code: filter signals with/without force
   - Code: group by force
   - HTTP Request: find existing opportunity
   - Code: decide create vs update
   - IF branch: create or update opportunity
   - HTTP Request: update signal links
   - Logging node
   - Placeholder: enrichment trigger

4. **Test incrementally**
   - Test fetch returns correct signals
   - Test force grouping logic
   - Test opportunity lookup
   - Test create path (new force)
   - Test update path (existing opp)
   - Test skip path (no force)
   - Full flow with 5 test signals

5. **Enable schedule**
   - Activate workflow
   - Monitor first 3-4 runs

---

## 8. Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| SPEC-001: Airtable Schema | ✅ Complete | Opportunities table exists |
| SPEC-002: Jobs Ingestion | ✅ Complete | Creates signals |
| SPEC-003: Signal Classification | ✅ Complete | Sets `status=relevant` and links force |
| `opportunity` field in Signals | ❓ Check | May need to add linked record field |
| Airtable API credentials | ✅ Configured | Already in n8n |

---

## Files to Create/Update

| File | Action |
|------|--------|
| `n8n/workflows/opportunity-creator.json` | Create — workflow export |
| `STATUS.md` | Update — mark SPEC-004 in progress/complete |

---

## Airtable Schema Updates Required

**Signals table** — Add field if not exists:
| Field | Type | Options |
|-------|------|---------|
| `opportunity` | Link to another record | Links to Opportunities table, single select |

**Opportunities table** — Verify fields exist:
| Field | Type | Notes |
|-------|------|-------|
| `force` | Link to another record | Links to Forces table |
| `signals` | Link to another record | Links to Signals table (multiple) |
| `status` | Single select | Options: researching, ready, sent, replied, meeting, proposal, won, lost, dormant |
| `created_at` | Created time | Auto-populated by Airtable |

---

## Out of Scope

These are separate specs:
- Enrichment (contact lookup, message drafting) — SPEC-005
- Priority scoring — Part of enrichment
- "Why Now" narrative generation — Part of enrichment
- Hot lead alerting — Phase 1b (competitor signals)

---

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| One opportunity per force (not per signal) | Reduces clutter, groups related intelligence |
| Reuse open opportunities | Prevents duplicate opps for same force |
| Skip signals without force | Can't create meaningful opportunity without knowing the force |
| 15-minute schedule | Aligns with classifier, quick turnaround |
| HTTP Request over native Airtable node | n8n bug workaround for updates in loops |

---

## Handoff to Claude Code

**Context**: Third workflow in pipeline — groups relevant signals into opportunities

**Key references**:
- Table IDs in NEXT-CONTEXT.md
- Airtable rules: `.claude/rules/airtable.md`
- n8n rules: `.claude/rules/n8n.md`

**Workflow naming**: `MI: Opportunity Creator`

**On completion**: 
- Update STATUS.md
- Verify opportunities appear in Airtable when signals are classified as relevant
- Confirm signal-opportunity links work bidirectionally
