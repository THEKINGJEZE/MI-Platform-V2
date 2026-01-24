#!/bin/bash
# MI Platform Dashboard Deployment Script
# Deploys to VPS via SSH
#
# Usage: ./deploy.sh
# Or: npm run deploy (from dashboard directory)
#
# Requirements:
# - VPS_SSH_KEY environment variable OR ~/.ssh/id_ed25519 available
# - VPS_HOST set in .env.local (defaults to 72.61.202.117)
# - VPS_USER set in .env.local (defaults to root)
# - VPS_DASHBOARD_PATH set (defaults to /docker/dashboard)

set -e

# Load environment variables
if [ -f .env.local ]; then
    export $(grep -v '^#' .env.local | xargs)
fi

# Defaults
VPS_HOST="${VPS_HOST:-72.61.202.117}"
VPS_USER="${VPS_USER:-root}"
VPS_DASHBOARD_PATH="${VPS_DASHBOARD_PATH:-/docker/dashboard}"

echo "🚀 MI Platform Dashboard Deployment"
echo "===================================="
echo "Target: ${VPS_USER}@${VPS_HOST}:${VPS_DASHBOARD_PATH}"
echo ""

# Determine SSH key to use
SSH_KEY_OPTION=""
if [ -n "$VPS_SSH_KEY_PATH" ] && [ -f "$VPS_SSH_KEY_PATH" ]; then
    SSH_KEY_OPTION="-i $VPS_SSH_KEY_PATH"
    echo "Using SSH key: $VPS_SSH_KEY_PATH"
elif [ -f ~/.ssh/id_ed25519 ]; then
    SSH_KEY_OPTION="-i ~/.ssh/id_ed25519"
    echo "Using SSH key: ~/.ssh/id_ed25519"
elif [ -f ~/.ssh/id_rsa ]; then
    SSH_KEY_OPTION="-i ~/.ssh/id_rsa"
    echo "Using SSH key: ~/.ssh/id_rsa"
else
    echo "No SSH key found. Will use SSH agent or password auth."
fi

echo ""
echo "Step 1: Syncing code to VPS..."
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.env.local' \
    $SSH_KEY_OPTION \
    ./ ${VPS_USER}@${VPS_HOST}:${VPS_DASHBOARD_PATH}/

echo ""
echo "Step 2: Building and restarting container on VPS..."
ssh $SSH_KEY_OPTION ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
cd /docker/dashboard
echo "Pulling latest and rebuilding..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d
echo "Waiting for container to be healthy..."
sleep 10
docker-compose ps
echo "Testing API endpoint..."
curl -s http://localhost:3000/api/decay-alerts | head -c 200
echo ""
ENDSSH

echo ""
echo "Step 3: Verifying deployment..."
sleep 5
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://dashboard.peelplatforms.co.uk/api/decay-alerts)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Deployment successful! API returning 200."
else
    echo "⚠️  API returned HTTP $HTTP_CODE. Check container logs."
fi

echo ""
echo "🏁 Deployment complete!"
echo "Dashboard: https://dashboard.peelplatforms.co.uk"
echo "API test:  https://dashboard.peelplatforms.co.uk/api/decay-alerts"
