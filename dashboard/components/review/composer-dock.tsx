/**
 * Composer Dock — Right zone with draft and actions
 *
 * Per SPEC-007b: Subject + body display, Send/Skip/Dismiss actions
 */

'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  useReviewStore,
  useCurrentOpportunity,
} from '@/lib/stores/review-store';
import { Send, SkipForward, X, Copy, Check } from 'lucide-react';

export function ComposerDock() {
  const opportunity = useCurrentOpportunity();
  const { markAsSent, markAsSkipped, openDismissModal, addToast } =
    useReviewStore();

  const [copied, setCopied] = React.useState(false);
  const [editedBody, setEditedBody] = React.useState('');

  // Sync edited body with opportunity
  React.useEffect(() => {
    if (opportunity?.draftBody) {
      setEditedBody(opportunity.draftBody);
    } else {
      setEditedBody('');
    }
  }, [opportunity?.id, opportunity?.draftBody]);

  if (!opportunity) {
    return <ComposerDockEmpty />;
  }

  const subject = opportunity.draftSubject || `Re: ${opportunity.force?.name || 'Opportunity'} - Peel Solutions`;
  const charCount = editedBody.length;

  const handleSend = () => {
    // Build mailto link
    const to = opportunity.contact?.email || '';
    const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(editedBody)}`;

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

  const handleSkip = () => {
    markAsSkipped(opportunity.id);

    addToast({
      type: 'undo',
      title: `Skipped: ${opportunity.force?.name || opportunity.name}`,
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

  const handleCopy = async () => {
    const fullText = `Subject: ${subject}\n\n${editedBody}`;
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full flex-col p-4">
      {/* Subject */}
      <div className="mb-4">
        <label className="mb-1 block text-xs font-medium text-muted">
          Subject
        </label>
        <div className="rounded-md bg-surface-1 px-3 py-2 text-sm text-primary">
          {subject}
        </div>
      </div>

      {/* Message Body */}
      <div className="mb-4 flex-1">
        <div className="mb-1 flex items-center justify-between">
          <label className="text-xs font-medium text-muted">Message</label>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-muted hover:text-secondary"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-success" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </button>
        </div>
        <Textarea
          value={editedBody}
          onChange={(e) => setEditedBody(e.target.value)}
          placeholder="No draft available..."
          className="h-full min-h-[200px] resize-none bg-surface-1 text-primary placeholder:text-muted"
        />
        <p className="mt-1 text-right text-xs text-muted">{charCount} chars</p>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {/* Primary Action */}
        <Button
          onClick={handleSend}
          className="w-full bg-action text-primary hover:bg-action-hover"
          size="lg"
        >
          <Send className="mr-2 h-4 w-4" />
          Send Email
          <kbd className="ml-auto rounded bg-white/20 px-1.5 py-0.5 text-xs">
            E
          </kbd>
        </Button>

        {/* Secondary Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleSkip}
            variant="outline"
            className="flex-1 border-default bg-surface-1 text-secondary hover:bg-surface-2"
          >
            <SkipForward className="mr-2 h-4 w-4" />
            Skip
            <kbd className="ml-auto rounded bg-surface-2 px-1.5 py-0.5 text-xs text-muted">
              S
            </kbd>
          </Button>

          <Button
            onClick={handleDismiss}
            variant="outline"
            className="flex-1 border-default bg-surface-1 text-secondary hover:bg-surface-2"
          >
            <X className="mr-2 h-4 w-4" />
            Dismiss
            <kbd className="ml-auto rounded bg-surface-2 px-1.5 py-0.5 text-xs text-muted">
              D
            </kbd>
          </Button>
        </div>
      </div>
    </div>
  );
}

function ComposerDockEmpty() {
  return (
    <div className="flex h-full items-center justify-center p-4">
      <div className="text-center">
        <p className="text-muted">Select an opportunity to compose</p>
      </div>
    </div>
  );
}
