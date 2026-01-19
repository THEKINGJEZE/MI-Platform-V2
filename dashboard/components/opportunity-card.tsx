'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PriorityBadge, StatusBadge, ChannelBadge, SignalCountBadge } from './mi-badge';
import { MessageEditor } from './message-editor';
import { ActionButtons } from './action-buttons';
import type { OpportunityExpanded } from '@/lib/airtable';

interface OpportunityCardProps {
  opportunity: OpportunityExpanded & { id: string };
  onSendEmail: () => void;
  onSendLinkedIn: () => void;
  onSkip: (reason?: string) => void;
  onUpdateMessage: (message: string) => void;
  isLoading?: boolean;
}

/**
 * Opportunity Card Component
 *
 * Per SPEC-007 §5.1, displays:
 * - Force name (large header)
 * - Badges: priority_tier, outreach_channel, signal_count
 * - Why Now: 2-3 sentences
 * - Contact: name, role, email
 * - Message: editable textarea
 * - Subject: editable (email only)
 * - Actions: Send, LinkedIn, Skip
 */
export function OpportunityCard({
  opportunity,
  onSendEmail,
  onSendLinkedIn,
  onSkip,
  onUpdateMessage,
  isLoading = false,
}: OpportunityCardProps) {
  const isHot = opportunity.priority_tier?.toLowerCase() === 'hot';

  // Get display names from lookup fields or fall back to base fields
  const forceName = opportunity.force_name?.[0] || opportunity.name || 'Unknown Force';
  const contactName = opportunity.contact_name?.[0];
  const contactEmail = opportunity.contact_email?.[0];

  return (
    <Card className={`${isHot ? 'border-red-500/50 bg-red-500/5' : ''}`}>
      <CardHeader className="pb-2">
        {/* Force Name + Badges Row */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {forceName}
            </h3>
            {/* Contact Info */}
            {contactName && (
              <p className="mt-1 text-sm text-muted-foreground">
                {contactName}
                {contactEmail && ` • ${contactEmail}`}
              </p>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {opportunity.priority_tier && (
              <PriorityBadge priority={opportunity.priority_tier} />
            )}
            {opportunity.outreach_channel && (
              <ChannelBadge channel={opportunity.outreach_channel} />
            )}
            {typeof opportunity.signal_count === 'number' && (
              <SignalCountBadge count={opportunity.signal_count} />
            )}
            {opportunity.status && (
              <StatusBadge status={opportunity.status} />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Why Now Section */}
        {opportunity.why_now && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Why Now</h4>
            <p className="text-sm text-foreground">{opportunity.why_now}</p>
          </div>
        )}

        {/* Signal Types */}
        {opportunity.signal_types && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Signals</h4>
            <p className="text-xs text-muted-foreground">{opportunity.signal_types}</p>
          </div>
        )}

        {/* Message Editor */}
        <MessageEditor
          value={opportunity.outreach_draft || ''}
          onChange={onUpdateMessage}
          disabled={isLoading}
          label="Message"
        />

        {/* Action Buttons */}
        <ActionButtons
          channel={opportunity.outreach_channel || 'email'}
          onSendEmail={onSendEmail}
          onSendLinkedIn={onSendLinkedIn}
          onSkip={onSkip}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}

// Export contact_linkedin_url getter for page.tsx
export function getContactLinkedIn(opportunity: OpportunityExpanded): string | undefined {
  return opportunity.contact_linkedin?.[0];
}
