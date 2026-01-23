/**
 * Relationship Decay Alert types for Phase 2a-7
 *
 * Per SPEC-012 Section 8a and Decision I4:
 * - Two-tier thresholds: Active Pipeline vs Closed Won
 * - Deal-level and Organisation-level tracking
 *
 * Dashboard sections:
 * - "Deal Contacts Going Cold" — Active pipeline
 * - "Client Check-ins Due" — Closed Won (existing clients)
 * - "Organisations Going Quiet" — Force-level (any contact)
 */

export type DecayStatus = 'active' | 'warming' | 'at_risk' | 'cold';
export type DecayAlertType = 'deal_contact' | 'client_checkin' | 'organisation';

export interface DecayAlert {
  id: string;
  alertType: DecayAlertType;

  // What's decaying
  dealId?: string;
  dealName?: string;
  isClosedWon: boolean;
  forceId?: string;
  forceName?: string;

  // Contact info
  contactId: string;
  contactName: string;
  contactEmail?: string;
  contactRole?: string;

  // Decay status
  status: DecayStatus;
  daysSinceContact: number;
  lastContactDate?: string;

  // AI-generated suggestion
  suggestedTouchpoint?: string;

  // Metadata
  calculatedAt: string;
  acknowledgedAt?: string;
}

export interface DecayAlertsBySection {
  dealContacts: DecayAlert[]; // Active pipeline deals going cold
  clientCheckins: DecayAlert[]; // Closed Won contacts needing check-in
  organisations: DecayAlert[]; // Force-level (any contact)
}

export interface DecayStats {
  total: number;
  cold: number;
  atRisk: number;
  warming: number;
  dealContacts: number;
  clientCheckins: number;
  organisations: number;
}

// Status color mapping for UI
export const DECAY_STATUS_CONFIG: Record<
  DecayStatus,
  {
    color: string;
    bgColor: string;
    label: string;
    emoji: string;
  }
> = {
  active: {
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Active',
    emoji: '🟢',
  },
  warming: {
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    label: 'Warming',
    emoji: '🟡',
  },
  at_risk: {
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    label: 'At Risk',
    emoji: '🟠',
  },
  cold: {
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: 'Cold',
    emoji: '🔴',
  },
};

// Thresholds for display reference (actual logic in n8n workflow)
export const DECAY_THRESHOLDS = {
  activePipeline: {
    warming: 8,
    atRisk: 15,
    cold: 30,
    description: 'Days since contact for active deals',
  },
  closedWon: {
    warming: 31,
    atRisk: 61,
    cold: 90,
    description: 'Days since contact for existing clients',
  },
};
