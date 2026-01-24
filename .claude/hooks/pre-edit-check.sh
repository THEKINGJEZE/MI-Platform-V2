#!/bin/bash
# Pre-edit enforcement hook
# 1. BLOCKS spec creation without /prep-spec context (hard gate)
# 2. Warns about workflow/schema/prompt edits (agent reminders)
# 3. Warns if critical cross-document issues exist

WARNINGS_LOG=".claude/warnings.log"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
CONSISTENCY_CHECK="$PROJECT_ROOT/scripts/consistency-check.cjs"
CONTEXT_FILE="$PROJECT_ROOT/specs/NEXT-CONTEXT.md"

cd "$PROJECT_ROOT"

# Read JSON from stdin (Claude Code passes hook input as JSON)
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('tool_input',{}).get('file_path',''))" 2>/dev/null)

# ============================================
# SPEC CREATION GATE (Hard enforcement)
# ============================================
# Block creation of new specs without running /prep-spec first
if [[ "$FILE_PATH" =~ specs/SPEC-.*\.md ]]; then
    if [ ! -f "$CONTEXT_FILE" ]; then
        echo "SPEC CREATION BLOCKED" >&2
        echo "" >&2
        echo "No context brief found at: specs/NEXT-CONTEXT.md" >&2
        echo "" >&2
        echo "Before creating a spec, you MUST:" >&2
        echo "1. Run: /prep-spec <topic>" >&2
        echo "2. Review the generated NEXT-CONTEXT.md" >&2
        echo "3. Then create the spec" >&2
        echo "" >&2
        echo "See: .claude/rules/spec-creation.md" >&2
        exit 2  # Exit code 2 blocks and shows stderr to Claude
    fi

    # Check if context is stale (>24h old)
    if [ "$(uname)" = "Darwin" ]; then
        CONTEXT_AGE=$(($(date +%s) - $(stat -f%m "$CONTEXT_FILE")))
    else
        CONTEXT_AGE=$(($(date +%s) - $(stat -c%Y "$CONTEXT_FILE")))
    fi

    if [ "$CONTEXT_AGE" -gt 86400 ]; then
        echo "WARNING: Context brief is $(($CONTEXT_AGE / 3600)) hours old." >&2
        echo "Consider re-running /prep-spec <topic> for fresh context." >&2
        # Warning only, don't block
    fi
fi

# ============================================
# WORKFLOW EDIT REMINDER (H1 - Warning only)
# ============================================
# Remind to use workflow-builder agent for n8n workflow changes
if [[ "$FILE_PATH" =~ n8n/workflows/.*\.json ]]; then
    # Extract spec number from filename if present (e.g., wf5-agent-enrichment -> 011)
    WORKFLOW_NAME=$(basename "$FILE_PATH" .json)

    echo "" >&2
    echo "⚠️  WORKFLOW EDIT DETECTED" >&2
    echo "" >&2
    echo "You are editing: $WORKFLOW_NAME" >&2
    echo "" >&2
    echo "IMPLEMENTATION PROTOCOL:" >&2
    echo "1. Use workflow-builder agent for changes" >&2
    echo "2. Ensure IMPL-XXX.md tracker exists" >&2
    echo "3. Follow 6-stage framework: Parse → Audit → Plan → Build → Verify → Document" >&2
    echo "4. Stage 5 (Verify) cannot be skipped" >&2
    echo "" >&2
    echo "Testing: Use n8n MCP (n8n_test_workflow) + Airtable verification" >&2
    echo "Test data: node scripts/inject-test-signal.cjs --type=<type> --force=<force>" >&2
    echo "" >&2
    echo "See: .claude/rules/implementation-stages.md" >&2
    echo "See: .claude/rules/workflow-testing.md" >&2
    echo "" >&2
    # Warning only, don't block
fi

# ============================================
# AIRTABLE SCHEMA REMINDER (H2 - Warning only)
# ============================================
# Remind to use airtable-architect agent for schema changes
if [[ "$FILE_PATH" =~ airtable/.*\.json ]]; then
    echo "" >&2
    echo "⚠️  AIRTABLE SCHEMA EDIT DETECTED" >&2
    echo "" >&2
    echo "You are editing Airtable schema/seed files." >&2
    echo "Remember: Use the airtable-architect agent for schema changes." >&2
    echo "" >&2
    echo "Agent provides: G-011 upsert enforcement, batch patterns" >&2
    echo "See: CLAUDE.md — Mandatory Agent Usage" >&2
    echo "" >&2
    # Warning only, don't block
fi

# ============================================
# PROMPT EDIT REMINDER (H3 - Warning only)
# ============================================
# Remind about messaging structure guardrails (G-012, G-015)
if [[ "$FILE_PATH" =~ prompts/.*\.md ]]; then
    echo "" >&2
    echo "⚠️  PROMPT EDIT DETECTED" >&2
    echo "" >&2
    echo "Ensure sales prompts follow structure (G-015):" >&2
    echo "  1. Hook (reference the signal)" >&2
    echo "  2. Bridge (acknowledge challenge)" >&2
    echo "  3. Value (Peel's outcome-based approach)" >&2
    echo "  4. CTA (request conversation)" >&2
    echo "" >&2
    echo "Never lead with 'we have candidates' (G-012)" >&2
    echo "See: docs/SALES-STRATEGY.md — Messaging Framework" >&2
    echo "" >&2
    # Warning only, don't block
fi

# ============================================
# EXISTING CONSISTENCY CHECK (Soft warning)
# ============================================
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

# Always exit 0 for non-spec files - we warn but don't block
exit 0
