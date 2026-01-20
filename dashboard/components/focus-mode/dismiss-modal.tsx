// @ts-nocheck
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X, AlertTriangle } from "lucide-react";

interface DismissModalProps {
  open: boolean;
  onClose: () => void;
  onDismiss: (reason: string) => void;
  isLoading?: boolean;
}

const DISMISS_REASONS = [
  { value: "Not police sector", label: "Not police sector", propagates: true },
  { value: "Wrong force", label: "Wrong force", propagates: false },
  { value: "Not our service area", label: "Not our service area", propagates: false },
  { value: "Already contacted", label: "Already contacted", propagates: false },
  { value: "Duplicate", label: "Duplicate", propagates: false },
  { value: "Other", label: "Other", propagates: false },
];

/**
 * DismissModal - Quick dropdown for dismissing opportunities
 *
 * Part of B-083a Intelligence Review Agent feedback loop.
 * When "Not police sector" is selected, feedback propagates to source jobs.
 */
export function DismissModal({
  open,
  onClose,
  onDismiss,
  isLoading,
}: DismissModalProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  if (!open) return null;

  const handleDismiss = () => {
    if (selectedReason) {
      onDismiss(selectedReason);
      setSelectedReason(null);
    }
  };

  const handleClose = () => {
    setSelectedReason(null);
    onClose();
  };

  const selectedReasonConfig = DISMISS_REASONS.find(r => r.value === selectedReason);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
        <div className="bg-surface-0 rounded-lg border border-surface-1 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-surface-1">
            <h2 className="text-lg font-semibold text-primary">Dismiss Opportunity</h2>
            <Button variant="ghost" size="icon-sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4">
            <p className="text-sm text-secondary">
              Why are you dismissing this opportunity?
            </p>

            {/* Reason options */}
            <div className="space-y-2">
              {DISMISS_REASONS.map((reason) => (
                <button
                  key={reason.value}
                  onClick={() => setSelectedReason(reason.value)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg border transition-colors",
                    selectedReason === reason.value
                      ? "border-action bg-action/10 text-primary"
                      : "border-surface-1 bg-surface-1/50 text-secondary hover:bg-surface-1 hover:text-primary"
                  )}
                >
                  <span className="text-sm">{reason.label}</span>
                  {reason.propagates && (
                    <span className="ml-2 text-xs text-warning">
                      (trains AI filter)
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Warning for feedback propagation */}
            {selectedReasonConfig?.propagates && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <p className="text-xs text-secondary">
                  This will mark the source job(s) with feedback, helping the AI
                  filter similar jobs in the future.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 p-4 border-t border-surface-1">
            <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDismiss}
              disabled={!selectedReason || isLoading}
            >
              {isLoading ? "Dismissing..." : "Dismiss"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
