/**
 * Review Layout — Three-Zone Model
 *
 * Per SPEC-007b: Queue (280px) | Now Card (flexible) | Composer (320px)
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ReviewLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function ReviewLayout({ children, header, footer }: ReviewLayoutProps) {
  return (
    <div className="flex h-screen flex-col bg-canvas">
      {/* Header */}
      {header && (
        <header className="flex-shrink-0 border-b border-default bg-surface-0 px-4 py-3">
          {header}
        </header>
      )}

      {/* Three-Zone Content */}
      <main className="flex flex-1 overflow-hidden">{children}</main>

      {/* Footer */}
      {footer && (
        <footer className="flex-shrink-0 border-t border-default bg-surface-0 px-4 py-2">
          {footer}
        </footer>
      )}
    </div>
  );
}

interface ZoneProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Queue Zone — Left panel (280px fixed width)
 */
export function QueueZone({ children, className }: ZoneProps) {
  return (
    <aside
      className={cn(
        'w-[var(--queue-width)] flex-shrink-0 overflow-y-auto border-r border-default bg-surface-0',
        className
      )}
      style={{ width: 'var(--queue-width, 280px)' }}
    >
      {children}
    </aside>
  );
}

/**
 * Now Zone — Center panel (flexible width)
 */
export function NowZone({ children, className }: ZoneProps) {
  return (
    <section
      className={cn(
        'flex-1 overflow-y-auto bg-canvas p-6',
        'min-w-[var(--now-card-min)]',
        className
      )}
      style={{ minWidth: 'var(--now-card-min, 400px)' }}
    >
      {children}
    </section>
  );
}

/**
 * Composer Zone — Right panel (320px fixed width)
 */
export function ComposerZone({ children, className }: ZoneProps) {
  return (
    <aside
      className={cn(
        'w-[var(--composer-width)] flex-shrink-0 overflow-y-auto border-l border-default bg-surface-0',
        className
      )}
      style={{ width: 'var(--composer-width, 320px)' }}
    >
      {children}
    </aside>
  );
}

/**
 * Keyboard Hints Footer
 */
export function KeyboardHints() {
  return (
    <div className="flex items-center justify-center gap-6 text-xs text-muted">
      <span>
        <kbd className="rounded bg-surface-1 px-1.5 py-0.5 font-mono text-secondary">
          J
        </kbd>
        /
        <kbd className="rounded bg-surface-1 px-1.5 py-0.5 font-mono text-secondary">
          K
        </kbd>{' '}
        navigate
      </span>
      <span>
        <kbd className="rounded bg-surface-1 px-1.5 py-0.5 font-mono text-secondary">
          E
        </kbd>{' '}
        Send
      </span>
      <span>
        <kbd className="rounded bg-surface-1 px-1.5 py-0.5 font-mono text-secondary">
          S
        </kbd>{' '}
        Skip
      </span>
      <span>
        <kbd className="rounded bg-surface-1 px-1.5 py-0.5 font-mono text-secondary">
          D
        </kbd>{' '}
        Dismiss
      </span>
      <span>
        <kbd className="rounded bg-surface-1 px-1.5 py-0.5 font-mono text-secondary">
          ?
        </kbd>{' '}
        Shortcuts
      </span>
    </div>
  );
}
