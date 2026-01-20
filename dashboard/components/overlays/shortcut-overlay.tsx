// @ts-nocheck
"use client";

import { cn } from "@/lib/utils";
import { X, Command } from "lucide-react";

interface ShortcutOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutGroup {
  title: string;
  shortcuts: { key: string; description: string }[];
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: "Navigation",
    shortcuts: [
      { key: "J / K", description: "Next / Previous lead" },
      { key: "Enter", description: "Select lead / Expand" },
      { key: "Escape", description: "Close panel / Cancel" },
    ],
  },
  {
    title: "Actions",
    shortcuts: [
      { key: "E", description: "Send Email (with 30s Undo)" },
      { key: "S", description: "Skip lead (shows reason picker)" },
      { key: "D", description: "Dismiss lead" },
      { key: "C", description: "Log Call" },
      { key: "L", description: "Open LinkedIn" },
      { key: "F", description: "Find Better Contact" },
      { key: "P", description: "Pin / Unpin lead" },
    ],
  },
  {
    title: "Queue",
    shortcuts: [
      { key: "1", description: "Priority queue" },
      { key: "2", description: "Recent queue" },
      { key: "3", description: "Today's 3 queue" },
      { key: "0", description: "All leads" },
    ],
  },
  {
    title: "Global",
    shortcuts: [
      { key: "⌘K", description: "Command Palette" },
      { key: "⌘K → N", description: "Quick Capture" },
      { key: "⌘Z", description: "Undo (if pending action)" },
      { key: "?", description: "Show this overlay" },
    ],
  },
  {
    title: "Composer",
    shortcuts: [
      { key: "⌘Enter", description: "Send message" },
    ],
  },
];

/**
 * Shortcut Overlay
 *
 * Shows all available keyboard shortcuts.
 * Triggered by pressing ?
 */
export function ShortcutOverlay({ isOpen, onClose }: ShortcutOverlayProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-canvas/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-[10%] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-surface-0 border border-surface-1 rounded-xl shadow-2xl z-50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-action/10 rounded-lg">
              <Command className="size-5 text-action" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-primary">
                Keyboard Shortcuts
              </h2>
              <p className="text-sm text-muted">
                Navigate faster with these shortcuts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted hover:text-secondary hover:bg-surface-1 rounded-lg transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-6">
            {shortcutGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
                  {group.title}
                </h3>
                <ul className="space-y-2">
                  {group.shortcuts.map((shortcut) => (
                    <li
                      key={shortcut.key}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-secondary">
                        {shortcut.description}
                      </span>
                      <kbd
                        className={cn(
                          "px-2 py-1 bg-surface-1 border border-surface-2 rounded text-xs font-mono text-primary",
                          "min-w-[2rem] text-center"
                        )}
                      >
                        {shortcut.key}
                      </kbd>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-surface-1/30 border-t border-surface-1 text-center">
          <p className="text-xs text-muted">
            Press <kbd className="px-1 py-0.5 bg-surface-1 rounded">Escape</kbd>{" "}
            or <kbd className="px-1 py-0.5 bg-surface-1 rounded">?</kbd> to
            close
          </p>
        </div>
      </div>
    </>
  );
}
