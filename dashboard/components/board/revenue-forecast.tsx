// @ts-nocheck
"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { RevenueForecast as RevenueForecastType } from "@/lib/types/board";

interface RevenueForecastProps {
  forecast: RevenueForecastType;
  className?: string;
}

/**
 * Format currency for display
 */
function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `£${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `£${(value / 1000).toFixed(0)}k`;
  }
  return `£${value}`;
}

/**
 * Get trend icon and color
 */
function getTrendDisplay(trend: "up" | "down" | "flat") {
  switch (trend) {
    case "up":
      return {
        icon: TrendingUp,
        color: "text-success",
        label: "Up vs last quarter",
      };
    case "down":
      return {
        icon: TrendingDown,
        color: "text-danger",
        label: "Down vs last quarter",
      };
    case "flat":
      return {
        icon: Minus,
        color: "text-muted",
        label: "Flat vs last quarter",
      };
  }
}

export function RevenueForecast({ forecast, className }: RevenueForecastProps) {
  const trendDisplay = getTrendDisplay(forecast.trend);
  const TrendIcon = trendDisplay.icon;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Revenue Forecast</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Forecast periods */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary">3 Month</span>
            <span className="font-mono tabular-nums text-primary font-medium">
              {formatCurrency(forecast.month3)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary">6 Month</span>
            <span className="font-mono tabular-nums text-primary font-medium">
              {formatCurrency(forecast.month6)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary">12 Month</span>
            <span className="font-mono tabular-nums text-primary font-medium">
              {formatCurrency(forecast.month12)}
            </span>
          </div>
        </div>

        {/* Trend indicator */}
        <div className="pt-3 border-t border-surface-1">
          <div className={cn("flex items-center gap-2 text-sm", trendDisplay.color)}>
            <TrendIcon className="size-4" />
            <span>{trendDisplay.label}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loader for revenue forecast
 */
export function RevenueForecastSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="h-5 w-32 bg-surface-1 rounded animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between animate-pulse">
              <div className="h-4 w-16 bg-surface-1 rounded" />
              <div className="h-4 w-20 bg-surface-1 rounded" />
            </div>
          ))}
        </div>
        <div className="pt-3 border-t border-surface-1">
          <div className="h-4 w-32 bg-surface-1 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}
