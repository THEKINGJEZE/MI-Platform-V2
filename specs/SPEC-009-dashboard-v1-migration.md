# SPEC-009: Dashboard V1 Migration

**Status**: Ready for implementation  
**Created**: 2025-01-20  
**Updated**: 2025-01-20 (Addendum added based on Gemini review)  
**Phase**: 1c — React Dashboard  
**Depends on**: SPEC-001 (Airtable Schema), SPEC-005 (Opportunity Enricher)  
**Supersedes**: SPEC-007b (Dashboard MVP)  
**Decision Reference**: DECISIONS.md A9

---

## Overview

Migrate the proven V1 dashboard codebase to work with V2's simplified backend. Rather than building UI from scratch (which failed to match V1 quality), we preserve V1's polished components and rewire only the data layer.

**Core insight**: V1's UI quality comes from its rich component library, design tokens, and ADHD-optimised patterns. These are independent of the data source. We keep the UI, replace the plumbing.

**What this delivers**:
- V1's proven Three-Zone layout
- V1's design tokens and visual quality
- V1's keyboard navigation (J/K/E/S/D/Z)
- V1's progress feedback and undo system
- Connected to V2's simpler 4-table schema

**What this removes** (V2 doesn't need these):
- Dual-track scoring (MS vs Agency)
- IR35 determination
- Contract intelligence
- Follow-up sequences
- Email actions system
- Complex score breakdowns

---

## Strategic Context

### Why No Dual-Track

From `docs/SALES-STRATEGY.md`:

> "We Don't Pre-Classify Opportunities. The MI Platform does not try to determine 'is this MS or Agency?' at the signal stage."

All signals are "force has a need." Outreach presents Peel's full capability. The conversation determines the right solution.

### Simplified Priority Model

V2 uses simple priority tiers, not complex scoring:

| Priority | Signal Pattern | Response Window |
|----------|---------------|-----------------|
| 🔴 P1 — Hot | Competitor posting, urgent language | Same day |
| 🟠 P2 — Warm | Volume hiring, senior roles | Within 48 hours |
| 🟡 P3 — Standard | Direct posting | Within 1 week |

### The 95/5 Principle

System does 95%, human does 5%:
- System: Find, classify, enrich, draft, prioritise
- Human: Review, tweak, send

---

## Architecture

### V1 Code Structure (Now in `dashboard/`)

```
dashboard/
├── app/                    # Next.js app router
├── components/
│   ├── app-shell/          # Layout, navigation
│   ├── board/              # Dashboard views (HEAVY STRIPPING)
│   ├── feedback/           # Toast, empty state, loading
│   ├── focus-mode/         # Review interface (MODERATE STRIPPING)
│   ├── forces/             # Force views
│   ├── list-view/          # List components
│   ├── overlays/           # Modals
│   ├── rituals/            # Morning Brief (DEFER)
│   ├── ui/                 # Base components (KEEP ALL)
│   └── providers.tsx       # Context providers
├── lib/
│   ├── airtable.ts         # Data layer (FULL REWRITE)
│   ├── stores/             # Zustand stores (SIMPLIFY)
│   ├── types/              # TypeScript types (SIMPLIFY)
│   └── utils.ts            # Utilities (KEEP)
├── styles/
│   └── tokens.css          # Design tokens (KEEP)
└── package.json
```

### What Changes

| Layer | Action | Scope |
|-------|--------|-------|
| `lib/airtable.ts` | **Full rewrite** | Map V2 schema to simplified types |
| `lib/types/` | **Simplify** | Remove dual-track, contracts, email types |
| `lib/stores/` | **Simplify** | Remove unused state slices |
| `components/focus-mode/` | **Strip features** | Remove dual-track display, contracts |
| `components/board/` | **Heavy stripping** | Remove email, contracts, competitor matrix |
| `components/rituals/` | **Defer** | Morning Brief is future phase |
| `components/ui/` | **Keep as-is** | Base components unchanged |
| `styles/` | **Keep as-is** | Design tokens unchanged |

---

## V2 Schema Reference

### Table: Opportunities

| Field | Type | Dashboard Usage |
|-------|------|-----------------|
| `id` | Auto | Record identifier |
| `name` | Text | Opportunity title |
| `force` | Link → Forces | Force name display |
| `signals` | Link → Signals | Signal count, types |
| `signal_count` | Rollup | Badge display |
| `signal_types` | Rollup | Context info |
| `priority_tier` | Single Select | Priority badge (hot/high/medium/low) |
| `status` | Single Select | Queue filtering |
| `contact` | Link → Contacts | Contact display |
| `contact_confidence` | Single Select | Confidence indicator |
| `why_now` | Long Text | Context summary |
| `outreach_draft` | Long Text | Message body |
| `outreach_channel` | Single Select | Email/LinkedIn |
| `notes` | Long Text | User notes |
| `created_at` | DateTime | Sorting |

### Table: Forces

| Field | Type | Dashboard Usage |
|-------|------|-----------------|
| `id` | Auto | Record identifier |
| `name` | Text | Display name |
| `short_name` | Text | Compact display |
| `region` | Single Select | Grouping |
| `size` | Single Select | Context |

### Table: Signals

| Field | Type | Dashboard Usage |
|-------|------|-----------------|
| `id` | Auto | Record identifier |
| `type` | Single Select | Signal type badge |
| `source` | Single Select | Source indicator |
| `title` | Text | Signal description |
| `detected_at` | DateTime | Recency |

### Table: Contacts

| Field | Type | Dashboard Usage |
|-------|------|-----------------|
| `id` | Auto | Record identifier |
| `name` | Text | Display name |
| `role` | Text | Job title |
| `email` | Email | Contact action |
| `linkedin_url` | URL | LinkedIn action |

---

## Type System Changes

### Types to REMOVE

Delete these files entirely:
- `lib/types/email.ts` — Email actions not in V2
- `lib/types/board.ts` — Complex board types not needed

### Types to SIMPLIFY

**`lib/types/opportunity.ts`** — Rewrite to:

```typescript
/**
 * Simplified Opportunity for V2
 * No dual-track scoring, no contracts, no follow-ups
 */

export type PriorityTier = 'hot' | 'high' | 'medium' | 'low';
export type OpportunityStatus = 'new' | 'ready' | 'sent' | 'replied' | 'won' | 'lost' | 'dormant';
export type OutreachChannel = 'email' | 'linkedin';
export type ContactConfidence = 'verified' | 'likely' | 'guess' | 'none';

export interface Signal {
  id: string;
  type: string;
  source: string;
  title: string;
  detectedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  role?: string;
  email?: string;
  linkedinUrl?: string;
  confidence: ContactConfidence;
}

export interface Force {
  id: string;
  name: string;
  shortName?: string;
  region?: string;
  size?: string;
}

export interface Opportunity {
  id: string;
  name: string;
  
  // Linked entities
  force: Force;
  signals: Signal[];
  contact?: Contact;
  
  // Display fields
  signalCount: number;
  signalTypes: string[];
  priorityTier: PriorityTier;
  status: OpportunityStatus;
  contactConfidence: ContactConfidence;
  
  // Content
  whyNow?: string;
  outreachDraft?: string;
  outreachChannel: OutreachChannel;
  notes?: string;
  
  // Metadata
  createdAt: string;
}
```

**`lib/types/lead.ts`** — Keep only what's used:

```typescript
/**
 * Shared types for V2
 */

export type PriorityTier = 'hot' | 'high' | 'medium' | 'low';

// Session tracking (in-memory only)
export interface SessionStats {
  processed: number;
  total: number;
  startTime: number;
  actionTimes: number[];
}
```

---

## Data Layer Rewrite

### `lib/airtable.ts` — Complete Replacement

Replace the entire 1100+ line file with a focused V2 adapter:

```typescript
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
  OutreachChannel 
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
    'hot': 'hot',
    'high': 'high',
    'medium': 'medium',
    'low': 'low',
  };
  return mapping[tier?.toLowerCase() || ''] || 'medium';
}

function mapStatus(status?: string): OpportunityStatus {
  const mapping: Record<string, OpportunityStatus> = {
    'new': 'new',
    'ready': 'ready',
    'sent': 'sent',
    'replied': 'replied',
    'won': 'won',
    'lost': 'lost',
    'dormant': 'dormant',
    // V1 compatibility
    'researching': 'new',
    'actioned': 'sent',
  };
  return mapping[status?.toLowerCase() || ''] || 'new';
}

function mapContactConfidence(confidence?: string): ContactConfidence {
  const mapping: Record<string, ContactConfidence> = {
    'verified': 'verified',
    'likely': 'likely',
    'guess': 'guess',
    'none': 'none',
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
  'name'?: string;
  'force'?: string[];
  'signals'?: string[];
  'signal_count'?: number;
  'signal_types'?: string;
  'priority_tier'?: string;
  'status'?: string;
  'contact'?: string[];
  'contact_confidence'?: string;
  'why_now'?: string;
  'outreach_draft'?: string;
  'outreach_channel'?: string;
  'notes'?: string;
  'created_at'?: string;
}

interface AirtableForceFields {
  'name'?: string;
  'short_name'?: string;
  'region'?: string;
  'size'?: string;
}

interface AirtableSignalFields {
  'type'?: string;
  'source'?: string;
  'title'?: string;
  'detected_at'?: string;
}

interface AirtableContactFields {
  'name'?: string;
  'role'?: string;
  'email'?: string;
  'linkedin_url'?: string;
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
    filters.push(`NOT(OR({status} = "won", {status} = "lost", {status} = "dormant"))`);
  }

  const filterFormula = filters.length > 1 
    ? `AND(${filters.join(', ')})` 
    : filters[0] || '';

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
        filterByFormula: `OR(${Array.from(signalIds).map((id) => `RECORD_ID()='${id}'`).join(',')})`,
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
        filterByFormula: `OR(${Array.from(contactIds).map((id) => `RECORD_ID()='${id}'`).join(',')})`,
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
  return records.map((record): Opportunity => {
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
}

/**
 * Fetch a single opportunity by ID
 */
export async function fetchOpportunityById(id: string): Promise<Opportunity | null> {
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
export async function skipOpportunity(id: string, reason?: string): Promise<void> {
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
```

---

## Component Stripping Guide

### `components/focus-mode/` — Moderate Changes

**KEEP**:
- `now-card.tsx` — Simplify (see below)
- `contact-card.tsx` — Keep as-is
- `action-panel.tsx` — Keep as-is
- `queue-panel.tsx` — Keep as-is
- `session-header.tsx` — Keep as-is
- `dismiss-modal.tsx` — Keep as-is

**REMOVE**:
- `dual-track-scores.tsx` — Delete entirely
- `score-breakdown.tsx` — Delete entirely
- `contract-context.tsx` — Delete entirely
- `follow-up-card.tsx` — Delete entirely
- `follow-up-action-panel.tsx` — Delete entirely

**SIMPLIFY `now-card.tsx`**:

Remove these sections:
- `<DualTrackScores>` component usage
- `<ComponentScores>` grid
- `<ContractContext>` component usage
- IR35 display
- `managedServicesScore`, `agencyScore`, `primaryTrack` references

Keep these sections:
- Force name header
- Priority badge
- Why Now context
- Signal summary
- Contact card
- Timing indicator (simplified)

### `components/board/` — Heavy Stripping

**KEEP** (but may need adjustment):
- `signal-feed.tsx` — Basic signal display
- `kpi-card.tsx` — Simple metrics

**REMOVE** (entire files):
- `competitive-intel-tab.tsx`
- `competitor-activity-feed.tsx`
- `competitor-card.tsx`
- `competitor-matrix.tsx`
- `competitor-wins-leaderboard.tsx`
- `email-actions-tab.tsx`
- `contract-context.tsx` (if exists here)
- `deal-risk-card.tsx`
- `deal-risk-summary.tsx`
- `follow-up-*` files
- `renewals-pipeline.tsx`
- `recent-contract-awards.tsx`

### `components/rituals/` — Defer

The Morning Brief (`rituals/`) depends on overnight tracking and session persistence. Mark entire directory as **deferred to SPEC-008**.

For now, the app opens directly to the Queue view.

---

## Store Simplification

### `lib/stores/opportunities-store.ts`

Simplify to core operations:

```typescript
import { create } from 'zustand';
import type { Opportunity, OpportunityStatus } from '@/lib/types/opportunity';
import { 
  fetchOpportunities, 
  markOpportunitySent, 
  skipOpportunity 
} from '@/lib/airtable';

interface OpportunitiesState {
  opportunities: Opportunity[];
  currentId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  load: () => Promise<void>;
  select: (id: string) => void;
  selectNext: () => void;
  selectPrevious: () => void;
  markSent: (id: string) => Promise<void>;
  skip: (id: string, reason?: string) => Promise<void>;
}

export const useOpportunitiesStore = create<OpportunitiesState>((set, get) => ({
  opportunities: [],
  currentId: null,
  isLoading: false,
  error: null,

  load: async () => {
    set({ isLoading: true, error: null });
    try {
      const opportunities = await fetchOpportunities({ status: 'ready' });
      set({ 
        opportunities, 
        currentId: opportunities[0]?.id || null,
        isLoading: false 
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  select: (id) => set({ currentId: id }),

  selectNext: () => {
    const { opportunities, currentId } = get();
    const currentIndex = opportunities.findIndex((o) => o.id === currentId);
    const nextIndex = Math.min(currentIndex + 1, opportunities.length - 1);
    set({ currentId: opportunities[nextIndex]?.id || null });
  },

  selectPrevious: () => {
    const { opportunities, currentId } = get();
    const currentIndex = opportunities.findIndex((o) => o.id === currentId);
    const prevIndex = Math.max(currentIndex - 1, 0);
    set({ currentId: opportunities[prevIndex]?.id || null });
  },

  markSent: async (id) => {
    await markOpportunitySent(id);
    const { opportunities } = get();
    set({
      opportunities: opportunities.map((o) =>
        o.id === id ? { ...o, status: 'sent' as OpportunityStatus } : o
      ),
    });
    get().selectNext();
  },

  skip: async (id, reason) => {
    await skipOpportunity(id, reason);
    const { opportunities } = get();
    set({
      opportunities: opportunities.filter((o) => o.id !== id),
    });
    get().selectNext();
  },
}));
```

### Stores to REMOVE

- `lib/stores/board-store.ts` — Complex board state not needed
- `lib/stores/captures-store.ts` — If exists, not needed
- `lib/stores/pins-store.ts` — Not needed for MVP

### Stores to KEEP (simplified)

- `lib/stores/opportunities-store.ts` — Core queue state
- `lib/stores/session-store.ts` — Progress tracking
- `lib/stores/ui-store.ts` — Basic UI state (modals, toasts)

---

## App Routes

### Routes to KEEP

| Route | Purpose |
|-------|---------|
| `/` | Redirect to `/review` |
| `/review` | Main queue interface (Three-Zone) |

### Routes to REMOVE or STUB

| Route | Action |
|-------|--------|
| `/pipeline` | Stub with "Coming soon" |
| `/signals` | Stub with "Coming soon" |
| `/forces` | Stub with "Coming soon" |
| `/email` | Remove entirely |
| `/tenders` | Remove entirely |

### Simplified `app/page.tsx`

```typescript
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/review');
}
```

---

## Environment Variables

Ensure `.env.local` has:

```bash
# Airtable API
AIRTABLE_API_KEY=pat...
AIRTABLE_BASE_ID=app...

# Table IDs
AIRTABLE_TABLE_FORCES=tbl...
AIRTABLE_TABLE_CONTACTS=tbl...
AIRTABLE_TABLE_SIGNALS=tbl...
AIRTABLE_TABLE_OPPORTUNITIES=tbl...

# n8n Webhook (optional for Phase 1c)
N8N_WEBHOOK_URL=https://...
```

---

## Build Sequence

Execute in this order:

### Phase A: Strip Dead Code (1-2 hours)

1. Delete `lib/types/email.ts`
2. Delete `lib/types/board.ts` (if exists)
3. Delete components listed in "Heavy Stripping" section
4. Delete stores listed for removal
5. Delete unused app routes

### Phase B: Simplify Types (30 min)

1. Rewrite `lib/types/opportunity.ts` per spec
2. Simplify `lib/types/lead.ts` per spec
3. Update `lib/types/index.ts` exports

### Phase C: Rewrite Data Layer (1-2 hours)

1. Replace `lib/airtable.ts` with V2 adapter
2. Update any imports that break

### Phase D: Simplify Components (1-2 hours)

1. Simplify `now-card.tsx` — remove dual-track, contracts, score breakdown
2. Update imports in `focus-mode/index.ts`
3. Fix any TypeScript errors from removed types

### Phase E: Simplify Stores (30 min)

1. Rewrite `opportunities-store.ts` per spec
2. Remove unused slices from other stores

### Phase F: Fix Routes (30 min)

1. Update `app/page.tsx` to redirect to `/review`
2. Stub or remove unused routes
3. Fix navigation components

### Phase G: Test & Fix (1-2 hours)

1. Run `npm install`
2. Run `npm run build` — fix TypeScript errors
3. Run `npm run dev` — test locally
4. Verify queue loads from Airtable
5. Verify keyboard navigation works
6. Verify send/skip actions work

---

## Addendum: Detailed Cleanup Guide

*Added 20 January 2025 based on Gemini codebase review*

### Decisions (Locked)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Route URL | `/review` | Describes Monday activity |
| Default sort | Priority Tier → Recency | Hot leads first, then newest within tier |
| Dismissal feedback loop | Strip | V2 schema doesn't support signal feedback yet |

---

### Phase A Detailed: Type Cleanup (Do First)

Deleting types first triggers TypeScript errors that guide what else to fix.

**Files to delete entirely:**
```
dashboard/lib/types/email.ts
dashboard/lib/types/board.ts (if exists)
```

**Types to remove from `lib/types/opportunity.ts`:**
```typescript
// DELETE these types entirely:
- PrimaryTrack
- IR35Determination
- ForceSegment (if not used elsewhere)
- Contract
- ContractStatus
- ForceContractContext
- FollowUpStatus

// DELETE these fields from Opportunity interface:
- managedServicesScore
- agencyScore
- primaryTrack
- ir35Determination
- contractContext
- followUps
- componentScores (entire object)
```

**Types to remove from `lib/types/lead.ts`:**
```typescript
// DELETE if present:
- DualTrackScores
- ScoreBreakdown
- ComponentScores
```

**Update `lib/types/index.ts`:**
Remove exports for deleted types. TypeScript will error on any file still importing them.

---

### Phase A Detailed: Store Sanitization

**File: `dashboard/lib/stores/opportunities-store.ts`**

1. Find `getFilteredOpportunitiesInternal` function
2. Delete switch cases for `'managed'` and `'agency'` queue modes
3. Remove `queueMode` state if only those two modes existed
4. Update default sort to: Priority Tier (hot→high→medium→low), then `createdAt` desc

**Replacement sort logic:**
```typescript
const priorityOrder = { hot: 0, high: 1, medium: 2, low: 3 };

opportunities.sort((a, b) => {
  const priorityDiff = priorityOrder[a.priorityTier] - priorityOrder[b.priorityTier];
  if (priorityDiff !== 0) return priorityDiff;
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
});
```

5. Remove `dismissOpportunity` feedback propagation logic (keep simple status update)

**Files to check for store imports:**
```
dashboard/components/focus-mode/queue-panel.tsx
dashboard/components/focus-mode/now-card.tsx
dashboard/components/board/*.tsx
```

---

### Phase A Detailed: Route Rename

1. Rename directory:
```bash
mv dashboard/app/focus dashboard/app/review
```

2. Update `dashboard/app/page.tsx`:
```typescript
// Change:
redirect('/focus');
// To:
redirect('/review');
```

3. Update any navigation components that reference `/focus`:
```bash
grep -r "'/focus'" dashboard/components/
grep -r '"/focus"' dashboard/components/
```

---

### Phase A Detailed: Component Deletion

**Delete these files entirely:**
```
dashboard/components/focus-mode/dual-track-scores.tsx
dashboard/components/focus-mode/score-breakdown.tsx
dashboard/components/focus-mode/contract-context.tsx
dashboard/components/focus-mode/follow-up-card.tsx
dashboard/components/focus-mode/follow-up-action-panel.tsx
dashboard/components/board/competitive-intel-tab.tsx
dashboard/components/board/competitor-activity-feed.tsx
dashboard/components/board/competitor-card.tsx
dashboard/components/board/competitor-matrix.tsx
dashboard/components/board/competitor-wins-leaderboard.tsx
dashboard/components/board/email-actions-tab.tsx
dashboard/components/board/contract-context.tsx (if exists)
dashboard/components/board/deal-risk-card.tsx
dashboard/components/board/deal-risk-summary.tsx
dashboard/components/board/follow-up-*.tsx (all)
dashboard/components/board/renewals-pipeline.tsx
dashboard/components/board/recent-contract-awards.tsx
```

**Update `dashboard/components/focus-mode/index.ts`:**
Remove exports for deleted components.

---

### Phase C Detailed: Field Mapping

When rewriting `lib/airtable.ts`, map these fields:

| V1 Field | V2 Airtable Field | Notes |
|----------|-------------------|-------|
| `contextSummary` | `why_now` | Rename in transform |
| `priorityScore` | `priority_tier` | Was numeric, now enum |
| `leadScore` | *removed* | V2 doesn't calculate |
| `managedServicesScore` | *removed* | Per sales strategy |
| `agencyScore` | *removed* | Per sales strategy |
| `primaryTrack` | *removed* | Per sales strategy |
| `draftEmail` | `outreach_draft` | Single field now |
| `draftLinkedIn` | `outreach_draft` | Combined with email |
| `outreachChannel` | `outreach_channel` | Determines which draft type |
| `contact.confidence` | `contact_confidence` | On Opportunities table |

**Environment variables — verify `.env.local` has:**
```bash
AIRTABLE_TABLE_FORCES=tbl...
AIRTABLE_TABLE_CONTACTS=tbl...
AIRTABLE_TABLE_SIGNALS=tbl...
AIRTABLE_TABLE_OPPORTUNITIES=tbl...
```

Remove references to legacy table IDs:
- `tblKjj3MTlRDfVfMU` (old Leads table)
- Any `competitorContracts`, `emailActions`, `waitingFor` references

---

### Execution Checklist

Run these commands at each phase to verify progress:

**After Phase A (deletions):**
```bash
# Should find zero results:
grep -r "PrimaryTrack\|DualTrackScores\|IR35Determination" dashboard/lib/
grep -r "managedServicesScore\|agencyScore" dashboard/components/
```

**After Phase B (types):**
```bash
# Should compile with only airtable.ts errors:
cd dashboard && npx tsc --noEmit 2>&1 | head -50
```

**After Phase C (airtable.ts):**
```bash
# Should compile cleanly:
cd dashboard && npx tsc --noEmit
```

**After Phase G (full test):**
```bash
cd dashboard && npm run build
cd dashboard && npm run dev
# Verify at http://localhost:3000/review
```

---

## Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | App builds without errors | `npm run build` succeeds |
| 2 | Queue loads opportunities from V2 Airtable | Data displays correctly |
| 3 | Three-Zone layout renders | Queue left, Now Card centre, Composer right |
| 4 | Keyboard navigation works | J/K moves through queue |
| 5 | Priority badges display | Hot/High/Medium/Low show correctly |
| 6 | Why Now context shows | AI-generated summary displays |
| 7 | Contact card shows | Name, role, email visible |
| 8 | Send action works | Updates status to "sent" |
| 9 | Skip action works | Removes from queue |
| 10 | Progress header updates | Shows X of Y processed |
| 11 | Design tokens applied | Dark theme, correct colours |
| 12 | No dual-track UI | No MS/AG scores visible |
| 13 | No contracts UI | No contract sections visible |
| 14 | No email actions | No email queue route |
| 15 | Route is `/review` not `/focus` | Navigate to localhost:3000, redirects to /review |
| 16 | No dual-track UI anywhere | Search codebase for "managed\|agency" returns zero UI hits |
| 17 | Sort order correct | Hot opportunities appear first, then by date within tier |
| 18 | Docker build succeeds | `docker build .` completes without errors |
| 19 | Production deploy works | Deployed URL loads data from V2 Airtable |

---

## Testing Plan

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 1 | Load `/review` with 5 Ready opportunities | Queue shows 5 items, first selected |
| 2 | Press J three times | Selection moves to 4th item |
| 3 | Press K once | Selection moves back to 3rd |
| 4 | View Now Card for hot opportunity | Shows force name, priority badge, why_now |
| 5 | View Now Card contact section | Shows contact name, role, email |
| 6 | Click Send Email | Status updates, advances to next |
| 7 | Click Skip | Item removed, advances to next |
| 8 | Process 3 of 5 | Progress shows "3 of 5" |
| 9 | Process all 5 | Empty state shows |
| 10 | Check for dual-track UI | None visible |
| 11 | Check for contracts UI | None visible |
| 12 | Navigate to `/email` | 404 or redirect |

---

## Files Changed Summary

### Deleted Files

```
lib/types/email.ts
lib/types/board.ts
lib/stores/board-store.ts
lib/stores/captures-store.ts (if exists)
lib/stores/pins-store.ts
components/focus-mode/dual-track-scores.tsx
components/focus-mode/score-breakdown.tsx
components/focus-mode/contract-context.tsx
components/focus-mode/follow-up-card.tsx
components/focus-mode/follow-up-action-panel.tsx
components/board/competitive-intel-tab.tsx
components/board/competitor-*.tsx
components/board/email-actions-tab.tsx
components/board/deal-risk-*.tsx
components/board/renewals-pipeline.tsx
components/board/recent-contract-awards.tsx
app/email/ (entire directory)
app/tenders/ (entire directory)
```

### Rewritten Files

```
lib/airtable.ts (complete replacement)
lib/types/opportunity.ts (simplified)
lib/types/lead.ts (simplified)
lib/stores/opportunities-store.ts (simplified)
components/focus-mode/now-card.tsx (stripped)
app/page.tsx (redirect only)
```

### Unchanged Files

```
lib/utils.ts
styles/tokens.css
components/ui/* (all base components)
components/feedback/* (toast, empty state, etc.)
.env.local (preserved)
```

---

## Guardrails Applied

- **G-012**: UI must support keyboard-only operation ✓
- **G-013**: Progress feedback required for queue processing ✓
- **G-014**: Single-focus display (one opportunity at a time) ✓

---

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| V1 code copied to `dashboard/` | ✅ Complete | James did this manually |
| `.env.local` preserved | ✅ Complete | V2 credentials in place |
| SPEC-001 (Airtable Schema) | ✅ Complete | 4 tables exist |
| SPEC-005 (Opportunity Enricher) | ✅ Complete | Populates why_now, draft |

### Current State Acknowledgment

V1 code exists in `dashboard/` but is **not yet functional** against V2 schema:
- `lib/airtable.ts` references ~12 legacy tables that don't exist in V2
- Type definitions expect ~30 fields V2 doesn't have
- Store logic depends on dual-track (managed/agency) filtering
- Route is `/focus`, spec requires `/review`

This spec transforms the codebase from V1-compatible to V2-compatible.

---

## Handoff to Claude Code

**Context**: Migrate V1 dashboard to V2 backend by stripping features and rewiring data layer

**Key files to read first**:
- This spec (SPEC-009)
- `dashboard/lib/airtable.ts` (to understand current structure before replacing)
- `dashboard/lib/types/opportunity.ts` (to see what to simplify)
- `dashboard/components/focus-mode/now-card.tsx` (to see what to strip)

**Execution approach**:
1. Work through Build Sequence phases A through G in order
2. Compile frequently to catch errors early
3. Don't try to preserve unused code — delete aggressively
4. When in doubt, simpler is better

**On completion**:
- App runs locally with `npm run dev`
- Connects to V2 Airtable
- Queue displays opportunities
- Send/Skip actions work
- STATUS.md updated
