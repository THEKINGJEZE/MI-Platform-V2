/**
 * Toast System — Feedback with undo support
 *
 * Per SPEC-007b: Confirms action with undo option, 30s countdown bar
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useReviewStore, type Toast as ToastType } from '@/lib/stores/review-store';
import { X, Check, AlertCircle, Undo2 } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useReviewStore();

  return (
    <div className="fixed bottom-4 right-4 z-toast flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: ToastType;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps): React.ReactElement {
  const [progress, setProgress] = React.useState(100);
  const startTimeRef = React.useRef(Date.now());

  // Countdown animation for undo toasts
  React.useEffect(() => {
    if (toast.type !== 'undo') return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, 100 - (elapsed / toast.duration) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [toast.duration, toast.type]);

  const handleUndo = () => {
    if (toast.onUndo) {
      toast.onUndo();
    }
    onClose();
  };

  const Icon = {
    success: Check,
    error: AlertCircle,
    undo: Check,
  }[toast.type];

  const iconColor = {
    success: 'text-success',
    error: 'text-danger',
    undo: 'text-success',
  }[toast.type];

  return (
    <div
      className={cn(
        'relative min-w-[300px] overflow-hidden rounded-lg border border-default bg-surface-0 p-4 shadow-lg',
        'animate-in slide-in-from-right-full fade-in duration-200'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn('flex-shrink-0', iconColor)}>
          <Icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-primary">{toast.title}</p>
          {toast.description && (
            <p className="mt-1 text-sm text-muted">{toast.description}</p>
          )}

          {/* Undo Button */}
          {toast.type === 'undo' && toast.onUndo && (
            <button
              onClick={handleUndo}
              className="mt-2 flex items-center gap-1 text-sm font-medium text-action hover:underline"
            >
              <Undo2 className="h-3 w-3" />
              Undo
              <kbd className="ml-1 rounded bg-surface-1 px-1 text-xs text-muted">
                Z
              </kbd>
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 text-muted hover:text-secondary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress Bar for Undo */}
      {toast.type === 'undo' && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-1">
          <div
            className="h-full bg-action transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
