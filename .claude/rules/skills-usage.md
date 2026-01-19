---
paths:
  - "skills/**"
  - "specs/**"
  - "dashboard/**"
  - "**/*.tsx"
  - "**/*.ts"
---

# Skills Usage Rules

## Core Principle

> **Skills are reference material, not requirements.**  
> Only implement patterns from skills that are marked as "Active" for the current phase.

## Active vs Deferred Skills

Check `skills/README.md` for current status. As of Phase 1:

**Active (use now):**
- `uk-police-design-system` — Design tokens, colours, typography
- `uk-police-market-domain` — Domain knowledge, force data
- `technical-architecture` — Data fetching patterns

**Ready for Phase 1c:**
- `action-oriented-ux` — Three-Zone Model, keyboard navigation
- `adhd-interface-design` — Progress feedback, undo patterns

**Deferred (do NOT implement):**
- `lead-scoring-methodology` — Requires schema expansion
- `notification-system` — Requires overnight tracking
- `b2b-visualisation` — Requires scoring data
- `board-dashboard-design` — Phase 2+ feature
- `hubspot-integration` — Phase 2a feature

## Implementation Rules

### Rule 1: Check Phase Before Referencing

Before using any skill pattern, verify:
1. Is this skill marked as "Active" in `skills/README.md`?
2. Does the current spec explicitly reference this skill?
3. Does the schema support the required fields?

If any answer is "no" — do not implement.

### Rule 2: No Premature Schema Expansion

Do not add schema fields to support deferred skill patterns:
```
❌ "Let me add ms_score and ag_score for dual-track scoring"
   → This is from lead-scoring-methodology (deferred)

✅ "Adding draft_subject as specified in SPEC-007b"
   → This is in the current spec
```

### Rule 3: Specs Override Skills

If a spec simplifies or omits a skill pattern, follow the spec:
```
❌ "The action-oriented-ux skill says to show score breakdowns"
   → But SPEC-007b explicitly defers this

✅ "SPEC-007b says simple priority badge only"
   → Follow the spec, not the full skill
```

### Rule 4: Ask Before Implementing Deferred Patterns

If a deferred pattern seems valuable, ask first:
```
"The notification-system skill has a pattern for toast stacking
that would improve UX. This is marked as deferred. Should I 
implement it now or stick to the MVP spec?"
```

## Quick Reference: What Each Skill Requires

| Skill | Schema Requirement | Safe to Use? |
|-------|-------------------|--------------|
| `uk-police-design-system` | None (CSS only) | ✅ Yes |
| `uk-police-market-domain` | Forces table exists | ✅ Yes |
| `technical-architecture` | None (patterns only) | ✅ Yes |
| `action-oriented-ux` | Basic Opportunities fields | ✅ Phase 1c |
| `adhd-interface-design` | Basic Opportunities fields | ✅ Phase 1c |
| `lead-scoring-methodology` | 8+ new fields (ms_score, ag_score, etc.) | ❌ Deferred |
| `notification-system` | Session tracking, overnight detection | ❌ Deferred |
| `b2b-visualisation` | Score breakdown fields | ❌ Deferred |

## Anti-Patterns to Avoid

### Don't Port V1 Complexity

```
❌ "I'll port the dual-track scoring component from V1"
   → V1 had schema that doesn't exist in V2

✅ "I'll port the design tokens and basic layout from V1"
   → These work with any schema
```

### Don't Add "Just One More Field"

```
❌ "While I'm here, let me add research_confidence to Contacts"
   → This is from SPEC-007a (deferred)

✅ "Adding only the 4 fields specified in SPEC-007b"
   → draft_subject, draft_body, actioned_at, skip_reason
```

### Don't Implement Scoring Before Validation

```
❌ "I'll build the scoring display since it's in the skill"
   → Scoring model hasn't been validated with real data

✅ "Using simple priority badge until scoring is validated"
   → Match current phase capabilities
```

## When Skills Become Active

Skills are promoted from "Deferred" to "Active" when:
1. Their prerequisites are met (see spec)
2. The prior phase is complete and validated
3. User explicitly requests implementation
4. ROADMAP.md is updated to reflect the change

Do not self-promote skills based on perceived value.
