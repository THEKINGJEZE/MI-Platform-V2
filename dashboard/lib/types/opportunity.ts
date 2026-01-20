/**
 * Simplified Opportunity for V2
 * No dual-track scoring, no contracts, no follow-ups
 */

export type PriorityTier = 'hot' | 'high' | 'medium' | 'low';
export type OpportunityStatus = 'new' | 'ready' | 'sent' | 'replied' | 'won' | 'lost' | 'dormant';
export type OutreachChannel = 'email' | 'linkedin';
export type ContactConfidence = 'verified' | 'likely' | 'guess' | 'none';

export interface Signal {
  id: string;
  type: string;
  source: string;
  title: string;
  detectedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  role?: string;
  email?: string;
  linkedinUrl?: string;
  confidence: ContactConfidence;
}

export interface Force {
  id: string;
  name: string;
  shortName?: string;
  region?: string;
  size?: string;
}

export interface Opportunity {
  id: string;
  name: string;

  // Linked entities
  force: Force;
  signals: Signal[];
  contact?: Contact;

  // Display fields
  signalCount: number;
  signalTypes: string[];
  priorityTier: PriorityTier;
  status: OpportunityStatus;
  contactConfidence: ContactConfidence;

  // Content
  whyNow?: string;
  outreachDraft?: string;
  outreachChannel: OutreachChannel;
  notes?: string;

  // Metadata
  createdAt: string;
}
