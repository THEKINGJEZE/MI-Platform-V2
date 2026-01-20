// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePinsStore, PinnedItem } from "@/lib/stores";
import { cn } from "@/lib/utils";
import { Pin, X, Users, Building2, User, Lightbulb } from "lucide-react";

/**
 * Pin Tray
 *
 * Dropdown tray in header showing all pinned items.
 * Click to navigate, X to unpin.
 * Max 10 pins.
 */
export function PinTray({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { pins, removePin } = usePinsStore();

  const getIcon = (type: PinnedItem["type"]) => {
    switch (type) {
      case "lead":
        return Users;
      case "organisation":
        return Building2;
      case "contact":
        return User;
      case "insight":
        return Lightbulb;
      default:
        return Pin;
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 rounded-lg transition-colors",
          isOpen
            ? "bg-surface-1 text-primary"
            : "text-muted hover:text-secondary hover:bg-surface-1"
        )}
        title="Pinned items"
      >
        <Pin className="size-5" />
        {pins.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center size-4 bg-warning text-[10px] font-bold text-canvas rounded-full">
            {pins.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Tray */}
          <div className="absolute right-0 top-full mt-2 w-72 bg-surface-0 border border-surface-1 rounded-lg shadow-lg z-50 overflow-hidden">
            {/* Header */}
            <div className="px-3 py-2 border-b border-surface-1 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted uppercase tracking-wide">
                Pinned ({pins.length}/10)
              </span>
              {pins.length > 0 && (
                <button
                  onClick={() => {
                    pins.forEach((p) => removePin(p.id));
                    setIsOpen(false);
                  }}
                  className="text-xs text-muted hover:text-danger transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Items */}
            {pins.length === 0 ? (
              <div className="px-3 py-6 text-center">
                <Pin className="size-8 text-muted mx-auto mb-2" />
                <p className="text-sm text-muted">No pinned items</p>
                <p className="text-xs text-muted mt-1">
                  Press P on any lead to pin it
                </p>
              </div>
            ) : (
              <ul className="max-h-80 overflow-y-auto">
                {pins.map((pin) => {
                  const Icon = getIcon(pin.type);
                  return (
                    <li
                      key={pin.id}
                      className="group flex items-center gap-3 px-3 py-2 hover:bg-surface-1 transition-colors"
                    >
                      <div className="p-1.5 bg-surface-1 rounded-md group-hover:bg-surface-2">
                        <Icon className="size-4 text-secondary" />
                      </div>
                      <Link
                        href={pin.href}
                        onClick={() => setIsOpen(false)}
                        className="flex-1 min-w-0"
                      >
                        <div className="text-sm text-primary font-medium truncate">
                          {pin.title}
                        </div>
                        {pin.subtitle && (
                          <div className="text-xs text-muted truncate">
                            {pin.subtitle}
                          </div>
                        )}
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removePin(pin.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-muted hover:text-danger transition-all"
                        title="Unpin"
                      >
                        <X className="size-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
