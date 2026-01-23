// @ts-nocheck
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Send,
  SkipForward,
  Archive,
  Edit3,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import type { Email } from "@/lib/types/email";

interface EmailActionPanelProps {
  email: Email | null;
  onAction: (action: "approve" | "skip" | "archive" | "edit") => void;
  className?: string;
}

/**
 * Email Action Panel - Right zone showing draft response and actions
 *
 * Per G-002: Commands go to queue, not direct Outlook manipulation
 * Actions:
 * - Approve: Create draft in Outlook (via Make.com)
 * - Skip: Move to @Review, resurface later
 * - Archive: Archive with no action
 * - Edit: Open draft for editing
 */
export function EmailActionPanel({
  email,
  onAction,
  className,
}: EmailActionPanelProps) {
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!email) {
    return (
      <Card className={cn("h-full flex items-center justify-center", className)}>
        <p className="text-muted text-sm">Select an email to see actions</p>
      </Card>
    );
  }

  const handleCopy = async () => {
    if (email.draftResponse) {
      await navigator.clipboard.writeText(email.draftResponse);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAction = async (action: "approve" | "skip" | "archive" | "edit") => {
    setIsSubmitting(true);
    try {
      await onAction(action);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="pb-3 border-b border-surface-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {email.actionType === "Reply" ? "Draft Response" : "Actions"}
          </CardTitle>
          {email.draftResponse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 text-xs"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4 flex flex-col">
        {/* Draft Response */}
        {email.draftResponse ? (
          <div className="flex-1 mb-4">
            <div className="h-full p-3 bg-surface-1/30 rounded-lg overflow-y-auto">
              <p className="text-sm text-primary whitespace-pre-wrap">
                {email.draftResponse}
              </p>
            </div>
          </div>
        ) : email.actionType === "Reply" ? (
          <div className="flex-1 mb-4 flex items-center justify-center">
            <div className="text-center text-muted">
              <Edit3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No draft generated</p>
              <p className="text-xs mt-1">Edit to create a response</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 mb-4 flex items-center justify-center">
            <div className="text-center text-muted">
              <Archive className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No response needed</p>
              <p className="text-xs mt-1">{email.actionType} action recommended</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {email.actionType === "Reply" && email.draftResponse && (
            <Button
              className="w-full justify-center gap-2"
              onClick={() => handleAction("approve")}
              disabled={isSubmitting}
            >
              <Send className="h-4 w-4" />
              Approve & Create Draft
              <kbd className="ml-2 px-1.5 py-0.5 bg-white/20 rounded text-[10px]">E</kbd>
            </Button>
          )}

          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1 justify-center gap-2"
              onClick={() => handleAction("skip")}
              disabled={isSubmitting}
            >
              <SkipForward className="h-4 w-4" />
              Skip
              <kbd className="ml-1 px-1.5 py-0.5 bg-surface-1 rounded text-[10px]">S</kbd>
            </Button>

            <Button
              variant="ghost"
              className="flex-1 justify-center gap-2"
              onClick={() => handleAction("archive")}
              disabled={isSubmitting}
            >
              <Archive className="h-4 w-4" />
              Archive
              <kbd className="ml-1 px-1.5 py-0.5 bg-surface-1 rounded text-[10px]">D</kbd>
            </Button>
          </div>

          {email.actionType === "Reply" && (
            <Button
              variant="outline"
              className="w-full justify-center gap-2"
              onClick={() => handleAction("edit")}
              disabled={isSubmitting}
            >
              <Edit3 className="h-4 w-4" />
              Edit Draft
            </Button>
          )}
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="mt-4 pt-3 border-t border-surface-1">
          <p className="text-[11px] text-muted text-center">
            <kbd className="px-1 py-0.5 bg-surface-1 rounded text-[10px]">E</kbd> Approve{" "}
            <kbd className="px-1 py-0.5 bg-surface-1 rounded text-[10px]">S</kbd> Skip{" "}
            <kbd className="px-1 py-0.5 bg-surface-1 rounded text-[10px]">D</kbd> Archive{" "}
            <kbd className="px-1 py-0.5 bg-surface-1 rounded text-[10px]">Z</kbd> Undo
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
