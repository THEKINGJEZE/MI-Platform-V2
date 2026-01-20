"use client";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface CardSkeletonProps {
  className?: string;
}

/**
 * Card Skeleton Component
 *
 * From spec: "Loading State"
 * - Skeleton matching exact component shape
 * - Subtle shimmer animation (not spinner)
 * - Maintain layout to prevent jank
 */
export function CardSkeleton({ className }: CardSkeletonProps) {
  return (
    <div className={cn("bg-surface-0 rounded-lg p-4 space-y-3", className)}>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Lead Card Skeleton - More detailed for lead cards
 */
export function LeadCardSkeleton({ className }: CardSkeletonProps) {
  return (
    <div className={cn("bg-surface-0 rounded-lg p-4 space-y-4", className)}>
      {/* Header: Org name + badges */}
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-10 w-16 rounded-lg" />
      </div>

      {/* Signal badges */}
      <div className="flex gap-2">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* Score breakdown placeholder */}
      <div className="space-y-2">
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-2 w-4/5 rounded-full" />
        <Skeleton className="h-2 w-3/5 rounded-full" />
      </div>

      {/* Contact info */}
      <div className="flex items-center gap-3 pt-2 border-t border-surface-1">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-2 w-24" />
        </div>
      </div>
    </div>
  );
}

/**
 * Table Row Skeleton
 */
export function TableRowSkeleton({ className }: CardSkeletonProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 py-3 px-4 border-b border-surface-1",
        className
      )}
    >
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-16 ml-auto" />
    </div>
  );
}

/**
 * Full Page Skeleton - Multiple card skeletons
 */
export function PageSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <LeadCardSkeleton key={i} />
      ))}
    </div>
  );
}
