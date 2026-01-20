// @ts-nocheck
"use client";

import { cn } from "@/lib/utils";
import type { ProcurementSummary as ProcurementSummaryType } from "@/lib/types/board";
import {
  FileText,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Building2,
  Banknote,
} from "lucide-react";

interface ProcurementSummaryProps {
  data: ProcurementSummaryType;
  className?: string;
}

/**
 * Procurement Summary Card
 *
 * Shows sector-wide procurement stats:
 * - Total active contract value
 * - Live tenders count
 * - Awards this month
 * - Expiring soon (next 90 days)
 */
export function ProcurementSummary({
  data,
  className,
}: ProcurementSummaryProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/40 bg-card/30 p-4",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-4 w-4 text-info" />
        <h3 className="text-sm font-medium text-foreground">
          Procurement Overview
        </h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Total Active Value */}
        <StatCard
          icon={<Banknote className="h-4 w-4" />}
          label="Active Contract Value"
          value={formatValue(data.totalActiveValue)}
          highlight="success"
        />

        {/* Live Tenders */}
        <StatCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Live Tenders"
          value={data.liveTenderCount.toString()}
          highlight={data.liveTenderCount > 0 ? "warning" : undefined}
        />

        {/* Awards This Month */}
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Awards (This Month)"
          value={data.awardsThisMonth.toString()}
          highlight={data.awardsThisMonth > 0 ? "info" : undefined}
        />

        {/* Expiring Soon */}
        <StatCard
          icon={<Calendar className="h-4 w-4" />}
          label="Expiring (90 Days)"
          value={data.expiringSoon.toString()}
          highlight={data.expiringSoon > 0 ? "warning" : undefined}
        />

        {/* Forces with Contracts */}
        <StatCard
          icon={<Building2 className="h-4 w-4" />}
          label="Forces with Contracts"
          value={data.forcesWithContracts.toString()}
        />

        {/* Average Contract Value */}
        <StatCard
          icon={<Banknote className="h-4 w-4" />}
          label="Avg Contract Value"
          value={formatValue(data.averageContractValue)}
        />
      </div>
    </div>
  );
}

/**
 * Individual stat card
 */
function StatCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: "success" | "warning" | "info" | "danger";
}) {
  return (
    <div className="rounded-md bg-surface-1/30 p-3 border border-surface-1">
      <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div
        className={cn(
          "text-xl font-bold font-mono tabular-nums",
          highlight === "success" && "text-success",
          highlight === "warning" && "text-warning",
          highlight === "info" && "text-info",
          highlight === "danger" && "text-danger",
          !highlight && "text-foreground"
        )}
      >
        {value}
      </div>
    </div>
  );
}

/**
 * Skeleton loader
 */
export function ProcurementSummarySkeleton() {
  return (
    <div className="rounded-lg border border-border/40 bg-card/30 p-4 animate-pulse">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-4 w-4 rounded bg-muted" />
        <div className="h-4 w-40 rounded bg-muted" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-md bg-surface-1/30 p-3 border border-surface-1">
            <div className="h-3 w-24 rounded bg-muted mb-2" />
            <div className="h-6 w-16 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Format currency value
 */
function formatValue(value: number): string {
  if (value >= 1000000) {
    return `£${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `£${(value / 1000).toFixed(0)}K`;
  }
  if (value === 0) {
    return "£0";
  }
  return `£${value.toLocaleString()}`;
}
