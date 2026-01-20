// @ts-nocheck
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ForceSegment } from "@/lib/types/opportunity";
import { Wrench, Handshake, Users, RefreshCw } from "lucide-react";

interface SegmentBreakdownProps {
  counts: Record<ForceSegment, number>;
  activeSegment: ForceSegment | null;
  onSegmentClick: (segment: ForceSegment | null) => void;
  className?: string;
}

/**
 * Segment Breakdown Component
 *
 * Shows 4 segment cards from the propensity model:
 * - FIXERS: Urgent needs, high propensity (red)
 * - STRATEGIC PARTNERS: Open to collaboration (green)
 * - COLLABORATORS: Steady relationships (blue)
 * - RECOVERERS: Watching for opportunity (orange)
 *
 * Click to filter the force list by segment.
 */
export function SegmentBreakdown({
  counts,
  activeSegment,
  onSegmentClick,
  className,
}: SegmentBreakdownProps) {
  const segments: Array<{
    key: ForceSegment;
    label: string;
    shortLabel: string;
    description: string;
    icon: React.ReactNode;
    colorClass: string;
    bgClass: string;
    borderClass: string;
  }> = [
    {
      key: "fixer",
      label: "FIXERS",
      shortLabel: "High Urgency",
      description: "Forces with active HMICFRS concerns or urgent needs",
      icon: <Wrench className="h-5 w-5" />,
      colorClass: "text-danger",
      bgClass: "bg-danger/10",
      borderClass: "border-danger",
    },
    {
      key: "strategic_partner",
      label: "STRATEGIC",
      shortLabel: "Open",
      description: "Forces with high propensity and active engagement",
      icon: <Handshake className="h-5 w-5" />,
      colorClass: "text-success",
      bgClass: "bg-success/10",
      borderClass: "border-success",
    },
    {
      key: "collaborator",
      label: "COLLABORATORS",
      shortLabel: "Steady",
      description: "Forces with established relationships",
      icon: <Users className="h-5 w-5" />,
      colorClass: "text-info",
      bgClass: "bg-info/10",
      borderClass: "border-info",
    },
    {
      key: "recoverer",
      label: "RECOVERERS",
      shortLabel: "Watch",
      description: "Forces recovering from issues or rebuilding",
      icon: <RefreshCw className="h-5 w-5" />,
      colorClass: "text-warning",
      bgClass: "bg-warning/10",
      borderClass: "border-warning",
    },
  ];

  const handleClick = (segment: ForceSegment) => {
    // Toggle off if clicking active segment
    if (activeSegment === segment) {
      onSegmentClick(null);
    } else {
      onSegmentClick(segment);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-medium text-muted uppercase tracking-wider">
        Segment Breakdown
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {segments.map((seg) => (
          <SegmentCard
            key={seg.key}
            segment={seg}
            count={counts[seg.key] || 0}
            isActive={activeSegment === seg.key}
            onClick={() => handleClick(seg.key)}
          />
        ))}
      </div>
    </div>
  );
}

interface SegmentCardProps {
  segment: {
    key: ForceSegment;
    label: string;
    shortLabel: string;
    description: string;
    icon: React.ReactNode;
    colorClass: string;
    bgClass: string;
    borderClass: string;
  };
  count: number;
  isActive: boolean;
  onClick: () => void;
}

function SegmentCard({ segment, count, isActive, onClick }: SegmentCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        "bg-surface-0 border-surface-1",
        isActive && [segment.bgClass, segment.borderClass, "border-2"]
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center space-y-2">
          {/* Icon */}
          <div className={cn("p-2 rounded-lg", segment.bgClass)}>
            <span className={segment.colorClass}>{segment.icon}</span>
          </div>

          {/* Label */}
          <div className="space-y-0.5">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">
              {segment.label}
            </span>
          </div>

          {/* Count */}
          <span
            className={cn(
              "text-3xl font-semibold font-mono tabular-nums",
              segment.colorClass
            )}
          >
            {count}
          </span>

          {/* Status */}
          <span
            className={cn(
              "text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full",
              segment.bgClass,
              segment.colorClass
            )}
          >
            {segment.shortLabel}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact segment pills for filtering
 */
export function SegmentFilter({
  counts,
  activeSegment,
  onSegmentClick,
  className,
}: SegmentBreakdownProps) {
  const segments: Array<{
    key: ForceSegment;
    label: string;
    colorClass: string;
    bgClass: string;
  }> = [
    {
      key: "fixer",
      label: "Fixers",
      colorClass: "text-danger",
      bgClass: "bg-danger/10 hover:bg-danger/20",
    },
    {
      key: "strategic_partner",
      label: "Strategic",
      colorClass: "text-success",
      bgClass: "bg-success/10 hover:bg-success/20",
    },
    {
      key: "collaborator",
      label: "Collaborators",
      colorClass: "text-info",
      bgClass: "bg-info/10 hover:bg-info/20",
    },
    {
      key: "recoverer",
      label: "Recoverers",
      colorClass: "text-warning",
      bgClass: "bg-warning/10 hover:bg-warning/20",
    },
  ];

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {segments.map((seg) => (
        <button
          key={seg.key}
          onClick={() =>
            onSegmentClick(activeSegment === seg.key ? null : seg.key)
          }
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
            seg.bgClass,
            seg.colorClass,
            activeSegment === seg.key && "ring-2 ring-offset-1 ring-current"
          )}
        >
          {seg.label}
          <span className="ml-1.5 font-mono">({counts[seg.key] || 0})</span>
        </button>
      ))}
      {activeSegment && (
        <button
          onClick={() => onSegmentClick(null)}
          className="px-3 py-1.5 rounded-full text-sm font-medium text-muted hover:text-secondary transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}
