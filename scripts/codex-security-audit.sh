#!/bin/bash
# =============================================================================
# Codex Security Audit Runner
# =============================================================================
#
# Runs a comprehensive security audit using OpenAI Codex CLI
# in read-only sandbox mode.
#
# Usage:
#   ./scripts/codex-security-audit.sh
#
# Output:
#   docs/audits/codex-security-audit-YYYY-MM-DD.md
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
OUTPUT_FILE="docs/audits/codex-security-audit-${DATE}.md"

echo "==================================="
echo "Codex Security Audit"
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

Run a comprehensive security audit:

1. **Secret Scanning**
   - Search all files for hardcoded API keys, tokens, passwords
   - Check for patterns like: API_KEY, SECRET, TOKEN, PASSWORD, Bearer
   - Look in: *.js, *.ts, *.json, *.md, *.sh files

2. **Git History Check**
   - Check if .env files have ever been committed
   - Look for sensitive data in recent commits

3. **.gitignore Review**
   - Verify .env, .env.local, credentials/, *.pem, *.key are ignored
   - Check for missing patterns that should be ignored

4. **Dependency Vulnerabilities**
   - Run: npm audit --json 2>/dev/null | head -100 (capture output)
   - Run: npm outdated 2>/dev/null (check for outdated packages)
   - Review package.json and package-lock.json for known vulnerable packages
   - Check dashboard/package.json if it exists (Next.js frontend)
   - Note any critical/high severity vulnerabilities
   - Check for outdated critical dependencies (especially security-related)

5. **Sensitive Directories**
   - Check clawdbot/config/ for exposed credentials
   - Check n8n/workflows/ for embedded API keys
   - Verify credentials/ folder is git-ignored

6. **Code Security Patterns**
   - Look for SQL injection risks (raw queries)
   - Look for XSS vulnerabilities (unescaped user input)
   - Look for command injection (exec, spawn with user input)

7. **CLAWDBOT SECURITY AUDIT (Critical)**
   Clawdbot is an autonomous AI agent - requires extra scrutiny:

   a) Credential Protection:
      - Run: git ls-files clawdbot/config/credentials (should be empty)
      - Run: git ls-files clawdbot/config/agents (check for auth-profiles.json)
      - Verify clawdbot/.gitignore excludes credentials/, sessions/, auth-profiles.json

   b) Exec Approvals Review:
      - Read clawdbot/config/exec-approvals.json (this IS tracked)
      - Check for dangerous auto-approved commands
      - Verify webhook URLs don't expose secrets in the URL itself

   c) Skill Security:
      - Review clawdbot/workspace/skills/*/SKILL.md for hardcoded credentials
      - Check for API keys or tokens in skill files

   d) Memory/Identity:
      - Verify workspace/memory/ and workspace/MEMORY.md are NOT in git
      - Check config/identity/device.json for exposed secrets (it IS tracked)

   e) Tracked Sensitive Files:
      - config/exec-approvals.json - review for safety
      - config/identity/device.json - check for secrets
      - workspace/AGENTS.md, SOUL.md - check for leaked context

Write your findings to: ${OUTPUT_FILE}

Use this format:
\`\`\`markdown
# Security Audit Report - ${DATE}

**Auditor**: Codex Security Auditor
**Project**: MI Platform V2
**Scope**: Full repository scan

## Executive Summary
[1-2 sentence overview]

## Critical Issues
[Issues requiring immediate attention]

## High Priority
[Issues to fix this week]

## Medium Priority
[Issues to address soon]

## Low Priority / Informational
[Nice-to-have improvements]

## Clean Areas
[Areas with no issues found]

## Clawdbot Security Assessment

### Credential Protection
- [ ] No credentials in git (git ls-files clawdbot/config/credentials = empty)
- [ ] No OAuth tokens in git
- [ ] .gitignore properly configured

### Exec Approvals
- [ ] No dangerous auto-approved commands (rm -rf, sudo, etc.)
- [ ] Webhook URLs don't expose secrets

### Skills
- [ ] No hardcoded credentials in skill files

### Risk Level: [Low/Medium/High/Critical]

## Dependency Audit

### npm audit results
- Critical: [count]
- High: [count]
- Moderate: [count]
- Low: [count]

### Outdated packages
[List any outdated packages, especially security-critical ones]

## Recommendations
[Prioritized list of actions]
\`\`\`"

echo ""
echo "==================================="
echo "Audit complete. Report saved to:"
echo "${OUTPUT_FILE}"
echo "==================================="
