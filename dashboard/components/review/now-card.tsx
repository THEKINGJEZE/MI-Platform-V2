/**
 * Now Card — Center zone showing opportunity context
 *
 * Per SPEC-007b (MVP): Force, Why Now, Signals, Contact
 * Score breakdowns deferred to SPEC-007a
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
import { Lightbulb, BarChart3, User, ExternalLink } from 'lucide-react';

export function NowCard() {
  const opportunity = useCurrentOpportunity();

  if (!opportunity) {
    return <NowCardEmpty />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <NowCardHeader opportunity={opportunity} />

      {/* Why Now Section */}
      <WhyNowSection whyNow={opportunity.whyNow} />

      {/* Signals Section */}
      <SignalsSection
        signalCount={opportunity.signalCount}
        signalTypes={opportunity.signalTypes}
      />

      {/* Contact Section */}
      <ContactSection contact={opportunity.contact} />
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
      <PriorityBadge
        priority={opportunity.priority}
        isCompetitor={opportunity.isCompetitorIntercept}
      />
    </div>
  );
}

function PriorityBadge({
  priority,
  isCompetitor,
}: {
  priority: string;
  isCompetitor: boolean;
}) {
  if (isCompetitor) {
    return (
      <span className="rounded-md bg-danger px-3 py-1.5 text-sm font-semibold text-primary">
        COMPETITOR
      </span>
    );
  }

  const styles = {
    Hot: 'bg-danger text-primary',
    High: 'bg-warning text-canvas',
    Medium: 'bg-action text-primary',
    Low: 'bg-surface-2 text-secondary',
  }[priority] || 'bg-surface-2 text-secondary';

  return (
    <span className={cn('rounded-md px-3 py-1.5 text-sm font-semibold', styles)}>
      {priority}
    </span>
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
}: {
  contact: ReviewOpportunity['contact'];
}) {
  return (
    <Card className="border-default bg-surface-0">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-secondary">
          <User className="h-4 w-4 text-success" />
          Contact
        </CardTitle>
      </CardHeader>
      <CardContent>
        {contact ? (
          <div className="space-y-2">
            <p className="font-medium text-primary">{contact.name}</p>
            {contact.title && (
              <p className="text-sm text-secondary">{contact.title}</p>
            )}
            <div className="flex flex-wrap gap-3 pt-2">
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
