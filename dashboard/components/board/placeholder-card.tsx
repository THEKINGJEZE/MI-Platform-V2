// @ts-nocheck
"use client";

import { cn } from "@/lib/utils";

interface PlaceholderCardProps {
  title: string;
  description: string;
  details?: string;
  icon?: string;
  className?: string;
}

export function PlaceholderCard({
  title,
  description,
  details,
  icon = "🚧",
  className,
}: PlaceholderCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/40 bg-card/30 p-6",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="text-3xl">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-foreground">{title}</h3>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              Coming Soon
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          {details && (
            <p className="mt-2 text-xs text-muted-foreground/70">{details}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function PlaceholderCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/40 bg-card/30 p-6 animate-pulse",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="h-8 w-8 rounded bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-3 w-48 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
