---
name: airtable-schema
description: >-
  Complete Airtable schema for MI Platform. Auto-loads when working with
  Airtable API, creating tables, or understanding the data model.
---

# Airtable Schema Skill

## Quick Reference

| Table | Purpose | Key Fields |
|-------|---------|------------|
| Forces | UK police forces | name, region, size, relationship_status |
| Signals | Raw intelligence | source, title, force→, relevance_score |
| Opportunities | Actionable leads | force→, signals→, status, priority |
| Contacts | Decision-makers | name, title, email, force→ |
| Outreach | Draft messages | opportunity→, contact→, body, status |
| System_Logs | Workflow monitoring | workflow_name, event_type, timestamp |
| System_Health | Daily metrics | workflow_name, date, success_rate |

## Relationships

```
Forces (1) ←→ (many) Signals
Forces (1) ←→ (many) Opportunities  
Forces (1) ←→ (many) Contacts
Signals (many) ←→ (1) Opportunities
Opportunities (1) ←→ (1) Contacts
Opportunities (1) ←→ (1) Outreach
```

## For Full Schema

Load the complete field definitions:
```
@.claude/skills/airtable-schema/schema-reference.json
```

## Common Operations

### Create Signal
```javascript
{
  "fields": {
    "source": "indeed",
    "source_url": "https://...",
    "title": "Disclosure Officer",
    "raw_content": "Full text...",
    "detected_at": new Date().toISOString(),
    "status": "New"
  }
}
```

### Link to Force
```javascript
// Lookup force first
const force = await findForce("Hampshire");
// Then link
{
  "fields": {
    "force": [force.id]  // Array of record IDs
  }
}
```

### Create Opportunity from Signal
```javascript
{
  "fields": {
    "force": [signal.fields.force[0]],
    "source_signals": [signal.id],
    "opportunity_type": "hiring_intent",
    "status": "New"
  }
}
```
