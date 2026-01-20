// @ts-nocheck
"use client";

import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/stores/session-store";
import { RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SessionHeaderProps {
  processed: number;
  total: number;
  percentage: number;
  averageTime: number;
  allTimeProcessed: number;
  onQuickCapture?: () => void;
  onRefresh?: () => void;
  className?: string;
}

/**
 * Session Analytics Header
 *
 * Displays:
 * - Today's progress: "Today: 3 of 12"
 * - Progress bar
 * - Percentage
 * - Average time per lead
 *
 * Format: "Today: 3 of 12 ████░░░░░░ 25% • Avg: 1:42"
 */
export function SessionHeader({
  processed,
  total,
  percentage,
  averageTime,
  allTimeProcessed,
  onQuickCapture,
  onRefresh,
  className,
}: SessionHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-4 py-2 bg-surface-0/50 border-b border-surface-1",
        className
      )}
    >
      {/* Left: Today's Progress */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-secondary">
          Today:{" "}
          <span className="font-mono tabular-nums text-primary">
            {processed}
          </span>{" "}
          of{" "}
          <span className="font-mono tabular-nums text-primary">{total}</span>
        </span>

        {/* Progress bar */}
        <div className="w-24 h-2 bg-surface-1 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              percentage >= 100
                ? "bg-success"
                : percentage >= 75
                ? "bg-action"
                : percentage >= 50
                ? "bg-warning"
                : "bg-surface-2"
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>

        <span className="text-sm font-mono tabular-nums text-muted">
          {percentage}%
        </span>

        <span className="text-muted">•</span>

        <span className="text-sm text-muted">
          Avg:{" "}
          <span className="font-mono tabular-nums text-secondary">
            {formatTime(averageTime)}
          </span>
        </span>
      </div>

      {/* Right: Actions + All-time */}
      <div className="flex items-center gap-3">
        {/* All-time (cumulative "jar of marbles") */}
        <div className="text-sm text-muted">
          All-time:{" "}
          <span className="font-mono tabular-nums text-secondary">
            {allTimeProcessed}
          </span>
        </div>

        {/* Quick Capture hint */}
        {onQuickCapture && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted hover:text-action"
            onClick={onQuickCapture}
          >
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Quick Capture</span>
            <kbd className="ml-2 px-1 py-0.5 bg-surface-1 rounded text-[10px]">
              Q
            </kbd>
          </Button>
        )}

        {/* Refresh */}
        {onRefresh && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted hover:text-secondary"
            onClick={onRefresh}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Compact Session Stats - For mobile or smaller displays
 */
export function SessionStatsCompact({
  processed,
  total,
  percentage,
  className,
}: {
  processed: number;
  total: number;
  percentage: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-xs font-mono tabular-nums text-muted">
        {processed}/{total}
      </span>
      <div className="w-16 h-1.5 bg-surface-1 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full",
            percentage >= 100 ? "bg-success" : "bg-action"
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
