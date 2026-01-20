"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { PinTray, CommandPalette, QuickCapture, ShortcutOverlay } from "@/components/overlays";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isShortcutOverlayOpen, setIsShortcutOverlayOpen] = useState(false);

  // Global keyboard shortcuts
  const handleGlobalKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        // Allow Escape to close overlays even in inputs
        if (e.key === "Escape") {
          if (isCommandPaletteOpen) setIsCommandPaletteOpen(false);
          if (isQuickCaptureOpen) setIsQuickCaptureOpen(false);
          if (isShortcutOverlayOpen) setIsShortcutOverlayOpen(false);
        }
        return;
      }

      // ⌘K or Ctrl+K - Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // ? - Shortcut Overlay
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIsShortcutOverlayOpen((prev) => !prev);
        return;
      }

      // Escape - Close overlays
      if (e.key === "Escape") {
        if (isCommandPaletteOpen) setIsCommandPaletteOpen(false);
        if (isQuickCaptureOpen) setIsQuickCaptureOpen(false);
        if (isShortcutOverlayOpen) setIsShortcutOverlayOpen(false);
      }
    },
    [isCommandPaletteOpen, isQuickCaptureOpen, isShortcutOverlayOpen]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

  return (
    <>
      <header
        className={cn(
          "h-14 bg-surface-0 border-b border-surface-1 flex items-center justify-between px-4",
          className
        )}
      >
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-action flex items-center justify-center">
            <span className="text-white font-semibold text-sm">MI</span>
          </div>
          <span className="font-semibold text-primary">MI Platform</span>
        </div>

        {/* Centre: Command Palette trigger */}
        <button
          className="flex items-center gap-2 px-3 py-1.5 bg-surface-1 rounded-md text-muted hover:bg-surface-2 hover:text-secondary transition-colors"
          onClick={() => setIsCommandPaletteOpen(true)}
        >
          <Search className="h-4 w-4" />
          <span className="text-sm">Search...</span>
          <kbd className="text-xs bg-surface-2 px-1.5 py-0.5 rounded font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Right: Pins, Alerts, User */}
        <div className="flex items-center gap-2">
          {/* Pin Tray */}
          <PinTray />

          {/* Notification Bell */}
          <button
            className="p-2 rounded-md text-muted hover:text-secondary hover:bg-surface-1 transition-colors relative"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {/* Unread badge - conditionally rendered */}
            {/* <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" /> */}
          </button>

          {/* User Avatar */}
          <button
            className="p-1.5 rounded-md hover:bg-surface-1 transition-colors"
            title="User menu"
          >
            <div className="w-7 h-7 rounded-full bg-surface-2 flex items-center justify-center">
              <User className="h-4 w-4 text-secondary" />
            </div>
          </button>
        </div>
      </header>

      {/* Overlays */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenQuickCapture={() => {
          setIsCommandPaletteOpen(false);
          setIsQuickCaptureOpen(true);
        }}
      />

      <QuickCapture
        isOpen={isQuickCaptureOpen}
        onClose={() => setIsQuickCaptureOpen(false)}
      />

      <ShortcutOverlay
        isOpen={isShortcutOverlayOpen}
        onClose={() => setIsShortcutOverlayOpen(false)}
      />
    </>
  );
}
