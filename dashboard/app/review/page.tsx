/**
 * Monday Review Page — Three-Zone Layout
 *
 * Per SPEC-007b: Queue (280px) | Now Card (flexible) | Composer (320px)
 * Keyboard navigation, undo support, progress feedback
 */

'use client';

import * as React from 'react';
import useSWR from 'swr';
import {
  ReviewLayout,
  QueueZone,
  NowZone,
  ComposerZone,
  KeyboardHints,
} from '@/components/review/review-layout';
import { SessionHeader } from '@/components/review/session-header';
import { QueuePanel } from '@/components/review/queue-panel';
import { NowCard } from '@/components/review/now-card';
import { ComposerDock } from '@/components/review/composer-dock';
import { DismissModal } from '@/components/review/dismiss-modal';
import { ShortcutOverlay } from '@/components/review/shortcut-overlay';
import { ToastContainer } from '@/components/feedback/toast';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingSkeleton } from '@/components/feedback/loading-skeleton';
import {
  useReviewStore,
  mapOpportunityToReview,
} from '@/lib/stores/review-store';
import { useKeyboardNav } from '@/lib/hooks/use-keyboard-nav';

// Fetcher for SWR
const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch opportunities');
    return res.json();
  });

export default function ReviewPage() {
  const { setOpportunities, setLoading, setError, isLoading, error } =
    useReviewStore();

  // Fetch opportunities
  const {
    error: fetchError,
    isLoading: swrLoading,
    mutate,
  } = useSWR('/api/opportunities?status=ready', fetcher, {
    refreshInterval: 30000, // Refresh every 30s
    onSuccess: (data) => {
      // API returns { opportunities: [...] } with flattened objects
      const opportunities = data.opportunities || data.records || [];
      const mapped = opportunities.map(mapOpportunityToReview);
      setOpportunities(mapped);
      setLoading(false);
      setError(null);
    },
    onError: (err) => {
      setError(err.message);
      setLoading(false);
    },
  });

  // Sync loading state
  React.useEffect(() => {
    setLoading(swrLoading);
  }, [swrLoading, setLoading]);

  // Enable keyboard navigation
  useKeyboardNav({ enabled: true });

  const handleRefresh = () => {
    mutate();
  };

  // Error state
  if (fetchError || error) {
    return (
      <ReviewLayout
        header={<SessionHeader onRefresh={handleRefresh} isRefreshing={swrLoading} />}
        footer={<KeyboardHints />}
      >
        <div className="flex flex-1 items-center justify-center">
          <ErrorState
            message={error || fetchError?.message || 'Failed to load opportunities'}
            onRetry={handleRefresh}
          />
        </div>
      </ReviewLayout>
    );
  }

  // Loading state
  if (isLoading || swrLoading) {
    return (
      <ReviewLayout
        header={<SessionHeader onRefresh={handleRefresh} isRefreshing={true} />}
        footer={<KeyboardHints />}
      >
        <LoadingSkeleton />
      </ReviewLayout>
    );
  }

  // Empty state
  const opportunities = useReviewStore.getState().opportunities;
  const hasOpportunities = opportunities.length > 0;

  if (!hasOpportunities) {
    return (
      <ReviewLayout
        header={<SessionHeader onRefresh={handleRefresh} isRefreshing={swrLoading} />}
        footer={<KeyboardHints />}
      >
        <div className="flex flex-1 items-center justify-center">
          <EmptyState onRefresh={handleRefresh} />
        </div>
      </ReviewLayout>
    );
  }

  // Normal Three-Zone layout
  return (
    <>
      <ReviewLayout
        header={<SessionHeader onRefresh={handleRefresh} isRefreshing={swrLoading} />}
        footer={<KeyboardHints />}
      >
        <QueueZone>
          <QueuePanel />
        </QueueZone>

        <NowZone>
          <NowCard />
        </NowZone>

        <ComposerZone>
          <ComposerDock />
        </ComposerZone>
      </ReviewLayout>

      {/* Modals & Overlays */}
      <DismissModal />
      <ShortcutOverlay />
      <ToastContainer />
    </>
  );
}
