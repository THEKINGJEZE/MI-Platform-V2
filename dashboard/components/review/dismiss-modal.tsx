/**
 * Dismiss Modal — Structured dismiss with feedback
 *
 * Per SPEC-007b: Reason selection, updates status, advances to next
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  useReviewStore,
  useCurrentOpportunity,
} from '@/lib/stores/review-store';
import { X, AlertTriangle } from 'lucide-react';

interface DismissReason {
  value: string;
  label: string;
  warning?: boolean;
}

const DISMISS_REASONS: DismissReason[] = [
  { value: 'not_police_sector', label: 'Not police sector', warning: true },
  { value: 'wrong_force', label: 'Wrong force' },
  { value: 'not_our_service_area', label: 'Not our service area' },
  { value: 'already_contacted', label: 'Already contacted' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'other', label: 'Other' },
];

export function DismissModal() {
  const { isDismissModalOpen, closeDismissModal, markAsDismissed, addToast } =
    useReviewStore();
  const opportunity = useCurrentOpportunity();
  const [selectedReason, setSelectedReason] = React.useState<string | null>(
    null
  );

  // Reset selection when modal opens
  React.useEffect(() => {
    if (isDismissModalOpen) {
      setSelectedReason(null);
    }
  }, [isDismissModalOpen]);

  if (!isDismissModalOpen || !opportunity) {
    return null;
  }

  const selectedReasonData = DISMISS_REASONS.find(
    (r) => r.value === selectedReason
  );

  const handleConfirm = () => {
    if (!selectedReason) return;

    markAsDismissed(opportunity.id, selectedReason);

    addToast({
      type: 'undo',
      title: `Dismissed: ${opportunity.force?.name || opportunity.name}`,
      description: `Reason: ${selectedReasonData?.label}. Press Z to undo`,
      duration: 30000,
      onUndo: () => {
        useReviewStore.getState().undo();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-canvas/80 backdrop-blur-sm"
        onClick={closeDismissModal}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-lg border border-default bg-surface-0 p-6 shadow-lg">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-primary">
              Dismiss Opportunity
            </h2>
            <p className="mt-1 text-sm text-muted">
              {opportunity.force?.name || opportunity.name}
            </p>
          </div>
          <button
            onClick={closeDismissModal}
            className="text-muted hover:text-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Reason Selection */}
        <div className="mb-6 space-y-2">
          <p className="mb-3 text-sm font-medium text-secondary">
            Select a reason:
          </p>
          {DISMISS_REASONS.map((reason) => (
            <button
              key={reason.value}
              onClick={() => setSelectedReason(reason.value)}
              className={cn(
                'w-full rounded-md border px-4 py-3 text-left transition-colors',
                selectedReason === reason.value
                  ? 'border-action bg-action/10 text-primary'
                  : 'border-default bg-surface-1 text-secondary hover:bg-surface-2'
              )}
            >
              {reason.label}
            </button>
          ))}
        </div>

        {/* Warning for "Not police sector" */}
        {selectedReasonData?.warning && (
          <div className="mb-6 flex items-start gap-3 rounded-md border border-warning/30 bg-warning-muted p-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-warning" />
            <div className="text-sm">
              <p className="font-medium text-warning">Classification feedback</p>
              <p className="mt-1 text-secondary">
                This will be sent as feedback to improve AI classification
                accuracy.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-default bg-surface-1"
            onClick={closeDismissModal}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-danger text-primary hover:bg-danger/90"
            onClick={handleConfirm}
            disabled={!selectedReason}
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}
