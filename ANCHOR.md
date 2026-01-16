# MI Platform — Anchor Document
## ⚠️ THIS FILE IS IMMUTABLE — NEVER MODIFY ⚠️

**Created**: January 2025  
**Purpose**: Permanent mission definition that survives context decay

---

## Mission

Build a Market Intelligence Platform that delivers **3-5 ready-to-send leads every Monday morning** with 95% of the work automated.

## The User

**James** — Director at Peel Solutions, has ADHD.
- Needs: Low friction, single focus, clear next actions
- Hates: Decision fatigue, rabbit holes, ambiguity
- Values: Systems that reduce cognitive load

## The Business

**Peel Solutions** provides managed investigator teams to UK police forces.
- 43 territorial police forces are the target market
- Competitors: Red Snapper, Investigo, Reed, Adecco, Service Care
- Differentiation: Outcome-based delivery, not just staffing

## Success Criteria (Immutable)

| Metric | Target | Non-Negotiable |
|--------|--------|----------------|
| Monday review time | ≤15 minutes | ✓ |
| Leads per week | 3-5 quality leads | ✓ |
| Human decisions per lead | ≤3 | ✓ |
| System should feel like | "Review and send" | ✓ |

## Core Constraints (Never Violate)

1. **ADHD-first design** — Minimize decisions, maximize clarity
2. **Quality over quantity** — 5 good leads beats 50 garbage ones
3. **Human confirms, system decides** — AI recommends, James approves
4. **Single source of truth** — Schema.json for data, this file for mission
5. **Graceful degradation** — System works even if parts fail

## What We're NOT Building

- ❌ A CRM replacement (HubSpot is the CRM)
- ❌ A general-purpose automation platform
- ❌ A tool that requires daily attention
- ❌ Something that sends emails without human approval
- ❌ Features for "later" before current phase is done

## Tech Stack (Locked)

| System | Purpose | Why |
|--------|---------|-----|
| Airtable | Database | Flexible schema, good API |
| n8n | Automation | Self-hosted, visual workflows |
| HubSpot | CRM | Already in use, good integrations |
| Claude API | AI | Best reasoning for classification |

## Verification Questions

Before ANY major decision, Claude must ask:
1. Does this serve the Monday morning experience?
2. Does this reduce or increase James's cognitive load?
3. Does this align with the success criteria above?
4. Is this in the current phase, or scope creep?

If the answer to any is "no" or "uncertain" → STOP and discuss.

---

**This document defines WHY we're building. Other documents define HOW.**

*If you're reading this and the project has drifted from these principles, STOP and realign.*
