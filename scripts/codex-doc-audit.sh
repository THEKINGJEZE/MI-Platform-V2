#!/bin/bash
# =============================================================================
# Codex Document Drift Audit Runner
# =============================================================================
#
# Runs a comprehensive document drift audit using OpenAI Codex CLI
# to verify document integrity and alignment.
#
# Usage:
#   ./scripts/codex-doc-audit.sh
#
# Output:
#   docs/audits/codex-doc-audit-YYYY-MM-DD.md
#
# Prerequisites:
#   - codex CLI installed: npm i -g @openai/codex
#   - Authenticated: codex login
#
# =============================================================================

set -e

# Configuration
PROJECT_DIR="/Users/jamesjeram/Documents/MI-Platform-V2"
DATE=$(date +%Y-%m-%d)
OUTPUT_FILE="docs/audits/codex-doc-audit-${DATE}.md"

echo "==================================="
echo "Codex Document Drift Audit"
echo "Date: ${DATE}"
echo "Output: ${OUTPUT_FILE}"
echo "==================================="
echo ""

# Ensure we're in project directory
cd "${PROJECT_DIR}"

# Run Codex with strict read-only settings
codex \
  -c 'sandbox_mode="read-only"' \
  -c 'approval_policy="never"' \
  -c 'model_reasoning_effort="high"' \
  "You are the Security Auditor for MI Platform V2. Read AGENTS.md first.

Run a comprehensive document drift audit:

1. **Read Core Documents**
   - ANCHOR.md (mission - immutable)
   - docs/DEPENDENCY-MAP.md (single source of truth rules)
   - docs/GUARDRAILS.md (architectural rules G-001 to G-015)
   - ROADMAP.md (phase definitions)
   - STATUS.md (current state)
   - DECISIONS.md (active decisions)

2. **Phase Alignment Check**
   - What phase does STATUS.md say we're in?
   - What phase does ROADMAP.md 'Current Phase' indicate?
   - Do they match?

3. **Single Source of Truth Violations**
   - Per docs/DEPENDENCY-MAP.md, each piece of info should live in ONE place
   - Check for duplicated information between:
     - CLAUDE.md and README.md
     - STATUS.md and ROADMAP.md
     - specs/*.md and ROADMAP.md

4. **Guardrail Reference Validation**
   - Scan all files in specs/ for G-XXX references
   - Verify each referenced guardrail exists in docs/GUARDRAILS.md

5. **File Reference Validation**
   - Check @references in markdown files point to existing files
   - Check markdown links [text](path) point to existing files

6. **Document Size Limits**
   - STATUS.md should be <100 lines
   - DECISIONS.md should have ≤20 active decisions
   - CLAUDE.md should be lean (~80 lines)

7. **Spec Compliance**
   - Do specs in specs/ have Pre-Flight Checklists?
   - Do they reference ROADMAP.md acceptance criteria?

8. **ANCHOR.md Alignment**
   - Is the current work serving the Monday morning experience?
   - Does current phase reduce cognitive load?

Write your findings to: ${OUTPUT_FILE}

Use this format:
\`\`\`markdown
# Document Drift Audit Report - ${DATE}

**Auditor**: Codex Security Auditor
**Project**: MI Platform V2
**Scope**: Documentation integrity check

## Executive Summary
[1-2 sentence overview]

## Phase Alignment
- STATUS.md phase: [X]
- ROADMAP.md phase: [Y]
- Status: [Match/Mismatch]

## Single Source of Truth Violations
[List any duplicated information]

## Invalid Guardrail References
[G-XXX references that don't exist]

## Broken File References
[Links/references to non-existent files]

## Document Size Issues
[Files exceeding limits]

## Spec Compliance Issues
[Specs missing required sections]

## ANCHOR.md Alignment Assessment
[Is the project on track with the mission?]

## Recommendations
[Prioritized fixes]
\`\`\`"

echo ""
echo "==================================="
echo "Audit complete. Report saved to:"
echo "${OUTPUT_FILE}"
echo "==================================="
