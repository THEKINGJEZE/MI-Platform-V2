import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Flame,
  Clock,
  TrendingUp,
  RefreshCw,
  CheckCircle,
  Eye,
  Bell,
  Flag,
  Shield,
  AlertTriangle,
  Briefcase,
  Users,
  Wrench,
  Handshake,
  Trophy,
  XCircle,
  Moon,
  FileCheck,
  Gavel,
  FileText,
  Newspaper,
  UserCheck,
  Target,
} from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Badge Variants
 *
 * Extended with all variants from the spec:
 * - Priority badges (priority, high, medium, low)
 * - Card state badges (reviewing, actioned, snoozed, flagged)
 * - Force type badges (territorial, rocu, national, specialist)
 * - HMICFRS badges (engage, ri, good, outstanding)
 * - Admiralty confidence codes (a1, b2, c3, d4)
 * - Signal badges (surge, followup, spike, reengaged)
 */
const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 [&>svg]:pointer-events-none transition-colors overflow-hidden",
  {
    variants: {
      variant: {
        // Base variants
        default: "border-transparent bg-surface-1 text-secondary",
        secondary: "border-transparent bg-surface-1 text-secondary",
        outline: "border-surface-1 text-secondary",

        // Priority badges
        priority: "border-transparent bg-danger-muted text-danger",
        high: "border-transparent bg-warning-muted text-warning",
        medium: "border-transparent bg-info-muted text-info",
        low: "border-transparent bg-surface-1 text-muted",

        // Success/destructive/info
        success: "border-transparent bg-success-muted text-success",
        destructive: "border-transparent bg-danger-muted text-danger",
        info: "border-transparent bg-info-muted text-info",

        // Card state badges (from ADHD Interface Design skill)
        reviewing: "border-transparent bg-action-muted text-action",
        actioned: "border-transparent bg-success-muted text-success",
        snoozed: "border-transparent bg-warning-muted text-warning",
        flagged: "border-transparent bg-danger-muted text-danger",

        // Force type badges (from UK Police Market Domain skill)
        territorial: "border-transparent bg-surface-1 text-secondary",
        rocu: "border-transparent bg-info-muted text-info",
        national: "border-transparent bg-action-muted text-action",
        specialist: "border-transparent bg-warning-muted text-warning",

        // HMICFRS badges (from spec Force Context Section)
        engage: "border-transparent bg-danger-muted text-danger",
        ri: "border-transparent bg-warning-muted text-warning",
        good: "border-transparent bg-success-muted text-success",
        outstanding: "border-transparent bg-action-muted text-action",

        // Admiralty confidence codes (from Intelligence Source Grading skill)
        a1: "border-transparent bg-success-muted text-success font-mono",
        a2: "border-transparent bg-success-muted text-success font-mono",
        b1: "border-transparent bg-action-muted text-action font-mono",
        b2: "border-transparent bg-action-muted text-action font-mono",
        c1: "border-transparent bg-action-muted text-action font-mono",
        c2: "border-transparent bg-info-muted text-info font-mono",
        c3: "border-transparent bg-warning-muted text-warning font-mono",
        d4: "border-transparent bg-surface-1 text-muted font-mono",
        f6: "border-transparent bg-surface-1 text-muted font-mono",

        // Signal badges (with icons per spec)
        surge: "border-transparent bg-danger-muted text-danger",
        followup: "border-transparent bg-warning-muted text-warning",
        spike: "border-transparent bg-success-muted text-success",
        reengaged: "border-transparent bg-info-muted text-info",

        // Track badges (for dual-track scoring)
        managed: "border-transparent bg-action-muted text-action font-medium",
        agency: "border-transparent bg-info-muted text-info font-medium",

        // Segment badges (force segments from propensity model)
        fixer: "border-transparent bg-danger-muted text-danger",
        recoverer: "border-transparent bg-warning-muted text-warning",
        strategic_partner: "border-transparent bg-success-muted text-success",
        collaborator: "border-transparent bg-surface-1 text-secondary",

        // IR35 badges (tax status for agency track)
        ir35_outside: "border-transparent bg-success-muted text-success",
        ir35_inside: "border-transparent bg-warning-muted text-warning",
        ir35_blanket: "border-transparent bg-danger-muted text-danger",

        // Opportunity status badges
        won: "border-transparent bg-success-muted text-success",
        lost: "border-transparent bg-surface-1 text-muted",
        dormant: "border-transparent bg-surface-1 text-muted",

        // Opportunity type badges (Phase R3 spec 6.2)
        tender_live: "border-transparent bg-action-muted text-action",
        tender_presales: "border-transparent bg-info-muted text-info",
        competitor: "border-transparent bg-warning-muted text-warning",
        job_signal: "border-transparent bg-success-muted text-success",
        regulatory: "border-transparent bg-danger-muted text-danger",
        news: "border-transparent bg-surface-1 text-secondary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface BadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
  /** Show icon for signal badges */
  showIcon?: boolean;
}

function Badge({
  className,
  variant,
  asChild = false,
  showIcon = true,
  children,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span";

  // Get the appropriate icon for signal variants
  const getIcon = () => {
    if (!showIcon) return null;

    switch (variant) {
      case "surge":
        return <Flame className="size-3" />;
      case "followup":
        return <Clock className="size-3" />;
      case "spike":
        return <TrendingUp className="size-3" />;
      case "reengaged":
        return <RefreshCw className="size-3" />;
      case "actioned":
        return <CheckCircle className="size-3" />;
      case "reviewing":
        return <Eye className="size-3" />;
      case "snoozed":
        return <Bell className="size-3" />;
      case "flagged":
        return <Flag className="size-3" />;
      case "engage":
      case "ri":
        return <AlertTriangle className="size-3" />;
      case "territorial":
      case "rocu":
      case "national":
      case "specialist":
        return <Shield className="size-3" />;
      case "managed":
        return <Briefcase className="size-3" />;
      case "agency":
        return <Users className="size-3" />;
      case "fixer":
        return <Wrench className="size-3" />;
      case "recoverer":
        return <AlertTriangle className="size-3" />;
      case "strategic_partner":
        return <Handshake className="size-3" />;
      case "collaborator":
        return <Users className="size-3" />;
      case "won":
        return <Trophy className="size-3" />;
      case "lost":
        return <XCircle className="size-3" />;
      case "dormant":
        return <Moon className="size-3" />;
      case "ir35_outside":
      case "ir35_inside":
      case "ir35_blanket":
        return <FileCheck className="size-3" />;
      case "tender_live":
        return <Gavel className="size-3" />;
      case "tender_presales":
        return <FileText className="size-3" />;
      case "competitor":
        return <Target className="size-3" />;
      case "job_signal":
        return <UserCheck className="size-3" />;
      case "regulatory":
        return <AlertTriangle className="size-3" />;
      case "news":
        return <Newspaper className="size-3" />;
      default:
        return null;
    }
  };

  const icon = getIcon();

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      {icon}
      {children}
    </Comp>
  );
}

export { Badge, badgeVariants };

/**
 * Pre-configured badge components for common use cases
 */

export function PriorityBadge({ priority }: { priority: "priority" | "high" | "medium" | "low" }) {
  const labels = {
    priority: "PRIORITY",
    high: "HIGH",
    medium: "MEDIUM",
    low: "LOW",
  };
  return <Badge variant={priority}>{labels[priority]}</Badge>;
}

export function ForceTypeBadge({ type }: { type: "territorial" | "rocu" | "national" | "specialist" }) {
  const labels = {
    territorial: "TERRITORIAL",
    rocu: "ROCU",
    national: "NATIONAL",
    specialist: "SPECIALIST",
  };
  return <Badge variant={type}>{labels[type]}</Badge>;
}

export function HmicfrsBadge({ status }: { status: "engage" | "ri" | "good" | "outstanding" }) {
  const labels = {
    engage: "ENGAGE",
    ri: "RI",
    good: "GOOD",
    outstanding: "OUTSTANDING",
  };
  return <Badge variant={status}>{labels[status]}</Badge>;
}

export function AdmiraltyBadge({ code }: { code: string }) {
  // Validate and normalize the code (e.g., "A1", "B2", "C3")
  const normalizedCode = code.toLowerCase().replace(/[^a-f0-6]/g, "");
  const variant = normalizedCode as "a1" | "a2" | "b1" | "b2" | "c1" | "c2" | "c3" | "d4" | "f6";

  return (
    <Badge variant={variant} showIcon={false}>
      {code.toUpperCase()}
    </Badge>
  );
}

export function CardStateBadge({
  state,
  detail,
}: {
  state: "reviewing" | "actioned" | "snoozed" | "flagged";
  detail?: string;
}) {
  const labels = {
    reviewing: "REVIEWING",
    actioned: "ACTIONED",
    snoozed: detail ? `SNOOZED: ${detail}` : "SNOOZED",
    flagged: "FLAGGED",
  };
  return <Badge variant={state}>{labels[state]}</Badge>;
}

/**
 * Track Badge - Shows Managed Services (MS) or Agency track
 */
export function TrackBadge({ track }: { track: "managed" | "agency" }) {
  const labels = {
    managed: "MS",
    agency: "AG",
  };
  return <Badge variant={track}>{labels[track]}</Badge>;
}

/**
 * Segment Badge - Shows force segment from propensity model
 */
export function SegmentBadge({
  segment,
}: {
  segment: "fixer" | "recoverer" | "strategic_partner" | "collaborator";
}) {
  const labels = {
    fixer: "FIXER",
    recoverer: "RECOVERER",
    strategic_partner: "STRATEGIC PARTNER",
    collaborator: "COLLABORATOR",
  };
  return <Badge variant={segment}>{labels[segment]}</Badge>;
}

/**
 * IR35 Badge - Shows IR35 tax determination for agency track
 * Only renders if determination is not "unknown"
 */
export function IR35Badge({
  determination,
}: {
  determination: "outside" | "inside" | "blanket" | "unknown";
}) {
  if (determination === "unknown") return null;

  const variantMap = {
    outside: "ir35_outside" as const,
    inside: "ir35_inside" as const,
    blanket: "ir35_blanket" as const,
  };
  const labels = {
    outside: "OUTSIDE IR35",
    inside: "INSIDE IR35",
    blanket: "BLANKET INSIDE",
  };

  return (
    <Badge variant={variantMap[determination]}>
      {labels[determination]}
    </Badge>
  );
}

/**
 * Opportunity Status Badge - Shows opportunity status
 */
export function OpportunityStatusBadge({
  status,
}: {
  status: "new" | "reviewing" | "actioned" | "won" | "lost" | "dormant";
}) {
  const variantMap = {
    new: "default" as const,
    reviewing: "reviewing" as const,
    actioned: "actioned" as const,
    won: "won" as const,
    lost: "lost" as const,
    dormant: "dormant" as const,
  };
  const labels = {
    new: "NEW",
    reviewing: "REVIEWING",
    actioned: "ACTIONED",
    won: "WON",
    lost: "LOST",
    dormant: "DORMANT",
  };

  return <Badge variant={variantMap[status]}>{labels[status]}</Badge>;
}

/**
 * Opportunity Type Badge - Shows opportunity type (Phase R3 spec 6.2)
 *
 * Types determine the source/nature of the opportunity:
 * - TENDER_LIVE: Active procurement opportunity
 * - TENDER_PRESALES: Upcoming PME/pre-market engagement
 * - COMPETITOR: Competitive intelligence signal
 * - JOB_SIGNAL: Hiring surge or job-related signal
 * - REGULATORY: HMICFRS/compliance-driven opportunity
 * - NEWS: News or general intelligence
 */
export function OpportunityTypeBadge({
  type,
}: {
  type: "TENDER_LIVE" | "TENDER_PRESALES" | "COMPETITOR" | "JOB_SIGNAL" | "REGULATORY" | "NEWS";
}) {
  const variantMap = {
    TENDER_LIVE: "tender_live" as const,
    TENDER_PRESALES: "tender_presales" as const,
    COMPETITOR: "competitor" as const,
    JOB_SIGNAL: "job_signal" as const,
    REGULATORY: "regulatory" as const,
    NEWS: "news" as const,
  };
  const labels = {
    TENDER_LIVE: "TENDER",
    TENDER_PRESALES: "PRE-SALES",
    COMPETITOR: "COMPETITOR",
    JOB_SIGNAL: "HIRING",
    REGULATORY: "REGULATORY",
    NEWS: "NEWS",
  };

  return <Badge variant={variantMap[type]}>{labels[type]}</Badge>;
}
