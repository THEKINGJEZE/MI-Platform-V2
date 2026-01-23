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

# Completion verification
echo "✅ COMPLETION VERIFICATION:"
echo "   If this session marked anything complete in ROADMAP.md:"
echo ""
echo "   □ Spec marked complete? → Verify acceptance criteria passed, testing plan executed"
echo "   □ Phase marked complete? → STOP! Phases require strategic verification in Chat first."
echo "     → Output: 'Phase [X] specs complete. Ready for strategic verification in Chat.'"
echo "     → Do NOT mark phase complete until James confirms from Chat."
echo ""

# ============================================
# GIT UNCOMMITTED CHANGES CHECK (M1)
# ============================================
# Warn if there are uncommitted changes before compacting
GIT_STATUS=$(git status --porcelain 2>/dev/null)
if [ -n "$GIT_STATUS" ]; then
    CHANGE_COUNT=$(echo "$GIT_STATUS" | wc -l | tr -d ' ')
    echo "⚠️  UNCOMMITTED CHANGES DETECTED ($CHANGE_COUNT files)"
    echo ""
    echo "   You have uncommitted changes:"
    echo "$GIT_STATUS" | head -10 | sed 's/^/   /'
    if [ "$CHANGE_COUNT" -gt 10 ]; then
        echo "   ... and $(($CHANGE_COUNT - 10)) more"
    fi
    echo ""
    echo "   Consider committing before compacting to avoid losing work context."
    echo ""
else
    echo "✅ Git working tree is clean"
    echo ""
fi
