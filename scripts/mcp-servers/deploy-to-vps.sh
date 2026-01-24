#!/bin/bash
# Deploy MCP servers to VPS
# Run this ON the VPS after pulling the repo

set -e

MCP_DIR="/docker/mcp-servers"
REPO_MCP_DIR="$(dirname "$0")"

echo "=== MCP Server Deployment ==="
echo "Source: $REPO_MCP_DIR"
echo "Target: $MCP_DIR"
echo ""

# Create target directory
mkdir -p "$MCP_DIR"

# Copy files
echo "Copying files..."
cp "$REPO_MCP_DIR/n8n-http-wrapper.js" "$MCP_DIR/"
cp "$REPO_MCP_DIR/airtable-http-wrapper.js" "$MCP_DIR/"
cp "$REPO_MCP_DIR/package.json" "$MCP_DIR/"
cp "$REPO_MCP_DIR/ecosystem.config.js" "$MCP_DIR/"

# Install dependencies
echo "Installing dependencies..."
cd "$MCP_DIR"
npm install --production

# Check if .env exists, create template if not
if [ ! -f "$MCP_DIR/.env" ]; then
  echo "Creating .env template..."
  cat > "$MCP_DIR/.env" << 'EOF'
# MCP Server Environment Variables
# Fill in your actual values

N8N_API_URL=http://localhost:5678/api/v1
N8N_API_KEY=your-n8n-api-key
AIRTABLE_API_KEY=your-airtable-api-key
MCP_AUTH_TOKEN=your-shared-auth-token
EOF
  echo "WARNING: Created .env template - please fill in actual values!"
fi

# Source environment
if [ -f "$MCP_DIR/.env" ]; then
  export $(grep -v '^#' "$MCP_DIR/.env" | xargs)
fi

# Restart PM2 processes
echo "Restarting PM2 processes..."
pm2 delete n8n-mcp 2>/dev/null || true
pm2 delete airtable-mcp 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "Status:"
pm2 status

echo ""
echo "Test endpoints:"
echo "  curl http://localhost:3001/health"
echo "  curl http://localhost:3002/health"
