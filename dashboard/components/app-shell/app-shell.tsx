"use client";

import { cn } from "@/lib/utils";
import { Header } from "./header";
import { NavRail } from "./nav-rail";
import { useUIStore } from "@/lib/stores/ui-store";

interface AppShellProps {
  children: React.ReactNode;
  /** Enable Focus Mode - dims sidebar, suppresses non-urgent (can also be controlled via useUIStore) */
  focusMode?: boolean;
  className?: string;
}

/**
 * App Shell - Main layout wrapper
 *
 * Implements the spec's App Shell structure:
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │  [Logo]    Global Search (⌘K)                    [Pins] [Alerts] [User]    │
 * ├────────────┬────────────────────────────────────────────────────────────────┤
 * │            │                                                                │
 * │   [Home]   │                      Page Content                              │
 * │   [Leads]  │                                                                │
 * │   [Intel]  │   Page Header: Title · Freshness · Actions                    │
 * │   [Forces] │                                                                │
 * │            │   [ Main Content Area ]                                        │
 * │   ─────    │                                                                │
 * │  [Morning] │                                                                │
 * │   [EOD]    │                                                                │
 * └────────────┴────────────────────────────────────────────────────────────────┘
 */
export function AppShell({ children, focusMode = false, className }: AppShellProps) {
  // Read focus mode from UI store (set by Focus page on mount)
  const isFocusMode = useUIStore((state) => state.isFocusMode);

  // Combine prop and store - either can enable focus mode
  const isInFocusMode = focusMode || isFocusMode;

  return (
    <div className={cn("h-screen bg-canvas flex flex-col", className)}>
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <NavRail dimmed={isInFocusMode} />
        <main
          id="main-content"
          role="main"
          aria-label="Main content"
          className="flex-1 overflow-auto p-5"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
