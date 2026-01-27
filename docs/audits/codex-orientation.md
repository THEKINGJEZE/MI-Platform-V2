# Codex Orientation Report — 26 January 2026

## Project Understanding
- MI Platform is a market-intelligence system that scrapes, classifies, enriches, and queues leads so James can review and send 3–5 ready-to-send leads each Monday in under 15 minutes.
- Mission (ANCHOR.md): deliver 3–5 quality leads every Monday morning with 95% automation, minimal decisions, and ADHD-first clarity.
- Current phase (STATUS.md): Phase 1d + 2a in parallel; Phase 2a-8 is complete.

## Security Landscape
- High-risk areas: `clawdbot/` (agent runtime + exec allowlist), `credentials/`, `.env*`, `n8n/` workflow exports/data, and `scripts/` (API tooling and MCP wrappers).
- Credentials/secrets present: local `.env*` files (ignored), Clawdbot runtime config/credentials (ignored), exec allowlist with token + command history (tracked), and a tracked device identity key pair.
- Cross-system integrations: Clawdbot → Make.com → Outlook; Clawdbot → Airtable → n8n; HubSpot ingestion; remote MCP servers for n8n/Airtable; Notion via curl wrappers.

## Initial Findings
- Immediate concerns:
  - Critical: `clawdbot/config/identity/device.json` contains a private key (`privateKeyPem`) and is tracked in git. This is a credential exposure risk. (`clawdbot/config/identity/device.json:5`)
  - High: `clawdbot/config/exec-approvals.json` is tracked and includes a socket token plus full `lastUsedCommand` values that embed webhook URLs and command context. (`clawdbot/config/exec-approvals.json:5`, `clawdbot/config/exec-approvals.json:31`)
  - Medium: Exec allowlist permits raw `/usr/bin/curl` and `/opt/homebrew/bin/curl`, which can be used to exfiltrate data; domain-restricted wrappers exist but are not exclusive. (`clawdbot/config/exec-approvals.json:17-25`)
- Git hygiene assessment:
  - `.env`, `.env.local`, and Clawdbot config/credentials are ignored; no tracked `.env` files were detected beyond `.env.example` placeholders.
  - `credentials/` contents are ignored (except README/.gitkeep).
- Clawdbot security posture: Mixed. The `.gitignore` is largely comprehensive and secrets are mostly excluded, but tracked identity keys and exec-approval token/history materially increase risk.

## Audit Plan
- Security audits: weekly quick scans (secret grep + exec allowlist review + tracked key/material check), monthly deeper review (n8n exports, scripts/, dashboard auth paths), and quarterly dependency vulnerability checks.
- Document drift audits: run `node scripts/consistency-check.cjs` monthly and validate single-source-of-truth rules in `docs/DEPENDENCY-MAP.md` whenever STATUS/ROADMAP/DECISIONS change.
- Recommended frequency: weekly security spot-checks during active development; monthly full audits; quarterly dependency and workflow credential reviews.

## First Impressions
- Overall security maturity: Moderate, with at least one critical exposure that needs immediate remediation.
- Top 3 recommendations:
  1. Remove the tracked device private key from git history, rotate the keypair, and add `clawdbot/config/identity/device.json` to `.gitignore`.
  2. Move `exec-approvals.json` tokens and `lastUsedCommand` history to a non-tracked runtime file or scrub on write; retain only minimal allowlist metadata in repo.
  3. Restrict exec allowlist to domain-restricted wrappers only (Make.com/Notion), and require approval for raw `curl`.
