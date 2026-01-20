/**
 * Airtable Integration for V2
 *
 * Simplified adapter for 4-table schema.
 * No dual-track scoring, contracts, or email features.
 */

import type {
  Opportunity,
  Force,
  Signal,
  Contact,
  PriorityTier,
  OpportunityStatus,
  ContactConfidence,
  OutreachChannel,
} from '@/lib/types/opportunity';

// Environment variables
const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;

// Table IDs from .env.local
const TABLES = {
  forces: process.env.AIRTABLE_TABLE_FORCES!,
  contacts: process.env.AIRTABLE_TABLE_CONTACTS!,
  signals: process.env.AIRTABLE_TABLE_SIGNALS!,
  opportunities: process.env.AIRTABLE_TABLE_OPPORTUNITIES!,
};

// =============================================================================
// AIRTABLE API HELPERS
// =============================================================================

interface AirtableRecord<T = Record<string, unknown>> {
  id: string;
  createdTime: string;
  fields: T;
}

interface AirtableResponse<T> {
  records: AirtableRecord<T>[];
  offset?: string;
}

async function airtableFetch<T>(
  tableId: string,
  options?: {
    filterByFormula?: string;
    maxRecords?: number;
    sort?: { field: string; direction: 'asc' | 'desc' }[];
    fields?: string[];
  }
): Promise<AirtableRecord<T>[]> {
  if (!API_KEY || !BASE_ID) {
    throw new Error('Missing Airtable credentials');
  }

  const params = new URLSearchParams();
  if (options?.filterByFormula) {
    params.set('filterByFormula', options.filterByFormula);
  }
  if (options?.maxRecords) {
    params.set('maxRecords', options.maxRecords.toString());
  }
  if (options?.sort) {
    options.sort.forEach((s, i) => {
      params.set(`sort[${i}][field]`, s.field);
      params.set(`sort[${i}][direction]`, s.direction);
    });
  }
  if (options?.fields) {
    options.fields.forEach((f) => params.append('fields[]', f));
  }

  const url = `https://api.airtable.com/v0/${BASE_ID}/${tableId}?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Airtable API error: ${response.status} - ${error}`);
  }

  const data: AirtableResponse<T> = await response.json();
  return data.records;
}

async function airtableUpdate(
  tableId: string,
  recordId: string,
  fields: Record<string, unknown>
): Promise<void> {
  if (!API_KEY || !BASE_ID) {
    throw new Error('Missing Airtable credentials');
  }

  const url = `https://api.airtable.com/v0/${BASE_ID}/${tableId}/${recordId}`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Airtable API error: ${response.status} - ${error}`);
  }
}

// =============================================================================
// TYPE MAPPERS
// =============================================================================

function mapPriorityTier(tier?: string): PriorityTier {
  const mapping: Record<string, PriorityTier> = {
    hot: 'hot',
    high: 'high',
    medium: 'medium',
    low: 'low',
  };
  return mapping[tier?.toLowerCase() || ''] || 'medium';
}

function mapStatus(status?: string): OpportunityStatus {
  const mapping: Record<string, OpportunityStatus> = {
    new: 'new',
    ready: 'ready',
    sent: 'sent',
    replied: 'replied',
    won: 'won',
    lost: 'lost',
    dormant: 'dormant',
    // V1 compatibility
    researching: 'new',
    actioned: 'sent',
  };
  return mapping[status?.toLowerCase() || ''] || 'new';
}

function mapContactConfidence(confidence?: string): ContactConfidence {
  const mapping: Record<string, ContactConfidence> = {
    verified: 'verified',
    likely: 'likely',
    guess: 'guess',
    none: 'none',
  };
  return mapping[confidence?.toLowerCase() || ''] || 'none';
}

function mapChannel(channel?: string): OutreachChannel {
  return channel?.toLowerCase() === 'linkedin' ? 'linkedin' : 'email';
}

// =============================================================================
// AIRTABLE FIELD TYPES
// =============================================================================

interface AirtableOpportunityFields {
  name?: string;
  force?: string[];
  signals?: string[];
  signal_count?: number;
  signal_types?: string;
  priority_tier?: string;
  status?: string;
  contact?: string[];
  contact_confidence?: string;
  why_now?: string;
  outreach_draft?: string;
  outreach_channel?: string;
  notes?: string;
  created_at?: string;
}

interface AirtableForceFields {
  name?: string;
  short_name?: string;
  region?: string;
  size?: string;
}

interface AirtableSignalFields {
  type?: string;
  source?: string;
  title?: string;
  detected_at?: string;
}

interface AirtableContactFields {
  name?: string;
  role?: string;
  email?: string;
  linkedin_url?: string;
}

// =============================================================================
// CACHES
// =============================================================================

let forcesCache: Map<string, Force> | null = null;
let forcesCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getForces(): Promise<Map<string, Force>> {
  const now = Date.now();
  if (forcesCache && now - forcesCacheTime < CACHE_TTL) {
    return forcesCache;
  }

  const records = await airtableFetch<AirtableForceFields>(TABLES.forces);
  forcesCache = new Map(
    records.map((r) => [
      r.id,
      {
        id: r.id,
        name: r.fields.name || 'Unknown Force',
        shortName: r.fields.short_name,
        region: r.fields.region,
        size: r.fields.size,
      },
    ])
  );
  forcesCacheTime = now;
  return forcesCache;
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Fetch opportunities for the review queue
 */
export async function fetchOpportunities(options?: {
  status?: string;
  limit?: number;
}): Promise<Opportunity[]> {
  const filters: string[] = [];

  if (options?.status) {
    filters.push(`{status} = "${options.status}"`);
  } else {
    // Default: show actionable opportunities
    filters.push(
      `NOT(OR({status} = "won", {status} = "lost", {status} = "dormant"))`
    );
  }

  const filterFormula =
    filters.length > 1 ? `AND(${filters.join(', ')})` : filters[0] || '';

  const records = await airtableFetch<AirtableOpportunityFields>(
    TABLES.opportunities,
    {
      filterByFormula: filterFormula,
      maxRecords: options?.limit || 50,
      sort: [{ field: 'created_at', direction: 'desc' }],
    }
  );

  // Get forces for lookup
  const forces = await getForces();

  // Fetch linked signals
  const signalIds = new Set<string>();
  records.forEach((r) => {
    r.fields.signals?.forEach((id) => signalIds.add(id));
  });

  const signalsMap = new Map<string, Signal>();
  if (signalIds.size > 0) {
    const signalRecords = await airtableFetch<AirtableSignalFields>(
      TABLES.signals,
      {
        filterByFormula: `OR(${Array.from(signalIds)
          .map((id) => `RECORD_ID()='${id}'`)
          .join(',')})`,
      }
    );
    signalRecords.forEach((s) => {
      signalsMap.set(s.id, {
        id: s.id,
        type: s.fields.type || 'unknown',
        source: s.fields.source || 'unknown',
        title: s.fields.title || '',
        detectedAt: s.fields.detected_at || s.createdTime,
      });
    });
  }

  // Fetch linked contacts
  const contactIds = new Set<string>();
  records.forEach((r) => {
    r.fields.contact?.forEach((id) => contactIds.add(id));
  });

  const contactsMap = new Map<string, Contact>();
  if (contactIds.size > 0) {
    const contactRecords = await airtableFetch<AirtableContactFields>(
      TABLES.contacts,
      {
        filterByFormula: `OR(${Array.from(contactIds)
          .map((id) => `RECORD_ID()='${id}'`)
          .join(',')})`,
      }
    );
    contactRecords.forEach((c) => {
      contactsMap.set(c.id, {
        id: c.id,
        name: c.fields.name || 'Unknown',
        role: c.fields.role,
        email: c.fields.email,
        linkedinUrl: c.fields.linkedin_url,
        confidence: 'likely', // Default, will be overridden
      });
    });
  }

  // Transform records
  const opportunities = records.map((record): Opportunity => {
    const fields = record.fields;
    const forceId = fields.force?.[0];
    const force = forceId ? forces.get(forceId) : undefined;

    const signals = (fields.signals || [])
      .map((id) => signalsMap.get(id))
      .filter((s): s is Signal => s !== undefined);

    const contactId = fields.contact?.[0];
    const contact = contactId ? contactsMap.get(contactId) : undefined;
    if (contact) {
      contact.confidence = mapContactConfidence(fields.contact_confidence);
    }

    return {
      id: record.id,
      name: fields.name || 'Untitled',
      force: force || { id: '', name: 'Unknown Force' },
      signals,
      contact,
      signalCount: fields.signal_count || signals.length,
      signalTypes: fields.signal_types?.split(', ') || [],
      priorityTier: mapPriorityTier(fields.priority_tier),
      status: mapStatus(fields.status),
      contactConfidence: mapContactConfidence(fields.contact_confidence),
      whyNow: fields.why_now,
      outreachDraft: fields.outreach_draft,
      outreachChannel: mapChannel(fields.outreach_channel),
      notes: fields.notes,
      createdAt: fields.created_at || record.createdTime,
    };
  });

  // Sort by priority tier (hot first), then by created_at desc
  const priorityOrder: Record<PriorityTier, number> = {
    hot: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  return opportunities.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priorityTier] - priorityOrder[b.priorityTier];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/**
 * Fetch a single opportunity by ID
 */
export async function fetchOpportunityById(
  id: string
): Promise<Opportunity | null> {
  const opportunities = await fetchOpportunities({ limit: 100 });
  return opportunities.find((o) => o.id === id) || null;
}

/**
 * Update opportunity status
 */
export async function updateOpportunityStatus(
  id: string,
  status: OpportunityStatus
): Promise<void> {
  const statusMapping: Record<OpportunityStatus, string> = {
    new: 'new',
    ready: 'ready',
    sent: 'sent',
    replied: 'replied',
    won: 'won',
    lost: 'lost',
    dormant: 'dormant',
  };

  await airtableUpdate(TABLES.opportunities, id, {
    status: statusMapping[status],
  });
}

/**
 * Mark opportunity as sent
 */
export async function markOpportunitySent(id: string): Promise<void> {
  await airtableUpdate(TABLES.opportunities, id, {
    status: 'sent',
  });
}

/**
 * Skip opportunity
 */
export async function skipOpportunity(
  id: string,
  reason?: string
): Promise<void> {
  const fields: Record<string, unknown> = {
    status: 'dormant',
  };
  if (reason) {
    fields.notes = `Skipped: ${reason}`;
  }
  await airtableUpdate(TABLES.opportunities, id, fields);
}

/**
 * Fetch all forces
 */
export async function fetchForces(): Promise<Force[]> {
  const forces = await getForces();
  return Array.from(forces.values());
}
