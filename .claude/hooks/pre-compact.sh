#!/bin/bash
# Pre-Compact Hook — Force state capture before context compression
# Runs before /compact to prevent information loss

echo ""
echo "⚠️  COMPACTING CONTEXT — Verify state is captured"
echo ""

# Check STATUS.md freshness
if [ -f "STATUS.md" ]; then
    # Get modification time in minutes
    if [[ "$OSTYPE" == "darwin"* ]]; then
        MODIFIED=$(stat -f %m STATUS.md)
    else
        MODIFIED=$(stat -c %Y STATUS.md)
    fi
    NOW=$(date +%s)
    AGE=$(( (NOW - MODIFIED) / 60 ))
    
    if [ "$AGE" -gt 30 ]; then
        echo "⛔ STATUS.md last updated $AGE minutes ago"
        echo "   → Update STATUS.md before compacting!"
        echo ""
    else
        echo "✅ STATUS.md updated recently ($AGE min ago)"
    fi
else
    echo "⛔ STATUS.md not found!"
    echo "   → Create STATUS.md before compacting"
fi

echo ""
echo "📋 BEFORE COMPACTING, ENSURE:"
echo "   □ What was accomplished is in STATUS.md"
echo "   □ Current blockers are noted"
echo "   □ Next action is clearly defined"
echo "   □ Decisions logged in DECISIONS.md (if any)"
echo ""
