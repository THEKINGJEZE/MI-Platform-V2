#!/bin/bash
# Deploy MCP Servers to VPS for remote access
# This enables Claude Code on web/phone to access Airtable and n8n

set -e

# Load environment variables
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

VPS_HOST="${VPS_HOST:-72.61.202.117}"
VPS_USER="${VPS_USER:-root}"
VPS_SSH="${VPS_USER}@${VPS_HOST}"
MCP_DIR="/docker/mcp-servers"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== MCP Server Deployment ===${NC}"
echo "VPS: ${VPS_SSH}"
echo "Target: ${MCP_DIR}"
echo ""

# Test SSH connection
echo -e "${YELLOW}Testing SSH connection...${NC}"
if ! ssh -o ConnectTimeout=10 "${VPS_SSH}" "echo 'Connected'" > /dev/null 2>&1; then
  echo -e "${RED}Failed to connect to VPS${NC}"
  exit 1
fi
echo -e "${GREEN}SSH connection successful${NC}"

# Create directory structure
echo -e "${YELLOW}Creating directory structure...${NC}"
ssh "${VPS_SSH}" "mkdir -p ${MCP_DIR}/{n8n-mcp,airtable-mcp}"

# Install n8n-mcp
echo -e "${YELLOW}Installing n8n-mcp...${NC}"
ssh "${VPS_SSH}" << 'REMOTE_SCRIPT'
cd /docker/mcp-servers/n8n-mcp

# Install from npm
npm init -y 2>/dev/null || true
npm install n8n-mcp@latest

# Create startup script
cat > start.sh << 'EOF'
#!/bin/bash
export MCP_MODE=http
export USE_FIXED_HTTP=true
export PORT=${N8N_MCP_PORT:-3001}
export N8N_API_URL="${N8N_API_URL}"
export N8N_API_KEY="${N8N_API_KEY}"
export LOG_LEVEL=error
export DISABLE_CONSOLE_OUTPUT=true

cd /docker/mcp-servers/n8n-mcp
node node_modules/n8n-mcp/dist/mcp/index.js
EOF
chmod +x start.sh

echo "n8n-mcp installed successfully"
REMOTE_SCRIPT

# Install airtable-mcp
echo -e "${YELLOW}Installing airtable-mcp-server...${NC}"
ssh "${VPS_SSH}" << 'REMOTE_SCRIPT'
cd /docker/mcp-servers/airtable-mcp

# Install from npm
npm init -y 2>/dev/null || true
npm install airtable-mcp-server@latest

# Create a simple HTTP wrapper for the stdio-based server
cat > http-wrapper.js << 'EOF'
/**
 * HTTP Wrapper for Airtable MCP Server
 * Converts stdio-based MCP server to HTTP endpoint
 */
const express = require('express');
const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const PORT = process.env.AIRTABLE_MCP_PORT || 3002;
const AUTH_TOKEN = process.env.MCP_AUTH_TOKEN;

// Authentication middleware
app.use((req, res, next) => {
  if (AUTH_TOKEN) {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'airtable-mcp' });
});

// MCP endpoint
app.post('/mcp', async (req, res) => {
  try {
    const mcpProcess = spawn('npx', ['-y', 'airtable-mcp-server'], {
      env: {
        ...process.env,
        AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY
      }
    });

    let stdout = '';
    let stderr = '';

    mcpProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    mcpProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Send the request to stdin
    mcpProcess.stdin.write(JSON.stringify(req.body) + '\n');
    mcpProcess.stdin.end();

    mcpProcess.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: stderr || 'MCP process failed' });
      }
      try {
        const response = JSON.parse(stdout);
        res.json(response);
      } catch (e) {
        res.json({ result: stdout });
      }
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      mcpProcess.kill();
      res.status(504).json({ error: 'Request timeout' });
    }, 30000);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Airtable MCP HTTP server running on port ${PORT}`);
});
EOF

# Install express and uuid
npm install express uuid

# Create startup script
cat > start.sh << 'EOF'
#!/bin/bash
export AIRTABLE_MCP_PORT=${AIRTABLE_MCP_PORT:-3002}
export AIRTABLE_API_KEY="${AIRTABLE_API_KEY}"
export MCP_AUTH_TOKEN="${MCP_AUTH_TOKEN}"

cd /docker/mcp-servers/airtable-mcp
node http-wrapper.js
EOF
chmod +x start.sh

echo "airtable-mcp installed successfully"
REMOTE_SCRIPT

# Create PM2 ecosystem file for both servers
echo -e "${YELLOW}Creating PM2 ecosystem file...${NC}"
ssh "${VPS_SSH}" << REMOTE_SCRIPT
cat > ${MCP_DIR}/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'n8n-mcp',
      cwd: '/docker/mcp-servers/n8n-mcp',
      script: 'node_modules/n8n-mcp/dist/mcp/index.js',
      env: {
        MCP_MODE: 'http',
        USE_FIXED_HTTP: 'true',
        PORT: 3001,
        N8N_API_URL: '${N8N_API_URL}',
        N8N_API_KEY: '${N8N_API_KEY}',
        LOG_LEVEL: 'error',
        DISABLE_CONSOLE_OUTPUT: 'true'
      }
    },
    {
      name: 'airtable-mcp',
      cwd: '/docker/mcp-servers/airtable-mcp',
      script: 'http-wrapper.js',
      env: {
        AIRTABLE_MCP_PORT: 3002,
        AIRTABLE_API_KEY: '${AIRTABLE_API_KEY}',
        MCP_AUTH_TOKEN: '${MCP_AUTH_TOKEN:-mcp-secret-token}'
      }
    }
  ]
};
EOF
echo "PM2 ecosystem file created"
REMOTE_SCRIPT

echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo ""
echo "To start the MCP servers:"
echo "  ssh ${VPS_SSH} 'cd ${MCP_DIR} && pm2 start ecosystem.config.js'"
echo ""
echo "To check status:"
echo "  ssh ${VPS_SSH} 'pm2 status'"
echo ""
echo "Endpoints (after starting):"
echo "  n8n-mcp:      http://${VPS_HOST}:3001"
echo "  airtable-mcp: http://${VPS_HOST}:3002"
