# Claude Code Best Practices

Patterns and techniques for getting the most out of Claude Code on this project.

## Writer-Reviewer Pattern

Use parallel Claude sessions for code quality: one writes, one reviews.

### When to Use
- Before merging significant changes
- Complex refactoring affecting multiple files
- Critical path code (workflows, data processing)
- When you want a second perspective

### Setup

**Session A (Writer)**: Your main development session
```
# Working on the feature
Implement the contact research agent for WF5
```

**Session B (Reviewer)**: Separate terminal or worktree
```
# Review the implementation
Review the contact research changes in n8n/workflows/wf5-agent-enrichment.json.

Check for:
- Edge cases and error handling
- Consistency with existing patterns
- Guardrail compliance (G-001 through G-015)
- Performance concerns
- Security issues
```

**Session A (Iterate)**: Apply feedback
```
Here's the feedback from review: [paste Session B output]. Address these issues.
```

### Practical Tips

1. **Use git worktrees** for parallel sessions on same repo
2. **Keep reviewer read-only** to avoid conflicts
3. **Focus reviewer on specific concerns** rather than general review
4. **Document patterns discovered** for future sessions

### Alternative: Subagent Review

For lighter-weight review within a single session:
```
Use a subagent to review this code for:
- Edge cases I might have missed
- Consistency with our n8n patterns
- Guardrail violations
```

This keeps context in one place but still gets a second perspective.

---

## Headless Mode for Automation

Run Claude without interactive session for CI/CD and scripting.

### Quick Query
```bash
claude -p "What tables exist in the MI Platform Airtable base?"
```

### Structured Output
```bash
claude -p "List all n8n workflows" --output-format json
```

### Pre-Commit Review (Potential)
```bash
# .git/hooks/pre-commit
claude -p "Review these staged changes for issues: $(git diff --cached)" \
  --output-format json | jq '.issues'
```

### Batch Processing
```bash
# Process multiple files
for spec in specs/SPEC-*.md; do
  claude -p "Validate $spec against ROADMAP.md acceptance criteria" \
    --allowedTools "Read,Glob"
done
```

---

## Context Management Techniques

### When to Use Each Command

| Scenario | Command | Why |
|----------|---------|-----|
| Starting unrelated work | `/clear` | Fresh context, no pollution |
| Made a mistake | `/rewind` | Restore code + conversation state |
| Context getting long | `/compact` | Intelligent compression |
| Need specific state | `--continue` / `--resume` | Resume named session |

### Subagents for Deep Research

Keep main context clean by delegating investigation:
```
Use a subagent to trace how jobs flow from Indeed scraping to
opportunity creation. Report the file paths and key functions.
```

The subagent explores thoroughly, then reports back concisely.

### Checkpoint Before Risk

Before risky operations (workflow changes, schema changes):
```
I'm about to modify the jobs classifier. Current state:
- WF3 is active at version X
- Signals table has Y records

[make changes]

If something breaks, /rewind to this point.
```

---

## Verification Patterns

### Always Provide Success Criteria

```
# Bad
Fix the classification bug

# Good
Fix the classification bug. Success criteria:
- Test signal "PIP2 Investigator at Kent Police" classified as relevant
- Test signal "Admin Assistant" classified as irrelevant
- Run 10 test cases and report accuracy
```

### Use Scripts for Verification

```
After making changes, verify with:
1. node scripts/health-check.js — all connections work
2. node scripts/consistency-check.cjs — no broken references
3. Manual test: trigger WF3 with test payload
```

### Screenshot Verification (Dashboard)

When Claude makes UI changes:
```
Take a screenshot of the review panel and verify:
- Priority badge visible
- Force name displayed
- Action buttons aligned
```

(Requires Chrome extension for browser automation)

---

---

## Chrome Extension for UI Verification

Use the Claude Chrome extension to verify UI changes, test interactions, and debug web applications.

### Prerequisites

- **Claude Code**: v2.0.73+ (we have v2.1.17 ✅)
- **Chrome Extension**: v1.0.36+ ([Install from Chrome Web Store](https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn))
- **Paid Claude plan**: Required

### Setup

1. Install the Chrome extension from the link above
2. Start Claude Code with Chrome enabled:
   ```bash
   claude --chrome
   ```
3. Or enable by default:
   ```bash
   /chrome
   # Select "Enabled by default"
   ```

**Note**: Enabling by default increases context usage since browser tools are always loaded.

### Usage Examples

**Test Dashboard Changes**:
```
Go to localhost:3000/review, verify the priority badges display correctly,
and check that keyboard navigation (j/k) works for moving between items.
```

**Verify Error States**:
```
Open the dashboard, trigger the error state by disconnecting the network,
and verify the error message and retry button appear correctly.
```

**Debug Console Issues**:
```
Open https://dashboard.peelplatforms.co.uk/review and check the console
for any JavaScript errors during page load.
```

**Record Demo GIF**:
```
Record a GIF showing the full review workflow: selecting an opportunity,
editing the message, and sending it.
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Extension not detected | Run `/chrome` and select "Reconnect extension" |
| Browser not responding | Check for modal dialogs blocking interaction |
| Permission denied | Configure site permissions in Chrome extension settings |

---

## Pre-Commit Hooks with Claude

Automatically review code before commits using headless Claude.

### Setup

The pre-commit hook is located at `.git/hooks/pre-commit`. It runs Claude to review staged changes and can block commits with issues.

### Current Hook (Light Review)

Our pre-commit hook performs a light review focused on:
- Guardrail violations (G-001 through G-015)
- Obvious bugs or security issues
- Breaking changes to critical files

### Manual Pre-Commit Review

For more thorough review before important commits:
```bash
# Review all staged changes
git diff --cached | claude -p "Review these changes for issues. Focus on:
1. Guardrail violations
2. Security concerns
3. Breaking changes
Report as JSON: {issues: [{severity, file, description}]}" --output-format json
```

### Bypass for Trivial Commits

Skip the hook for trivial changes:
```bash
git commit --no-verify -m "fix: typo in README"
```

**Use sparingly** — the hook exists to catch issues.

---

## Related Documentation

- Session protocol: @CLAUDE.md
- Document hygiene: @docs/DOCUMENT-HYGIENE.md
- MCP servers: @.claude/MCP-SERVERS.md
- Official best practices: https://code.claude.com/docs/en/best-practices
- Chrome extension docs: https://code.claude.com/docs/en/chrome
