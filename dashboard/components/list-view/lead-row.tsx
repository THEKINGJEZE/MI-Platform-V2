// @ts-nocheck
"use client";

import { Lead, SignalType } from "@/lib/types/lead";
import { Badge, PriorityBadge, ForceTypeBadge, AdmiraltyBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Mail,
  SkipForward,
  Flame,
  Clock,
  TrendingUp,
  RefreshCw,
  Shield,
  FileText,
  Eye,
  MoreHorizontal,
} from "lucide-react";

interface LeadRowProps {
  lead: Lead;
  isSelected?: boolean;
  onSelect: (leadId: string) => void;
  onAction: (leadId: string, channel: "email" | "phone" | "linkedin") => void;
  onSkip: (leadId: string) => void;
  className?: string;
}

const signalIcons: Record<SignalType, React.ComponentType<{ className?: string }>> = {
  hiring_surge: Flame,
  followup_due: Clock,
  signal_spike: TrendingUp,
  re_engaged: RefreshCw,
  competitor_activity: Eye,
  procurement_notice: FileText,
  vetting_requirement: Shield,
};

const signalLabels: Record<SignalType, string> = {
  hiring_surge: "Surge",
  followup_due: "Follow-up",
  signal_spike: "Spike",
  re_engaged: "Re-engaged",
  competitor_activity: "Competitor",
  procurement_notice: "Procurement",
  vetting_requirement: "Vetting",
};

export function LeadRow({
  lead,
  isSelected,
  onSelect,
  onAction,
  onSkip,
  className,
}: LeadRowProps) {
  // Contact confidence indicator
  const confidenceColors = {
    high: "bg-success",
    medium: "bg-action",
    low: "bg-warning",
    none: "bg-muted",
  };

  // Time ago formatter
  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  };

  // Score delta display
  const scoreDelta = lead.scorePrev ? lead.score - lead.scorePrev : 0;

  return (
    <tr
      className={cn(
        "group border-b border-surface-1 hover:bg-surface-0 transition-colors cursor-pointer",
        isSelected && "bg-surface-1 border-l-2 border-l-action",
        className
      )}
      onClick={() => onSelect(lead.id)}
    >
      {/* Organisation */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-primary">{lead.organisationName}</span>
          <span className="text-xs text-muted">{lead.leadType}</span>
        </div>
      </td>

      {/* Force Type */}
      <td className="px-4 py-3">
        <ForceTypeBadge type={lead.forceContext.forceType} />
      </td>

      {/* Score */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold text-lg tabular-nums">
            {lead.score}
          </span>
          {scoreDelta !== 0 && (
            <span
              className={cn(
                "text-xs font-medium",
                scoreDelta > 0 ? "text-success" : "text-danger"
              )}
            >
              {scoreDelta > 0 ? "+" : ""}
              {scoreDelta}
            </span>
          )}
          <PriorityBadge priority={lead.priority} />
        </div>
      </td>

      {/* Signal Badges (max 3) */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {lead.signals.slice(0, 3).map((signal) => {
            const Icon = signalIcons[signal.type];
            return (
              <div
                key={signal.id}
                className="flex items-center gap-1 px-2 py-0.5 bg-surface-1 rounded-full"
              >
                <Icon className="size-3 text-secondary" />
                <span className="text-xs text-secondary">
                  {signalLabels[signal.type]}
                </span>
                <AdmiraltyBadge code={signal.confidence} />
              </div>
            );
          })}
          {lead.signals.length > 3 && (
            <Badge variant="outline">+{lead.signals.length - 3}</Badge>
          )}
        </div>
      </td>

      {/* Contact */}
      <td className="px-4 py-3">
        {lead.contact ? (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "size-2 rounded-full shrink-0",
                confidenceColors[lead.contact.confidence]
              )}
              title={`${lead.contact.confidence} confidence`}
            />
            <div className="flex flex-col">
              <span className="text-sm text-primary">{lead.contact.name}</span>
              {lead.contact.title && (
                <span className="text-xs text-muted truncate max-w-[150px]">
                  {lead.contact.title}
                </span>
              )}
            </div>
          </div>
        ) : (
          <span className="text-xs text-muted">No contact</span>
        )}
      </td>

      {/* Last Activity */}
      <td className="px-4 py-3">
        <span className="text-sm text-muted">{formatTimeAgo(lead.updatedAt)}</span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAction(lead.id, "email");
            }}
            title="Send email"
          >
            <Mail className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSkip(lead.id);
            }}
            title="Skip"
          >
            <SkipForward className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => e.stopPropagation()}
            title="More actions"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
