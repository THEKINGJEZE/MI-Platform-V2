// @ts-nocheck
"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Send, SkipForward, Check, AlertTriangle } from "lucide-react";
import type { Opportunity } from "@/lib/types/opportunity";

interface ActionPanelProps {
  opportunity: Opportunity | null;
  onAction: (action: "email" | "skip" | "snooze") => void;
  className?: string;
}

// Variable pattern: [variable_name] or {variable_name}
const VARIABLE_PATTERN = /\[([^\]]+)\]|\{([^}]+)\}/g;

// Known variables that can be resolved from opportunity data
const RESOLVABLE_VARIABLES = [
  "force_name",
  "force",
  "contact_name",
  "contact",
  "name",
  "role",
  "title",
  "company",
];

interface ParsedSegment {
  type: "text" | "resolved" | "unresolved";
  content: string;
  variable?: string;
}

/**
 * Parse draft text and identify variables
 */
function parseDraftVariables(
  draft: string,
  opportunity: Opportunity
): { segments: ParsedSegment[]; hasUnresolved: boolean; unresolvedVars: string[] } {
  const segments: ParsedSegment[] = [];
  const unresolvedVars: string[] = [];
  let lastIndex = 0;
  let match;

  // Reset regex state
  VARIABLE_PATTERN.lastIndex = 0;

  while ((match = VARIABLE_PATTERN.exec(draft)) !== null) {
    // Add text before this match
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        content: draft.slice(lastIndex, match.index),
      });
    }

    const varName = (match[1] || match[2]).toLowerCase().trim();
    const fullMatch = match[0];

    // Check if this variable can be resolved
    const isResolvable = RESOLVABLE_VARIABLES.some(
      (v) => varName.includes(v) || v.includes(varName)
    );

    // Try to resolve the variable
    let resolvedValue: string | null = null;
    if (varName.includes("force") || varName.includes("company")) {
      resolvedValue = opportunity.force?.name || null;
    } else if (varName.includes("contact") || varName.includes("name")) {
      resolvedValue = opportunity.contact?.name || null;
    } else if (varName.includes("role") || varName.includes("title")) {
      resolvedValue = opportunity.contact?.role || null;
    }

    if (resolvedValue) {
      segments.push({
        type: "resolved",
        content: resolvedValue,
        variable: varName,
      });
    } else if (isResolvable) {
      // Variable is resolvable type but value is missing
      segments.push({
        type: "unresolved",
        content: fullMatch,
        variable: varName,
      });
      unresolvedVars.push(varName);
    } else {
      // Unknown variable - treat as unresolved
      segments.push({
        type: "unresolved",
        content: fullMatch,
        variable: varName,
      });
      unresolvedVars.push(varName);
    }

    lastIndex = match.index + fullMatch.length;
  }

  // Add remaining text
  if (lastIndex < draft.length) {
    segments.push({
      type: "text",
      content: draft.slice(lastIndex),
    });
  }

  return {
    segments,
    hasUnresolved: unresolvedVars.length > 0,
    unresolvedVars: [...new Set(unresolvedVars)],
  };
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

  // Parse draft for variables
  const parsedDraft = useMemo(() => {
    if (!opportunity?.outreachDraft) return null;
    return parseDraftVariables(opportunity.outreachDraft, opportunity);
  }, [opportunity]);

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

  // Check if send should be blocked
  const hasUnresolvedVars = parsedDraft?.hasUnresolved ?? false;
  const sendDisabled = !opportunity.contact?.email || hasUnresolvedVars;

  return (
    <Card className={cn("h-full", className)}>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Outreach Draft</h3>
            {hasUnresolvedVars && (
              <span className="flex items-center gap-1 text-xs text-warning">
                <AlertTriangle className="h-3 w-3" />
                {parsedDraft?.unresolvedVars.length} unresolved
              </span>
            )}
          </div>

          {/* Draft with variable highlighting */}
          <div className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto">
            {parsedDraft ? (
              parsedDraft.segments.map((segment, i) => {
                if (segment.type === "text") {
                  return <span key={i}>{segment.content}</span>;
                }
                if (segment.type === "resolved") {
                  return (
                    <span
                      key={i}
                      className="bg-action/20 text-action px-1 rounded"
                      title={`Resolved: ${segment.variable}`}
                    >
                      {segment.content}
                    </span>
                  );
                }
                // unresolved
                return (
                  <span
                    key={i}
                    className="bg-warning/20 text-warning px-1 rounded border border-warning/30"
                    title={`Missing: ${segment.variable}`}
                  >
                    {segment.content}
                  </span>
                );
              })
            ) : (
              "No draft available"
            )}
          </div>

          {/* Warning for unresolved variables */}
          {hasUnresolvedVars && (
            <div className="flex items-start gap-2 p-2 rounded bg-warning/10 border border-warning/20 text-xs">
              <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
              <div className="text-warning">
                <span className="font-medium">Cannot send:</span> Missing{" "}
                {parsedDraft?.unresolvedVars.join(", ")}. Edit the draft or skip
                this opportunity.
              </div>
            </div>
          )}
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
            disabled={sendDisabled}
            title={hasUnresolvedVars ? "Resolve variables before sending" : undefined}
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
