/**
 * Error State — When API fails
 *
 * Per SPEC-007b: Error message with retry button
 */

'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const [retryCount, setRetryCount] = React.useState(0);

  const handleRetry = () => {
    setRetryCount((c) => c + 1);
    onRetry();
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-danger-muted">
        <AlertCircle className="h-8 w-8 text-danger" />
      </div>

      <h2 className="text-xl font-semibold text-primary">
        Something went wrong
      </h2>

      <p className="mt-2 max-w-sm text-secondary">
        Couldn&apos;t load opportunities.
      </p>

      <p className="mt-1 font-mono text-sm text-muted">{message}</p>

      <Button
        onClick={handleRetry}
        className="mt-6 bg-action text-primary hover:bg-action-hover"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Try Again
      </Button>

      {retryCount >= 3 && (
        <p className="mt-4 text-xs text-muted">
          Tried {retryCount}+ times? Check your network connection or contact
          support.
        </p>
      )}
    </div>
  );
}
