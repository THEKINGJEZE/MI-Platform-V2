// @ts-nocheck
"use client";

import { cn } from "@/lib/utils";
import { Badge, PriorityBadge } from "@/components/ui/badge";
import { TrendingUp, Clock } from "lucide-react";
import type { PriorityTier } from "@/lib/types/opportunity";

interface OpportunityContextProps {
  priorityTier: PriorityTier;
  signalCount: number;
  signalTypes?: string[];
  className?: string;
}

/**
 * Opportunity Context Component - V2 Simplified
 *
 * Displays opportunity-specific context badges:
 * - Priority tier (hot/high/medium/low)
 * - Signal count
 * - Signal types
 */
export function OpportunityContext({
  priorityTier,
  signalCount,
  signalTypes,
  className,
}: OpportunityContextProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 py-3 px-4 rounded-lg bg-surface-1/50",
        className
      )}
    >
      {/* Priority */}
      <PriorityBadge priority={priorityTier} />

      {/* Signal Count */}
      <div className="flex items-center gap-1 text-sm">
        <TrendingUp className="h-3.5 w-3.5 text-muted" />
        <span className="text-secondary">{signalCount}</span>
        <span className="text-muted">{signalCount === 1 ? "signal" : "signals"}</span>
      </div>

      {/* Signal Types */}
      {signalTypes && signalTypes.length > 0 && (
        <>
          <div className="w-px h-4 bg-surface-2 mx-1" />
          <div className="flex flex-wrap gap-1">
            {signalTypes.slice(0, 3).map((type, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {type}
              </Badge>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Compact version for queue list items
 */
export function OpportunityContextCompact({
  priorityTier,
  signalCount,
  className,
}: Pick<OpportunityContextProps, "priorityTier" | "signalCount" | "className">) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <PriorityBadge priority={priorityTier} />
      <span className="text-xs text-muted">{signalCount} signals</span>
    </div>
  );
}

/**
 * Signal Summary - Shows signal activity for opportunity
 */
export function SignalSummary({
  signalCount,
  lastSignalDate,
  primarySignalName,
  className,
}: {
  signalCount: number;
  lastSignalDate?: string;
  primarySignalName?: string;
  className?: string;
}) {
  const daysSince = lastSignalDate
    ? Math.floor(
        (Date.now() - new Date(lastSignalDate).getTime()) / (1000 * 60 * 60 * 24)
      )
    : undefined;

  const recencyLabel =
    daysSince === undefined
      ? "No date"
      : daysSince === 0
      ? "Today"
      : daysSince === 1
      ? "Yesterday"
      : daysSince < 7
      ? `${daysSince} days ago`
      : daysSince < 30
      ? `${Math.floor(daysSince / 7)} ${Math.floor(daysSince / 7) === 1 ? 'week' : 'weeks'} ago`
      : `${Math.floor(daysSince / 30)} ${Math.floor(daysSince / 30) === 1 ? 'month' : 'months'} ago`;

  const recencyColor =
    daysSince === undefined
      ? "text-muted"
      : daysSince <= 2
      ? "text-success"
      : daysSince <= 7
      ? "text-warning"
      : "text-muted";

  return (
    <div className={cn("flex items-center gap-3 text-sm", className)}>
      <div className="flex items-center gap-1.5">
        <TrendingUp className="h-3.5 w-3.5 text-muted" />
        {primarySignalName ? (
          <>
            <span className="font-medium text-primary truncate max-w-[200px]" title={primarySignalName}>
              {primarySignalName}
            </span>
            {signalCount > 1 && (
              <span className="text-muted">+{signalCount - 1}</span>
            )}
          </>
        ) : (
          <>
            <span className="font-medium text-primary">{signalCount}</span>
            <span className="text-muted">{signalCount === 1 ? 'signal' : 'signals'}</span>
          </>
        )}
      </div>
      <div className="w-px h-3 bg-surface-2" />
      <div className="flex items-center gap-1.5">
        <Clock className={cn("h-3.5 w-3.5", recencyColor)} />
        <span className={recencyColor}>Last: {recencyLabel}</span>
      </div>
    </div>
  );
}
