// @ts-nocheck
"use client";

import { EnergyLevel } from "@/lib/types/lead";
import { cn } from "@/lib/utils";
import { Battery, Zap, Rocket } from "lucide-react";

interface EnergyCheckProps {
  selectedLevel: EnergyLevel | null;
  onSelect: (level: EnergyLevel) => void;
  className?: string;
}

const energyLevels: {
  value: EnergyLevel;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
}[] = [
  {
    value: "low",
    label: "LOW",
    icon: Battery,
    description: "Quick wins only — 2-3 easy tasks",
    color: "text-warning hover:bg-warning/10 border-warning/30",
  },
  {
    value: "medium",
    label: "MEDIUM",
    icon: Zap,
    description: "Standard workload — 5-6 balanced tasks",
    color: "text-action hover:bg-action/10 border-action/30",
  },
  {
    value: "high",
    label: "HIGH",
    icon: Rocket,
    description: "Power mode — tackle the tough ones",
    color: "text-success hover:bg-success/10 border-success/30",
  },
];

export function EnergyCheck({
  selectedLevel,
  onSelect,
  className,
}: EnergyCheckProps) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <h2 className="text-xl font-semibold text-primary mb-2">
        How&apos;s your energy today?
      </h2>
      <p className="text-sm text-muted mb-8">
        This helps prioritise your leads
      </p>

      <div className="flex gap-4">
        {energyLevels.map((level) => {
          const Icon = level.icon;
          const isSelected = selectedLevel === level.value;

          return (
            <button
              key={level.value}
              onClick={() => onSelect(level.value)}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all",
                "min-w-[160px]",
                isSelected
                  ? "border-current bg-current/10 scale-105"
                  : "border-surface-1 hover:border-current",
                level.color
              )}
            >
              <div
                className={cn(
                  "p-4 rounded-full",
                  isSelected ? "bg-current/20" : "bg-surface-1"
                )}
              >
                <Icon className="size-8" />
              </div>
              <span className="font-semibold tracking-wide">{level.label}</span>
              <span className="text-xs text-muted text-center max-w-[120px]">
                {level.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
