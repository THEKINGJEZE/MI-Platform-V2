// @ts-nocheck
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EnergyLevel, SessionStats } from "@/lib/types/lead";

interface SessionState {
  // Session data
  stats: SessionStats;
  energyLevel: EnergyLevel | null;
  todaysLeadIds: string[]; // The 3 leads locked in for today

  // Morning Brief
  morningBriefCompleted: boolean;
  morningBriefCompletedAt: string | null;

  // Undo buffer
  undoStack: UndoAction[];

  // Actions
  setEnergyLevel: (level: EnergyLevel) => void;
  lockInTodaysLeads: (leadIds: string[]) => void;
  completeMorningBrief: () => void;
  resetDaySession: () => void;

  // Stats
  incrementProcessed: (timeSeconds: number) => void;
  getProgress: () => { processed: number; total: number; percentage: number };

  // Undo
  pushUndo: (action: UndoAction) => void;
  popUndo: () => UndoAction | undefined;
  clearExpiredUndos: () => void;
}

interface UndoAction {
  id: string;
  type: "action" | "skip" | "dismiss" | "snooze";
  leadId: string;
  previousStatus: string;
  timestamp: number;
  expiresAt: number; // 30 seconds from creation
}

const UNDO_EXPIRY_MS = 30000; // 30 seconds

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      // Initial state
      stats: {
        todayProcessed: 0,
        todayTotal: 0,
        allTimeProcessed: 0,
        averageTimeSeconds: 0,
        sessionStartedAt: undefined,
      },
      energyLevel: null,
      todaysLeadIds: [],
      morningBriefCompleted: false,
      morningBriefCompletedAt: null,
      undoStack: [],

      // Set energy level
      setEnergyLevel: (level) => {
        set({ energyLevel: level });
      },

      // Lock in today's leads (Rule of Three)
      lockInTodaysLeads: (leadIds) => {
        set({
          todaysLeadIds: leadIds,
          stats: {
            ...get().stats,
            todayTotal: leadIds.length,
          },
        });
      },

      // Complete morning brief
      completeMorningBrief: () => {
        const now = new Date().toISOString();
        set({
          morningBriefCompleted: true,
          morningBriefCompletedAt: now,
          stats: {
            ...get().stats,
            todayProcessed: 0, // Reset daily counter
            sessionStartedAt: now,
          },
        });
      },

      // Reset day session (at midnight or new morning brief)
      resetDaySession: () => {
        set({
          energyLevel: null,
          todaysLeadIds: [],
          morningBriefCompleted: false,
          morningBriefCompletedAt: null,
          stats: {
            ...get().stats,
            todayProcessed: 0,
            todayTotal: 0,
            sessionStartedAt: undefined,
          },
        });
      },

      // Increment processed count
      incrementProcessed: (timeSeconds) => {
        const { stats } = get();
        // Ensure numeric values to prevent NaN propagation
        const currentProcessed = stats.todayProcessed || 0;
        const currentAllTime = stats.allTimeProcessed || 0;
        const currentAverage = stats.averageTimeSeconds || 0;

        const newProcessed = currentProcessed + 1;
        const newAllTime = currentAllTime + 1;

        // Calculate running average
        const totalTime = currentAverage * currentAllTime + timeSeconds;
        const newAverage = newAllTime > 0 ? totalTime / newAllTime : 0;

        set({
          stats: {
            ...stats,
            todayProcessed: newProcessed,
            allTimeProcessed: newAllTime,
            averageTimeSeconds: Math.round(newAverage),
          },
        });
      },

      // Get progress info
      getProgress: () => {
        const { stats, todaysLeadIds } = get();
        const total = todaysLeadIds.length || stats.todayTotal || 12; // Default to 12 for demo
        const processed = stats.todayProcessed || 0; // Ensure numeric value
        const percentage = total > 0 ? Math.round((processed / total) * 100) : 0;

        return { processed, total, percentage };
      },

      // Push undo action
      pushUndo: (action) => {
        const now = Date.now();
        const newAction = {
          ...action,
          timestamp: now,
          expiresAt: now + UNDO_EXPIRY_MS,
        };

        set((state) => ({
          undoStack: [...state.undoStack, newAction],
        }));

        // Auto-clear after expiry
        setTimeout(() => {
          get().clearExpiredUndos();
        }, UNDO_EXPIRY_MS + 100);
      },

      // Pop undo action
      popUndo: () => {
        const { undoStack } = get();
        const now = Date.now();

        // Find most recent non-expired action
        const validActions = undoStack.filter((a) => a.expiresAt > now);

        if (validActions.length === 0) return undefined;

        const action = validActions[validActions.length - 1];

        set({
          undoStack: undoStack.filter((a) => a.id !== action.id),
        });

        return action;
      },

      // Clear expired undos
      clearExpiredUndos: () => {
        const now = Date.now();
        set((state) => ({
          undoStack: state.undoStack.filter((a) => a.expiresAt > now),
        }));
      },
    }),
    {
      name: "mi-session-store",
      partialize: (state) => ({
        stats: {
          allTimeProcessed: state.stats.allTimeProcessed,
          averageTimeSeconds: state.stats.averageTimeSeconds,
        },
        morningBriefCompletedAt: state.morningBriefCompletedAt,
      }),
    }
  )
);

/**
 * Format time as mm:ss
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
