---
description: Quick drift detection — compare current work to ANCHOR.md mission
---

# Alignment Check

## Quick Self-Check (30 seconds)

Answer these three questions:

1. **What am I currently working on?**
   [Your answer]

2. **What does STATUS.md say the goal is?**
   ```bash
   head -15 STATUS.md
   ```

3. **Does #1 serve the Monday morning experience?**
   - ≤15 min review time?
   - 3-5 quality leads?
   - Reducing cognitive load?

## Traffic Light

🟢 **GREEN** — Current work directly serves stated goal. Proceed.

🟡 **YELLOW** — Work is tangential. Pause. Ask: "Should I continue or refocus?"

🔴 **RED** — Work contradicts mission or is out of scope. Stop. Realign.

## If Yellow or Red

1. Stop current work immediately
2. Summarize where you are
3. Ask James: "Should I continue [current work] or refocus on [stated goal]?"
4. Update STATUS.md with the decision
5. Log in DECISIONS.md if it's architectural

## Deep Analysis

For thorough audit, invoke the alignment-checker agent:
```
@alignment-checker Please audit current work against ANCHOR.md
```

## Mission Reminders (from ANCHOR.md)

**Building**: 3-5 ready-to-send leads every Monday, 95% automated

**NOT Building**:
- ❌ CRM replacement
- ❌ General automation platform
- ❌ Daily attention tool
- ❌ Auto-send without approval
