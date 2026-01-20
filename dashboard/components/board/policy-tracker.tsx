// @ts-nocheck
"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PolicyItemCard, PolicyItemSkeleton } from "./policy-item";
import type { PolicyItem } from "@/lib/types/board";
import { CalendarClock } from "lucide-react";

interface PolicyTrackerProps {
  policies: PolicyItem[];
  className?: string;
}

export function PolicyTracker({ policies, className }: PolicyTrackerProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-muted" />
          Policy & Regulatory
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {policies.length === 0 ? (
          <div className="text-sm text-muted text-center py-4">
            No policy items to display
          </div>
        ) : (
          policies.map((policy) => (
            <PolicyItemCard key={policy.id} policy={policy} />
          ))
        )}

        {/* Coming soon hint */}
        <div className="text-xs text-muted text-center pt-2 border-t border-surface-1">
          Coming: PCC Election Timeline
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton for policy tracker
 */
export function PolicyTrackerSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 animate-pulse">
          <div className="h-4 w-4 bg-surface-1 rounded" />
          <div className="h-4 w-28 bg-surface-1 rounded" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <PolicyItemSkeleton />
        <PolicyItemSkeleton />
        <PolicyItemSkeleton />
      </CardContent>
    </Card>
  );
}
