"use client";

import { AlertTriangle, RefreshCw, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  /** Error message to display */
  message?: string;
  /** Detailed error information (optional) */
  details?: string;
  /** Retry callback */
  onRetry?: () => void;
  /** Number of retries attempted */
  retryCount?: number;
  /** Support URL (shown after 3+ retries) */
  supportUrl?: string;
  className?: string;
}

/**
 * Error State Component
 *
 * From spec: "Component States - Error State"
 * - Error icon (⚠️) with muted colour — NOT bright red
 * - Brief human-readable explanation
 * - Retry action button
 * - Link to support if persistent (3+ retries)
 */
export function ErrorState({
  message = "Something went wrong",
  details,
  onRetry,
  retryCount = 0,
  supportUrl = "mailto:support@peelsolutions.co.uk",
  className,
}: ErrorStateProps) {
  const showSupportLink = retryCount >= 3;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
    >
      {/* Icon Container - using danger/10 not bright red */}
      <div className="rounded-full bg-danger-muted p-4 mb-4">
        <AlertTriangle className="h-8 w-8 text-danger" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-medium text-primary mb-1">Error</h3>

      {/* Message */}
      <p className="text-sm text-muted max-w-sm mb-2">{message}</p>

      {/* Details (if provided) */}
      {details && (
        <p className="text-xs text-muted/70 font-mono max-w-md mb-4 bg-surface-1 rounded px-3 py-2">
          {details}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col items-center gap-2 mt-2">
        {onRetry && (
          <Button
            variant="secondary"
            onClick={onRetry}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}

        {/* Support link after 3+ retries */}
        {showSupportLink && (
          <a
            href={supportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-action hover:underline mt-2"
          >
            Contact Support
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}
