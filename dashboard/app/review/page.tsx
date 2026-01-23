// @ts-nocheck
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  QueuePanel,
  NowCard,
  ActionPanel,
  SessionHeader,
  DismissModal,
  type QueueMode,
} from "@/components/focus-mode";
import { NavRail } from "@/components/app-shell/nav-rail";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { CardSkeleton } from "@/components/feedback/card-skeleton";
import { useToast } from "@/components/feedback/toast";
import type { Opportunity } from "@/lib/types/opportunity";

// Undo buffer duration (30 seconds)
const UNDO_BUFFER_MS = 30000;

// Pending action for undo stack
interface PendingAction {
  id: string;
  action: "send" | "skip" | "dismiss";
  opportunity: Opportunity;
  originalIndex: number;
  timerId: ReturnType<typeof setTimeout>;
  toastId: string;
}

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
 * - Z: Undo last action (within 30 seconds)
 */
export default function ReviewPage() {
  // Toast notifications
  const { addToast, removeToast } = useToast();

  // Undo stack for pending actions
  const undoStackRef = useRef<PendingAction[]>([]);

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
      const opps = data.data || [];

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

  // Execute pending action (called after undo window expires)
  const executePendingAction = useCallback(
    async (pendingAction: PendingAction) => {
      const { id, action, opportunity } = pendingAction;
      const forceName = opportunity.force?.name || "opportunity";

      try {
        if (action === "send") {
          const response = await fetch(`/api/opportunities/${opportunity.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "sent" }),
          });
          if (!response.ok) throw new Error("Failed to send");
        }

        // Remove from undo stack
        undoStackRef.current = undoStackRef.current.filter((p) => p.id !== id);

        // Update toast to confirmed
        removeToast(pendingAction.toastId);
        addToast({
          type: "success",
          title: "Sent",
          description: `Outreach to ${forceName} confirmed`,
          duration: 3000,
        });
      } catch (err) {
        console.error(`Failed to execute ${action}:`, err);
        // Restore on failure
        undoStackRef.current = undoStackRef.current.filter((p) => p.id !== id);
        setOpportunities((prev) => {
          const newList = [...prev];
          newList.splice(pendingAction.originalIndex, 0, opportunity);
          return newList;
        });
        addToast({
          type: "error",
          title: "Action failed",
          description: `Could not complete action for ${forceName}. Restored to queue.`,
        });
      }
    },
    [addToast, removeToast]
  );

  // Undo the last pending action
  const handleUndo = useCallback(() => {
    const lastPending = undoStackRef.current[undoStackRef.current.length - 1];
    if (!lastPending) {
      addToast({
        type: "info",
        title: "Nothing to undo",
        description: "No recent actions to undo",
        duration: 2000,
      });
      return;
    }

    // Cancel the timer
    clearTimeout(lastPending.timerId);

    // Remove the toast
    removeToast(lastPending.toastId);

    // Restore opportunity to queue at original position
    setOpportunities((prev) => {
      const newList = [...prev];
      newList.splice(lastPending.originalIndex, 0, lastPending.opportunity);
      return newList;
    });

    // Select the restored item
    setCurrentId(lastPending.opportunity.id);

    // Update session stats (decrement if it was a send)
    if (lastPending.action === "send") {
      setSessionStats((prev) => ({
        ...prev,
        processed: Math.max(0, prev.processed - 1),
        actionTimes: prev.actionTimes.slice(0, -1),
      }));
    }

    // Remove from undo stack
    undoStackRef.current = undoStackRef.current.filter(
      (p) => p.id !== lastPending.id
    );

    addToast({
      type: "success",
      title: "Undone",
      description: `${lastPending.opportunity.force?.name || "Opportunity"} restored to queue`,
      duration: 3000,
    });
  }, [addToast, removeToast]);

  // Actions
  const handleSend = useCallback(() => {
    if (!currentId) return;

    const opp = opportunities.find((o) => o.id === currentId);
    if (!opp) return;

    const forceName = opp.force?.name || "opportunity";
    const originalIndex = currentIndex;
    const pendingId = `pending-${Date.now()}`;

    // Remove from visible queue immediately (optimistic UI)
    setOpportunities((prev) => prev.filter((o) => o.id !== currentId));

    // Update session stats
    setSessionStats((prev) => ({
      ...prev,
      processed: prev.processed + 1,
      actionTimes: [...prev.actionTimes, Date.now() - prev.startTime],
    }));

    // Show undo toast with countdown
    const toastId = addToast({
      type: "undo",
      title: "Email queued",
      description: `Outreach to ${forceName} will be sent`,
      duration: UNDO_BUFFER_MS,
      action: {
        label: "Undo",
        onClick: handleUndo,
      },
    });

    // Set timer to execute the action after buffer expires
    const timerId = setTimeout(() => {
      const pending = undoStackRef.current.find((p) => p.id === pendingId);
      if (pending) {
        executePendingAction(pending);
      }
    }, UNDO_BUFFER_MS);

    // Add to undo stack
    undoStackRef.current.push({
      id: pendingId,
      action: "send",
      opportunity: opp,
      originalIndex,
      timerId,
      toastId,
    });

    // Move to next
    selectNext();
  }, [currentId, currentIndex, opportunities, selectNext, addToast, handleUndo, executePendingAction]);

  const handleSkip = useCallback(async () => {
    if (!currentId) return;

    const opp = opportunities.find((o) => o.id === currentId);
    const forceName = opp?.force?.name || "opportunity";

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

      // Show info toast
      addToast({
        type: "info",
        title: "Skipped",
        description: `${forceName} moved to skipped`,
      });

      selectNext();
    } catch (err) {
      console.error("Failed to skip:", err);
      addToast({
        type: "error",
        title: "Failed to skip",
        description: "Could not skip opportunity. Please try again.",
      });
    }
  }, [currentId, opportunities, selectNext, addToast]);

  const handleDismiss = useCallback(
    async (reason: string) => {
      if (!currentId) return;

      const opp = opportunities.find((o) => o.id === currentId);
      const forceName = opp?.force?.name || "opportunity";

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

        // Show info toast
        addToast({
          type: "info",
          title: "Dismissed",
          description: `${forceName}: ${reason}`,
        });

        selectNext();
      } catch (err) {
        console.error("Failed to dismiss:", err);
        addToast({
          type: "error",
          title: "Failed to dismiss",
          description: "Could not dismiss opportunity. Please try again.",
        });
      } finally {
        setIsDismissing(false);
      }
    },
    [currentId, opportunities, selectNext, addToast]
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
        case "z":
          handleUndo();
          break;
        case "escape":
          setShowDismissModal(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectNext, selectPrevious, handleSend, handleSkip, handleUndo]);

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
        <NavRail />
        <div className="flex flex-1 gap-4 p-4">
          <div className="w-80 shrink-0 rounded-lg border border-surface-1 p-4">
            <CardSkeleton />
          </div>
          <div className="flex-1 rounded-lg border border-surface-1 p-6">
            <CardSkeleton />
          </div>
          <div className="w-96 shrink-0 rounded-lg border border-surface-1 p-4">
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen bg-surface-0">
        <NavRail />
        <div className="flex flex-1 items-center justify-center">
          <ErrorState
            title="Failed to load opportunities"
            message={error}
            onRetry={loadOpportunities}
          />
        </div>
      </div>
    );
  }

  // Empty state
  if (opportunities.length === 0) {
    return (
      <div className="flex h-screen bg-surface-0">
        <NavRail />
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            title="Queue Clear"
            message="No opportunities to review. Check back later or adjust your queue mode."
            action={{
              label: "Refresh",
              onClick: loadOpportunities,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-surface-0">
      {/* Left: Navigation Rail */}
      <NavRail />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
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
        <div className="flex flex-1 overflow-hidden gap-4 p-4">
        {/* Left: Queue Panel */}
        <div className="w-80 shrink-0 rounded-lg border border-surface-1 overflow-hidden">
          <QueuePanel
            opportunities={opportunities}
            currentOpportunityId={currentId}
            queueMode={queueMode}
            onSelectOpportunity={setCurrentId}
            onQueueModeChange={setQueueMode}
            onRefresh={loadOpportunities}
            className="h-full"
          />
        </div>

        {/* Center: Now Card */}
        <div className="flex-1 overflow-y-auto rounded-lg border border-surface-1 p-6">
          {currentOpportunity ? (
            <NowCard opportunity={currentOpportunity} className="border-0 shadow-none" />
          ) : (
            <EmptyState
              title="No Selection"
              message="Select an opportunity from the queue"
            />
          )}
        </div>

        {/* Right: Action Panel */}
        <div className="w-96 shrink-0 rounded-lg border border-surface-1 overflow-hidden">
          <ActionPanel
            opportunity={currentOpportunity || null}
            onAction={(action) => {
              if (action === "email") handleSend();
              else if (action === "skip") handleSkip();
            }}
            className="h-full border-0 shadow-none rounded-none"
          />
        </div>
        </div>
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
