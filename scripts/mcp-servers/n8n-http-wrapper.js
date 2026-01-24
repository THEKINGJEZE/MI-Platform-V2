/**
 * Custom n8n HTTP Wrapper for Remote MCP Access
 *
 * Bypasses n8n-mcp's built-in host validation to allow connections
 * from Claude's mobile/web infrastructure (proxied requests).
 *
 * Uses token-only authentication.
 */
const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.N8N_MCP_PORT || 3001;
const AUTH_TOKEN = process.env.MCP_AUTH_TOKEN;
const N8N_API_URL = process.env.N8N_API_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;

// Logging helper
const log = (level, msg, data = {}) => {
  if (process.env.LOG_LEVEL !== 'silent') {
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), level, msg, ...data }));
  }
};

// Authentication middleware (token only, no host validation)
app.use((req, res, next) => {
  // Skip auth for health check
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
    service: 'n8n-mcp-wrapper',
    n8n_url: N8N_API_URL ? 'configured' : 'missing',
    auth: AUTH_TOKEN ? 'enabled' : 'disabled'
  });
});

// n8n API proxy helper
async function n8nRequest(endpoint, method = 'GET', body = null) {
  const url = `${N8N_API_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json'
    }
  };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(url, options);
  return response.json();
}

// === MCP Tool Endpoints ===

// List workflows
app.get('/api/workflows', async (req, res) => {
  try {
    const data = await n8nRequest('/workflows');
    res.json(data);
  } catch (error) {
    log('error', 'Failed to list workflows', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Get workflow by ID
app.get('/api/workflows/:id', async (req, res) => {
  try {
    const data = await n8nRequest(`/workflows/${req.params.id}`);
    res.json(data);
  } catch (error) {
    log('error', 'Failed to get workflow', { id: req.params.id, error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Create workflow
app.post('/api/workflows', async (req, res) => {
  try {
    const data = await n8nRequest('/workflows', 'POST', req.body);
    res.json(data);
  } catch (error) {
    log('error', 'Failed to create workflow', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Update workflow
app.put('/api/workflows/:id', async (req, res) => {
  try {
    const data = await n8nRequest(`/workflows/${req.params.id}`, 'PUT', req.body);
    res.json(data);
  } catch (error) {
    log('error', 'Failed to update workflow', { id: req.params.id, error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Activate workflow
app.post('/api/workflows/:id/activate', async (req, res) => {
  try {
    const data = await n8nRequest(`/workflows/${req.params.id}/activate`, 'POST');
    res.json(data);
  } catch (error) {
    log('error', 'Failed to activate workflow', { id: req.params.id, error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Deactivate workflow
app.post('/api/workflows/:id/deactivate', async (req, res) => {
  try {
    const data = await n8nRequest(`/workflows/${req.params.id}/deactivate`, 'POST');
    res.json(data);
  } catch (error) {
    log('error', 'Failed to deactivate workflow', { id: req.params.id, error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Execute workflow (test)
app.post('/api/workflows/:id/run', async (req, res) => {
  try {
    const data = await n8nRequest(`/workflows/${req.params.id}/run`, 'POST', req.body || {});
    res.json(data);
  } catch (error) {
    log('error', 'Failed to run workflow', { id: req.params.id, error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Get executions
app.get('/api/executions', async (req, res) => {
  try {
    const params = new URLSearchParams(req.query).toString();
    const endpoint = params ? `/executions?${params}` : '/executions';
    const data = await n8nRequest(endpoint);
    res.json(data);
  } catch (error) {
    log('error', 'Failed to get executions', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Get execution by ID
app.get('/api/executions/:id', async (req, res) => {
  try {
    const data = await n8nRequest(`/executions/${req.params.id}`);
    res.json(data);
  } catch (error) {
    log('error', 'Failed to get execution', { id: req.params.id, error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// === MCP Protocol Endpoint ===
// This handles the standard MCP JSON-RPC protocol

app.post('/mcp', async (req, res) => {
  const { method, params, id } = req.body;

  try {
    let result;

    switch (method) {
      case 'tools/list':
        result = {
          tools: [
            { name: 'n8n_list_workflows', description: 'List all n8n workflows' },
            { name: 'n8n_get_workflow', description: 'Get workflow by ID', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
            { name: 'n8n_create_workflow', description: 'Create a new workflow', inputSchema: { type: 'object', properties: { name: { type: 'string' }, nodes: { type: 'array' }, connections: { type: 'object' } }, required: ['name'] } },
            { name: 'n8n_update_workflow', description: 'Update a workflow', inputSchema: { type: 'object', properties: { id: { type: 'string' }, workflow: { type: 'object' } }, required: ['id', 'workflow'] } },
            { name: 'n8n_activate_workflow', description: 'Activate a workflow', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
            { name: 'n8n_deactivate_workflow', description: 'Deactivate a workflow', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
            { name: 'n8n_test_workflow', description: 'Execute a workflow', inputSchema: { type: 'object', properties: { id: { type: 'string' }, data: { type: 'object' } }, required: ['id'] } },
            { name: 'n8n_executions', description: 'Get workflow executions', inputSchema: { type: 'object', properties: { workflowId: { type: 'string' }, limit: { type: 'number' } } } }
          ]
        };
        break;

      case 'tools/call':
        const toolName = params.name;
        const toolParams = params.arguments || {};

        switch (toolName) {
          case 'n8n_list_workflows':
            result = await n8nRequest('/workflows');
            break;
          case 'n8n_get_workflow':
            result = await n8nRequest(`/workflows/${toolParams.id}`);
            break;
          case 'n8n_create_workflow':
            result = await n8nRequest('/workflows', 'POST', toolParams);
            break;
          case 'n8n_update_workflow':
            result = await n8nRequest(`/workflows/${toolParams.id}`, 'PUT', toolParams.workflow);
            break;
          case 'n8n_activate_workflow':
            result = await n8nRequest(`/workflows/${toolParams.id}/activate`, 'POST');
            break;
          case 'n8n_deactivate_workflow':
            result = await n8nRequest(`/workflows/${toolParams.id}/deactivate`, 'POST');
            break;
          case 'n8n_test_workflow':
            result = await n8nRequest(`/workflows/${toolParams.id}/run`, 'POST', toolParams.data || {});
            break;
          case 'n8n_executions':
            const execParams = new URLSearchParams();
            if (toolParams.workflowId) execParams.set('workflowId', toolParams.workflowId);
            if (toolParams.limit) execParams.set('limit', toolParams.limit);
            const execEndpoint = execParams.toString() ? `/executions?${execParams}` : '/executions';
            result = await n8nRequest(execEndpoint);
            break;
          default:
            throw new Error(`Unknown tool: ${toolName}`);
        }
        break;

      case 'initialize':
        result = {
          protocolVersion: '2024-11-05',
          serverInfo: { name: 'n8n-mcp-wrapper', version: '1.0.0' },
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
  log('info', 'n8n MCP HTTP wrapper started', { port: PORT, n8n_url: N8N_API_URL });
  console.log(`n8n MCP HTTP wrapper running on port ${PORT}`);
});
