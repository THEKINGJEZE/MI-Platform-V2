---
name: deploy-workflow
description: Import or update an n8n workflow from project JSON files
---

# Deploy Workflow to n8n

## Usage

```
/project:deploy-workflow <workflow-name>
```

Example: `/project:deploy-workflow ingest-indeed-jobs`

## What It Does

1. Reads `n8n/workflows/<workflow-name>.json`
2. Checks if workflow exists in n8n (by name)
3. Creates new or updates existing
4. Activates the workflow
5. Verifies deployment

## Execution Steps

### Step 1: Verify workflow file exists
```bash
ls -la n8n/workflows/$ARGUMENTS.json
```

### Step 2: Validate JSON
```bash
cat n8n/workflows/$ARGUMENTS.json | head -20
```

### Step 3: Deploy via script
```bash
node n8n/scripts/import-workflow.js $ARGUMENTS
```

### Step 4: Verify in n8n
- Workflow appears in n8n dashboard
- Workflow is active
- Credentials connected (may need manual step)

## Manual Deployment (if script fails)

1. Open n8n dashboard
2. Import → From File
3. Select `n8n/workflows/<workflow-name>.json`
4. Connect credentials
5. Activate

## After Deployment

- [ ] Test trigger fires correctly
- [ ] Check System_Logs for entries
- [ ] Verify output in Airtable

## Sync Warning

If you edit a workflow in n8n UI, export it back:
```bash
node n8n/scripts/export-workflow.js <workflow-name>
```

Keep the JSON files as source of truth.
