"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  // Focus mode
  isFocusMode: boolean;
  sidebarDimmed: boolean;

  // Panels
  isCommandPaletteOpen: boolean;
  isNotificationPanelOpen: boolean;
  isShortcutOverlayOpen: boolean;

  // Score breakdown
  expandedScoreBreakdown: boolean;

  // Composer
  composerExpanded: boolean;

  // Density mode
  densityMode: "comfortable" | "compact" | "dense";

  // Toast/notifications
  toasts: Toast[];

  // Actions
  setFocusMode: (enabled: boolean) => void;
  toggleCommandPalette: () => void;
  toggleNotificationPanel: () => void;
  toggleShortcutOverlay: () => void;
  toggleScoreBreakdown: () => void;
  toggleComposer: () => void;
  setDensityMode: (mode: "comfortable" | "compact" | "dense") => void;

  // Toasts
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info" | "undo";
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number; // ms, default 5000
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      isFocusMode: false,
      sidebarDimmed: false,
      isCommandPaletteOpen: false,
      isNotificationPanelOpen: false,
      isShortcutOverlayOpen: false,
      expandedScoreBreakdown: false,
      composerExpanded: true,
      densityMode: "comfortable",
      toasts: [],

      // Focus mode
      setFocusMode: (enabled) => {
        set({
          isFocusMode: enabled,
          sidebarDimmed: enabled, // Dim sidebar when in focus mode
        });
      },

      // Command palette (⌘K)
      toggleCommandPalette: () => {
        set((state) => ({
          isCommandPaletteOpen: !state.isCommandPaletteOpen,
          // Close other panels
          isNotificationPanelOpen: false,
          isShortcutOverlayOpen: false,
        }));
      },

      // Notification panel
      toggleNotificationPanel: () => {
        set((state) => ({
          isNotificationPanelOpen: !state.isNotificationPanelOpen,
          isCommandPaletteOpen: false,
          isShortcutOverlayOpen: false,
        }));
      },

      // Shortcut overlay (?)
      toggleShortcutOverlay: () => {
        set((state) => ({
          isShortcutOverlayOpen: !state.isShortcutOverlayOpen,
          isCommandPaletteOpen: false,
          isNotificationPanelOpen: false,
        }));
      },

      // Score breakdown
      toggleScoreBreakdown: () => {
        set((state) => ({
          expandedScoreBreakdown: !state.expandedScoreBreakdown,
        }));
      },

      // Composer
      toggleComposer: () => {
        set((state) => ({
          composerExpanded: !state.composerExpanded,
        }));
      },

      // Density mode
      setDensityMode: (mode) => {
        set({ densityMode: mode });
      },

      // Add toast
      addToast: (toast) => {
        const id = Math.random().toString(36).substring(7);
        const newToast: Toast = { ...toast, id };

        set((state) => ({
          toasts: [...state.toasts, newToast],
        }));

        // Auto-remove after duration
        const duration = toast.duration ?? (toast.type === "undo" ? 30000 : 5000);
        setTimeout(() => {
          get().removeToast(id);
        }, duration);
      },

      // Remove toast
      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },

      // Clear all toasts
      clearToasts: () => {
        set({ toasts: [] });
      },
    }),
    {
      name: "mi-ui-store",
      partialize: (state) => ({
        densityMode: state.densityMode,
      }),
    }
  )
);
