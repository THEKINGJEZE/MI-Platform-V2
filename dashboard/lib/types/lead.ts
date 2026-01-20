/**
 * Shared types for V2
 * Simplified from V1 - removed dual-track, complex scoring, follow-ups
 */

// PriorityTier is exported from opportunity.ts - don't duplicate here

// Session tracking (in-memory only)
export interface SessionStats {
  processed: number;
  total: number;
  startTime: number;
  actionTimes: number[];
}

// Energy level for Morning Brief (deferred but keeping type)
export type EnergyLevel = 'low' | 'medium' | 'high';
