// @ts-nocheck
"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { User, Mail, Linkedin, HelpCircle } from "lucide-react";
import type { Contact, ContactConfidence } from "@/lib/types/opportunity";

interface ContactCardProps {
  contact: Contact;
  className?: string;
  onEmailClick?: () => void;
  onLinkedInClick?: () => void;
}

/**
 * Contact Card Component - V2 Simplified
 *
 * Displays contact information with confidence indicator.
 * V2 uses: name, role, email, linkedinUrl, confidence
 */
export function ContactCard({
  contact,
  className,
  onEmailClick,
  onLinkedInClick,
}: ContactCardProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 rounded-lg bg-surface-1/50 border border-surface-1",
        className
      )}
    >
      {/* Avatar placeholder */}
      <div className="relative flex-shrink-0">
        <div className="h-12 w-12 rounded-full bg-surface-2 flex items-center justify-center">
          <User className="h-6 w-6 text-muted" />
        </div>
        {/* Confidence dot */}
        <ConfidenceDot confidence={contact.confidence} />
      </div>

      {/* Contact info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-primary truncate">{contact.name}</h4>
          <ConfidenceLabel confidence={contact.confidence} />
        </div>

        {contact.role && (
          <p className="text-sm text-secondary truncate">{contact.role}</p>
        )}

        {/* Contact details */}
        <div className="flex flex-wrap gap-3 pt-2">
          {contact.email && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-action hover:text-action"
              onClick={onEmailClick}
            >
              <Mail className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-[12px] truncate max-w-[150px]">
                {contact.email}
              </span>
            </Button>
          )}

          {contact.linkedinUrl && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-info hover:text-info"
              onClick={onLinkedInClick}
            >
              <Linkedin className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-[12px]">LinkedIn</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Confidence Dot - Visual indicator on avatar
 */
function ConfidenceDot({ confidence }: { confidence: ContactConfidence }) {
  const colorClass = getConfidenceColor(confidence);

  return (
    <div
      className={cn(
        "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-surface-0",
        colorClass
      )}
    />
  );
}

/**
 * Confidence Label - Text indicator
 */
function ConfidenceLabel({ confidence }: { confidence: ContactConfidence }) {
  const config = getConfidenceConfig(confidence);

  return (
    <div
      className={cn(
        "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium",
        config.bgClass
      )}
      title={config.tooltip}
    >
      {confidence === "none" && <HelpCircle className="h-2.5 w-2.5" />}
      <span className={config.textClass}>{config.label}</span>
    </div>
  );
}

/**
 * Get confidence color class
 */
function getConfidenceColor(confidence: ContactConfidence): string {
  switch (confidence) {
    case "verified":
      return "bg-success";
    case "likely":
      return "bg-action";
    case "guess":
      return "bg-warning";
    case "none":
    default:
      return "bg-danger";
  }
}

/**
 * Get confidence config for labels
 */
function getConfidenceConfig(confidence: ContactConfidence) {
  switch (confidence) {
    case "verified":
      return {
        label: "Verified",
        bgClass: "bg-success/10",
        textClass: "text-success",
        tooltip: "Contact verified from CRM",
      };
    case "likely":
      return {
        label: "Likely",
        bgClass: "bg-action/10",
        textClass: "text-action",
        tooltip: "Found via data enrichment",
      };
    case "guess":
      return {
        label: "Unverified",
        bgClass: "bg-warning/10",
        textClass: "text-warning",
        tooltip: "AI-discovered, needs verification",
      };
    case "none":
    default:
      return {
        label: "No Contact",
        bgClass: "bg-danger/10",
        textClass: "text-danger",
        tooltip: "No contact information found",
      };
  }
}

/**
 * Contact Card Compact - For list view
 */
export function ContactCardCompact({
  contact,
  className,
}: {
  contact: Contact;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <div className="h-6 w-6 rounded-full bg-surface-2 flex items-center justify-center">
          <User className="h-3 w-3 text-muted" />
        </div>
        <div
          className={cn(
            "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-surface-0",
            getConfidenceColor(contact.confidence)
          )}
        />
      </div>
      <span className="text-sm text-secondary truncate">{contact.name}</span>
    </div>
  );
}
