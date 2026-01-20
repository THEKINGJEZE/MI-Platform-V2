/**
 * Board Store - Stub for V2 Migration
 *
 * Minimal store to allow board components to compile.
 * Full implementation deferred to future phases.
 */

import { create } from 'zustand';
import type {
  KPI,
  ForceRanking,
  PipelineData,
  BoardSignal,
} from '@/lib/types/board';

interface BoardState {
  // Loading states
  isLoading: boolean;
  isLoadingMarketLandscape: boolean;
  isLoadingPipeline: boolean;

  // Error state
  error: string | null;

  // Selection
  selectedForceId: string | null;
  dateRange: {
    start: string;
    end: string;
  } | null;

  // Data (all stubbed for now)
  kpis: KPI[];
  marketLandscape: ForceRanking[];
  pipeline: PipelineData | null;
  signals: BoardSignal[];

  // Actions
  setSelectedForce: (forceId: string | null) => void;
  setDateRange: (range: { start: string; end: string } | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Fetch functions (stubbed)
  fetchKPIs: () => Promise<void>;
  fetchMarketLandscape: () => Promise<void>;
  fetchPipeline: () => Promise<void>;
}

export const useBoardStore = create<BoardState>((set) => ({
  // Initial state
  isLoading: false,
  isLoadingMarketLandscape: false,
  isLoadingPipeline: false,
  error: null,
  selectedForceId: null,
  dateRange: null,
  kpis: [],
  marketLandscape: [],
  pipeline: null,
  signals: [],

  // Actions
  setSelectedForce: (forceId) => set({ selectedForceId: forceId }),
  setDateRange: (range) => set({ dateRange: range }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // Fetch functions - stubbed to do nothing for MVP
  fetchKPIs: async () => {
    // Stub - will be implemented in future phase
  },
  fetchMarketLandscape: async () => {
    // Stub - will be implemented in future phase
  },
  fetchPipeline: async () => {
    // Stub - will be implemented in future phase
  },
}));
