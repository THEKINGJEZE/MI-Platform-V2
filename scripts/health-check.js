/**
 * MI Platform Health Check
 * Verifies all system connections: Airtable, n8n, HubSpot, Claude API
 * 
 * Usage: node scripts/health-check.js
 */

import 'dotenv/config';

const CHECK = '\x1b[32m✅\x1b[0m';
const CROSS = '\x1b[31m❌\x1b[0m';

async function checkAirtable() {
  const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } = process.env;
  
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return { ok: false, msg: 'Missing credentials' };
  }
  
  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Forces?maxRecords=1`,
      { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } }
    );
    
    if (!res.ok) {
      const err = await res.json();
      return { ok: false, msg: err.error?.message || res.statusText };
    }
    
    // Get record count
    const countRes = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Forces`,
      { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } }
    );
    const data = await countRes.json();
    const count = data.records?.length || 0;
    
    return { ok: true, msg: `Connected (Forces: ${count} records)` };
  } catch (e) {
    return { ok: false, msg: e.message };
  }
}

async function checkN8n() {
  const { N8N_API_URL, N8N_API_KEY } = process.env;
  
  if (!N8N_API_URL || !N8N_API_KEY) {
    return { ok: false, msg: 'Missing credentials' };
  }
  
  try {
    const res = await fetch(`${N8N_API_URL}/workflows`, {
      headers: { 'X-N8N-API-KEY': N8N_API_KEY }
    });
    
    if (!res.ok) return { ok: false, msg: res.statusText };
    
    const data = await res.json();
    const workflows = data.data || [];
    const active = workflows.filter(w => w.active).length;
    
    return { ok: true, msg: `Connected (${workflows.length} workflows, ${active} active)` };
  } catch (e) {
    return { ok: false, msg: e.message };
  }
}

async function checkHubSpot() {
  const { HUBSPOT_API_KEY } = process.env;
  
  if (!HUBSPOT_API_KEY) {
    return { ok: false, msg: 'Missing credentials' };
  }
  
  try {
    const res = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
      headers: { Authorization: `Bearer ${HUBSPOT_API_KEY}` }
    });
    
    if (!res.ok) {
      const err = await res.json();
      return { ok: false, msg: err.message || res.statusText };
    }
    
    return { ok: true, msg: 'Connected' };
  } catch (e) {
    return { ok: false, msg: e.message };
  }
}

async function checkClaudeAPI() {
  const { ANTHROPIC_API_KEY } = process.env;
  
  if (!ANTHROPIC_API_KEY) {
    return { ok: false, msg: 'Missing credentials' };
  }
  
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'ping' }]
      })
    });
    
    if (!res.ok) {
      const err = await res.json();
      return { ok: false, msg: err.error?.message || res.statusText };
    }
    
    return { ok: true, msg: 'Connected' };
  } catch (e) {
    return { ok: false, msg: e.message };
  }
}

async function main() {
  console.log('');
  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│  MI PLATFORM HEALTH CHECK                                   │');
  console.log('├─────────────────────────────────────────────────────────────┤');
  
  const results = await Promise.all([
    checkAirtable(),
    checkN8n(),
    checkHubSpot(),
    checkClaudeAPI()
  ]);
  
  const names = ['Airtable', 'n8n', 'HubSpot', 'Claude API'];
  
  results.forEach((r, i) => {
    const icon = r.ok ? CHECK : CROSS;
    const name = names[i].padEnd(11);
    const msg = r.msg.substring(0, 42).padEnd(42);
    console.log(`│  ${name}: ${icon} ${msg}│`);
  });
  
  console.log('└─────────────────────────────────────────────────────────────┘');
  console.log('');
  
  const allOk = results.every(r => r.ok);
  console.log(allOk 
    ? `${CHECK} All systems operational. Ready to build!`
    : `${CROSS} Some checks failed. Fix errors above.`
  );
  
  if (!allOk) process.exit(1);
}

main().catch(console.error);
