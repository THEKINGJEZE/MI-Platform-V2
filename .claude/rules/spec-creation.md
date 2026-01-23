# Spec Creation Rules

## Purpose

Non-negotiable rules for creating specifications. These ensure specs reference real project artifacts, not imagined ones.

---

## Pre-Requisites

Before writing ANY spec content, you MUST have:

| # | Requirement | How to Verify |
|---|-------------|---------------|
| 1 | **Context from `/prep-spec`** | Run `/prep-spec [topic]` first, review `specs/NEXT-CONTEXT.md` |
| 2 | **Acceptance criteria visible** | Copy from ROADMAP.md (do not invent) |
| 3 | **Applicable guardrails identified** | List by ID (G-XXX) from `docs/GUARDRAILS.md` |
| 4 | **Source of truth confirmed** | Strategy doc section, NOT derived files |

**If any requirement is missing → STOP and gather it first.**

---

## Hard Gates

### 0. Context Brief Must Exist (Hook Enforced)

**This gate is enforced by `.claude/hooks/pre-edit-check.sh`.** Attempting to create a spec without a context brief will be blocked automatically.

Before writing ANY content to a spec file:

1. Check if `specs/NEXT-CONTEXT.md` exists
2. If it doesn't exist → run `/prep-spec <topic>` first
3. If it exists but is >24h old → re-run `/prep-spec` for fresh context
4. Read and review the context brief before proceeding

**Violation results in blocked Write/Edit operation with exit code 2.**

### 1. No Context = No Spec

If asked to write a spec without running `/prep-spec`:
- Stop and run `/prep-spec [topic]` first
- Review the generated `specs/NEXT-CONTEXT.md`
- Only then proceed with drafting

### 2. Source Documents Only

Never use generated/derived files as source of truth. Always reference:
- `docs/STRATEGY.md` — for architecture
- `ROADMAP.md` — for acceptance criteria
- `docs/GUARDRAILS.md` — for rules
- `docs/SALES-STRATEGY.md` — for contact/messaging strategy

**Avoid**: `schema-reference.json`, workflow JSON exports, or other generated files

### 3. Inline Guardrail References Required

Every workflow step that touches a guardrail must reference it inline:

```markdown
### Workflow: ingest-indeed-jobs

**Step 3**: Store raw results to Jobs_Raw_Archive **(G-001: raw before filtering)**
**Step 4**: Apply force matching patterns **(G-005: JS before AI)**
```

### 4. Testing Plan is Mandatory

Every spec must include **5+ specific test cases** that verify acceptance criteria.

Not acceptable: "test that it works"
Required: Actual scenarios with expected outcomes

Example:
```markdown
## Testing Plan

1. **Classification accuracy**: Submit 10 sample jobs (5 relevant, 5 irrelevant) → verify ≥90% correct classification
2. **Force matching**: Submit job with "Kent Police" in company → verify linked to Kent force record
3. **Duplicate handling**: Submit same job twice → verify only one signal created, scrape_count incremented
4. **Error recovery**: Simulate API timeout → verify retry logic and error logging
5. **End-to-end**: New Indeed job → classified → opportunity created → contact identified → message drafted
```

---

## Required Sections

Every spec must include these sections (per `specs/README.md`):

- [ ] **Overview** — What this spec delivers
- [ ] **Architecture** — Data flow diagram
- [ ] **Tables** — Airtable schema changes (if any)
- [ ] **Workflows** — With inline guardrail references
- [ ] **Testing Plan** — 5+ specific tests
- [ ] **Acceptance Criteria** — Copied from ROADMAP.md
- [ ] **Build Sequence** — Order of implementation
- [ ] **Dependencies** — What must exist first

---

## Verification Checklist

Before finalizing a spec, verify:

- [ ] All file references exist (run `/consistency-check`)
- [ ] Guardrail IDs are valid (check `docs/GUARDRAILS.md`)
- [ ] Acceptance criteria match ROADMAP.md exactly
- [ ] Testing plan has 5+ specific scenarios
- [ ] No invented patterns — only reference what exists in repo

---

## Common Mistakes to Avoid

| Mistake | Correction |
|---------|------------|
| Inventing acceptance criteria | Copy exactly from ROADMAP.md |
| Referencing non-existent patterns | Run `/prep-spec` to see what exists |
| Generic test cases | Write specific scenarios with expected outcomes |
| Missing guardrail references | Every workflow step should cite applicable G-XXX |
| Using derived files as source | Always use docs/STRATEGY.md, ROADMAP.md, GUARDRAILS.md |
