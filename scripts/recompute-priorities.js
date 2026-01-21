/**
 * MI Platform - Recompute Priorities Script
 *
 * Fixes priority tiers for opportunities with competitor signals:
 * - Finds opportunities with competitor_job signals
 * - Sets is_competitor_intercept = true
 * - Sets priority_tier = 'hot' (per G-013)
 * - Sets priority_score >= 90
 *
 * Usage: node scripts/recompute-priorities.js [--dry-run]
 *
 * Add --dry-run to see what would be changed without making updates
 */

import 'dotenv/config';

const CHECK = '\x1b[32m✓\x1b[0m';
const CROSS = '\x1b[31m✗\x1b[0m';
const WARN = '\x1b[33m⚠\x1b[0m';

const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } = process.env;
const OPPORTUNITIES_TABLE_ID = 'tblJgZuI3LM2Az5id';
const SIGNALS_TABLE_ID = 'tblez9trodMzKKqXq';
const FORCES_TABLE_ID = 'tblbAjBEdpv42Smpw';

async function fetchAllRecords(tableId, filter = null, fields = null) {
  const allRecords = [];
  let offset = null;

  do {
    const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}`);
    if (filter) url.searchParams.set('filterByFormula', filter);
    if (fields) {
      for (const field of fields) {
        url.searchParams.append('fields[]', field);
      }
    }
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

async function updateRecords(records) {
  // Batch update - Airtable allows 10 records per request
  const batches = [];
  for (let i = 0; i < records.length; i += 10) {
    batches.push(records.slice(i, i + 10));
  }

  let updated = 0;
  for (const batch of batches) {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${OPPORTUNITIES_TABLE_ID}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          records: batch.map(r => ({
            id: r.id,
            fields: r.updates
          }))
        })
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || response.statusText);
    }

    updated += batch.length;

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return updated;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  console.log('');
  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│  MI PLATFORM - RECOMPUTE PRIORITIES (G-013)                 │');
  console.log('├─────────────────────────────────────────────────────────────┤');
  console.log(`│  Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE (will update records)'}`.padEnd(62) + '│');
  console.log('└─────────────────────────────────────────────────────────────┘');
  console.log('');

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.error(`${CROSS} Missing Airtable credentials in .env`);
    process.exit(1);
  }

  // Step 1: Fetch all competitor_job signals
  console.log('Fetching competitor signals...');
  const competitorSignals = await fetchAllRecords(
    SIGNALS_TABLE_ID,
    '{type} = "competitor_job"',
    ['title', 'force']
  );
  console.log(`Found ${competitorSignals.length} competitor signals`);

  // Build map of signal IDs that are competitor signals
  const competitorSignalIds = new Set(competitorSignals.map(s => s.id));

  // Step 2: Fetch all open opportunities
  console.log('Fetching open opportunities...');
  const filter = 'NOT(OR({status}="won", {status}="lost", {status}="dormant"))';
  const opportunities = await fetchAllRecords(
    OPPORTUNITIES_TABLE_ID,
    filter,
    ['name', 'force', 'signals', 'is_competitor_intercept', 'priority_tier', 'priority_score']
  );
  console.log(`Found ${opportunities.length} open opportunities`);

  // Fetch forces for display names
  console.log('Fetching forces...');
  const forces = await fetchAllRecords(FORCES_TABLE_ID, null, ['name', 'short_name']);
  const forceNames = {};
  for (const force of forces) {
    forceNames[force.id] = force.fields.name || force.fields.short_name || 'Unknown';
  }
  console.log('');

  // Step 3: Find opportunities that need updating
  const toUpdate = [];

  for (const opp of opportunities) {
    const signals = opp.fields.signals || [];
    const hasCompetitorSignal = signals.some(id => competitorSignalIds.has(id));

    if (!hasCompetitorSignal) continue;

    // Check if already properly flagged
    const currentlyFlagged = opp.fields.is_competitor_intercept === true;
    const currentlyHot = opp.fields.priority_tier === 'hot';
    const currentScore = opp.fields.priority_score || 0;

    if (currentlyFlagged && currentlyHot && currentScore >= 90) {
      // Already correct
      continue;
    }

    // Needs update
    const updates = {};

    if (!currentlyFlagged) {
      updates.is_competitor_intercept = true;
    }

    if (!currentlyHot) {
      updates.priority_tier = 'hot';
    }

    if (currentScore < 90) {
      updates.priority_score = Math.max(currentScore, 90);
    }

    const forceId = opp.fields.force?.[0];
    const forceName = forceNames[forceId] || 'Unknown Force';

    toUpdate.push({
      id: opp.id,
      name: opp.fields.name || 'Unnamed',
      forceName,
      updates,
      currentTier: opp.fields.priority_tier,
      currentScore: currentScore
    });
  }

  // Summary
  if (toUpdate.length === 0) {
    console.log(`${CHECK} All competitor opportunities already have correct priority (G-013 compliant)`);
    return;
  }

  console.log(`${WARN} Found ${toUpdate.length} opportunities needing priority update:`);
  console.log('');

  // Group by what needs updating
  const needsFlag = toUpdate.filter(o => o.updates.is_competitor_intercept);
  const needsHot = toUpdate.filter(o => o.updates.priority_tier);
  const needsScore = toUpdate.filter(o => o.updates.priority_score);

  if (needsFlag.length > 0) {
    console.log(`  ${needsFlag.length} opportunities need is_competitor_intercept = true`);
  }
  if (needsHot.length > 0) {
    console.log(`  ${needsHot.length} opportunities need priority_tier = 'hot'`);
    for (const o of needsHot.slice(0, 5)) {
      console.log(`    - ${o.forceName}: ${o.currentTier || 'none'} → hot`);
    }
    if (needsHot.length > 5) {
      console.log(`    ... and ${needsHot.length - 5} more`);
    }
  }
  if (needsScore.length > 0) {
    console.log(`  ${needsScore.length} opportunities need priority_score >= 90`);
    for (const o of needsScore.slice(0, 3)) {
      console.log(`    - ${o.forceName}: ${o.currentScore} → 90`);
    }
    if (needsScore.length > 3) {
      console.log(`    ... and ${needsScore.length - 3} more`);
    }
  }
  console.log('');

  if (dryRun) {
    console.log(`${WARN} DRY RUN: Would update ${toUpdate.length} opportunities`);
    console.log('Run without --dry-run to apply changes');
  } else {
    console.log(`Updating ${toUpdate.length} opportunities...`);
    const updated = await updateRecords(toUpdate);
    console.log(`${CHECK} Updated ${updated} opportunities to P1/Hot priority (G-013)`);
  }
}

main().catch(err => {
  console.error(`${CROSS} Error:`, err.message);
  process.exit(1);
});
