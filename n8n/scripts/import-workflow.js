#!/usr/bin/env node
/**
 * Import/Deploy n8n Workflow
 *
 * Usage: node n8n/scripts/import-workflow.js <workflow-name>
 * Example: node n8n/scripts/import-workflow.js ingest-indeed-jobs
 *
 * Reads from: n8n/workflows/<workflow-name>.json
 * Creates or updates workflow in n8n instance
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
  // Get workflow name from args
  const workflowName = process.argv[2];

  if (!workflowName) {
    console.error('Usage: node import-workflow.js <workflow-name>');
    console.error('Example: node import-workflow.js ingest-indeed-jobs');
    process.exit(1);
  }

  // Validate environment
  if (!N8N_API_URL || !N8N_API_KEY) {
    console.error('Error: Missing environment variables');
    console.error('Required: N8N_API_URL, N8N_API_KEY');
    console.error('Set in .env.local or .env');
    process.exit(1);
  }

  // Find workflow JSON file
  const workflowPath = path.join(__dirname, '../workflows', `${workflowName}.json`);

  if (!fs.existsSync(workflowPath)) {
    console.error(`Error: Workflow file not found: ${workflowPath}`);
    console.error('Available workflows:');
    const files = fs.readdirSync(path.join(__dirname, '../workflows'))
      .filter(f => f.endsWith('.json'));
    if (files.length === 0) {
      console.error('  (none - create JSON files in n8n/workflows/)');
    } else {
      files.forEach(f => console.error(`  - ${f.replace('.json', '')}`));
    }
    process.exit(1);
  }

  console.log(`Reading workflow from: ${workflowPath}`);

  // Read and parse workflow JSON
  let workflowData;
  try {
    const content = fs.readFileSync(workflowPath, 'utf8');
    workflowData = JSON.parse(content);
  } catch (err) {
    console.error(`Error parsing workflow JSON: ${err.message}`);
    process.exit(1);
  }

  // Validate required fields
  if (!workflowData.name) {
    console.error('Error: Workflow JSON must have a "name" field');
    process.exit(1);
  }
  if (!workflowData.nodes || !Array.isArray(workflowData.nodes)) {
    console.error('Error: Workflow JSON must have a "nodes" array');
    process.exit(1);
  }
  if (!workflowData.connections) {
    console.error('Error: Workflow JSON must have a "connections" object');
    process.exit(1);
  }

  console.log(`Workflow name: ${workflowData.name}`);
  console.log(`Nodes: ${workflowData.nodes.length}`);

  // Check if workflow already exists
  console.log('Checking for existing workflow...');
  const existingWorkflow = await findWorkflowByName(workflowData.name);

  if (existingWorkflow) {
    console.log(`Found existing workflow (ID: ${existingWorkflow.id})`);
    console.log('Deleting existing workflow...');
    await deleteWorkflow(existingWorkflow.id);
    console.log('Creating new workflow...');
    const created = await createWorkflow(workflowData);
    console.log(`Workflow recreated: ${created.id}`);
  } else {
    console.log('No existing workflow found. Creating new...');
    const created = await createWorkflow(workflowData);
    console.log(`Workflow created: ${created.id}`);
  }

  console.log('Done!');
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

async function findWorkflowByName(name) {
  try {
    const result = await apiRequest('/workflows');
    const workflows = result.data || result;
    return workflows.find(w => w.name === name);
  } catch (err) {
    console.error(`Warning: Could not list workflows: ${err.message}`);
    return null;
  }
}

async function createWorkflow(workflowData) {
  const payload = {
    name: workflowData.name,
    nodes: workflowData.nodes,
    connections: workflowData.connections,
    settings: workflowData.settings || {
      executionOrder: 'v1',
    },
  };

  return apiRequest('/workflows', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function deleteWorkflow(id) {
  return apiRequest(`/workflows/${id}`, {
    method: 'DELETE',
  });
}

main().catch(err => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
