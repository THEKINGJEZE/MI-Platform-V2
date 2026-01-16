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
    const filePath = path.join(PROJECT_ROOT, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const references = extractReferences(content, file);

    references.forEach(({ ref, lineNumber }) => {
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

/**
 * Main function
 */
function main() {
  console.log('=== CONSISTENCY CHECK ===\n');

  let hasErrors = false;

  // Check file references
  const { missing, checkedCount } = checkAllReferences();
  if (missing.length > 0) {
    hasErrors = true;
    console.log(`❌ File references: ${missing.length} missing (${checkedCount} checked)`);
    missing.forEach(m => console.log(`   - ${m.from}:${m.line} → ${m.ref} (NOT FOUND)`));
  } else {
    console.log(`✅ File references: ${checkedCount} checked, 0 missing`);
  }

  console.log('');

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

  // Check command dependencies
  const commandMissing = checkCommands();
  if (commandMissing.length > 0) {
    hasErrors = true;
    console.log(`❌ Commands: ${commandMissing.length} missing dependencies`);
    commandMissing.forEach(m => console.log(`   - ${m.command} → ${m.ref} (NOT FOUND)`));
  } else {
    console.log('✅ Commands: all dependencies exist');
  }

  console.log('');
  process.exit(hasErrors ? 1 : 0);
}

main();
