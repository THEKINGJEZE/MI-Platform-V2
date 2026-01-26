#!/usr/bin/env node
/**
 * Document Consistency Checker
 * Run: node scripts/consistency-check.js
 *
 * Verifies:
 * 1. File references in markdown actually exist
 * 2. Key facts match across documents
 * 3. Commands reference valid files
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');

// Patterns that indicate file references
const REF_PATTERNS = [
  { name: '@reference', regex: /@([\w\-\.\/]+\.(?:md|json|js|sh))/g },
  { name: 'markdown link', regex: /\[.*?\]\((?!http|#)([\w\-\.\/]+(?:\.(?:md|json|js|sh))?)\)/g },
  { name: 'backtick path', regex: /`((?:\.\.\/|\.\/)?[\w\-\/]+\.(?:md|json|js|sh))`/g }
];

// Directories to exclude
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build'];

// Parse command line arguments
const factsOnly = process.argv.includes('--facts-only');

// Intentional patterns to skip (not errors)
// These are placeholders, templates, or documentation examples
const SKIP_PATTERNS = [
  // Future specs referenced in ROADMAP.md
  /specs\/phase-\d[a-z]?-\w+\.md$/,
  /specs\/NEXT-CONTEXT\.md$/,
  /specs\/phase-1-core-pipeline\.md$/,

  // Archive templates with YYYY-MM placeholders
  /YYYY-MM/,

  // Skills reference material
  /skills\/[\w-]+\/references\//,

  // Example/template paths in documentation
  /example|template|placeholder|path\/to\//i,

  // Documentation-only paths (skill templates, component examples)
  /\.claude\/skills\/skill-name\//,
  /forces\.json|data\.json|examples\.md|schema\.json/,
  /SKILL\.md$/,
  /\.\/src\/component\/CLAUDE\.md/,

  // n8n workflow files (may not exist locally)
  /n8n\/workflows\/[\w-]+\.json$/,

  // Scripts referenced as examples (not actual files)
  /cleanup-signals\.js|merge-opportunities\.js|recompute-priorities\.js/,

  // Paths that are clearly illustrative
  /\bpath\b(?!\/)/i,
  /dashboard_url/,

  // Archive readme templates
  /^status-YYYY-MM\.md$|^decisions-YYYY-MM\.md$/,

  // Project knowledge files (in Claude Chat, not repo)
  /peel-solutions-mi-platform|mi-platform-monitoring|mi-platform-agentic/,

  // Audit report references (historical docs that don't need to exist)
  /strategy-section-11-update\.md$/,
  /MI_Platform.*Audit.*\.md$/,
  /Market_Intelligence_Platform_Quality_Audit\.md$/,

  // Handoff documents with absolute paths (valid at time of writing)
  /^\/Users\//,

  // Script filename variations (consistency-check.js vs .cjs)
  /consistency-check\.js$/,

  // prep-spec.md references files that exist but with directory prefixes
  // These are listed without paths in the Topic Registry table
  /^force-matching\.js$/,
  /^indeed-keywords\.json$/,
  /^job-portal-filters\.js$/,
  /^job-classification\.md$/,
  /^email-triage\.md$/,
  /^competitors\.json$/,
  /^capability-areas\.json$/,
  /^airtable\.md$/,
  /^n8n\.md$/,

  // Dashboard deploy script (may not exist yet)
  /dashboard\/deploy\.sh$/,

  // Hook name references (prose mentions, not file paths)
  /^session-start\.sh$/,

  // Audit doc internal references (Claude Code settings)
  /^settings\.json$/,

  // Status archive command references (in archived status docs)
  /^docs-fetcher\.md$/,
  /^config-auditor\.md$/,
  /^improvement-planner\.md$/,

  // Clawdbot config files (outside repo at ~/.clawdbot/)
  /^clawdbot\.json$/,
  /^exec-approvals\.json$/,
];

/**
 * Check if a reference should be skipped (intentional placeholder)
 */
function shouldSkipReference(ref) {
  return SKIP_PATTERNS.some(pattern => pattern.test(ref));
}

/**
 * Recursively find markdown files in a directory
 */
function findMarkdownFilesInDir(dir, baseDir = dir) {
  const files = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath);

      // Skip excluded directories
      if (entry.isDirectory()) {
        if (!EXCLUDE_DIRS.includes(entry.name)) {
          files.push(...findMarkdownFilesInDir(fullPath, baseDir));
        }
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(relativePath);
      }
    }
  } catch (error) {
    // Silently skip directories we can't read
  }

  return files;
}

/**
 * Find all markdown files to scan
 */
function findMarkdownFiles() {
  const files = [];

  // Root level .md files
  try {
    const rootEntries = fs.readdirSync(PROJECT_ROOT);
    rootEntries.forEach(entry => {
      if (entry.endsWith('.md')) {
        files.push(entry);
      }
    });
  } catch (error) {
    // Ignore
  }

  // docs/ directory
  const docsDir = path.join(PROJECT_ROOT, 'docs');
  if (fs.existsSync(docsDir)) {
    files.push(...findMarkdownFilesInDir(docsDir, PROJECT_ROOT));
  }

  // .claude/commands/ directory
  const commandsDir = path.join(PROJECT_ROOT, '.claude/commands');
  if (fs.existsSync(commandsDir)) {
    files.push(...findMarkdownFilesInDir(commandsDir, PROJECT_ROOT));
  }

  return files;
}

/**
 * Extract file references from content
 * Returns array of {ref, line, lineNumber, patternName}
 */
function extractReferences(content, filePath) {
  const references = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    REF_PATTERNS.forEach(({ name, regex }) => {
      // Reset regex state
      regex.lastIndex = 0;

      let match;
      while ((match = regex.exec(line)) !== null) {
        const ref = match[1];

        // Skip URLs and anchor links
        if (ref.startsWith('http://') || ref.startsWith('https://') || ref.startsWith('#')) {
          continue;
        }

        references.push({
          ref,
          line: line.trim(),
          lineNumber: index + 1,
          patternName: name
        });
      }
    });
  });

  return references;
}

/**
 * Verify if a reference exists
 * Returns true if exists, false otherwise
 */
function verifyReference(ref, fromFile) {
  const fromDir = path.dirname(path.join(PROJECT_ROOT, fromFile));

  // Try different resolution strategies
  const candidatePaths = [
    // Relative to project root
    path.join(PROJECT_ROOT, ref),
    // Relative to the file containing the reference
    path.join(fromDir, ref),
    // Without leading ./
    path.join(PROJECT_ROOT, ref.replace(/^\.\//, '')),
    // Without leading ../
    path.join(fromDir, ref.replace(/^\.\.\//, ''))
  ];

  // Check if any candidate exists
  for (const candidatePath of candidatePaths) {
    if (fs.existsSync(candidatePath)) {
      return true;
    }
  }

  return false;
}

/**
 * Check all file references in markdown files
 * Returns array of missing references
 */
function checkAllReferences() {
  const files = findMarkdownFiles();
  const missing = [];
  let checkedCount = 0;

  files.forEach(file => {
    // Skip archive documents - they contain historical references that are
    // intentionally "broken" relative paths from when they were active docs
    if (file.startsWith('docs/archive/') || file.startsWith('docs\\archive\\')) {
      return;
    }

    const filePath = path.join(PROJECT_ROOT, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const references = extractReferences(content, file);

    references.forEach(({ ref, lineNumber }) => {
      // Skip intentional placeholders
      if (shouldSkipReference(ref)) {
        return;
      }

      checkedCount++;
      if (!verifyReference(ref, file)) {
        missing.push({
          from: file,
          line: lineNumber,
          ref
        });
      }
    });
  });

  return { missing, checkedCount };
}

/**
 * Extract phase from a file
 */
function extractPhase(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/\*\*Phase\*\*:\s*(.+)/);
  return match ? match[1].trim() : null;
}

/**
 * Count forces in seed file
 */
function countForces() {
  const seedPath = path.join(PROJECT_ROOT, 'airtable/forces-seed.json');

  if (!fs.existsSync(seedPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(seedPath, 'utf8');
    const data = JSON.parse(content);
    return Array.isArray(data) ? data.length : null;
  } catch (error) {
    return null;
  }
}

/**
 * Find all mentions of "X forces" in documentation
 */
function findForceCountMentions() {
  const files = findMarkdownFiles();
  const mentions = [];

  files.forEach(file => {
    const filePath = path.join(PROJECT_ROOT, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Match patterns like "43 forces", "46 police forces", etc.
      const regex = /(\d+)\s+(?:territorial\s+)?(?:police\s+)?forces/gi;
      let match;

      while ((match = regex.exec(line)) !== null) {
        const count = parseInt(match[1], 10);
        mentions.push({
          file,
          line: index + 1,
          count,
          text: line.trim()
        });
      }
    });
  });

  return mentions;
}

/**
 * Check cross-document facts
 * Returns array of mismatches
 */
function checkCrossDocumentFacts() {
  const mismatches = [];

  // Check phase alignment
  const statusPath = path.join(PROJECT_ROOT, 'STATUS.md');
  const claudePath = path.join(PROJECT_ROOT, 'CLAUDE.md');

  const statusPhase = extractPhase(statusPath);
  const claudePhase = extractPhase(claudePath);

  if (statusPhase && claudePhase && statusPhase !== claudePhase) {
    mismatches.push({
      fact: 'Phase',
      details: `STATUS.md says "${statusPhase}", CLAUDE.md says "${claudePhase}"`
    });
  }

  // Check forces count consistency
  const forcesCount = countForces();
  const mentions = findForceCountMentions();

  if (forcesCount !== null && mentions.length > 0) {
    mentions.forEach(mention => {
      if (mention.count !== forcesCount) {
        mismatches.push({
          fact: 'Forces count',
          details: `${mention.file}:${mention.line} says "${mention.count} forces", but airtable/forces-seed.json has ${forcesCount}`
        });
      }
    });
  }

  return mismatches;
}

/**
 * Check command files reference valid dependencies
 */
function checkCommands() {
  const commandsDir = path.join(PROJECT_ROOT, '.claude/commands');

  if (!fs.existsSync(commandsDir)) {
    return [];
  }

  const commandFiles = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'));
  const missing = [];

  commandFiles.forEach(file => {
    const filePath = path.join(commandsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Look for script references in bash code blocks
    const scriptMatches = content.matchAll(/(?:node|bash|sh)\s+([\w\-\/\.]+(?:\.js|\.sh))/g);

    for (const match of scriptMatches) {
      const scriptPath = match[1];
      const fullPath = path.join(PROJECT_ROOT, scriptPath);

      if (!fs.existsSync(fullPath)) {
        missing.push({
          command: file,
          ref: scriptPath
        });
      }
    }
  });

  return missing;
}

// Specs created before the Pre-Flight Checklist requirement (Decision A13, Jan 2026)
// These are grandfathered in and don't need retrofitting
const GRANDFATHERED_SPECS = [
  'SPEC-001-airtable-schema.md',
  'SPEC-002-jobs-ingestion.md',
  'SPEC-003-signal-classification.md',
  'SPEC-004-opportunity-creator.md',
  'SPEC-005-opportunity-enricher.md',
  'SPEC-006-monday-review.md',
  'SPEC-008-morning-brief.md',
  'SPEC-009-dashboard-v1-migration.md',
  'SPEC-010-SUPERSEDED-agentic-enrichment.md',
  'SPEC-010-pipeline-remediation.md',
  'SPEC-011-agent-enrichment.md',
  'SPEC-1b-competitor-monitoring.md',
];

/**
 * Check specs have pre-flight checklist
 * Returns array of specs missing checklists (only for NEW specs, not grandfathered ones)
 */
function checkSpecChecklists() {
  const specsDir = path.join(PROJECT_ROOT, 'specs');
  const warnings = [];

  if (!fs.existsSync(specsDir)) {
    return warnings;
  }

  const specFiles = fs.readdirSync(specsDir).filter(f => f.match(/^SPEC-.*\.md$/));

  specFiles.forEach(file => {
    // Skip grandfathered specs - they predate the requirement
    if (GRANDFATHERED_SPECS.includes(file)) {
      return;
    }

    const filePath = path.join(specsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Check for pre-flight checklist section
    if (!content.includes('## Pre-Flight Checklist')) {
      warnings.push({
        spec: file,
        issue: 'Missing Pre-Flight Checklist section'
      });
    }
  });

  return warnings;
}

/**
 * Main function
 */
function main() {
  console.log('=== CONSISTENCY CHECK ===\n');

  let hasErrors = false;

  // Check file references (unless --facts-only)
  if (!factsOnly) {
    const { missing, checkedCount } = checkAllReferences();
    if (missing.length > 0) {
      hasErrors = true;
      console.log(`❌ File references: ${missing.length} missing (${checkedCount} checked)`);
      missing.forEach(m => console.log(`   - ${m.from}:${m.line} → ${m.ref} (NOT FOUND)`));
    } else {
      console.log(`✅ File references: ${checkedCount} checked, 0 missing`);
    }

    console.log('');
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

  // Check command dependencies (unless --facts-only)
  if (!factsOnly) {
    const commandMissing = checkCommands();
    if (commandMissing.length > 0) {
      hasErrors = true;
      console.log(`❌ Commands: ${commandMissing.length} missing dependencies`);
      commandMissing.forEach(m => console.log(`   - ${m.command} → ${m.ref} (NOT FOUND)`));
    } else {
      console.log('✅ Commands: all dependencies exist');
    }

    console.log('');
  }

  // Check spec checklists (unless --facts-only)
  if (!factsOnly) {
    const specWarnings = checkSpecChecklists();
    if (specWarnings.length > 0) {
      // Warnings, not errors - only applies to specs created after Decision A13
      console.log(`⚠️  Specs: ${specWarnings.length} new spec(s) missing Pre-Flight Checklist`);
      specWarnings.forEach(w => console.log(`   - ${w.spec}: ${w.issue}`));
    } else {
      console.log('✅ Specs: all new specs have Pre-Flight Checklists');
    }

    console.log('');
  }

  process.exit(hasErrors ? 1 : 0);
}

main();
