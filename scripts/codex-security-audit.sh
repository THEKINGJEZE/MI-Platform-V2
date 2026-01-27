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
   Clawdbot is an autonomous AI agent with WhatsApp, email, and command execution access.
   This is the HIGHEST RISK component. Audit ALL aspects thoroughly.

   a) **Credential Exposure** (Critical):
      - Run: git ls-files clawdbot/config/credentials (MUST be empty)
      - Run: git ls-files clawdbot/config/agents (check for auth-profiles.json, sessions/)
      - Run: git log -p --all -S "privateKeyPem" -- clawdbot/ (check git history)
      - Check config/identity/device.json for privateKeyPem (if present = CRITICAL)
      - Check config/exec-approvals.json for socketToken field
      - Verify .gitignore excludes: credentials/, sessions/, auth-profiles.json, memory/, MEMORY.md

   b) **Command Injection / Exec Approvals** (High):
      - Read clawdbot/config/exec-approvals.json
      - Check allowlist for dangerous patterns:
        * rm -rf, sudo, chmod 777, eval, curl|sh, wget|bash
        * Raw curl without domain restriction
        * Wildcards in paths (*, **)
      - Verify domain-restricted wrappers are used where possible

   c) **Prompt Injection** (High):
      - Review clawdbot/workspace/AGENTS.md for guardrails
      - Check if there are "refuse to..." boundaries
      - Review SOUL.md for exploitable personality traits
      - Check skills for input validation before acting

   d) **Skill Security** (Medium-High):
      - Review ALL skills in clawdbot/workspace/skills/*/SKILL.md
      - Check for hardcoded API keys, tokens, passwords
      - Check webhook URLs for embedded secrets (?token=xxx)
      - Verify skills follow least privilege
      - Check if skills validate inputs before processing

   e) **Data Exposure / Privacy** (Medium):
      - Verify workspace/memory/ is NOT tracked
      - Verify workspace/MEMORY.md is NOT tracked
      - Check workspace/plans/ for sensitive context
      - Check for PII in any tracked files

   f) **Cross-System Access** (Medium):
      - Document what systems Clawdbot can access (Make.com, Outlook, Airtable, WhatsApp)
      - Verify integration credentials are NOT in tracked files
      - Check if access is appropriately scoped

   g) **Supply Chain** (Low):
      - Note Clawdbot npm version: npm list -g clawdbot
      - Flag if severely outdated or known CVEs

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

**Overall Risk Level:** [Low/Medium/High/Critical]

### Credential Exposure
- [ ] .gitignore properly configured
- [ ] No secrets in tracked config files
- [ ] No secrets in git history (checked with git log -S)
- [ ] No privateKeyPem in tracked identity files
- [ ] No OAuth tokens in tracked files

### Command Injection / Exec Approvals
- [ ] No dangerous auto-approved commands (rm -rf, sudo, chmod 777, eval)
- [ ] No raw curl/wget without domain restriction
- [ ] No overly permissive wildcards
- [ ] Domain-restricted wrappers used

### Prompt Injection
- [ ] AGENTS.md has behavioral guardrails
- [ ] Skills validate inputs before acting
- [ ] No obvious injection vectors in SOUL.md

### Skill Security
- [ ] No hardcoded credentials in skill files
- [ ] Webhook URLs don't embed secrets
- [ ] Skills follow least privilege principle
- [ ] All skills reviewed: [list skills checked]

### Data Exposure
- [ ] workspace/memory/ not tracked
- [ ] workspace/MEMORY.md not tracked
- [ ] No PII in tracked workspace files

### Cross-System Access
- [ ] Make.com credentials not exposed
- [ ] Outlook access appropriately scoped
- [ ] Airtable access appropriately scoped

### Issues Found
| Severity | Issue | File | Recommendation |
|----------|-------|------|----------------|
| [Crit/High/Med/Low] | [description] | [path] | [fix] |

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
