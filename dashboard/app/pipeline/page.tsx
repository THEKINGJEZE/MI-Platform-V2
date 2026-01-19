'use client';

import { Nav, PageHeader } from '@/components/nav';
import { Card, CardContent } from '@/components/ui/card';
import { PriorityBadge } from '@/components/mi-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useOpportunities } from '@/lib/queries';
import { UIProvider } from '@/stores/ui-store';
import type { OpportunityExpanded } from '@/lib/airtable';

/**
 * Pipeline View — Kanban by Status
 *
 * Per SPEC-007 §6, displays opportunities in columns:
 * - New → Researching → Ready → Sent → Meeting → Proposal → Won/Lost
 */

// Status columns configuration (keys match Airtable lowercase values)
const STATUS_COLUMNS = [
  { key: 'new', label: 'New', color: 'bg-blue-500/10' },
  { key: 'researching', label: 'Researching', color: 'bg-purple-500/10' },
  { key: 'ready', label: 'Ready', color: 'bg-green-500/10' },
  { key: 'sent', label: 'Sent', color: 'bg-yellow-500/10' },
  { key: 'meeting', label: 'Meeting', color: 'bg-cyan-500/10' },
  { key: 'proposal', label: 'Proposal', color: 'bg-indigo-500/10' },
  { key: 'won', label: 'Won', color: 'bg-emerald-500/10' },
  { key: 'lost', label: 'Lost', color: 'bg-red-500/10' },
  { key: 'skipped', label: 'Skipped', color: 'bg-gray-500/10' },
] as const;

function KanbanColumn({
  status,
  label,
  color,
  opportunities,
}: {
  status: string;
  label: string;
  color: string;
  opportunities: (OpportunityExpanded & { id: string })[];
}) {
  const columnOpps = opportunities.filter((opp) => opp.status === status);

  return (
    <div className="flex-shrink-0 w-72">
      <div className={`rounded-t-lg px-3 py-2 ${color}`}>
        <h3 className="text-sm font-semibold text-foreground">
          {label}
          <span className="ml-2 text-muted-foreground">({columnOpps.length})</span>
        </h3>
      </div>
      <div className="bg-muted/50 rounded-b-lg p-2 min-h-[200px] space-y-2">
        {columnOpps.map((opp) => (
          <OpportunityMiniCard key={opp.id} opportunity={opp} />
        ))}
        {columnOpps.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            No opportunities
          </p>
        )}
      </div>
    </div>
  );
}

function OpportunityMiniCard({
  opportunity,
}: {
  opportunity: OpportunityExpanded & { id: string };
}) {
  const forceName = opportunity.force_name?.[0] || opportunity.name || 'Unknown';

  return (
    <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
      <CardContent className="p-3 space-y-2">
        <h4 className="text-sm font-medium text-foreground line-clamp-1">
          {forceName}
        </h4>
        <div className="flex flex-wrap gap-1">
          {opportunity.priority_tier && (
            <PriorityBadge priority={opportunity.priority_tier} />
          )}
        </div>
        {opportunity.why_now && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {opportunity.why_now}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function PipelineContent() {
  const { data, isLoading, error } = useOpportunities();
  const opportunities = data?.opportunities ?? [];

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load opportunities</p>
        <p className="text-sm text-muted-foreground mt-2">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  const totalCount = opportunities.length;

  return (
    <>
      <PageHeader
        title="Pipeline"
        subtitle={`${totalCount} opportunities total`}
      />

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUS_COLUMNS.map((col) => (
            <div key={col.key} className="flex-shrink-0 w-72">
              <Skeleton className="h-8 rounded-t-lg" />
              <Skeleton className="h-48 rounded-b-lg mt-0.5" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUS_COLUMNS.map((col) => (
            <KanbanColumn
              key={col.key}
              status={col.key}
              label={col.label}
              color={col.color}
              opportunities={opportunities}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default function PipelinePage() {
  return (
    <UIProvider>
      <div className="min-h-screen bg-background">
        <Nav />
        <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PipelineContent />
        </main>
      </div>
    </UIProvider>
  );
}
