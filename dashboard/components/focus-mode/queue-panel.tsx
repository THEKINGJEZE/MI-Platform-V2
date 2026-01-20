// @ts-nocheck
"use client";

import { cn } from "@/lib/utils";
import { PriorityBadge, Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Flame,
  RefreshCw,
  ChevronRight,
  LayoutList,
} from "lucide-react";
import type { Opportunity, PriorityTier } from "@/lib/types/opportunity";

// V2 simplified queue modes
export type QueueMode = "all" | "hot";

interface QueuePanelProps {
  opportunities: Opportunity[];
  currentOpportunityId: string | null;
  queueMode: QueueMode;
  onSelectOpportunity: (id: string) => void;
  onQueueModeChange: (mode: QueueMode) => void;
  onRefresh?: () => void;
  className?: string;
}

/**
 * Queue Panel - Left zone showing opportunity list
 *
 * V2 Simplified:
 * - Two queue modes: All or Hot (priority = hot)
 * - Simple priority badge display
 * - J/K keyboard navigation hint
 */
export function QueuePanel({
  opportunities,
  currentOpportunityId,
  queueMode,
  onSelectOpportunity,
  onQueueModeChange,
  onRefresh,
  className,
}: QueuePanelProps) {
  return (
    <div
      className={cn(
        "flex flex-col h-full bg-surface-0 border-r border-surface-1",
        className
      )}
    >
      {/* Queue Mode Tabs */}
      <div className="p-3 border-b border-surface-1">
        <div className="flex gap-1">
          <Button
            variant={queueMode === "hot" ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "flex-1 text-xs gap-1",
              queueMode === "hot" && "bg-surface-1"
            )}
            onClick={() => onQueueModeChange("hot")}
          >
            <Flame className="h-3 w-3" />
            Hot
          </Button>
          <Button
            variant={queueMode === "all" ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "flex-1 text-xs gap-1",
              queueMode === "all" && "bg-surface-1"
            )}
            onClick={() => onQueueModeChange("all")}
          >
            <LayoutList className="h-3 w-3" />
            All
          </Button>
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

      {/* Queue Stats */}
      <div className="px-3 py-2 border-b border-surface-1 bg-surface-1/30">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">
            {opportunities.length} {opportunities.length === 1 ? "opportunity" : "opportunities"}
          </span>
          <span className="text-muted">
            {queueMode === "hot" ? "Priority: Hot" : "All active"}
          </span>
        </div>
      </div>

      {/* Opportunity List */}
      <div className="flex-1 overflow-y-auto">
        {opportunities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <p className="text-muted text-sm">No opportunities in this queue</p>
            <p className="text-muted text-xs mt-1">
              Try a different queue mode
            </p>
          </div>
        ) : (
          <div className="divide-y divide-surface-1">
            {opportunities.map((opportunity, index) => (
              <QueueItem
                key={opportunity.id}
                opportunity={opportunity}
                isActive={opportunity.id === currentOpportunityId}
                index={index}
                onClick={() => onSelectOpportunity(opportunity.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Keyboard hint */}
      <div className="p-2 border-t border-surface-1 text-center">
        <p className="text-[11px] text-muted">
          Press{" "}
          <kbd className="px-1 py-0.5 bg-surface-1 rounded text-[10px]">J</kbd>{" "}
          /{" "}
          <kbd className="px-1 py-0.5 bg-surface-1 rounded text-[10px]">K</kbd>{" "}
          to navigate
        </p>
      </div>
    </div>
  );
}

/**
 * Queue Item - Individual opportunity in the queue
 */
function QueueItem({
  opportunity,
  isActive,
  index,
  onClick,
}: {
  opportunity: Opportunity;
  isActive: boolean;
  index: number;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "w-full text-left p-3 transition-colors",
        "hover:bg-surface-1/50",
        isActive && "bg-action/10 border-l-2 border-action"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Left: Force + Name */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            {isActive && (
              <ChevronRight className="h-3 w-3 text-action flex-shrink-0" />
            )}
            <span
              className={cn(
                "font-medium truncate",
                isActive ? "text-primary" : "text-secondary"
              )}
            >
              {opportunity.force?.name || opportunity.name}
            </span>
          </div>

          {/* Opportunity name if different from force */}
          {opportunity.name && opportunity.name !== opportunity.force?.name && (
            <p className="text-xs text-muted truncate pl-5">
              {opportunity.name}
            </p>
          )}

          {/* Signal count */}
          <div className="flex items-center gap-2 pl-5">
            <span className="text-[10px] text-muted">
              {opportunity.signalCount} signal{opportunity.signalCount !== 1 && "s"}
            </span>
          </div>
        </div>

        {/* Right: Priority Badge */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <PriorityBadge priority={opportunity.priorityTier} />
        </div>
      </div>
    </button>
  );
}
