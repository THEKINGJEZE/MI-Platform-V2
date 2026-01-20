// @ts-nocheck
"use client";

import { useState } from "react";
import { Lead } from "@/lib/types/lead";
import { Badge, ForceTypeBadge, PriorityBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, RefreshCw, Flame, Clock, TrendingUp } from "lucide-react";

interface RuleOfThreeProps {
  recommendedLeads: Lead[];
  allLeads: Lead[];
  onAccept: (leadIds: string[]) => void;
  onSwap: (index: number, newLeadId: string) => void;
  className?: string;
}

export function RuleOfThree({
  recommendedLeads,
  allLeads,
  onAccept,
  onSwap,
  className,
}: RuleOfThreeProps) {
  const [selectedLeads, setSelectedLeads] = useState<Lead[]>(recommendedLeads);
  const [swappingIndex, setSwappingIndex] = useState<number | null>(null);

  // Get leads that aren't currently selected
  const availableForSwap = allLeads.filter(
    (lead) => !selectedLeads.some((s) => s.id === lead.id)
  );

  const handleSwap = (index: number, newLead: Lead) => {
    const newSelection = [...selectedLeads];
    newSelection[index] = newLead;
    setSelectedLeads(newSelection);
    onSwap(index, newLead.id);
    setSwappingIndex(null);
  };

  const handleAcceptAll = () => {
    onAccept(selectedLeads.map((l) => l.id));
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-primary mb-2">
          Your Top 3 Priorities
        </h3>
        <p className="text-sm text-muted">
          AI-recommended based on your energy level, deadlines, and signal
          strength
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {selectedLeads.map((lead, index) => (
          <div key={lead.id} className="relative">
            {/* Lead Card */}
            <div
              className={cn(
                "bg-surface-0 rounded-lg border border-surface-1 p-4",
                swappingIndex === index && "ring-2 ring-action"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* Priority Number */}
                  <div className="flex items-center justify-center size-10 rounded-full bg-action text-white font-bold text-lg shrink-0">
                    {index + 1}
                  </div>

                  <div className="flex flex-col gap-2">
                    {/* Org Name + Badges */}
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-primary text-lg">
                        {lead.organisationName}
                      </span>
                      <ForceTypeBadge type={lead.forceContext.forceType} />
                      <PriorityBadge priority={lead.priority} />
                    </div>

                    {/* Primary Signal */}
                    {lead.primarySignal && (
                      <div className="flex items-center gap-2">
                        <SignalIcon type={lead.primarySignal.type} />
                        <span className="text-sm text-secondary">
                          {lead.primarySignal.label}
                        </span>
                        <span className="text-sm text-success font-medium">
                          +{lead.primarySignal.points} pts
                        </span>
                      </div>
                    )}

                    {/* Why Recommended */}
                    <p className="text-sm text-muted">{lead.triggerReason}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setSwappingIndex(swappingIndex === index ? null : index)
                    }
                    className="gap-1"
                  >
                    <RefreshCw className="size-4" />
                    Swap
                  </Button>
                </div>
              </div>
            </div>

            {/* Swap Panel */}
            {swappingIndex === index && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface-1 rounded-lg border border-surface-2 p-3 z-10 shadow-lg">
                <p className="text-xs text-muted mb-2 uppercase tracking-wide font-semibold">
                  Swap with:
                </p>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {availableForSwap.slice(0, 5).map((altLead) => (
                    <button
                      key={altLead.id}
                      onClick={() => handleSwap(index, altLead)}
                      className="w-full flex items-center justify-between px-3 py-2 bg-surface-0 rounded-md hover:bg-surface-2 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-primary">
                          {altLead.organisationName}
                        </span>
                        <Badge variant="secondary">
                          {altLead.score}
                        </Badge>
                      </div>
                      <ForceTypeBadge type={altLead.forceContext.forceType} />
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setSwappingIndex(null)}
                  className="mt-2 text-xs text-muted hover:text-secondary"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Accept Button */}
      <div className="flex justify-center mt-4">
        <Button onClick={handleAcceptAll} size="lg" className="gap-2 px-8">
          <Check className="size-5" />
          Lock In & Start Day
        </Button>
      </div>
    </div>
  );
}

function SignalIcon({ type }: { type: string }) {
  switch (type) {
    case "hiring_surge":
      return <Flame className="size-4 text-danger" />;
    case "followup_due":
      return <Clock className="size-4 text-warning" />;
    case "signal_spike":
      return <TrendingUp className="size-4 text-success" />;
    default:
      return <TrendingUp className="size-4 text-action" />;
  }
}
