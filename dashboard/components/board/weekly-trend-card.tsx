// @ts-nocheck
"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { WeeklyTrendSummary } from "@/lib/types/board";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface WeeklyTrendCardProps {
  trend: WeeklyTrendSummary;
  className?: string;
}

function getTrendIcon(trend: "up" | "down" | "flat") {
  switch (trend) {
    case "up":
      return <TrendingUp className="h-4 w-4 text-success" />;
    case "down":
      return <TrendingDown className="h-4 w-4 text-danger" />;
    default:
      return <Minus className="h-4 w-4 text-muted" />;
  }
}

export function WeeklyTrendCard({ trend, className }: WeeklyTrendCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>Weekly Trend</span>
          <span className="text-xs text-muted font-normal">Week of {trend.weekOf}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI-style narrative */}
        <div className="text-sm text-secondary italic bg-surface-1/50 p-3 rounded-lg border-l-2 border-action">
          "{trend.narrative}"
        </div>

        {/* Key patterns */}
        {trend.keyPatterns.length > 0 && (
          <div>
            <div className="text-xs text-muted uppercase tracking-wide mb-2">Key Patterns</div>
            <ul className="space-y-1">
              {trend.keyPatterns.map((pattern, i) => (
                <li key={i} className="text-sm text-secondary flex items-start gap-2">
                  <span className="text-action">•</span>
                  {pattern}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Top forces */}
        {trend.topForces.length > 0 && (
          <div>
            <div className="text-xs text-muted uppercase tracking-wide mb-2">Most Active Forces</div>
            <div className="flex flex-wrap gap-2">
              {trend.topForces.slice(0, 5).map((force) => (
                <Badge key={force.name} variant="outline" className="text-xs">
                  {force.name}
                  <span className="ml-1 text-muted">({force.signalCount})</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Signal type breakdown with trends */}
        {trend.signalBreakdown.length > 0 && (
          <div>
            <div className="text-xs text-muted uppercase tracking-wide mb-2">Signal Breakdown</div>
            <div className="space-y-2">
              {trend.signalBreakdown.slice(0, 5).map((item) => (
                <div key={item.type} className="flex items-center justify-between text-sm">
                  <span className="text-secondary">{item.type}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.count}</span>
                    {getTrendIcon(item.trend)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton for weekly trend card
 */
export function WeeklyTrendCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between animate-pulse">
          <div className="h-4 w-24 bg-surface-1 rounded" />
          <div className="h-3 w-20 bg-surface-1 rounded" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 animate-pulse">
        <div className="bg-surface-1 p-3 rounded-lg h-16" />
        <div>
          <div className="h-3 w-20 bg-surface-1 rounded mb-2" />
          <div className="space-y-1">
            <div className="h-4 w-full bg-surface-1 rounded" />
            <div className="h-4 w-3/4 bg-surface-1 rounded" />
          </div>
        </div>
        <div>
          <div className="h-3 w-28 bg-surface-1 rounded mb-2" />
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-24 bg-surface-1 rounded-full" />
            <div className="h-6 w-20 bg-surface-1 rounded-full" />
            <div className="h-6 w-28 bg-surface-1 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
