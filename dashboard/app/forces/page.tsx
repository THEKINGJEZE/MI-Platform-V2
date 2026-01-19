'use client';

import { useState } from 'react';
import { Nav, PageHeader } from '@/components/nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useForces } from '@/lib/queries';
import { UIProvider } from '@/stores/ui-store';
import { ExternalLink, Users, MapPin } from 'lucide-react';

/**
 * Forces View — Reference Directory
 *
 * Per SPEC-007 §8, displays all 46 police forces:
 * - Name, Region, Size, Website
 * - Current relationship status
 * - Filter by region
 */

const REGION_FILTERS = [
  { key: 'all', label: 'All Regions' },
  { key: 'North', label: 'North' },
  { key: 'Midlands', label: 'Midlands' },
  { key: 'South', label: 'South' },
  { key: 'Wales', label: 'Wales' },
  { key: 'Scotland', label: 'Scotland' },
  { key: 'Northern Ireland', label: 'Northern Ireland' },
] as const;

function ForcesContent() {
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const { data, isLoading, error } = useForces(
    regionFilter === 'all' ? undefined : { region: regionFilter }
  );
  const forces = data?.forces ?? [];

  // Filter forces client-side (API may not support region filter)
  const filteredForces = regionFilter === 'all'
    ? forces
    : forces.filter((f) => f.region?.toLowerCase().includes(regionFilter.toLowerCase()));

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load forces</p>
        <p className="text-sm text-muted-foreground mt-2">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="UK Police Forces"
        subtitle={`${filteredForces.length} forces`}
      />

      {/* Region Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {REGION_FILTERS.map((filter) => (
          <Button
            key={filter.key}
            variant={regionFilter === filter.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRegionFilter(filter.key)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Forces Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredForces.map((force) => (
            <Card key={force.id} className="hover:bg-accent/30 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-start justify-between">
                  <span className="line-clamp-1">{force.name}</span>
                  {force.website && (
                    <a
                      href={force.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground flex-shrink-0 ml-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Region */}
                {force.region && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{force.region}</span>
                  </div>
                )}

                {/* Size / Officer Count */}
                {(force.size || force.officer_count) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>
                      {force.size}
                      {force.officer_count && ` (${force.officer_count.toLocaleString()} officers)`}
                    </span>
                  </div>
                )}

                {/* Relationship Status */}
                {force.current_relationship && (
                  <div className="pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      Relationship: {force.current_relationship}
                    </span>
                  </div>
                )}

                {/* Competitor Info */}
                {force.competitor_incumbent && force.competitor_incumbent.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Incumbent: {force.competitor_incumbent.join(', ')}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {filteredForces.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No forces found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try changing the region filter
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default function ForcesPage() {
  return (
    <UIProvider>
      <div className="min-h-screen bg-background">
        <Nav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ForcesContent />
        </main>
      </div>
    </UIProvider>
  );
}
