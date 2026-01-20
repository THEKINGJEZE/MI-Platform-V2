// @ts-nocheck
"use client";

import { cn } from "@/lib/utils";
import {
  SegmentBadge,
  HmicfrsBadge,
  ForceTypeBadge,
} from "@/components/ui/badge";
import type { Force } from "@/lib/types/opportunity";
import { ChevronRight, ChevronDown, Building2 } from "lucide-react";

interface ForceRowProps {
  force: Force;
  rank: number;
  isExpanded: boolean;
  isSelected: boolean;
  onExpand: () => void;
  onSelect: () => void;
}

/**
 * Force Row Component
 *
 * Individual row in the Force Priority List showing:
 * - Rank (#1, #2, etc.)
 * - Force name + short name
 * - Segment badge
 * - HMICFRS status badge
 * - Propensity score bar
 * - Relationship score bar
 * - Expand chevron
 *
 * States:
 * - Default: Transparent
 * - Hover: Surface-1 background
 * - Selected: Action colour left border
 * - Expanded: Shows ForceDetailCard below
 */
export function ForceRow({
  force,
  rank,
  isExpanded,
  isSelected,
  onExpand,
  onSelect,
}: ForceRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 px-4 py-3 cursor-pointer transition-all duration-150",
        "hover:bg-surface-1/50",
        isSelected && "bg-surface-1/30 border-l-2 border-action",
        !isSelected && "border-l-2 border-transparent"
      )}
      onClick={onSelect}
      tabIndex={0}
      role="row"
      aria-selected={isSelected}
      aria-expanded={isExpanded}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onExpand();
        }
      }}
    >
      {/* Rank */}
      <div className="w-12 shrink-0 text-center">
        <span className="font-mono text-lg font-semibold text-muted">
          #{rank}
        </span>
      </div>

      {/* Force Name */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted shrink-0" />
          <div className="min-w-0">
            <p className="font-medium text-primary truncate">{force.name}</p>
            {force.shortName && (
              <p className="text-xs text-muted truncate">{force.shortName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Force Type */}
      <div className="w-24 shrink-0 hidden md:block">
        {force.forceType && <ForceTypeBadge type={force.forceType} />}
      </div>

      {/* Segment */}
      <div className="w-28 shrink-0">
        {force.segment && <SegmentBadge segment={force.segment} />}
      </div>

      {/* HMICFRS Status */}
      <div className="w-24 shrink-0 hidden lg:block">
        {force.hmicfrsStatus ? (
          <HmicfrsBadge status={force.hmicfrsStatus} />
        ) : (
          <span className="text-xs text-muted">N/A</span>
        )}
      </div>

      {/* Propensity Score */}
      <div className="w-24 shrink-0 hidden md:block">
        <ScoreBar
          score={force.propensityScore || 0}
          label="Propensity"
          maxScore={100}
        />
      </div>

      {/* Relationship Score */}
      <div className="w-24 shrink-0 hidden lg:block">
        <ScoreBar
          score={force.relationshipScore || 0}
          label="Relationship"
          maxScore={100}
        />
      </div>

      {/* Signal Count */}
      <div className="w-16 shrink-0 text-center hidden md:block">
        {force.signalCount90d ? (
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-info/10 text-info">
            {force.signalCount90d}
          </span>
        ) : (
          <span className="text-xs text-muted">—</span>
        )}
      </div>

      {/* Expand Chevron */}
      <button
        className="w-8 h-8 shrink-0 flex items-center justify-center rounded-md hover:bg-surface-2 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onExpand();
        }}
        aria-label={isExpanded ? "Collapse" : "Expand"}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted" />
        )}
      </button>
    </div>
  );
}

/**
 * Score Bar - Visual indicator for propensity/relationship scores
 */
function ScoreBar({
  score,
  label,
  maxScore = 100,
}: {
  score: number;
  label: string;
  maxScore?: number;
}) {
  const percentage = Math.min((score / maxScore) * 100, 100);
  const colorClass =
    percentage >= 70
      ? "bg-success"
      : percentage >= 40
      ? "bg-warning"
      : "bg-muted";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-muted">{label}</span>
        <span className="font-mono font-medium text-primary">{score}</span>
      </div>
      <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Compact Force Row for mobile or condensed views
 */
export function ForceRowCompact({
  force,
  rank,
  isSelected,
  onSelect,
}: {
  force: Force;
  rank: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2 cursor-pointer transition-all",
        "hover:bg-surface-1/50",
        isSelected && "bg-surface-1/30 border-l-2 border-action",
        !isSelected && "border-l-2 border-transparent"
      )}
      onClick={onSelect}
    >
      <span className="font-mono text-sm font-semibold text-muted w-8">
        #{rank}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-primary text-sm truncate">{force.name}</p>
      </div>
      {force.segment && <SegmentBadge segment={force.segment} />}
      <span className="font-mono text-sm font-semibold text-primary">
        {force.propensityScore || 0}
      </span>
    </div>
  );
}
