// @ts-nocheck
"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { KPI, KPIStatus } from "@/lib/types/board";

interface KPICardProps {
  kpi: KPI;
  className?: string;
}

/**
 * Map KPI status to Badge variant
 */
function getStatusBadgeVariant(status: KPIStatus): "success" | "destructive" | "info" | "secondary" {
  switch (status) {
    case "green":
      return "success";
    case "amber":
      return "info"; // Using info (amber-ish) for caution
    case "red":
      return "destructive";
    case "neutral":
    default:
      return "secondary";
  }
}

/**
 * Get change direction indicator style
 */
function getChangeStyle(change: string | undefined) {
  if (!change) return { className: "text-muted", icon: "" };

  if (change.includes("↑") || change.toLowerCase().includes("up")) {
    return { className: "text-success", icon: "" };
  }
  if (change.includes("↓") || change.toLowerCase().includes("down")) {
    return { className: "text-danger", icon: "" };
  }
  return { className: "text-muted", icon: "" };
}

export function KPICard({ kpi, className }: KPICardProps) {
  const changeStyle = getChangeStyle(kpi.change);
  const badgeVariant = getStatusBadgeVariant(kpi.status);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4">
        {/* Header: Label + Icon */}
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs uppercase tracking-wider text-muted font-medium">
            {kpi.label}
          </span>
          {kpi.icon && <span className="text-lg">{kpi.icon}</span>}
        </div>

        {/* Primary Value - monospace typography */}
        <div className="text-3xl font-semibold font-mono tabular-nums text-primary mb-2">
          {kpi.value}
        </div>

        {/* Change + Status Badge */}
        <div className="flex items-center gap-2 flex-wrap mb-1">
          {kpi.change && (
            <span className={cn("text-sm", changeStyle.className)}>
              {kpi.change}
            </span>
          )}
          <Badge variant={badgeVariant} showIcon={false}>
            {kpi.statusText}
          </Badge>
        </div>

        {/* Context */}
        {kpi.context && (
          <div className="text-xs text-muted mb-2">{kpi.context}</div>
        )}

        {/* Details list (for KPIs like "Forces Showing Intent") */}
        {kpi.details && kpi.details.length > 0 && (
          <div className="mt-2 pt-2 border-t border-surface-1">
            <ul className="text-xs text-secondary space-y-0.5">
              {kpi.details.slice(0, 3).map((detail, i) => (
                <li key={i} className="truncate">
                  • {detail}
                </li>
              ))}
              {kpi.details.length > 3 && (
                <li className="text-muted">+{kpi.details.length - 3} more</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loader for KPI card
 */
export function KPICardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 animate-pulse">
        <div className="flex items-start justify-between mb-3">
          <div className="h-3 w-24 bg-surface-1 rounded" />
          <div className="h-5 w-5 bg-surface-1 rounded" />
        </div>
        <div className="h-8 w-20 bg-surface-1 rounded mb-2" />
        <div className="flex items-center gap-2 mb-1">
          <div className="h-4 w-16 bg-surface-1 rounded" />
          <div className="h-5 w-20 bg-surface-1 rounded-full" />
        </div>
        <div className="h-3 w-24 bg-surface-1 rounded" />
      </CardContent>
    </Card>
  );
}
