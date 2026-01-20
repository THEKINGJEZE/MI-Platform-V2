"use client";

import { type LucideIcon, Inbox, RefreshCw, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  /** Icon to display */
  icon?: LucideIcon;
  /** Main title */
  title: string;
  /** Description text */
  description: string;
  /** Primary action button */
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  /** Secondary action button */
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
}

/**
 * Empty State Component
 *
 * From spec: "Component States - Empty State"
 * - Friendly illustration (not generic)
 * - Clear message explaining why empty
 * - Primary action: "Refresh" or "Adjust Filters"
 * - Secondary action: "View All Leads"
 */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
    >
      {/* Icon Container */}
      <div className="rounded-full bg-surface-1 p-4 mb-4">
        <Icon className="h-8 w-8 text-muted" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-medium text-primary mb-1">{title}</h3>

      {/* Description */}
      <p className="text-sm text-muted max-w-sm mb-4">{description}</p>

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <div className="flex items-center gap-3">
          {primaryAction && (
            <Button
              onClick={primaryAction.onClick}
              className="gap-2"
            >
              {primaryAction.icon && (
                <primaryAction.icon className="h-4 w-4" />
              )}
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="ghost"
              onClick={secondaryAction.onClick}
              className="gap-2 text-muted hover:text-secondary"
            >
              {secondaryAction.label}
              {secondaryAction.icon ? (
                <secondaryAction.icon className="h-4 w-4" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Pre-configured Empty State for Leads
 */
export function LeadsEmptyState({
  onRefresh,
  onViewAll,
}: {
  onRefresh?: () => void;
  onViewAll?: () => void;
}) {
  return (
    <EmptyState
      icon={Inbox}
      title="No leads to show"
      description="There are no leads matching your current filters. Try adjusting your filters or refresh to check for new leads."
      primaryAction={
        onRefresh
          ? {
              label: "Refresh",
              onClick: onRefresh,
              icon: RefreshCw,
            }
          : undefined
      }
      secondaryAction={
        onViewAll
          ? {
              label: "View All Leads",
              onClick: onViewAll,
            }
          : undefined
      }
    />
  );
}
