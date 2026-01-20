// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, SegmentBadge, HmicfrsBadge, PriorityBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Force, Opportunity } from "@/lib/types/opportunity";
import {
  Building2,
  Users,
  MapPin,
  Clock,
  FileText,
  ExternalLink,
  Plus,
  TrendingUp,
  Calendar,
  Target,
  ChevronRight,
  LayoutDashboard,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import { ForceContractsTab } from "./force-contracts-tab";

// Tab type
type ForceDetailTab = "overview" | "contracts" | "opportunities";

interface ForceDetailCardProps {
  force: Force;
  opportunities?: Opportunity[];
  className?: string;
}

/**
 * Force Detail Card Component
 *
 * Expanded view showing full force details:
 * - Key metrics (propensity, relationship scores)
 * - Contact and framework status
 * - Active opportunities
 * - Recent signals
 * - Action buttons
 */
export function ForceDetailCard({
  force,
  opportunities: initialOpportunities,
  className,
}: ForceDetailCardProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(
    initialOpportunities || []
  );
  const [loading, setLoading] = useState(!initialOpportunities);
  const [activeTab, setActiveTab] = useState<ForceDetailTab>("overview");

  // Fetch opportunities if not provided
  useEffect(() => {
    if (initialOpportunities) return;

    const fetchOpportunities = async () => {
      try {
        const response = await fetch(`/api/forces/${force.id}`);
        if (response.ok) {
          const data = await response.json();
          setOpportunities(data.data?.opportunities || []);
        }
      } catch (error) {
        console.error("Failed to fetch opportunities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, [force.id, initialOpportunities]);

  // Tab definitions
  const tabs: { key: ForceDetailTab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
    { key: "contracts", label: "Contracts", icon: <FileText className="h-4 w-4" /> },
    { key: "opportunities", label: "Opportunities", icon: <Briefcase className="h-4 w-4" /> },
  ];

  return (
    <Card className={cn("bg-surface-0 border-surface-1", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{force.name}</CardTitle>
            {force.shortName && (
              <p className="text-sm text-muted">{force.shortName}</p>
            )}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-muted">
                Rank: #{force.priorityRank || "—"} / 50
              </span>
            </div>
          </div>
          {/* Propensity Score */}
          <div className="text-right">
            <span className="text-3xl font-semibold font-mono tabular-nums text-primary">
              {force.propensityScore || 0}
            </span>
            <p className="text-xs text-muted">Propensity</p>
          </div>
        </div>
      </CardHeader>

      {/* Tab Navigation */}
      <div className="border-b border-surface-1 px-6">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab === tab.key
                  ? "border-action text-action"
                  : "border-transparent text-muted hover:text-secondary hover:border-surface-2"
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.key === "opportunities" && opportunities.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-surface-1 text-muted">
                  {opportunities.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <CardContent className="space-y-6">
        {/* Contracts Tab */}
        {activeTab === "contracts" && (
          <ForceContractsTab forceId={force.id} />
        )}

        {/* Opportunities Tab */}
        {activeTab === "opportunities" && (
          <OpportunitiesTabContent
            opportunities={opportunities}
            loading={loading}
            forceId={force.id}
          />
        )}

        {/* Overview Tab - Original content */}
        {activeTab === "overview" && (
          <>
        {/* Key Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DetailItem
            icon={<Target className="h-4 w-4" />}
            label="Segment"
            value={
              force.segment ? (
                <SegmentBadge segment={force.segment} />
              ) : (
                "—"
              )
            }
          />
          <DetailItem
            icon={<FileText className="h-4 w-4" />}
            label="HMICFRS"
            value={
              force.hmicfrsStatus ? (
                <HmicfrsBadge status={force.hmicfrsStatus} />
              ) : (
                "N/A"
              )
            }
          />
          <DetailItem
            icon={<TrendingUp className="h-4 w-4" />}
            label="Relationship"
            value={
              <span className="font-mono">
                {force.relationshipScore || 0}/100
              </span>
            }
          />
          <DetailItem
            icon={<MapPin className="h-4 w-4" />}
            label="Region"
            value={force.region || "—"}
          />
          <DetailItem
            icon={<Users className="h-4 w-4" />}
            label="Size"
            value={
              force.sizeTier
                ? force.sizeTier.charAt(0).toUpperCase() + force.sizeTier.slice(1)
                : "—"
            }
          />
          <DetailItem
            icon={<Clock className="h-4 w-4" />}
            label="Last Contact"
            value={
              force.lastContact
                ? formatRelativeDate(force.lastContact)
                : "Never"
            }
          />
          <DetailItem
            icon={<Calendar className="h-4 w-4" />}
            label="Contacts"
            value={force.contactCount?.toString() || "0"}
          />
          <DetailItem
            icon={<Building2 className="h-4 w-4" />}
            label="Officers"
            value={force.officerCount?.toLocaleString() || "—"}
          />
        </div>

        {/* Additional Context */}
        {(force.hmicfrsEngage || force.hmicfrsCauseOfConcern) && (
          <div className="flex flex-wrap gap-2">
            {force.hmicfrsEngage && (
              <Badge className="bg-danger/10 text-danger border-danger">
                Engage Status
              </Badge>
            )}
            {force.hmicfrsCauseOfConcern && (
              <Badge className="bg-warning/10 text-warning border-warning">
                Cause of Concern
              </Badge>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-surface-1" />

        {/* Active Opportunities */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-muted uppercase tracking-wider">
              Active Opportunities ({opportunities.length})
            </h4>
            {opportunities.length > 0 && (
              <Link
                href={`/focus?force=${force.id}`}
                className="text-xs text-action hover:underline flex items-center gap-1"
              >
                View All
                <ChevronRight className="h-3 w-3" />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin h-5 w-5 border-2 border-action border-t-transparent rounded-full" />
            </div>
          ) : opportunities.length === 0 ? (
            <p className="text-sm text-muted py-2">
              No active opportunities. Create one to start engagement.
            </p>
          ) : (
            <div className="space-y-2">
              {opportunities.slice(0, 3).map((opp) => (
                <OpportunityRow key={opp.id} opportunity={opp} />
              ))}
              {opportunities.length > 3 && (
                <p className="text-xs text-muted">
                  +{opportunities.length - 3} more opportunities
                </p>
              )}
            </div>
          )}
        </div>

        {/* Signal Summary */}
        {(force.signalCount90d || 0) > 0 && (
          <>
            <div className="border-t border-surface-1" />
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted uppercase tracking-wider">
                Recent Activity
              </h4>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-info" />
                  <span className="text-secondary">
                    {force.signalCount90d} signals (90 days)
                  </span>
                </div>
                {(force.tenderCount12m || 0) > 0 && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-warning" />
                    <span className="text-secondary">
                      {force.tenderCount12m} tenders (12 months)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
          </>
        )}

        {/* Action Buttons */}
        <div className="border-t border-surface-1 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              className="bg-action hover:bg-action/90 text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Opportunity
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-surface-2 hover:bg-surface-1"
            >
              Log Activity
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-muted hover:text-secondary"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              View in HubSpot
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Detail item with icon and label
 */
function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-muted">
        {icon}
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-sm text-primary font-medium">{value}</div>
    </div>
  );
}

/**
 * Opportunity row in force detail
 */
function OpportunityRow({ opportunity }: { opportunity: Opportunity }) {
  return (
    <Link
      href={`/focus?opportunity=${opportunity.id}`}
      className="flex items-center gap-3 p-2 rounded-md bg-surface-1/30 hover:bg-surface-1/50 transition-colors"
    >
      <PriorityBadge priority={opportunity.priority} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-primary truncate">
          {opportunity.capabilityName || opportunity.title || "Opportunity"}
        </p>
        <p className="text-xs text-muted">
          {opportunity.signalCount} signals
        </p>
      </div>
      <div className="text-right">
        <span className="font-mono font-semibold text-primary">
          {opportunity.primaryScore}
        </span>
        <p className="text-[10px] text-muted uppercase">Score</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted shrink-0" />
    </Link>
  );
}

/**
 * Format relative date
 */
function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Compact version for quick preview
 */
export function ForceDetailCompact({ force }: { force: Force }) {
  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {force.segment && <SegmentBadge segment={force.segment} />}
          {force.hmicfrsStatus && <HmicfrsBadge status={force.hmicfrsStatus} />}
        </div>
        <span className="font-mono font-semibold text-primary">
          {force.propensityScore || 0}
        </span>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted">
        <span>{force.region || "—"}</span>
        <span>{force.sizeTier || "—"}</span>
        <span>
          {force.lastContact
            ? formatRelativeDate(force.lastContact)
            : "No contact"}
        </span>
      </div>
    </div>
  );
}

/**
 * Opportunities Tab Content
 */
function OpportunitiesTabContent({
  opportunities,
  loading,
  forceId,
}: {
  opportunities: Opportunity[];
  loading: boolean;
  forceId: string;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-6 w-6 border-2 border-action border-t-transparent rounded-full" />
        <span className="ml-2 text-muted">Loading opportunities...</span>
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="text-center py-8">
        <Briefcase className="h-12 w-12 text-muted mx-auto mb-3 opacity-50" />
        <p className="text-lg font-medium text-secondary">No active opportunities</p>
        <p className="text-sm text-muted">Create an opportunity to start engagement</p>
        <Link
          href={`/focus?force=${forceId}`}
          className="inline-flex items-center gap-1 mt-4 text-action hover:underline text-sm"
        >
          Go to Focus Mode
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-muted uppercase tracking-wider">
          All Opportunities ({opportunities.length})
        </h4>
        <Link
          href={`/focus?force=${forceId}`}
          className="text-xs text-action hover:underline flex items-center gap-1"
        >
          Open in Focus Mode
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-2">
        {opportunities.map((opp) => (
          <OpportunityRow key={opp.id} opportunity={opp} />
        ))}
      </div>
    </div>
  );
}
