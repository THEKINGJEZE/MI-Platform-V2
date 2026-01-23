// @ts-nocheck
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  EmailQueuePanel,
  EmailNowCard,
  EmailActionPanel,
  type EmailQueueMode,
} from "@/components/email-mode";
import { NavRail } from "@/components/app-shell/nav-rail";
import { SessionHeader } from "@/components/focus-mode";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { CardSkeleton } from "@/components/feedback/card-skeleton";
import { useToast } from "@/components/feedback/toast";
import type { Email } from "@/lib/types/email";

// Undo buffer duration (30 seconds)
const UNDO_BUFFER_MS = 30000;

// Make.com webhook URLs for email actions
const MAKE_WEBHOOKS = {
  draftReply: "https://hook.eu2.make.com/5vldcow7gpmx847e48l7mm12t6jlnr74",
  moveEmail: "https://hook.eu2.make.com/9h0gbl5rekjux8yvza6reiysdr3wk3on",
};

// Pending action for undo stack
interface PendingAction {
  id: string;
  action: "approve" | "skip" | "archive";
  email: Email;
  originalIndex: number;
  timerId: ReturnType<typeof setTimeout>;
  toastId: string;
}

/**
 * Email Page - Three-Zone Layout for Email Focus Mode
 *
 * Per ADHD-first design:
 * - Left: Email Queue (filtered by priority)
 * - Center: Current Email context
 * - Right: Draft response + actions
 *
 * Keyboard navigation:
 * - J/K: Navigate through queue
 * - E: Approve draft (creates Outlook draft via Make.com)
 * - S: Skip (move to @Review)
 * - D: Archive
 * - Z: Undo last action (within 30 seconds)
 */
export default function EmailPage() {
  // Toast notifications
  const { addToast, removeToast } = useToast();

  // Undo stack for pending actions
  const undoStackRef = useRef<PendingAction[]>([]);

  // State
  const [emails, setEmails] = useState<Email[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [queueMode, setQueueMode] = useState<EmailQueueMode>("urgent");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Session stats
  const [sessionStats, setSessionStats] = useState({
    processed: 0,
    total: 0,
    startTime: Date.now(),
    actionTimes: [] as number[],
  });

  // Load emails
  const loadEmails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/emails?limit=50");
      if (!response.ok) {
        throw new Error("Failed to fetch emails");
      }

      const data = await response.json();
      const emailList = data.data || [];

      setEmails(emailList);

      // Select first email matching current filter, or first email
      const filtered = queueMode === "all"
        ? emailList
        : emailList.filter((e: Email) => e.classification.toLowerCase() === queueMode);
      setCurrentId(filtered[0]?.id || emailList[0]?.id || null);

      setSessionStats((prev) => ({
        ...prev,
        total: emailList.length,
      }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [queueMode]);

  // Initial load
  useEffect(() => {
    loadEmails();
  }, [loadEmails]);

  // Filter emails by queue mode
  const filteredEmails = queueMode === "all"
    ? emails
    : emails.filter((e) => e.classification.toLowerCase() === queueMode);

  // Current email
  const currentEmail = emails.find((e) => e.id === currentId);
  const currentIndex = filteredEmails.findIndex((e) => e.id === currentId);

  // Navigation
  const selectNext = useCallback(() => {
    if (currentIndex < filteredEmails.length - 1) {
      setCurrentId(filteredEmails[currentIndex + 1].id);
    }
  }, [currentIndex, filteredEmails]);

  const selectPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentId(filteredEmails[currentIndex - 1].id);
    }
  }, [currentIndex, filteredEmails]);

  // Execute pending action (called after undo window expires)
  const executePendingAction = useCallback(
    async (pendingAction: PendingAction) => {
      const { id, action, email } = pendingAction;
      const subject = email.subject.slice(0, 30) + "...";

      try {
        // Update status in Airtable
        const response = await fetch(`/api/emails/${email.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: action === "approve" ? "approve" : action,
            status: action === "approve" ? "approved" : action === "archive" ? "done" : undefined,
          }),
        });
        if (!response.ok) throw new Error(`Failed to ${action}`);

        // For approve action, call Make.com to create Outlook draft
        if (action === "approve" && email.draftResponse) {
          try {
            await fetch(MAKE_WEBHOOKS.draftReply, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email_id: email.emailId,
                draft_body: email.draftResponse,
              }),
            });
          } catch (makeErr) {
            console.error("Make.com draft creation failed:", makeErr);
            // Non-fatal - draft still approved in Airtable
          }
        }

        // For archive, call Make.com to move email
        if (action === "archive") {
          try {
            await fetch(MAKE_WEBHOOKS.moveEmail, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email_id: email.emailId,
                target_folder: "Archive",
              }),
            });
          } catch (makeErr) {
            console.error("Make.com email move failed:", makeErr);
          }
        }

        // Remove from undo stack
        undoStackRef.current = undoStackRef.current.filter((p) => p.id !== id);

        // Update toast to confirmed
        removeToast(pendingAction.toastId);
        addToast({
          type: "success",
          title: action === "approve" ? "Draft created" : action === "skip" ? "Skipped" : "Archived",
          description: subject,
          duration: 3000,
        });
      } catch (err) {
        console.error(`Failed to execute ${action}:`, err);
        // Restore on failure
        undoStackRef.current = undoStackRef.current.filter((p) => p.id !== id);
        setEmails((prev) => {
          const newList = [...prev];
          newList.splice(pendingAction.originalIndex, 0, email);
          return newList;
        });
        addToast({
          type: "error",
          title: "Action failed",
          description: `Could not ${action} email. Restored to queue.`,
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

    // Restore email to queue at original position
    setEmails((prev) => {
      const newList = [...prev];
      newList.splice(lastPending.originalIndex, 0, lastPending.email);
      return newList;
    });

    // Select the restored item
    setCurrentId(lastPending.email.id);

    // Update session stats
    setSessionStats((prev) => ({
      ...prev,
      processed: Math.max(0, prev.processed - 1),
      actionTimes: prev.actionTimes.slice(0, -1),
    }));

    // Remove from undo stack
    undoStackRef.current = undoStackRef.current.filter(
      (p) => p.id !== lastPending.id
    );

    addToast({
      type: "success",
      title: "Undone",
      description: `Email restored to queue`,
      duration: 3000,
    });
  }, [addToast, removeToast]);

  // Handle email action
  const handleAction = useCallback(
    (action: "approve" | "skip" | "archive" | "edit") => {
      if (!currentId) return;

      // Edit action opens a modal (not implemented yet)
      if (action === "edit") {
        addToast({
          type: "info",
          title: "Edit mode",
          description: "Draft editing coming soon",
          duration: 2000,
        });
        return;
      }

      const email = emails.find((e) => e.id === currentId);
      if (!email) return;

      const subject = email.subject.slice(0, 30) + "...";
      const originalIndex = currentIndex;
      const pendingId = `pending-${Date.now()}`;

      // Remove from visible queue immediately (optimistic UI)
      setEmails((prev) => prev.filter((e) => e.id !== currentId));

      // Update session stats
      setSessionStats((prev) => ({
        ...prev,
        processed: prev.processed + 1,
        actionTimes: [...prev.actionTimes, Date.now() - prev.startTime],
      }));

      // Show undo toast with countdown
      const toastId = addToast({
        type: "undo",
        title: action === "approve" ? "Creating draft..." : action === "skip" ? "Skipping..." : "Archiving...",
        description: subject,
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
        action,
        email,
        originalIndex,
        timerId,
        toastId,
      });

      // Move to next
      selectNext();
    },
    [currentId, currentIndex, emails, selectNext, addToast, handleUndo, executePendingAction]
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
          handleAction("approve");
          break;
        case "s":
          handleAction("skip");
          break;
        case "d":
          handleAction("archive");
          break;
        case "z":
          handleUndo();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectNext, selectPrevious, handleAction, handleUndo]);

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
            title="Failed to load emails"
            message={error}
            onRetry={loadEmails}
          />
        </div>
      </div>
    );
  }

  // Empty state
  if (emails.length === 0) {
    return (
      <div className="flex h-screen bg-surface-0">
        <NavRail />
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            title="Inbox Zero! 🎉"
            message="No emails to review. Check back later or sync more emails."
            action={{
              label: "Refresh",
              onClick: loadEmails,
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
          onRefresh={loadEmails}
        />

        {/* Three-Zone Layout */}
        <div className="flex flex-1 overflow-hidden gap-4 p-4">
          {/* Left: Email Queue Panel */}
          <div className="w-80 shrink-0 rounded-lg border border-surface-1 overflow-hidden">
            <EmailQueuePanel
              emails={emails}
              currentEmailId={currentId}
              queueMode={queueMode}
              onSelectEmail={setCurrentId}
              onQueueModeChange={setQueueMode}
              onRefresh={loadEmails}
              className="h-full"
            />
          </div>

          {/* Center: Email Now Card */}
          <div className="flex-1 overflow-y-auto rounded-lg border border-surface-1">
            {currentEmail ? (
              <EmailNowCard email={currentEmail} className="border-0 shadow-none h-full" />
            ) : (
              <EmptyState
                title="No Selection"
                message="Select an email from the queue"
              />
            )}
          </div>

          {/* Right: Action Panel */}
          <div className="w-96 shrink-0 rounded-lg border border-surface-1 overflow-hidden">
            <EmailActionPanel
              email={currentEmail || null}
              onAction={handleAction}
              className="h-full border-0 shadow-none rounded-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
