// @ts-nocheck
"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Users, Building2 } from "lucide-react";
import type { Force } from "@/lib/types/opportunity";

interface ForceContextProps {
  force: Force;
  className?: string;
}

/**
 * Force Context Section - V2 Simplified
 *
 * Displays UK Police force-specific information:
 * - Force name
 * - Region (if available)
 * - Size (if available)
 */
export function ForceContext({ force, className }: ForceContextProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 py-3 px-4 rounded-lg bg-surface-1/50",
        className
      )}
    >
      {/* Force Icon */}
      <Building2 className="h-4 w-4 text-muted" />

      {/* Force Name */}
      <span className="font-medium text-primary">{force.name}</span>

      {/* Region */}
      {force.region && (
        <Badge variant="outline" className="text-xs">
          {force.region}
        </Badge>
      )}

      {/* Force Size */}
      {force.size && (
        <div className="flex items-center gap-1.5 text-sm">
          <Users className="h-3.5 w-3.5 text-muted" />
          <span className="text-secondary">
            {getForceSizeLabel(force.size)}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Get human-readable force size label
 */
function getForceSizeLabel(size: string): string {
  switch (size.toLowerCase()) {
    case "large":
      return "Large Force";
    case "medium":
      return "Medium Force";
    case "small":
      return "Small Force";
    default:
      return size;
  }
}

/**
 * Force Context Compact - For list view
 */
export function ForceContextCompact({
  force,
  className,
}: ForceContextProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-secondary truncate">{force.name}</span>
      {force.region && (
        <span className="text-xs text-muted">({force.region})</span>
      )}
    </div>
  );
}
