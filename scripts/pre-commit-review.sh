#!/bin/bash
# Pre-commit hook: Light Claude review of staged changes
#
# This hook performs a quick review of staged changes using Claude in headless mode.
# It focuses on guardrail violations and obvious issues.
#
# To enable:
#   ln -s ../../scripts/pre-commit-review.sh .git/hooks/pre-commit
#
# To bypass for a single commit:
#   git commit --no-verify -m "message"

set -e

# Skip if no staged changes
STAGED=$(git diff --cached --name-only)
if [ -z "$STAGED" ]; then
    exit 0
fi

# Skip for trivial commits (only .md files or single file changes)
STAGED_COUNT=$(echo "$STAGED" | wc -l | tr -d ' ')
ONLY_DOCS=$(echo "$STAGED" | grep -v '\.md$' | wc -l | tr -d ' ')

if [ "$STAGED_COUNT" -eq 1 ] && [ "$ONLY_DOCS" -eq 0 ]; then
    # Single markdown file - skip review
    exit 0
fi

# Check if claude is available
if ! command -v claude &> /dev/null; then
    echo "⚠️  Claude not found, skipping pre-commit review"
    exit 0
fi

# Skip if running inside a Claude session (nested invocation)
if [ -n "$CLAUDE_SESSION" ] || [ -n "$ANTHROPIC_API_KEY" ]; then
    # Check if we're in an interactive Claude session
    if pgrep -f "claude" > /dev/null 2>&1; then
        echo "⚠️  Inside Claude session, skipping nested review"
        exit 0
    fi
fi

# Get the diff
DIFF=$(git diff --cached)

# If diff is too large (>50KB), skip to avoid timeout
DIFF_SIZE=${#DIFF}
if [ $DIFF_SIZE -gt 51200 ]; then
    echo "⚠️  Diff too large ($DIFF_SIZE bytes), skipping Claude review"
    exit 0
fi

echo "🔍 Running Claude pre-commit review..."

# Run Claude review in headless mode with timeout
# Use 45s timeout to allow for API latency
REVIEW=$(timeout 45 claude -p "Quick pre-commit review. Report ONLY critical issues.

Files changed: $STAGED

Check for:
1. Security issues (exposed credentials, injection vulnerabilities)
2. Breaking changes to ANCHOR.md (should NEVER be modified)
3. Obvious bugs (null references, infinite loops)

If no critical issues found, respond with just: OK

If issues found, respond with:
BLOCK: [one-line description of most critical issue]

Diff:
$DIFF" 2>&1) || REVIEW="TIMEOUT"

# Handle response
if [ "$REVIEW" = "TIMEOUT" ]; then
    echo "⚠️  Review timed out, proceeding with commit"
    exit 0
fi

if echo "$REVIEW" | grep -q "^BLOCK:"; then
    echo "❌ Pre-commit review failed:"
    echo "$REVIEW"
    echo ""
    echo "Use 'git commit --no-verify' to bypass this check"
    exit 1
fi

if echo "$REVIEW" | grep -q "^OK"; then
    echo "✅ Pre-commit review passed"
    exit 0
fi

# Unknown response - log warning but allow commit
echo "⚠️  Unexpected review response, proceeding with commit"
echo "$REVIEW" | head -5
exit 0
