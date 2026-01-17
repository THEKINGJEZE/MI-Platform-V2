/**
 * UK Police Force Matching Patterns
 *
 * Fuzzy matching patterns for UK police force identification.
 * Maps common variations and abbreviations to canonical force names.
 *
 * IMPORTANT: Force names MUST match exactly with Airtable Forces table.
 * Updated: 16 Jan 2026 to align with Airtable schema.
 *
 * Usage: Run JavaScript lookup BEFORE falling back to AI classification.
 * This is 200x faster and free vs AI calls.
 *
 * @see G-005 in docs/GUARDRAILS.md
 */

const FORCE_PATTERNS = {
  // Large forces
  'metropolitan police': 'Metropolitan Police Service',
  'met police': 'Metropolitan Police Service',
  'greater manchester police': 'Greater Manchester Police',
  'west midlands police': 'West Midlands Police',
  'west yorkshire police': 'West Yorkshire Police',

  // London
  'city of london police': 'City of London Police',

  // South East
  'kent police': 'Kent Police',
  'essex police': 'Essex Police',
  'surrey police': 'Surrey Police',
  'sussex police': 'Sussex Police',
  'thames valley police': 'Thames Valley Police',
  'hampshire constabulary': 'Hampshire Constabulary',
  'hertfordshire constabulary': 'Hertfordshire Constabulary',
  'bedfordshire police': 'Bedfordshire Police',

  // South West
  'avon and somerset': 'Avon and Somerset Police',
  'devon and cornwall': 'Devon & Cornwall Police',
  'dorset police': 'Dorset Police',
  'gloucestershire constabulary': 'Gloucestershire Constabulary',
  'wiltshire police': 'Wiltshire Police',

  // North West
  'merseyside police': 'Merseyside Police',
  'lancashire constabulary': 'Lancashire Constabulary',
  'cheshire constabulary': 'Cheshire Constabulary',
  'cumbria constabulary': 'Cumbria Constabulary',

  // Yorkshire & Humberside
  'south yorkshire police': 'South Yorkshire Police',
  'north yorkshire police': 'North Yorkshire Police',
  'humberside police': 'Humberside Police',

  // North East
  'northumbria police': 'Northumbria Police',
  'cleveland police': 'Cleveland Police',
  'durham constabulary': 'Durham Constabulary',

  // East Midlands
  'nottinghamshire police': 'Nottinghamshire Police',
  'leicestershire police': 'Leicestershire Police',
  'lincolnshire police': 'Lincolnshire Police',
  'northamptonshire police': 'Northamptonshire Police',
  'derbyshire constabulary': 'Derbyshire Constabulary',

  // West Midlands
  'warwickshire police': 'Warwickshire Police',
  'west mercia police': 'West Mercia Police',
  'staffordshire police': 'Staffordshire Police',

  // East
  'norfolk constabulary': 'Norfolk Constabulary',
  'suffolk constabulary': 'Suffolk Constabulary',
  'cambridgeshire constabulary': 'Cambridgeshire Constabulary',

  // Wales
  'dyfed-powys police': 'Dyfed-Powys Police',
  'gwent police': 'Gwent Police',
  'north wales police': 'North Wales Police',
  'south wales police': 'South Wales Police',

  // National/Specialist
  'british transport police': 'British Transport Police',
  'counter terrorism policing': 'Counter Terrorism Policing',
  'national crime agency': 'National Crime Agency',
  'ministry of defence police': 'Ministry of Defence Police',
  'civil nuclear constabulary': 'Civil Nuclear Constabulary'
};

/**
 * Look up a force name from company name or location string.
 *
 * @param {string} text - Company name, job title, or location to search
 * @returns {string|null} Canonical force name if matched, null otherwise
 *
 * @example
 * lookupForce('Met Police HR Team') // Returns 'Metropolitan Police Service'
 * lookupForce('Random Company Ltd') // Returns null
 */
function lookupForce(text) {
  if (!text) return null;

  const textLower = text.toLowerCase();

  for (const [pattern, forceName] of Object.entries(FORCE_PATTERNS)) {
    if (textLower.includes(pattern)) {
      return forceName;
    }
  }

  return null;
}

/**
 * Process an array of job items and add force matching.
 * Used in n8n Code nodes.
 *
 * @param {Array} items - Array of job objects with company_name field
 * @returns {Array} Items with matchedForce field added
 */
function processJobsWithForceMatching(items) {
  return items.map(item => {
    const companyName = item.company_name || item.json?.company_name || '';
    const location = item.location || item.json?.location || '';

    // Try company name first, then location
    const matchedForce = lookupForce(companyName) || lookupForce(location);

    return {
      ...item,
      matchedForce,
      forceMatchedBy: matchedForce ? 'pattern' : null
    };
  });
}

module.exports = {
  FORCE_PATTERNS,
  lookupForce,
  processJobsWithForceMatching
};
