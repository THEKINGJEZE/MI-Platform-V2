// @ts-nocheck
"use client";

import type { BudgetCycleData, BudgetPhase } from "@/lib/types/board";
import { cn } from "@/lib/utils";

interface BudgetCycleProps {
  data: BudgetCycleData;
  className?: string;
}

function PhaseIndicator({ phase, isActive }: { phase: BudgetPhase; isActive: boolean }) {
  return (
    <div className="flex flex-col items-center">
      {/* Phase dot */}
      <div
        className={cn(
          "h-4 w-4 rounded-full border-2 transition-all",
          isActive
            ? "border-primary bg-primary shadow-lg shadow-primary/30"
            : "border-border bg-card"
        )}
      />
      {/* Phase label */}
      <div className="mt-2 text-center">
        <div
          className={cn(
            "text-xs font-medium",
            isActive ? "text-foreground" : "text-foreground/50"
          )}
        >
          {phase.shortName}
        </div>
        <div className="text-[10px] text-foreground/40">{phase.months}</div>
      </div>
    </div>
  );
}

export function BudgetCycle({ data, className }: BudgetCycleProps) {
  const currentPhaseIndex = data.currentPhaseIndex;

  return (
    <div className={cn("rounded-lg border border-border/40 bg-card/30 p-4", className)}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground/80">
          Police Budget Cycle
        </h3>
        <span className="text-xs text-foreground/50">{data.fiscalYear} FY</span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Connection line */}
        <div className="absolute left-0 right-0 top-2 h-0.5 bg-border" />

        {/* Progress line */}
        <div
          className="absolute top-2 h-0.5 bg-primary transition-all"
          style={{
            left: 0,
            width: `${((currentPhaseIndex + 0.5) / data.phases.length) * 100}%`,
          }}
        />

        {/* Phases */}
        <div className="relative flex justify-between">
          {data.phases.map((phase, index) => (
            <PhaseIndicator
              key={phase.id}
              phase={phase}
              isActive={phase.isCurrent}
            />
          ))}
        </div>
      </div>

      {/* Current Phase Info */}
      <div className="mt-4 rounded-md bg-muted/30 p-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-medium text-foreground/70">
              Current: {data.currentPhase}
            </div>
            <div className="mt-0.5 text-xs text-foreground/50">
              {data.phaseDescription}
            </div>
          </div>
          {data.isBudgetSeason && (
            <span className="flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
              </span>
              Budget Season
            </span>
          )}
        </div>

        {/* Next Milestone */}
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span className="text-foreground/40">Next:</span>
          <span className="font-medium text-foreground/70">{data.nextMilestone}</span>
          <span className="text-foreground/40">({data.nextMilestoneDate})</span>
        </div>
      </div>

      {/* Budget Season Explainer */}
      {data.isBudgetSeason && (
        <div className="mt-3 text-xs text-foreground/50">
          Oct-Feb: Forces planning next year&apos;s budgets — most receptive to BD conversations
        </div>
      )}
    </div>
  );
}
