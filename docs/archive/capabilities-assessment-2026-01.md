# Claude Code Capabilities Assessment for MI Platform

Date: 2026-01-21
Author: Claude Code (assessment)
Scope: MI Platform project configuration, governance, workflows, and Claude Code capabilities (agents, commands, MCP, plugins, checkpointing).

---

## Recommendations (Top 5)

1. alignment-checker + /project:check-alignment -- enforce mission lock before any Phase 1b+ work -- Immediate
   Impact: High | Effort: Low | Timeline: This week

2. /project:consistency-check + doc-audit cadence -- stop doc drift that is already visible (Phase and model mismatch) -- Immediate
   Impact: High | Effort: Low | Timeline: This week

3. workflow-builder standardization + workflow patterns doc -- reduce workflow variation before adding new competitor sources -- Week 1
   Impact: High | Effort: Medium | Timeline: Week 1

4. signal-triage integration into classification review loop -- improve classification accuracy and reduce false positives -- Week 1-2
   Impact: Medium | Effort: Medium | Timeline: Week 1-2

5. Ingest Job Board plugin template -- scale competitor interception without pattern sprawl -- Week 2-3
   Impact: High | Effort: Medium | Timeline: Week 2-3

---

## Executive Summary

The MI Platform is operational and much further along than the Phase 1b queue described in the handoff. The project files show Phase 1b marked complete, Phase 1c largely implemented, and Phase 1d quality improvements deployed and under monitoring. However, there is visible document drift and status misalignment across CLAUDE.md, STATUS.md, and ROADMAP.md, plus a time-stamp mismatch (2025 vs today 2026). This indicates governance risk that will grow as Phase 1b expands into competitor interception at higher velocity.

Core Claude Code capabilities already exist in this repo: alignment-checker, workflow-builder, signal-triage agents; /project:* commands; and hooks. The issue is not missing capability, but inconsistent activation and lack of an explicit usage protocol. For example, the workflow-builder agent enforces logging and error-handling standards, yet the workflow specs in docs/STRATEGY.md do not define these conventions, leading to variable implementations. Likewise, /project:consistency-check and doc-audit exist but are not embedded into a regular cadence or acceptance criteria.

Phase 1b is the risk inflection point. Competitor signals are time-sensitive and will be multiplied by additional sources. Without a standardized ingestion template (plugin or workflow pattern), each new competitor source will add bespoke logic and accelerate complexity sprawl (the known V1 failure mode). A plugin-style "Ingest Job Board" pattern, plus workflow-builder enforcement, addresses this by reducing per-source variation and making workflows consistent to debug.

The most immediate win is governance: use alignment-checker before any Phase 1b expansions, and make /project:consistency-check + doc-audit part of weekly maintenance. This directly addresses the present misalignment across documents (for example: ROADMAP vs CLAUDE.md vs STATUS.md) and prevents further drift.

The second win is classification accuracy. The signal-triage agent already encodes UK police domain rules (civilian roles vs sworn officer recruitment, competitor patterns). Integrating its logic into classification test cases and prompt evaluation (or as an explicit pre-deploy review step) will reduce false positives and missed opportunities. This matters most for competitor interception where speed and correctness are both critical.

Finally, checkpointing (via /rewind) should become a routine part of workflow changes. There is no explicit checkpointing policy documented in CLAUDE.md or CHAT-INSTRUCTIONS.md, which increases the cost of mistakes. A lightweight "checkpoint before risky edits" rule would cut rollback time and reduce context loss.

Key theme: capabilities are present, but they must be operationalized via protocol, cadence, and templates. Phase 1b success depends on this shift.

---

## Do This First (Phase 0)

1. Run /project:check-alignment and alignment-checker before any Phase 1b expansion.
2. Run /project:consistency-check and doc-audit this week; reconcile phase status across CLAUDE.md, STATUS.md, ROADMAP.md.
3. Document a checkpointing rule (use /rewind before workflow edits or schema changes).

## For Phase 1b Success

- Standardize ingestion via workflow-builder + a shared "ingest job board" template.
- Integrate signal-triage domain logic into classification tests and prompt evaluation.
- Add /project:health-check to the start of Phase 1b sessions.

## For Long-term Sustainability

- Build a plugin package for recurring workflow patterns (ingest, classify, enrich, alert).
- Make doc-audit part of weekly governance (prevents V1-style sprawl).
- Update CHAT-INSTRUCTIONS to include new capabilities in the handoff protocol.

---

## Task 1: Audit of Current Friction Points (5-10)

1. Phase status drift across core documents
   - Example: CLAUDE.md says Phase 1c (and Phase 1b complete), STATUS.md says Phase 1d, ROADMAP.md says Phase 1d pending deployment. The handoff says Phase 1b queued. This creates decision fatigue and uncertainty.

2. Temporal drift in status and phase tracking
   - Example: STATUS.md last updated 21 January 2025; today is 2026-01-21. This undermines trust in "current state" and increases manual verification.

3. Workflow standards not consistently enforced
   - Example: workflow-builder enforces logging and error handling, but STRATEGY.md workflow specs do not mention System_Logs or error branches. This enables inconsistent workflow implementations.

4. Classification domain expertise not fully operationalized
   - Example: signal-triage agent defines high/low relevance patterns, but classification in STRATEGY.md is generic Claude API. Misclassification risk remains, especially for sworn officer roles and senior leadership roles.

5. Health monitoring is ad-hoc
   - Example: hooks run a consistency check on session start, but there is no regular /project:health-check cadence and no systematic alerting for workflows ending in error (WF3 error status in STATUS.md).

6. Handoff friction between Chat and Code
   - Example: CHAT-INSTRUCTIONS enforces prep-spec and guardrail checks but does not include alignment-checker, workflow-builder, or checkpointing. This causes repeated decisions and missed capability use.

7. No standardized ingestion template for competitor sources
   - Example: Strategy requires Red Snapper, Investigo, Reed, Adecco, Service Care. Roadmap shows only Red Snapper and Investigo configured. Without a reusable template, each new source becomes a bespoke workflow and increases sprawl.

8. Command and capability awareness gap
   - Example: /rewind is available but not documented in CLAUDE.md quick commands; checkpointing is not a habitual step. /project commands are defined but not part of acceptance criteria.

9. Model and tooling mismatch across docs
   - Example: ROADMAP Phase 1 mentions OpenAI gpt-4o-mini, while STRATEGY and workflows reference Claude API. This creates ambiguity and requires manual correction.

10. Unclear integration of skill knowledge into workflow patterns
   - Example: Skills document states signal domain knowledge is available, but there is no explicit integration point for skills in classification or alerting workflows.

---

## Task 2: Capabilities-to-Problem Mapping (Detailed)

### Friction Point: Phase Status Drift

**Problem**: CLAUDE.md, STATUS.md, ROADMAP.md, and the handoff describe different phases and completion states.

**Root Cause**: No enforced cadence for /project:consistency-check and doc-audit; no explicit "phase reconciliation" step.

**Possible Solutions**:
- [ ] /project:consistency-check (detect cross-doc mismatches)
- [ ] doc-audit command (comprehensive doc alignment)
- [ ] alignment-checker agent (mission-level validation)

**Recommended Capability**: /project:consistency-check + doc-audit because it provides objective mismatch detection and a repeatable cadence.

**Implementation**: Add a weekly maintenance checklist and a pre-Phase-1b "doc alignment" gate; include in CLAUDE.md session protocol.

---

### Friction Point: Temporal Drift (Stale Status)

**Problem**: STATUS.md references January 2025 and does not reflect current date.

**Root Cause**: STATUS.md not updated as part of session close or weekly review; no enforcement beyond prompt reminder.

**Possible Solutions**:
- [ ] Stop hook prompt (already present)
- [ ] hygiene-check command (document size and maintenance prompts)
- [ ] Add "date refresh" checklist to end of session

**Recommended Capability**: hygiene-check + Stop hook enforcement because it already exists and can be extended to include date refresh.

**Implementation**: Update Stop hook prompt to explicitly mention date freshness and current phase verification.

---

### Friction Point: Workflow Standardization Gaps

**Problem**: Workflow specs do not enforce consistent logging and error handling, leading to variable implementations.

**Root Cause**: No single source of workflow "standards" in strategy docs; workflow-builder rules exist but are not referenced in specs.

**Possible Solutions**:
- [ ] workflow-builder agent (enforces standards)
- [ ] New workflow standards document (linked in STRATEGY.md)
- [ ] /project:deploy-workflow + validate to enforce patterns

**Recommended Capability**: workflow-builder + a lightweight standards doc because it operationalizes consistency and scales with new workflows.

**Implementation**: Add a "Workflow Standards" appendix in STRATEGY.md or docs/STRATEGY-N8N.md and require workflow-builder for all new workflows.

---

### Friction Point: Classification Domain Expertise Gap

**Problem**: Generic classification misses domain nuances (sworn officer vs civilian roles, competitor signals).

**Root Cause**: signal-triage agent is defined but not integrated into classification validation or prompt evaluation.

**Possible Solutions**:
- [ ] signal-triage agent (domain rules)
- [ ] skills/uk-police-market-domain reference in prompts
- [ ] Add explicit test suite for classification (false positives/negatives)

**Recommended Capability**: signal-triage agent because it centralizes domain expertise and can be used to validate classification prompts and edge cases.

**Implementation**: Add "signal-triage review" to classification workflow changes and use it to generate test cases for SPECs.

---

### Friction Point: Health Monitoring Blind Spots

**Problem**: WF3 ends in error status but processing continues; no standard alerting or health checks.

**Root Cause**: Health-check command exists but is not part of routine; no workflow-level alert pattern documented.

**Possible Solutions**:
- [ ] /project:health-check (verify connectivity)
- [ ] workflow-builder agent (add error branches + alert nodes)
- [ ] doc-audit (surface missing monitoring patterns)

**Recommended Capability**: /project:health-check + workflow-builder because they provide both connectivity checks and standard error handling patterns.

**Implementation**: Add /project:health-check to session start and require error branch alerts in workflow-builder outputs.

---

### Friction Point: Handoff Friction (Chat to Code)

**Problem**: Spec workflow ignores new capabilities; context is lost and decisions are re-made.

**Root Cause**: CHAT-INSTRUCTIONS do not include alignment-checker, workflow-builder, signal-triage, or /rewind steps.

**Possible Solutions**:
- [ ] Update CHAT-INSTRUCTIONS to include capabilities in handoff protocol
- [ ] Add /project:check-alignment as a required step for major specs
- [ ] Add checkpointing (/rewind) before workflow edits

**Recommended Capability**: Update handoff protocol + alignment-checker because it reduces rework and enforces mission alignment.

**Implementation**: Add "Capabilities Gate" section to CHAT-INSTRUCTIONS with explicit commands and agents.

---

### Friction Point: Competitor Ingestion Sprawl

**Problem**: Multiple competitor sources require repeated, bespoke workflows.

**Root Cause**: No reusable ingestion pattern or plugin; only two sources active per ROADMAP.

**Possible Solutions**:
- [ ] workflow-builder agent with a standard ingestion template
- [ ] Plugins system to package the template
- [ ] skills/competitive-analysis for classifier integration

**Recommended Capability**: Plugins system because it scales the pattern and avoids repeated custom logic.

**Implementation**: Build an "Ingest Job Board" plugin with a standardized flow and configurable source list.

---

### Friction Point: Capability Awareness Gap (Checkpointing, Commands)

**Problem**: /rewind and /project commands exist but are not in daily workflow.

**Root Cause**: CLAUDE.md quick commands do not mention /rewind; no checkpointing policy.

**Possible Solutions**:
- [ ] Add /rewind to CLAUDE.md quick commands
- [ ] Pre-change checklist includes checkpointing
- [ ] Add a hook for "PreToolUse Edit/Write" to remind checkpoints (optional)

**Recommended Capability**: Document /rewind and add a lightweight checkpoint rule because it reduces recovery cost without tooling changes.

**Implementation**: Update CLAUDE.md and add a line in CHAT-INSTRUCTIONS.

---

### Friction Point: Model and Tooling Mismatch

**Problem**: ROADMAP references OpenAI gpt-4o-mini while STRATEGY references Claude API.

**Root Cause**: Doc updates not synchronized; no automated mismatch detection beyond references.

**Possible Solutions**:
- [ ] /project:consistency-check (extend to check model references)
- [ ] doc-audit (single source enforcement)

**Recommended Capability**: doc-audit because it already checks "single source of truth" and cross-doc facts.

**Implementation**: Update doc-audit checks to flag model/tool mismatches.

---

## Task 2b: Capabilities-to-Problem Matrix

| Problem | Capability | Why This Capability |
|---|---|---|
| Phase status drift | /project:consistency-check + doc-audit | Detects mismatches automatically; enforces single source of truth |
| Stale status tracking | hygiene-check + Stop hook | Provides a maintenance cadence and explicit prompts |
| Workflow inconsistency | workflow-builder | Enforces logging, error handling, naming conventions |
| Misclassification risk | signal-triage | Encodes UK police domain rules and competitor patterns |
| Workflow health blind spots | /project:health-check + workflow-builder | Ensures connectivity and error branch alerts |
| Chat/Code handoff friction | alignment-checker + updated protocol | Prevents drift and reduces re-decisions |
| Competitor ingestion sprawl | Plugins system + workflow template | Standardizes repeated ingestion patterns |
| Checkpointing not used | /rewind + documented policy | Reduces recovery time and context loss |
| Model/tool mismatch across docs | doc-audit | Flags cross-document contradictions |

---

## Task 3: Configuration Audit (Current State vs Gaps)

### Current Configuration Inventory

- Agents configured (project-level):
  - alignment-checker
  - workflow-builder
  - signal-triage
  - audit-* agents

- Project commands configured:
  - /project:check-alignment
  - /project:health-check
  - /project:consistency-check
  - /project:deploy-workflow
  - /project:hygiene-check
  - /project:doc-audit
  - /project:prep-spec
  - /project:implement

- Hooks configured:
  - SessionStart: context + doc health + consistency check
  - PreCompact: STATUS freshness guard
  - Stop: completion checklist prompt

- Settings:
  - .claude/settings.json with autoLoad (ANCHOR, CLAUDE, STATUS)
  - .claude/settings.local.json with MCP and expanded permissions

- Skills configured:
  - .claude/skills/force-matching
  - .claude/skills/airtable-schema

### Gaps and Missing Activation

1. No explicit checkpointing policy using /rewind (not in CLAUDE.md quick commands).
2. Alignment checks are not mandatory in the workflow; alignment-checker exists but is optional.
3. Workflow standards are not referenced in STRATEGY.md (logging/error-handling missing).
4. signal-triage is not integrated into classification testing or prompt evaluation.
5. No plugin system configured; repeated ingestion patterns remain manual.
6. Project commands are defined but not embedded into acceptance criteria or weekly cadence.
7. No documented link between skills and classification tests (skills remain passive reference).

---

## Task 4: Phase 1b Simulation (Current vs Optimized)

### Scenario
Competitor job posting detected: Red Snapper -> Investigator at Hampshire Police, posted 8 hours ago.

### Current Flow (as documented)

1. Bright Data scraper finds job
2. Manual classification check (is this relevant?)
3. Create Signal in Airtable
4. Manually verify classification accuracy
5. Create Opportunity
6. Find contact in HubSpot (manual if not found)
7. Draft message manually
8. Add to dashboard
9. Notify James
10. James reviews, edits, sends

### Optimized Flow (Capabilities Enabled)

1. Ingest Job Board plugin (Red Snapper template)
   - standardized input schema and raw archive (G-001)

2. signal-triage agent validates classification logic
   - detects "Investigator" as high relevance
   - flags competitor source

3. workflow-builder standardizes workflow
   - log start/end
   - error branches and alert nodes

4. /project:health-check ensures integrations are live

5. classification workflow applies JS force match (G-005), then AI

6. Opportunity auto-created and marked hot (P1)

7. Enrichment workflow uses problem-owner targeting rules (G-014)

8. alert-hot-lead workflow sends standardized alert

9. alignment-checker run before final send (mission lock)

10. James reviews in dashboard and sends same day

### Flow Diagram (Current vs Optimized)

CURRENT

[Scrape] -> [Manual classify] -> [Signal] -> [Manual verify] -> [Opportunity] -> [Manual contact] -> [Manual draft] -> [Dashboard] -> [Notify] -> [Send]

OPTIMIZED

[Scrape] -> [Raw archive] -> [JS match] -> [AI classify + signal-triage validation] -> [Opportunity] -> [Auto-enrich] -> [Hot alert] -> [Dashboard] -> [Send]

---

## Task 5: Risk Assessment Matrix

| Risk | Impact | Likelihood | Mitigation | Capability |
|---|---|---|---|---|
| Phase 1b velocity risk (missed same-day leads) | High | Medium | Standardize ingestion + alerting | workflow-builder + plugin |
| Complexity sprawl (V1 repeat) | High | Medium | Enforce workflow standards + doc audits | alignment-checker + /project:consistency-check |
| Classification accuracy risk | High | Medium | Integrate signal-triage + test suite | signal-triage |
| Silent failure risk | High | Medium | Health checks + error alerts | /project:health-check + workflow-builder |
| Documentation drift risk | Medium | High | Weekly consistency check + doc-audit | /project:consistency-check + /project:doc-audit |

---

## Task 6: Implementation Roadmap

# Claude Code Capabilities Implementation Roadmap

## Phase 0: Immediate (This Week)
Goal: Activate safety mechanisms and stop drift

- [ ] Run /project:consistency-check and /project:doc-audit; reconcile phase status across docs
- [ ] Add /rewind checkpointing rule to CLAUDE.md and CHAT-INSTRUCTIONS.md
- [ ] Require /project:check-alignment before any Phase 1b changes
- [ ] Add /project:health-check to session-start checklist

Why this first: Prevents drift and prevents compounding errors while moving fast
Time: 30-45 minutes

Success metrics:
- Zero mismatches between CLAUDE.md, STATUS.md, ROADMAP.md
- /rewind documented and used at least once for a risky edit

---

## Phase 1: Foundation (Week 1-2)
Goal: Activate domain expertise and workflow consistency

- [ ] Require workflow-builder for any new workflow or workflow update
- [ ] Create a short "Workflow Standards" doc (logging, error handling, naming)
- [ ] Integrate signal-triage into classification testing (define 10-15 test cases)
- [ ] Add /project:health-check to weekly maintenance cadence

Why this second: Standardization and accuracy are prerequisites for adding sources
Time: 2-3 hours

Success metrics:
- All new workflows include log start/end + error branches
- Classification test suite accuracy >90% on defined cases

---

## Phase 2: Plugins (Week 2-3)
Goal: Standardize ingestion pattern for all competitor sources

- [ ] Design "Ingest Job Board" plugin template
- [ ] Package Red Snapper + Investigo with the template
- [ ] Add Reed/Adecco/Service Care as configuration, not new workflows
- [ ] Document plugin deployment and update CLAUDE.md

Why this third: Prevents sprawl as Phase 1b expands
Time: 4-5 hours

Success metrics:
- New competitor source added in <30 minutes
- Ingestion template reused with <10% custom logic per source

---

## Phase 3: Extended Thinking (Week 3+)
Goal: Use higher-cost reasoning for critical architectural decisions only

- [ ] Identify 2-3 high-impact decisions per month
- [ ] Use Opus/extended thinking for those decisions
- [ ] Track cost vs value in DECISIONS.md

Why later: Not required for execution, but useful for architecture
Time: Occasional

Success metrics:
- Fewer major reversals or architecture changes

---

## Phase 4: IDE Integration (Ongoing)
Goal: Faster iteration and better visual review

- [ ] Configure VS Code extension
- [ ] Document shortcuts and review flow

Why ongoing: Improves efficiency but not required

Success metrics:
- Reduced review time for dashboard changes

---

### Capability-Specific Recommendations

#### alignment-checker
- When to activate: Immediate
- Why: Prevents drift during Phase 1b expansion
- Configuration needed: already present in .claude/agents
- Integration: add to CHAT-INSTRUCTIONS and CLAUDE.md "pre-work gate"
- Success metrics: alignment check run before each new spec or workflow addition

#### workflow-builder
- When to activate: Week 1
- Why: Standardizes workflow design and error handling
- Configuration needed: already present; add standards doc
- Integration: require for any workflow change; include in prep-spec checklist
- Success metrics: workflows show consistent logging + error handling patterns

#### signal-triage
- When to activate: Week 1-2
- Why: Reduces misclassification, especially for competitor signals
- Configuration needed: already present; add tests and evaluation harness
- Integration: classification prompt review and test suite
- Success metrics: >=90% accuracy on curated test set

#### /project commands
- When to activate: Immediate
- Why: Health and consistency checks reduce silent failure risk
- Configuration needed: commands already present; add cadence
- Integration: session start and weekly checklist
- Success metrics: no unaddressed errors in doc-audit reports

#### /rewind (checkpointing)
- When to activate: Immediate
- Why: Reduce recovery time from mistakes
- Configuration needed: none; add policy
- Integration: "checkpoint before workflow edits or schema changes"
- Success metrics: rollback time <2 minutes when needed

#### Plugins
- When to activate: Week 2-3
- Why: Scale competitor source onboarding
- Configuration needed: plugin manifest + template; update settings.json
- Integration: use plugin for all new ingestion sources
- Success metrics: new source added without new workflow JSON

---

## Task 7: Chat/Code Integration Changes

### Current Handoff (from CHAT-INSTRUCTIONS)
1. Chat: discuss, decide
2. Code: /prep-spec
3. Chat: draft spec
4. Code: validate, implement

### Proposed Handoff with Capabilities

1. Chat: discuss, decide
2. Code: /project:check-alignment (or alignment-checker for major specs)
3. Code: /prep-spec
4. Chat: draft spec
5. Code: validate spec + run /project:consistency-check
6. Code: implement using workflow-builder (for workflows)
7. Code: checkpoint with /rewind before risky edits
8. Code: run /project:health-check after deploy

### Proposed Additions to CHAT-INSTRUCTIONS

- Add a "Capabilities Gate" section that requires:
  - alignment-checker for major specs
  - workflow-builder for workflow changes
  - signal-triage for classification logic updates
  - /rewind before workflow edits
  - /project:consistency-check before spec validation

---

## Task 8: Documentation Updates Needed

### Update
- CLAUDE.md: Add /rewind to quick commands; add workflow-builder requirement; add alignment-checker gate for major changes
- docs/CHAT-INSTRUCTIONS.md: Add capabilities gate and checkpointing rule
- docs/STRATEGY.md or docs/STRATEGY-N8N.md: Add Workflow Standards section
- ROADMAP.md: Reconcile model/tool references (Claude API vs OpenAI)
- STATUS.md: Update date and current phase; reflect actual state

### New Documents
- docs/PROJECT-COMMANDS.md: When to use each /project:* command
- docs/WORKFLOW-STANDARDS.md: Logging, error handling, naming conventions
- docs/CLAUDE-CODE-SETUP.md: Agent configuration and usage policy

### Defer
- Plugin documentation until Phase 2 begins (avoid premature detail)

---

## Questions for James

Q1: Should workflow-builder be mandatory for all n8n workflows or only for new/complex ones?
- Option A: Mandatory for all workflows (max consistency, slower)
- Option B: Required only for new or modified workflows (faster, some variation)
- Impact: Determines how quickly Phase 1b sources can be added without sprawl

Q2: Do you want doc-audit to run weekly automatically (hook) or manually before major changes?
- Option A: Weekly automated (higher governance, more noise)
- Option B: Manual before major changes (lower overhead)
- Impact: Drift prevention vs. operational overhead

Q3: Is the current phase truly 1d (quality improvement), or has it moved to 1e (agentic enrichment)?
- Option A: Remain 1d until validation week completes
- Option B: Advance to 1e now
- Impact: Determines what work is "allowed" without scope creep

---

## Appendix: Evidence References (Key Files Reviewed)

- docs/CLAUDE-CODE-CAPABILITIES-v2.md
- docs/CHAT-INSTRUCTIONS.md
- docs/STRATEGY.md (Sections 7 and 10)
- docs/SALES-STRATEGY.md
- ANCHOR.md
- CLAUDE.md
- STATUS.md
- ROADMAP.md
- docs/GUARDRAILS.md
- docs/DEPENDENCY-MAP.md
- docs/DOCUMENT-HYGIENE.md
- .claude/settings.json
- .claude/settings.local.json
- .claude/agents/*
- .claude/commands/*
- .claude/hooks/*
