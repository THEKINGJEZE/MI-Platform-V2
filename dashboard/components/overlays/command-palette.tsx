// @ts-nocheck
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useOpportunitiesStore, usePinsStore, useUIStore } from "@/lib/stores";
import { cn } from "@/lib/utils";
import {
  Search,
  Home,
  Users,
  BarChart3,
  Shield,
  Sun,
  Moon,
  Settings,
  Focus,
  Mail,
  SkipForward,
  Pin,
  PenLine,
  ArrowRight,
  Command,
  Building2,
} from "lucide-react";

interface CommandItem {
  id: string;
  type: "action" | "navigation" | "lead";
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  onSelect: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQuickCapture: () => void;
}

/**
 * Command Palette
 *
 * Global command palette triggered by ⌘K
 * - Search through actions, pages, leads
 * - Quick capture via 'n' or selecting New Capture
 * - Keyboard navigation with arrow keys
 */
export function CommandPalette({
  isOpen,
  onClose,
  onOpenQuickCapture,
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Stores
  const { opportunities, setCurrentOpportunity } = useOpportunitiesStore();
  const { pins, togglePin } = usePinsStore();
  const { addToast } = useUIStore();

  // Build command items
  const allItems = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [];

    // Actions
    items.push({
      id: "new-capture",
      type: "action",
      title: "New Capture",
      subtitle: "Quick capture a thought",
      icon: PenLine,
      shortcut: "n",
      onSelect: () => {
        onClose();
        onOpenQuickCapture();
      },
    });

    // Navigation
    const navItems = [
      { id: "nav-home", title: "Go to Home", href: "/", icon: Home },
      { id: "nav-focus", title: "Go to Focus Mode", href: "/focus", icon: Focus },
      { id: "nav-intel", title: "Go to Intel", href: "/intel", icon: BarChart3 },
      { id: "nav-forces", title: "Go to Forces", href: "/forces", icon: Shield },
      { id: "nav-morning", title: "Go to Morning Brief", href: "/morning", icon: Sun },
      { id: "nav-eod", title: "Go to End of Day", href: "/eod", icon: Moon },
      { id: "nav-settings", title: "Go to Settings", href: "/settings", icon: Settings },
    ];

    navItems.forEach((nav) => {
      items.push({
        id: nav.id,
        type: "navigation",
        title: nav.title,
        icon: nav.icon,
        onSelect: () => {
          router.push(nav.href);
          onClose();
        },
      });
    });

    // Actions on current lead
    items.push({
      id: "action-email",
      type: "action",
      title: "Send Email",
      subtitle: "Send email to current lead",
      icon: Mail,
      shortcut: "e",
      onSelect: () => {
        addToast({
          type: "success",
          title: "Action triggered",
          description: "Navigate to Focus Mode to send email",
        });
        onClose();
      },
    });

    items.push({
      id: "action-skip",
      type: "action",
      title: "Skip Lead",
      subtitle: "Skip current lead with reason",
      icon: SkipForward,
      shortcut: "s",
      onSelect: () => {
        addToast({
          type: "info",
          title: "Action triggered",
          description: "Navigate to Focus Mode to skip",
        });
        onClose();
      },
    });

    // Leads (limit to 5 for performance)
    opportunities.slice(0, 5).forEach((lead) => {
      items.push({
        id: `lead-${lead.id}`,
        type: "lead",
        title: lead.forceName,
        subtitle: `Score: ${lead.primaryScore} • ${lead.opportunityType}`,
        icon: Building2,
        onSelect: () => {
          setCurrentOpportunity(lead.id);
          router.push("/focus");
          onClose();
        },
      });
    });

    return items;
  }, [opportunities, router, onClose, onOpenQuickCapture, setCurrentOpportunity, addToast]);

  // Filter items by query
  const filteredItems = useMemo(() => {
    if (!query.trim()) return allItems;

    const lowerQuery = query.toLowerCase();
    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.subtitle?.toLowerCase().includes(lowerQuery)
    );
  }, [allItems, query]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredItems.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredItems[selectedIndex]) {
            filteredItems[selectedIndex].onSelect();
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        case "n":
          // Quick capture shortcut when query is empty
          if (!query.trim()) {
            e.preventDefault();
            onClose();
            onOpenQuickCapture();
          }
          break;
      }
    },
    [filteredItems, selectedIndex, onClose, onOpenQuickCapture, query]
  );

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-canvas/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Palette */}
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl bg-surface-0 border border-surface-1 rounded-xl shadow-2xl z-50 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-1">
          <Search className="size-5 text-muted" />
          <input
            type="text"
            placeholder="Search commands, pages, leads..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 bg-transparent text-primary placeholder:text-muted outline-none text-sm"
          />
          <kbd className="px-1.5 py-0.5 bg-surface-1 text-xs text-muted rounded">
            esc
          </kbd>
        </div>

        {/* Quick Hint */}
        {!query.trim() && (
          <div className="px-4 py-2 border-b border-surface-1 bg-surface-1/30">
            <p className="text-xs text-muted">
              Press <kbd className="px-1 py-0.5 bg-surface-1 rounded mx-1">n</kbd>{" "}
              for quick capture
            </p>
          </div>
        )}

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-muted">No results found</p>
            </div>
          ) : (
            <ul className="py-2">
              {filteredItems.map((item, index) => {
                const Icon = item.icon;
                const isSelected = index === selectedIndex;

                return (
                  <li key={item.id}>
                    <button
                      onClick={item.onSelect}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                        isSelected ? "bg-surface-1" : "hover:bg-surface-1/50"
                      )}
                    >
                      <div
                        className={cn(
                          "p-1.5 rounded-md",
                          item.type === "action"
                            ? "bg-action/10 text-action"
                            : item.type === "lead"
                            ? "bg-warning/10 text-warning"
                            : "bg-surface-1 text-secondary"
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-primary font-medium">
                          {item.title}
                        </div>
                        {item.subtitle && (
                          <div className="text-xs text-muted truncate">
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                      {item.shortcut && (
                        <kbd className="px-1.5 py-0.5 bg-surface-1 text-xs text-muted rounded">
                          {item.shortcut}
                        </kbd>
                      )}
                      {isSelected && (
                        <ArrowRight className="size-4 text-muted" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-surface-1 flex items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-surface-1 rounded">↑↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-surface-1 rounded">↵</kbd>
              select
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Command className="size-3" />K to open
          </span>
        </div>
      </div>
    </>
  );
}
