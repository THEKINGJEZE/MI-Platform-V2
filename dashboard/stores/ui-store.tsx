'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

/**
 * UI Store
 *
 * React Context-based store for client-side UI state.
 * Note: Originally designed for Zustand, using Context due to npm issues.
 * Can be migrated to Zustand later.
 *
 * Manages:
 * - Selected opportunity ID
 * - Undo buffer for destructive actions
 * - Toast notifications
 * - Filter states
 */

interface UndoAction {
  id: string;
  type: 'skip' | 'send';
  opportunityId: string;
  previousState: Record<string, unknown>;
  expiresAt: number;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  undoAction?: UndoAction;
}

interface Filters {
  status?: string;
  priority?: string;
  source?: string;
}

interface UIState {
  selectedOpportunityId: string | null;
  undoActions: UndoAction[];
  toasts: Toast[];
  filters: Filters;
  isQueueExpanded: boolean;
}

interface UIActions {
  setSelectedOpportunityId: (id: string | null) => void;
  addUndoAction: (action: Omit<UndoAction, 'id' | 'expiresAt'>) => string;
  removeUndoAction: (id: string) => void;
  addToast: (message: string, type: Toast['type'], undoAction?: UndoAction) => string;
  removeToast: (id: string) => void;
  setFilters: (filters: Partial<Filters>) => void;
  resetFilters: () => void;
  toggleQueueExpanded: () => void;
}

const UIContext = createContext<(UIState & UIActions) | null>(null);

// 30-second undo window (per V1 patterns)
const UNDO_EXPIRY_MS = 30 * 1000;

let toastIdCounter = 0;
let undoIdCounter = 0;

export function UIProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UIState>({
    selectedOpportunityId: null,
    undoActions: [],
    toasts: [],
    filters: {},
    isQueueExpanded: true,
  });

  const setSelectedOpportunityId = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedOpportunityId: id }));
  }, []);

  const addUndoAction = useCallback((action: Omit<UndoAction, 'id' | 'expiresAt'>) => {
    const id = `undo-${++undoIdCounter}`;
    const undoAction: UndoAction = {
      ...action,
      id,
      expiresAt: Date.now() + UNDO_EXPIRY_MS,
    };
    setState(prev => ({
      ...prev,
      undoActions: [...prev.undoActions, undoAction],
    }));

    // Auto-cleanup after expiry
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        undoActions: prev.undoActions.filter(a => a.id !== id),
      }));
    }, UNDO_EXPIRY_MS);

    return id;
  }, []);

  const removeUndoAction = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      undoActions: prev.undoActions.filter(a => a.id !== id),
    }));
  }, []);

  const addToast = useCallback((message: string, type: Toast['type'], undoAction?: UndoAction) => {
    const id = `toast-${++toastIdCounter}`;
    const toast: Toast = { id, message, type, undoAction };
    setState(prev => ({
      ...prev,
      toasts: [...prev.toasts, toast],
    }));

    // Auto-remove after 5 seconds (longer if has undo)
    const timeout = undoAction ? UNDO_EXPIRY_MS : 5000;
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        toasts: prev.toasts.filter(t => t.id !== id),
      }));
    }, timeout);

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      toasts: prev.toasts.filter(t => t.id !== id),
    }));
  }, []);

  const setFilters = useCallback((filters: Partial<Filters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters },
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setState(prev => ({ ...prev, filters: {} }));
  }, []);

  const toggleQueueExpanded = useCallback(() => {
    setState(prev => ({ ...prev, isQueueExpanded: !prev.isQueueExpanded }));
  }, []);

  return (
    <UIContext.Provider
      value={{
        ...state,
        setSelectedOpportunityId,
        addUndoAction,
        removeUndoAction,
        addToast,
        removeToast,
        setFilters,
        resetFilters,
        toggleQueueExpanded,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUIStore() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUIStore must be used within a UIProvider');
  }
  return context;
}
