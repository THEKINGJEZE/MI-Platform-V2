/**
 * MI Platform - Signal Cleanup Script
 *
 * Reclassifies signals that should be irrelevant:
 * 1. Signals with relevance_reason containing "not a police force"
 * 2. Signals with titles containing sworn officer keywords
 * 3. Signals with non-police organization keywords
 *
 * Usage: node scripts/cleanup-signals.js [--dry-run]
 *
 * Add --dry-run to see what would be changed without making updates
 */

import 'dotenv/config';

const CHECK = '\x1b[32m✓\x1b[0m';
const CROSS = '\x1b[31m✗\x1b[0m';
const WARN = '\x1b[33m⚠\x1b[0m';

const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } = process.env;
const SIGNALS_TABLE_ID = 'tblez9trodMzKKqXq';

// Keywords that indicate sworn officer roles (Gate 1)
const SWORN_OFFICER_KEYWORDS = [
  'detective constable', 'detective sergeant', 'detective inspector',
  'police constable', 'sergeant', 'inspector', 'superintendent',
  'pcso', 'police community support officer', 'special constable',
  'dci', 'dcs', 'dc ', ' pc ', 'ds ', 'di '
];

// Keywords that indicate non-police organizations (Gate 2)
const NON_POLICE_ORG_KEYWORDS = [
  'nhs', 'hospital', 'health trust', 'ccg', 'environment agency',
  'probation', 'hmpps', 'barclays', 'hsbc', 'lloyds', 'natwest',
  'tesco', 'sainsbury', 'iopc', 'prison', 'custody assistant'
];

// Keywords that indicate the reasoning said "not a police force"
const NOT_POLICE_REASON_KEYWORDS = [
  'not a police force', 'not police', 'non-police', 'private sector',
  'not law enforcement', 'not uk police'
];

async function fetchSignals(filter) {
  const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${SIGNALS_TABLE_ID}`);
  url.searchParams.set('filterByFormula', filter);
  url.searchParams.set('fields[]', 'title');
  url.searchParams.append('fields[]', 'status');
  url.searchParams.append('fields[]', 'relevance_reason');
  url.searchParams.append('fields[]', 'type');
  url.searchParams.append('fields[]', 'source');

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || response.statusText);
  }

  return response.json();
}

async function updateSignals(records) {
  // Batch update - Airtable allows 10 records per request
  const batches = [];
  for (let i = 0; i < records.length; i += 10) {
    batches.push(records.slice(i, i + 10));
  }

  let updated = 0;
  for (const batch of batches) {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${SIGNALS_TABLE_ID}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          records: batch.map(r => ({
            id: r.id,
            fields: { status: 'irrelevant' }
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

function shouldBeIrrelevant(signal) {
  const title = (signal.fields.title || '').toLowerCase();
  const reason = (signal.fields.relevance_reason || '').toLowerCase();

  // Check for sworn officer keywords in title
  for (const keyword of SWORN_OFFICER_KEYWORDS) {
    if (title.includes(keyword)) {
      return { should: true, reason: `Title contains sworn officer keyword: "${keyword}"` };
    }
  }

  // Check for non-police org keywords in title
  for (const keyword of NON_POLICE_ORG_KEYWORDS) {
    if (title.includes(keyword)) {
      return { should: true, reason: `Title contains non-police org keyword: "${keyword}"` };
    }
  }

  // Check for "not a police force" in relevance_reason
  for (const keyword of NOT_POLICE_REASON_KEYWORDS) {
    if (reason.includes(keyword)) {
      return { should: true, reason: `Relevance reason indicates: "${keyword}"` };
    }
  }

  return { should: false, reason: null };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  console.log('');
  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│  MI PLATFORM - SIGNAL CLEANUP                               │');
  console.log('├─────────────────────────────────────────────────────────────┤');
  console.log(`│  Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE (will update records)'}`.padEnd(62) + '│');
  console.log('└─────────────────────────────────────────────────────────────┘');
  console.log('');

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.error(`${CROSS} Missing Airtable credentials in .env`);
    process.exit(1);
  }

  // Fetch all signals with status = 'relevant'
  console.log('Fetching relevant signals...');
  const { records } = await fetchSignals('{status} = "relevant"');
  console.log(`Found ${records.length} relevant signals to check`);
  console.log('');

  // Check each signal
  const toUpdate = [];
  const reasons = {};

  for (const signal of records) {
    const check = shouldBeIrrelevant(signal);
    if (check.should) {
      toUpdate.push(signal);
      reasons[signal.id] = check.reason;
    }
  }

  console.log(`${WARN} Found ${toUpdate.length} signals that should be irrelevant:`);
  console.log('');

  // Group by reason type
  const byReason = {};
  for (const signal of toUpdate) {
    const reason = reasons[signal.id];
    if (!byReason[reason]) byReason[reason] = [];
    byReason[reason].push(signal);
  }

  for (const [reason, signals] of Object.entries(byReason)) {
    console.log(`  ${reason}: ${signals.length} signals`);
    // Show first 3 examples
    for (const signal of signals.slice(0, 3)) {
      console.log(`    - ${signal.fields.title?.substring(0, 50) || 'No title'}...`);
    }
    if (signals.length > 3) {
      console.log(`    ... and ${signals.length - 3} more`);
    }
    console.log('');
  }

  if (toUpdate.length === 0) {
    console.log(`${CHECK} No signals need reclassification`);
    return;
  }

  if (dryRun) {
    console.log(`${WARN} DRY RUN: Would update ${toUpdate.length} signals to 'irrelevant'`);
    console.log('Run without --dry-run to apply changes');
  } else {
    console.log(`Updating ${toUpdate.length} signals to 'irrelevant'...`);
    const updated = await updateSignals(toUpdate);
    console.log(`${CHECK} Updated ${updated} signals`);
  }
}

main().catch(err => {
  console.error(`${CROSS} Error:`, err.message);
  process.exit(1);
});
