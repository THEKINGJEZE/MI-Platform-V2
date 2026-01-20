/**
 * Airtable API Client
 *
 * Handles all Airtable operations for the MI Platform dashboard.
 * Uses REST API directly (no SDK) for full control.
 */

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;

// Table IDs from MI Platform base
export const TABLES = {
  forces: process.env.AIRTABLE_TABLE_FORCES!,
  contacts: process.env.AIRTABLE_TABLE_CONTACTS!,
  signals: process.env.AIRTABLE_TABLE_SIGNALS!,
  opportunities: process.env.AIRTABLE_TABLE_OPPORTUNITIES!,
} as const;

type TableName = keyof typeof TABLES;

interface AirtableRecord<T = Record<string, unknown>> {
  id: string;
  createdTime: string;
  fields: T;
}

interface AirtableListResponse<T> {
  records: AirtableRecord<T>[];
  offset?: string;
}

interface AirtableError {
  error: {
    type: string;
    message: string;
  };
}

/**
 * Base fetch function with authentication and error handling
 */
async function airtableFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as AirtableError;
    throw new Error(`Airtable error: ${error.error?.message || response.statusText}`);
  }

  return data as T;
}

/**
 * List records from a table with optional filtering
 */
export async function listRecords<T>(
  table: TableName,
  options: {
    filterByFormula?: string;
    sort?: Array<{ field: string; direction?: 'asc' | 'desc' }>;
    maxRecords?: number;
    offset?: string;
    fields?: string[];
  } = {}
): Promise<{ records: AirtableRecord<T>[]; offset?: string }> {
  const params = new URLSearchParams();

  if (options.filterByFormula) {
    params.append('filterByFormula', options.filterByFormula);
  }

  if (options.sort) {
    options.sort.forEach((s, i) => {
      params.append(`sort[${i}][field]`, s.field);
      if (s.direction) {
        params.append(`sort[${i}][direction]`, s.direction);
      }
    });
  }

  if (options.maxRecords) {
    params.append('maxRecords', String(options.maxRecords));
  }

  if (options.offset) {
    params.append('offset', options.offset);
  }

  if (options.fields) {
    options.fields.forEach(f => params.append('fields[]', f));
  }

  const queryString = params.toString();
  const endpoint = `${TABLES[table]}${queryString ? `?${queryString}` : ''}`;

  return airtableFetch<AirtableListResponse<T>>(endpoint);
}

/**
 * Get a single record by ID
 */
export async function getRecord<T>(
  table: TableName,
  recordId: string
): Promise<AirtableRecord<T>> {
  return airtableFetch<AirtableRecord<T>>(`${TABLES[table]}/${recordId}`);
}

/**
 * Update a record (PATCH - partial update)
 * G-011: Upsert only, no DELETE operations
 */
export async function updateRecord<T>(
  table: TableName,
  recordId: string,
  fields: Partial<T>
): Promise<AirtableRecord<T>> {
  return airtableFetch<AirtableRecord<T>>(`${TABLES[table]}/${recordId}`, {
    method: 'PATCH',
    body: JSON.stringify({ fields, typecast: true }),
  });
}

/**
 * Create a new record
 */
export async function createRecord<T>(
  table: TableName,
  fields: T
): Promise<AirtableRecord<T>> {
  return airtableFetch<AirtableRecord<T>>(TABLES[table], {
    method: 'POST',
    body: JSON.stringify({ fields, typecast: true }),
  });
}

// Type definitions for MI Platform tables
export interface Force {
  name: string;
  short_name?: string;
  region?: string;
  country?: string;
  size?: string;
  officer_count?: number;
  website?: string;
  careers_url?: string;
  procurement_url?: string;
  hubspot_company_id?: string;
  current_relationship?: string;
  competitor_incumbent?: string[];
  peel_investigating?: string;
  peel_pvp?: string;
  peel_last_inspection?: string;
  active_contracts?: string;
  contract_renewals?: string;
  notes?: string;
}

export interface Contact {
  name: string;
  first_name?: string;
  force?: string[];  // Linked record IDs
  role?: string;
  department?: string;
  seniority?: string;
  email?: string;
  linkedin_url?: string;
  phone?: string;
  relationship_status?: string;
  last_interaction?: string;
  interaction_count?: number;
  source?: string;
  verified?: boolean;
  notes?: string;
  // SPEC-007a: Contact confidence fields
  research_confidence?: number;  // 0-100 confidence score
  confidence_sources?: string;   // JSON array of source strings
}

export interface Signal {
  title: string;
  type?: string;
  source?: string;
  force?: string[];  // Linked record IDs
  url?: string;
  raw_data?: string;
  relevance_score?: number;
  relevance_reason?: string;
  status?: string;
  detected_at?: string;
  expires_at?: string;
  competitor_source?: string;
  external_id?: string;
}

export interface Opportunity {
  name: string;
  force?: string[];  // Linked record IDs
  signals?: string[];  // Linked record IDs
  priority_score?: number;
  priority_tier?: string;
  status?: string;
  contact?: string[];  // Linked record IDs
  contact_confidence?: string;
  outreach_draft?: string;
  outreach_channel?: string;
  outreach_angle?: string;
  last_contact_date?: string;
  next_action_date?: string;
  is_competitor_intercept?: boolean;
  competitor_detected?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  why_now?: string;
  signal_count?: number;
  signal_types?: string;
  subject_line?: string;
  skipped_reason?: string;
  sent_at?: string;
  // SPEC-007a: Priority and contact type fields
  priority_signals?: string;  // JSON array of detected signal patterns
  response_window?: 'Same Day' | 'Within 48h' | 'This Week' | string;
  contact_type?: 'problem_owner' | 'deputy' | 'hr_fallback' | string;
}

// Extended Opportunity with lookup fields (returned by API)
export interface OpportunityExpanded extends Opportunity {
  // Lookup fields (populated by Airtable formulas or API expansion)
  force_name?: string[];  // Lookup from Force
  contact_name?: string[];  // Lookup from Contact
  contact_email?: string[];  // Lookup from Contact
  contact_linkedin?: string[];  // Lookup from Contact
}
