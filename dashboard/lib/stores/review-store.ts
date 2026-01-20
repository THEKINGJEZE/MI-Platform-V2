/**
 * Review Store — Zustand state management for Monday Review
 *
 * Per SPEC-007b: Three-zone layout state with undo support
 */

import { create } from 'zustand';
import type { OpportunityExpanded } from '../airtable';

// ============================================================================
// Types
// ============================================================================

export type FilterType = 'ready' | 'sent' | 'all';
export type ToastType = 'success' | 'error' | 'undo';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration: number;
  onUndo?: () => void;
}

export interface UndoAction {
  opportunityId: string;
  previousStatus: string;
  previousSkipReason?: string;
  expiresAt: number;
}

export interface SessionStats {
  processed: number;
  total: number;
  startTime: number;
  actionTimes: number[];
}

// Normalized opportunity for UI (field names mapped from Airtable)
export interface ReviewOpportunity {
  id: string;
  name: string;
  force: {
    id: string;
    name: string;
  } | null;
  signals: {
    id: string;
    type: string;
    title: string;
  }[];
  signalCount: number;
  signalTypes: string;
  status: string;
  priority: string;
  contact: {
    id: string;
    name: string;
    title: string;
    email: string;
    linkedin?: string;
    // SPEC-007a: Contact confidence fields
    researchConfidence?: number;  // 0-100 confidence score
    confidenceSources?: string[];  // Array of source strings
  } | null;
  whyNow: string | null;
  draftSubject: string | null;
  draftBody: string | null;
  isCompetitorIntercept: boolean;
  // SPEC-007a: Priority and contact type fields
  prioritySignals?: string[];  // Array of detected signal patterns (e.g., "competitor", "urgent")
  responseWindow?: 'Same Day' | 'Within 48h' | 'This Week' | string;
  contactType?: 'problem_owner' | 'deputy' | 'hr_fallback' | string;
}

interface ReviewState {
  // Queue state
  opportunities: ReviewOpportunity[];
  currentId: string | null;
  filter: FilterType;

  // Session stats
  stats: SessionStats;

  // Undo stack (max 1 item for simplicity)
  undoStack: UndoAction[];

  // UI state
  isLoading: boolean;
  error: string | null;
  toasts: Toast[];
  isShortcutOverlayOpen: boolean;
  isDismissModalOpen: boolean;

  // Timestamp for undo countdown
  lastActionTime: number | null;

  // Actions — Data
  setOpportunities: (opps: ReviewOpportunity[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Actions — Navigation
  selectOpportunity: (id: string) => void;
  selectNext: () => void;
  selectPrevious: () => void;
  setFilter: (filter: FilterType) => void;

  // Actions — Opportunity
  markAsSent: (id: string) => void;
  markAsSkipped: (id: string, reason?: string) => void;
  markAsDismissed: (id: string, reason: string) => void;
  undo: () => boolean;
  commitAction: (id: string) => void;

  // Actions — UI
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  toggleShortcutOverlay: () => void;
  openDismissModal: () => void;
  closeDismissModal: () => void;

  // Actions — Session
  resetSession: () => void;
  recordActionTime: (ms: number) => void;
}

// ============================================================================
// Constants
// ============================================================================

const UNDO_WINDOW_MS = 30000; // 30 seconds

// ============================================================================
// Store
// ============================================================================

export const useReviewStore = create<ReviewState>((set, get) => ({
  // Initial state
  opportunities: [],
  currentId: null,
  filter: 'ready',
  stats: {
    processed: 0,
    total: 0,
    startTime: Date.now(),
    actionTimes: [],
  },
  undoStack: [],
  isLoading: false,
  error: null,
  toasts: [],
  isShortcutOverlayOpen: false,
  isDismissModalOpen: false,
  lastActionTime: null,

  // ============================================================================
  // Data Actions
  // ============================================================================

  setOpportunities: (opps) => {
    set({
      opportunities: opps,
      stats: {
        ...get().stats,
        total: opps.length,
        startTime: Date.now(),
      },
      currentId: opps.length > 0 ? opps[0].id : null,
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  // ============================================================================
  // Navigation Actions
  // ============================================================================

  selectOpportunity: (id) => set({ currentId: id }),

  selectNext: () => {
    const { opportunities, currentId, filter } = get();
    const filtered = filterOpportunities(opportunities, filter);
    const currentIndex = filtered.findIndex((o) => o.id === currentId);
    if (currentIndex < filtered.length - 1) {
      set({ currentId: filtered[currentIndex + 1].id });
    }
  },

  selectPrevious: () => {
    const { opportunities, currentId, filter } = get();
    const filtered = filterOpportunities(opportunities, filter);
    const currentIndex = filtered.findIndex((o) => o.id === currentId);
    if (currentIndex > 0) {
      set({ currentId: filtered[currentIndex - 1].id });
    }
  },

  setFilter: (filter) => {
    const { opportunities } = get();
    const filtered = filterOpportunities(opportunities, filter);
    set({
      filter,
      currentId: filtered.length > 0 ? filtered[0].id : null,
    });
  },

  // ============================================================================
  // Opportunity Actions
  // ============================================================================

  markAsSent: (id) => {
    const { opportunities, stats } = get();
    const opp = opportunities.find((o) => o.id === id);
    if (!opp) return;

    const previousStatus = opp.status;
    const actionTime = Date.now();

    // Optimistic update
    set({
      opportunities: opportunities.map((o) =>
        o.id === id ? { ...o, status: 'Sent' } : o
      ),
      undoStack: [
        {
          opportunityId: id,
          previousStatus,
          expiresAt: actionTime + UNDO_WINDOW_MS,
        },
      ],
      lastActionTime: actionTime,
      stats: {
        ...stats,
        processed: stats.processed + 1,
      },
    });

    // Auto-advance to next
    get().selectNext();
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  markAsSkipped: (id, _reason) => {
    const { opportunities, stats } = get();
    const opp = opportunities.find((o) => o.id === id);
    if (!opp) return;

    const previousStatus = opp.status;
    const actionTime = Date.now();

    set({
      opportunities: opportunities.map((o) =>
        o.id === id ? { ...o, status: 'Skipped' } : o
      ),
      undoStack: [
        {
          opportunityId: id,
          previousStatus,
          previousSkipReason: undefined,
          expiresAt: actionTime + UNDO_WINDOW_MS,
        },
      ],
      lastActionTime: actionTime,
      stats: {
        ...stats,
        processed: stats.processed + 1,
      },
    });

    get().selectNext();
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  markAsDismissed: (id, _reason) => {
    const { opportunities, stats } = get();
    const opp = opportunities.find((o) => o.id === id);
    if (!opp) return;

    const previousStatus = opp.status;
    const actionTime = Date.now();

    set({
      opportunities: opportunities.map((o) =>
        o.id === id ? { ...o, status: 'Dismissed' } : o
      ),
      undoStack: [
        {
          opportunityId: id,
          previousStatus,
          previousSkipReason: undefined,
          expiresAt: actionTime + UNDO_WINDOW_MS,
        },
      ],
      lastActionTime: actionTime,
      stats: {
        ...stats,
        processed: stats.processed + 1,
      },
      isDismissModalOpen: false,
    });

    get().selectNext();
  },

  undo: () => {
    const { undoStack, opportunities, stats } = get();
    if (undoStack.length === 0) return false;

    const action = undoStack[0];

    // Check if undo window expired
    if (Date.now() > action.expiresAt) {
      set({ undoStack: [] });
      return false;
    }

    // Revert the action
    set({
      opportunities: opportunities.map((o) =>
        o.id === action.opportunityId
          ? { ...o, status: action.previousStatus }
          : o
      ),
      currentId: action.opportunityId,
      undoStack: [],
      stats: {
        ...stats,
        processed: Math.max(0, stats.processed - 1),
      },
    });

    return true;
  },

  commitAction: (id) => {
    // Called when undo window expires — action is already applied optimistically
    // This just clears the undo stack for that action
    const { undoStack } = get();
    set({
      undoStack: undoStack.filter((a) => a.opportunityId !== id),
    });
  },

  // ============================================================================
  // UI Actions
  // ============================================================================

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    set({ toasts: [...get().toasts, { ...toast, id }] });

    // Auto-remove after duration
    setTimeout(() => {
      get().removeToast(id);
    }, toast.duration);
  },

  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },

  toggleShortcutOverlay: () => {
    set({ isShortcutOverlayOpen: !get().isShortcutOverlayOpen });
  },

  openDismissModal: () => set({ isDismissModalOpen: true }),

  closeDismissModal: () => set({ isDismissModalOpen: false }),

  // ============================================================================
  // Session Actions
  // ============================================================================

  resetSession: () => {
    set({
      stats: {
        processed: 0,
        total: get().opportunities.length,
        startTime: Date.now(),
        actionTimes: [],
      },
      undoStack: [],
    });
  },

  recordActionTime: (ms) => {
    const { stats } = get();
    set({
      stats: {
        ...stats,
        actionTimes: [...stats.actionTimes, ms],
      },
    });
  },
}));

// ============================================================================
// Selectors
// ============================================================================

function filterOpportunities(
  opportunities: ReviewOpportunity[],
  filter: FilterType
): ReviewOpportunity[] {
  switch (filter) {
    case 'ready':
      return opportunities.filter(
        (o) => o.status.toLowerCase() === 'ready' || o.status.toLowerCase() === 'new'
      );
    case 'sent':
      return opportunities.filter((o) => o.status.toLowerCase() === 'sent');
    case 'all':
      return opportunities;
  }
}

export function useCurrentOpportunity(): ReviewOpportunity | null {
  return useReviewStore((state) => {
    const { opportunities, currentId } = state;
    return opportunities.find((o) => o.id === currentId) ?? null;
  });
}

export function useFilteredOpportunities(): ReviewOpportunity[] {
  return useReviewStore((state) =>
    filterOpportunities(state.opportunities, state.filter)
  );
}

export function useSessionProgress(): {
  processed: number;
  total: number;
  percentage: number;
  averageTime: number;
} {
  return useReviewStore((state) => {
    const { processed, total, actionTimes } = state.stats;
    const percentage = total > 0 ? Math.round((processed / total) * 100) : 0;
    const averageTime =
      actionTimes.length > 0
        ? Math.round(
            actionTimes.reduce((a, b) => a + b, 0) / actionTimes.length / 1000
          )
        : 0;
    return { processed, total, percentage, averageTime };
  });
}

export function useUndoTimeRemaining(): number {
  return useReviewStore((state) => {
    if (state.undoStack.length === 0) return 0;
    const remaining = state.undoStack[0].expiresAt - Date.now();
    return Math.max(0, remaining);
  });
}

// ============================================================================
// Utility: Map Airtable opportunity to ReviewOpportunity
// ============================================================================

// Accept both nested { id, fields } and flattened { id, ...fields } formats
export function mapOpportunityToReview(
  record: { id: string; fields?: OpportunityExpanded } & Partial<OpportunityExpanded>
): ReviewOpportunity {
  // Handle both formats: nested fields or flattened
  const f = record.fields || record;
  const id = record.id;

  // SPEC-007a: Parse priority_signals JSON array
  let prioritySignals: string[] | undefined;
  if (f.priority_signals) {
    try {
      prioritySignals = typeof f.priority_signals === 'string'
        ? JSON.parse(f.priority_signals)
        : f.priority_signals;
    } catch {
      prioritySignals = [];
    }
  }

  return {
    id,
    name: f.name || 'Unknown',
    force:
      f.force && f.force_name
        ? {
            id: f.force[0],
            name: f.force_name[0] || 'Unknown Force',
          }
        : null,
    signals: [], // Would need separate lookup
    signalCount: f.signal_count || 0,
    signalTypes: f.signal_types || '',
    status: f.status || 'New',
    priority: f.priority_tier || 'Medium',
    contact:
      f.contact && f.contact_name
        ? {
            id: f.contact[0],
            name: f.contact_name[0] || 'Unknown',
            title: '', // Would need lookup
            email: f.contact_email?.[0] || '',
            linkedin: f.contact_linkedin?.[0],
            // SPEC-007a: Contact confidence (would need lookup from Contacts table)
            researchConfidence: undefined,
            confidenceSources: undefined,
          }
        : null,
    whyNow: f.why_now || null,
    // Map field names per Stage 2 audit
    draftSubject: f.subject_line || null,
    draftBody: f.outreach_draft || null,
    isCompetitorIntercept: f.is_competitor_intercept || false,
    // SPEC-007a: Priority and contact type fields
    prioritySignals,
    responseWindow: f.response_window || undefined,
    contactType: f.contact_type || undefined,
  };
}
