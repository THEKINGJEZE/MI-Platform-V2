/**
 * Now Card — Center zone showing opportunity context
 *
 * Per SPEC-007b (MVP): Force, Why Now, Signals, Contact
 * Per SPEC-007a: Context Capsule, Signal Pattern Cards, Contact Confidence, Response Window
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import {
  useCurrentOpportunity,
  type ReviewOpportunity,
} from '@/lib/stores/review-store';
import {
  PriorityTierBadge,
  ContactTypeBadge,
  ResponseWindowBadge,
} from '@/components/mi-badge';
import {
  Lightbulb,
  BarChart3,
  User,
  ExternalLink,
  Clock,
  AlertTriangle,
  TrendingUp,
  Shield,
  Target,
} from 'lucide-react';

export function NowCard() {
  const opportunity = useCurrentOpportunity();

  if (!opportunity) {
    return <NowCardEmpty />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header with Priority Tier */}
      <NowCardHeader opportunity={opportunity} />

      {/* SPEC-007a: Context Capsule — Why/Next/When/Source */}
      <ContextCapsule opportunity={opportunity} />

      {/* SPEC-007a: Signal Pattern Cards */}
      {opportunity.prioritySignals && opportunity.prioritySignals.length > 0 && (
        <SignalPatternCards patterns={opportunity.prioritySignals} />
      )}

      {/* Why Now Section */}
      <WhyNowSection whyNow={opportunity.whyNow} />

      {/* Signals Section */}
      <SignalsSection
        signalCount={opportunity.signalCount}
        signalTypes={opportunity.signalTypes}
      />

      {/* Contact Section with SPEC-007a confidence */}
      <ContactSection
        contact={opportunity.contact}
        contactType={opportunity.contactType}
      />
    </div>
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

function NowCardHeader({ opportunity }: { opportunity: ReviewOpportunity }) {
  // SPEC-007a: Map priority to tier format
  const tier = normalizePriorityToTier(opportunity.priority);

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-primary">
          {opportunity.force?.name || opportunity.name}
        </h1>
        {opportunity.force?.name && opportunity.name !== opportunity.force.name && (
          <p className="mt-1 text-secondary">{opportunity.name}</p>
        )}
      </div>
      <div className="flex flex-col items-end gap-2">
        {/* SPEC-007a: Priority tier badge */}
        {opportunity.isCompetitorIntercept ? (
          <span className="rounded-md bg-danger px-3 py-1.5 text-sm font-semibold text-primary">
            🔥 COMPETITOR
          </span>
        ) : (
          <PriorityTierBadge tier={tier} />
        )}
        {/* SPEC-007a: Response window badge */}
        {opportunity.responseWindow && (
          <ResponseWindowBadge window={opportunity.responseWindow} />
        )}
      </div>
    </div>
  );
}

// SPEC-007a: Map various priority values to P1/P2/P3 tier format
function normalizePriorityToTier(priority: string): string {
  const lower = priority?.toLowerCase() || '';
  if (lower === 'hot' || lower === 'p1') return 'P1';
  if (lower === 'high' || lower === 'p2') return 'P2';
  if (lower === 'medium' || lower === 'p3') return 'P3';
  if (lower === 'low') return 'P3';
  return 'P3';
}

// From V1: Confidence dot with semantic colors and tooltip
function ConfidenceDot({ confidence }: { confidence: number }) {
  // Map confidence percentage to level
  const level = confidence >= 70 ? 'high' : confidence >= 40 ? 'medium' : confidence > 0 ? 'low' : 'none';

  // Semantic colors matching V1
  const colorClasses: Record<string, string> = {
    high: 'bg-[hsl(160_84%_39%)]',     // Success green
    medium: 'bg-[hsl(217_91%_60%)]',   // Action blue
    low: 'bg-[hsl(38_92%_50%)]',       // Warning orange
    none: 'bg-[hsl(0_100%_71%)]',      // Danger red
  };

  // Tooltip descriptions
  const descriptions: Record<string, string> = {
    high: 'High confidence — contact verified from multiple sources',
    medium: 'Medium confidence — contact found but not fully verified',
    low: 'Low confidence — best guess based on limited data',
    none: 'No confidence — contact needs research',
  };

  return (
    <div
      className={cn('h-2.5 w-2.5 rounded-full flex-shrink-0', colorClasses[level])}
      title={descriptions[level]}
    />
  );
}

// SPEC-007a: Context Capsule — Quick summary of Why/Next/When/Source
function ContextCapsule({ opportunity }: { opportunity: ReviewOpportunity }) {
  const hasContent = opportunity.whyNow ||
    opportunity.responseWindow ||
    opportunity.prioritySignals?.length ||
    opportunity.isCompetitorIntercept;

  if (!hasContent) return null;

  return (
    <Card className="border-default bg-surface-0">
      <CardContent className="p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Why */}
          {opportunity.whyNow && (
            <div className="flex items-start gap-2">
              <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" />
              <div>
                <span className="text-xs font-medium uppercase text-muted">Why</span>
                <p className="text-sm text-primary line-clamp-2">{opportunity.whyNow}</p>
              </div>
            </div>
          )}

          {/* When (Response Window) */}
          {opportunity.responseWindow && (
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-action" />
              <div>
                <span className="text-xs font-medium uppercase text-muted">When</span>
                <p className="text-sm text-primary">{opportunity.responseWindow}</p>
              </div>
            </div>
          )}

          {/* Source */}
          {opportunity.isCompetitorIntercept && (
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-danger" />
              <div>
                <span className="text-xs font-medium uppercase text-muted">Source</span>
                <p className="text-sm text-danger font-medium">Competitor Signal</p>
              </div>
            </div>
          )}

          {/* Signal Count */}
          {opportunity.signalCount > 0 && (
            <div className="flex items-start gap-2">
              <BarChart3 className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
              <div>
                <span className="text-xs font-medium uppercase text-muted">Signals</span>
                <p className="text-sm text-primary">
                  {opportunity.signalCount} signal{opportunity.signalCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// SPEC-007a: Signal Pattern Cards — Visual display of detected priority signals
function SignalPatternCards({ patterns }: { patterns: string[] }) {
  // Map signal pattern strings to display info
  const patternConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    competitor: { icon: AlertTriangle, color: 'text-danger', label: 'Competitor Activity' },
    urgent: { icon: Clock, color: 'text-danger', label: 'Urgent Language' },
    volume: { icon: TrendingUp, color: 'text-warning', label: 'Volume Signal' },
    senior: { icon: Shield, color: 'text-action', label: 'Senior Role' },
    specialist: { icon: Target, color: 'text-purple-400', label: 'Specialist Role' },
    leadership: { icon: Shield, color: 'text-action', label: 'Leadership Role' },
    backlog: { icon: Clock, color: 'text-danger', label: 'Backlog Mentioned' },
  };

  return (
    <div className="flex flex-wrap gap-2">
      {patterns.map((pattern, index) => {
        const config = patternConfig[pattern.toLowerCase()] || {
          icon: Target,
          color: 'text-muted',
          label: pattern,
        };
        const Icon = config.icon;

        return (
          <div
            key={index}
            className={cn(
              'flex items-center gap-1.5 rounded-md border border-subtle bg-surface-1 px-2.5 py-1.5',
              'text-sm font-medium'
            )}
          >
            <Icon className={cn('h-4 w-4', config.color)} />
            <span className="text-secondary">{config.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function WhyNowSection({ whyNow }: { whyNow: string | null }) {
  return (
    <Card className="border-default bg-surface-0">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-secondary">
          <Lightbulb className="h-4 w-4 text-warning" />
          Why Now
        </CardTitle>
      </CardHeader>
      <CardContent>
        {whyNow ? (
          <p className="text-primary leading-relaxed">{whyNow}</p>
        ) : (
          <p className="italic text-muted">No context summary available</p>
        )}
      </CardContent>
    </Card>
  );
}

function SignalsSection({
  signalCount,
  signalTypes,
}: {
  signalCount: number;
  signalTypes: string;
}) {
  return (
    <Card className="border-default bg-surface-0">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-secondary">
          <BarChart3 className="h-4 w-4 text-action" />
          Signals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <span className="text-3xl font-bold text-primary">{signalCount}</span>
          <span className="text-secondary">
            {signalCount === 1 ? 'signal' : 'signals'}
          </span>
        </div>
        {signalTypes && (
          <p className="mt-2 text-sm text-muted">{signalTypes}</p>
        )}
      </CardContent>
    </Card>
  );
}

function ContactSection({
  contact,
  contactType,
}: {
  contact: ReviewOpportunity['contact'];
  contactType?: string;
}) {
  return (
    <Card className="border-default bg-surface-0">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-base text-secondary">
            <User className="h-4 w-4 text-success" />
            Contact
          </span>
          {/* SPEC-007a: Contact type badge */}
          {contactType && <ContactTypeBadge type={contactType} />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {contact ? (
          <div className="space-y-3">
            <div>
              <p className="font-medium text-primary">{contact.name}</p>
              {contact.title && (
                <p className="text-sm text-secondary">{contact.title}</p>
              )}
            </div>

            {/* SPEC-007a: Confidence indicator with semantic dot (from V1) */}
            {contact.researchConfidence !== undefined && (
              <div className="flex items-center gap-2">
                {/* Confidence dot with semantic color */}
                <ConfidenceDot confidence={contact.researchConfidence} />
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted">Research Confidence</span>
                    <span className="font-medium text-secondary">
                      {contact.researchConfidence}%
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        contact.researchConfidence >= 70
                          ? 'bg-success'
                          : contact.researchConfidence >= 40
                            ? 'bg-warning'
                            : 'bg-danger'
                      )}
                      style={{ width: `${contact.researchConfidence}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SPEC-007a: Confidence sources */}
            {contact.confidenceSources && contact.confidenceSources.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {contact.confidenceSources.map((source, index) => (
                  <span
                    key={index}
                    className="rounded bg-surface-2 px-1.5 py-0.5 text-xs text-muted"
                  >
                    {source.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            )}

            {/* Contact links */}
            <div className="flex flex-wrap gap-3 pt-1">
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-1 text-sm text-action hover:underline"
                >
                  {contact.email}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {contact.linkedin && (
                <a
                  href={contact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-action hover:underline"
                >
                  LinkedIn
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        ) : (
          <p className="italic text-muted">No contact assigned</p>
        )}
      </CardContent>
    </Card>
  );
}
