// @ts-nocheck
"use client";

import { useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useBoardStore } from "@/lib/stores/board-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  SignalsSummaryStats,
  SignalsSummaryStatsSkeleton,
} from "./signals-summary-stats";
import { WeeklyTrendCard, WeeklyTrendCardSkeleton } from "./weekly-trend-card";
import { SignalFiltersBar, SignalFiltersSkeleton } from "./signal-filters";
import {
  StrategicSignalCard,
  StrategicSignalCardSkeleton,
} from "./strategic-signal-card";
import { PolicyTracker, PolicyTrackerSkeleton } from "./policy-tracker";
import {
  QuarterlyRecommendations,
  QuarterlyRecommendationsSkeleton,
} from "./quarterly-recommendations";
import { RefreshCw, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import type { SignalFilters } from "@/lib/types/board";

interface StrategicSignalsTabProps {
  className?: string;
}

export function StrategicSignalsTab({ className }: StrategicSignalsTabProps) {
  const {
    strategicSignals,
    isLoadingStrategicSignals,
    error,
    signalFilters,
    fetchStrategicSignals,
    setSignalFilters,
    setError,
  } = useBoardStore();

  // Fetch on mount
  useEffect(() => {
    fetchStrategicSignals({ limit: 20, offset: 0 });
  }, [fetchStrategicSignals]);

  // Handle filter change
  const handleFilterChange = useCallback(
    (filters: SignalFilters) => {
      setSignalFilters(filters);
      fetchStrategicSignals(filters);
    },
    [setSignalFilters, fetchStrategicSignals]
  );

  // Handle pagination
  const handleNextPage = useCallback(() => {
    const currentOffset = signalFilters.offset || 0;
    const limit = signalFilters.limit || 20;
    fetchStrategicSignals({ ...signalFilters, offset: currentOffset + limit });
  }, [signalFilters, fetchStrategicSignals]);

  const handlePrevPage = useCallback(() => {
    const currentOffset = signalFilters.offset || 0;
    const limit = signalFilters.limit || 20;
    const newOffset = Math.max(0, currentOffset - limit);
    fetchStrategicSignals({ ...signalFilters, offset: newOffset });
  }, [signalFilters, fetchStrategicSignals]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchStrategicSignals({ ...signalFilters, offset: 0 });
  }, [signalFilters, fetchStrategicSignals]);

  // Error state
  if (error && !strategicSignals) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => setError(null)}>
            Dismiss
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Loading state
  if (isLoadingStrategicSignals && !strategicSignals) {
    return (
      <div className={cn("space-y-6", className)}>
        <SignalsSummaryStatsSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <WeeklyTrendCardSkeleton />
          </div>
          <div>
            <PolicyTrackerSkeleton />
          </div>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="h-5 w-24 bg-surface-1 rounded animate-pulse" />
              <SignalFiltersSkeleton />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <StrategicSignalCardSkeleton key={i} />
            ))}
          </CardContent>
        </Card>
        <QuarterlyRecommendationsSkeleton />
      </div>
    );
  }

  const data = strategicSignals;
  if (!data) return null;

  const currentOffset = signalFilters.offset || 0;
  const limit = signalFilters.limit || 20;
  const hasPrevPage = currentOffset > 0;
  const hasNextPage = data.pagination.hasMore;
  const currentPage = Math.floor(currentOffset / limit) + 1;
  const totalPages = Math.ceil(data.totalSignals / limit);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary Stats */}
      <SignalsSummaryStats summary={data.summary} />

      {/* Weekly Trend + Policy Tracker Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WeeklyTrendCard trend={data.weeklyTrend} />
        </div>
        <div>
          <PolicyTracker policies={data.policyItems} />
        </div>
      </div>

      {/* Signal Feed */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              Signal Feed
              <span className="text-sm font-normal text-muted">
                ({data.totalSignals} signals)
              </span>
              {isLoadingStrategicSignals && (
                <RefreshCw className="h-4 w-4 animate-spin text-muted" />
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <SignalFiltersBar
                filterOptions={data.filterOptions}
                currentFilters={signalFilters}
                onFilterChange={handleFilterChange}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoadingStrategicSignals}
              >
                <RefreshCw
                  className={cn(
                    "h-4 w-4",
                    isLoadingStrategicSignals && "animate-spin"
                  )}
                />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.signals.length === 0 ? (
            <div className="text-sm text-muted text-center py-8">
              No signals match your filters
            </div>
          ) : (
            data.signals.map((signal) => (
              <StrategicSignalCard key={signal.id} signal={signal} />
            ))
          )}

          {/* Pagination */}
          {(hasPrevPage || hasNextPage) && (
            <div className="flex items-center justify-between pt-4 border-t border-surface-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={!hasPrevPage || isLoadingStrategicSignals}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-muted">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!hasNextPage || isLoadingStrategicSignals}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quarterly Recommendations */}
      <QuarterlyRecommendations recommendations={data.recommendations} />

      {/* Last updated */}
      <div className="text-xs text-muted text-center">
        Last updated: {new Date(data.lastUpdated).toLocaleString("en-GB")}
      </div>
    </div>
  );
}

/**
 * Full skeleton for the tab
 */
export function StrategicSignalsTabSkeleton() {
  return (
    <div className="space-y-6">
      <SignalsSummaryStatsSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WeeklyTrendCardSkeleton />
        </div>
        <div>
          <PolicyTrackerSkeleton />
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="h-5 w-24 bg-surface-1 rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <StrategicSignalCardSkeleton key={i} />
          ))}
        </CardContent>
      </Card>
      <QuarterlyRecommendationsSkeleton />
    </div>
  );
}
