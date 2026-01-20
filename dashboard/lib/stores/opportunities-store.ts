// @ts-nocheck
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Opportunity,
  OpportunityStatus,
  OpportunityQueueMode,
  PrimaryTrack,
} from "@/lib/types/opportunity";

interface OpportunitiesState {
  // Data
  opportunities: Opportunity[];
  currentOpportunityId: string | null;
  queueMode: OpportunityQueueMode;

  // Loading states
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;

  // Actions
  setOpportunities: (opportunities: Opportunity[]) => void;
  updateOpportunity: (id: string, updates: Partial<Opportunity>) => void;

  // API Actions
  fetchOpportunities: () => Promise<void>;
  updateOpportunityStatusAPI: (
    id: string,
    status: OpportunityStatus,
    notes?: string
  ) => Promise<void>;

  // Navigation
  setCurrentOpportunity: (id: string | null) => void;
  nextOpportunity: () => void;
  prevOpportunity: () => void;

  // Queue
  setQueueMode: (mode: OpportunityQueueMode) => void;
  getFilteredOpportunities: () => Opportunity[];
  getCurrentOpportunity: () => Opportunity | undefined;

  // Actions on current opportunity
  actionOpportunity: (channel: "email" | "phone" | "linkedin") => void;
  markAsWon: () => void;
  markAsLost: () => void;
  markAsDormant: () => void;

  // Loading states
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useOpportunitiesStore = create<OpportunitiesState>()(
  persist(
    (set, get) => ({
      // Initial state
      opportunities: [],
      currentOpportunityId: null,
      queueMode: "priority",
      isLoading: false,
      error: null,
      lastFetched: null,

      // Fetch opportunities from API
      fetchOpportunities: async () => {
        const { isLoading, lastFetched } = get();

        // Prevent duplicate fetches and rate limit to once per 30 seconds
        if (isLoading) return;
        if (lastFetched && Date.now() - lastFetched < 30000) return;

        set({ isLoading: true, error: null });

        try {
          const response = await fetch("/api/opportunities");
          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error || "Failed to fetch opportunities");
          }

          const { currentOpportunityId, queueMode } = get();
          const newOpportunities = result.data;

          // Filter for active opportunities
          const activeOpportunities = newOpportunities.filter(
            (o: Opportunity) =>
              o.status !== "won" && o.status !== "lost" && o.status !== "dormant"
          );

          // Apply queue mode filtering
          const filteredOpportunities = getFilteredOpportunitiesInternal(
            activeOpportunities,
            queueMode
          );

          // Check if current selection exists in filtered opportunities
          const currentExists =
            currentOpportunityId &&
            filteredOpportunities.some(
              (o: Opportunity) => o.id === currentOpportunityId
            );

          set({
            opportunities: newOpportunities,
            isLoading: false,
            lastFetched: Date.now(),
            currentOpportunityId: currentExists
              ? currentOpportunityId
              : filteredOpportunities[0]?.id || null,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch opportunities",
            isLoading: false,
          });
        }
      },

      // Update opportunity status via API
      updateOpportunityStatusAPI: async (id, status, notes) => {
        try {
          const response = await fetch(`/api/opportunities/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status, notes }),
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error || "Failed to update opportunity");
          }

          // Update local state
          get().updateOpportunity(id, { status });
        } catch (error) {
          console.error("Failed to update opportunity status:", error);
        }
      },

      // Set all opportunities
      setOpportunities: (opportunities) => {
        set({ opportunities, error: null });
        if (!get().currentOpportunityId && opportunities.length > 0) {
          set({ currentOpportunityId: opportunities[0].id });
        }
      },

      // Update opportunity
      updateOpportunity: (id, updates) => {
        set((state) => ({
          opportunities: state.opportunities.map((opp) =>
            opp.id === id ? { ...opp, ...updates } : opp
          ),
        }));
      },

      // Set current opportunity
      setCurrentOpportunity: (id) => {
        set({ currentOpportunityId: id });
      },

      // Navigate to next opportunity
      nextOpportunity: () => {
        const { opportunities, currentOpportunityId, queueMode } = get();
        const filteredOpportunities = getFilteredOpportunitiesInternal(
          opportunities,
          queueMode
        );
        const currentIndex = filteredOpportunities.findIndex(
          (o) => o.id === currentOpportunityId
        );

        if (currentIndex < filteredOpportunities.length - 1) {
          set({ currentOpportunityId: filteredOpportunities[currentIndex + 1].id });
        } else if (filteredOpportunities.length > 0) {
          set({ currentOpportunityId: filteredOpportunities[0].id });
        }
      },

      // Navigate to previous opportunity
      prevOpportunity: () => {
        const { opportunities, currentOpportunityId, queueMode } = get();
        const filteredOpportunities = getFilteredOpportunitiesInternal(
          opportunities,
          queueMode
        );
        const currentIndex = filteredOpportunities.findIndex(
          (o) => o.id === currentOpportunityId
        );

        if (currentIndex > 0) {
          set({
            currentOpportunityId: filteredOpportunities[currentIndex - 1].id,
          });
        } else if (filteredOpportunities.length > 0) {
          set({
            currentOpportunityId:
              filteredOpportunities[filteredOpportunities.length - 1].id,
          });
        }
      },

      // Set queue mode
      setQueueMode: (mode) => {
        set({ queueMode: mode });
        const filtered = getFilteredOpportunitiesInternal(
          get().opportunities,
          mode
        );
        if (filtered.length > 0) {
          set({ currentOpportunityId: filtered[0].id });
        }
      },

      // Get filtered opportunities based on queue mode
      getFilteredOpportunities: () => {
        const { opportunities, queueMode } = get();
        return getFilteredOpportunitiesInternal(opportunities, queueMode);
      },

      // Get current opportunity
      getCurrentOpportunity: () => {
        const { opportunities, currentOpportunityId } = get();
        return opportunities.find((o) => o.id === currentOpportunityId);
      },

      // Action current opportunity
      actionOpportunity: (channel) => {
        const {
          currentOpportunityId,
          updateOpportunity,
          updateOpportunityStatusAPI,
          nextOpportunity,
        } = get();
        if (!currentOpportunityId) return;

        updateOpportunity(currentOpportunityId, { status: "actioned" });
        updateOpportunityStatusAPI(
          currentOpportunityId,
          "actioned",
          `Actioned via ${channel}`
        );
        nextOpportunity();
      },

      // Mark as won
      markAsWon: () => {
        const {
          currentOpportunityId,
          updateOpportunity,
          updateOpportunityStatusAPI,
          nextOpportunity,
        } = get();
        if (!currentOpportunityId) return;

        updateOpportunity(currentOpportunityId, { status: "won" });
        updateOpportunityStatusAPI(currentOpportunityId, "won");
        nextOpportunity();
      },

      // Mark as lost
      markAsLost: () => {
        const {
          currentOpportunityId,
          updateOpportunity,
          updateOpportunityStatusAPI,
          nextOpportunity,
        } = get();
        if (!currentOpportunityId) return;

        updateOpportunity(currentOpportunityId, { status: "lost" });
        updateOpportunityStatusAPI(currentOpportunityId, "lost");
        nextOpportunity();
      },

      // Mark as dormant
      markAsDormant: () => {
        const {
          currentOpportunityId,
          updateOpportunity,
          updateOpportunityStatusAPI,
          nextOpportunity,
        } = get();
        if (!currentOpportunityId) return;

        updateOpportunity(currentOpportunityId, { status: "dormant" });
        updateOpportunityStatusAPI(currentOpportunityId, "dormant");
        nextOpportunity();
      },

      // Loading states
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: "mi-opportunities-store",
      partialize: (state) => ({
        currentOpportunityId: state.currentOpportunityId,
        queueMode: state.queueMode,
      }),
    }
  )
);

/**
 * Internal helper to filter opportunities by queue mode
 */
function getFilteredOpportunitiesInternal(
  opportunities: Opportunity[],
  queueMode: OpportunityQueueMode
): Opportunity[] {
  // Filter out closed statuses
  const activeOpportunities = opportunities.filter(
    (o) => o.status !== "won" && o.status !== "lost" && o.status !== "dormant"
  );

  switch (queueMode) {
    case "priority":
      return activeOpportunities
        .filter((o) => o.primaryScore >= 60)
        .sort((a, b) => b.primaryScore - a.primaryScore);

    case "managed":
      return activeOpportunities
        .filter((o) => o.primaryTrack === "managed")
        .sort((a, b) => b.managedServicesScore - a.managedServicesScore);

    case "agency":
      return activeOpportunities
        .filter((o) => o.primaryTrack === "agency")
        .sort((a, b) => b.agencyScore - a.agencyScore);

    case "by_force":
      // Group by force, sort by force priority rank
      return activeOpportunities.sort((a, b) => {
        // First by force priority rank
        const rankA = a.priorityRank || 999;
        const rankB = b.priorityRank || 999;
        if (rankA !== rankB) return rankA - rankB;
        // Then by primary score
        return b.primaryScore - a.primaryScore;
      });

    case "follow_up":
      // Show opportunities with follow-ups due, sorted by due date
      return activeOpportunities
        .filter((o) =>
          o.followUpStatus === "step_1_due" ||
          o.followUpStatus === "step_2_due" ||
          o.followUpStatus === "step_3_due"
        )
        .sort((a, b) => {
          // Sort by follow-up due date (earliest first)
          if (a.followUpDueDate && b.followUpDueDate) {
            return new Date(a.followUpDueDate).getTime() - new Date(b.followUpDueDate).getTime();
          }
          if (a.followUpDueDate) return -1;
          if (b.followUpDueDate) return 1;
          // Fallback to follow-up step
          return (a.followUpStep || 0) - (b.followUpStep || 0);
        });

    case "all":
    default:
      return activeOpportunities.sort((a, b) => b.primaryScore - a.primaryScore);
  }
}
