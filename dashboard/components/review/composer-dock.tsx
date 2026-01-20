/**
 * Composer Dock — Right zone with draft and actions
 *
 * Ported from V1's Action Panel structure:
 * - Collapsible header with "Compose"
 * - Draft display (subject + body)
 * - Primary action: Send Email
 * - Channel alternatives: Email / Call / LinkedIn
 * - OUTCOME section: Won / Lost / Dormant
 * - Dismiss button
 * - Keyboard hints footer
 */

'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  useReviewStore,
  useCurrentOpportunity,
} from '@/lib/stores/review-store';
import {
  Send,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Mail,
  Phone,
  Linkedin,
  Trophy,
  XCircle,
  Moon,
  Ban,
} from 'lucide-react';

export function ComposerDock() {
  const opportunity = useCurrentOpportunity();
  const {
    markAsSent,
    markAsWon,
    markAsLost,
    markAsDormant,
    openDismissModal,
    addToast,
  } = useReviewStore();

  const [expanded, setExpanded] = React.useState(true);
  const [copied, setCopied] = React.useState(false);

  if (!opportunity) {
    return <ComposerDockEmpty />;
  }

  const subject =
    opportunity.draftSubject ||
    `Re: ${opportunity.force?.name || 'Opportunity'} - Peel Solutions`;
  const body = opportunity.draftBody || '';
  const hasDraft = opportunity.draftSubject || opportunity.draftBody;

  const handleSend = () => {
    // Build mailto link
    const to = opportunity.contact?.email || '';
    const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open email client
    window.open(mailtoUrl, '_blank');

    // Mark as sent (optimistic)
    markAsSent(opportunity.id);

    addToast({
      type: 'undo',
      title: `Sent: ${opportunity.force?.name || opportunity.name}`,
      description: 'Press Z to undo',
      duration: 30000,
      onUndo: () => {
        useReviewStore.getState().undo();
      },
    });
  };

  const handleCopy = async () => {
    const text = [
      `Subject: ${subject}`,
      '',
      body,
    ].join('\n');

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChannelAction = (channel: 'email' | 'phone' | 'linkedin') => {
    // Record the channel action and mark as sent
    markAsSent(opportunity.id);

    addToast({
      type: 'undo',
      title: `${channel === 'email' ? 'Emailed' : channel === 'phone' ? 'Called' : 'LinkedIn'}: ${opportunity.force?.name || opportunity.name}`,
      description: 'Press Z to undo',
      duration: 30000,
      onUndo: () => {
        useReviewStore.getState().undo();
      },
    });
  };

  const handleWon = () => {
    markAsWon(opportunity.id);

    addToast({
      type: 'success',
      title: `Won: ${opportunity.force?.name || opportunity.name}`,
      description: 'Press Z to undo',
      duration: 30000,
      onUndo: () => {
        useReviewStore.getState().undo();
      },
    });
  };

  const handleLost = () => {
    markAsLost(opportunity.id);

    addToast({
      type: 'undo',
      title: `Lost: ${opportunity.force?.name || opportunity.name}`,
      description: 'Press Z to undo',
      duration: 30000,
      onUndo: () => {
        useReviewStore.getState().undo();
      },
    });
  };

  const handleDormant = () => {
    markAsDormant(opportunity.id);

    addToast({
      type: 'undo',
      title: `Dormant: ${opportunity.force?.name || opportunity.name}`,
      description: 'Press Z to undo',
      duration: 30000,
      onUndo: () => {
        useReviewStore.getState().undo();
      },
    });
  };

  const handleDismiss = () => {
    openDismissModal();
  };

  return (
    <div className="flex flex-col h-full bg-surface-0 border-l border-surface-1">
      {/* Composer Header — V1 style with collapse toggle */}
      <div className="p-3 border-b border-surface-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-primary">Compose</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </Button>
      </div>

      {expanded && (
        <>
          {/* Draft Message Display */}
          {hasDraft ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Subject line */}
              {opportunity.draftSubject && (
                <div className="space-y-1">
                  <label className="text-[11px] text-muted uppercase tracking-wider">
                    Subject
                  </label>
                  <div className="text-sm text-primary bg-surface-1 rounded px-3 py-2">
                    {opportunity.draftSubject}
                  </div>
                </div>
              )}

              {/* Message body */}
              {body && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-muted uppercase tracking-wider">
                      Message
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="h-6 w-6 p-0"
                    >
                      {copied ? (
                        <Check className="h-3 w-3 text-success" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <div className="text-sm text-secondary bg-surface-1 rounded px-3 py-3 min-h-[150px] whitespace-pre-wrap leading-relaxed">
                    {body}
                  </div>
                </div>
              )}

              {/* Contact email */}
              {opportunity.contact?.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted" />
                  <a
                    href={`mailto:${opportunity.contact.email}`}
                    className="text-action hover:underline"
                  >
                    {opportunity.contact.email}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted">No AI draft available.</p>
                <p className="text-xs text-muted">
                  Use quick actions below to record outreach.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons — V1 style */}
          <div className="p-4 border-t border-surface-1 space-y-3">
            {/* Primary action - Email */}
            <Button
              className="w-full bg-action hover:bg-action-hover text-primary"
              onClick={handleSend}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Email
            </Button>

            {/* Channel alternatives — 3 column grid */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="bg-surface-1 hover:bg-surface-2"
                onClick={() => handleChannelAction('email')}
              >
                <Mail className="h-4 w-4 mr-1" />
                Email
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="bg-surface-1 hover:bg-surface-2"
                onClick={() => handleChannelAction('phone')}
              >
                <Phone className="h-4 w-4 mr-1" />
                Call
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="bg-surface-1 hover:bg-surface-2"
                onClick={() => handleChannelAction('linkedin')}
              >
                <Linkedin className="h-4 w-4 mr-1" />
                LinkedIn
              </Button>
            </div>

            {/* OUTCOME Divider — V1 style */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-1" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-surface-0 px-2 text-xs text-muted uppercase tracking-wider">
                  Outcome
                </span>
              </div>
            </div>

            {/* Outcome buttons — 3 column grid */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-success border-success/30 hover:bg-success/10"
                onClick={handleWon}
              >
                <Trophy className="h-4 w-4 mr-1" />
                Won
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="text-muted border-surface-2 hover:bg-surface-1"
                onClick={handleLost}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Lost
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="text-muted border-surface-2 hover:bg-surface-1"
                onClick={handleDormant}
              >
                <Moon className="h-4 w-4 mr-1" />
                Dormant
              </Button>
            </div>

            {/* Dismiss button */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-danger hover:bg-danger/10"
              onClick={handleDismiss}
            >
              <Ban className="h-4 w-4 mr-1" />
              Dismiss (Not relevant)
            </Button>
          </div>
        </>
      )}

      {/* Keyboard hints footer — V1 style */}
      <div className="p-2 border-t border-surface-1 text-center">
        <p className="text-[11px] text-muted">
          <kbd className="px-1 py-0.5 bg-surface-1 rounded text-[10px]">E</kbd>{' '}
          Send •{' '}
          <kbd className="px-1 py-0.5 bg-surface-1 rounded text-[10px]">W</kbd>{' '}
          Won •{' '}
          <kbd className="px-1 py-0.5 bg-surface-1 rounded text-[10px]">L</kbd>{' '}
          Lost •{' '}
          <kbd className="px-1 py-0.5 bg-surface-1 rounded text-[10px]">D</kbd>{' '}
          Dismiss
        </p>
      </div>
    </div>
  );
}

function ComposerDockEmpty() {
  return (
    <div className="flex flex-col h-full bg-surface-0 border-l border-surface-1">
      {/* Header */}
      <div className="p-3 border-b border-surface-1">
        <h3 className="text-sm font-medium text-muted">Compose</h3>
      </div>

      {/* Empty state */}
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-muted text-sm">Select an opportunity to compose</p>
      </div>

      {/* Keyboard hints footer */}
      <div className="p-2 border-t border-surface-1 text-center">
        <p className="text-[11px] text-muted">
          <kbd className="px-1 py-0.5 bg-surface-1 rounded text-[10px]">J</kbd>{' '}
          /{' '}
          <kbd className="px-1 py-0.5 bg-surface-1 rounded text-[10px]">K</kbd>{' '}
          navigate
        </p>
      </div>
    </div>
  );
}
