// @ts-nocheck
"use client";

import { useEffect } from "react";
import { useBoardStore } from "@/lib/stores/board-store";
import { PipelineScorecard, PipelineScorecardSkeleton } from "./pipeline-scorecard";
import { StageBreakdown, StageBreakdownSkeleton } from "./stage-breakdown";
import { RevenueForecast, RevenueForecastSkeleton } from "./revenue-forecast";
import { DealRiskSummary, DealRiskSummarySkeleton } from "./deal-risk-summary";
import { ConversionMetrics, ConversionMetricsSkeleton } from "./conversion-metrics";
import { cn } from "@/lib/utils";

interface PipelineTabProps {
  className?: string;
}

export function PipelineTab({ className }: PipelineTabProps) {
  const {
    pipeline,
    isLoadingPipeline,
    error,
    fetchPipeline,
  } = useBoardStore();

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  // Error state
  if (error && !pipeline) {
    return (
      <div className={cn("p-6", className)}>
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
          <div className="text-red-400 mb-2">Failed to load pipeline data</div>
          <div className="text-sm text-red-400/70 mb-4">{error}</div>
          <button
            onClick={() => fetchPipeline()}
            className="px-4 py-2 text-sm font-medium rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoadingPipeline && !pipeline) {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Scorecard Skeleton */}
        <PipelineScorecardSkeleton />

        {/* Stage Breakdown + Forecast Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StageBreakdownSkeleton />
          <RevenueForecastSkeleton />
        </div>

        {/* Deals at Risk Skeleton */}
        <DealRiskSummarySkeleton />

        {/* Conversion Metrics Skeleton */}
        <ConversionMetricsSkeleton />
      </div>
    );
  }

  // Data loaded
  const data = pipeline;

  if (!data) {
    return (
      <div className={cn("p-6 text-center text-muted", className)}>
        No pipeline data available. Please try refreshing.
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Last Updated */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Pipeline & Revenue
        </h2>
        {data.lastUpdated && (
          <span className="text-xs text-muted-foreground">
            Last updated:{" "}
            {new Date(data.lastUpdated).toLocaleString("en-GB", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      {/* Pipeline Scorecard */}
      <PipelineScorecard scorecard={data.scorecard} />

      {/* Stage Breakdown + Revenue Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StageBreakdown stages={data.stageBreakdown} />
        <RevenueForecast forecast={data.forecast} />
      </div>

      {/* Deals at Risk */}
      <DealRiskSummary
        deals={data.dealsAtRisk}
        summary={data.riskSummary}
      />

      {/* Conversion Metrics */}
      <ConversionMetrics metrics={data.conversionMetrics} />
    </div>
  );
}
