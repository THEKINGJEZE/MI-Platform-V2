// @ts-nocheck
"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecommendationCard, RecommendationCardSkeleton } from "./recommendation-card";
import type { QuarterlyRecommendation } from "@/lib/types/board";
import { Lightbulb } from "lucide-react";

interface QuarterlyRecommendationsProps {
  recommendations: QuarterlyRecommendation[];
  className?: string;
}

export function QuarterlyRecommendations({ recommendations, className }: QuarterlyRecommendationsProps) {
  // Sort by priority
  const sortedRecommendations = [...recommendations].sort((a, b) => a.priority - b.priority);

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-warning" />
          Quarterly Priorities
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedRecommendations.length === 0 ? (
          <div className="text-sm text-muted text-center py-4">
            No recommendations available
          </div>
        ) : (
          sortedRecommendations.map((rec) => (
            <RecommendationCard key={rec.id} recommendation={rec} />
          ))
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton for quarterly recommendations
 */
export function QuarterlyRecommendationsSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 animate-pulse">
          <div className="h-4 w-4 bg-surface-1 rounded" />
          <div className="h-4 w-32 bg-surface-1 rounded" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <RecommendationCardSkeleton />
        <RecommendationCardSkeleton />
        <RecommendationCardSkeleton />
      </CardContent>
    </Card>
  );
}
