// @ts-nocheck
"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Mail,
  User,
  Building2,
  Clock,
  Paperclip,
  ExternalLink,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import type { Email } from "@/lib/types/email";
import { CLASSIFICATION_CONFIG } from "@/lib/types/email";

interface EmailNowCardProps {
  email: Email;
  className?: string;
}

/**
 * Email Now Card - Center zone showing current email context
 *
 * Displays:
 * - Full email details (from, subject, body preview)
 * - Classification reasoning
 * - Force/Contact context if matched
 * - Key request summary
 */
export function EmailNowCard({ email, className }: EmailNowCardProps) {
  const config = CLASSIFICATION_CONFIG[email.classification];

  // Format received time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className={cn("h-full overflow-y-auto", className)}>
      {/* Header */}
      <CardHeader className="pb-3 border-b border-surface-1">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1 min-w-0">
            {/* Classification Badge */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">{config.emoji}</span>
              <Badge
                variant={
                  email.classification === "Urgent"
                    ? "destructive"
                    : email.classification === "Today"
                    ? "warning"
                    : email.classification === "Week"
                    ? "success"
                    : "secondary"
                }
              >
                {config.label}
              </Badge>
              <Badge variant="outline">{email.actionType}</Badge>
              {email.hasOpenDeal && (
                <Badge variant="default" className="gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Open Deal
                </Badge>
              )}
            </div>

            {/* Subject */}
            <CardTitle className="text-lg leading-tight">
              {email.subject}
            </CardTitle>
          </div>

          {/* Confidence */}
          <div className="text-right shrink-0">
            <div className="text-xs text-muted">Confidence</div>
            <div className="text-lg font-semibold text-primary">
              {email.aiConfidence}%
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Sender Info */}
        <div className="flex items-start gap-3 p-3 bg-surface-1/50 rounded-lg">
          <div className="p-2 bg-surface-0 rounded-full">
            <User className="h-4 w-4 text-muted" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-primary">{email.fromName}</div>
            <div className="text-sm text-muted">{email.fromEmail}</div>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(email.receivedAt)}
              </span>
              {email.hasAttachments && (
                <span className="flex items-center gap-1">
                  <Paperclip className="h-3 w-3" />
                  Attachments
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Key Request */}
        {email.keyRequest && (
          <div className="p-3 bg-action/5 border border-action/20 rounded-lg">
            <div className="flex items-center gap-2 text-xs font-medium text-action mb-1">
              <MessageSquare className="h-3 w-3" />
              Key Request
            </div>
            <p className="text-sm text-primary">{email.keyRequest}</p>
          </div>
        )}

        {/* Body Preview */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted uppercase tracking-wide">
            Email Preview
          </div>
          <div className="p-3 bg-surface-1/30 rounded-lg">
            <p className="text-sm text-secondary whitespace-pre-wrap">
              {email.bodyPreview}
            </p>
          </div>
        </div>

        {/* Force/Contact Context */}
        {(email.force || email.contact) && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted uppercase tracking-wide">
              Context
            </div>
            <div className="flex flex-wrap gap-2">
              {email.force && (
                <div className="flex items-center gap-2 px-3 py-2 bg-surface-1/50 rounded-lg">
                  <Building2 className="h-4 w-4 text-muted" />
                  <span className="text-sm text-primary">{email.force.name}</span>
                </div>
              )}
              {email.contact && (
                <div className="flex items-center gap-2 px-3 py-2 bg-surface-1/50 rounded-lg">
                  <User className="h-4 w-4 text-muted" />
                  <span className="text-sm text-primary">{email.contact.name}</span>
                </div>
              )}
              {email.hubspotContactId && (
                <a
                  href={`https://app.hubspot.com/contacts/${email.hubspotContactId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-2 bg-[#ff7a59]/10 text-[#ff7a59] rounded-lg text-sm hover:bg-[#ff7a59]/20 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  HubSpot
                </a>
              )}
            </div>
          </div>
        )}

        {/* AI Reasoning */}
        {email.aiReasoning && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted uppercase tracking-wide">
              Why this classification?
            </div>
            <p className="text-xs text-muted italic">
              {email.aiReasoning}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
