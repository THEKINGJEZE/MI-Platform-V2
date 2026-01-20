// @ts-nocheck
"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, AdmiraltyBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BoardSignal, SignalSeverity } from "@/lib/types/board";

interface SignalCardProps {
  signal: BoardSignal;
  featured?: boolean;
  className?: string;
}

/**
 * Map signal severity to Badge variant
 */
function getSeverityBadgeVariant(severity: SignalSeverity): "surge" | "followup" | "spike" {
  switch (severity) {
    case "critical":
      return "surge"; // Red with flame icon
    case "warning":
      return "followup"; // Amber with clock icon
    case "info":
    default:
      return "spike"; // Green with trending up icon
  }
}

/**
 * Get a sensible Admiralty code based on source reliability
 * In production this would come from the signal data
 */
function getAdmiraltyCode(signal: BoardSignal): string {
  // For now, derive from source or default to B2
  if (signal.source?.toLowerCase().includes("hubspot")) return "A1";
  if (signal.source?.toLowerCase().includes("airtable")) return "A1";
  if (signal.source?.toLowerCase().includes("job")) return "B2";
  if (signal.source?.toLowerCase().includes("linkedin")) return "B2";
  if (signal.source?.toLowerCase().includes("web")) return "C3";
  return "B2";
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays}d ago`;
  }
  if (diffHours > 0) {
    return `${diffHours}h ago`;
  }
  return "Just now";
}

/**
 * Format signal type for display
 */
function formatSignalType(type: string): string {
  return type
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function SignalCard({ signal, featured = false, className }: SignalCardProps) {
  const badgeVariant = getSeverityBadgeVariant(signal.severity);
  const admiraltyCode = getAdmiraltyCode(signal);

  return (
    <Card
      className={cn(
        featured && signal.severity === "critical" && "border-danger/30",
        featured && signal.severity === "warning" && "border-warning/30",
        className
      )}
    >
      <CardContent className="p-4">
        {/* Header: Signal type badge + Time */}
        <div className="flex items-center justify-between mb-2">
          <Badge variant={badgeVariant}>
            {formatSignalType(signal.type)}
          </Badge>
          <span className="text-xs text-muted">{formatTimeAgo(signal.timestamp)}</span>
        </div>

        {/* Headline */}
        <div className="font-semibold text-primary mb-1">{signal.headline}</div>

        {/* Detail */}
        <div className="text-sm text-secondary mb-3">{signal.detail}</div>

        {/* Source with Admiralty code */}
        <div className="flex items-center gap-2 mb-2">
          {signal.source && (
            <>
              <span className="text-xs text-muted">Source:</span>
              <span className="text-sm text-secondary">{signal.source}</span>
            </>
          )}
          <AdmiraltyBadge code={admiraltyCode} />
        </div>

        {/* Action link */}
        <Button variant="link" className="p-0 h-auto text-action hover:text-action/80">
          → {signal.action}
        </Button>
      </CardContent>
    </Card>
  );
}

interface SignalFeedProps {
  signals: BoardSignal[];
  maxItems?: number;
  className?: string;
}

export function SignalFeed({ signals, maxItems = 5, className }: SignalFeedProps) {
  const displayedSignals = signals.slice(0, maxItems);

  if (displayedSignals.length === 0) {
    return (
      <Card className={cn(className)}>
        <CardContent className="p-4">
          <div className="text-sm text-muted text-center py-4">
            No signals this week
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {displayedSignals.map((signal) => (
        <SignalCard key={signal.id} signal={signal} />
      ))}
    </div>
  );
}

/**
 * Featured signal with prominent styling
 */
interface TopSignalProps {
  signal: BoardSignal | undefined;
  className?: string;
}

export function TopSignal({ signal, className }: TopSignalProps) {
  if (!signal) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="text-sm text-muted text-center">
            No critical signals this week
          </div>
        </CardContent>
      </Card>
    );
  }

  return <SignalCard signal={signal} featured className={className} />;
}

/**
 * Skeleton loader for signal feed
 */
export function SignalFeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 animate-pulse">
            <div className="flex items-center justify-between mb-2">
              <div className="h-5 w-24 bg-surface-1 rounded-full" />
              <div className="h-3 w-12 bg-surface-1 rounded" />
            </div>
            <div className="h-5 w-48 bg-surface-1 rounded mb-1" />
            <div className="h-4 w-full bg-surface-1 rounded mb-3" />
            <div className="flex items-center gap-2 mb-2">
              <div className="h-3 w-12 bg-surface-1 rounded" />
              <div className="h-3 w-20 bg-surface-1 rounded" />
              <div className="h-5 w-8 bg-surface-1 rounded-full" />
            </div>
            <div className="h-4 w-32 bg-surface-1 rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
