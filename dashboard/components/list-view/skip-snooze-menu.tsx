// @ts-nocheck
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Clock,
  UserX,
  Target,
  Users,
  Shield,
  ChevronRight,
  X,
} from "lucide-react";

interface SkipSnoozeMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: (reason: string) => void;
  onSnooze: (until: string) => void;
  className?: string;
}

const skipReasons = [
  { id: "no_contact", label: "No contact info", icon: UserX },
  { id: "not_icp", label: "Not ICP", icon: Target },
  { id: "already_engaged", label: "Already engaged", icon: Users },
  { id: "competitor_embedded", label: "Competitor embedded", icon: Shield },
];

const snoozeOptions = [
  { id: "1h", label: "1 hour", duration: 1 * 60 * 60 * 1000 },
  { id: "tomorrow", label: "Tomorrow", duration: 24 * 60 * 60 * 1000 },
  { id: "3d", label: "3 days", duration: 3 * 24 * 60 * 60 * 1000 },
  { id: "1w", label: "Next week", duration: 7 * 24 * 60 * 60 * 1000 },
];

export function SkipSnoozeMenu({
  isOpen,
  onClose,
  onSkip,
  onSnooze,
  className,
}: SkipSnoozeMenuProps) {
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);

  if (!isOpen) return null;

  const handleSnooze = (duration: number) => {
    const until = new Date(Date.now() + duration).toISOString();
    onSnooze(until);
    onClose();
  };

  const handleSkip = (reason: string) => {
    onSkip(reason);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Menu */}
      <div
        className={cn(
          "absolute z-50 w-56 bg-surface-0 border border-surface-1 rounded-lg shadow-lg overflow-hidden",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-surface-1">
          <span className="text-xs font-semibold text-muted uppercase tracking-wide">
            {showSnoozeOptions ? "Snooze Until" : "Skip Reason"}
          </span>
          <button
            onClick={onClose}
            className="text-muted hover:text-secondary transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        {showSnoozeOptions ? (
          <div className="py-1">
            <button
              onClick={() => setShowSnoozeOptions(false)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted hover:bg-surface-1 transition-colors"
            >
              <ChevronRight className="size-4 rotate-180" />
              Back
            </button>
            {snoozeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSnooze(option.duration)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-secondary hover:bg-surface-1 hover:text-primary transition-colors"
              >
                <Clock className="size-4" />
                {option.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="py-1">
            {skipReasons.map((reason) => {
              const Icon = reason.icon;
              return (
                <button
                  key={reason.id}
                  onClick={() => handleSkip(reason.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-secondary hover:bg-surface-1 hover:text-primary transition-colors"
                >
                  <Icon className="size-4" />
                  {reason.label}
                </button>
              );
            })}
            <div className="border-t border-surface-1 my-1" />
            <button
              onClick={() => setShowSnoozeOptions(true)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-warning hover:bg-surface-1 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Clock className="size-4" />
                Snooze...
              </span>
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/**
 * Inline trigger button with menu
 */
interface SkipButtonWithMenuProps {
  onSkip: (reason: string) => void;
  onSnooze: (until: string) => void;
  className?: string;
}

export function SkipButtonWithMenu({
  onSkip,
  onSnooze,
  className,
}: SkipButtonWithMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(true)}
      >
        Skip
      </Button>
      <SkipSnoozeMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSkip={onSkip}
        onSnooze={onSnooze}
        className="top-full right-0 mt-1"
      />
    </div>
  );
}
