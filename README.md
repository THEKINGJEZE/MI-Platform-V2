# MI Platform

Market Intelligence Platform for Peel Solutions. Automates business development by monitoring job postings, classifying signals, and generating ready-to-send outreach.

**Goal**: 3-5 ready-to-send leads every Monday morning, ≤15 min review time.

---

## Quick Start

### 1. Install

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your credentials
```

### 2. Get Credentials

| Service | Where to Get |
|---------|--------------|
| Airtable API Key | [airtable.com/create/tokens](https://airtable.com/create/tokens) |
| Airtable Base ID | Create base, copy ID from URL |
| n8n API | n8n Settings → API |
| HubSpot | Settings → Integrations → Private Apps |
| Claude API | [console.anthropic.com](https://console.anthropic.com) |

### 3. Verify Setup

```bash
node scripts/health-check.js
```

### 4. Start Claude Code

```bash
claude
```

---

## Key Documents

| Document | Purpose | Update Frequency |
|----------|---------|------------------|
| [ANCHOR.md](ANCHOR.md) | Mission definition (immutable) | Never |
| [ROADMAP.md](ROADMAP.md) | Phases and acceptance criteria | Per phase |
| [STATUS.md](STATUS.md) | Current session state | Every session |
| [CLAUDE.md](CLAUDE.md) | Claude Code instructions | Rarely |
| [DECISIONS.md](DECISIONS.md) | Decision log (max 20 active) | When decisions made |

### For Claude Chat Users
See [docs/CHAT-INSTRUCTIONS.md](docs/CHAT-INSTRUCTIONS.md) for project instructions.

### For Process Details
- [docs/SYNC-PROTOCOL.md](docs/SYNC-PROTOCOL.md) — How Chat and Code stay aligned
- [docs/DOCUMENT-HYGIENE.md](docs/DOCUMENT-HYGIENE.md) — Preventing document decay
- [docs/architecture.md](docs/architecture.md) — System architecture

---

## Current Status

**See [STATUS.md](STATUS.md) for current progress.**

**See [ROADMAP.md](ROADMAP.md) for phase details and acceptance criteria.**

---

## Anti-Decay System

This project uses structured processes to prevent document drift:

1. **Single source of truth** — Information lives in one place, others link to it
2. **Document limits** — STATUS <100 lines, DECISIONS <20 active, CLAUDE <80 lines
3. **Archive rotation** — Stale content moves to `docs/archive/`
4. **Hooks** — Automated context injection and state capture
5. **Role separation** — Claude Chat thinks, Claude Code builds

For details, see [docs/DOCUMENT-HYGIENE.md](docs/DOCUMENT-HYGIENE.md).

---

## Links

- [Airtable Base](https://airtable.com/) — Create yours
- [n8n Dashboard](https://your-n8n-url) — Your instance
- [HubSpot](https://app.hubspot.com/)

---

*This README is intentionally minimal. Details live in the documents linked above.*
