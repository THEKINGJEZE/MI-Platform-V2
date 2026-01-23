/**
 * UK Public Sector Domain Patterns
 *
 * Regex patterns for identifying UK public sector email domains.
 * Used by WF5 (Contact Auto-Creator) to automatically create HubSpot
 * contacts for public sector senders.
 *
 * Coverage (per Decision I3):
 * - Police forces (*.police.uk)
 * - Central government (*.gov.uk)
 * - NHS (*.nhs.uk)
 * - Ministry of Defence (*.mod.uk)
 * - Parliament (*.parliament.uk)
 * - Universities (*.ac.uk) — optional, configurable
 *
 * @see SPEC-012 Section 8b (WF5: Contact Auto-Creator)
 * @see Decision I3 in DECISIONS.md
 */

/**
 * Primary public sector domain patterns
 * These always trigger contact creation
 */
const PUBLIC_SECTOR_PATTERNS = [
  // Police forces
  /\.police\.uk$/i,

  // Central government
  /\.gov\.uk$/i,

  // NHS
  /\.nhs\.uk$/i,

  // Ministry of Defence
  /\.mod\.uk$/i,

  // Parliament
  /\.parliament\.uk$/i,
];

/**
 * Extended patterns (optional — enable via config)
 * May include contacts outside core target market
 */
const EXTENDED_PATTERNS = [
  // Universities
  /\.ac\.uk$/i,

  // Local authorities (many use gov.uk, but some don't)
  /\.co\.uk$/i, // Some councils still use .co.uk — needs manual verification

  // Fire services (often work with police)
  /fire\.gov\.uk$/i,
  /fireservice\.co\.uk$/i,
];

/**
 * Police domain extraction
 * Extracts force identifier from police domain for force matching
 *
 * Examples:
 * - john@kent.police.uk → "kent"
 * - jane@westmidlands.police.uk → "westmidlands"
 * - bob@gmp.police.uk → "gmp" (Greater Manchester Police)
 */
const POLICE_DOMAIN_REGEX = /^[^@]+@([^.]+)\.police\.uk$/i;

/**
 * Check if email domain is from UK public sector
 *
 * @param {string} email - Email address to check
 * @param {object} options - Configuration options
 * @param {boolean} options.includeExtended - Include extended patterns (universities, etc.)
 * @returns {object} { isPublicSector: boolean, domain: string, category: string }
 *
 * @example
 * isPublicSectorEmail('john@kent.police.uk')
 * // { isPublicSector: true, domain: 'kent.police.uk', category: 'police' }
 *
 * @example
 * isPublicSectorEmail('jane@homeoffice.gov.uk')
 * // { isPublicSector: true, domain: 'homeoffice.gov.uk', category: 'government' }
 *
 * @example
 * isPublicSectorEmail('sales@vendor.com')
 * // { isPublicSector: false, domain: 'vendor.com', category: null }
 */
function isPublicSectorEmail(email, options = { includeExtended: false }) {
  if (!email || typeof email !== 'string') {
    return { isPublicSector: false, domain: null, category: null };
  }

  const emailLower = email.toLowerCase();
  const domainMatch = emailLower.match(/@([^@]+)$/);

  if (!domainMatch) {
    return { isPublicSector: false, domain: null, category: null };
  }

  const domain = domainMatch[1];

  // Check primary patterns
  if (/\.police\.uk$/i.test(domain)) {
    return { isPublicSector: true, domain, category: 'police' };
  }
  if (/\.gov\.uk$/i.test(domain)) {
    return { isPublicSector: true, domain, category: 'government' };
  }
  if (/\.nhs\.uk$/i.test(domain)) {
    return { isPublicSector: true, domain, category: 'nhs' };
  }
  if (/\.mod\.uk$/i.test(domain)) {
    return { isPublicSector: true, domain, category: 'defence' };
  }
  if (/\.parliament\.uk$/i.test(domain)) {
    return { isPublicSector: true, domain, category: 'parliament' };
  }

  // Check extended patterns if enabled
  if (options.includeExtended) {
    if (/\.ac\.uk$/i.test(domain)) {
      return { isPublicSector: true, domain, category: 'academic' };
    }
  }

  return { isPublicSector: false, domain, category: null };
}

/**
 * Extract force identifier from police email domain
 * Used for force matching (G-005) to link contact to correct force
 *
 * @param {string} email - Email address
 * @returns {string|null} Force identifier or null
 *
 * @example
 * extractForceFromEmail('john@kent.police.uk')
 * // 'kent'
 *
 * @example
 * extractForceFromEmail('jane@surrey.police.uk')
 * // 'surrey'
 */
function extractForceFromEmail(email) {
  if (!email || typeof email !== 'string') {
    return null;
  }

  const match = email.match(POLICE_DOMAIN_REGEX);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Map police domain prefix to canonical force name
 * Handles variations like "gmp" → "Greater Manchester Police"
 *
 * @see patterns/force-matching.js for full mapping
 */
const POLICE_DOMAIN_TO_FORCE = {
  // Direct matches (domain prefix = force shortname)
  kent: 'Kent Police',
  surrey: 'Surrey Police',
  sussex: 'Sussex Police',
  essex: 'Essex Police',
  dorset: 'Dorset Police',
  avon: 'Avon and Somerset Police',
  devon: 'Devon & Cornwall Police',
  gloucestershire: 'Gloucestershire Constabulary',
  wiltshire: 'Wiltshire Police',
  hampshire: 'Hampshire Constabulary',
  hertfordshire: 'Hertfordshire Constabulary',
  bedfordshire: 'Bedfordshire Police',
  norfolk: 'Norfolk Constabulary',
  suffolk: 'Suffolk Constabulary',
  cambridgeshire: 'Cambridgeshire Constabulary',
  nottinghamshire: 'Nottinghamshire Police',
  leicestershire: 'Leicestershire Police',
  lincolnshire: 'Lincolnshire Police',
  northamptonshire: 'Northamptonshire Police',
  derbyshire: 'Derbyshire Constabulary',
  warwickshire: 'Warwickshire Police',
  staffordshire: 'Staffordshire Police',
  cleveland: 'Cleveland Police',
  durham: 'Durham Constabulary',
  northumbria: 'Northumbria Police',
  merseyside: 'Merseyside Police',
  cheshire: 'Cheshire Constabulary',
  cumbria: 'Cumbria Constabulary',
  lancashire: 'Lancashire Constabulary',
  humberside: 'Humberside Police',
  gwent: 'Gwent Police',

  // Abbreviations and variations
  gmp: 'Greater Manchester Police',
  met: 'Metropolitan Police Service',
  tvp: 'Thames Valley Police',
  btp: 'British Transport Police',
  westmidlands: 'West Midlands Police',
  westyorkshire: 'West Yorkshire Police',
  southyorkshire: 'South Yorkshire Police',
  northyorkshire: 'North Yorkshire Police',
  westmercia: 'West Mercia Police',
  thamesvalley: 'Thames Valley Police',
  cityoflondon: 'City of London Police',
  colp: 'City of London Police',
  dyfedpowys: 'Dyfed-Powys Police',
  northwales: 'North Wales Police',
  southwales: 'South Wales Police',
  psni: 'Police Service of Northern Ireland',
};

/**
 * Get canonical force name from email
 *
 * @param {string} email - Email address
 * @returns {string|null} Canonical force name or null
 */
function getForceFromEmail(email) {
  const forceId = extractForceFromEmail(email);
  if (!forceId) return null;

  // Check direct mapping
  if (POLICE_DOMAIN_TO_FORCE[forceId]) {
    return POLICE_DOMAIN_TO_FORCE[forceId];
  }

  // Check if the force ID contains the force name
  for (const [key, value] of Object.entries(POLICE_DOMAIN_TO_FORCE)) {
    if (forceId.includes(key) || key.includes(forceId)) {
      return value;
    }
  }

  return null;
}

// n8n Code Node compatible exports
// (n8n doesn't support ES modules, use CommonJS)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PUBLIC_SECTOR_PATTERNS,
    EXTENDED_PATTERNS,
    POLICE_DOMAIN_REGEX,
    POLICE_DOMAIN_TO_FORCE,
    isPublicSectorEmail,
    extractForceFromEmail,
    getForceFromEmail,
  };
}
