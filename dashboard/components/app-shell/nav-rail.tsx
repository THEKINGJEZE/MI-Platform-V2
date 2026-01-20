"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Sun,
  Moon,
  Settings,
  Focus,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const primaryNavItems: NavItem[] = [
  { icon: Focus, label: "Review", href: "/review" },
  { icon: Shield, label: "Forces", href: "/forces" },
  { icon: LayoutDashboard, label: "Board", href: "/board" },
];

const ritualNavItems: NavItem[] = [
  { icon: Sun, label: "Morning", href: "/morning" },
  { icon: Moon, label: "EOD", href: "/eod" },
];

interface NavRailProps {
  className?: string;
  dimmed?: boolean;
}

export function NavRail({ className, dimmed = false }: NavRailProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        "w-16 bg-surface-0 border-r border-surface-1 flex flex-col py-4",
        dimmed && "sidebar-dimmed",
        className
      )}
    >
      {/* Primary Navigation */}
      <div className="flex flex-col items-center gap-1 px-2" role="list">
        {primaryNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "w-full flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-colors",
                // Minimum touch target 44x44px
                "min-h-[44px]",
                isActive
                  ? "bg-action/15 text-action nav-item-active"
                  : "text-muted hover:text-secondary hover:bg-surface-1"
              )}
              title={item.label}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Separator */}
      <div className="my-4 mx-3 border-t border-surface-1" />

      {/* Ritual Navigation */}
      <div
        className="flex flex-col items-center gap-1 px-2"
        role="list"
        aria-label="Daily rituals"
      >
        {ritualNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "w-full flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-colors",
                // Minimum touch target 44x44px
                "min-h-[44px]",
                isActive
                  ? "bg-action/15 text-action nav-item-active"
                  : "text-muted hover:text-secondary hover:bg-surface-1"
              )}
              title={item.label}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" aria-hidden="true" />

      {/* Settings at bottom */}
      <div className="flex flex-col items-center px-2">
        <Link
          href="/settings"
          aria-current={pathname === "/settings" ? "page" : undefined}
          className={cn(
            "w-full flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-colors",
            // Minimum touch target 44x44px
            "min-h-[44px]",
            pathname === "/settings"
              ? "bg-action/15 text-action nav-item-active"
              : "text-muted hover:text-secondary hover:bg-surface-1"
          )}
          title="Settings"
        >
          <Settings className="h-5 w-5" aria-hidden="true" />
          <span className="text-[10px] font-medium">Settings</span>
        </Link>
      </div>
    </nav>
  );
}
