// @ts-nocheck
"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PipelineStageBreakdown as StageBreakdownType } from "@/lib/types/board";

interface StageBreakdownProps {
  stages: StageBreakdownType[];
  className?: string;
}

/**
 * Format currency for display
 */
function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `£${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `£${(value / 1000).toFixed(0)}k`;
  }
  return `£${value}`;
}

/**
 * Get bar color based on stage position
 */
function getBarColor(probability: number): string {
  if (probability >= 0.8) return "bg-success";
  if (probability >= 0.5) return "bg-info";
  return "bg-primary";
}

export function StageBreakdown({ stages, className }: StageBreakdownProps) {
  // Find max value for scaling bars
  const maxValue = Math.max(...stages.map((s) => s.totalValue), 1);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Stage Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stages.length === 0 ? (
          <div className="text-sm text-muted text-center py-4">
            No deals in pipeline
          </div>
        ) : (
          stages.map((stage) => {
            const barWidth = (stage.totalValue / maxValue) * 100;
            const barColor = getBarColor(stage.probability);

            return (
              <div key={stage.stageId} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary truncate pr-2">
                    {stage.stageName}
                  </span>
                  <span className="font-mono tabular-nums text-primary shrink-0">
                    {formatCurrency(stage.totalValue)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-surface-1 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", barColor)}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted w-8 text-right">
                    {stage.dealCount}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loader for stage breakdown
 */
export function StageBreakdownSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="h-5 w-28 bg-surface-1 rounded animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-1 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-4 w-32 bg-surface-1 rounded" />
              <div className="h-4 w-16 bg-surface-1 rounded" />
            </div>
            <div className="h-2 bg-surface-1 rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
