# Spec: Document Consistency Checker

## Purpose

Prevent document drift by automatically verifying that:
1. File references in markdown actually exist
2. Key facts match across documents
3. No phantom commands or specs are referenced

## When to Run

- **Session start** (via hook) — warn on issues
- **On demand** — `/project:consistency-check` command
- **Pre-commit** (optional future) — block commits with broken refs

## What to Check

### 1. File Reference Verification

Scan all `.md` files in project root and `docs/` for patterns:
- `@filename` references (Claude Code style)
- `[text](path)` markdown links
- Backtick paths like \`specs/something.md\`

For each reference, verify the file exists. Report missing files.

**Exclude**: 
- URLs (http/https)
- Anchor links (#section)
- node_modules, .git

### 2. Cross-Document Fact Matching

Check these specific facts are consistent:

| Fact | Source of Truth | Check Against |
|------|-----------------|---------------|
| Current phase name | STATUS.md `**Phase**:` line | CLAUDE.md `**Phase**:` line |
| Forces count | `airtable/forces-seed.json` array length | Any doc mentioning "X forces" |

### 3. Command Verification

For each command in `.claude/commands/`:
- If it references a workflow file, verify that file exists
- If it references a script, verify script exists

## Output Format

```
=== CONSISTENCY CHECK ===

✅ File references: 47 checked, 0 missing
❌ File references: 2 missing
   - CLAUDE.md:32 → @specs/phase-1-core-pipeline.md (NOT FOUND)
   - docs/architecture.md:15 → ../workflows/ingest.json (NOT FOUND)

✅ Cross-document facts: aligned
❌ Cross-document facts: 1 mismatch
   - Phase: STATUS.md says "Phase 1", CLAUDE.md says "Phase 2"

✅ Commands: all dependencies exist
```

## Implementation

Create `scripts/consistency-check.cjs`:

```javascript
#!/usr/bin/env node
/**
 * Document Consistency Checker
 * Run: node scripts/consistency-check.cjs
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');

// Files to scan for references
const SCAN_PATTERNS = [
  '*.md',
  'docs/*.md',
  '.claude/commands/*.md'
];

// Patterns that indicate file references
const REF_PATTERNS = [
  /@([\w\-\.\/]+\.(?:md|json|js|sh))/g,           // @filename.ext
  /\[.*?\]\((?!http)([\w\-\.\/]+)\)/g,            // [text](relative/path)
  /`((?:\.\.\/|\.\/)?[\w\-\/]+\.(?:md|json|js))`/g // `path/file.ext`
];

function findMarkdownFiles() {
  // Implementation: glob SCAN_PATTERNS
}

function extractReferences(content, filePath) {
  // Implementation: apply REF_PATTERNS, return array of {ref, line}
}

function verifyReference(ref, fromFile) {
  // Implementation: resolve path, check fs.existsSync
}

function checkCrossDocumentFacts() {
  // Implementation: 
  // 1. Extract phase from STATUS.md
  // 2. Extract phase from CLAUDE.md  
  // 3. Compare
  // 4. Count forces in seed file
  // 5. Search docs for force count mentions
}

function main() {
  console.log('=== CONSISTENCY CHECK ===\n');
  
  let hasErrors = false;
  
  // Check file references
  const missing = checkAllReferences();
  if (missing.length > 0) {
    hasErrors = true;
    console.log(`❌ File references: ${missing.length} missing`);
    missing.forEach(m => console.log(`   - ${m.from}:${m.line} → ${m.ref} (NOT FOUND)`));
  } else {
    console.log('✅ File references: all valid');
  }
  
  // Check cross-document facts
  const mismatches = checkCrossDocumentFacts();
  if (mismatches.length > 0) {
    hasErrors = true;
    console.log(`❌ Cross-document facts: ${mismatches.length} mismatch(es)`);
    mismatches.forEach(m => console.log(`   - ${m.fact}: ${m.details}`));
  } else {
    console.log('✅ Cross-document facts: aligned');
  }
  
  console.log('');
  process.exit(hasErrors ? 1 : 0);
}

main();
```

## Integration

### 1. Add to session-start hook

In `.claude/hooks/session-start.sh`, add:

```bash
# Consistency check
echo "🔍 CONSISTENCY CHECK:"
node scripts/consistency-check.cjs 2>/dev/null || echo "   ⚠️  Run 'node scripts/consistency-check.cjs' for details"
echo ""
```

### 2. Add slash command

Create `.claude/commands/consistency-check.md`:

```markdown
# Consistency Check

Verify document references and cross-document facts are aligned.

## Run

```bash
node scripts/consistency-check.cjs
```

If issues found, fix the source of truth first, then update references.
```

## Acceptance Criteria

- [ ] Script runs without errors on clean project
- [ ] Script catches the phantom spec reference we just fixed
- [ ] Script reports phase mismatch if STATUS.md and CLAUDE.md disagree
- [ ] Hook shows warning on session start if issues exist
- [ ] Exit code 1 on failures (for future CI integration)

---

*This spec ready for Claude Code implementation.*
