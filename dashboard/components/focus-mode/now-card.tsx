// @ts-nocheck
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge, PriorityBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Opportunity } from "@/lib/types/opportunity";
import {
  Mail,
  Linkedin,
  ChevronRight,
  Building2,
  Clock,
  Lightbulb,
  User,
  TrendingUp,
  Target,
  Calendar,
  ExternalLink,
} from "lucide-react";

interface NowCardProps {
  opportunity: Opportunity;
  className?: string;
}

/**
 * Format relative time for "When" display
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "Last week";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/**
 * Get the primary signal source
 */
function getPrimarySource(opportunity: Opportunity): string {
  if (opportunity.signals && opportunity.signals.length > 0) {
    const sources = [...new Set(opportunity.signals.map((s) => s.source))];
    if (sources.length === 1) return sources[0];
    return `${sources[0]} + ${sources.length - 1} more`;
  }
  return "Unknown";
}

/**
 * Now Card - The primary context display for the current opportunity
 *
 * V2 Simplified Version:
 * - Force name as header
 * - Priority badge
 * - Why Now context (AI-generated)
 * - Signal summary
 * - Contact info
 */
export function NowCard({ opportunity, className }: NowCardProps) {
  return (
    <Card className={cn("bg-surface-0 border-surface-1", className)}>
      <CardHeader className="pb-4">
        {/* Header: Force name + Priority */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1 min-w-0">
            <h2 className="text-[24px] font-semibold text-primary truncate">
              {opportunity.force?.name || opportunity.name}
            </h2>
            {opportunity.name && opportunity.name !== opportunity.force?.name && (
              <p className="text-secondary text-sm">{opportunity.name}</p>
            )}
          </div>

          {/* Priority display */}
          <div className="flex flex-col items-end gap-1">
            <PriorityBadge priority={opportunity.priorityTier} />
            <span className="text-xs text-muted">
              {opportunity.status}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Signal Summary */}
        <div className="flex flex-wrap items-center gap-3 py-3 px-4 rounded-lg bg-surface-1/50">
          <div className="flex items-center gap-1.5 text-sm">
            <TrendingUp className="h-3.5 w-3.5 text-muted" />
            <span className="font-medium text-primary">{opportunity.signalCount}</span>
            <span className="text-secondary">
              {opportunity.signalCount === 1 ? "signal" : "signals"}
            </span>
          </div>
          {opportunity.signalTypes && opportunity.signalTypes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {opportunity.signalTypes.slice(0, 3).map((type, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {type}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Context Capsule: What / Why / Next / When / Source */}
        <div className="space-y-4 p-4 rounded-lg bg-surface-1/30 border border-surface-1">
          {/* WHAT - The task at hand */}
          <ContextRow
            label="What"
            icon={<Target className="h-4 w-4 text-action" />}
          >
            <p className="text-primary text-sm font-medium">
              {opportunity.signalCount === 1
                ? `1 signal detected for ${opportunity.force?.name || "this force"}`
                : `${opportunity.signalCount} signals detected for ${opportunity.force?.name || "this force"}`}
            </p>
          </ContextRow>

          {/* WHY - Context/importance */}
          {opportunity.whyNow && (
            <ContextRow
              label="Why"
              icon={<Lightbulb className="h-4 w-4 text-warning" />}
            >
              <p className="text-secondary text-sm leading-relaxed">
                {opportunity.whyNow}
              </p>
            </ContextRow>
          )}

          {/* NEXT - Recommended action */}
          <ContextRow
            label="Next"
            icon={<ChevronRight className="h-4 w-4 text-success" />}
          >
            <div className="flex items-center gap-2">
              <ChannelIcon channel={opportunity.outreachChannel} />
              <span className="text-primary">
                {opportunity.outreachChannel === "linkedin"
                  ? "Send LinkedIn message"
                  : "Send email"}
              </span>
            </div>
          </ContextRow>

          {/* WHEN - Time constraint/signal age */}
          <ContextRow
            label="When"
            icon={<Calendar className="h-4 w-4 text-info" />}
          >
            <span className="text-primary text-sm font-mono">
              {opportunity.signals && opportunity.signals.length > 0
                ? formatRelativeTime(
                    opportunity.signals[0].createdAt || opportunity.createdAt
                  )
                : formatRelativeTime(opportunity.createdAt)}
            </span>
            {opportunity.priorityTier === "hot" && (
              <span className="ml-2 text-xs text-danger font-medium">
                — Act today
              </span>
            )}
          </ContextRow>

          {/* SOURCE - Where it came from */}
          <ContextRow
            label="Source"
            icon={<ExternalLink className="h-4 w-4 text-muted" />}
          >
            <span className="text-secondary text-sm">
              {getPrimarySource(opportunity)}
            </span>
          </ContextRow>
        </div>

        {/* Signals List */}
        {opportunity.signals && opportunity.signals.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-secondary flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted" />
              Recent Signals
            </h4>
            <div className="space-y-1">
              {opportunity.signals.slice(0, 3).map((signal) => (
                <div
                  key={signal.id}
                  className="flex items-center justify-between text-sm p-2 rounded bg-surface-1/30"
                >
                  <span className="text-primary truncate flex-1">
                    {signal.title || signal.type}
                  </span>
                  <span className="text-muted text-xs ml-2">
                    {signal.source}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Card */}
        {opportunity.contact && (
          <div className="p-4 rounded-lg bg-surface-1/50 border border-surface-1">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-surface-2 flex items-center justify-center">
                <User className="h-5 w-5 text-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-primary truncate">
                  {opportunity.contact.name}
                </h4>
                {opportunity.contact.role && (
                  <p className="text-sm text-secondary truncate">
                    {opportunity.contact.role}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {opportunity.contact.email && (
                    <a
                      href={`mailto:${opportunity.contact.email}`}
                      className="flex items-center gap-1 text-xs text-action hover:underline"
                    >
                      <Mail className="h-3 w-3" />
                      {opportunity.contact.email}
                    </a>
                  )}
                  {opportunity.contact.linkedinUrl && (
                    <a
                      href={opportunity.contact.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-info hover:underline"
                    >
                      <Linkedin className="h-3 w-3" />
                      LinkedIn
                    </a>
                  )}
                </div>
                <ConfidenceBadge confidence={opportunity.contact.confidence} />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Context Row - Consistent layout for context items
 */
function ContextRow({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex items-center gap-2 w-16 shrink-0">
        {icon}
        <span className="text-[12px] font-medium text-muted uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

/**
 * Channel Icon
 */
function ChannelIcon({ channel }: { channel: string }) {
  switch (channel) {
    case "linkedin":
      return <Linkedin className="h-4 w-4 text-info" />;
    case "email":
    default:
      return <Mail className="h-4 w-4 text-action" />;
  }
}

/**
 * Confidence Badge
 */
function ConfidenceBadge({ confidence }: { confidence: string }) {
  const config = {
    verified: { label: "Verified", className: "text-success bg-success/10" },
    likely: { label: "Likely", className: "text-action bg-action/10" },
    guess: { label: "Unverified", className: "text-warning bg-warning/10" },
    none: { label: "Unknown", className: "text-muted bg-surface-1" },
  }[confidence] || { label: confidence, className: "text-muted bg-surface-1" };

  return (
    <span className={cn("text-[10px] px-1.5 py-0.5 rounded mt-2 inline-block", config.className)}>
      {config.label}
    </span>
  );
}
