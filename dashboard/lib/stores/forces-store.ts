// @ts-nocheck
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useCallback } from "react";
import type { Force, ForceSegment } from "@/lib/types/opportunity";

/**
 * Forces Store — State management for Forces Dashboard
 *
 * Provides:
 * - Force list with filtering and sorting
 * - Selection state for expanded details
 * - Segment counts for breakdown cards
 * - Keyboard navigation support
 */

export type SortField = "priorityRank" | "name" | "propensityScore" | "relationshipScore";
export type SortDirection = "asc" | "desc";

interface ForcesState {
  // Data
  forces: Force[];
  loading: boolean;
  error: string | null;
  lastFetched: string | null;

  // Selection
  selectedForceId: string | null;
  expandedForceId: string | null;

  // Filters
  searchQuery: string;
  regionFilter: string | null;
  segmentFilter: ForceSegment | null;
  hmicfrsFilter: string | null;

  // Sort
  sortField: SortField;
  sortDirection: SortDirection;

  // Actions
  setForces: (forces: Force[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Selection actions
  selectForce: (forceId: string | null) => void;
  expandForce: (forceId: string | null) => void;
  toggleExpand: (forceId: string) => void;

  // Filter actions
  setSearchQuery: (query: string) => void;
  setRegionFilter: (region: string | null) => void;
  setSegmentFilter: (segment: ForceSegment | null) => void;
  setHmicfrsFilter: (status: string | null) => void;
  clearFilters: () => void;

  // Sort actions
  setSortField: (field: SortField) => void;
  setSortDirection: (direction: SortDirection) => void;
  toggleSortDirection: () => void;

  // Keyboard navigation
  selectNext: () => void;
  selectPrevious: () => void;

  // Derived getters (computed in component)
  getFilteredForces: () => Force[];
  getSegmentCounts: () => Record<ForceSegment, number>;
  getSelectedForce: () => Force | undefined;
  getExpandedForce: () => Force | undefined;
}

export const useForcesStore = create<ForcesState>()(
  persist(
    (set, get) => ({
      // Initial state
      forces: [],
      loading: false,
      error: null,
      lastFetched: null,

      selectedForceId: null,
      expandedForceId: null,

      searchQuery: "",
      regionFilter: null,
      segmentFilter: null,
      hmicfrsFilter: null,

      sortField: "priorityRank",
      sortDirection: "asc",

      // Data actions
      setForces: (forces) =>
        set({
          forces,
          loading: false,
          lastFetched: new Date().toISOString(),
          error: null,
        }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error, loading: false }),

      // Selection actions
      selectForce: (forceId) => set({ selectedForceId: forceId }),

      expandForce: (forceId) => set({ expandedForceId: forceId }),

      toggleExpand: (forceId) => {
        const { expandedForceId } = get();
        set({
          expandedForceId: expandedForceId === forceId ? null : forceId,
        });
      },

      // Filter actions
      setSearchQuery: (query) => set({ searchQuery: query }),

      setRegionFilter: (region) => set({ regionFilter: region }),

      setSegmentFilter: (segment) => set({ segmentFilter: segment }),

      setHmicfrsFilter: (status) => set({ hmicfrsFilter: status }),

      clearFilters: () =>
        set({
          searchQuery: "",
          regionFilter: null,
          segmentFilter: null,
          hmicfrsFilter: null,
        }),

      // Sort actions
      setSortField: (field) => set({ sortField: field }),

      setSortDirection: (direction) => set({ sortDirection: direction }),

      toggleSortDirection: () => {
        const { sortDirection } = get();
        set({ sortDirection: sortDirection === "asc" ? "desc" : "asc" });
      },

      // Keyboard navigation
      selectNext: () => {
        const { forces, selectedForceId } = get();
        const filtered = get().getFilteredForces();
        if (filtered.length === 0) return;

        if (!selectedForceId) {
          set({ selectedForceId: filtered[0].id });
          return;
        }

        const currentIndex = filtered.findIndex((f) => f.id === selectedForceId);
        if (currentIndex < filtered.length - 1) {
          set({ selectedForceId: filtered[currentIndex + 1].id });
        }
      },

      selectPrevious: () => {
        const { selectedForceId } = get();
        const filtered = get().getFilteredForces();
        if (filtered.length === 0) return;

        if (!selectedForceId) {
          set({ selectedForceId: filtered[filtered.length - 1].id });
          return;
        }

        const currentIndex = filtered.findIndex((f) => f.id === selectedForceId);
        if (currentIndex > 0) {
          set({ selectedForceId: filtered[currentIndex - 1].id });
        }
      },

      // Derived getters
      getFilteredForces: () => {
        const {
          forces,
          searchQuery,
          regionFilter,
          segmentFilter,
          hmicfrsFilter,
          sortField,
          sortDirection,
        } = get();

        let filtered = [...forces];

        // Apply search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (f) =>
              f.name.toLowerCase().includes(query) ||
              f.region?.toLowerCase().includes(query)
          );
        }

        // Apply region filter
        if (regionFilter) {
          filtered = filtered.filter((f) => f.region === regionFilter);
        }

        // Apply segment filter
        if (segmentFilter) {
          filtered = filtered.filter((f) => f.segment === segmentFilter);
        }

        // Apply HMICFRS filter
        if (hmicfrsFilter) {
          filtered = filtered.filter((f) => f.hmicfrsStatus === hmicfrsFilter);
        }

        // Apply sorting
        filtered.sort((a, b) => {
          let comparison = 0;

          switch (sortField) {
            case "priorityRank":
              comparison = (a.priorityRank || 999) - (b.priorityRank || 999);
              break;
            case "name":
              comparison = a.name.localeCompare(b.name);
              break;
            case "propensityScore":
              comparison = (b.propensityScore || 0) - (a.propensityScore || 0);
              break;
            case "relationshipScore":
              comparison = (b.relationshipScore || 0) - (a.relationshipScore || 0);
              break;
          }

          return sortDirection === "asc" ? comparison : -comparison;
        });

        return filtered;
      },

      getSegmentCounts: () => {
        const { forces } = get();
        const counts: Record<ForceSegment, number> = {
          fixer: 0,
          recoverer: 0,
          strategic_partner: 0,
          collaborator: 0,
        };

        forces.forEach((f) => {
          if (f.segment && counts[f.segment] !== undefined) {
            counts[f.segment]++;
          }
        });

        return counts;
      },

      getSelectedForce: () => {
        const { forces, selectedForceId } = get();
        return forces.find((f) => f.id === selectedForceId);
      },

      getExpandedForce: () => {
        const { forces, expandedForceId } = get();
        return forces.find((f) => f.id === expandedForceId);
      },
    }),
    {
      name: "mi-forces-store",
      partialize: (state) => ({
        // Only persist user preferences, not data
        sortField: state.sortField,
        sortDirection: state.sortDirection,
      }),
    }
  )
);

/**
 * Hook to fetch forces and update store
 */
export function useFetchForces() {
  const setForces = useForcesStore((state) => state.setForces);
  const setLoading = useForcesStore((state) => state.setLoading);
  const setError = useForcesStore((state) => state.setError);

  const fetchForces = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/forces");
      if (!response.ok) {
        throw new Error(`Failed to fetch forces: ${response.status}`);
      }
      const result = await response.json();
      setForces(result.data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch forces");
    }
  }, [setForces, setLoading, setError]);

  return { fetchForces };
}

/**
 * Get unique regions from forces for filter dropdown
 */
export function useForceRegions() {
  const forces = useForcesStore((state) => state.forces);
  const regions = [...new Set(forces.map((f) => f.region).filter(Boolean))] as string[];
  return regions.sort();
}

/**
 * Get unique HMICFRS statuses for filter dropdown
 */
export function useHmicfrsStatuses() {
  const forces = useForcesStore((state) => state.forces);
  const statuses = [...new Set(forces.map((f) => f.hmicfrsStatus).filter(Boolean))] as string[];
  return statuses.sort();
}
