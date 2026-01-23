// @ts-nocheck
"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  ChevronRight,
  Mail,
  AlertCircle,
  Clock,
  Calendar,
  Archive,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Email, EmailClassification } from "@/lib/types/email";
import { CLASSIFICATION_CONFIG } from "@/lib/types/email";

// Check for reduced motion preference
const prefersReducedMotion =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

// Animation variants for queue items
const itemVariants = {
  initial: prefersReducedMotion
    ? { opacity: 1 }
    : { opacity: 0, x: -20 },
  animate: prefersReducedMotion
    ? { opacity: 1 }
    : { opacity: 1, x: 0 },
  exit: prefersReducedMotion
    ? { opacity: 0 }
    : { opacity: 0, x: -100, transition: { duration: 0.2 } },
};

export type EmailQueueMode = "all" | "urgent" | "today" | "week";

interface EmailQueuePanelProps {
  emails: Email[];
  currentEmailId: string | null;
  queueMode: EmailQueueMode;
  onSelectEmail: (id: string) => void;
  onQueueModeChange: (mode: EmailQueueMode) => void;
  onRefresh?: () => void;
  className?: string;
}

/**
 * Email Queue Panel - Left zone showing email list
 *
 * Per ADHD-first design:
 * - Focus Mode: max 5 urgent/today emails
 * - Filter by classification
 * - J/K keyboard navigation
 */
export function EmailQueuePanel({
  emails,
  currentEmailId,
  queueMode,
  onSelectEmail,
  onQueueModeChange,
  onRefresh,
  className,
}: EmailQueuePanelProps) {
  // Count by classification
  const counts = {
    urgent: emails.filter((e) => e.classification === "Urgent").length,
    today: emails.filter((e) => e.classification === "Today").length,
    week: emails.filter((e) => e.classification === "Week").length,
    all: emails.length,
  };

  // Filter emails by mode
  const filteredEmails = queueMode === "all"
    ? emails
    : emails.filter((e) => e.classification.toLowerCase() === queueMode);

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-surface-0",
        className
      )}
    >
      {/* Queue Mode Tabs */}
      <div className="p-3 border-b border-surface-1">
        <div className="flex items-center gap-2">
          {/* Segmented Control */}
          <div className="flex flex-1 p-1 bg-surface-1 rounded-lg">
            <button
              className={cn(
                "flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all",
                queueMode === "urgent"
                  ? "bg-error/20 text-error shadow-sm"
                  : "text-muted hover:text-secondary"
              )}
              onClick={() => onQueueModeChange("urgent")}
            >
              <AlertCircle className="h-3 w-3" />
              {counts.urgent}
            </button>
            <button
              className={cn(
                "flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all",
                queueMode === "today"
                  ? "bg-warning/20 text-warning shadow-sm"
                  : "text-muted hover:text-secondary"
              )}
              onClick={() => onQueueModeChange("today")}
            >
              <Clock className="h-3 w-3" />
              {counts.today}
            </button>
            <button
              className={cn(
                "flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all",
                queueMode === "week"
                  ? "bg-success/20 text-success shadow-sm"
                  : "text-muted hover:text-secondary"
              )}
              onClick={() => onQueueModeChange("week")}
            >
              <Calendar className="h-3 w-3" />
              {counts.week}
            </button>
            <button
              className={cn(
                "flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all",
                queueMode === "all"
                  ? "bg-surface-0 text-primary shadow-sm"
                  : "text-muted hover:text-secondary"
              )}
              onClick={() => onQueueModeChange("all")}
            >
              <Mail className="h-3 w-3" />
              All
            </button>
          </div>
          {onRefresh && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted hover:text-secondary shrink-0"
              onClick={onRefresh}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Queue Stats */}
      <div className="px-3 py-2 border-b border-surface-1 bg-surface-1/30">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">
            {filteredEmails.length} email{filteredEmails.length !== 1 && "s"}
          </span>
          <span className="text-muted">
            {queueMode === "all" ? "All priorities" : `${queueMode.charAt(0).toUpperCase() + queueMode.slice(1)} only`}
          </span>
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {filteredEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <Mail className="h-8 w-8 text-muted mb-2" />
            <p className="text-muted text-sm">No emails in this queue</p>
            <p className="text-muted text-xs mt-1">
              Try a different filter
            </p>
          </div>
        ) : (
          <div className="divide-y divide-surface-1">
            <AnimatePresence mode="popLayout" initial={false}>
              {filteredEmails.map((email, index) => (
                <motion.div
                  key={email.id}
                  variants={itemVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  layout={!prefersReducedMotion}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.2,
                    layout: { duration: 0.2 },
                  }}
                >
                  <EmailQueueItem
                    email={email}
                    isActive={email.id === currentEmailId}
                    index={index}
                    onClick={() => onSelectEmail(email.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Keyboard hint */}
      <div className="p-2 border-t border-surface-1 text-center">
        <p className="text-[11px] text-muted">
          Press{" "}
          <kbd className="px-1 py-0.5 bg-surface-1 rounded text-[10px]">J</kbd>{" "}
          /{" "}
          <kbd className="px-1 py-0.5 bg-surface-1 rounded text-[10px]">K</kbd>{" "}
          to navigate
        </p>
      </div>
    </div>
  );
}

/**
 * Email Queue Item - Individual email in the queue
 */
function EmailQueueItem({
  email,
  isActive,
  index,
  onClick,
}: {
  email: Email;
  isActive: boolean;
  index: number;
  onClick: () => void;
}) {
  const config = CLASSIFICATION_CONFIG[email.classification];

  // Format relative time
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <button
      className={cn(
        "w-full text-left p-3 transition-colors",
        "hover:bg-surface-1/50",
        isActive && "bg-action/10 border-l-2 border-action"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Left: Sender + Subject */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            {isActive && (
              <ChevronRight className="h-3 w-3 text-action flex-shrink-0" />
            )}
            <span className="text-sm mr-1">{config.emoji}</span>
            <span
              className={cn(
                "font-medium truncate text-sm",
                isActive ? "text-primary" : "text-secondary"
              )}
            >
              {email.fromName}
            </span>
          </div>

          {/* Subject */}
          <p className="text-xs text-muted truncate pl-5">
            {email.subject}
          </p>

          {/* Preview + Time */}
          <div className="flex items-center gap-2 pl-5">
            <span className="text-[10px] text-muted truncate flex-1">
              {email.bodyPreview.slice(0, 60)}...
            </span>
            <span className="text-[10px] text-muted shrink-0">
              {formatRelativeTime(email.receivedAt)}
            </span>
          </div>
        </div>

        {/* Right: Action Type Badge */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {email.actionType === "Reply" && (
            <Badge variant="default" className="text-[10px]">Reply</Badge>
          )}
          {email.force && (
            <span className="text-[10px] text-muted">{email.force.name}</span>
          )}
        </div>
      </div>
    </button>
  );
}
