/**
 * Queue Panel — Left zone showing opportunity list
 *
 * Per SPEC-007b: Filter tabs, priority indicators, J/K selection
 * Per SPEC-007a: Priority-sorted queue (P1 → P2 → P3), tier badges with icons
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useReviewStore,
  useFilteredOpportunities,
  type FilterType,
  type ReviewOpportunity,
} from '@/lib/stores/review-store';
import { PriorityTierBadge } from '@/components/mi-badge';

// SPEC-007a: Priority tier order for sorting (P1 = highest priority)
const PRIORITY_ORDER: Record<string, number> = {
  p1: 1,
  hot: 1,
  high: 2,
  p2: 2,
  medium: 3,
  p3: 3,
  low: 4,
};

function sortByPriority(opportunities: ReviewOpportunity[]): ReviewOpportunity[] {
  return [...opportunities].sort((a, b) => {
    const priorityA = PRIORITY_ORDER[a.priority?.toLowerCase()] || 99;
    const priorityB = PRIORITY_ORDER[b.priority?.toLowerCase()] || 99;

    // Sort by priority first
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // Within same priority tier, sort by competitor intercept (hot leads first)
    if (a.isCompetitorIntercept !== b.isCompetitorIntercept) {
      return a.isCompetitorIntercept ? -1 : 1;
    }

    // Then by name for consistency
    return (a.force?.name || a.name).localeCompare(b.force?.name || b.name);
  });
}

export function QueuePanel() {
  const { filter, setFilter, currentId, selectOpportunity } = useReviewStore();
  const filteredOpportunities = useFilteredOpportunities();

  // SPEC-007a: Sort by priority tier (P1 first, then P2, then P3)
  const opportunities = React.useMemo(
    () => sortByPriority(filteredOpportunities),
    [filteredOpportunities]
  );

  return (
    <div className="flex h-full flex-col">
      {/* Filter Tabs */}
      <div className="flex-shrink-0 border-b border-subtle p-3">
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as FilterType)}
        >
          <TabsList className="grid w-full grid-cols-3 bg-surface-1">
            <TabsTrigger
              value="ready"
              className="data-[state=active]:bg-action data-[state=active]:text-primary"
            >
              Ready
            </TabsTrigger>
            <TabsTrigger
              value="sent"
              className="data-[state=active]:bg-action data-[state=active]:text-primary"
            >
              Sent
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-action data-[state=active]:text-primary"
            >
              All
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Opportunity List */}
      <div className="flex-1 overflow-y-auto">
        {opportunities.length === 0 ? (
          <div className="flex h-full items-center justify-center p-4 text-center text-muted">
            <p>No opportunities in this view</p>
          </div>
        ) : (
          <ul className="divide-y divide-subtle">
            {opportunities.map((opp) => (
              <QueueItem
                key={opp.id}
                opportunity={opp}
                isSelected={opp.id === currentId}
                onClick={() => selectOpportunity(opp.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

interface QueueItemProps {
  opportunity: ReviewOpportunity;
  isSelected: boolean;
  onClick: () => void;
}

function QueueItem({ opportunity, isSelected, onClick }: QueueItemProps) {
  const priorityColor = getPriorityColor(opportunity.priority);

  return (
    <li>
      <button
        onClick={onClick}
        className={cn(
          'w-full border-l-3 px-4 py-3 text-left transition-colors',
          'hover:bg-surface-1',
          isSelected && 'bg-surface-1',
          priorityColor
        )}
        style={{ borderLeftWidth: '3px' }}
      >
        {/* Force Name */}
        <div className="flex items-start justify-between gap-2">
          <span
            className={cn(
              'truncate font-medium',
              isSelected ? 'text-primary' : 'text-secondary'
            )}
          >
            {opportunity.force?.name || opportunity.name}
          </span>
          {opportunity.isCompetitorIntercept && (
            <span className="flex-shrink-0 rounded bg-danger-muted px-1.5 py-0.5 text-xs font-medium text-danger">
              HOT
            </span>
          )}
        </div>

        {/* Signal Summary */}
        <div className="mt-1 flex items-center gap-2 text-xs text-muted">
          <span>{opportunity.signalCount} signals</span>
          {opportunity.signalTypes && (
            <>
              <span className="text-subtle">•</span>
              <span className="truncate">{opportunity.signalTypes}</span>
            </>
          )}
        </div>

        {/* Status Badge + Priority Tier */}
        <div className="mt-2 flex items-center gap-2">
          <StatusBadge status={opportunity.status} />
          {/* SPEC-007a: Show P1/P2/P3 tier badge with icon */}
          <PriorityTierBadge tier={normalizePriorityToTier(opportunity.priority)} />
        </div>
      </button>
    </li>
  );
}

// SPEC-007a: Map various priority values to P1/P2/P3 tier format
function normalizePriorityToTier(priority: string): string {
  const lower = priority?.toLowerCase() || '';
  if (lower === 'hot' || lower === 'p1') return 'P1';
  if (lower === 'high' || lower === 'p2') return 'P2';
  if (lower === 'medium' || lower === 'p3') return 'P3';
  if (lower === 'low') return 'P3'; // Map low to P3
  return 'P3'; // Default to P3
}

function getPriorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'hot':
    case 'high':
    case 'p1':
      return 'border-l-danger';
    case 'medium':
    case 'p2':
      return 'border-l-warning';
    case 'low':
    case 'p3':
      return 'border-l-muted';
    default:
      return 'border-l-action';
  }
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    New: 'bg-action/20 text-action',
    Ready: 'bg-success-muted text-success',
    Sent: 'bg-surface-2 text-secondary',
    Skipped: 'bg-warning-muted text-warning',
    Dismissed: 'bg-danger-muted text-danger',
  }[status] || 'bg-surface-2 text-muted';

  return (
    <span className={cn('rounded px-1.5 py-0.5 text-xs font-medium', styles)}>
      {status}
    </span>
  );
}
