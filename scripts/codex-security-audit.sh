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
  "You are the Security Auditor for MI Platform V2. Read AGENTS.md first for comprehensive audit instructions.

Run a comprehensive security audit covering:

1. **Secret Scanning** (Critical)
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
   - Run: npm audit --json 2>/dev/null | head -100
   - Run: npm outdated 2>/dev/null
   - Check dashboard/package.json if it exists
   - Note any critical/high severity vulnerabilities

5. **Sensitive Directories**
   - Check clawdbot/config/ for exposed credentials
   - Check n8n/workflows/ for embedded API keys
   - Verify credentials/ folder is git-ignored

6. **OWASP Top 10 Coverage**
   See AGENTS.md Section 1a for full details:
   - 1a.1: Secrets & Credential Exposure
   - 1a.2: Injection Vulnerabilities (SQL, command, XSS, template, path traversal)
   - 1a.3: Broken Authentication & Session Management
   - 1a.4: Sensitive Data Exposure
   - 1a.5: Security Misconfiguration (CORS, headers, cookies)
   - 1a.6: Insecure Dependencies
   - 1a.7: Cryptographic Failures
   - 1a.8: SSRF
   - 1a.9: Insecure Deserialization
   - 1a.10: Insufficient Logging & Monitoring
   - 1a.11: API Security

7. **CLAWDBOT SECURITY AUDIT (Critical)**
   See AGENTS.md Section 1b for full details:
   - 1b.1: Credential Exposure (git ls-files, git log -S)
   - 1b.2: Command Injection / Exec Approvals
   - 1b.3: Prompt Injection / Agent Instructions
   - 1b.4: Skill Security
   - 1b.5: Data Exposure / Privacy
   - 1b.6: Cross-System Access Control
   - 1b.7: Denial of Service / Resource Abuse
   - 1b.8: Supply Chain / Dependency Risk

8. **n8n Workflow Security**
   See AGENTS.md Section 1c:
   - Credential exposure in workflow JSON
   - Code node security
   - Expression injection
   - Webhook security
   - Error handling

9. **Dashboard Security (Next.js)**
   See AGENTS.md Section 1d:
   - API route security
   - Client-side security
   - Environment variables
   - Authentication

Write your findings to: ${OUTPUT_FILE}

Use this format:
\`\`\`markdown
# Security Audit Report - ${DATE}

**Auditor**: Codex Security Auditor
**Project**: MI Platform V2
**Scope**: Full repository scan (OWASP Top 10 + Platform-specific)

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

## OWASP Top 10 Assessment
| Category | Status | Notes |
|----------|--------|-------|
| Injection (SQL, Cmd, XSS) | ✅/⚠️/❌ | |
| Broken Authentication | ✅/⚠️/❌ | |
| Sensitive Data Exposure | ✅/⚠️/❌ | |
| Security Misconfiguration | ✅/⚠️/❌ | |
| Insecure Dependencies | ✅/⚠️/❌ | |
| Cryptographic Failures | ✅/⚠️/❌ | |
| SSRF | ✅/⚠️/❌ | |
| Insecure Deserialization | ✅/⚠️/❌ | |
| Insufficient Logging | ✅/⚠️/❌ | |
| API Security | ✅/⚠️/❌ | |

## Clawdbot Security Assessment

**Overall Risk Level:** [Low/Medium/High/Critical]

### Credential Exposure
- [ ] .gitignore properly configured
- [ ] No secrets in tracked config files
- [ ] No secrets in git history (checked with git log -S)
- [ ] No privateKeyPem in tracked identity files
- [ ] No OAuth tokens in tracked files

### Command Injection / Exec Approvals
- [ ] No dangerous auto-approved commands (rm -rf, sudo, chmod 777)
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

## n8n Workflow Assessment
- [ ] No hardcoded credentials in workflow JSON
- [ ] Code nodes use safe patterns
- [ ] Expression injection risks checked
- [ ] Webhook authentication in place
- [ ] Error handling doesn't leak data

## Dashboard Assessment
- [ ] API routes require authentication
- [ ] No client-side secrets
- [ ] NEXT_PUBLIC_* vars are safe
- [ ] XSS protections in place
- [ ] Redirects validated

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
