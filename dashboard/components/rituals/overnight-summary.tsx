// @ts-nocheck
"use client";

import { Lead, Signal } from "@/lib/types/lead";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Bell,
  TrendingUp,
  Clock,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

interface OvernightSummaryProps {
  newSignals: Signal[];
  followUpsDue: Lead[];
  snoozeReminders: Lead[];
  priorityAlerts: Lead[];
  className?: string;
}

export function OvernightSummary({
  newSignals,
  followUpsDue,
  snoozeReminders,
  priorityAlerts,
  className,
}: OvernightSummaryProps) {
  const hasItems =
    newSignals.length > 0 ||
    followUpsDue.length > 0 ||
    snoozeReminders.length > 0 ||
    priorityAlerts.length > 0;

  if (!hasItems) {
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-muted">No new activity while you were away.</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <h3 className="text-lg font-semibold text-primary">
        While you were away...
      </h3>

      {/* Priority Alerts */}
      {priorityAlerts.length > 0 && (
        <SummarySection
          icon={AlertTriangle}
          title="Priority Alerts"
          count={priorityAlerts.length}
          variant="danger"
        >
          <ul className="space-y-2">
            {priorityAlerts.slice(0, 3).map((lead) => (
              <li
                key={lead.id}
                className="flex items-center justify-between bg-surface-0 rounded-md px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-primary font-medium">
                    {lead.organisationName}
                  </span>
                  <Badge variant="priority">PRIORITY</Badge>
                </div>
                <ChevronRight className="size-4 text-muted" />
              </li>
            ))}
          </ul>
        </SummarySection>
      )}

      {/* New Signals */}
      {newSignals.length > 0 && (
        <SummarySection
          icon={TrendingUp}
          title="New Signals Detected"
          count={newSignals.length}
          variant="success"
        >
          <ul className="space-y-2">
            {newSignals.slice(0, 3).map((signal) => (
              <li
                key={signal.id}
                className="flex items-center justify-between bg-surface-0 rounded-md px-3 py-2"
              >
                <span className="text-sm text-primary">{signal.label}</span>
                <span className="text-xs text-success font-medium">
                  +{signal.points} pts
                </span>
              </li>
            ))}
            {newSignals.length > 3 && (
              <li className="text-xs text-muted px-3">
                +{newSignals.length - 3} more signals
              </li>
            )}
          </ul>
        </SummarySection>
      )}

      {/* Follow-ups Due */}
      {followUpsDue.length > 0 && (
        <SummarySection
          icon={Clock}
          title="Follow-ups Due"
          count={followUpsDue.length}
          variant="warning"
        >
          <ul className="space-y-2">
            {followUpsDue.slice(0, 3).map((lead) => (
              <li
                key={lead.id}
                className="flex items-center justify-between bg-surface-0 rounded-md px-3 py-2"
              >
                <span className="text-sm text-primary">
                  {lead.organisationName}
                </span>
                <span className="text-xs text-warning">Due today</span>
              </li>
            ))}
          </ul>
        </SummarySection>
      )}

      {/* Snooze Reminders */}
      {snoozeReminders.length > 0 && (
        <SummarySection
          icon={Bell}
          title="Snooze Reminders"
          count={snoozeReminders.length}
          variant="info"
        >
          <ul className="space-y-2">
            {snoozeReminders.slice(0, 3).map((lead) => (
              <li
                key={lead.id}
                className="flex items-center justify-between bg-surface-0 rounded-md px-3 py-2"
              >
                <span className="text-sm text-primary">
                  {lead.organisationName}
                </span>
                <Badge variant="snoozed" showIcon>
                  Snooze ended
                </Badge>
              </li>
            ))}
          </ul>
        </SummarySection>
      )}
    </div>
  );
}

interface SummarySectionProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  count: number;
  variant: "success" | "warning" | "danger" | "info";
  children: React.ReactNode;
}

function SummarySection({
  icon: Icon,
  title,
  count,
  variant,
  children,
}: SummarySectionProps) {
  const variantStyles = {
    success: "text-success bg-success-muted",
    warning: "text-warning bg-warning-muted",
    danger: "text-danger bg-danger-muted",
    info: "text-info bg-info-muted",
  };

  return (
    <div className="bg-surface-0 rounded-lg border border-surface-1 p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("p-2 rounded-lg", variantStyles[variant])}>
          <Icon className="size-4" />
        </div>
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-primary">{title}</h4>
          <Badge variant="secondary">{count}</Badge>
        </div>
      </div>
      {children}
    </div>
  );
}
