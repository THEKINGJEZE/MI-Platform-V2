#!/bin/bash
# Post-ROADMAP Edit Hook — Detect phase completion attempts
# Warns if a phase appears to be marked complete without James's confirmation

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
ROADMAP_FILE="$PROJECT_ROOT/ROADMAP.md"

cd "$PROJECT_ROOT"

# Read the current ROADMAP.md content
if [ ! -f "$ROADMAP_FILE" ]; then
    exit 0
fi

CONTENT=$(cat "$ROADMAP_FILE")

# Check for phase completion patterns
# Look for "### Phase" headers followed by "✅" or "COMPLETE" on the same or next line
if echo "$CONTENT" | grep -E "^### Phase.*✅|^### Phase.*COMPLETE" > /dev/null 2>&1; then
    # Check if this is a recently added completion marker
    # We can't easily detect what changed, so we warn on any phase marked complete

    # Count completed phases
    COMPLETED_PHASES=$(echo "$CONTENT" | grep -c "^### Phase.*✅" 2>/dev/null || echo "0")

    if [ "$COMPLETED_PHASES" -gt 0 ]; then
        echo "" >&2
        echo "⚠️  PHASE COMPLETION DETECTED" >&2
        echo "" >&2
        echo "ROADMAP.md shows $COMPLETED_PHASES phase(s) marked as complete." >&2
        echo "" >&2
        echo "REMINDER: Phases require James's strategic confirmation." >&2
        echo "" >&2
        echo "If you just marked a phase complete:" >&2
        echo "  1. Verify all specs in the phase are done" >&2
        echo "  2. Verify acceptance criteria are met" >&2
        echo "  3. Output: 'Phase [X] specs complete. Ready for verification.'" >&2
        echo "  4. Wait for James to confirm before marking ✅" >&2
        echo "" >&2
        echo "See: CLAUDE.md — Completion Rules" >&2
        echo "" >&2
    fi
fi

# Always exit 0 - this is a warning, not a block
exit 0
