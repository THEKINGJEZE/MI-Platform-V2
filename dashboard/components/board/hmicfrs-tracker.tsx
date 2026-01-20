// @ts-nocheck
"use client";

import { cn } from "@/lib/utils";

interface HMICFRSTrackerProps {
  className?: string;
}

export function HMICFRSTracker({ className }: HMICFRSTrackerProps) {
  return (
    <div className={cn("rounded-lg border border-border/40 bg-card/30 p-4", className)}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground/80">
          HMICFRS Status Tracker
        </h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-foreground/50">
          Coming Soon
        </span>
      </div>

      {/* Placeholder Content */}
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
          <svg
            className="h-6 w-6 text-foreground/30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div className="text-sm font-medium text-foreground/50">
          HMICFRS Integration in Development
        </div>
        <div className="mt-2 max-w-xs text-xs text-foreground/40">
          Phase 2 will show: Forces in Engage status, Inadequate ratings, and
          recent inspection changes
        </div>
      </div>

      {/* Preview Pills */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs text-red-400/60">
          Inadequate
        </span>
        <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs text-amber-400/60">
          Requires Improvement
        </span>
        <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs text-blue-400/60">
          Engage Status
        </span>
      </div>
    </div>
  );
}
