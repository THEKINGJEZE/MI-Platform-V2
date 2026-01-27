# Codex Activity Log

This file tracks all Codex audit activities for coordination with Claude Code and project visibility.

**Claude Code reads this file at session start** to know what Codex has done.

---

## Pending Remediation (For Claude Code to Act On)

| Priority | Issue | Status | Report |
|----------|-------|--------|--------|
| P0 | `device.json` private key in git history | **OPEN** | codex-orientation.md |
| P0 | Rotate Clawdbot device keypair | **OPEN** | codex-orientation.md |
| P0 | Add `device.json` to .gitignore | **OPEN** | codex-orientation.md |
| P0 | Hardcoded Make.com token in `n8n/workflows/send-outreach.json` | **OPEN** | codex-security-audit-2026-01-27.md |
| P0 | Client-side Make.com webhook URLs in `dashboard/app/email/page.tsx` | **OPEN** | codex-security-audit-2026-01-27.md |
| P0 | Exec-approvals socket token + webhook URL in tracked file | **OPEN** | codex-security-audit-2026-01-27.md |
| P1 | Split exec-approvals.json (allowlist vs runtime) | **OPEN** | codex-orientation.md |
| P1 | Unauthenticated dashboard API routes | **OPEN** | codex-security-audit-2026-01-27.md |
| P1 | Unauthenticated n8n webhooks | **OPEN** | codex-security-audit-2026-01-27.md |
| P2 | Restrict raw curl in exec allowlist | **OPEN** | codex-orientation.md |
| P2 | Dashboard: 5 high-severity npm vulnerabilities (d3-color ReDoS) | **OPEN** | codex-activity-log.md |
| P2 | Re-run npm audit/outdated (registry DNS failure) | **OPEN** | codex-security-audit-2026-01-27.md |

*Codex: Update status to DONE when Claude Code confirms fix. Claude Code: Mark DONE after remediation.*

---

## Activity Log

### 2026-01-27 - Security Audit (Codex)

**Task**: Ran comprehensive security audit (OWASP Top 10 + Clawdbot + n8n + Dashboard). Script required a non-interactive workaround; report written directly to docs/audits.
**Findings**:
- Critical: private key tracked in `clawdbot/config/identity/device.json` and in git history
- Critical: exec-approvals token + webhook URL in tracked file
- Critical: hardcoded Make.com token in `n8n/workflows/send-outreach.json`
- Critical: client-side Make.com webhook URLs in `dashboard/app/email/page.tsx`
- High: unauthenticated dashboard API routes and n8n webhooks

**Reports Written**:
- `docs/audits/codex-security-audit-2026-01-27.md`

**Self-Improvements**: None

**Next Actions**:
- Execute remediation plan steps and update Pending Remediation table as fixes land
- Re-run `npm audit`/`npm outdated` once registry access is available

### 2026-01-27 - npm Audit Enhancement (Claude Code)

**Task**: Enhanced Codex security audit to include npm dependency checks
**Findings**:
- Dashboard has 5 high-severity vulnerabilities (d3-color ReDoS via react-simple-maps)
- Main project clean (0 vulnerabilities)
**Updates Made**:
- `scripts/codex-security-audit.sh` - Added explicit `npm audit` and `npm outdated` commands
- `AGENTS.md` - Clarified dependency audit instructions
**Next Actions**:
- Run `cd dashboard && npm audit fix --force` to fix vulnerabilities (breaking change to react-simple-maps)

### 2026-01-26 - Remediation Plan

**Task**: Drafted remediation plan for critical and high findings
**Findings**: No new issues; plan covers git history rewrite, key rotation, gitignore update, and exec-approvals split

**Reports Written**:
- `docs/audits/codex-remediation-plan-2026-01-26.md`

**Self-Improvements**:
- Updated `AGENTS.md` to clarify identity key exposure checks, exec-approvals split model, and write-scope reminder

**Next Actions**:
- Claude Code to execute remediation plan steps and update Pending Remediation table to DONE as fixes land

### 2026-01-26 - Initial Orientation

**Task**: First run orientation and security audit
**Findings**: 
- Critical: `clawdbot/config/identity/device.json` contains private key (tracked in git)
- High: `clawdbot/config/exec-approvals.json` contains socket token + command history
- Medium: Raw curl auto-approved in exec allowlist

**Reports Written**:
- `docs/audits/codex-orientation.md`

**Self-Improvements**: None yet (first run)

**Next Actions**:
- Write remediation plan to `docs/audits/codex-remediation-plan-2026-01-26.md`
- Update activity log after each task

---

*Codex: Add new entries above this line, most recent first.*
