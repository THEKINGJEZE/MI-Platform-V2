#!/usr/bin/env node

/**
 * Test Signal Injection Utility
 *
 * Creates test signals in Airtable to trigger and verify workflows.
 * Eliminates "waiting for real signals" delays during verification.
 *
 * Usage:
 *   node scripts/inject-test-signal.cjs --type=competitor --force=Kent
 *   node scripts/inject-test-signal.cjs --type=direct --force=Hampshire
 *   node scripts/inject-test-signal.cjs --type=email --classification=lead_response
 *   node scripts/inject-test-signal.cjs --cleanup  # Remove all TEST: prefixed records
 *
 * Types:
 *   competitor  - Competitor job signal (Red Snapper, Investigo)
 *   direct      - Direct Indeed job signal
 *   email       - Email for classification
 *   decay       - Contact for decay alert testing
 */

require('dotenv').config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'appEEWaGtGUwOyOhm';

// Table IDs
const TABLES = {
  signals: 'tblez9trodMzKKqXq',
  opportunities: 'tblJgZuI3LM2Az5id',
  forces: 'tblbAjBEdpv42Smpw',
  contacts: 'tbl0u9vy71jmyaDx1',
  emails: 'Emails',
  email_raw: 'Email_Raw',
  decay_alerts: 'Decay_Alerts'
};

// Force name to ID mapping (common test forces)
const FORCE_IDS = {
  'kent': 'recKentPolice',
  'hampshire': 'recHampshireConstabulary',
  'west_midlands': 'recWestMidlandsPolice',
  'metropolitan': 'recMetropolitanPolice',
  'thames_valley': 'recThamesValleyPolice'
};

// Test signal templates
const TEMPLATES = {
  competitor: {
    title: 'TEST: PIP2 Fraud Investigator',
    source: 'red_snapper',
    status: 'new',
    url: 'https://test.example.com/job/' + Date.now(),
    external_id: 'TEST-COMP-' + Date.now(),
    role_category: 'investigation',
    role_detail: 'PIP2 Fraud Investigator - 6 month contract',
    seniority: 'officer',
    location: 'Canterbury, Kent',
    salary: '£35-40 per hour',
    description: 'TEST SIGNAL: PIP2 accredited fraud investigator required for Kent Police via Red Snapper. Immediate start, 6 month initial contract.',
    is_competitor: true,
    scrape_count: 1,
    first_seen: new Date().toISOString(),
    last_seen: new Date().toISOString()
  },

  direct: {
    title: 'TEST: Intelligence Analyst',
    source: 'indeed',
    status: 'new',
    url: 'https://test.example.com/job/' + Date.now(),
    external_id: 'TEST-DIR-' + Date.now(),
    role_category: 'intelligence',
    role_detail: 'Intelligence Analyst - Force Intelligence Bureau',
    seniority: 'officer',
    location: 'Winchester, Hampshire',
    salary: '£32,000 - £38,000',
    description: 'TEST SIGNAL: Intelligence Analyst required for Hampshire Constabulary. Permanent role in Force Intelligence Bureau.',
    is_competitor: false,
    scrape_count: 1,
    first_seen: new Date().toISOString(),
    last_seen: new Date().toISOString()
  },

  email: {
    email_id: 'TEST-EMAIL-' + Date.now(),
    subject: 'TEST: Re: Investigation capacity support',
    from_email: 'test.contact@kent.police.uk',
    from_name: 'Test Contact',
    body_preview: 'TEST EMAIL: Thank you for your email. We would be interested in discussing how Peel Solutions could support our investigation capacity...',
    received_at: new Date().toISOString(),
    folder: 'Inbox',
    has_attachments: false,
    processed: false
  },

  decay: {
    // This creates a contact with old last_contact_date to trigger decay
    name: 'TEST: Decay Test Contact',
    email: 'test.decay@kent.police.uk',
    role: 'Head of Crime',
    relationship_status: 'Active',
    last_contact_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 45 days ago
    notes: 'TEST CONTACT: Created for decay alert testing'
  }
};

async function airtableFetch(table, method = 'GET', body = null) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${table}`;
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  return response.json();
}

async function createRecord(table, fields) {
  return airtableFetch(table, 'POST', {
    records: [{ fields }],
    typecast: true
  });
}

async function findForceId(forceName) {
  // Try direct mapping first
  const normalized = forceName.toLowerCase().replace(/\s+/g, '_');
  if (FORCE_IDS[normalized]) {
    return FORCE_IDS[normalized];
  }

  // Query Airtable for force
  const formula = encodeURIComponent(`SEARCH("${forceName}", {name})`);
  const result = await airtableFetch(`${TABLES.forces}?filterByFormula=${formula}&maxRecords=1`);

  if (result.records && result.records.length > 0) {
    return result.records[0].id;
  }

  return null;
}

async function cleanupTestRecords() {
  console.log('Cleaning up TEST: prefixed records...\n');

  const tables = ['signals', 'opportunities', 'contacts', 'emails', 'email_raw', 'decay_alerts'];
  let totalDeleted = 0;

  for (const table of tables) {
    const tableId = TABLES[table];
    const formula = encodeURIComponent(`OR(SEARCH("TEST:", {title}), SEARCH("TEST:", {name}), SEARCH("TEST:", {subject}))`);

    try {
      const result = await airtableFetch(`${tableId}?filterByFormula=${formula}&maxRecords=100`);

      if (result.records && result.records.length > 0) {
        console.log(`Found ${result.records.length} test records in ${table}`);

        for (const record of result.records) {
          await airtableFetch(`${tableId}/${record.id}`, 'DELETE');
          totalDeleted++;
          await new Promise(r => setTimeout(r, 200)); // Rate limit
        }
      }
    } catch (e) {
      // Table might not have the field, skip
    }
  }

  console.log(`\nDeleted ${totalDeleted} test records`);
}

async function injectSignal(type, forceName) {
  const template = TEMPLATES[type];
  if (!template) {
    console.error(`Unknown type: ${type}`);
    console.log('Valid types: competitor, direct, email, decay');
    process.exit(1);
  }

  const fields = { ...template };

  // Handle force linking for signals
  if (type === 'competitor' || type === 'direct') {
    if (forceName) {
      const forceId = await findForceId(forceName);
      if (forceId) {
        fields.force = [forceId];
        fields.force_source = 'matched';
        console.log(`Linked to force: ${forceName} (${forceId})`);
      } else {
        console.log(`Force "${forceName}" not found, signal will need classification`);
      }
    }

    // Update location based on force
    if (forceName) {
      fields.company = forceName.includes('Police') ? forceName : `${forceName} Police`;
    }

    const result = await createRecord(TABLES.signals, fields);

    if (result.records && result.records.length > 0) {
      const record = result.records[0];
      console.log(`\n✅ Created test signal:`);
      console.log(`   ID: ${record.id}`);
      console.log(`   Title: ${fields.title}`);
      console.log(`   Type: ${type}`);
      console.log(`   Status: ${fields.status}`);
      console.log(`   Source: ${fields.source}`);
      return record.id;
    }
  }

  // Handle email injection
  if (type === 'email') {
    const result = await createRecord(TABLES.email_raw, fields);

    if (result.records && result.records.length > 0) {
      const record = result.records[0];
      console.log(`\n✅ Created test email:`);
      console.log(`   ID: ${record.id}`);
      console.log(`   Subject: ${fields.subject}`);
      console.log(`   From: ${fields.from_email}`);
      return record.id;
    }
  }

  // Handle decay contact injection
  if (type === 'decay') {
    if (forceName) {
      const forceId = await findForceId(forceName);
      if (forceId) {
        fields.force = [forceId];
      }
    }

    const result = await createRecord(TABLES.contacts, fields);

    if (result.records && result.records.length > 0) {
      const record = result.records[0];
      console.log(`\n✅ Created test contact for decay:`);
      console.log(`   ID: ${record.id}`);
      console.log(`   Name: ${fields.name}`);
      console.log(`   Last Contact: ${fields.last_contact_date} (45 days ago)`);
      return record.id;
    }
  }

  console.error('Failed to create record:', result);
  return null;
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};

for (const arg of args) {
  if (arg === '--cleanup') {
    options.cleanup = true;
  } else if (arg.startsWith('--')) {
    const [key, value] = arg.slice(2).split('=');
    options[key] = value;
  }
}

async function main() {
  if (!AIRTABLE_API_KEY) {
    console.error('Error: AIRTABLE_API_KEY not found in .env.local');
    process.exit(1);
  }

  console.log('Test Signal Injection Utility');
  console.log('============================\n');

  if (options.cleanup) {
    await cleanupTestRecords();
    return;
  }

  if (!options.type) {
    console.log('Usage:');
    console.log('  node scripts/inject-test-signal.cjs --type=competitor --force=Kent');
    console.log('  node scripts/inject-test-signal.cjs --type=direct --force=Hampshire');
    console.log('  node scripts/inject-test-signal.cjs --type=email');
    console.log('  node scripts/inject-test-signal.cjs --type=decay --force=Kent');
    console.log('  node scripts/inject-test-signal.cjs --cleanup');
    console.log('\nTypes: competitor, direct, email, decay');
    process.exit(0);
  }

  await injectSignal(options.type, options.force);
}

main().catch(console.error);
