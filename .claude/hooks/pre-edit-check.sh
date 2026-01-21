#!/bin/bash
# Pre-edit enforcement hook
# Warns if critical cross-document issues exist
# Does not block (hooks can't do interactive prompts)

WARNINGS_LOG=".claude/warnings.log"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
CONSISTENCY_CHECK="$PROJECT_ROOT/scripts/consistency-check.cjs"

cd "$PROJECT_ROOT"

# Only run facts check (not file references - too noisy)
if [ -f "$CONSISTENCY_CHECK" ]; then
    # Run consistency check with facts-only mode
    RESULT=$(node "$CONSISTENCY_CHECK" --facts-only 2>/dev/null)
    EXIT_CODE=$?

    if [ $EXIT_CODE -ne 0 ]; then
        echo ""
        echo "========================================"
        echo "  CONSISTENCY WARNING"
        echo "========================================"
        echo "$RESULT"
        echo ""
        echo "Proceeding with edit. Warning logged to $WARNINGS_LOG"
        echo "========================================"
        echo ""

        # Log the bypass
        mkdir -p "$(dirname "$WARNINGS_LOG")"
        echo "$(date -Iseconds) | BYPASS | $RESULT" >> "$WARNINGS_LOG"
    fi
fi

# Always exit 0 - we warn but don't block
exit 0
