'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Linkedin, SkipForward, Loader2 } from 'lucide-react';

interface ActionButtonsProps {
  channel: string;
  onSendEmail: () => void;
  onSendLinkedIn: () => void;
  onSkip: (reason?: string) => void;
  isLoading?: boolean;
}

/**
 * Action Buttons Component
 *
 * Per SPEC-007 §5.3:
 * - Send Email: POST /api/send → WF6 (G-002)
 * - LinkedIn: Copy message + open URL
 * - Skip: PATCH opportunity status → "skipped"
 */
export function ActionButtons({
  channel,
  onSendEmail,
  onSendLinkedIn,
  onSkip,
  isLoading = false,
}: ActionButtonsProps) {
  const [showSkipReason, setShowSkipReason] = useState(false);
  const [skipReason, setSkipReason] = useState('');

  const handleSkip = () => {
    if (showSkipReason && skipReason.trim()) {
      onSkip(skipReason);
      setShowSkipReason(false);
      setSkipReason('');
    } else if (!showSkipReason) {
      setShowSkipReason(true);
    } else {
      // Skip without reason
      onSkip();
      setShowSkipReason(false);
    }
  };

  const isEmail = channel === 'email';

  return (
    <div className="space-y-3 pt-2 border-t border-border">
      <div className="flex items-center gap-2">
        {isEmail ? (
          <Button
            onClick={onSendEmail}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            Send Email
          </Button>
        ) : (
          <Button
            onClick={onSendLinkedIn}
            disabled={isLoading}
            className="flex-1 bg-sky-600 hover:bg-sky-700"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Linkedin className="mr-2 h-4 w-4" />
            )}
            Send via LinkedIn
          </Button>
        )}

        <Button
          variant="outline"
          onClick={handleSkip}
          disabled={isLoading}
        >
          <SkipForward className="mr-2 h-4 w-4" />
          Skip
        </Button>
      </div>

      {/* Skip reason input */}
      {showSkipReason && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={skipReason}
            onChange={(e) => setSkipReason(e.target.value)}
            placeholder="Reason for skipping (optional)"
            className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSkip();
              if (e.key === 'Escape') {
                setShowSkipReason(false);
                setSkipReason('');
              }
            }}
            autoFocus
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowSkipReason(false);
              setSkipReason('');
            }}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleSkip}>
            Confirm Skip
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Compact action buttons for list views
 */
export function CompactActions({
  onView,
  onSkip,
}: {
  onView: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" onClick={onView}>
        View
      </Button>
      <Button variant="ghost" size="sm" onClick={onSkip}>
        <SkipForward className="h-4 w-4" />
      </Button>
    </div>
  );
}
