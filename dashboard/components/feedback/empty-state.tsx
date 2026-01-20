/**
 * Empty State — When queue is empty
 *
 * Per SPEC-007b: "All done!" message with pipeline link
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  onRefresh: () => void;
}

export function EmptyState({ onRefresh }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success-muted">
        <CheckCircle2 className="h-8 w-8 text-success" />
      </div>

      <h2 className="text-xl font-semibold text-primary">All done!</h2>

      <p className="mt-2 max-w-sm text-secondary">
        No opportunities ready to review. Check back later or view the Pipeline
        for in-progress items.
      </p>

      <div className="mt-6 flex gap-3">
        <Link href="/pipeline">
          <Button
            variant="outline"
            className="border-default bg-surface-1 text-secondary hover:bg-surface-2"
          >
            View Pipeline
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>

        <Button
          onClick={onRefresh}
          className="bg-action text-primary hover:bg-action-hover"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>
  );
}
