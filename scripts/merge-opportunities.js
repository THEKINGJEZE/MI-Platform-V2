/**
 * MI Platform - Opportunity Merge Script
 *
 * Finds forces with multiple open opportunities and merges them:
 * - Keeps the oldest opportunity (most established)
 * - Merges signals from duplicates into the keeper
 * - Archives duplicate opportunities (sets status to 'dormant')
 *
 * Usage: node scripts/merge-opportunities.js [--dry-run]
 *
 * Add --dry-run to see what would be merged without making changes
 */

import 'dotenv/config';

const CHECK = '\x1b[32m✓\x1b[0m';
const CROSS = '\x1b[31m✗\x1b[0m';
const WARN = '\x1b[33m⚠\x1b[0m';

const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } = process.env;
const OPPORTUNITIES_TABLE_ID = 'tblJgZuI3LM2Az5id';
const FORCES_TABLE_ID = 'tblbAjBEdpv42Smpw';

async function fetchAllRecords(tableId, filter = null) {
  const allRecords = [];
  let offset = null;

  do {
    const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}`);
    if (filter) url.searchParams.set('filterByFormula', filter);
    if (offset) url.searchParams.set('offset', offset);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || response.statusText);
    }

    const data = await response.json();
    allRecords.push(...data.records);
    offset = data.offset;

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  } while (offset);

  return allRecords;
}

async function updateRecord(tableId, recordId, fields) {
  const response = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}/${recordId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields })
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || response.statusText);
  }

  // Rate limiting
  await new Promise(resolve => setTimeout(resolve, 200));

  return response.json();
}

function groupByForce(opportunities) {
  const groups = {};

  for (const opp of opportunities) {
    const forceId = opp.fields.force?.[0];
    if (!forceId) continue;

    if (!groups[forceId]) {
      groups[forceId] = [];
    }
    groups[forceId].push(opp);
  }

  return groups;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  console.log('');
  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│  MI PLATFORM - OPPORTUNITY MERGE                            │');
  console.log('├─────────────────────────────────────────────────────────────┤');
  console.log(`│  Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE (will merge records)'}`.padEnd(62) + '│');
  console.log('└─────────────────────────────────────────────────────────────┘');
  console.log('');

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.error(`${CROSS} Missing Airtable credentials in .env`);
    process.exit(1);
  }

  // Fetch open opportunities (not won/lost/dormant)
  console.log('Fetching open opportunities...');
  const filter = 'NOT(OR({status}="won", {status}="lost", {status}="dormant", {status}="sent"))';
  const opportunities = await fetchAllRecords(OPPORTUNITIES_TABLE_ID, filter);
  console.log(`Found ${opportunities.length} open opportunities`);

  // Fetch forces for display names
  console.log('Fetching forces...');
  const forces = await fetchAllRecords(FORCES_TABLE_ID);
  const forceNames = {};
  for (const force of forces) {
    forceNames[force.id] = force.fields.name || force.fields.short_name || 'Unknown';
  }
  console.log(`Found ${forces.length} forces`);
  console.log('');

  // Group by force
  const groups = groupByForce(opportunities);

  // Find forces with duplicates
  const duplicateForces = Object.entries(groups).filter(([_, opps]) => opps.length > 1);

  if (duplicateForces.length === 0) {
    console.log(`${CHECK} No duplicate opportunities found - all clean!`);
    return;
  }

  console.log(`${WARN} Found ${duplicateForces.length} forces with duplicate opportunities:`);
  console.log('');

  let totalMerged = 0;
  let totalArchived = 0;

  for (const [forceId, opps] of duplicateForces) {
    const forceName = forceNames[forceId] || 'Unknown Force';

    // Sort by created_at (oldest first)
    opps.sort((a, b) => {
      const aDate = new Date(a.createdTime || 0);
      const bDate = new Date(b.createdTime || 0);
      return aDate - bDate;
    });

    const keeper = opps[0];
    const duplicates = opps.slice(1);

    // Collect all signals
    const keeperSignals = keeper.fields.signals || [];
    const allSignals = [...keeperSignals];
    let hasCompetitorIntercept = keeper.fields.is_competitor_intercept;

    for (const dup of duplicates) {
      const dupSignals = dup.fields.signals || [];
      for (const signalId of dupSignals) {
        if (!allSignals.includes(signalId)) {
          allSignals.push(signalId);
        }
      }
      // Preserve competitor flag if any duplicate has it
      if (dup.fields.is_competitor_intercept) {
        hasCompetitorIntercept = true;
      }
    }

    const newSignals = allSignals.length - keeperSignals.length;

    console.log(`  ${forceName}:`);
    console.log(`    - Keeper: ${keeper.id} (${keeperSignals.length} signals)`);
    console.log(`    - Duplicates: ${duplicates.length} opportunities to archive`);
    console.log(`    - Merging ${newSignals} new signals into keeper`);
    console.log('');

    if (!dryRun) {
      // Update keeper with merged signals
      await updateRecord(OPPORTUNITIES_TABLE_ID, keeper.id, {
        signals: allSignals,
        is_competitor_intercept: hasCompetitorIntercept,
        notes: `${keeper.fields.notes || ''}\n\n[Auto-merged ${newSignals} signals from ${duplicates.length} duplicate opportunities on ${new Date().toISOString()}]`.trim()
      });

      // Archive duplicates
      for (const dup of duplicates) {
        await updateRecord(OPPORTUNITIES_TABLE_ID, dup.id, {
          status: 'dormant',
          notes: `${dup.fields.notes || ''}\n\n[Auto-archived: merged into ${keeper.id} on ${new Date().toISOString()}]`.trim()
        });
      }

      totalMerged += newSignals;
      totalArchived += duplicates.length;
    }
  }

  console.log('');
  if (dryRun) {
    const wouldMerge = duplicateForces.reduce((sum, [_, opps]) => {
      const keeper = opps[0];
      const keeperSignals = keeper.fields.signals || [];
      const allSignals = new Set(keeperSignals);
      for (const dup of opps.slice(1)) {
        for (const s of (dup.fields.signals || [])) {
          allSignals.add(s);
        }
      }
      return sum + (allSignals.size - keeperSignals.length);
    }, 0);
    const wouldArchive = duplicateForces.reduce((sum, [_, opps]) => sum + opps.length - 1, 0);

    console.log(`${WARN} DRY RUN: Would merge ~${wouldMerge} signals and archive ${wouldArchive} opportunities`);
    console.log('Run without --dry-run to apply changes');
  } else {
    console.log(`${CHECK} Merged ${totalMerged} signals, archived ${totalArchived} duplicate opportunities`);
  }
}

main().catch(err => {
  console.error(`${CROSS} Error:`, err.message);
  process.exit(1);
});
