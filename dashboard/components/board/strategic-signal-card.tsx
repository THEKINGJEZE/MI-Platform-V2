// @ts-nocheck
"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, AdmiraltyBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StrategicSignal, SignalSeverity } from "@/lib/types/board";

interface StrategicSignalCardProps {
  signal: StrategicSignal;
  className?: string;
}

/**
 * Map signal severity to Badge variant
 */
function getSeverityBadgeVariant(severity: SignalSeverity): "surge" | "followup" | "spike" {
  switch (severity) {
    case "critical":
      return "surge";
    case "warning":
      return "followup";
    case "info":
    default:
      return "spike";
  }
}

/**
 * Get Admiralty code based on source
 */
function getAdmiraltyCode(source: string): string {
  if (source?.toLowerCase().includes("job")) return "B2";
  if (source?.toLowerCase().includes("hubspot")) return "A1";
  if (source?.toLowerCase().includes("airtable")) return "A1";
  if (source?.toLowerCase().includes("linkedin")) return "B2";
  if (source?.toLowerCase().includes("web")) return "C3";
  return "B2";
}

/**
 * Format date for display
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function StrategicSignalCard({ signal, className }: StrategicSignalCardProps) {
  const badgeVariant = getSeverityBadgeVariant(signal.severity);
  const admiraltyCode = getAdmiraltyCode(signal.source);

  return (
    <Card
      className={cn(
        signal.severity === "critical" && "border-danger/30",
        signal.severity === "warning" && "border-warning/30",
        className
      )}
    >
      <CardContent className="p-4">
        {/* Header: Signal type badge + Date */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant={badgeVariant}>
              {signal.signalType}
            </Badge>
            {signal.leadCreated && (
              <Badge variant="outline" className="text-xs">
                Lead Created
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted">{formatDate(signal.signalDate)}</span>
        </div>

        {/* Organisation + Region */}
        <div className="font-semibold text-primary mb-1">
          {signal.organisationName}
          {signal.region && (
            <span className="text-muted font-normal text-sm ml-2">({signal.region})</span>
          )}
        </div>

        {/* Signal details */}
        {signal.details && (
          <div className="text-sm text-secondary mb-3">{signal.details}</div>
        )}

        {/* Points + Source with Admiralty code */}
        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted">Points:</span>
            <span className={cn(
              "text-sm font-medium",
              signal.points >= 30 && "text-danger",
              signal.points >= 15 && signal.points < 30 && "text-warning",
              signal.points < 15 && "text-success"
            )}>
              {signal.points}
            </span>
          </div>
          {signal.source && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted">Source:</span>
              <span className="text-sm text-secondary">{signal.source}</span>
            </div>
          )}
          <AdmiraltyBadge code={admiraltyCode} />
        </div>

        {/* Action link */}
        <Button variant="link" className="p-0 h-auto text-action hover:text-action/80">
          → {signal.recommendedAction}
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loader for strategic signal card
 */
export function StrategicSignalCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 animate-pulse">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="h-5 w-24 bg-surface-1 rounded-full" />
            <div className="h-5 w-20 bg-surface-1 rounded-full" />
          </div>
          <div className="h-3 w-16 bg-surface-1 rounded" />
        </div>
        <div className="h-5 w-48 bg-surface-1 rounded mb-1" />
        <div className="h-4 w-full bg-surface-1 rounded mb-3" />
        <div className="flex items-center gap-4 mb-2">
          <div className="h-4 w-16 bg-surface-1 rounded" />
          <div className="h-4 w-24 bg-surface-1 rounded" />
          <div className="h-5 w-8 bg-surface-1 rounded-full" />
        </div>
        <div className="h-4 w-48 bg-surface-1 rounded" />
      </CardContent>
    </Card>
  );
}
