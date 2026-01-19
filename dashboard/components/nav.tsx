'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Kanban, Activity, Shield } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Queue', icon: Home },
  { href: '/pipeline', label: 'Pipeline', icon: Kanban },
  { href: '/signals', label: 'Signals', icon: Activity },
  { href: '/forces', label: 'Forces', icon: Shield },
];

/**
 * Navigation Component
 *
 * Per SPEC-007 §4, provides tabs for:
 * - Queue (home) — Monday review experience
 * - Pipeline — Kanban by status
 * - Signals — Raw feed for debugging
 * - Forces — Reference directory
 *
 * Email and Tenders tabs deferred to Phase 2a/2b.
 */
export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">MI</span>
            </div>
            <span className="font-semibold text-foreground hidden sm:block">
              MI Platform
            </span>
          </div>

          {/* Nav Items */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side - placeholder for future user menu */}
          <div className="w-8" />
        </div>
      </div>
    </nav>
  );
}

/**
 * Page header with title and optional subtitle
 */
export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
