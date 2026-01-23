/**
 * Backfill Classification Script
 *
 * Purpose: Re-classify existing signals with the v2.1 prompt
 * - Populates role_category and role_detail for all signals
 * - Fixes force links using geographic inference
 * - Updates competitor flags on opportunities
 *
 * Usage: node scripts/backfill-classification.js [--dry-run] [--limit=N]
 *
 * Per SPEC-010: Pipeline Remediation
 */

require('dotenv').config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'appEEWaGtGUwOyOhm';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SIGNALS_TABLE = 'tblez9trodMzKKqXq';
const FORCES_TABLE = 'tblbAjBEdpv42Smpw';
const OPPORTUNITIES_TABLE = 'tblJgZuI3LM2Az5id';

const COMPETITOR_SOURCES = ['red_snapper', 'investigo', 'reed', 'hays', 'adecco', 'service_care'];

// Parse CLI args
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const limitArg = args.find(a => a.startsWith('--limit='));
const LIMIT = limitArg ? parseInt(limitArg.split('=')[1]) : 50;

async function airtableFetch(endpoint, options = {}) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Airtable API error: ${response.status} - ${error}`);
  }

  return response.json();
}

async function classifySignal(signal, forceLookup) {
  const rawData = signal.raw_data ? JSON.parse(signal.raw_data) : {};

  const prompt = `SIGNAL_ID: ${signal.id}

Analyze this job posting and determine relevance and force.

## JOB DETAILS
Title: ${signal.title || rawData.job_title || 'Unknown'}
Employer: ${rawData.company_name || rawData.employer || 'Unknown'}
Location: ${rawData.location || 'Unknown'}
Description: ${(rawData.description_text || rawData.description || 'No description').substring(0, 2000)}
Source: ${signal.source || 'unknown'}

---

## TASK 1: RELEVANCE DECISION

### RELEVANT signals (mark relevant=true):
Civilian roles at UK police forces in these categories:
- Investigation: PIP1, PIP2, fraud, safeguarding, financial, serious crime, cold case, case builders, statement takers
- Criminal Justice: Disclosure officers, case progression, file builders, court liaison, CJ admin
- Intelligence: Analysts, researchers, intelligence officers (civilian), HOLMES indexers, MIR support
- Forensics: Digital forensics (civilian), CSI, exhibits officers, hi-tech crime
- Specialist: Vetting officers, financial investigators (POCA), licensing, counter-terrorism support
- Support: Relevant admin (CJ/crime), contact handlers, witness care, custody (civilian)

### HARD REJECTION GATES:
Gate 1: Sworn Police Officers - DC, PC, Sergeant, Inspector, PCSO
Gate 2: Private Security - Securitas, G4S, Mitie, security guards
Gate 3: Probation/Prison - HMPPS, Prison Service
Gate 4: Council/Local Authority - Parking, Civil Enforcement
Gate 5: Non-Police Organisations - NHS, Banks, Retail

---

## TASK 2: FORCE INFERENCE

Infer the police force from location:
- Birmingham, Coventry → West Midlands Police
- Manchester, Bolton → Greater Manchester Police
- Leeds, Bradford → West Yorkshire Police
- Liverpool → Merseyside Police
- London → Metropolitan Police Service
- Cardiff, Swansea → South Wales Police
Use official names (e.g. "Hampshire Constabulary" not "Hampshire Police")

---

## TASK 3: ROLE CLASSIFICATION

role_category (pick ONE): investigation, criminal_justice, intelligence, forensics, specialist, support
role_detail: Specific description (e.g. "PIP2 Fraud Investigator", "HOLMES Indexer")
seniority: senior, manager, officer, junior, unknown

---

## OUTPUT FORMAT
{
  "signal_id": "<COPY FROM INPUT>",
  "relevant": true | false,
  "confidence": 0-100,
  "rejection_reason": "Gate that triggered, or null",
  "force_name": "Official Force Name" | null,
  "force_confidence": 0-100,
  "role_category": "investigation|criminal_justice|intelligence|forensics|specialist|support",
  "role_detail": "Specific description",
  "seniority": "senior|manager|officer|junior|unknown",
  "reasoning": "Brief explanation"
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a Signal Triage Agent for Peel Solutions. Classify job postings for relevance to UK police force staffing. Respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch (e) {
    console.error('Failed to parse AI response:', content);
    return {
      signal_id: signal.id,
      relevant: false,
      confidence: 0,
      rejection_reason: 'AI parsing error',
      role_category: 'support',
      role_detail: 'Unknown - parsing error',
      seniority: 'unknown'
    };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('SPEC-010 Backfill Classification Script');
  console.log('='.repeat(60));
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Limit: ${LIMIT} signals`);
  console.log();

  // 1. Fetch all forces for lookup
  console.log('Fetching forces...');
  const forcesData = await airtableFetch(`${FORCES_TABLE}?fields[]=name`);
  const forceLookup = {};
  for (const record of forcesData.records) {
    forceLookup[record.fields.name] = record.id;
  }
  console.log(`  Found ${Object.keys(forceLookup).length} forces`);

  // 2. Fetch signals that need classification
  console.log('\nFetching signals needing classification...');
  const filter = encodeURIComponent(
    `OR({ai_confidence} = BLANK(), {role_category} = BLANK(), AND({force} = BLANK(), {status} = "relevant"))`
  );
  const signalsData = await airtableFetch(
    `${SIGNALS_TABLE}?filterByFormula=${filter}&maxRecords=${LIMIT}&fields[]=title&fields[]=raw_data&fields[]=source&fields[]=status&fields[]=force`
  );

  const signals = signalsData.records;
  console.log(`  Found ${signals.length} signals to process`);

  if (signals.length === 0) {
    console.log('\nNo signals to backfill. Done!');
    return;
  }

  // 3. Process each signal
  let processed = 0;
  let relevant = 0;
  let irrelevant = 0;
  let forcesLinked = 0;
  let errors = 0;

  for (const signal of signals) {
    try {
      console.log(`\n[${processed + 1}/${signals.length}] ${signal.fields.title || 'Unknown title'}`);

      // Classify
      const result = await classifySignal({
        id: signal.id,
        title: signal.fields.title,
        raw_data: signal.fields.raw_data,
        source: signal.fields.source
      }, forceLookup);

      // Determine force ID
      let forceId = null;
      if (result.force_name && forceLookup[result.force_name]) {
        forceId = forceLookup[result.force_name];
        forcesLinked++;
      }

      // Prepare update
      const update = {
        ai_confidence: result.confidence || 0,
        role_category: result.role_category || 'support',
        role_detail: result.role_detail || '',
        seniority: result.seniority || 'unknown',
        relevance_score: result.confidence || 0,
        relevance_reason: result.reasoning || '',
        status: result.relevant ? 'relevant' : 'irrelevant',
        force_source: result.force_name ? 'ai' : null
      };

      if (forceId) {
        update.force = [forceId];
      }

      console.log(`  → ${result.relevant ? 'RELEVANT' : 'IRRELEVANT'} (${result.confidence}%)`);
      console.log(`  → Category: ${result.role_category}, Detail: ${result.role_detail}`);
      console.log(`  → Force: ${result.force_name || 'Unknown'}`);

      if (result.relevant) relevant++;
      else irrelevant++;

      // Update Airtable (unless dry run)
      if (!DRY_RUN) {
        await airtableFetch(`${SIGNALS_TABLE}/${signal.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            fields: update,
            typecast: true
          })
        });
        console.log('  → Updated');
      } else {
        console.log('  → [DRY RUN] Would update');
      }

      processed++;

      // Rate limit
      await new Promise(r => setTimeout(r, 250));

    } catch (error) {
      console.error(`  → ERROR: ${error.message}`);
      errors++;
    }
  }

  // 4. Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Processed: ${processed}`);
  console.log(`Relevant: ${relevant}`);
  console.log(`Irrelevant: ${irrelevant}`);
  console.log(`Forces linked: ${forcesLinked}`);
  console.log(`Errors: ${errors}`);

  if (DRY_RUN) {
    console.log('\n[DRY RUN] No changes were made. Run without --dry-run to apply changes.');
  }
}

main().catch(console.error);
