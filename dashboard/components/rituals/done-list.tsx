// @ts-nocheck
"use client";

import { Lead } from "@/lib/types/lead";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle, Mail, Phone, Linkedin, Star } from "lucide-react";

interface DoneListProps {
  actionedLeads: Lead[];
  stats: {
    emailsSent: number;
    callsLogged: number;
    linkedinMessages: number;
    opportunitiesCreated: number;
  };
  className?: string;
}

export function DoneList({ actionedLeads, stats, className }: DoneListProps) {
  // Encouraging messages based on performance
  const getEncouragement = () => {
    const total = stats.emailsSent + stats.callsLogged + stats.linkedinMessages;
    if (total >= 10) return "Outstanding day! You crushed it.";
    if (total >= 5) return "Great progress today. Every action counts.";
    if (total >= 1) return "You showed up and made moves. That matters.";
    return "Tomorrow is a fresh start.";
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-primary mb-2">
          Here&apos;s what you accomplished today
        </h3>
        <p className="text-sm text-success">{getEncouragement()}</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={Mail}
          value={stats.emailsSent}
          label="Emails sent"
          color="text-action"
        />
        <StatCard
          icon={Phone}
          value={stats.callsLogged}
          label="Calls logged"
          color="text-success"
        />
        <StatCard
          icon={Linkedin}
          value={stats.linkedinMessages}
          label="LinkedIn"
          color="text-info"
        />
        <StatCard
          icon={Star}
          value={stats.opportunitiesCreated}
          label="Opportunities"
          color="text-warning"
        />
      </div>

      {/* Actioned Leads List */}
      {actionedLeads.length > 0 && (
        <div className="bg-surface-0 rounded-lg border border-surface-1 overflow-hidden">
          <div className="px-4 py-3 border-b border-surface-1">
            <h4 className="text-sm font-semibold text-secondary">
              Leads Processed ({actionedLeads.length})
            </h4>
          </div>
          <ul className="divide-y divide-surface-1">
            {actionedLeads.map((lead) => (
              <li
                key={lead.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-success-muted rounded-full">
                    <CheckCircle className="size-4 text-success" />
                  </div>
                  <div>
                    <span className="text-sm text-primary font-medium">
                      {lead.organisationName}
                    </span>
                    <span className="text-xs text-muted ml-2">
                      {lead.recommendedAction}
                    </span>
                  </div>
                </div>
                <Badge variant="actioned" showIcon>
                  Actioned
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      )}

      {actionedLeads.length === 0 && (
        <div className="bg-surface-0 rounded-lg border border-surface-1 p-8 text-center">
          <p className="text-muted">No leads were processed today.</p>
          <p className="text-sm text-muted mt-1">
            That&apos;s okay — every day is different.
          </p>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
  color: string;
}

function StatCard({ icon: Icon, value, label, color }: StatCardProps) {
  return (
    <div className="bg-surface-0 rounded-lg border border-surface-1 p-4 text-center">
      <Icon className={cn("size-5 mx-auto mb-2", color)} />
      <div className="text-2xl font-bold font-mono tabular-nums text-primary">
        {value}
      </div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}
