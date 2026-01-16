---
paths:
  - "airtable/**"
  - "**/airtable*"
---

# Airtable API Rules

## API Basics

- Base URL: `https://api.airtable.com/v0/{baseId}/{tableName}`
- Auth: `Authorization: Bearer {AIRTABLE_API_KEY}`
- Content-Type: `application/json`

## Rate Limits

- **5 requests/second** per base
- Add delays in loops: `await new Promise(r => setTimeout(r, 200))`
- Batch operations to reduce calls

## Batch Operations

- **Create/Update**: Max 10 records per request
- **List**: Max 100 records per page (use `offset` for pagination)

```javascript
// Batch create pattern
const batches = chunk(records, 10);
for (const batch of batches) {
  await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ records: batch, typecast: true })
  });
  await sleep(200);
}
```

## Query Patterns

**Use `filterByFormula`** instead of fetching all:
```javascript
// Good
?filterByFormula={name}="Hampshire"

// Bad - fetches everything
?maxRecords=1000  // then filter client-side
```

## Error Handling

Always check for errors:
```javascript
const response = await fetch(url, options);
const data = await response.json();

if (data.error) {
  console.error('Airtable error:', data.error);
  throw new Error(data.error.message);
}
```

## Field Types

- Use `typecast: true` for flexible value handling
- Linked records are arrays of record IDs: `["recXXX", "recYYY"]`
- Dates: ISO 8601 format

## Schema Source of Truth

Before any schema changes, read:
```
@.claude/skills/airtable-schema/schema-reference.json
```
