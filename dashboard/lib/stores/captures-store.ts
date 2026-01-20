// @ts-nocheck
"use client";

import { create } from "zustand";

/**
 * Captures Store - Stub for V2
 * Quick capture feature is deferred
 */
interface CapturesState {
  captures: string[];
  addCapture: (text: string) => void;
  clearCaptures: () => void;
}

export const useCapturesStore = create<CapturesState>((set) => ({
  captures: [],
  addCapture: (text) =>
    set((state) => ({ captures: [...state.captures, text] })),
  clearCaptures: () => set({ captures: [] }),
}));
