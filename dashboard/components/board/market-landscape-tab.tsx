// @ts-nocheck
"use client";

import { useEffect, useState, useCallback } from "react";
import { useBoardStore } from "@/lib/stores/board-store";
import { UKForceMap } from "./uk-force-map";
import { ForceRankingTable } from "./force-ranking-table";
import { BudgetCycle } from "./budget-cycle";
import { HMICFRSTracker } from "./hmicfrs-tracker";
import { ProcurementSummary, ProcurementSummarySkeleton } from "./procurement-summary";
import type { ForceRanking } from "@/lib/types/board";
import { cn } from "@/lib/utils";

// Loading skeleton for map
function MapSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-border/40 bg-card/30 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="h-4 w-48 rounded bg-muted" />
        <div className="flex gap-4">
          <div className="h-3 w-16 rounded bg-muted" />
          <div className="h-3 w-16 rounded bg-muted" />
          <div className="h-3 w-16 rounded bg-muted" />
        </div>
      </div>
      <div className="h-[400px] rounded bg-muted/50" />
    </div>
  );
}

// Loading skeleton for table
function TableSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-border/40 bg-card/30">
      <div className="border-b border-border/40 px-4 py-3">
        <div className="h-4 w-40 rounded bg-muted" />
      </div>
      <div className="space-y-3 p-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-4 w-8 rounded bg-muted" />
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-4 w-12 rounded bg-muted" />
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="h-4 w-16 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Force detail panel
function ForceDetailPanel({
  force,
  onClose,
}: {
  force: ForceRanking;
  onClose: () => void;
}) {
  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground">{force.name}</h4>
          {force.region && (
            <p className="text-xs text-foreground/50">{force.region}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-foreground/50 hover:bg-muted hover:text-foreground"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-foreground/50">Opportunity Score</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {force.opportunityScore}
          </div>
        </div>
        <div>
          <div className="text-xs text-foreground/50">Rank</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            #{force.rank}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded-md bg-card/50 p-3">
          <div className="text-xs text-foreground/50">Engagement Heat</div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-lg font-semibold tabular-nums">{force.engagementHeat}</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                force.engagementStatus === "hot" && "bg-red-500/15 text-red-400",
                force.engagementStatus === "warm" && "bg-yellow-500/15 text-yellow-400",
                force.engagementStatus === "cold" && "bg-muted text-muted-foreground"
              )}
            >
              {force.engagementStatus.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="rounded-md bg-card/50 p-3">
          <div className="text-xs text-foreground/50">Relationship Health</div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-lg font-semibold tabular-nums">{force.relationshipHealth}</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                force.relationshipStatus === "strong" && "bg-emerald-500/15 text-emerald-400",
                force.relationshipStatus === "moderate" && "bg-blue-500/15 text-blue-400",
                force.relationshipStatus === "weak" && "bg-orange-500/15 text-orange-400",
                force.relationshipStatus === "none" && "bg-muted text-muted-foreground"
              )}
            >
              {force.relationshipStatus.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {force.keySignal && (
        <div className="mt-4 rounded-md bg-card/50 p-3">
          <div className="text-xs text-foreground/50">Latest Signal</div>
          <div className="mt-1 text-sm text-foreground">{force.keySignal}</div>
          {force.keySignalDate && (
            <div className="mt-1 text-xs text-foreground/40">
              {new Date(force.keySignalDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function MarketLandscapeTab() {
  const { marketLandscape, isLoadingMarketLandscape, error, fetchMarketLandscape } =
    useBoardStore();
  const [selectedForce, setSelectedForce] = useState<ForceRanking | null>(null);

  // Fetch data on mount
  useEffect(() => {
    fetchMarketLandscape();
  }, [fetchMarketLandscape]);

  // Handle force selection (from map or table)
  const handleForceSelect = useCallback((force: ForceRanking) => {
    setSelectedForce((prev) => (prev?.id === force.id ? null : force));
  }, []);

  // Error state
  if (error && !marketLandscape) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-sm text-red-400">{error}</div>
          <button
            onClick={() => fetchMarketLandscape()}
            className="mt-2 text-xs text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Section: Map + Table */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: UK Force Map */}
        <div>
          {isLoadingMarketLandscape && !marketLandscape ? (
            <MapSkeleton />
          ) : marketLandscape ? (
            <UKForceMap
              forces={marketLandscape.forces}
              onForceClick={handleForceSelect}
            />
          ) : null}
        </div>

        {/* Right: Force Ranking Table */}
        <div>
          {isLoadingMarketLandscape && !marketLandscape ? (
            <TableSkeleton />
          ) : marketLandscape ? (
            <ForceRankingTable
              forces={marketLandscape.forces}
              selectedForceId={selectedForce?.id}
              onForceSelect={handleForceSelect}
              className="max-h-[500px] overflow-auto"
            />
          ) : null}
        </div>
      </div>

      {/* Selected Force Detail Panel */}
      {selectedForce && (
        <ForceDetailPanel
          force={selectedForce}
          onClose={() => setSelectedForce(null)}
        />
      )}

      {/* Procurement Overview */}
      {isLoadingMarketLandscape && !marketLandscape ? (
        <ProcurementSummarySkeleton />
      ) : marketLandscape?.procurementSummary ? (
        <ProcurementSummary data={marketLandscape.procurementSummary} />
      ) : null}

      {/* Bottom Section: Budget Cycle + HMICFRS */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Budget Cycle */}
        {marketLandscape?.budgetCycle && (
          <BudgetCycle data={marketLandscape.budgetCycle} />
        )}

        {/* HMICFRS Tracker */}
        <HMICFRSTracker />
      </div>

      {/* Summary Stats */}
      {marketLandscape?.summary && (
        <div className="rounded-lg border border-border/40 bg-card/30 p-4">
          <h3 className="mb-3 text-sm font-medium text-foreground/80">
            Market Summary
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <div className="text-center">
              <div className="text-2xl font-bold tabular-nums text-foreground">
                {marketLandscape.summary.totalForces}
              </div>
              <div className="text-xs text-foreground/50">Total Forces</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold tabular-nums text-red-400">
                {marketLandscape.summary.hotForces}
              </div>
              <div className="text-xs text-foreground/50">Hot</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold tabular-nums text-yellow-400">
                {marketLandscape.summary.warmForces}
              </div>
              <div className="text-xs text-foreground/50">Warm</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold tabular-nums text-foreground/50">
                {marketLandscape.summary.coldForces}
              </div>
              <div className="text-xs text-foreground/50">Cold</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold tabular-nums text-primary">
                {marketLandscape.summary.forcesWithIntent}
              </div>
              <div className="text-xs text-foreground/50">With Intent</div>
            </div>
          </div>
        </div>
      )}

      {/* Last Updated */}
      {marketLandscape?.lastUpdated && (
        <div className="text-right text-xs text-foreground/40">
          Last updated:{" "}
          {new Date(marketLandscape.lastUpdated).toLocaleString("en-GB", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      )}
    </div>
  );
}
