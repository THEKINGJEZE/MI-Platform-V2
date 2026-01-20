"use client";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Page-Level Skeletons
 *
 * From spec: "Loading State"
 * - Skeleton matching exact component shape
 * - Subtle shimmer animation (not spinner)
 * - Maintain layout to prevent jank
 * - Progressive enhancement (show what's ready)
 */

interface SkeletonProps {
  className?: string;
}

/**
 * Focus Mode Page Skeleton
 * Matches the three-zone layout: Queue | Now Card | Action Panel
 */
export function FocusPageSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("flex h-full", className)} aria-busy="true" aria-label="Loading focus mode">
      {/* Session Header Skeleton */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-surface-0 border-b border-surface-1 flex items-center px-4 gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-2 w-32 rounded-full" />
        <Skeleton className="h-4 w-16 ml-auto" />
      </div>

      {/* Left Zone: Queue */}
      <div className="w-[280px] border-r border-surface-1 p-4 space-y-3 mt-12">
        {/* Queue tabs */}
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
        {/* Lead items */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-3 rounded-lg bg-surface-0 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-10 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Centre Zone: Now Card */}
      <div className="flex-1 p-6 mt-12">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-14 w-20 rounded-lg" />
          </div>

          {/* Force context */}
          <div className="flex gap-3">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          {/* Context Capsule */}
          <div className="bg-surface-0 rounded-lg p-4 space-y-4">
            {["Why", "Next", "When", "Source"].map((label) => (
              <div key={label} className="flex gap-3">
                <Skeleton className="h-5 w-5 rounded" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>

          {/* Score breakdown */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-full rounded-full" />
              <Skeleton className="h-3 w-4/5 rounded-full" />
              <Skeleton className="h-3 w-3/5 rounded-full" />
            </div>
          </div>

          {/* Contact card */}
          <div className="flex items-center gap-4 p-4 bg-surface-0 rounded-lg">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Zone: Action Panel */}
      <div className="w-[320px] border-l border-surface-1 p-4 space-y-4 mt-12">
        <Skeleton className="h-5 w-24" />
        {/* Subject */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
        {/* Message */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-32 w-full rounded-md" />
        </div>
        {/* Talking points */}
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        {/* Actions */}
        <div className="space-y-2 pt-4">
          <Skeleton className="h-10 w-full rounded-md" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * List View Page Skeleton
 * Matches the table layout with queue tabs
 */
export function LeadsPageSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("p-6 space-y-4", className)} aria-busy="true" aria-label="Loading leads">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-64 rounded-md" />
      </div>

      {/* Queue tabs */}
      <div className="flex gap-2 border-b border-surface-1 pb-2">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>

      {/* Table header */}
      <div className="flex gap-4 py-3 px-4 border-b border-surface-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16 ml-auto" />
      </div>

      {/* Table rows */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 py-3 px-4 border-b border-surface-1"
        >
          <div className="w-32 space-y-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-16" />
          <div className="flex gap-1">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-2 ml-auto">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      ))}

      {/* Pagination */}
      <div className="flex justify-center gap-2 pt-4">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  );
}

/**
 * Morning Brief Page Skeleton
 * Matches the 4-step flow
 */
export function MorningBriefSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("max-w-2xl mx-auto p-6 space-y-6", className)} aria-busy="true" aria-label="Loading morning brief">
      {/* Header */}
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4].map((step) => (
          <Skeleton key={step} className="h-2 w-16 rounded-full" />
        ))}
      </div>

      {/* Step content card */}
      <div className="bg-surface-0 rounded-xl p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Energy check buttons */}
        <div className="flex gap-4 justify-center">
          <Skeleton className="h-20 w-28 rounded-lg" />
          <Skeleton className="h-20 w-28 rounded-lg" />
          <Skeleton className="h-20 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * End of Day Page Skeleton
 * Matches the 3-section ritual
 */
export function EndOfDaySkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("max-w-2xl mx-auto p-6 space-y-6", className)} aria-busy="true" aria-label="Loading end of day">
      {/* Header */}
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-40 mx-auto" />
        <Skeleton className="h-4 w-56 mx-auto" />
      </div>

      {/* Tab navigation */}
      <div className="flex justify-center gap-2">
        <Skeleton className="h-10 w-28 rounded-md" />
        <Skeleton className="h-10 w-28 rounded-md" />
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>

      {/* Content card */}
      <div className="bg-surface-0 rounded-xl p-6 space-y-6">
        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((stat) => (
            <div key={stat} className="text-center space-y-2">
              <Skeleton className="h-10 w-10 mx-auto rounded-lg" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
          ))}
        </div>

        {/* Actioned leads list */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center gap-3 p-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-5 w-16 rounded-full ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Settings Page Skeleton
 */
export function SettingsPageSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("max-w-2xl mx-auto p-6 space-y-6", className)} aria-busy="true" aria-label="Loading settings">
      <Skeleton className="h-8 w-32" />

      {/* Settings sections */}
      {[1, 2, 3].map((section) => (
        <div key={section} className="bg-surface-0 rounded-lg p-4 space-y-4">
          <Skeleton className="h-5 w-40" />
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
