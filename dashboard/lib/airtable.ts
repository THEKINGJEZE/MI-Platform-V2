/**
 * Airtable Integration for V2
 *
 * Adapter for 6-table schema (Phase 2a adds Email_Raw and Emails).
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
import type {
  Email,
  EmailClassification,
  EmailActionType,
  EmailStatus,
  EmailQueueStats,
} from '@/lib/types/email';
import type {
  DecayAlert,
  DecayAlertsBySection,
  DecayAlertType,
  DecayStats,
  DecayStatus,
} from '@/lib/types/decay';

// Environment variables
const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;

// Table IDs from .env.local (or hardcoded for email tables)
const TABLES = {
  forces: process.env.AIRTABLE_TABLE_FORCES!,
  contacts: process.env.AIRTABLE_TABLE_CONTACTS!,
  signals: process.env.AIRTABLE_TABLE_SIGNALS!,
  opportunities: process.env.AIRTABLE_TABLE_OPPORTUNITIES!,
  // Phase 2a email tables
  emailRaw: process.env.AIRTABLE_TABLE_EMAIL_RAW || 'tblYYyNm7yGbX3Ehj',
  emails: process.env.AIRTABLE_TABLE_EMAILS || 'tblaeAuzLbmzW8ktJ',
  // Phase 2a-7 decay alerts
  decayAlerts: process.env.AIRTABLE_TABLE_DECAY_ALERTS || 'tblDecayAlerts',
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

// =============================================================================
// EMAIL FUNCTIONS (Phase 2a)
// =============================================================================

interface AirtableEmailRawFields {
  email_id?: string;
  conversation_id?: string;
  subject?: string;
  from_email?: string;
  from_name?: string;
  body_preview?: string;
  received_at?: string;
  folder?: string;
  has_attachments?: boolean;
  synced_at?: string;
  processed?: boolean;
}

interface AirtableEmailFields {
  email_id?: string;
  classification?: string;
  priority?: number;
  action_type?: string;
  status?: string;
  draft_response?: string;
  key_request?: string;
  ai_confidence?: number;
  ai_reasoning?: string;
  waiting_since?: string;
  follow_up_draft?: string;
  skip_count?: number;
  actioned_at?: string;
  force?: string[];
  contact?: string[];
  hubspot_contact_id?: string;
  has_open_deal?: boolean;
  // Joined from Email_Raw
  subject?: string;
  from_email?: string;
  from_name?: string;
  body_preview?: string;
  received_at?: string;
  folder?: string;
  has_attachments?: boolean;
  conversation_id?: string;
}

function mapEmailClassification(classification?: string): EmailClassification {
  const mapping: Record<string, EmailClassification> = {
    'urgent': 'Urgent',
    'today': 'Today',
    'week': 'Week',
    'fyi': 'FYI',
    'archive': 'Archive',
  };
  return mapping[classification?.toLowerCase() || ''] || 'FYI';
}

function mapEmailActionType(actionType?: string): EmailActionType {
  const mapping: Record<string, EmailActionType> = {
    'reply': 'Reply',
    'forward': 'Forward',
    'fyi': 'FYI',
    'archive': 'Archive',
  };
  return mapping[actionType?.toLowerCase() || ''] || 'FYI';
}

function mapEmailStatus(status?: string): EmailStatus {
  const mapping: Record<string, EmailStatus> = {
    'new': 'new',
    'draft_ready': 'draft_ready',
    'approved': 'approved',
    'sent': 'sent',
    'waiting_for_reply': 'waiting_for_reply',
    'done': 'done',
    'skipped': 'skipped',
  };
  return mapping[status?.toLowerCase() || ''] || 'new';
}

/**
 * Fetch emails for the email queue
 */
export async function fetchEmails(options?: {
  classification?: EmailClassification;
  status?: EmailStatus;
  limit?: number;
}): Promise<Email[]> {
  const filters: string[] = [];

  // Default: show actionable emails (not done/skipped)
  if (options?.status) {
    filters.push(`{status} = "${options.status}"`);
  } else {
    filters.push(`NOT(OR({status} = "done", {status} = "skipped"))`);
  }

  if (options?.classification) {
    filters.push(`{classification} = "${options.classification}"`);
  }

  const filterFormula =
    filters.length > 1 ? `AND(${filters.join(', ')})` : filters[0] || '';

  const records = await airtableFetch<AirtableEmailFields>(
    TABLES.emails,
    {
      filterByFormula: filterFormula,
      maxRecords: options?.limit || 50,
      sort: [
        { field: 'priority', direction: 'asc' },
        { field: 'received_at', direction: 'desc' },
      ],
    }
  );

  // Get forces for lookup
  const forces = await getForces();

  // Fetch linked contacts
  const contactIds = new Set<string>();
  records.forEach((r) => {
    r.fields.contact?.forEach((id) => contactIds.add(id));
  });

  const contactsMap = new Map<string, { id: string; name: string }>();
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
      });
    });
  }

  // Transform records
  const emails = records.map((record): Email => {
    const fields = record.fields;
    const forceId = fields.force?.[0];
    const force = forceId ? forces.get(forceId) : undefined;
    const contactId = fields.contact?.[0];
    const contact = contactId ? contactsMap.get(contactId) : undefined;

    return {
      id: record.id,
      emailId: fields.email_id || '',
      subject: fields.subject || '(No Subject)',
      fromEmail: fields.from_email || '',
      fromName: fields.from_name || 'Unknown Sender',
      bodyPreview: fields.body_preview || '',
      receivedAt: fields.received_at || record.createdTime,
      folder: fields.folder,
      hasAttachments: fields.has_attachments || false,
      conversationId: fields.conversation_id,
      classification: mapEmailClassification(fields.classification),
      priority: fields.priority || 5,
      actionType: mapEmailActionType(fields.action_type),
      status: mapEmailStatus(fields.status),
      keyRequest: fields.key_request,
      draftResponse: fields.draft_response,
      aiConfidence: fields.ai_confidence || 0,
      aiReasoning: fields.ai_reasoning,
      force: force ? { id: force.id, name: force.name } : undefined,
      contact: contact,
      hubspotContactId: fields.hubspot_contact_id,
      hasOpenDeal: fields.has_open_deal || false,
      waitingSince: fields.waiting_since,
      followUpDraft: fields.follow_up_draft,
      skipCount: fields.skip_count || 0,
      actionedAt: fields.actioned_at,
    };
  });

  // Sort by priority (1 = highest)
  return emails.sort((a, b) => a.priority - b.priority);
}

/**
 * Fetch email queue stats
 */
export async function fetchEmailStats(): Promise<EmailQueueStats> {
  const emails = await fetchEmails({ limit: 100 });

  return {
    total: emails.length,
    urgent: emails.filter((e) => e.classification === 'Urgent').length,
    today: emails.filter((e) => e.classification === 'Today').length,
    week: emails.filter((e) => e.classification === 'Week').length,
    fyi: emails.filter((e) => e.classification === 'FYI').length,
  };
}

/**
 * Update email status
 */
export async function updateEmailStatus(
  id: string,
  status: EmailStatus,
  additionalFields?: Record<string, unknown>
): Promise<void> {
  const fields: Record<string, unknown> = {
    status,
    ...additionalFields,
  };

  if (status === 'done' || status === 'sent') {
    fields.actioned_at = new Date().toISOString();
  }

  await airtableUpdate(TABLES.emails, id, fields);
}

/**
 * Skip email (increment skip count, optionally mark as skipped)
 */
export async function skipEmail(id: string, permanent = false): Promise<void> {
  // First, fetch current skip count
  const emails = await fetchEmails({ limit: 100 });
  const email = emails.find((e) => e.id === id);
  const currentSkipCount = email?.skipCount || 0;
  const newSkipCount = currentSkipCount + 1;

  // After 3 skips, auto-archive
  const shouldAutoArchive = newSkipCount >= 3;

  const fields: Record<string, unknown> = {
    skip_count: newSkipCount,
  };

  if (permanent || shouldAutoArchive) {
    fields.status = 'skipped';
    fields.actioned_at = new Date().toISOString();
  }

  await airtableUpdate(TABLES.emails, id, fields);
}

/**
 * Approve email draft (triggers Make.com to create Outlook draft)
 */
export async function approveEmailDraft(id: string): Promise<void> {
  await airtableUpdate(TABLES.emails, id, {
    status: 'approved',
    actioned_at: new Date().toISOString(),
  });
}

// =============================================================================
// DECAY ALERTS FUNCTIONS (Phase 2a-7)
// =============================================================================

interface AirtableDecayAlertFields {
  alert_type?: string;
  deal_id?: string;
  deal_name?: string;
  is_closed_won?: boolean;
  force?: string[];
  contact_id?: string;
  contact_name?: string;
  contact_email?: string;
  contact_role?: string;
  status?: string;
  days_since_contact?: number;
  last_contact_date?: string;
  suggested_touchpoint?: string;
  calculated_at?: string;
  acknowledged_at?: string;
}

function mapDecayStatus(status?: string): DecayStatus {
  const mapping: Record<string, DecayStatus> = {
    active: 'active',
    warming: 'warming',
    at_risk: 'at_risk',
    cold: 'cold',
  };
  return mapping[status?.toLowerCase() || ''] || 'active';
}

function mapDecayAlertType(alertType?: string): DecayAlertType {
  const mapping: Record<string, DecayAlertType> = {
    deal_contact: 'deal_contact',
    client_checkin: 'client_checkin',
    organisation: 'organisation',
  };
  return mapping[alertType?.toLowerCase() || ''] || 'deal_contact';
}

/**
 * Fetch decay alerts from Airtable
 * Returns alerts grouped by section for dashboard display
 */
export async function fetchDecayAlerts(options?: {
  status?: DecayStatus;
  alertType?: DecayAlertType;
  limit?: number;
}): Promise<DecayAlert[]> {
  const filters: string[] = [];

  // Filter out acknowledged alerts by default
  filters.push(`{acknowledged_at} = BLANK()`);

  // Filter by decay status if specified (only show concerning statuses by default)
  if (options?.status) {
    filters.push(`{status} = "${options.status}"`);
  } else {
    // By default, show warming, at_risk, and cold (not active)
    filters.push(
      `OR({status} = "warming", {status} = "at_risk", {status} = "cold")`
    );
  }

  // Filter by alert type if specified
  if (options?.alertType) {
    filters.push(`{alert_type} = "${options.alertType}"`);
  }

  const filterFormula =
    filters.length > 1 ? `AND(${filters.join(', ')})` : filters[0] || '';

  const records = await airtableFetch<AirtableDecayAlertFields>(
    TABLES.decayAlerts,
    {
      filterByFormula: filterFormula,
      maxRecords: options?.limit || 100,
      sort: [
        { field: 'days_since_contact', direction: 'desc' },
        { field: 'calculated_at', direction: 'desc' },
      ],
    }
  );

  // Get forces for lookup
  const forces = await getForces();

  // Transform records
  return records.map((record): DecayAlert => {
    const fields = record.fields;
    const forceId = fields.force?.[0];
    const force = forceId ? forces.get(forceId) : undefined;

    return {
      id: record.id,
      alertType: mapDecayAlertType(fields.alert_type),
      dealId: fields.deal_id,
      dealName: fields.deal_name,
      isClosedWon: fields.is_closed_won || false,
      forceId: force?.id,
      forceName: force?.name,
      contactId: fields.contact_id || '',
      contactName: fields.contact_name || 'Unknown Contact',
      contactEmail: fields.contact_email,
      contactRole: fields.contact_role,
      status: mapDecayStatus(fields.status),
      daysSinceContact: fields.days_since_contact || 0,
      lastContactDate: fields.last_contact_date,
      suggestedTouchpoint: fields.suggested_touchpoint,
      calculatedAt: fields.calculated_at || record.createdTime,
      acknowledgedAt: fields.acknowledged_at,
    };
  });
}

/**
 * Fetch decay alerts grouped by dashboard section
 * Per Decision I4:
 * - Deal Contacts Going Cold: Active pipeline deals
 * - Client Check-ins Due: Closed Won contacts
 * - Organisations Going Quiet: Force-level
 */
export async function fetchDecayAlertsBySection(): Promise<DecayAlertsBySection> {
  const allAlerts = await fetchDecayAlerts();

  return {
    dealContacts: allAlerts.filter(
      (a) => a.alertType === 'deal_contact' && !a.isClosedWon
    ),
    clientCheckins: allAlerts.filter(
      (a) => a.alertType === 'client_checkin' || (a.alertType === 'deal_contact' && a.isClosedWon)
    ),
    organisations: allAlerts.filter((a) => a.alertType === 'organisation'),
  };
}

/**
 * Fetch decay alert statistics
 */
export async function fetchDecayStats(): Promise<DecayStats> {
  const allAlerts = await fetchDecayAlerts();

  return {
    total: allAlerts.length,
    cold: allAlerts.filter((a) => a.status === 'cold').length,
    atRisk: allAlerts.filter((a) => a.status === 'at_risk').length,
    warming: allAlerts.filter((a) => a.status === 'warming').length,
    dealContacts: allAlerts.filter(
      (a) => a.alertType === 'deal_contact' && !a.isClosedWon
    ).length,
    clientCheckins: allAlerts.filter(
      (a) => a.alertType === 'client_checkin' || (a.alertType === 'deal_contact' && a.isClosedWon)
    ).length,
    organisations: allAlerts.filter((a) => a.alertType === 'organisation').length,
  };
}

/**
 * Acknowledge a decay alert (hide from dashboard)
 */
export async function acknowledgeDecayAlert(id: string): Promise<void> {
  await airtableUpdate(TABLES.decayAlerts, id, {
    acknowledged_at: new Date().toISOString(),
  });
}
