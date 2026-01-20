// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { FileText, Building2, Calendar, AlertTriangle, Loader2, ExternalLink } from "lucide-react";
import type { ForceContractContext, Contract } from "@/lib/types/opportunity";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ForceContractsTabProps {
  forceId: string;
  className?: string;
}

/**
 * Force Contracts Tab - Shows contract intelligence for a force
 *
 * Displays:
 * - Summary stats (total value, contract count, live tenders)
 * - Active contracts list with supplier, value, expiry
 * - Live tenders with deadlines
 */
export function ForceContractsTab({ forceId, className }: ForceContractsTabProps) {
  const [data, setData] = useState<ForceContractContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/forces/${forceId}/contracts`);
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || "Failed to fetch contracts");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch contracts");
      } finally {
        setLoading(false);
      }
    }

    if (forceId) {
      fetchData();
    }
  }, [forceId]);

  // Loading state
  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
        <span className="ml-2 text-muted">Loading contract intelligence...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  // No data
  if (!data) {
    return (
      <div className={cn("text-center py-8", className)}>
        <FileText className="h-12 w-12 text-muted mx-auto mb-3 opacity-50" />
        <p className="text-muted">No contract data available</p>
      </div>
    );
  }

  const hasContracts = data.activeContracts.length > 0;
  const hasTenders = data.liveTenders.length > 0;

  // Empty state
  if (!hasContracts && !hasTenders) {
    return (
      <div className={cn("text-center py-8", className)}>
        <FileText className="h-12 w-12 text-muted mx-auto mb-3 opacity-50" />
        <p className="text-lg font-medium text-secondary">No contract intelligence</p>
        <p className="text-sm text-muted">No contracts or tenders found for this force</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Active Contracts"
          value={data.activeContracts.length}
          icon={<FileText className="h-4 w-4" />}
        />
        <StatCard
          label="Total Value"
          value={formatValue(data.totalActiveValue)}
          icon={<Building2 className="h-4 w-4" />}
          highlight={data.totalActiveValue > 1000000 ? "success" : undefined}
        />
        <StatCard
          label="Live Tenders"
          value={data.liveTenderCount}
          icon={<AlertTriangle className="h-4 w-4" />}
          highlight={data.liveTenderCount > 0 ? "warning" : undefined}
        />
        <StatCard
          label="Next Expiry"
          value={data.nextExpiry ? formatExpiry(data.nextExpiry) : "—"}
          icon={<Calendar className="h-4 w-4" />}
          highlight={
            data.nextExpiry && isExpiringSoon(data.nextExpiry) ? "warning" : undefined
          }
        />
      </div>

      {/* Primary Supplier */}
      {data.primarySupplier && (
        <div className="p-4 rounded-lg bg-surface-1/30 border border-surface-1">
          <div className="flex items-center gap-2 text-muted text-xs uppercase tracking-wider mb-2">
            <Building2 className="h-3 w-3" />
            Primary Supplier
          </div>
          <p className="text-lg font-medium text-primary">{data.primarySupplier}</p>
        </div>
      )}

      {/* Live Tenders */}
      {hasTenders && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Live Tenders ({data.liveTenders.length})
          </h4>
          <div className="space-y-2">
            {data.liveTenders.map((tender) => (
              <ContractRow key={tender.id} contract={tender} type="tender" />
            ))}
          </div>
        </div>
      )}

      {/* Active Contracts */}
      {hasContracts && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted uppercase tracking-wider flex items-center gap-2">
            <FileText className="h-4 w-4 text-info" />
            Active Contracts ({data.activeContracts.length})
          </h4>
          <div className="space-y-2">
            {data.activeContracts.map((contract) => (
              <ContractRow key={contract.id} contract={contract} type="contract" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Stat Card
 */
function StatCard({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  highlight?: "success" | "warning" | "danger";
}) {
  return (
    <div className="p-3 rounded-lg bg-surface-1/30 border border-surface-1">
      <div className="flex items-center gap-1.5 text-muted text-xs uppercase tracking-wider mb-1">
        {icon}
        {label}
      </div>
      <p
        className={cn(
          "text-xl font-semibold font-mono tabular-nums",
          highlight === "success" && "text-success",
          highlight === "warning" && "text-warning",
          highlight === "danger" && "text-danger",
          !highlight && "text-primary"
        )}
      >
        {value}
      </p>
    </div>
  );
}

/**
 * Contract/Tender Row
 */
function ContractRow({
  contract,
  type,
}: {
  contract: Contract;
  type: "contract" | "tender";
}) {
  const isTender = type === "tender";

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-3 rounded-lg",
        isTender
          ? "bg-warning/5 border border-warning/20"
          : "bg-surface-1/30 border border-surface-1"
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-primary truncate">
          {contract.title || contract.contractId}
        </p>
        <div className="flex items-center gap-3 text-xs text-muted mt-1">
          {contract.supplierName && (
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {contract.supplierName}
            </span>
          )}
          {contract.serviceType && (
            <Badge variant="outline" className="text-[10px]">
              {contract.serviceType}
            </Badge>
          )}
        </div>
      </div>

      {/* Value */}
      {contract.contractValue && contract.contractValue > 0 && (
        <div className="text-right">
          <p className="font-mono font-semibold text-success">
            £{formatValue(contract.contractValue)}
          </p>
          <p className="text-[10px] text-muted uppercase">Value</p>
        </div>
      )}

      {/* Date */}
      <div className="text-right w-24">
        <p
          className={cn(
            "text-sm font-medium",
            isTender
              ? "text-warning"
              : contract.endDate && isExpiringSoon(contract.endDate)
              ? "text-warning"
              : "text-secondary"
          )}
        >
          {isTender
            ? contract.endDate
              ? formatExpiry(contract.endDate)
              : "Open"
            : contract.endDate
            ? formatExpiry(contract.endDate)
            : "—"}
        </p>
        <p className="text-[10px] text-muted uppercase">
          {isTender ? "Deadline" : "Expires"}
        </p>
      </div>

      {/* Link */}
      {contract.sourceUrl && (
        <a
          href={contract.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted hover:text-action transition-colors"
          title="View source"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}

/**
 * Format currency value
 */
function formatValue(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toLocaleString();
}

/**
 * Format date relative to now
 */
function formatExpiry(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Expired";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 30) return `${diffDays}d`;
  if (diffDays < 365) {
    const months = Math.ceil(diffDays / 30);
    return `${months}mo`;
  }
  return date.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
}

/**
 * Check if date is within 90 days
 */
function isExpiringSoon(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  return diffMs > 0 && diffMs < 90 * 24 * 60 * 60 * 1000;
}
