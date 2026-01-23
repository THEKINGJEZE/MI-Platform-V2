/**
 * Email types for Phase 2a Email Integration
 *
 * Two-table schema per SPEC-012:
 * - Email_Raw: Raw emails from Outlook via Make.com
 * - Emails: AI-classified emails with drafts/actions
 */

export type EmailClassification = 'Urgent' | 'Today' | 'Week' | 'FYI' | 'Archive';
export type EmailActionType = 'Reply' | 'Forward' | 'FYI' | 'Archive';
export type EmailStatus = 'new' | 'draft_ready' | 'approved' | 'sent' | 'waiting_for_reply' | 'done' | 'skipped';

export interface Email {
  id: string;
  emailId: string; // Outlook message ID

  // From Email_Raw (joined)
  subject: string;
  fromEmail: string;
  fromName: string;
  bodyPreview: string;
  receivedAt: string;
  folder?: string;
  hasAttachments: boolean;
  conversationId?: string;

  // Classification (from Emails table)
  classification: EmailClassification;
  priority: number; // 1-5
  actionType: EmailActionType;
  status: EmailStatus;
  keyRequest?: string;
  draftResponse?: string;
  aiConfidence: number;
  aiReasoning?: string;

  // Enrichment
  force?: {
    id: string;
    name: string;
  };
  contact?: {
    id: string;
    name: string;
  };
  hubspotContactId?: string;
  hasOpenDeal: boolean;

  // Waiting-for tracking
  waitingSince?: string;
  followUpDraft?: string;
  skipCount: number;
  actionedAt?: string;
}

export interface EmailQueueStats {
  total: number;
  urgent: number;
  today: number;
  week: number;
  fyi: number;
}

// Priority tier mapping for display
export const CLASSIFICATION_CONFIG: Record<EmailClassification, {
  emoji: string;
  color: string;
  label: string;
  priority: number;
}> = {
  'Urgent': { emoji: '🔴', color: 'text-priority-hot', label: 'Urgent', priority: 1 },
  'Today': { emoji: '🟡', color: 'text-priority-high', label: 'Today', priority: 2 },
  'Week': { emoji: '🟢', color: 'text-priority-medium', label: 'This Week', priority: 3 },
  'FYI': { emoji: '⚪', color: 'text-text-tertiary', label: 'FYI', priority: 4 },
  'Archive': { emoji: '📁', color: 'text-text-tertiary', label: 'Archive', priority: 5 },
};
