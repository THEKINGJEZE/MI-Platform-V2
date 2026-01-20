// @ts-nocheck
"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Clock } from "lucide-react";
import type { ConversionMetrics as ConversionMetricsType } from "@/lib/types/board";

interface ConversionMetricsProps {
  metrics: ConversionMetricsType;
  className?: string;
}

export function ConversionMetrics({
  metrics,
  className,
}: ConversionMetricsProps) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-6">
          {/* Win Rate */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <TrendingUp className="size-4 text-success" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted font-medium">
                Win Rate
              </div>
              <div className="text-lg font-semibold font-mono tabular-nums text-primary">
                {metrics.overallWinRate}%
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="h-10 w-px bg-surface-1" />

          {/* Avg Days to Close */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info/10">
              <Clock className="size-4 text-info" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted font-medium">
                Avg Days to Close
              </div>
              <div className="text-lg font-semibold font-mono tabular-nums text-primary">
                {metrics.avgDaysToClose}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loader for conversion metrics
 */
export function ConversionMetricsSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-6 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="size-9 bg-surface-1 rounded-lg" />
            <div>
              <div className="h-3 w-16 bg-surface-1 rounded mb-1" />
              <div className="h-5 w-10 bg-surface-1 rounded" />
            </div>
          </div>
          <div className="h-10 w-px bg-surface-1" />
          <div className="flex items-center gap-3">
            <div className="size-9 bg-surface-1 rounded-lg" />
            <div>
              <div className="h-3 w-24 bg-surface-1 rounded mb-1" />
              <div className="h-5 w-10 bg-surface-1 rounded" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
