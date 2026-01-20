#!/bin/bash
# Deploy MI Dashboard to VPS
#
# Usage: ./deploy.sh
#
# Prerequisites on VPS:
#   - Node.js 18+ installed
#   - PM2 installed globally (npm install -g pm2)
#   - nginx configured for dashboard.peelplatforms.co.uk
#   - /var/www/dashboard.peelplatforms.co.uk directory exists

set -e

# Configuration
VPS_USER="root"
VPS_HOST="72.61.202.117"
REMOTE_DIR="/var/www/dashboard.peelplatforms.co.uk"
APP_NAME="mi-dashboard"

echo "=== MI Dashboard Deployment ==="
echo ""

# Step 1: Build locally
echo "[1/4] Building production bundle..."
npm run build

# Step 2: Sync files to VPS
echo "[2/4] Syncing files to VPS..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.env.local' \
  --exclude '.git' \
  ./ ${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/

# Step 3: Install dependencies on VPS
echo "[3/4] Installing dependencies on VPS..."
ssh ${VPS_USER}@${VPS_HOST} "cd ${REMOTE_DIR} && npm install --production"

# Step 4: Restart PM2 process
echo "[4/4] Restarting PM2 process..."
ssh ${VPS_USER}@${VPS_HOST} "cd ${REMOTE_DIR} && pm2 restart ${APP_NAME} || pm2 start ecosystem.config.js"

echo ""
echo "=== Deployment Complete ==="
echo "Dashboard: https://dashboard.peelplatforms.co.uk"
