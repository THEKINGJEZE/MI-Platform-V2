---
description: Generate context brief for Claude Chat before spec creation
argument-hint: <topic>
---

# Prepare Spec Context Brief

## Usage

```
/prep-spec <topic>
```

Example: `/prep-spec phase-1b-competitors`

## Purpose

Generates a context brief file (`specs/NEXT-CONTEXT.md`) containing project assets that Claude Chat needs to reference when writing specifications. This ensures specs reference real patterns, prompts, and guardrails — not imagined ones.

## Process

### Step 1: Extract acceptance criteria from ROADMAP.md

Search ROADMAP.md for the section matching `$ARGUMENTS`. Extract the acceptance criteria list.

### Step 2: Inventory existing assets

List files with one-line purpose descriptions:

**Patterns** (`patterns/`):
- `force-matching.js` — UK police force name matching (G-005)
- `indeed-keywords.json` — Indeed search keywords configuration
- `job-portal-filters.js` — Filter job portal false positives (G-010)

**Prompts** (`prompts/`):
- `job-classification.md` — Claude prompt for classifying job signals
- `email-triage.md` — Claude prompt for email classification

**Reference Data** (`reference-data/`):
- `uk-police-forces.json` — 48 UK police forces with metadata
- `competitors.json` — 7 competitor definitions
- `capability-areas.json` — 14 capability areas for classification

**Skills** (`.claude/skills/`):
- `force-matching/` — Force identification skill (enforces G-005)

**Rules** (`.claude/rules/`):
- `airtable.md` — Airtable API patterns and rate limits
- `n8n.md` — n8n workflow structure requirements

### Step 3: Extract relevant guardrails

From `docs/GUARDRAILS.md`, identify guardrails that apply to the topic. Include:
- ID, Rule name, TL;DR summary
- Only guardrails relevant to the topic (not all 11)

### Step 4: Pull recent decisions

From `DECISIONS.md`, extract the 3-5 most recent active decisions, focusing on:
- Architectural decisions (Tier 1)
- Phase-level decisions (Tier 2) if relevant to topic

### Step 5: Include current state

From `STATUS.md`, extract:
- Current phase name
- Session goal
- Any blockers

### Step 6: Write to specs/NEXT-CONTEXT.md

Create the file with this template:

```markdown
# Context Brief: [Topic]

Generated: [date]
For: Claude Chat spec drafting

---

## Current State

**Phase**: [from STATUS.md]
**Goal**: [from STATUS.md]
**Blockers**: [from STATUS.md or "None"]

---

## Acceptance Criteria (from ROADMAP.md)

[Paste criteria or note "No existing criteria — new scope"]

---

## Existing Assets

### Patterns (reuse these, don't recreate)
- `patterns/force-matching.js` — [purpose]
- ...

### Prompts (can extend or reference)
- `prompts/job-classification.md` — [purpose]
- ...

### Reference Data (source of truth)
- `reference-data/uk-police-forces.json` — [purpose]
- ...

### Skills & Rules
- `.claude/skills/force-matching/` — [purpose]
- ...

---

## Applicable Guardrails

| ID | Rule | Relevance |
|----|------|-----------|
| G-XXX | [name] | [why it applies to this topic] |

---

## Recent Decisions

| Decision | Date | Impact |
|----------|------|--------|
| [title] | [date] | [how it affects this spec] |

---

## Notes for Claude Chat

- Reference assets by path (e.g., `patterns/force-matching.js`)
- New prompts go in `prompts/`
- New patterns go in `patterns/`
- Spec output should go in `specs/`
- Keep spec under 200 lines
```

## Output Constraints

- **Max 100 lines** — Keep brief compact
- **No full file contents** — Just paths and one-line summaries
- **Focus on what exists** — Chat needs to know what to reference, not reinvent

## After Running

1. Review `specs/NEXT-CONTEXT.md`
2. Share or paste to Claude Chat session
3. Claude Chat drafts spec with real references
4. Claude Code validates and saves final spec
