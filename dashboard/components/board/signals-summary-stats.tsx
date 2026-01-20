// @ts-nocheck
"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import type { SignalsSummary } from "@/lib/types/board";
import { Activity, Building, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

interface SignalsSummaryStatsProps {
  summary: SignalsSummary;
  className?: string;
}

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

function StatCard({ label, value, subtext, icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">{label}</div>
            <div className="text-2xl font-bold text-primary">{value}</div>
            {subtext && (
              <div className={cn(
                "text-xs mt-1",
                trend === "up" && "text-success",
                trend === "down" && "text-danger",
                trend === "neutral" && "text-muted"
              )}>
                {subtext}
              </div>
            )}
          </div>
          <div className="text-muted/60">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SignalsSummaryStats({ summary, className }: SignalsSummaryStatsProps) {
  const trendText = summary.trendsUp > summary.trendsDown
    ? `↑ ${summary.trendsUp} up, ↓ ${summary.trendsDown} down`
    : summary.trendsDown > summary.trendsUp
      ? `↓ ${summary.trendsDown} down, ↑ ${summary.trendsUp} up`
      : `${summary.trendsUp} up, ${summary.trendsDown} down`;

  const trendDirection = summary.trendsUp > summary.trendsDown
    ? "up"
    : summary.trendsDown > summary.trendsUp
      ? "down"
      : "neutral";

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      <StatCard
        label="Signals This Week"
        value={summary.totalSignalsThisWeek}
        subtext={`${summary.totalSignalsThisMonth} this month`}
        icon={<Activity className="h-5 w-5" />}
      />
      <StatCard
        label="Forces Active"
        value={summary.forcesWithSignals}
        subtext="with recent signals"
        icon={<Building className="h-5 w-5" />}
      />
      <StatCard
        label="Top Signal Type"
        value={summary.topSignalType}
        subtext={`${summary.topSignalTypeCount} occurrences`}
        icon={<BarChart3 className="h-5 w-5" />}
      />
      <StatCard
        label="Signal Trends"
        value={trendText}
        icon={
          trendDirection === "up" ? (
            <TrendingUp className="h-5 w-5 text-success" />
          ) : trendDirection === "down" ? (
            <TrendingDown className="h-5 w-5 text-danger" />
          ) : (
            <Activity className="h-5 w-5" />
          )
        }
        trend={trendDirection}
      />
    </div>
  );
}

/**
 * Skeleton for summary stats
 */
export function SignalsSummaryStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 animate-pulse">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-3 w-20 bg-surface-1 rounded mb-2" />
                <div className="h-7 w-16 bg-surface-1 rounded mb-1" />
                <div className="h-3 w-24 bg-surface-1 rounded" />
              </div>
              <div className="h-5 w-5 bg-surface-1 rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
