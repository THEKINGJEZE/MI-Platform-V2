// @ts-nocheck
"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PolicyItem, PolicyImpact, PolicyType, PolicyStatus } from "@/lib/types/board";
import { ExternalLink, FileText, Shield, Building, Scale, AlertCircle } from "lucide-react";

interface PolicyItemCardProps {
  policy: PolicyItem;
  className?: string;
}

/**
 * Get icon for policy type
 */
function getPolicyIcon(type: PolicyType) {
  switch (type) {
    case "home_office":
      return <Building className="h-4 w-4" />;
    case "procurement":
      return <Scale className="h-4 w-4" />;
    case "pcc":
      return <FileText className="h-4 w-4" />;
    case "hmicfrs":
      return <Shield className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
}

/**
 * Get badge variant for impact level
 */
function getImpactBadgeVariant(impact: PolicyImpact): "surge" | "followup" | "spike" {
  switch (impact) {
    case "high":
      return "surge";
    case "medium":
      return "followup";
    case "low":
    default:
      return "spike";
  }
}

/**
 * Get display text for policy type
 */
function getPolicyTypeText(type: PolicyType): string {
  switch (type) {
    case "home_office":
      return "HOME OFFICE";
    case "procurement":
      return "PROCUREMENT";
    case "pcc":
      return "PCC";
    case "hmicfrs":
      return "HMICFRS";
    default:
      return "OTHER";
  }
}

/**
 * Get status text and style
 */
function getStatusStyle(status: PolicyStatus): { text: string; className: string } {
  switch (status) {
    case "upcoming":
      return { text: "Upcoming", className: "text-warning" };
    case "in_progress":
      return { text: "In Progress", className: "text-action" };
    case "completed":
      return { text: "Completed", className: "text-success" };
    default:
      return { text: status, className: "text-muted" };
  }
}

/**
 * Format date for display
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
}

export function PolicyItemCard({ policy, className }: PolicyItemCardProps) {
  const statusStyle = getStatusStyle(policy.status);

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        {/* Header: Type badge + Impact */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-muted">
            {getPolicyIcon(policy.type)}
            <span className="text-xs font-medium uppercase tracking-wide">
              {getPolicyTypeText(policy.type)}
            </span>
          </div>
          <Badge variant={getImpactBadgeVariant(policy.impact)}>
            {policy.impact.toUpperCase()}
          </Badge>
        </div>

        {/* Title */}
        <div className="font-semibold text-primary mb-1">{policy.title}</div>

        {/* Summary */}
        <div className="text-sm text-secondary mb-2">{policy.summary}</div>

        {/* Footer: Date + Status + Link */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted">{formatDate(policy.date)}</span>
            <span className={statusStyle.className}>{statusStyle.text}</span>
          </div>
          {policy.url && (
            <a
              href={policy.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-action hover:text-action/80 flex items-center gap-1 text-xs"
            >
              View <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton for policy item
 */
export function PolicyItemSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 animate-pulse">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-surface-1 rounded" />
            <div className="h-3 w-20 bg-surface-1 rounded" />
          </div>
          <div className="h-5 w-12 bg-surface-1 rounded-full" />
        </div>
        <div className="h-5 w-48 bg-surface-1 rounded mb-1" />
        <div className="h-4 w-full bg-surface-1 rounded mb-2" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-3 w-16 bg-surface-1 rounded" />
            <div className="h-3 w-16 bg-surface-1 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
