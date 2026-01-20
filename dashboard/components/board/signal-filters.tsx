// @ts-nocheck
"use client";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SignalFilterOptions, SignalFilters } from "@/lib/types/board";

interface SignalFiltersProps {
  filterOptions: SignalFilterOptions;
  currentFilters: SignalFilters;
  onFilterChange: (filters: SignalFilters) => void;
  className?: string;
}

export function SignalFiltersBar({
  filterOptions,
  currentFilters,
  onFilterChange,
  className,
}: SignalFiltersProps) {
  const handleTypeChange = (value: string) => {
    onFilterChange({
      ...currentFilters,
      signalType: value === "all" ? undefined : value,
      offset: 0, // Reset pagination on filter change
    });
  };

  const handleOrgChange = (value: string) => {
    onFilterChange({
      ...currentFilters,
      organisationId: value === "all" ? undefined : value,
      offset: 0,
    });
  };

  const handleRegionChange = (value: string) => {
    onFilterChange({
      ...currentFilters,
      region: value === "all" ? undefined : value,
      offset: 0,
    });
  };

  const handleDateChange = (value: string) => {
    const now = new Date();
    let dateFrom: string | undefined;

    switch (value) {
      case "7d":
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        break;
      case "30d":
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        break;
      case "90d":
        dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        break;
      case "all":
      default:
        dateFrom = undefined;
    }

    onFilterChange({
      ...currentFilters,
      dateFrom,
      offset: 0,
    });
  };

  const handleSeverityChange = (value: string) => {
    onFilterChange({
      ...currentFilters,
      severity: value === "all" ? undefined : (value as "critical" | "warning" | "info"),
      offset: 0,
    });
  };

  // Determine current date range value
  const getDateRangeValue = () => {
    if (!currentFilters.dateFrom) return "all";
    const now = new Date();
    const from = new Date(currentFilters.dateFrom);
    const diffDays = Math.round((now.getTime() - from.getTime()) / (24 * 60 * 60 * 1000));
    if (diffDays <= 7) return "7d";
    if (diffDays <= 30) return "30d";
    if (diffDays <= 90) return "90d";
    return "all";
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {/* Signal Type Filter */}
      <Select
        value={currentFilters.signalType || "all"}
        onValueChange={handleTypeChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Signal Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {filterOptions.signalTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.value} ({type.count})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Organisation Filter */}
      <Select
        value={currentFilters.organisationId || "all"}
        onValueChange={handleOrgChange}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Force" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Forces</SelectItem>
          {filterOptions.organisations.map((org) => (
            <SelectItem key={org.id} value={org.id}>
              {org.name} ({org.count})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Region Filter */}
      <Select
        value={currentFilters.region || "all"}
        onValueChange={handleRegionChange}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Region" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Regions</SelectItem>
          {filterOptions.regions.map((region) => (
            <SelectItem key={region.value} value={region.value}>
              {region.value} ({region.count})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date Range Filter */}
      <Select
        value={getDateRangeValue()}
        onValueChange={handleDateChange}
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Date Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="90d">Last 90 days</SelectItem>
          <SelectItem value="all">All time</SelectItem>
        </SelectContent>
      </Select>

      {/* Severity Filter */}
      <Select
        value={currentFilters.severity || "all"}
        onValueChange={handleSeverityChange}
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Severity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Severity</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
          <SelectItem value="warning">Warning</SelectItem>
          <SelectItem value="info">Info</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * Skeleton for filters
 */
export function SignalFiltersSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-3 animate-pulse">
      <div className="h-10 w-[180px] bg-surface-1 rounded-md" />
      <div className="h-10 w-[200px] bg-surface-1 rounded-md" />
      <div className="h-10 w-[150px] bg-surface-1 rounded-md" />
      <div className="h-10 w-[130px] bg-surface-1 rounded-md" />
      <div className="h-10 w-[130px] bg-surface-1 rounded-md" />
    </div>
  );
}
