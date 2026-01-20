// @ts-nocheck
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  QueuePanel,
  NowCard,
  ActionPanel,
  SessionHeader,
  DismissModal,
  type QueueMode,
} from "@/components/focus-mode";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { CardSkeleton } from "@/components/feedback/card-skeleton";
import type { Opportunity } from "@/lib/types/opportunity";

/**
 * Review Page - Three-Zone Layout
 *
 * Implements the Monday review interface per SPEC-009:
 * - Left: Queue Panel (opportunity list)
 * - Center: Now Card (current opportunity context)
 * - Right: Action Panel (outreach draft + actions)
 *
 * Keyboard navigation:
 * - J/K: Navigate through queue
 * - E: Send email
 * - S: Skip
 * - D: Dismiss with reason
 */
export default function ReviewPage() {
  // State
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [queueMode, setQueueMode] = useState<QueueMode>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDismissModal, setShowDismissModal] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);

  // Session stats
  const [sessionStats, setSessionStats] = useState({
    processed: 0,
    total: 0,
    startTime: Date.now(),
    actionTimes: [] as number[],
  });

  // Load opportunities
  const loadOpportunities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("status", "ready");
      params.set("limit", "50");

      const response = await fetch(`/api/opportunities?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch opportunities");
      }

      const data = await response.json();
      const opps = data.opportunities || [];

      // Filter by queue mode
      const filtered =
        queueMode === "hot"
          ? opps.filter((o: Opportunity) => o.priorityTier === "hot")
          : opps;

      // Sort: hot first, then by createdAt
      const sorted = [...filtered].sort((a, b) => {
        const priorityOrder = { hot: 0, high: 1, medium: 2, low: 3 };
        const priorityDiff =
          (priorityOrder[a.priorityTier] || 3) -
          (priorityOrder[b.priorityTier] || 3);
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setOpportunities(sorted);
      setCurrentId(sorted[0]?.id || null);
      setSessionStats((prev) => ({
        ...prev,
        total: sorted.length,
      }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [queueMode]);

  // Initial load
  useEffect(() => {
    loadOpportunities();
  }, [loadOpportunities]);

  // Current opportunity
  const currentOpportunity = opportunities.find((o) => o.id === currentId);
  const currentIndex = opportunities.findIndex((o) => o.id === currentId);

  // Navigation
  const selectNext = useCallback(() => {
    if (currentIndex < opportunities.length - 1) {
      setCurrentId(opportunities[currentIndex + 1].id);
    }
  }, [currentIndex, opportunities]);

  const selectPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentId(opportunities[currentIndex - 1].id);
    }
  }, [currentIndex, opportunities]);

  // Actions
  const handleSend = useCallback(async () => {
    if (!currentId) return;

    try {
      const response = await fetch(`/api/opportunities/${currentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "sent" }),
      });

      if (!response.ok) {
        throw new Error("Failed to update opportunity");
      }

      // Update local state
      setOpportunities((prev) => prev.filter((o) => o.id !== currentId));
      setSessionStats((prev) => ({
        ...prev,
        processed: prev.processed + 1,
        actionTimes: [...prev.actionTimes, Date.now() - prev.startTime],
      }));

      // Move to next
      selectNext();
    } catch (err) {
      console.error("Failed to send:", err);
    }
  }, [currentId, selectNext]);

  const handleSkip = useCallback(async () => {
    if (!currentId) return;

    try {
      const response = await fetch(`/api/opportunities/${currentId}/dismiss`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Skipped" }),
      });

      if (!response.ok) {
        throw new Error("Failed to skip opportunity");
      }

      // Update local state
      setOpportunities((prev) => prev.filter((o) => o.id !== currentId));
      selectNext();
    } catch (err) {
      console.error("Failed to skip:", err);
    }
  }, [currentId, selectNext]);

  const handleDismiss = useCallback(
    async (reason: string) => {
      if (!currentId) return;

      setIsDismissing(true);
      try {
        const response = await fetch(`/api/opportunities/${currentId}/dismiss`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        });

        if (!response.ok) {
          throw new Error("Failed to dismiss opportunity");
        }

        // Update local state
        setOpportunities((prev) => prev.filter((o) => o.id !== currentId));
        setShowDismissModal(false);
        selectNext();
      } catch (err) {
        console.error("Failed to dismiss:", err);
      } finally {
        setIsDismissing(false);
      }
    },
    [currentId, selectNext]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "j":
          selectNext();
          break;
        case "k":
          selectPrevious();
          break;
        case "e":
          handleSend();
          break;
        case "s":
          handleSkip();
          break;
        case "d":
          setShowDismissModal(true);
          break;
        case "escape":
          setShowDismissModal(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectNext, selectPrevious, handleSend, handleSkip]);

  // Calculate average time
  const averageTime =
    sessionStats.actionTimes.length > 0
      ? Math.round(
          sessionStats.actionTimes.reduce((a, b) => a + b, 0) /
            sessionStats.actionTimes.length /
            1000
        )
      : 0;

  const percentage =
    sessionStats.total > 0
      ? Math.round((sessionStats.processed / sessionStats.total) * 100)
      : 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-surface-0">
        <div className="w-80 border-r border-surface-1 p-4">
          <CardSkeleton />
        </div>
        <div className="flex-1 p-6">
          <CardSkeleton />
        </div>
        <div className="w-96 border-l border-surface-1 p-4">
          <CardSkeleton />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-0">
        <ErrorState
          title="Failed to load opportunities"
          message={error}
          onRetry={loadOpportunities}
        />
      </div>
    );
  }

  // Empty state
  if (opportunities.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-0">
        <EmptyState
          title="Queue Clear"
          message="No opportunities to review. Check back later or adjust your queue mode."
          action={{
            label: "Refresh",
            onClick: loadOpportunities,
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-surface-0">
      {/* Session Header */}
      <SessionHeader
        processed={sessionStats.processed}
        total={sessionStats.total}
        percentage={percentage}
        averageTime={averageTime}
        allTimeProcessed={sessionStats.processed}
        onRefresh={loadOpportunities}
      />

      {/* Three-Zone Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Queue Panel */}
        <QueuePanel
          opportunities={opportunities}
          currentOpportunityId={currentId}
          queueMode={queueMode}
          onSelectOpportunity={setCurrentId}
          onQueueModeChange={setQueueMode}
          onRefresh={loadOpportunities}
          className="w-80 shrink-0"
        />

        {/* Center: Now Card */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentOpportunity ? (
            <NowCard opportunity={currentOpportunity} />
          ) : (
            <EmptyState
              title="No Selection"
              message="Select an opportunity from the queue"
            />
          )}
        </div>

        {/* Right: Action Panel */}
        <ActionPanel
          opportunity={currentOpportunity || null}
          onAction={(action) => {
            if (action === "email") handleSend();
            else if (action === "skip") handleSkip();
          }}
          className="w-96 shrink-0 border-l border-surface-1"
        />
      </div>

      {/* Dismiss Modal */}
      <DismissModal
        open={showDismissModal}
        onClose={() => setShowDismissModal(false)}
        onDismiss={handleDismiss}
        isLoading={isDismissing}
      />
    </div>
  );
}
