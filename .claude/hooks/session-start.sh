#!/bin/bash
# Session Start Hook — Reinject critical context
# Runs every time Claude Code starts a new session

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  MI PLATFORM — Session Context Loaded"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Current status
if [ -f "STATUS.md" ]; then
    echo "📍 CURRENT STATUS:"
    grep -E "^\*\*Phase\*\*:|^\*\*Session Goal\*\*:|^## 🎯|^>|^- \[ \].*ACTIVE" STATUS.md | head -8
    echo ""
fi

# Document hygiene check
echo "📊 DOCUMENT HEALTH:"
if [ -f "STATUS.md" ]; then
    STATUS_LINES=$(wc -l < STATUS.md | tr -d ' ')
    if [ "$STATUS_LINES" -gt 100 ]; then
        echo "   ⚠️  STATUS.md: $STATUS_LINES lines (max 100) — needs cleanup"
    else
        echo "   ✅ STATUS.md: $STATUS_LINES lines"
    fi
fi

if [ -f "DECISIONS.md" ]; then
    # Count actual decisions (lines starting with #### that aren't headers)
    DECISION_COUNT=$(grep -c "^#### [A-Z][0-9]*:" DECISIONS.md 2>/dev/null || echo "0")
    if [ "$DECISION_COUNT" -gt 20 ]; then
        echo "   ⚠️  DECISIONS.md: $DECISION_COUNT decisions (max 20) — needs archiving"
    else
        echo "   ✅ DECISIONS.md: $DECISION_COUNT active decisions"
    fi
fi
echo ""

# Consistency check
echo "🔍 CONSISTENCY CHECK:"
if [ -f "scripts/consistency-check.cjs" ]; then
    node scripts/consistency-check.cjs 2>/dev/null
    if [ $? -ne 0 ]; then
        echo "   ⚠️  Run 'node scripts/consistency-check.cjs' for details"
    fi
else
    echo "   ℹ️  consistency-check.cjs not found (run from project root)"
fi
echo ""

# Recently modified files
echo "📝 RECENTLY MODIFIED (last 24h):"
find . -type f \( -name "*.js" -o -name "*.json" -o -name "*.md" \) \
    -not -path "./node_modules/*" \
    -mtime -1 2>/dev/null | head -5
echo ""

# Git status if available
if [ -d ".git" ]; then
    CHANGES=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
    if [ "$CHANGES" -gt 0 ]; then
        echo "⚠️  UNCOMMITTED CHANGES: $CHANGES files"
        git status --porcelain 2>/dev/null | head -3
        echo ""
    fi
fi

# Mission reminder
echo "🎯 MISSION (from ANCHOR.md):"
echo "   • 3-5 ready-to-send leads every Monday"
echo "   • ≤15 min review time"
echo "   • Reduce cognitive load, not increase it"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  📖 Read ANCHOR.md if uncertain | 📝 Update STATUS.md when done"
echo "═══════════════════════════════════════════════════════════════"
echo ""
