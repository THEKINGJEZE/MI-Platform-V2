// @ts-nocheck
"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle } from "lucide-react";
import type { Opportunity } from "@/lib/types/opportunity";

interface ResponseTimeMetricsProps {
  opportunities: Opportunity[];
  className?: string;
}

/**
 * Calculate response time metrics from opportunities
 */
function calculateMetrics(opportunities: Opportunity[]) {
  const now = new Date();
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  // Opportunities with response times (actioned)
  const withResponseTime = opportunities.filter(
    (o) => o.responseTimeHours !== undefined && o.responseTimeHours >= 0
  );

  // Opportunities awaiting action (created >48h ago, no outreach)
  const stale = opportunities.filter((o) => {
    if (o.outreachSentDate) return false; // Already actioned
    if (o.status === "won" || o.status === "lost" || o.status === "dormant") return false;
    const createdAt = new Date(o.createdAt);
    return createdAt < fortyEightHoursAgo;
  });

  // Calculate averages
  const avgResponseTime =
    withResponseTime.length > 0
      ? withResponseTime.reduce((sum, o) => sum + (o.responseTimeHours || 0), 0) /
        withResponseTime.length
      : null;

  // Find fastest and slowest
  const sortedTimes = withResponseTime
    .map((o) => o.responseTimeHours!)
    .sort((a, b) => a - b);
  const fastest = sortedTimes[0] ?? null;
  const slowest = sortedTimes[sortedTimes.length - 1] ?? null;

  return {
    avgResponseTime,
    staleCount: stale.length,
    fastest,
    slowest,
    totalActioned: withResponseTime.length,
  };
}

/**
 * Format hours as a human-readable string
 */
function formatHours(hours: number | null): string {
  if (hours === null) return "—";
  if (hours < 1) {
    const mins = Math.round(hours * 60);
    return `${mins}m`;
  }
  if (hours < 24) {
    return `${hours.toFixed(1)}h`;
  }
  const days = hours / 24;
  return `${days.toFixed(1)}d`;
}

/**
 * Determine status based on metrics
 * Green: Avg <4h, no stale
 * Amber: Avg 4-12h or 1-2 stale
 * Red: Avg >12h or 3+ stale
 */
function getStatus(avgHours: number | null, staleCount: number): "green" | "amber" | "red" | "neutral" {
  if (avgHours === null && staleCount === 0) return "neutral";

  // Red conditions
  if (staleCount >= 3) return "red";
  if (avgHours !== null && avgHours > 12) return "red";

  // Amber conditions
  if (staleCount >= 1) return "amber";
  if (avgHours !== null && avgHours > 4) return "amber";

  return "green";
}

/**
 * Map status to Badge variant
 */
function getStatusBadgeVariant(status: "green" | "amber" | "red" | "neutral"): "success" | "destructive" | "info" | "secondary" {
  switch (status) {
    case "green":
      return "success";
    case "amber":
      return "info";
    case "red":
      return "destructive";
    case "neutral":
    default:
      return "secondary";
  }
}

/**
 * Get status text for badge
 */
function getStatusText(status: "green" | "amber" | "red" | "neutral", avgHours: number | null): string {
  switch (status) {
    case "green":
      return "On Track";
    case "amber":
      return "Needs Attention";
    case "red":
      return "Action Required";
    case "neutral":
      return "No Data";
  }
}

/**
 * ResponseTimeMetrics - Shows response time tracking for opportunities
 *
 * Displays:
 * - Average response time for actioned opportunities
 * - Count of opportunities waiting >48h (stale)
 * - Fastest/slowest response times
 */
export function ResponseTimeMetrics({ opportunities, className }: ResponseTimeMetricsProps) {
  const metrics = useMemo(() => calculateMetrics(opportunities), [opportunities]);
  const status = getStatus(metrics.avgResponseTime, metrics.staleCount);
  const badgeVariant = getStatusBadgeVariant(status);
  const statusText = getStatusText(status, metrics.avgResponseTime);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs uppercase tracking-wider text-muted font-medium">
            Response Time
          </span>
          <Clock className="size-4 text-muted" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          {/* Average Response Time */}
          <div>
            <div className="text-2xl font-semibold font-mono tabular-nums text-primary">
              {formatHours(metrics.avgResponseTime)}
            </div>
            <div className="text-xs text-muted">Avg response</div>
          </div>

          {/* Stale Count */}
          <div>
            <div className={cn(
              "text-2xl font-semibold font-mono tabular-nums",
              metrics.staleCount > 0 ? "text-warning" : "text-primary"
            )}>
              {metrics.staleCount}
            </div>
            <div className="text-xs text-muted flex items-center gap-1">
              {metrics.staleCount > 0 && <AlertTriangle className="size-3" />}
              &gt;48h waiting
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={badgeVariant} showIcon={false}>
            {statusText}
          </Badge>
          {metrics.totalActioned > 0 && (
            <span className="text-xs text-muted">
              ({metrics.totalActioned} actioned)
            </span>
          )}
        </div>

        {/* Best/Worst line */}
        {metrics.fastest !== null && metrics.slowest !== null && (
          <div className="text-xs text-muted">
            Best: {formatHours(metrics.fastest)} &bull; Slowest: {formatHours(metrics.slowest)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loader for ResponseTimeMetrics
 */
export function ResponseTimeMetricsSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 animate-pulse">
        <div className="flex items-start justify-between mb-3">
          <div className="h-3 w-24 bg-surface-1 rounded" />
          <div className="h-4 w-4 bg-surface-1 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <div className="h-7 w-16 bg-surface-1 rounded mb-1" />
            <div className="h-3 w-20 bg-surface-1 rounded" />
          </div>
          <div>
            <div className="h-7 w-10 bg-surface-1 rounded mb-1" />
            <div className="h-3 w-16 bg-surface-1 rounded" />
          </div>
        </div>
        <div className="h-5 w-24 bg-surface-1 rounded-full" />
      </CardContent>
    </Card>
  );
}
