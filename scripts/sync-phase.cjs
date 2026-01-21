#!/usr/bin/env node
/**
 * Phase Synchronization Script
 * Run: node scripts/sync-phase.cjs
 *
 * Syncs the phase from STATUS.md to CLAUDE.md
 * Prevents cross-document phase drift
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const STATUS_PATH = path.join(PROJECT_ROOT, 'STATUS.md');
const CLAUDE_PATH = path.join(PROJECT_ROOT, 'CLAUDE.md');

/**
 * Extract phase from a file using the **Phase**: pattern
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
 * Update phase in CLAUDE.md
 */
function updateClaudePhase(newPhase) {
  if (!fs.existsSync(CLAUDE_PATH)) {
    console.error('ERROR: CLAUDE.md not found');
    return false;
  }

  const content = fs.readFileSync(CLAUDE_PATH, 'utf8');
  const currentMatch = content.match(/\*\*Phase\*\*:\s*(.+)/);

  if (!currentMatch) {
    console.error('ERROR: Could not find **Phase**: pattern in CLAUDE.md');
    return false;
  }

  const currentPhase = currentMatch[1].trim();

  if (currentPhase === newPhase) {
    console.log(`✅ Phase already in sync: ${newPhase}`);
    return true;
  }

  const updatedContent = content.replace(
    /\*\*Phase\*\*:\s*.+/,
    `**Phase**: ${newPhase}`
  );

  fs.writeFileSync(CLAUDE_PATH, updatedContent, 'utf8');
  console.log(`✅ Phase synced: "${currentPhase}" → "${newPhase}"`);
  return true;
}

/**
 * Main function
 */
function main() {
  console.log('=== PHASE SYNC ===\n');

  // Extract phase from STATUS.md (source of truth)
  const statusPhase = extractPhase(STATUS_PATH);
  if (!statusPhase) {
    console.error('ERROR: Could not extract phase from STATUS.md');
    process.exit(1);
  }
  console.log(`STATUS.md phase: ${statusPhase}`);

  // Extract current phase from CLAUDE.md
  const claudePhase = extractPhase(CLAUDE_PATH);
  if (!claudePhase) {
    console.error('ERROR: Could not extract phase from CLAUDE.md');
    process.exit(1);
  }
  console.log(`CLAUDE.md phase: ${claudePhase}`);
  console.log('');

  // Sync if different
  if (statusPhase !== claudePhase) {
    console.log('Phase mismatch detected. Syncing...');
    const success = updateClaudePhase(statusPhase);
    process.exit(success ? 0 : 1);
  } else {
    console.log('✅ Phases already aligned');
    process.exit(0);
  }
}

main();
