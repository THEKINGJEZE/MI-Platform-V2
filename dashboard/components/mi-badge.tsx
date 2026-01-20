'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * MI Platform Badge System
 *
 * Ported from V1 dashboard with 30+ semantic variants for rapid visual scanning.
 * See docs/archive/dashboard-v1-review.md for background.
 */

const miBadgeVariants = cva(
  'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
  {
    variants: {
      // Status badges
      status: {
        new: 'bg-blue-400/10 text-blue-400 ring-blue-400/30',
        researching: 'bg-purple-400/10 text-purple-400 ring-purple-400/30',
        ready: 'bg-green-400/10 text-green-400 ring-green-400/30',
        sent: 'bg-yellow-400/10 text-yellow-400 ring-yellow-400/30',
        replied: 'bg-cyan-400/10 text-cyan-400 ring-cyan-400/30',
        meeting: 'bg-emerald-400/10 text-emerald-400 ring-emerald-400/30',
        proposal: 'bg-indigo-400/10 text-indigo-400 ring-indigo-400/30',
        won: 'bg-green-500/10 text-green-500 ring-green-500/30',
        lost: 'bg-red-400/10 text-red-400 ring-red-400/30',
        dormant: 'bg-gray-400/10 text-gray-400 ring-gray-400/30',
        skipped: 'bg-gray-400/10 text-gray-400 ring-gray-400/30',
      },
      // Priority badges
      priority: {
        hot: 'bg-red-500/10 text-red-400 ring-red-500/30',
        high: 'bg-orange-400/10 text-orange-400 ring-orange-400/30',
        medium: 'bg-yellow-400/10 text-yellow-400 ring-yellow-400/30',
        low: 'bg-gray-400/10 text-gray-400 ring-gray-400/30',
        // SPEC-007a: Priority tier variants (P1=danger, P2=warning, P3=info)
        p1: 'bg-red-500/10 text-red-400 ring-red-500/30',
        p2: 'bg-orange-400/10 text-orange-400 ring-orange-400/30',
        p3: 'bg-yellow-400/10 text-yellow-400 ring-yellow-400/30',
      },
      // SPEC-007a: Contact type badges
      contactType: {
        problem_owner: 'bg-green-400/10 text-green-400 ring-green-400/30',
        deputy: 'bg-blue-400/10 text-blue-400 ring-blue-400/30',
        hr_fallback: 'bg-amber-400/10 text-amber-400 ring-amber-400/30',
      },
      // Source badges
      source: {
        indeed: 'bg-blue-500/10 text-blue-400 ring-blue-500/30',
        competitor: 'bg-red-400/10 text-red-400 ring-red-400/30',
        tender: 'bg-purple-400/10 text-purple-400 ring-purple-400/30',
        news: 'bg-cyan-400/10 text-cyan-400 ring-cyan-400/30',
        regulatory: 'bg-amber-400/10 text-amber-400 ring-amber-400/30',
        hmicfrs: 'bg-amber-400/10 text-amber-400 ring-amber-400/30',
        email: 'bg-slate-400/10 text-slate-400 ring-slate-400/30',
      },
      // Channel badges
      channel: {
        email: 'bg-blue-400/10 text-blue-400 ring-blue-400/30',
        linkedin: 'bg-sky-400/10 text-sky-400 ring-sky-400/30',
      },
    },
    defaultVariants: {},
  }
);

// Type definitions for badge variants
type StatusVariant = 'new' | 'researching' | 'ready' | 'sent' | 'replied' | 'meeting' | 'proposal' | 'won' | 'lost' | 'dormant' | 'skipped';
type PriorityVariant = 'hot' | 'high' | 'medium' | 'low' | 'p1' | 'p2' | 'p3';
type SourceVariant = 'indeed' | 'competitor' | 'tender' | 'news' | 'regulatory' | 'hmicfrs' | 'email';
type ChannelVariant = 'email' | 'linkedin';
// SPEC-007a: Contact type variants
type ContactTypeVariant = 'problem_owner' | 'deputy' | 'hr_fallback';

type BadgeVariant = {
  status?: StatusVariant;
  priority?: PriorityVariant;
  source?: SourceVariant;
  channel?: ChannelVariant;
  contactType?: ContactTypeVariant;
};

interface MiBadgeProps extends BadgeVariant {
  children: React.ReactNode;
  className?: string;
}

/**
 * Smart badge that automatically applies the correct variant
 */
export function MiBadge({
  children,
  className,
  status,
  priority,
  source,
  channel,
  contactType,
}: MiBadgeProps) {
  // Build variant props - only one should be used at a time
  const variant = status
    ? { status }
    : priority
      ? { priority }
      : source
        ? { source }
        : channel
          ? { channel }
          : contactType
            ? { contactType }
            : {};

  return (
    <span className={cn(miBadgeVariants(variant as VariantProps<typeof miBadgeVariants>), className)}>
      {children}
    </span>
  );
}

// Convenience components for common badges
export function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = status?.toLowerCase() as StatusVariant;
  return <MiBadge status={normalizedStatus}>{status}</MiBadge>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const normalizedPriority = priority?.toLowerCase() as PriorityVariant;
  const icon = priority?.toLowerCase() === 'hot' ? '🔥 ' : '';
  return <MiBadge priority={normalizedPriority}>{icon}{priority}</MiBadge>;
}

export function SourceBadge({ source }: { source: string }) {
  const normalizedSource = source?.toLowerCase() as SourceVariant;
  return <MiBadge source={normalizedSource}>{source}</MiBadge>;
}

export function ChannelBadge({ channel }: { channel: string }) {
  const normalizedChannel = channel?.toLowerCase() as ChannelVariant;
  const icon = channel?.toLowerCase() === 'email' ? '📧 ' : channel?.toLowerCase() === 'linkedin' ? '💼 ' : '';
  return <MiBadge channel={normalizedChannel}>{icon}{channel}</MiBadge>;
}

export function SignalCountBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center rounded-md bg-slate-400/10 px-2 py-0.5 text-xs font-medium text-slate-400 ring-1 ring-inset ring-slate-400/30">
      {count} signal{count !== 1 ? 's' : ''}
    </span>
  );
}

// SPEC-007a: Priority tier badge with icon indicators
export function PriorityTierBadge({ tier }: { tier: string }) {
  // Normalize "P1", "P2", "P3" to lowercase for variant lookup
  const normalizedTier = tier?.toLowerCase() as PriorityVariant;

  // Icon and label mapping
  const tierConfig: Record<string, { icon: string; label: string }> = {
    p1: { icon: '🔴', label: 'P1' },
    p2: { icon: '🟠', label: 'P2' },
    p3: { icon: '🟡', label: 'P3' },
  };

  const config = tierConfig[normalizedTier] || { icon: '', label: tier };

  return (
    <MiBadge priority={normalizedTier}>
      {config.icon} {config.label}
    </MiBadge>
  );
}

// SPEC-007a: Contact type badge with descriptive labels
export function ContactTypeBadge({ type }: { type: string }) {
  const normalizedType = type?.toLowerCase() as ContactTypeVariant;

  // Map internal values to display labels
  const typeLabels: Record<string, string> = {
    problem_owner: 'Problem Owner',
    deputy: 'Deputy',
    hr_fallback: 'HR Fallback',
  };

  const label = typeLabels[normalizedType] || type;

  return <MiBadge contactType={normalizedType}>{label}</MiBadge>;
}

// SPEC-007a: Response window badge
export function ResponseWindowBadge({ window }: { window: string }) {
  // Different styling based on urgency
  const isUrgent = window === 'Same Day';
  const isWarm = window === 'Within 48h';

  const icon = isUrgent ? '⚡' : isWarm ? '⏰' : '📅';
  const className = isUrgent
    ? 'bg-red-500/10 text-red-400 ring-red-500/30'
    : isWarm
      ? 'bg-orange-400/10 text-orange-400 ring-orange-400/30'
      : 'bg-blue-400/10 text-blue-400 ring-blue-400/30';

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}>
      {icon} {window}
    </span>
  );
}
