# SPEC-005: Opportunity Enricher

**Status**: Built  
**Phase**: 1 — Core Jobs Pipeline  
**Source of Truth**: `peel-solutions-mi-platform-strategy.md` Section 7 (Stage 4: ENRICH), Section 10 (Workflow 4.1)

---

## 1. Overview

**Goal**: Enrich opportunities with contacts, draft messages, and priority scores so they're ready for Monday review.

**Expected Outcome**: Opportunities transition from `status=researching` to `status=ready` with:
- Contact linked (from Airtable or pulled from HubSpot)
- Outreach draft generated
- Outreach channel determined (email vs LinkedIn)
- Priority score calculated
- "Why Now" narrative written

---

## 2. Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Opportunities  │────▶│   Already Has    │──Y──▶│   Skip Contact   │
│   (researching)  │     │   Verified       │      │   Lookup         │
└──────────────────┘     │   Contact?       │      └──────────────────┘
                         └────────┬─────────┘
                                  │ N
                         ┌────────▼─────────┐     ┌──────────────────┐
                         │   Check Airtable │────▶│   No Contact?    │
                         │   Contacts       │     │   Query HubSpot  │
                         └──────────────────┘     └──────────────────┘
                                                          │
                         ┌────────────────────────────────┘
                         ▼
                  ┌──────────────────┐     ┌──────────────────┐
                  │   HubSpot Found? │────▶│   Create Contact │
                  │   Create in      │     │   in Airtable    │
                  │   Airtable       │     │                  │
                  └──────────────────┘     └──────────────────┘
                                                    │
         ┌──────────────────────────────────────────┘
         ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   AI Enrichment  │────▶│   Update         │────▶│   Alert          │
│   (Draft + Score)│     │   Opportunity    │     │   (if hot lead)  │
└──────────────────┘     │   status=ready   │     │                  │
                         └──────────────────┘     └──────────────────┘
```

**Data Flow**:
1. Fetch opportunities with `status=researching`
2. **Check if already has verified contact → skip contact lookup if yes**
3. Get linked force (including `hubspot_company_id`) and signals
4. Check Airtable Contacts for this force
5. **If no Airtable contact → Query HubSpot by company ID**
6. **If HubSpot has contacts → Create in Airtable Contacts table**
7. **Determine outreach channel based on contact email**
8. Build context payload for AI (including relationship history)
9. Call AI to generate: outreach draft, priority score, why_now narrative
10. Update opportunity with enrichment data
11. Set `status=ready` (or `status=researching` if still no contact)
12. If competitor intercept → trigger alert

---

## 3. Tables

**Reads from**:
- `Opportunities` table (`tblJgZuI3LM2Az5id`) — opportunities needing enrichment
- `Signals` table (`tblez9trodMzKKqXq`) — linked signal context
- `Forces` table (`tblbAjBEdpv42Smpw`) — force details including `hubspot_company_id`
- `Contacts` table (`tbl0u9vy71jmyaDx1`) — existing contact lookup
- **HubSpot API** — contact lookup by company ID

**Writes to**:
- `Contacts` table — new contacts pulled from HubSpot
- `Opportunities` table — enrichment fields

**Opportunity fields updated**:

| Field | Value | Notes |
|-------|-------|-------|
| `contact` | Link to contact record | From Airtable (existing or newly created from HubSpot) |
| `contact_confidence` | `verified`, `likely`, `guess` | `verified` if has email |
| `outreach_draft` | AI-generated message | Under 100 words |
| `outreach_channel` | `email` or `linkedin` | Based on contact email availability |
| `outreach_angle` | Detected angle | direct_hiring, competitor_intercept, etc. |
| `priority_score` | 0-100 | Calculated by AI |
| `priority_tier` | hot, high, medium, low | Derived from score |
| `why_now` | 2-3 sentence narrative | AI-generated |
| `status` | `ready` or stays `researching` | Ready if has contact + draft |

**Contact fields (when creating from HubSpot)**:

| Field | Value | Notes |
|-------|-------|-------|
| `name` | HubSpot firstname + lastname | Combined |
| `first_name` | HubSpot firstname | For personalisation |
| `email` | HubSpot email | Primary contact method |
| `role` | HubSpot jobtitle | Job title |
| `force` | Link to force record | From opportunity context |
| `hubspot_id` | HubSpot contact ID | For sync reference |
| `source` | `hubspot_sync` | Track provenance |
| `verified` | `true` if email exists | HubSpot emails are verified |
| `relationship_status` | `cold` | Default for new contacts |
| `last_interaction` | HubSpot lastmodifieddate | For relationship context |

---

## 4. Workflows

### Workflow: `MI: Opportunity Enricher`

**Trigger**: Schedule — every 15 minutes (aligned with WF4)

#### Node 1: Fetch Opportunities Needing Enrichment

**Type**: HTTP Request (Airtable API)

```
GET https://api.airtable.com/v0/{{baseId}}/Opportunities
Headers:
  Authorization: Bearer {{$credentials.airtable}}
Query params:
  filterByFormula: {status} = "researching"
  maxRecords: 20
  sort[0][field]: created_at
  sort[0][direction]: asc
```

If no records, exit early.

#### Node 2: Check If Already Has Verified Contact

**Type**: Code

Per strategy: "Check if opportunity already has verified contact → skip"

```javascript
const opp = $input.item.json;

// Check if opportunity already has a contact linked with verified confidence
const hasContact = opp.fields.contact && opp.fields.contact.length > 0;
const isVerified = opp.fields.contact_confidence === 'verified';

if (hasContact && isVerified) {
  return {
    json: {
      ...opp,
      skip_contact_lookup: true,
      contact_id: opp.fields.contact[0],
      contact_confidence: 'verified'
    }
  };
}

return {
  json: {
    ...opp,
    skip_contact_lookup: false
  }
};
```

#### Node 3: Get Linked Signals and Force

**Type**: Code + HTTP Request

For each opportunity, fetch linked signals and force details (including `hubspot_company_id`):

```javascript
const opp = $input.item.json;
const forceId = Array.isArray(opp.fields.force) ? opp.fields.force[0] : opp.fields.force;
const signalIds = opp.fields.signals || [];

return {
  json: {
    opportunity_id: opp.id,
    force_id: forceId,
    signal_ids: signalIds,
    is_competitor_intercept: opp.fields.is_competitor_intercept || false,
    skip_contact_lookup: opp.skip_contact_lookup || false,
    existing_contact_id: opp.contact_id || null
  }
};
```

Then fetch force details via HTTP Request — **must include `hubspot_company_id` field**.

#### Node 4: Lookup Contact in Airtable (Conditional)

**Type**: IF + HTTP Request (Airtable API)

**Condition**: `skip_contact_lookup = false`

```
GET https://api.airtable.com/v0/{{baseId}}/Contacts
Headers:
  Authorization: Bearer {{$credentials.airtable}}
Query params:
  filterByFormula: RECORD_ID({force}) = "{{force_id}}"
  maxRecords: 5
  sort[0][field]: last_interaction
  sort[0][direction]: desc
```

#### Node 5: Check If Airtable Contact Found

**Type**: Code

```javascript
// Skip if we already have a verified contact — will fetch details in Node 5b
if ($input.item.json.skip_contact_lookup) {
  return {
    json: {
      ...($input.item.json),
      contact_source: 'existing',
      contact_found: true,
      contact_id: $input.item.json.existing_contact_id,
      need_contact_fetch: true,  // Flag to fetch details
      skip_hubspot: true
    }
  };
}

const airtableContacts = $input.item.json.records || [];

if (airtableContacts.length > 0) {
  // Sort by verified + relationship status
  const sorted = airtableContacts.sort((a, b) => {
    if (a.fields.verified && !b.fields.verified) return -1;
    if (!a.fields.verified && b.fields.verified) return 1;
    const statusOrder = { champion: 0, active: 1, warm: 2, cold: 3, unknown: 4 };
    return (statusOrder[a.fields.relationship_status] || 4) - 
           (statusOrder[b.fields.relationship_status] || 4);
  });
  
  const best = sorted[0];
  return {
    json: {
      ...($input.item.json),
      contact_source: 'airtable',
      contact_found: true,
      contact_id: best.id,
      contact_name: best.fields.name,
      contact_role: best.fields.role,
      contact_email: best.fields.email,
      contact_confidence: best.fields.verified ? 'verified' : 'likely',
      contact_last_interaction: best.fields.last_interaction,
      contact_interaction_count: best.fields.interaction_count || 0,
      contact_relationship_status: best.fields.relationship_status,
      skip_hubspot: true
    }
  };
}

// No Airtable contact — need to check HubSpot
return {
  json: {
    ...($input.item.json),
    contact_source: null,
    contact_found: false,
    skip_hubspot: false
  }
};
```

#### Node 5b: Fetch Existing Contact Details (If Skipped Lookup)

**Type**: IF + HTTP Request (Airtable API)

**Condition**: `need_contact_fetch = true`

When we skip contact lookup because the opportunity already has a verified contact, we still need to fetch that contact's details for AI context.

```
GET https://api.airtable.com/v0/{{baseId}}/Contacts/{{existing_contact_id}}
Headers:
  Authorization: Bearer {{$credentials.airtable}}
```

**After fetch**: Populate contact fields.

```javascript
const contact = $input.item.json;
return {
  json: {
    ...($input.item.json),
    contact_name: contact.fields.name,
    contact_role: contact.fields.role,
    contact_email: contact.fields.email,
    contact_last_interaction: contact.fields.last_interaction,
    contact_interaction_count: contact.fields.interaction_count || 0,
    contact_relationship_status: contact.fields.relationship_status || 'unknown',
    need_contact_fetch: false
  }
};
```

---

#### Node 6: Query HubSpot for Contacts (Conditional)

**Type**: IF + HTTP Request (HubSpot API)

**Condition**: `skip_hubspot = false` AND `hubspot_company_id` exists

```
POST https://api.hubapi.com/crm/v3/objects/contacts/search
Headers:
  Authorization: Bearer {{$credentials.hubspot}}
  Content-Type: application/json
Body: {
  "filterGroups": [{
    "filters": [{
      "propertyName": "associatedcompanyid",
      "operator": "EQ",
      "value": "{{hubspot_company_id}}"
    }]
  }],
  "sorts": [{
    "propertyName": "lastmodifieddate",
    "direction": "DESCENDING"
  }],
  "properties": [
    "firstname", "lastname", "email", "jobtitle", 
    "phone", "hs_lead_status", "lastmodifieddate"
  ],
  "limit": 10
}
```

#### Node 7: Select Best HubSpot Contact

**Type**: Code

Per strategy: "Prefer roles: HR, Resourcing, PVP, Crime"

```javascript
const hubspotResults = $input.item.json.results || [];

if (hubspotResults.length === 0) {
  // No HubSpot contacts either — flag for manual research
  return {
    json: {
      ...($input.item.json),
      contact_source: null,
      contact_found: false,
      hubspot_contact: null
    }
  };
}

// Prioritise by preferred role keywords (per strategy)
const preferredRoles = [
  'head of hr', 'hr director', 'director of hr',
  'head of resourcing', 'resourcing manager', 'talent acquisition',
  'head of pvp', 'head of crime', 'head of investigations',
  'workforce planning', 'recruitment manager',
  'head', 'director', 'manager'
];

const scored = hubspotResults.map(contact => {
  let score = 0;
  const title = (contact.properties.jobtitle || '').toLowerCase();
  
  // Score by role match (earlier in list = higher score)
  preferredRoles.forEach((keyword, index) => {
    if (title.includes(keyword)) {
      score += (preferredRoles.length - index) * 5;
    }
  });
  
  // Bonus for having email (critical for outreach)
  if (contact.properties.email) score += 100;
  
  // Bonus for recent activity
  if (contact.properties.lastmodifieddate) {
    const daysSinceModified = (Date.now() - new Date(contact.properties.lastmodifieddate)) / (1000 * 60 * 60 * 24);
    if (daysSinceModified < 30) score += 20;
    else if (daysSinceModified < 90) score += 10;
  }
  
  return { ...contact, score };
});

const best = scored.sort((a, b) => b.score - a.score)[0];

return {
  json: {
    ...($input.item.json),
    contact_source: 'hubspot',
    contact_found: true,
    hubspot_contact: {
      hubspot_id: best.id,
      firstname: best.properties.firstname || '',
      lastname: best.properties.lastname || '',
      name: `${best.properties.firstname || ''} ${best.properties.lastname || ''}`.trim(),
      email: best.properties.email || null,
      jobtitle: best.properties.jobtitle || '',
      phone: best.properties.phone || null,
      lastmodifieddate: best.properties.lastmodifieddate || null
    }
  }
};
```

#### Node 8: Create Contact in Airtable (If from HubSpot)

**Type**: IF + HTTP Request (Airtable API)

**Condition**: `contact_source = 'hubspot'`

```
POST https://api.airtable.com/v0/{{baseId}}/Contacts
Headers:
  Authorization: Bearer {{$credentials.airtable}}
  Content-Type: application/json
Body: {
  "records": [{
    "fields": {
      "name": "{{hubspot_contact.name}}",
      "first_name": "{{hubspot_contact.firstname}}",
      "email": "{{hubspot_contact.email}}",
      "role": "{{hubspot_contact.jobtitle}}",
      "phone": "{{hubspot_contact.phone}}",
      "force": ["{{force_id}}"],
      "hubspot_id": "{{hubspot_contact.hubspot_id}}",
      "source": "hubspot_sync",
      "verified": {{hubspot_contact.email ? true : false}},
      "relationship_status": "cold",
      "last_interaction": "{{hubspot_contact.lastmodifieddate}}"
    }
  }]
}
```

**After creation**: Capture the new Airtable record ID for linking to opportunity.

```javascript
const newContact = $input.item.json.records[0];
return {
  json: {
    ...($input.item.json),
    contact_id: newContact.id,
    contact_name: newContact.fields.name,
    contact_role: newContact.fields.role,
    contact_email: newContact.fields.email,
    contact_confidence: newContact.fields.email ? 'verified' : 'likely',
    contact_last_interaction: newContact.fields.last_interaction,
    contact_interaction_count: 0,
    contact_relationship_status: 'cold'
  }
};
```

#### Node 9: Determine Outreach Channel

**Type**: Code

Per strategy: "If contact.email verified → email; Else → LinkedIn (manual)"

```javascript
const data = $input.item.json;

// Determine channel based on email availability
const outreach_channel = data.contact_email ? 'email' : 'linkedin';

return { 
  json: { 
    ...data, 
    outreach_channel 
  } 
};
```

#### Node 10: Determine Outreach Angle

**Type**: Code

```javascript
const signals = $input.item.json.signals || [];
const isCompetitorIntercept = $input.item.json.is_competitor_intercept;

let angle = 'direct_hiring';

if (isCompetitorIntercept) {
  angle = 'competitor_intercept';
} else if (signals.some(s => s.type === 'tender')) {
  angle = 'tender';
} else if (signals.some(s => s.type === 'hmicfrs' || s.type === 'reg28')) {
  angle = 'regulatory';
} else if (signals.some(s => s.type === 'job_posting' || s.type === 'competitor_job')) {
  angle = 'direct_hiring';
} else {
  angle = 'proactive';
}

return { json: { ...($input.item.json), outreach_angle: angle } };
```

#### Node 11: Build AI Context Payload

**Type**: Code

Includes relationship history per strategy.

```javascript
const data = $input.item.json;

const signalSummary = data.signals
  .map(s => `- ${s.title} (${s.type}, ${s.detected_at})`)
  .join('\n');

const context = {
  force_name: data.force_name,
  force_region: data.force_region,
  force_size: data.force_size,
  contact_name: data.contact_name || 'Unknown',
  contact_role: data.contact_role || 'Unknown',
  contact_relationship_status: data.contact_relationship_status || 'unknown',
  contact_last_interaction: data.contact_last_interaction || 'Never',
  contact_interaction_count: data.contact_interaction_count || 0,
  signal_count: data.signals.length,
  signal_summary: signalSummary,
  outreach_angle: data.outreach_angle,
  outreach_channel: data.outreach_channel,
  is_competitor_intercept: data.is_competitor_intercept
};

return { json: { ...data, ai_context: context } };
```

#### Node 12: Call AI for Enrichment

**Type**: HTTP Request (OpenAI API)

Model: `gpt-4o-mini`

**System prompt**: See `prompts/opportunity-enrichment.md`

**User prompt**:
```
Enrich this opportunity for outreach.

FORCE: {{ai_context.force_name}} ({{ai_context.force_region}}, {{ai_context.force_size}})
CONTACT: {{ai_context.contact_name}}, {{ai_context.contact_role}}
RELATIONSHIP: {{ai_context.contact_relationship_status}}, last interaction: {{ai_context.contact_last_interaction}}, {{ai_context.contact_interaction_count}} previous interactions
CHANNEL: {{ai_context.outreach_channel}}
SIGNALS:
{{ai_context.signal_summary}}

OUTREACH ANGLE: {{ai_context.outreach_angle}}
COMPETITOR INTERCEPT: {{ai_context.is_competitor_intercept}}

Return JSON only.
```

**Expected output**:
```json
{
  "outreach_draft": "Hi Sarah, I noticed Hampshire...",
  "subject_line": "Supporting your investigation capacity",
  "priority_score": 75,
  "priority_tier": "high",
  "why_now": "Hampshire posted 3 investigator roles in 48 hours...",
  "reasoning": "Multiple recent signals indicate active hiring need"
}
```

#### Node 13: Parse AI Response

**Type**: Code

```javascript
const response = $input.item.json;
const aiOutput = JSON.parse(response.choices[0].message.content);

const priorityScore = Math.min(100, Math.max(0, aiOutput.priority_score || 50));
const priorityTier = priorityScore >= 90 ? 'hot' :
                     priorityScore >= 70 ? 'high' :
                     priorityScore >= 50 ? 'medium' : 'low';

return {
  json: {
    outreach_draft: aiOutput.outreach_draft,
    subject_line: aiOutput.subject_line,
    priority_score: priorityScore,
    priority_tier: priorityTier,
    why_now: aiOutput.why_now,
    reasoning: aiOutput.reasoning
  }
};
```

#### Node 14: Update Opportunity **(G-011: upsert pattern)**

**Type**: HTTP Request (Airtable API)

```
PATCH https://api.airtable.com/v0/{{baseId}}/Opportunities
Headers:
  Authorization: Bearer {{$credentials.airtable}}
  Content-Type: application/json
Body: {
  "records": [{
    "id": "{{opportunity_id}}",
    "fields": {
      "contact": {{contact_id ? '["' + contact_id + '"]' : null}},
      "contact_confidence": "{{contact_confidence}}",
      "outreach_draft": "{{outreach_draft}}",
      "outreach_channel": "{{outreach_channel}}",
      "outreach_angle": "{{outreach_angle}}",
      "priority_score": {{priority_score}},
      "priority_tier": "{{priority_tier}}",
      "why_now": "{{why_now}}",
      "status": "{{contact_found ? 'ready' : 'researching'}}"
    }
  }]
}
```

#### Node 15: Trigger Hot Lead Alert (Conditional)

**Type**: IF + HTTP Request

If `is_competitor_intercept = true` AND `status = ready`:

```
POST to Slack webhook (or email)

Message:
🎯 COMPETITOR INTERCEPT OPPORTUNITY

Force: {{force_name}}
Signals: {{signal_count}} signals detected
Contact: {{contact_name}} ({{contact_role}}) ✓
Channel: {{outreach_channel}}
Priority: {{priority_tier}}

→ Review in Airtable
```

#### Node 16: Log Completion

**Type**: Code

```javascript
const stats = {
  workflow: 'MI: Opportunity Enricher',
  timestamp: new Date().toISOString(),
  opportunities_enriched: $input.all().length,
  ready_count: $input.all().filter(i => i.json.status === 'ready').length,
  skipped_already_verified: $input.all().filter(i => i.json.contact_source === 'existing').length,
  contacts_from_airtable: $input.all().filter(i => i.json.contact_source === 'airtable').length,
  contacts_from_hubspot: $input.all().filter(i => i.json.contact_source === 'hubspot').length,
  needs_manual_research: $input.all().filter(i => !i.json.contact_found).length,
  channel_email: $input.all().filter(i => i.json.outreach_channel === 'email').length,
  channel_linkedin: $input.all().filter(i => i.json.outreach_channel === 'linkedin').length,
  hot_leads: $input.all().filter(i => i.json.priority_tier === 'hot').length
};

console.log('Enricher completed:', JSON.stringify(stats));
return [{ json: stats }];
```

---

## 5. Testing Plan

| Test | Setup | Method | Expected Result |
|------|-------|--------|-----------------|
| Skip already verified | Opp with existing verified contact | Run workflow | Skips lookup, fetches existing contact details, proceeds to AI |
| Contact in Airtable | Opp for Hampshire, contact exists in Airtable | Run workflow | Uses Airtable contact, skips HubSpot, status=ready |
| Contact from HubSpot | Opp for force with no Airtable contact but HubSpot has contacts | Run workflow | Creates contact in Airtable from HubSpot, status=ready |
| No contact anywhere | Opp for force with no Airtable or HubSpot contacts | Run workflow | Status stays researching, flagged for manual |
| HubSpot contact prioritisation | Force has 3 HubSpot contacts with different roles | Run workflow | Selects "Head of HR" over generic roles |
| Email channel | Contact has verified email | Run workflow | outreach_channel = 'email' |
| LinkedIn channel | Contact has no email | Run workflow | outreach_channel = 'linkedin' |
| Competitor intercept | Opp with is_competitor_intercept=true | Run workflow | Alert triggered, priority boosted |
| Multiple signals | Opp with 5 linked signals | Run workflow | AI summarises all, priority reflects volume |

---

## 6. Acceptance Criteria

From ROADMAP.md Phase 1:

- [ ] Basic enrichment working (contact lookup, message draft)
- [ ] Contact linked to opportunity (from Airtable or HubSpot)
- [ ] HubSpot contacts pulled into Airtable when no local contact exists
- [ ] Outreach channel set based on email availability
- [ ] Outreach draft generated (AI, under 100 words)
- [ ] Priority score calculated (0-100)
- [ ] Status transitions to "ready" when enrichment complete
- [ ] Opportunities without contacts (in both systems) flagged for manual research
- [ ] Already-verified contacts not re-looked-up (efficiency)

---

## 7. Build Sequence

1. **Verify prerequisites**
   - Forces table has `hubspot_company_id` populated
   - HubSpot API key configured in n8n
   - OpenAI API key configured in n8n
   - At least one test opportunity with `status=researching`

2. **Create prompt file**
   - `prompts/opportunity-enrichment.md` (already created)

3. **Build workflow nodes** (in order)
   - Schedule trigger (15 min)
   - Fetch researching opportunities
   - Check if already has verified contact
   - Get linked signals/force (including hubspot_company_id)
   - Airtable contact lookup (conditional)
   - Check if found → branch
   - **Fetch existing contact details (if skipped lookup)**
   - HubSpot contact search (if needed)
   - Select best HubSpot contact
   - Create contact in Airtable (if from HubSpot)
   - Determine outreach channel
   - Determine outreach angle
   - Build AI context (with relationship history)
   - AI enrichment call
   - Parse response
   - Update opportunity
   - Conditional alert
   - Logging

4. **Test incrementally**
   - Test skip-if-verified logic (verify contact details are fetched)
   - Test Airtable contact lookup (with existing contact)
   - Test HubSpot lookup (with force that has HubSpot contacts)
   - Test contact creation in Airtable
   - Test no-contact scenario (neither system has contacts)
   - Test channel determination (email vs linkedin)
   - Test AI enrichment call (verify contact context is complete)
   - Test full flow end-to-end

5. **Enable schedule**
   - Activate workflow
   - Monitor first 3-4 runs

---

## 8. Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| SPEC-004: Opportunity Creator | ✅ Complete | Creates opportunities with status=researching |
| Forces table has hubspot_company_id | ✅ Seeded | Reference data includes HubSpot IDs |
| HubSpot API key | ⚠️ Verify | Must be configured in n8n credentials |
| OpenAI API key | ⚠️ Verify | Must be configured in n8n |
| `prompts/opportunity-enrichment.md` | ✅ Created | Part of this spec |
| Slack webhook (optional) | ⚠️ Optional | For hot lead alerts |

---

## 9. Guardrails Compliance

| Guardrail | Applicable | Status |
|-----------|------------|--------|
| G-002: Command Queue for Emails | No (not sending) | ✅ N/A — drafts only |
| G-005: JS Before AI | No | ✅ N/A — done in WF3 |
| G-007: No CLI Agents | Yes | ✅ Using n8n |
| G-011: Upsert Only | Yes | ✅ Using PATCH updates |
| G-012: Value Proposition First | Yes | ✅ Prompt instructs Peel's value prop, never "we have candidates" |
| G-013: Competitor = P1 Priority | Yes | ✅ Inherited from WF4 — competitor signals already flagged P1 |
| G-014: Contact Problem Owner | Yes | ✅ Contact research targets operational leaders, HR is fallback |
| G-015: Hook→Bridge→Value→CTA | Yes | ✅ Message drafting prompt enforces four-part structure |

---

## Files to Create/Update

| File | Action |
|------|--------|
| `prompts/opportunity-enrichment.md` | ✅ Created |
| `n8n/workflows/opportunity-enricher.json` | Create — workflow export |
| `STATUS.md` | Update — mark SPEC-005 in progress/complete |

---

## Out of Scope

These are separate specs or phases:
- LinkedIn contact research — Phase 2+ (agentic)
- Force website scraping — Phase 2+ (agentic)
- Bidirectional HubSpot sync — future enhancement
- Full agentic Contact Research Agent — Phase 2+
- Email sending — SPEC-006 (send-outreach workflow)

---

## 10. Implementation Notes

### AI Model Choice

The strategy document specifies `claude-3-5-sonnet` for enrichment. This spec uses `gpt-4o-mini` for Phase 1 cost optimization, consistent with WF3 (Signal Classification). This is an intentional trade-off:

| Model | Cost | Quality | Rationale |
|-------|------|---------|----------|
| claude-3-5-sonnet | ~$0.003/1K | Higher | Strategy recommendation |
| gpt-4o-mini | ~$0.00015/1K | Good enough | 20x cheaper, adequate for Phase 1 |

Can upgrade to Sonnet in Phase 2 if message quality is insufficient.

### Airtable Linked Record Filtering

The filter `RECORD_ID({force}) = "{{force_id}}"` for linked records may need adjustment during implementation. Airtable linked record filters require specific syntax. If this doesn't work, try:

```
FIND("{{force_id}}", ARRAYJOIN({force}))
```

Claude Code should verify the correct syntax when building.

### HubSpot Contact Association

The HubSpot API uses `associatedcompanyid` to find contacts linked to a company. Verify this property is populated in your HubSpot data. Alternative approach if needed:

```
// Use company search first, then get associated contacts
GET /crm/v3/objects/companies/{{hubspot_company_id}}/associations/contacts
```

---

## Handoff to Claude Code

**Context**: Fifth workflow — enriches opportunities to make them "ready to send"

**Key references**:
- Table IDs in NEXT-CONTEXT.md
- Airtable rules: `.claude/rules/airtable.md`
- n8n rules: `.claude/rules/n8n.md`
- HubSpot API: Search contacts by associated company

**Workflow naming**: `MI: Opportunity Enricher`

**On completion**:
- Update STATUS.md
- Verify opportunities transition from researching → ready
- Confirm contacts pulled from HubSpot appear in Airtable Contacts table
- Confirm outreach drafts appear in Airtable
- Confirm outreach_channel is set correctly
- Test hot lead alert path
