// @ts-nocheck
"use client";

import { useState, useMemo } from "react";
import { Lead, QueueMode } from "@/lib/types/lead";
import { LeadRow } from "./lead-row";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronUp,
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

type SortField = "organisation" | "score" | "forceType" | "lastActivity";
type SortDirection = "asc" | "desc";

interface LeadTableProps {
  leads: Lead[];
  queueMode: QueueMode;
  currentLeadId?: string;
  onSelectLead: (leadId: string) => void;
  onAction: (leadId: string, channel: "email" | "phone" | "linkedin") => void;
  onSkip: (leadId: string) => void;
  onQueueModeChange: (mode: QueueMode) => void;
  className?: string;
}

const ITEMS_PER_PAGE = 20;

const queueModes: { value: QueueMode; label: string }[] = [
  { value: "priority", label: "Priority" },
  { value: "recent", label: "Recent" },
  { value: "todays_3", label: "Today's 3" },
  { value: "all", label: "All" },
];

export function LeadTable({
  leads,
  queueMode,
  currentLeadId,
  onSelectLead,
  onAction,
  onSkip,
  onQueueModeChange,
  className,
}: LeadTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("score");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter leads by search query
  const filteredLeads = useMemo(() => {
    if (!searchQuery.trim()) return leads;

    const query = searchQuery.toLowerCase();
    return leads.filter(
      (lead) =>
        lead.organisationName.toLowerCase().includes(query) ||
        lead.contact?.name.toLowerCase().includes(query) ||
        lead.leadType.toLowerCase().includes(query)
    );
  }, [leads, searchQuery]);

  // Sort leads
  const sortedLeads = useMemo(() => {
    return [...filteredLeads].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "organisation":
          comparison = a.organisationName.localeCompare(b.organisationName);
          break;
        case "score":
          comparison = a.score - b.score;
          break;
        case "forceType":
          comparison = a.forceContext.forceType.localeCompare(b.forceContext.forceType);
          break;
        case "lastActivity":
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredLeads, sortField, sortDirection]);

  // Paginate leads
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedLeads.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedLeads, currentPage]);

  const totalPages = Math.ceil(sortedLeads.length / ITEMS_PER_PAGE);

  // Separate error bucket leads
  const errorLeads = leads.filter((lead) => lead.status === "flagged");

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  };

  // Sort indicator
  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="size-4" />
    ) : (
      <ChevronDown className="size-4" />
    );
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Queue Mode Tabs + Search */}
      <div className="flex items-center justify-between gap-4">
        {/* Queue Mode Tabs */}
        <div className="flex items-center gap-1 bg-surface-0 rounded-lg p-1">
          {queueModes.map((mode) => (
            <button
              key={mode.value}
              onClick={() => {
                onQueueModeChange(mode.value);
                setCurrentPage(1);
              }}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                queueMode === mode.value
                  ? "bg-surface-1 text-primary"
                  : "text-muted hover:text-secondary"
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 pr-4 py-2 bg-surface-0 border border-surface-1 rounded-lg text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-0 rounded-lg border border-surface-1 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-1 bg-surface-1/50">
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide cursor-pointer hover:text-secondary"
                onClick={() => handleSort("organisation")}
              >
                <div className="flex items-center gap-1">
                  Organisation
                  <SortIndicator field="organisation" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide cursor-pointer hover:text-secondary"
                onClick={() => handleSort("forceType")}
              >
                <div className="flex items-center gap-1">
                  Force Type
                  <SortIndicator field="forceType" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide cursor-pointer hover:text-secondary"
                onClick={() => handleSort("score")}
              >
                <div className="flex items-center gap-1">
                  Score
                  <SortIndicator field="score" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">
                Signals
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">
                Contact
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide cursor-pointer hover:text-secondary"
                onClick={() => handleSort("lastActivity")}
              >
                <div className="flex items-center gap-1">
                  Last Activity
                  <SortIndicator field="lastActivity" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedLeads.map((lead) => (
              <LeadRow
                key={lead.id}
                lead={lead}
                isSelected={lead.id === currentLeadId}
                onSelect={onSelectLead}
                onAction={onAction}
                onSkip={onSkip}
              />
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {paginatedLeads.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted">No leads found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, sortedLeads.length)} of{" "}
            {sortedLeads.length} leads
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <span className="text-sm text-secondary">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Error Bucket */}
      {errorLeads.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="size-4 text-warning" />
            <h3 className="text-sm font-semibold text-secondary">
              Error Bucket ({errorLeads.length})
            </h3>
          </div>
          <div className="bg-warning-muted/20 border border-warning/20 rounded-lg p-4">
            <p className="text-sm text-secondary mb-3">
              These leads have validation issues that need resolution:
            </p>
            <ul className="space-y-2">
              {errorLeads.slice(0, 5).map((lead) => (
                <li
                  key={lead.id}
                  className="flex items-center justify-between bg-surface-0 rounded-md px-3 py-2"
                >
                  <span className="text-sm text-primary">
                    {lead.organisationName}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectLead(lead.id)}
                  >
                    Review
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
