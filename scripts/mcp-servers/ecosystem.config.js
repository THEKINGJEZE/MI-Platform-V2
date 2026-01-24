/**
 * PM2 Ecosystem Configuration for MCP Servers
 *
 * Deploy to VPS with: pm2 start ecosystem.config.js
 *
 * Environment variables required on VPS:
 * - N8N_API_URL: Your n8n instance URL
 * - N8N_API_KEY: Your n8n API key
 * - AIRTABLE_API_KEY: Your Airtable API key
 * - MCP_AUTH_TOKEN: Shared auth token for all MCP servers
 */
module.exports = {
  apps: [
    {
      name: 'n8n-mcp',
      script: 'n8n-http-wrapper.js',
      cwd: '/docker/mcp-servers',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
        N8N_MCP_PORT: 3001,
        // These will be read from VPS environment or .env file
        N8N_API_URL: process.env.N8N_API_URL,
        N8N_API_KEY: process.env.N8N_API_KEY,
        MCP_AUTH_TOKEN: process.env.MCP_AUTH_TOKEN,
        LOG_LEVEL: 'info'
      }
    },
    {
      name: 'airtable-mcp',
      script: 'airtable-http-wrapper.js',
      cwd: '/docker/mcp-servers',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
        AIRTABLE_MCP_PORT: 3002,
        // These will be read from VPS environment or .env file
        AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,
        MCP_AUTH_TOKEN: process.env.MCP_AUTH_TOKEN,
        LOG_LEVEL: 'info'
      }
    }
  ]
};
