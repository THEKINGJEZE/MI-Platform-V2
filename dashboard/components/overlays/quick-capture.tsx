// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import { useCapturesStore, useUIStore } from "@/lib/stores";
import { cn } from "@/lib/utils";
import { PenLine, X } from "lucide-react";

interface QuickCaptureProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Quick Capture Modal
 *
 * Minimal modal for capturing thoughts quickly.
 * Triggered via ⌘K → n
 * - Single-line input
 * - Enter to save
 * - Escape to cancel
 * - Zero context switch
 */
export function QuickCapture({ isOpen, onClose }: QuickCaptureProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { addCapture } = useCapturesStore();
  const { addToast } = useUIStore();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setValue("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!value.trim()) {
      onClose();
      return;
    }

    addCapture(value);

    addToast({
      type: "success",
      title: "Captured ✓",
      description: "Thought saved for tomorrow's Morning Brief",
      duration: 3000,
    });

    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-canvas/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-[30%] left-1/2 -translate-x-1/2 w-full max-w-md bg-surface-0 border border-surface-1 rounded-xl shadow-2xl z-50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-action/10 rounded-md">
              <PenLine className="size-4 text-action" />
            </div>
            <span className="text-sm font-medium text-primary">
              Quick Capture
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted hover:text-secondary transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Input */}
        <div className="p-4">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind?"
            className={cn(
              "w-full px-3 py-2 bg-surface-1 border border-surface-2 rounded-lg",
              "text-primary placeholder:text-muted",
              "focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent",
              "text-sm"
            )}
          />
          <p className="text-xs text-muted mt-2">
            Press <kbd className="px-1 py-0.5 bg-surface-1 rounded">Enter</kbd>{" "}
            to save,{" "}
            <kbd className="px-1 py-0.5 bg-surface-1 rounded">Escape</kbd> to
            cancel
          </p>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-surface-1/30 border-t border-surface-1">
          <p className="text-xs text-muted">
            Saved thoughts appear in your Morning Brief
          </p>
        </div>
      </div>
    </>
  );
}
