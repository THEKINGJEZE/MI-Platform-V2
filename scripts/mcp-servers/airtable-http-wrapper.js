/**
 * Custom Airtable HTTP Wrapper for Remote MCP Access
 *
 * Direct API wrapper (not subprocess-based) for better performance
 * and reliability. Uses token-only authentication.
 */
const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.AIRTABLE_MCP_PORT || 3002;
const AUTH_TOKEN = process.env.MCP_AUTH_TOKEN;
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_URL = 'https://api.airtable.com/v0';

// Logging helper
const log = (level, msg, data = {}) => {
  if (process.env.LOG_LEVEL !== 'silent') {
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), level, msg, ...data }));
  }
};

// Authentication middleware (token only, no host validation)
app.use((req, res, next) => {
  if (req.path === '/health') return next();

  if (AUTH_TOKEN) {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
      log('warn', 'Unauthorized request', { path: req.path });
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'airtable-mcp-wrapper',
    api_key: AIRTABLE_API_KEY ? 'configured' : 'missing',
    auth: AUTH_TOKEN ? 'enabled' : 'disabled'
  });
});

// Airtable API helper
async function airtableRequest(endpoint, method = 'GET', body = null) {
  const url = `${AIRTABLE_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    }
  };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(url, options);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error?.message || error.error || response.statusText);
  }
  return response.json();
}

// === Direct API Endpoints ===

// List bases
app.get('/api/bases', async (req, res) => {
  try {
    const data = await airtableRequest('/meta/bases');
    res.json(data);
  } catch (error) {
    log('error', 'Failed to list bases', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Get base schema
app.get('/api/bases/:baseId/tables', async (req, res) => {
  try {
    const data = await airtableRequest(`/meta/bases/${req.params.baseId}/tables`);
    res.json(data);
  } catch (error) {
    log('error', 'Failed to get tables', { baseId: req.params.baseId, error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// List records
app.get('/api/bases/:baseId/:tableId', async (req, res) => {
  try {
    const params = new URLSearchParams();
    if (req.query.filterByFormula) params.set('filterByFormula', req.query.filterByFormula);
    if (req.query.maxRecords) params.set('maxRecords', req.query.maxRecords);
    if (req.query.pageSize) params.set('pageSize', req.query.pageSize);
    if (req.query.offset) params.set('offset', req.query.offset);
    if (req.query.view) params.set('view', req.query.view);
    if (req.query.sort) params.set('sort', req.query.sort);

    const endpoint = params.toString()
      ? `/${req.params.baseId}/${req.params.tableId}?${params}`
      : `/${req.params.baseId}/${req.params.tableId}`;

    const data = await airtableRequest(endpoint);
    res.json(data);
  } catch (error) {
    log('error', 'Failed to list records', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Get record
app.get('/api/bases/:baseId/:tableId/:recordId', async (req, res) => {
  try {
    const data = await airtableRequest(`/${req.params.baseId}/${req.params.tableId}/${req.params.recordId}`);
    res.json(data);
  } catch (error) {
    log('error', 'Failed to get record', { recordId: req.params.recordId, error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Create records
app.post('/api/bases/:baseId/:tableId', async (req, res) => {
  try {
    const data = await airtableRequest(`/${req.params.baseId}/${req.params.tableId}`, 'POST', req.body);
    res.json(data);
  } catch (error) {
    log('error', 'Failed to create records', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Update records
app.patch('/api/bases/:baseId/:tableId', async (req, res) => {
  try {
    const data = await airtableRequest(`/${req.params.baseId}/${req.params.tableId}`, 'PATCH', req.body);
    res.json(data);
  } catch (error) {
    log('error', 'Failed to update records', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Delete records
app.delete('/api/bases/:baseId/:tableId', async (req, res) => {
  try {
    const recordIds = req.query.records || [];
    const params = Array.isArray(recordIds)
      ? recordIds.map(id => `records[]=${id}`).join('&')
      : `records[]=${recordIds}`;
    const data = await airtableRequest(`/${req.params.baseId}/${req.params.tableId}?${params}`, 'DELETE');
    res.json(data);
  } catch (error) {
    log('error', 'Failed to delete records', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// === MCP Protocol Endpoint ===

app.post('/mcp', async (req, res) => {
  const { method, params, id } = req.body;

  try {
    let result;

    switch (method) {
      case 'tools/list':
        result = {
          tools: [
            { name: 'list_bases', description: 'List all Airtable bases' },
            { name: 'list_tables', description: 'List tables in a base', inputSchema: { type: 'object', properties: { baseId: { type: 'string' } }, required: ['baseId'] } },
            { name: 'describe_table', description: 'Get table schema', inputSchema: { type: 'object', properties: { baseId: { type: 'string' }, tableId: { type: 'string' } }, required: ['baseId', 'tableId'] } },
            { name: 'list_records', description: 'List records from a table', inputSchema: { type: 'object', properties: { baseId: { type: 'string' }, tableId: { type: 'string' }, filterByFormula: { type: 'string' }, maxRecords: { type: 'number' } }, required: ['baseId', 'tableId'] } },
            { name: 'search_records', description: 'Search records with formula', inputSchema: { type: 'object', properties: { baseId: { type: 'string' }, tableId: { type: 'string' }, filterByFormula: { type: 'string' }, maxRecords: { type: 'number' } }, required: ['baseId', 'tableId'] } },
            { name: 'get_record', description: 'Get a single record', inputSchema: { type: 'object', properties: { baseId: { type: 'string' }, tableId: { type: 'string' }, recordId: { type: 'string' } }, required: ['baseId', 'tableId', 'recordId'] } },
            { name: 'create_record', description: 'Create a record', inputSchema: { type: 'object', properties: { baseId: { type: 'string' }, tableId: { type: 'string' }, fields: { type: 'object' } }, required: ['baseId', 'tableId', 'fields'] } },
            { name: 'update_records', description: 'Update records', inputSchema: { type: 'object', properties: { baseId: { type: 'string' }, tableId: { type: 'string' }, records: { type: 'array' } }, required: ['baseId', 'tableId', 'records'] } },
            { name: 'delete_records', description: 'Delete records', inputSchema: { type: 'object', properties: { baseId: { type: 'string' }, tableId: { type: 'string' }, recordIds: { type: 'array' } }, required: ['baseId', 'tableId', 'recordIds'] } }
          ]
        };
        break;

      case 'tools/call':
        const toolName = params.name;
        const args = params.arguments || {};

        switch (toolName) {
          case 'list_bases':
            result = await airtableRequest('/meta/bases');
            break;

          case 'list_tables':
          case 'describe_table':
            result = await airtableRequest(`/meta/bases/${args.baseId}/tables`);
            break;

          case 'list_records':
          case 'search_records':
            const listParams = new URLSearchParams();
            if (args.filterByFormula) listParams.set('filterByFormula', args.filterByFormula);
            if (args.maxRecords) listParams.set('maxRecords', args.maxRecords);
            if (args.view) listParams.set('view', args.view);
            const listEndpoint = listParams.toString()
              ? `/${args.baseId}/${args.tableId}?${listParams}`
              : `/${args.baseId}/${args.tableId}`;
            result = await airtableRequest(listEndpoint);
            break;

          case 'get_record':
            result = await airtableRequest(`/${args.baseId}/${args.tableId}/${args.recordId}`);
            break;

          case 'create_record':
            result = await airtableRequest(`/${args.baseId}/${args.tableId}`, 'POST', {
              records: [{ fields: args.fields }],
              typecast: true
            });
            break;

          case 'update_records':
            result = await airtableRequest(`/${args.baseId}/${args.tableId}`, 'PATCH', {
              records: args.records,
              typecast: true
            });
            break;

          case 'delete_records':
            const deleteParams = args.recordIds.map(id => `records[]=${id}`).join('&');
            result = await airtableRequest(`/${args.baseId}/${args.tableId}?${deleteParams}`, 'DELETE');
            break;

          default:
            throw new Error(`Unknown tool: ${toolName}`);
        }
        break;

      case 'initialize':
        result = {
          protocolVersion: '2024-11-05',
          serverInfo: { name: 'airtable-mcp-wrapper', version: '1.0.0' },
          capabilities: { tools: {} }
        };
        break;

      default:
        throw new Error(`Unknown method: ${method}`);
    }

    res.json({ jsonrpc: '2.0', id, result });

  } catch (error) {
    log('error', 'MCP request failed', { method, error: error.message });
    res.json({
      jsonrpc: '2.0',
      id,
      error: { code: -32000, message: error.message }
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  log('info', 'Airtable MCP HTTP wrapper started', { port: PORT });
  console.log(`Airtable MCP HTTP wrapper running on port ${PORT}`);
});
