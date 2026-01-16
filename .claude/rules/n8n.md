---
paths:
  - "n8n/**"
  - "**/workflow*"
---

# n8n Workflow Rules

## Workflow Structure (Required)

Every workflow follows this pattern:
```
[Trigger] → [Set Variables] → [Log Start] → [Main Logic] → [Log End] → [Alert if Critical]
                                                ↓ on error
                                         [Log Failure] → [Alert]
```

## Logging (Non-Negotiable)

Every workflow logs to Airtable `System_Logs` table:

**Start**:
```json
{
  "workflow_name": "{{ $workflow.name }}",
  "execution_id": "{{ $execution.id }}",
  "event_type": "start",
  "timestamp": "{{ $now.toISOString() }}"
}
```

**End**:
```json
{
  "event_type": "success",
  "duration_ms": "{{ Date.now() - $('Set Variables').json.start_time }}",
  "records_processed": "{{ $items().length }}"
}
```

## Error Handling

Every HTTP Request and API node MUST have:
- Error output connected
- Retry logic (3 attempts)
- Failure logged to System_Logs
- Alert sent for critical failures

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Workflow | kebab-case | `ingest-indeed-jobs` |
| Node | Descriptive | `Fetch Indeed Results` |
| Variables | camelCase | `startTime`, `recordCount` |

## Credentials

- NEVER hardcode API keys in workflow JSON
- Use n8n credential manager
- Reference via credential selector in nodes

## JSON Files

- Store in `n8n/workflows/`
- Export after manual edits: `node n8n/scripts/export-workflow.js <name>`
- Import to deploy: `node n8n/scripts/import-workflow.js <name>`

## Testing

Before activating:
1. Run once manually
2. Check System_Logs for entry
3. Verify output in target system
4. Check for errors in n8n execution log
