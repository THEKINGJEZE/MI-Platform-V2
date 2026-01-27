# Security Audit Report - 2026-01-27

**Auditor**: Codex Security Auditor
**Project**: MI Platform V2
**Scope**: Full repository scan (OWASP Top 10 + platform-specific)

## Executive Summary
Critical secrets are present in tracked files and client-side code, and multiple unauthenticated endpoints/webhooks allow unauthorized actions. Dependency checks could not complete due to blocked npm registry access and must be rerun in a networked environment.

## Critical Issues
- `clawdbot/config/identity/device.json:5` contains `privateKeyPem` in a tracked file and appears in git history. Impact: device identity compromise; requires key rotation and history purge.
- `clawdbot/config/exec-approvals.json:4-6` stores a socket token in a tracked file; `:31` embeds a Make.com webhook URL inside command history. Impact: credential exposure and replay risk.
- `n8n/workflows/send-outreach.json:126-128` contains a hardcoded Authorization token for Make.com. Impact: unauthorized scenario execution if leaked.
- `dashboard/app/email/page.tsx:22-25` hardcodes Make.com webhook URLs in client-side code. Impact: tokens exposed to any browser user.

## High Priority
- **Unauthenticated dashboard API routes** allow read/write actions without auth or rate limiting:
  - `dashboard/app/api/opportunities/route.ts:10`
  - `dashboard/app/api/opportunities/[id]/route.ts:12,43`
  - `dashboard/app/api/opportunities/[id]/dismiss/route.ts:18`
  - `dashboard/app/api/emails/route.ts:11`
  - `dashboard/app/api/emails/[id]/route.ts:11`
  - `dashboard/app/api/forces/route.ts:10`
  - `dashboard/app/api/decay-alerts/route.ts:23`
  - `dashboard/app/api/decay-alerts/[id]/route.ts:18`
  Impact: unauthenticated data access and state changes. Add authentication/authorization and rate limiting.
- **Unauthenticated n8n webhooks** can be triggered by anyone:
  - `n8n/workflows/jobs-receiver.json:9`
  - `n8n/workflows/email-executor.json:13`
  - `n8n/workflows/send-outreach.json:15`
  - `n8n/workflows/wf5-agent-enrichment.json:42`
  Impact: unauthorized data ingestion and action execution. Require auth/signature or IP allowlisting.
- `clawdbot/config/exec-approvals.json:17-25` allowlist permits unrestricted `/usr/bin/curl` and `/opt/homebrew/bin/curl`. Impact: prompt-injection exfiltration risk. Restrict to domain-locked wrappers only.

## Medium Priority
- `.gitignore:1-28` lacks coverage for `.env.*` (beyond `.env.*.local`) and `*.p12`. Risk: accidental secret commits.
- `dashboard/next.config.ts:1-12` has no security headers (CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy). Risk: browser-side hardening gaps.
- Dependency audit could not run due to npm registry DNS failure (`npm audit`/`npm outdated` returned ENOTFOUND). Re-run in a networked environment.

## Low Priority / Informational
- Untracked secret files exist in the working tree: `.env`, `.env.local`, `dashboard/.env.local` contain live API keys/tokens. These are ignored but should be protected and rotated if ever shared or backed up insecurely.
- UI ID generation uses `Math.random()` for non-crypto IDs (`dashboard/components/feedback/toast.tsx:58`, `dashboard/lib/stores/ui-store.ts:126`).

## Clean Areas
- No `dangerouslySetInnerHTML` usage found in dashboard components.
- No SQL query construction patterns (`query(` / `rawQuery(` / `execute(`) found in JS/TS.
- n8n workflows generally use credential references rather than hardcoded tokens (exception: `send-outreach.json`).
- `.env.example` contains placeholder values only.

## OWASP Top 10 Assessment
| Category | Status | Notes |
|----------|--------|-------|
| Injection (SQL, Cmd, XSS) | WARN | No SQL/XSS found; raw curl allowlist increases command-injection risk. |
| Broken Authentication | FAIL | Dashboard API routes and n8n webhooks lack authentication. |
| Sensitive Data Exposure | FAIL | Private key and tokens committed in tracked files; client-side webhook URLs. |
| Security Misconfiguration | WARN | Missing security headers; weak .gitignore coverage. |
| Insecure Dependencies | WARN | npm audit/outdated failed (registry unreachable). |
| Cryptographic Failures | PASS | No weak hashing or crypto misuse found. |
| SSRF | WARN | No direct user-controlled URLs found; unauthenticated webhooks can trigger outbound calls. |
| Insecure Deserialization | PASS | No unsafe deserialization patterns found. |
| Insufficient Logging | WARN | No auth logging; limited security event logging in workflows. |
| API Security | FAIL | Unauthenticated and unrate-limited API routes. |

## Clawdbot Security Assessment

**Overall Risk Level:** Critical

### Credential Exposure
- [ ] .gitignore properly configured
- [ ] No secrets in tracked config files
- [ ] No secrets in git history (checked with git log -S)
- [ ] No privateKeyPem in tracked identity files
- [ ] No OAuth tokens in tracked files

### Command Injection / Exec Approvals
- [ ] No dangerous auto-approved commands (rm -rf, sudo, chmod 777)
- [ ] No raw curl/wget without domain restriction
- [x] No overly permissive wildcards
- [x] Domain-restricted wrappers used

### Prompt Injection
- [x] AGENTS.md has behavioral guardrails
- [x] Skills validate inputs before acting (policy-level safeguards documented)
- [x] No obvious injection vectors in SOUL.md

### Skill Security
- [x] No hardcoded credentials in skill files
- [x] Webhook URLs don't embed secrets
- [x] Skills follow least privilege principle
- [x] All skills reviewed: email-processor, hubspot, outlook-calendar, outlook-email

### Data Exposure
- [x] workspace/memory/ not tracked
- [x] workspace/MEMORY.md not tracked
- [x] No PII found in tracked workspace files

### Cross-System Access
- [ ] Make.com credentials not exposed
- [ ] Outlook access appropriately scoped
- [ ] Airtable access appropriately scoped

### Issues Found
| Severity | Issue | File | Recommendation |
|----------|-------|------|----------------|
| Critical | Private key tracked + in git history | `clawdbot/config/identity/device.json:5` | Rotate device keys, remove from repo, purge history, add to `clawdbot/.gitignore`. |
| Critical | Socket token + Make.com webhook URL in tracked exec approvals | `clawdbot/config/exec-approvals.json:4-6`, `:31` | Split allowlist vs runtime state; remove tokens from VCS; rotate tokens. |
| High | Unrestricted curl allowlist | `clawdbot/config/exec-approvals.json:17-25` | Remove raw curl from allowlist; require domain-restricted wrappers only. |

## n8n Workflow Assessment
- [ ] No hardcoded credentials in workflow JSON (hardcoded token in `send-outreach.json`)
- [x] Code nodes use safe patterns (no eval/exec)
- [x] Expression injection risks checked (no user-controlled URLs found)
- [ ] Webhook authentication in place (webhook nodes are unauthenticated)
