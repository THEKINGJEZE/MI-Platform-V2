/**
 * Now Card — Center zone showing opportunity context
 *
 * Ported from V1 structure: Single Card with ContextRow pattern
 * Data adapted from V1's scoring model to V2's priority model
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardHeader,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  useCurrentOpportunity,
  type ReviewOpportunity,
} from '@/lib/stores/review-store';
import { PriorityTierBadge } from '@/components/mi-badge';
import {
  Lightbulb,
  AlertCircle,
  ChevronRight,
  Building2,
  Clock,
  TrendingUp,
  User,
  Mail,
  Linkedin,
  CheckCircle,
  Target,
} from 'lucide-react';

export function NowCard() {
  const opportunity = useCurrentOpportunity();

  if (!opportunity) {
    return <NowCardEmpty />;
  }

  return (
    <Card className="bg-surface-0 border-surface-1">
      <CardHeader className="pb-4">
        {/* Header: Force name + Priority display (V1 style) */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1 min-w-0">
            <h2 className="text-[24px] font-semibold text-primary truncate">
              {opportunity.force?.name || opportunity.name}
            </h2>
            {opportunity.name && opportunity.name !== opportunity.force?.name && (
              <p className="text-secondary text-sm">{opportunity.name}</p>
            )}
          </div>

          {/* Priority display - V1 used large score, V2 uses priority tier */}
          <div className="flex flex-col items-end gap-1">
            {opportunity.isCompetitorIntercept ? (
              <span className="rounded-md bg-danger px-3 py-1.5 text-sm font-semibold text-primary">
                🔥 HOT
              </span>
            ) : (
              <PriorityTierBadge tier={normalizePriorityToTier(opportunity.priority)} />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Context Capsule — V1's row-based layout with icons */}
        <div className="space-y-4 p-4 rounded-lg bg-surface-1/30 border border-surface-1">
          {/* Why: Context Summary */}
          {opportunity.whyNow && (
            <ContextRow
              label="Why"
              icon={<Lightbulb className="h-4 w-4 text-warning" />}
            >
              <p className="text-secondary text-sm leading-relaxed">
                {opportunity.whyNow}
              </p>
            </ContextRow>
          )}

          {/* Urgency: Response window */}
          {opportunity.responseWindow && (
            <ContextRow
              label="Urgency"
              icon={<AlertCircle className="h-4 w-4 text-danger" />}
            >
              <TimingDisplay responseWindow={opportunity.responseWindow} />
            </ContextRow>
          )}

          {/* Next: Recommended action */}
          <ContextRow
            label="Next"
            icon={<ChevronRight className="h-4 w-4 text-action" />}
          >
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-action" />
              <span className="text-primary">
                {opportunity.contact?.name
                  ? `Email ${opportunity.contact.name}`
                  : 'Initiate outreach'}
              </span>
            </div>
          </ContextRow>

          {/* Source: Signal info */}
          <ContextRow
            label="Source"
            icon={<Building2 className="h-4 w-4 text-muted" />}
          >
            <SignalSummary
              signalCount={opportunity.signalCount}
              signalTypes={opportunity.signalTypes}
              isCompetitorIntercept={opportunity.isCompetitorIntercept}
            />
          </ContextRow>
        </div>

        {/* Metric Grid — V1's 4-column layout, adapted for V2 data */}
        <MetricGrid opportunity={opportunity} />

        {/* Contact Card — V1 style with avatar and channel buttons */}
        {opportunity.contact && (
          <ContactCard contact={opportunity.contact} />
        )}
      </CardContent>
    </Card>
  );
}

function NowCardEmpty() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-secondary">
          No opportunity selected
        </h2>
        <p className="mt-2 text-muted">
          Select an opportunity from the queue to view details
        </p>
      </div>
    </div>
  );
}

/**
 * Context Row — V1's consistent layout for context capsule items
 * Icon + Label (20px width, uppercase) + Content
 */
function ContextRow({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex items-center gap-2 w-20 shrink-0">
        {icon}
        <span className="text-[12px] font-medium text-muted uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

/**
 * Timing Display — Shows urgency based on response window
 */
function TimingDisplay({ responseWindow }: { responseWindow: string }) {
  const config =
    responseWindow === 'Same Day'
      ? { label: 'Act today', className: 'text-danger' }
      : responseWindow === 'Within 48h'
        ? { label: 'This week', className: 'text-warning' }
        : responseWindow === 'This Week'
          ? { label: 'Soon', className: 'text-action' }
          : { label: responseWindow, className: 'text-secondary' };

  return (
    <span className={cn('flex items-center gap-2', config.className)}>
      {config.label}
    </span>
  );
}

/**
 * Signal Summary — Shows signal count and types
 */
function SignalSummary({
  signalCount,
  signalTypes,
  isCompetitorIntercept,
}: {
  signalCount: number;
  signalTypes: string;
  isCompetitorIntercept: boolean;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-primary">
        {signalCount} signal{signalCount !== 1 && 's'}
      </span>
      {signalTypes && (
        <>
          <span className="text-muted">•</span>
          <span className="text-secondary text-sm">{signalTypes}</span>
        </>
      )}
      {isCompetitorIntercept && (
        <>
          <span className="text-muted">•</span>
          <span className="text-danger font-medium text-sm">Competitor signal</span>
        </>
      )}
    </div>
  );
}

/**
 * Metric Grid — V1's 4-column score display, adapted for V2 data
 */
function MetricGrid({ opportunity }: { opportunity: ReviewOpportunity }) {
  const metrics = [
    {
      name: 'Signals',
      value: opportunity.signalCount,
      icon: TrendingUp,
    },
    {
      name: 'Priority',
      value: normalizePriorityToTier(opportunity.priority),
      icon: Target,
    },
    {
      name: 'Confidence',
      value: opportunity.contact?.researchConfidence
        ? `${opportunity.contact.researchConfidence}%`
        : '—',
      icon: User,
    },
    {
      name: 'Timing',
      value: opportunity.responseWindow || '—',
      icon: Clock,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {metrics.map((metric) => (
        <div
          key={metric.name}
          className="flex flex-col items-center p-2 rounded-md bg-surface-1/50"
        >
          <metric.icon className="h-4 w-4 text-muted mb-1" />
          <span className="font-mono text-lg font-semibold text-primary tabular-nums">
            {metric.value}
          </span>
          <span className="text-[10px] text-muted uppercase tracking-wider">
            {metric.name}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Contact Card — V1 style with avatar circle and channel buttons
 */
function ContactCard({ contact }: { contact: NonNullable<ReviewOpportunity['contact']> }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-surface-1/50 border border-surface-1">
      {/* Avatar with confidence dot */}
      <div className="relative flex-shrink-0">
        <div className="h-12 w-12 rounded-full bg-surface-2 flex items-center justify-center">
          <User className="h-6 w-6 text-muted" />
        </div>
        {contact.researchConfidence !== undefined && (
          <ConfidenceDot confidence={contact.researchConfidence} />
        )}
      </div>

      {/* Contact Info */}
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-primary truncate">{contact.name}</h4>
          {contact.researchConfidence !== undefined && contact.researchConfidence >= 70 && (
            <span className="flex items-center gap-1 rounded bg-success/20 px-1.5 py-0.5 text-xs font-medium text-success">
              <CheckCircle className="h-3 w-3" />
              Verified
            </span>
          )}
        </div>
        {contact.title && (
          <p className="text-sm text-secondary truncate">{contact.title}</p>
        )}

        {/* Channel buttons — V1 style */}
        <div className="flex flex-wrap gap-2 pt-2">
          {contact.email && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-secondary hover:text-action"
              asChild
            >
              <a href={`mailto:${contact.email}`}>
                <Mail className="h-3.5 w-3.5 mr-1.5" />
                {contact.email}
              </a>
            </Button>
          )}
          {contact.linkedin && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-secondary hover:text-action"
              asChild
            >
              <a href={contact.linkedin} target="_blank" rel="noopener noreferrer">
                <Linkedin className="h-3.5 w-3.5 mr-1.5" />
                LinkedIn
              </a>
            </Button>
          )}
        </div>

        {/* Confidence sources */}
        {contact.confidenceSources && contact.confidenceSources.length > 0 && (
          <p className="text-[11px] text-muted pt-1">
            Source: {contact.confidenceSources.join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Confidence Dot — V1's semantic color indicator
 */
function ConfidenceDot({ confidence }: { confidence: number }) {
  const level = confidence >= 70 ? 'high' : confidence >= 40 ? 'medium' : confidence > 0 ? 'low' : 'none';

  const colorClasses: Record<string, string> = {
    high: 'bg-success',
    medium: 'bg-action',
    low: 'bg-warning',
    none: 'bg-danger',
  };

  const descriptions: Record<string, string> = {
    high: 'High confidence — contact verified from multiple sources',
    medium: 'Medium confidence — contact found but not fully verified',
    low: 'Low confidence — best guess based on limited data',
    none: 'No confidence — contact needs research',
  };

  return (
    <div
      className={cn(
        'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface-0',
        colorClasses[level]
      )}
      title={descriptions[level]}
    />
  );
}

/**
 * Map various priority values to P1/P2/P3 tier format
 */
function normalizePriorityToTier(priority: string): string {
  const lower = priority?.toLowerCase() || '';
  if (lower === 'hot' || lower === 'p1') return 'P1';
  if (lower === 'high' || lower === 'p2') return 'P2';
  if (lower === 'medium' || lower === 'p3') return 'P3';
  if (lower === 'low') return 'P3';
  return 'P3';
}
