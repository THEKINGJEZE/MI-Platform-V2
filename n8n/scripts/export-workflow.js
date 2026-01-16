#!/usr/bin/env node
/**
 * Export n8n Workflow to JSON
 *
 * Usage: node n8n/scripts/export-workflow.js <workflow-name-or-id>
 * Example: node n8n/scripts/export-workflow.js ingest-indeed-jobs
 * Example: node n8n/scripts/export-workflow.js 123
 *
 * Saves to: n8n/workflows/<workflow-name>.json
 *
 * Requires environment variables:
 *   N8N_API_URL - e.g., https://n8n.example.com/api/v1
 *   N8N_API_KEY - API key from n8n Settings > API
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env.local') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const N8N_API_URL = process.env.N8N_API_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;

async function main() {
  // Get workflow identifier from args
  const identifier = process.argv[2];

  if (!identifier) {
    console.error('Usage: node export-workflow.js <workflow-name-or-id>');
    console.error('Example: node export-workflow.js ingest-indeed-jobs');
    console.error('Example: node export-workflow.js 123');
    process.exit(1);
  }

  // Validate environment
  if (!N8N_API_URL || !N8N_API_KEY) {
    console.error('Error: Missing environment variables');
    console.error('Required: N8N_API_URL, N8N_API_KEY');
    console.error('Set in .env.local or .env');
    process.exit(1);
  }

  // Find workflow (by ID or name)
  let workflow;
  if (/^\d+$/.test(identifier)) {
    // Numeric ID
    console.log(`Fetching workflow by ID: ${identifier}`);
    workflow = await getWorkflowById(identifier);
  } else {
    // Name lookup
    console.log(`Searching for workflow by name: ${identifier}`);
    workflow = await findWorkflowByName(identifier);
  }

  if (!workflow) {
    console.error(`Error: Workflow not found: ${identifier}`);
    console.error('');
    console.error('Available workflows:');
    await listWorkflows();
    process.exit(1);
  }

  // Get full workflow details
  console.log(`Found workflow: ${workflow.name} (ID: ${workflow.id})`);

  if (!workflow.nodes) {
    // Need to fetch full details
    workflow = await getWorkflowById(workflow.id);
  }

  // Prepare export data (exclude runtime/internal fields)
  const exportData = {
    name: workflow.name,
    nodes: workflow.nodes,
    connections: workflow.connections,
    settings: workflow.settings || {},
    staticData: workflow.staticData || null,
  };

  // Generate filename from workflow name (kebab-case)
  const filename = workflow.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + '.json';

  const outputPath = path.join(__dirname, '../workflows', filename);

  // Write to file
  fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));

  console.log(`Exported to: ${outputPath}`);
  console.log(`Nodes: ${exportData.nodes.length}`);
  console.log('');
  console.log('Note: Credentials are not exported. You may need to reconnect them after import.');
}

async function apiRequest(endpoint, options = {}) {
  const url = `${N8N_API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`n8n API error (${response.status}): ${text}`);
  }

  return response.json();
}

async function getWorkflowById(id) {
  try {
    return await apiRequest(`/workflows/${id}`);
  } catch (err) {
    console.error(`Error fetching workflow: ${err.message}`);
    return null;
  }
}

async function findWorkflowByName(name) {
  try {
    const result = await apiRequest('/workflows');
    const workflows = result.data || result;

    // Try exact match first
    let match = workflows.find(w => w.name === name);
    if (match) return match;

    // Try case-insensitive match
    match = workflows.find(w => w.name.toLowerCase() === name.toLowerCase());
    if (match) return match;

    // Try partial match
    match = workflows.find(w => w.name.toLowerCase().includes(name.toLowerCase()));
    return match;
  } catch (err) {
    console.error(`Error listing workflows: ${err.message}`);
    return null;
  }
}

async function listWorkflows() {
  try {
    const result = await apiRequest('/workflows');
    const workflows = result.data || result;
    workflows.forEach(w => {
      console.error(`  - ${w.name} (ID: ${w.id})`);
    });
  } catch (err) {
    console.error(`  (Could not fetch workflow list: ${err.message})`);
  }
}

main().catch(err => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
