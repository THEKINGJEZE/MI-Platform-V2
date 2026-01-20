// @ts-nocheck
"use client";

import { usePinsStore, PinType } from "@/lib/stores";
import { cn } from "@/lib/utils";
import { Pin, PinOff } from "lucide-react";

interface PinButtonProps {
  id: string;
  type: PinType;
  title: string;
  subtitle?: string;
  href: string;
  className?: string;
  size?: "sm" | "md";
}

/**
 * Pin Button
 *
 * Toggles pin status for an item.
 * Shows filled pin when pinned, outline when not.
 * Max 10 pins enforced by store.
 */
export function PinButton({
  id,
  type,
  title,
  subtitle,
  href,
  className,
  size = "md",
}: PinButtonProps) {
  const { isPinned, togglePin, pins } = usePinsStore();
  const pinned = isPinned(id);
  const atMax = pins.length >= 10;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger parent click handlers
    e.preventDefault();

    const added = togglePin({ id, type, title, subtitle, href });

    // If we tried to add but couldn't (at max), we could show a toast
    // For now, the button is disabled when at max and not pinned
  };

  const sizeClasses = {
    sm: "p-1 [&>svg]:size-3.5",
    md: "p-1.5 [&>svg]:size-4",
  };

  return (
    <button
      onClick={handleClick}
      disabled={!pinned && atMax}
      title={
        pinned
          ? "Unpin"
          : atMax
          ? "Maximum 10 pins reached"
          : "Pin for quick access"
      }
      className={cn(
        "rounded-md transition-all",
        pinned
          ? "text-warning hover:text-warning/80 bg-warning/10"
          : atMax
          ? "text-muted cursor-not-allowed opacity-50"
          : "text-muted hover:text-secondary hover:bg-surface-1",
        sizeClasses[size],
        className
      )}
    >
      {pinned ? (
        <Pin className="fill-current" />
      ) : (
        <Pin />
      )}
    </button>
  );
}

/**
 * Inline Pin Toggle for keyboard shortcut
 * Used when pressing 'P' on a lead
 */
export function usePinToggle() {
  const { togglePin, isPinned } = usePinsStore();

  return {
    toggle: (item: {
      id: string;
      type: PinType;
      title: string;
      subtitle?: string;
      href: string;
    }) => togglePin(item),
    isPinned,
  };
}
