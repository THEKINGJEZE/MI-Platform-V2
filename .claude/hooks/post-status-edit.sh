#!/bin/bash
# Post-STATUS.md edit hook
# Checks if phase changed and syncs to CLAUDE.md

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
SYNC_SCRIPT="$PROJECT_ROOT/scripts/sync-phase.cjs"

cd "$PROJECT_ROOT"

# Run sync script
if [ -f "$SYNC_SCRIPT" ]; then
    node "$SYNC_SCRIPT"
fi

exit 0
