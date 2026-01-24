#!/usr/bin/env node

/**
 * Airtable Operation Verification Utility
 *
 * TRUST BUT VERIFY: After any Airtable write operation, use this script
 * to confirm records were actually created/updated with correct values.
 *
 * This solves the problem of Airtable API returning HTTP 200 success
 * when operations silently fail.
 *
 * Usage:
 *   # Verify a specific record by ID
 *   node scripts/verify-airtable-operation.cjs --table=Signals --record=recXXX --field=status --expected=classified
 *
 *   # Verify multiple fields on a record
 *   node scripts/verify-airtable-operation.cjs --table=Signals --record=recXXX --fields="status:classified,role_category:investigation"
 *
 *   # Verify record count matching a filter
 *   node scripts/verify-airtable-operation.cjs --table=Signals --filter="{status}='new'" --expected-count=5
 *
 *   # Verify records created after a timestamp
 *   node scripts/verify-airtable-operation.cjs --table=Signals --after="2026-01-24T10:00:00Z" --expected-count=3
 *
 *   # Full verification with JSON output (for Claude Code parsing)
 *   node scripts/verify-airtable-operation.cjs --table=Signals --record=recXXX --fields="status:classified" --json
 */

require('dotenv').config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'appEEWaGtGUwOyOhm';

// Table name to ID mapping
const TABLE_IDS = {
  'Signals': 'tblez9trodMzKKqXq',
  'signals': 'tblez9trodMzKKqXq',
  'Opportunities': 'tblJgZuI3LM2Az5id',
  'opportunities': 'tblJgZuI3LM2Az5id',
  'Forces': 'tblbAjBEdpv42Smpw',
  'forces': 'tblbAjBEdpv42Smpw',
  'Contacts': 'tbl0u9vy71jmyaDx1',
  'contacts': 'tbl0u9vy71jmyaDx1',
  'Emails': 'Emails',
  'emails': 'Emails',
  'Email_Raw': 'Email_Raw',
  'Decay_Alerts': 'Decay_Alerts'
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  if (!options.json) {
    console.log(colors[color] + message + colors.reset);
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function airtableFetch(endpoint, params = {}) {
  const tableId = TABLE_IDS[params.table] || params.table;
  let url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}`;

  if (params.recordId) {
    url += `/${params.recordId}`;
  }

  if (params.filter) {
    url += `?filterByFormula=${encodeURIComponent(params.filter)}`;
  }

  if (params.maxRecords) {
    url += (url.includes('?') ? '&' : '?') + `maxRecords=${params.maxRecords}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function verifyRecordExists(table, recordId) {
  try {
    const result = await airtableFetch('', { table, recordId });
    return {
      exists: true,
      record: result,
      id: result.id,
      fields: result.fields
    };
  } catch (error) {
    return {
      exists: false,
      error: error.message
    };
  }
}

async function verifyFieldValue(table, recordId, fieldName, expectedValue) {
  const recordCheck = await verifyRecordExists(table, recordId);

  if (!recordCheck.exists) {
    return {
      passed: false,
      field: fieldName,
      expected: expectedValue,
      actual: null,
      error: 'Record not found'
    };
  }

  const actualValue = recordCheck.fields[fieldName];

  // Handle different types of comparison
  let passed = false;

  if (actualValue === expectedValue) {
    passed = true;
  } else if (Array.isArray(actualValue) && actualValue.includes(expectedValue)) {
    // Linked records are arrays
    passed = true;
  } else if (typeof actualValue === 'number' && parseFloat(expectedValue) === actualValue) {
    passed = true;
  } else if (actualValue && expectedValue && String(actualValue).toLowerCase() === String(expectedValue).toLowerCase()) {
    // Case-insensitive string match
    passed = true;
  }

  return {
    passed,
    field: fieldName,
    expected: expectedValue,
    actual: actualValue,
    recordId
  };
}

async function verifyRecordCount(table, filter, expectedCount) {
  const result = await airtableFetch('', { table, filter, maxRecords: 1000 });
  const actualCount = result.records ? result.records.length : 0;

  return {
    passed: actualCount === parseInt(expectedCount),
    expectedCount: parseInt(expectedCount),
    actualCount,
    filter,
    records: result.records ? result.records.map(r => ({ id: r.id, ...r.fields })) : []
  };
}

async function verifyRecordsAfter(table, afterTimestamp, expectedCount) {
  const filter = `CREATED_TIME() > "${afterTimestamp}"`;
  return verifyRecordCount(table, filter, expectedCount);
}

function parseFields(fieldsStr) {
  // Parse "field1:value1,field2:value2" format
  const fields = {};
  const pairs = fieldsStr.split(',');

  for (const pair of pairs) {
    const [field, value] = pair.split(':').map(s => s.trim());
    if (field && value !== undefined) {
      fields[field] = value;
    }
  }

  return fields;
}

async function runVerification() {
  const results = {
    timestamp: new Date().toISOString(),
    table: options.table,
    checks: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0
    }
  };

  // Wait for Airtable eventual consistency
  if (options.wait) {
    log(`Waiting ${options.wait}ms for Airtable consistency...`, 'gray');
    await sleep(parseInt(options.wait));
  } else {
    await sleep(500); // Default 500ms wait
  }

  // Verify specific record by ID
  if (options.record) {
    // First check if record exists
    const existsCheck = await verifyRecordExists(options.table, options.record);
    results.checks.push({
      type: 'record_exists',
      recordId: options.record,
      passed: existsCheck.exists,
      details: existsCheck
    });
    results.summary.total++;
    if (existsCheck.exists) {
      results.summary.passed++;
    } else {
      results.summary.failed++;
    }

    // Then check specific field if provided
    if (options.field && options.expected) {
      const fieldCheck = await verifyFieldValue(
        options.table,
        options.record,
        options.field,
        options.expected
      );
      results.checks.push({
        type: 'field_value',
        ...fieldCheck
      });
      results.summary.total++;
      if (fieldCheck.passed) {
        results.summary.passed++;
      } else {
        results.summary.failed++;
      }
    }

    // Check multiple fields if provided
    if (options.fields) {
      const fieldsToCheck = parseFields(options.fields);

      for (const [field, expected] of Object.entries(fieldsToCheck)) {
        const fieldCheck = await verifyFieldValue(
          options.table,
          options.record,
          field,
          expected
        );
        results.checks.push({
          type: 'field_value',
          ...fieldCheck
        });
        results.summary.total++;
        if (fieldCheck.passed) {
          results.summary.passed++;
        } else {
          results.summary.failed++;
        }
      }
    }
  }

  // Verify record count with filter
  if (options.filter && options['expected-count']) {
    const countCheck = await verifyRecordCount(
      options.table,
      options.filter,
      options['expected-count']
    );
    results.checks.push({
      type: 'record_count',
      ...countCheck
    });
    results.summary.total++;
    if (countCheck.passed) {
      results.summary.passed++;
    } else {
      results.summary.failed++;
    }
  }

  // Verify records created after timestamp
  if (options.after && options['expected-count']) {
    const afterCheck = await verifyRecordsAfter(
      options.table,
      options.after,
      options['expected-count']
    );
    results.checks.push({
      type: 'records_after',
      after: options.after,
      ...afterCheck
    });
    results.summary.total++;
    if (afterCheck.passed) {
      results.summary.passed++;
    } else {
      results.summary.failed++;
    }
  }

  return results;
}

function formatResults(results) {
  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  console.log('\n' + '='.repeat(60));
  console.log('AIRTABLE VERIFICATION REPORT');
  console.log('='.repeat(60));
  console.log(`Timestamp: ${results.timestamp}`);
  console.log(`Table: ${results.table}`);
  console.log('');

  for (const check of results.checks) {
    const status = check.passed ? colors.green + '✅ PASS' : colors.red + '❌ FAIL';
    console.log(`${status}${colors.reset} | ${check.type}`);

    if (check.type === 'record_exists') {
      console.log(`     Record ID: ${check.recordId}`);
      if (!check.passed) {
        console.log(`     Error: ${check.details.error}`);
      }
    }

    if (check.type === 'field_value') {
      console.log(`     Field: ${check.field}`);
      console.log(`     Expected: ${JSON.stringify(check.expected)}`);
      console.log(`     Actual: ${JSON.stringify(check.actual)}`);
    }

    if (check.type === 'record_count' || check.type === 'records_after') {
      console.log(`     Expected count: ${check.expectedCount}`);
      console.log(`     Actual count: ${check.actualCount}`);
      if (check.filter) {
        console.log(`     Filter: ${check.filter}`);
      }
      if (check.records && check.records.length > 0 && check.records.length <= 5) {
        console.log(`     Records: ${check.records.map(r => r.id).join(', ')}`);
      }
    }

    console.log('');
  }

  console.log('-'.repeat(60));
  const summaryColor = results.summary.failed > 0 ? 'red' : 'green';
  log(`SUMMARY: ${results.summary.passed}/${results.summary.total} checks passed`, summaryColor);

  if (results.summary.failed > 0) {
    log(`\n⚠️  VERIFICATION FAILED - DO NOT MARK AS COMPLETE`, 'red');
  } else {
    log(`\n✅ VERIFICATION PASSED - Safe to proceed`, 'green');
  }

  console.log('='.repeat(60) + '\n');
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};

for (const arg of args) {
  if (arg.startsWith('--')) {
    const eqIndex = arg.indexOf('=');
    if (eqIndex > -1) {
      const key = arg.slice(2, eqIndex);
      const value = arg.slice(eqIndex + 1);
      options[key] = value;
    } else {
      options[arg.slice(2)] = true;
    }
  }
}

async function main() {
  if (!AIRTABLE_API_KEY) {
    console.error('Error: AIRTABLE_API_KEY not found in .env.local');
    process.exit(1);
  }

  if (!options.table) {
    console.log(`
Airtable Operation Verification Utility
=======================================

USAGE:

  Verify a record exists:
    node scripts/verify-airtable-operation.cjs --table=Signals --record=recXXX

  Verify a specific field value:
    node scripts/verify-airtable-operation.cjs --table=Signals --record=recXXX --field=status --expected=classified

  Verify multiple fields:
    node scripts/verify-airtable-operation.cjs --table=Signals --record=recXXX --fields="status:classified,role_category:investigation"

  Verify record count with filter:
    node scripts/verify-airtable-operation.cjs --table=Signals --filter="{status}='new'" --expected-count=5

  Verify records created after timestamp:
    node scripts/verify-airtable-operation.cjs --table=Signals --after="2026-01-24T10:00:00Z" --expected-count=3

  JSON output for Claude Code parsing:
    node scripts/verify-airtable-operation.cjs --table=Signals --record=recXXX --json

OPTIONS:

  --table           Table name (Signals, Opportunities, Contacts, Forces)
  --record          Record ID to verify (recXXX)
  --field           Single field name to check
  --expected        Expected value for single field
  --fields          Multiple fields as "field1:value1,field2:value2"
  --filter          Airtable filterByFormula
  --expected-count  Expected number of records
  --after           ISO timestamp for CREATED_TIME filter
  --wait            Milliseconds to wait before verification (default: 500)
  --json            Output results as JSON

EXAMPLES:

  After creating a signal:
    node scripts/verify-airtable-operation.cjs \\
      --table=Signals \\
      --record=rec123abc \\
      --fields="status:new,source:indeed,role_category:investigation"

  After running classifier workflow:
    node scripts/verify-airtable-operation.cjs \\
      --table=Signals \\
      --filter="{status}='classified'" \\
      --expected-count=10 \\
      --after="2026-01-24T10:00:00Z"
`);
    process.exit(0);
  }

  try {
    const results = await runVerification();
    formatResults(results);

    // Exit with error code if verification failed
    if (results.summary.failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Verification error:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
