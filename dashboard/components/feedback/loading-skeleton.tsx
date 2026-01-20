/**
 * Loading Skeleton — Three-Zone layout with shimmer
 *
 * Per SPEC-007b: Maintains layout stability during loading
 */

'use client';

import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function LoadingSkeleton() {
  return (
    <div className="flex h-full">
      {/* Queue Zone Skeleton */}
      <div
        className="flex-shrink-0 border-r border-default bg-surface-0 p-3"
        style={{ width: 'var(--queue-width, 280px)' }}
      >
        {/* Filter Tabs */}
        <div className="mb-4 flex gap-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
        </div>

        {/* Queue Items */}
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="rounded-md border border-default bg-surface-1 p-3"
            >
              <Skeleton className="mb-2 h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="mt-2 flex gap-2">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Now Zone Skeleton */}
      <div
        className="flex-1 bg-canvas p-6"
        style={{ minWidth: 'var(--now-card-min, 400px)' }}
      >
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="mt-2 h-4 w-32" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>

          {/* Why Now Card */}
          <div className="rounded-lg border border-default bg-surface-0 p-6">
            <Skeleton className="mb-3 h-4 w-24" />
            <Skeleton className="h-16 w-full" />
          </div>

          {/* Signals Card */}
          <div className="rounded-lg border border-default bg-surface-0 p-6">
            <Skeleton className="mb-3 h-4 w-20" />
            <Skeleton className="h-10 w-16" />
          </div>

          {/* Contact Card */}
          <div className="rounded-lg border border-default bg-surface-0 p-6">
            <Skeleton className="mb-3 h-4 w-20" />
            <Skeleton className="mb-2 h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>

      {/* Composer Zone Skeleton */}
      <div
        className="flex-shrink-0 border-l border-default bg-surface-0 p-4"
        style={{ width: 'var(--composer-width, 320px)' }}
      >
        {/* Subject */}
        <Skeleton className="mb-1 h-3 w-16" />
        <Skeleton className="mb-4 h-10 w-full" />

        {/* Body */}
        <Skeleton className="mb-1 h-3 w-16" />
        <Skeleton className="mb-4 h-48 w-full" />

        {/* Actions */}
        <Skeleton className="mb-3 h-12 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>
    </div>
  );
}
