// @ts-nocheck
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Send, SkipForward, Check } from "lucide-react";
import type { Opportunity } from "@/lib/types/opportunity";

interface ActionPanelProps {
  opportunity: Opportunity | null;
  onAction: (action: "email" | "skip" | "snooze") => void;
  className?: string;
}

/**
 * Action Panel - V2 Migration
 *
 * Simplified version for V2 schema.
 * Uses outreachDraft instead of draftEmailSubject/draftEmailBody.
 */
export function ActionPanel({
  opportunity,
  onAction,
  className,
}: ActionPanelProps) {
  const [copied, setCopied] = useState(false);

  if (!opportunity) {
    return (
      <Card className={cn("h-full", className)}>
        <CardContent className="pt-6 text-center text-muted-foreground">
          Select an opportunity to see actions
        </CardContent>
      </Card>
    );
  }

  const handleCopy = async () => {
    const text = opportunity.outreachDraft || "";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenMailClient = () => {
    const email = opportunity.contact?.email || "";
    const subject = encodeURIComponent(`Regarding ${opportunity.force.name}`);
    const body = encodeURIComponent(opportunity.outreachDraft || "");
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
    onAction("email");
  };

  return (
    <Card className={cn("h-full", className)}>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium">Outreach Draft</h3>
          <div className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto">
            {opportunity.outreachDraft || "No draft available"}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!opportunity.outreachDraft}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>

          <Button
            size="sm"
            onClick={handleOpenMailClient}
            disabled={!opportunity.contact?.email}
          >
            <Send className="h-4 w-4 mr-1" />
            Send Email
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAction("skip")}
          >
            <SkipForward className="h-4 w-4 mr-1" />
            Skip
          </Button>
        </div>

        {opportunity.contact && (
          <div className="text-sm text-muted-foreground">
            <p>To: {opportunity.contact.name}</p>
            {opportunity.contact.email && (
              <p className="text-xs">{opportunity.contact.email}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
