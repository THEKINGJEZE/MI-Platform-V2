/**
 * Shortcut Overlay — Shows keyboard shortcuts
 *
 * Per SPEC-007b: Shows when user presses ?
 */

'use client';

import * as React from 'react';
import { useReviewStore } from '@/lib/stores/review-store';
import { X, Keyboard } from 'lucide-react';

const SHORTCUTS = [
  { key: 'J', description: 'Next opportunity' },
  { key: 'K', description: 'Previous opportunity' },
  { key: 'E', description: 'Send email' },
  { key: 'S', description: 'Skip' },
  { key: 'D', description: 'Dismiss' },
  { key: 'Z', description: 'Undo (within 30s)' },
  { key: '?', description: 'Show this help' },
  { key: 'Esc', description: 'Close modal/overlay' },
] as const;

export function ShortcutOverlay() {
  const { isShortcutOverlayOpen, toggleShortcutOverlay } = useReviewStore();

  // Close on Escape
  React.useEffect(() => {
    if (!isShortcutOverlayOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === '?') {
        toggleShortcutOverlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isShortcutOverlayOpen, toggleShortcutOverlay]);

  if (!isShortcutOverlayOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-overlay flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-canvas/80 backdrop-blur-sm"
        onClick={toggleShortcutOverlay}
      />

      {/* Content */}
      <div className="relative w-full max-w-sm rounded-lg border border-default bg-surface-0 p-6 shadow-lg">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-action" />
            <h2 className="text-lg font-semibold text-primary">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={toggleShortcutOverlay}
            className="text-muted hover:text-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-3">
          {SHORTCUTS.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex items-center justify-between"
            >
              <span className="text-secondary">{shortcut.description}</span>
              <kbd className="rounded bg-surface-1 px-2 py-1 font-mono text-sm text-primary">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer Hint */}
        <p className="mt-6 text-center text-xs text-muted">
          Press <kbd className="rounded bg-surface-1 px-1">?</kbd> or{' '}
          <kbd className="rounded bg-surface-1 px-1">Esc</kbd> to close
        </p>
      </div>
    </div>
  );
}
