'use client';

import { useState } from 'react';
import { Nav, PageHeader } from '@/components/nav';
import { Card, CardContent } from '@/components/ui/card';
import { SourceBadge, StatusBadge } from '@/components/mi-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useSignals } from '@/lib/queries';
import { UIProvider } from '@/stores/ui-store';
import { ExternalLink, RefreshCw } from 'lucide-react';

/**
 * Signals View — Raw Feed for Debugging
 *
 * Per SPEC-007 §7, displays raw signals table:
 * - Type, Source, Force, Date, Status
 * - Filter by source
 * - Link to original URL
 */

const SOURCE_FILTERS = [
  { key: 'all', label: 'All Sources' },
  { key: 'indeed', label: 'Indeed' },
  { key: 'competitor', label: 'Competitor' },
  { key: 'tender', label: 'Tender' },
  { key: 'news', label: 'News' },
  { key: 'regulatory', label: 'Regulatory' },
] as const;

function SignalsContent() {
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const { data, isLoading, error, refetch, isFetching } = useSignals(
    sourceFilter === 'all' ? { limit: 100 } : { source: sourceFilter, limit: 100 }
  );
  const signals = data?.signals ?? [];

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load signals</p>
        <p className="text-sm text-muted-foreground mt-2">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Signals"
        subtitle={`${signals.length} signals displayed`}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </PageHeader>

      {/* Source Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {SOURCE_FILTERS.map((filter) => (
          <Button
            key={filter.key}
            variant={sourceFilter === filter.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSourceFilter(filter.key)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Signals Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide bg-muted rounded-lg">
            <div className="col-span-4">Title</div>
            <div className="col-span-2">Source</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Date</div>
          </div>

          {/* Signal Rows */}
          {signals.map((signal) => (
            <Card key={signal.id} className="hover:bg-accent/30 transition-colors">
              <CardContent className="p-4">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Title + URL */}
                  <div className="col-span-4">
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-medium text-foreground line-clamp-1">
                        {signal.title || 'Untitled Signal'}
                      </span>
                      {signal.url && (
                        <a
                          href={signal.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground flex-shrink-0"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Source */}
                  <div className="col-span-2">
                    {signal.source && <SourceBadge source={signal.source} />}
                  </div>

                  {/* Type */}
                  <div className="col-span-2">
                    <span className="text-sm text-muted-foreground">
                      {signal.type || '—'}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    {signal.status && <StatusBadge status={signal.status} />}
                  </div>

                  {/* Date */}
                  <div className="col-span-2">
                    <span className="text-sm text-muted-foreground">
                      {signal.detected_at
                        ? new Date(signal.detected_at).toLocaleDateString()
                        : '—'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {signals.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No signals found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try changing the source filter
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default function SignalsPage() {
  return (
    <UIProvider>
      <div className="min-h-screen bg-background">
        <Nav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SignalsContent />
        </main>
      </div>
    </UIProvider>
  );
}
