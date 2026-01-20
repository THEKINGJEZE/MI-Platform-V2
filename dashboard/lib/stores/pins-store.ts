// @ts-nocheck
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Pins Store - Stub for V2
 * Pin tray feature is deferred but store needed for components to compile.
 */

export interface PinnedItem {
  id: string;
  type: "lead" | "organisation" | "contact" | "insight";
  title: string;
  subtitle?: string;
  href: string;
  pinnedAt: string;
}

interface PinsState {
  pins: PinnedItem[];
  addPin: (item: Omit<PinnedItem, "pinnedAt">) => void;
  removePin: (id: string) => void;
  isPinned: (id: string) => boolean;
  togglePin: (item: Omit<PinnedItem, "pinnedAt">) => void;
  clearPins: () => void;
}

const MAX_PINS = 10;

export const usePinsStore = create<PinsState>()(
  persist(
    (set, get) => ({
      pins: [],

      addPin: (item) => {
        const { pins } = get();
        if (pins.length >= MAX_PINS) return;
        if (pins.some((p) => p.id === item.id)) return;

        set({
          pins: [
            ...pins,
            { ...item, pinnedAt: new Date().toISOString() },
          ],
        });
      },

      removePin: (id) => {
        set((state) => ({
          pins: state.pins.filter((p) => p.id !== id),
        }));
      },

      isPinned: (id) => get().pins.some((p) => p.id === id),

      togglePin: (item) => {
        const { pins, addPin, removePin } = get();
        if (pins.some((p) => p.id === item.id)) {
          removePin(item.id);
        } else {
          addPin(item);
        }
      },

      clearPins: () => set({ pins: [] }),
    }),
    {
      name: "mi-pins-store",
    }
  )
);
