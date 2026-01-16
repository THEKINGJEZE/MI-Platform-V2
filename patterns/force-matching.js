/**
 * UK Police Force Matching Patterns
 *
 * 47 fuzzy matching patterns for UK police force identification.
 * Maps common variations and abbreviations to canonical force names.
 *
 * Usage: Run JavaScript lookup BEFORE falling back to AI classification.
 * This is 200x faster and free vs AI calls.
 *
 * Source: Extracted from MI-Platform-Fresh-Start indeed-receiver-bright-data.json
 * Related: reference-data/uk-police-forces.json contains 48 official forces
 *
 * @see DEC-304 in docs/GUARDRAILS.md
 */

const FORCE_PATTERNS = {
  'metropolitan police': 'Metropolitan Police Service',
  'met police': 'Metropolitan Police Service',
  'city of london police': 'City of London Police',
  'greater manchester police': 'Greater Manchester Police',
  'west midlands police': 'West Midlands Police',
  'west yorkshire police': 'West Yorkshire Police',
  'merseyside police': 'Merseyside Police',
  'south yorkshire police': 'South Yorkshire Police',
  'thames valley police': 'Thames Valley Police',
  'hampshire constabulary': 'Hampshire Constabulary',
  'hampshire & isle of wight constabulary': 'Hampshire & Isle Of Wight Constabulary',
  'hampshire and isle of wight': 'Hampshire & Isle Of Wight Constabulary',
  'kent police': 'Kent Police',
  'essex police': 'Essex Police',
  'surrey police': 'Surrey Police',
  'sussex police': 'Sussex Police',
  'avon and somerset': 'Avon and Somerset Constabulary',
  'devon and cornwall': 'Devon and Cornwall Police',
  'dorset police': 'Dorset Police',
  'lancashire constabulary': 'Lancashire Constabulary',
  'nottinghamshire police': 'Nottinghamshire Police',
  'northumbria police': 'Northumbria Police',
  'cleveland police': 'Cleveland Police',
  'durham constabulary': 'Durham Constabulary',
  'north yorkshire police': 'North Yorkshire Police',
  'humberside police': 'Humberside Police',
  'lincolnshire police': 'Lincolnshire Police',
  'norfolk constabulary': 'Norfolk Constabulary',
  'suffolk constabulary': 'Suffolk Constabulary',
  'cambridgeshire constabulary': 'Cambridgeshire Constabulary',
  'bedfordshire police': 'Bedfordshire Police',
  'hertfordshire constabulary': 'Hertfordshire Constabulary',
  'leicestershire police': 'Leicestershire Police',
  'northamptonshire police': 'Northamptonshire Police',
  'warwickshire police': 'Warwickshire Police',
  'west mercia police': 'West Mercia Police',
  'staffordshire police': 'Staffordshire Police',
  'derbyshire constabulary': 'Derbyshire Constabulary',
  'cheshire constabulary': 'Cheshire Constabulary',
  'cumbria constabulary': 'Cumbria Constabulary',
  'gloucestershire constabulary': 'Gloucestershire Constabulary',
  'wiltshire police': 'Wiltshire Police',
  'dyfed-powys police': 'Dyfed-Powys Police',
  'gwent police': 'Gwent Police',
  'north wales police': 'North Wales Police',
  'south wales police': 'South Wales Police',
  'police scotland': 'Police Scotland',
  'psni': 'Police Service of Northern Ireland',
  'british transport police': 'British Transport Police',
  'counter terrorism policing': 'Counter Terrorism Policing'
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
