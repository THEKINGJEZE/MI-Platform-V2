---
description: Verify all system connections (Airtable, n8n, HubSpot, Claude API)
---

# System Health Check

## Quick Check

Run the health check script:
```bash
node scripts/health-check.js
```

## Manual Verification (if script fails)

### 1. Airtable
```bash
curl -s -H "Authorization: Bearer $AIRTABLE_API_KEY" \
  "https://api.airtable.com/v0/$AIRTABLE_BASE_ID/Forces?maxRecords=1"
```
✅ Expected: JSON with records array

### 2. n8n
```bash
curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "$N8N_API_URL/workflows"
```
✅ Expected: JSON with data array of workflows

### 3. HubSpot
```bash
curl -s -H "Authorization: Bearer $HUBSPOT_API_KEY" \
  "https://api.hubapi.com/crm/v3/objects/contacts?limit=1"
```
✅ Expected: JSON with results array

### 4. Claude API
```bash
curl -s -X POST "https://api.anthropic.com/v1/messages" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-haiku-20240307","max_tokens":10,"messages":[{"role":"user","content":"ping"}]}'
```
✅ Expected: JSON with content array

## Troubleshooting

| Issue | Check |
|-------|-------|
| Airtable 401 | API key correct? Has base access? |
| Airtable 404 | Base ID correct? Table exists? |
| n8n connection refused | n8n running? URL correct? |
| n8n 401 | API key enabled in n8n settings? |
| HubSpot 401 | Private app has CRM scopes? |
| Claude 401 | API key valid? Has credits? |
