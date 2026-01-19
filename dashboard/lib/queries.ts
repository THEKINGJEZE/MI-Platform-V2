import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Opportunity, OpportunityExpanded, Signal, Force } from './airtable';

// Query keys for cache management
export const queryKeys = {
  opportunities: ['opportunities'] as const,
  opportunitiesQueue: ['opportunities', 'queue'] as const,
  signals: ['signals'] as const,
  forces: ['forces'] as const,
};

// Types for API responses
interface OpportunitiesResponse {
  opportunities: (OpportunityExpanded & { id: string })[];
  offset?: string;
}

interface SignalsResponse {
  signals: (Signal & { id: string })[];
  offset?: string;
}

interface ForcesResponse {
  forces: (Force & { id: string })[];
}

interface SendResponse {
  success: boolean;
  action: string;
  opportunity: Opportunity & { id: string };
}

// ============== OPPORTUNITIES ==============

/**
 * Fetch opportunities for the queue view (ready + hot)
 */
export function useQueueOpportunities() {
  return useQuery({
    queryKey: queryKeys.opportunitiesQueue,
    queryFn: async (): Promise<OpportunitiesResponse> => {
      const response = await fetch('/api/opportunities?forQueue=true');
      if (!response.ok) {
        throw new Error('Failed to fetch opportunities');
      }
      return response.json();
    },
  });
}

/**
 * Fetch all opportunities with optional filters
 */
export function useOpportunities(filters?: { status?: string; priority?: string }) {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.priority) params.append('priority', filters.priority);

  return useQuery({
    queryKey: [...queryKeys.opportunities, filters],
    queryFn: async (): Promise<OpportunitiesResponse> => {
      const queryString = params.toString();
      const response = await fetch(`/api/opportunities${queryString ? `?${queryString}` : ''}`);
      if (!response.ok) {
        throw new Error('Failed to fetch opportunities');
      }
      return response.json();
    },
  });
}

/**
 * Update an opportunity (PATCH)
 */
export function useUpdateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      fields,
    }: {
      id: string;
      fields: Partial<Opportunity>;
    }): Promise<Opportunity & { id: string }> => {
      const response = await fetch('/api/opportunities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, fields }),
      });
      if (!response.ok) {
        throw new Error('Failed to update opportunity');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all opportunity queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities });
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunitiesQueue });
    },
  });
}

// ============== SEND ACTIONS ==============

/**
 * Send outreach action (email, linkedin, skip)
 */
export function useSendAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      opportunity_id,
      action,
      skip_reason,
    }: {
      opportunity_id: string;
      action: 'send_email' | 'send_linkedin' | 'skip';
      skip_reason?: string;
    }): Promise<SendResponse> => {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunity_id, action, skip_reason }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queue to remove sent/skipped items
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunitiesQueue });
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities });
    },
  });
}

// ============== SIGNALS ==============

/**
 * Fetch signals with optional filters
 */
export function useSignals(filters?: { source?: string; status?: string; limit?: number }) {
  const params = new URLSearchParams();
  if (filters?.source) params.append('source', filters.source);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.limit) params.append('limit', String(filters.limit));

  return useQuery({
    queryKey: [...queryKeys.signals, filters],
    queryFn: async (): Promise<SignalsResponse> => {
      const queryString = params.toString();
      const response = await fetch(`/api/signals${queryString ? `?${queryString}` : ''}`);
      if (!response.ok) {
        throw new Error('Failed to fetch signals');
      }
      return response.json();
    },
  });
}

// ============== FORCES ==============

/**
 * Fetch all forces
 */
export function useForces(filters?: { region?: string; country?: string }) {
  const params = new URLSearchParams();
  if (filters?.region) params.append('region', filters.region);
  if (filters?.country) params.append('country', filters.country);

  return useQuery({
    queryKey: [...queryKeys.forces, filters],
    queryFn: async (): Promise<ForcesResponse> => {
      const queryString = params.toString();
      const response = await fetch(`/api/forces${queryString ? `?${queryString}` : ''}`);
      if (!response.ok) {
        throw new Error('Failed to fetch forces');
      }
      return response.json();
    },
    // Forces rarely change, cache for longer
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
