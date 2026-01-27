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
| P1 | Split exec-approvals.json (allowlist vs runtime) | **OPEN** | codex-orientation.md |
| P2 | Restrict raw curl in exec allowlist | **OPEN** | codex-orientation.md |

*Codex: Update status to DONE when Claude Code confirms fix. Claude Code: Mark DONE after remediation.*

---

## Activity Log

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
