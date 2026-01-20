// @ts-nocheck
"use client";

import { useState, useMemo } from "react";
import type { ForceRanking, EngagementStatus, RelationshipStatus } from "@/lib/types/board";
import { cn } from "@/lib/utils";

type SortField = "rank" | "opportunityScore" | "engagementHeat" | "relationshipHealth";
type SortDirection = "asc" | "desc";

interface ForceRankingTableProps {
  forces: ForceRanking[];
  selectedForceId?: string;
  onForceSelect?: (force: ForceRanking) => void;
  className?: string;
}

// Engagement status badge
function EngagementBadge({ status }: { status: EngagementStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        status === "hot" && "bg-red-500/15 text-red-400",
        status === "warm" && "bg-yellow-500/15 text-yellow-400",
        status === "cold" && "bg-muted text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "hot" && "bg-red-500",
          status === "warm" && "bg-yellow-500",
          status === "cold" && "bg-muted-foreground"
        )}
      />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// Relationship status badge
function RelationshipBadge({ status }: { status: RelationshipStatus }) {
  const labels: Record<RelationshipStatus, string> = {
    strong: "Strong",
    moderate: "Moderate",
    weak: "Weak",
    none: "None",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        status === "strong" && "bg-emerald-500/15 text-emerald-400",
        status === "moderate" && "bg-blue-500/15 text-blue-400",
        status === "weak" && "bg-orange-500/15 text-orange-400",
        status === "none" && "bg-muted text-muted-foreground"
      )}
    >
      {labels[status]}
    </span>
  );
}

// Sortable header
function SortableHeader({
  label,
  field,
  currentField,
  direction,
  onSort,
}: {
  label: string;
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
  onSort: (field: SortField) => void;
}) {
  const isActive = currentField === field;

  return (
    <button
      className={cn(
        "flex items-center gap-1 text-xs font-medium transition-colors hover:text-foreground",
        isActive ? "text-foreground" : "text-foreground/60"
      )}
      onClick={() => onSort(field)}
    >
      {label}
      <svg
        className={cn(
          "h-3 w-3 transition-transform",
          isActive && direction === "asc" && "rotate-180"
        )}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  );
}

export function ForceRankingTable({
  forces,
  selectedForceId,
  onForceSelect,
  className,
}: ForceRankingTableProps) {
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      // Default to descending for scores (higher = better), ascending for rank
      setSortDirection(field === "rank" ? "asc" : "desc");
    }
  };

  // Sort forces
  const sortedForces = useMemo(() => {
    return [...forces].sort((a, b) => {
      const multiplier = sortDirection === "asc" ? 1 : -1;
      return (a[sortField] - b[sortField]) * multiplier;
    });
  }, [forces, sortField, sortDirection]);

  return (
    <div className={cn("rounded-lg border border-border/40 bg-card/30", className)}>
      {/* Header */}
      <div className="border-b border-border/40 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground/80">
            Force Priority Ranking
          </h3>
          <span className="text-xs text-foreground/50">
            {forces.length} forces
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/30 bg-muted/20">
              <th className="px-4 py-2 text-left">
                <SortableHeader
                  label="#"
                  field="rank"
                  currentField={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-foreground/60">
                Force
              </th>
              <th className="px-4 py-2 text-left">
                <SortableHeader
                  label="Score"
                  field="opportunityScore"
                  currentField={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-foreground/60">
                HMICFRS
              </th>
              <th className="px-4 py-2 text-left">
                <SortableHeader
                  label="Relationship"
                  field="relationshipHealth"
                  currentField={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
              </th>
              <th className="px-4 py-2 text-left">
                <SortableHeader
                  label="Heat"
                  field="engagementHeat"
                  currentField={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-foreground/60">
                Signal
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {sortedForces.map((force) => (
              <tr
                key={force.id}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-muted/30",
                  selectedForceId === force.id && "bg-primary/10"
                )}
                onClick={() => onForceSelect?.(force)}
              >
                <td className="px-4 py-2.5">
                  <span className="text-sm font-medium text-foreground/70">
                    {force.rank}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {force.name}
                    </div>
                    {force.region && (
                      <div className="text-xs text-foreground/50">
                        {force.region}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {force.opportunityScore}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span className="text-sm text-foreground/40">—</span>
                </td>
                <td className="px-4 py-2.5">
                  <RelationshipBadge status={force.relationshipStatus} />
                </td>
                <td className="px-4 py-2.5">
                  <EngagementBadge status={force.engagementStatus} />
                </td>
                <td className="px-4 py-2.5">
                  {force.keySignal ? (
                    <div className="max-w-[150px] truncate text-xs text-foreground/60">
                      {force.keySignal}
                    </div>
                  ) : (
                    <span className="text-xs text-foreground/30">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-border/30 px-4 py-2 text-xs text-foreground/40">
        Click row for details • Sorted by{" "}
        {sortField === "rank"
          ? "Rank"
          : sortField === "opportunityScore"
          ? "Score"
          : sortField === "engagementHeat"
          ? "Heat"
          : "Relationship"}{" "}
        ({sortDirection === "asc" ? "ascending" : "descending"})
      </div>
    </div>
  );
}
