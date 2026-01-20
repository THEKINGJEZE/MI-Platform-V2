/**
 * Session Header — Progress tracking for dopamine feedback
 *
 * Per SPEC-007b: "Today: 3 of 12 ████░░░░░░ 25% • Avg: 1:42 [Refresh]"
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSessionProgress } from '@/lib/stores/review-store';
import { RefreshCw } from 'lucide-react';

interface SessionHeaderProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function SessionHeader({ onRefresh, isRefreshing }: SessionHeaderProps) {
  const { processed, total, percentage, averageTime } = useSessionProgress();

  // Format average time as M:SS
  const formattedTime = averageTime > 0 ? formatTime(averageTime) : '--:--';

  // Progress bar color based on percentage
  const progressColor = getProgressColor(percentage);

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Left: Progress Info */}
      <div className="flex items-center gap-4">
        <span className="font-medium text-primary">
          Today: {processed} of {total}
        </span>

        {/* Progress Bar */}
        <div className="flex items-center gap-2">
          <div className="h-2 w-32 overflow-hidden rounded-full bg-surface-1">
            <div
              className={cn('h-full rounded-full transition-all', progressColor)}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-sm text-secondary">{percentage}%</span>
        </div>

        {/* Average Time */}
        <span className="text-sm text-muted">
          Avg: <span className="font-mono">{formattedTime}</span>
        </span>
      </div>

      {/* Right: Refresh Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="text-muted hover:text-primary"
      >
        <RefreshCw
          className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
        />
        <span className="ml-2">Refresh</span>
      </Button>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getProgressColor(percentage: number): string {
  if (percentage >= 100) return 'bg-success';
  if (percentage >= 75) return 'bg-action';
  if (percentage >= 50) return 'bg-warning';
  return 'bg-muted';
}
