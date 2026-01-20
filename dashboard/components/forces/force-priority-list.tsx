// @ts-nocheck
"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Force, ForceSegment } from "@/lib/types/opportunity";
import { ForceRow } from "./force-row";
import { ForceDetailCard } from "./force-detail-card";
import {
  Search,
  SortAsc,
  SortDesc,
  ArrowUpDown,
  Building2,
} from "lucide-react";

interface ForcePriorityListProps {
  forces: Force[];
  selectedForceId: string | null;
  expandedForceId: string | null;
  onForceSelect: (forceId: string | null) => void;
  onForceExpand: (forceId: string | null) => void;
  // Filters
  searchQuery: string;
  onSearchChange: (query: string) => void;
  regionFilter: string | null;
  onRegionChange: (region: string | null) => void;
  segmentFilter: ForceSegment | null;
  onSegmentChange: (segment: ForceSegment | null) => void;
  hmicfrsFilter: string | null;
  onHmicfrsChange: (status: string | null) => void;
  // Sort
  sortField: string;
  sortDirection: "asc" | "desc";
  onSortChange: (field: string) => void;
  // Options
  regions: string[];
  hmicfrsStatuses: string[];
  className?: string;
}

/**
 * Force Priority List Component
 *
 * Displays ranked list of all forces with:
 * - Search and filter controls
 * - Sortable columns
 * - Expandable rows with ForceDetailCard
 * - Keyboard navigation support
 */
export function ForcePriorityList({
  forces,
  selectedForceId,
  expandedForceId,
  onForceSelect,
  onForceExpand,
  searchQuery,
  onSearchChange,
  regionFilter,
  onRegionChange,
  segmentFilter,
  onSegmentChange,
  hmicfrsFilter,
  onHmicfrsChange,
  sortField,
  sortDirection,
  onSortChange,
  regions,
  hmicfrsStatuses,
  className,
}: ForcePriorityListProps) {
  const handleSortClick = (field: string) => {
    onSortChange(field);
  };

  const hasActiveFilters = !!(
    searchQuery ||
    regionFilter ||
    segmentFilter ||
    hmicfrsFilter
  );

  return (
    <Card className={cn("bg-surface-0 border-surface-1", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted" />
            <CardTitle className="text-lg">Force Priority List</CardTitle>
          </div>
          <span className="text-sm text-muted">
            Showing {forces.length} force{forces.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3 pt-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <Input
              placeholder="Search forces..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
              className="pl-9 bg-surface-1 border-surface-2"
            />
          </div>

          {/* Region Filter */}
          <Select
            value={regionFilter || "all"}
            onValueChange={(v) => onRegionChange(v === "all" ? null : v)}
          >
            <SelectTrigger className="w-[150px] bg-surface-1 border-surface-2">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Segment Filter */}
          <Select
            value={segmentFilter || "all"}
            onValueChange={(v) =>
              onSegmentChange(v === "all" ? null : (v as ForceSegment))
            }
          >
            <SelectTrigger className="w-[150px] bg-surface-1 border-surface-2">
              <SelectValue placeholder="Segment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Segments</SelectItem>
              <SelectItem value="fixer">Fixer</SelectItem>
              <SelectItem value="strategic_partner">Strategic Partner</SelectItem>
              <SelectItem value="collaborator">Collaborator</SelectItem>
              <SelectItem value="recoverer">Recoverer</SelectItem>
            </SelectContent>
          </Select>

          {/* HMICFRS Filter */}
          <Select
            value={hmicfrsFilter || "all"}
            onValueChange={(v) => onHmicfrsChange(v === "all" ? null : v)}
          >
            <SelectTrigger className="w-[150px] bg-surface-1 border-surface-2">
              <SelectValue placeholder="HMICFRS" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {hmicfrsStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                onSearchChange("");
                onRegionChange(null);
                onSegmentChange(null);
                onHmicfrsChange(null);
              }}
              className="text-sm text-muted hover:text-secondary transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Table Header */}
        <div className="flex items-center gap-4 px-4 py-2 border-b border-surface-1 bg-surface-1/30 text-xs font-medium text-muted uppercase tracking-wider">
          <SortHeader
            label="Rank"
            field="priorityRank"
            currentField={sortField}
            direction={sortDirection}
            onClick={handleSortClick}
            className="w-12"
          />
          <SortHeader
            label="Force"
            field="name"
            currentField={sortField}
            direction={sortDirection}
            onClick={handleSortClick}
            className="flex-1"
          />
          <span className="w-24 hidden md:block">Type</span>
          <span className="w-28">Segment</span>
          <span className="w-24 hidden lg:block">HMICFRS</span>
          <SortHeader
            label="Propensity"
            field="propensityScore"
            currentField={sortField}
            direction={sortDirection}
            onClick={handleSortClick}
            className="w-24 hidden md:block"
          />
          <SortHeader
            label="Relation"
            field="relationshipScore"
            currentField={sortField}
            direction={sortDirection}
            onClick={handleSortClick}
            className="w-24 hidden lg:block"
          />
          <span className="w-16 text-center hidden md:block">Signals</span>
          <span className="w-8" />
        </div>

        {/* Force Rows */}
        <div className="divide-y divide-surface-1" role="table">
          {forces.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted">
              <Building2 className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-lg font-medium">No forces found</p>
              <p className="text-sm">
                {hasActiveFilters
                  ? "Try adjusting your filters"
                  : "No force data available"}
              </p>
            </div>
          ) : (
            forces.map((force, index) => (
              <div key={force.id}>
                <ForceRow
                  force={force}
                  rank={force.priorityRank || index + 1}
                  isExpanded={expandedForceId === force.id}
                  isSelected={selectedForceId === force.id}
                  onExpand={() =>
                    onForceExpand(
                      expandedForceId === force.id ? null : force.id
                    )
                  }
                  onSelect={() =>
                    onForceSelect(
                      selectedForceId === force.id ? null : force.id
                    )
                  }
                />
                {/* Expanded Detail */}
                {expandedForceId === force.id && (
                  <div className="bg-surface-1/20 border-t border-surface-1 p-4">
                    <ForceDetailCard force={force} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Sortable column header
 */
function SortHeader({
  label,
  field,
  currentField,
  direction,
  onClick,
  className,
}: {
  label: string;
  field: string;
  currentField: string;
  direction: "asc" | "desc";
  onClick: (field: string) => void;
  className?: string;
}) {
  const isActive = currentField === field;

  return (
    <button
      onClick={() => onClick(field)}
      className={cn(
        "flex items-center gap-1 hover:text-secondary transition-colors",
        isActive && "text-primary",
        className
      )}
    >
      {label}
      {isActive ? (
        direction === "asc" ? (
          <SortAsc className="h-3 w-3" />
        ) : (
          <SortDesc className="h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      )}
    </button>
  );
}
