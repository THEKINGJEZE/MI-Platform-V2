// @ts-nocheck
"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PipelineScorecard as PipelineScorecardType } from "@/lib/types/board";

interface PipelineScorecardProps {
  scorecard: PipelineScorecardType;
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
 * Get status badge variant
 */
function getStatusVariant(
  status: "green" | "amber" | "red"
): "success" | "info" | "destructive" {
  switch (status) {
    case "green":
      return "success";
    case "amber":
      return "info";
    case "red":
      return "destructive";
  }
}

/**
 * Get status text
 */
function getStatusText(status: "green" | "amber" | "red"): string {
  switch (status) {
    case "green":
      return "ON TRACK";
    case "amber":
      return "CAUTION";
    case "red":
      return "AT RISK";
  }
}

export function PipelineScorecard({
  scorecard,
  className,
}: PipelineScorecardProps) {
  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {/* Total Pipeline */}
      <Card>
        <CardContent className="p-4">
          <span className="text-xs uppercase tracking-wider text-muted font-medium">
            Total Pipeline
          </span>
          <div className="text-2xl font-semibold font-mono tabular-nums text-primary mt-1">
            {formatCurrency(scorecard.totalPipeline)}
          </div>
          <div className="text-xs text-muted mt-1">
            {scorecard.dealCount} deals
          </div>
        </CardContent>
      </Card>

      {/* Weighted Pipeline */}
      <Card>
        <CardContent className="p-4">
          <span className="text-xs uppercase tracking-wider text-muted font-medium">
            Weighted Pipeline
          </span>
          <div className="text-2xl font-semibold font-mono tabular-nums text-primary mt-1">
            {formatCurrency(scorecard.weightedPipeline)}
          </div>
          <div className="text-xs text-muted mt-1">
            {scorecard.totalPipeline > 0
              ? `${Math.round((scorecard.weightedPipeline / scorecard.totalPipeline) * 100)}% weighted`
              : "—"}
          </div>
        </CardContent>
      </Card>

      {/* Quarterly Target */}
      <Card>
        <CardContent className="p-4">
          <span className="text-xs uppercase tracking-wider text-muted font-medium">
            Quarterly Target
          </span>
          <div className="text-2xl font-semibold font-mono tabular-nums text-primary mt-1">
            {formatCurrency(scorecard.quarterlyTarget)}
          </div>
          <div className="text-xs text-muted mt-1">FY target</div>
        </CardContent>
      </Card>

      {/* Target Coverage */}
      <Card>
        <CardContent className="p-4">
          <span className="text-xs uppercase tracking-wider text-muted font-medium">
            Target Coverage
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-semibold font-mono tabular-nums text-primary">
              {scorecard.targetPercentage}%
            </span>
            {scorecard.status === "green" && (
              <span className="text-success text-lg">✓</span>
            )}
          </div>
          <Badge
            variant={getStatusVariant(scorecard.status)}
            showIcon={false}
            className="mt-1"
          >
            {getStatusText(scorecard.status)}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Skeleton loader for pipeline scorecard
 */
export function PipelineScorecardSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardContent className="p-4 animate-pulse">
            <div className="h-3 w-24 bg-surface-1 rounded" />
            <div className="h-7 w-20 bg-surface-1 rounded mt-2" />
            <div className="h-3 w-16 bg-surface-1 rounded mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
