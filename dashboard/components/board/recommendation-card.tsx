// @ts-nocheck
"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { QuarterlyRecommendation } from "@/lib/types/board";
import { Target, ArrowRight, Clock, Zap } from "lucide-react";

interface RecommendationCardProps {
  recommendation: QuarterlyRecommendation;
  className?: string;
}

/**
 * Get priority badge style
 */
function getPriorityStyle(priority: 1 | 2 | 3): { bg: string; text: string } {
  switch (priority) {
    case 1:
      return { bg: "bg-action", text: "#1" };
    case 2:
      return { bg: "bg-warning", text: "#2" };
    case 3:
      return { bg: "bg-muted", text: "#3" };
    default:
      return { bg: "bg-surface-1", text: `#${priority}` };
  }
}

/**
 * Get effort badge variant
 */
function getEffortBadgeVariant(effort: "low" | "medium" | "high"): "spike" | "followup" | "surge" {
  switch (effort) {
    case "low":
      return "spike";
    case "medium":
      return "followup";
    case "high":
      return "surge";
    default:
      return "followup";
  }
}

/**
 * Format currency
 */
function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `£${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `£${(value / 1000).toFixed(0)}K`;
  }
  return `£${value}`;
}

export function RecommendationCard({ recommendation, className }: RecommendationCardProps) {
  const priorityStyle = getPriorityStyle(recommendation.priority);

  return (
    <Card className={cn(
      recommendation.priority === 1 && "border-action/30",
      className
    )}>
      <CardContent className="p-4">
        {/* Header: Priority badge */}
        <div className="flex items-start justify-between mb-2">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm",
            priorityStyle.bg
          )}>
            {priorityStyle.text}
          </div>
          {recommendation.potentialValue && (
            <div className="text-right">
              <div className="text-xs text-muted">Potential</div>
              <div className="text-sm font-semibold text-success">
                {formatCurrency(recommendation.potentialValue)}
              </div>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="font-semibold text-primary mb-1">{recommendation.title}</div>

        {/* Rationale */}
        <div className="text-sm text-secondary mb-3">{recommendation.rationale}</div>

        {/* Target forces */}
        {recommendation.targetForces && recommendation.targetForces.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-3 w-3 text-muted" />
            <span className="text-xs text-muted">
              {recommendation.targetForces.slice(0, 3).join(", ")}
              {recommendation.targetForces.length > 3 && ` +${recommendation.targetForces.length - 3}`}
            </span>
          </div>
        )}

        {/* Footer: Timing + Effort */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-muted">
              <Clock className="h-3 w-3" />
              {recommendation.timing}
            </div>
            <Badge variant={getEffortBadgeVariant(recommendation.effort)} className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              {recommendation.effort} effort
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton for recommendation card
 */
export function RecommendationCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 animate-pulse">
        <div className="flex items-start justify-between mb-2">
          <div className="w-8 h-8 rounded-full bg-surface-1" />
          <div className="text-right">
            <div className="h-3 w-12 bg-surface-1 rounded mb-1" />
            <div className="h-4 w-16 bg-surface-1 rounded" />
          </div>
        </div>
        <div className="h-5 w-40 bg-surface-1 rounded mb-1" />
        <div className="h-4 w-full bg-surface-1 rounded mb-3" />
        <div className="flex items-center gap-2 mb-3">
          <div className="h-3 w-3 bg-surface-1 rounded" />
          <div className="h-3 w-32 bg-surface-1 rounded" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-4 w-20 bg-surface-1 rounded" />
            <div className="h-5 w-24 bg-surface-1 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
