import { NextRequest, NextResponse } from 'next/server';
import { listRecords, type Force } from '@/lib/airtable';

/**
 * GET /api/forces
 *
 * Read-only endpoint for the forces reference directory.
 *
 * Query params:
 * - region: Filter by region
 * - country: Filter by country
 * - relationship: Filter by current_relationship
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const country = searchParams.get('country');
    const relationship = searchParams.get('relationship');

    const filters: string[] = [];

    if (region) {
      filters.push(`{region}="${region}"`);
    }

    if (country) {
      filters.push(`{country}="${country}"`);
    }

    if (relationship) {
      filters.push(`{current_relationship}="${relationship}"`);
    }

    const filterFormula = filters.length > 0
      ? filters.length === 1 ? filters[0] : `AND(${filters.join(', ')})`
      : undefined;

    const result = await listRecords<Force>('forces', {
      filterByFormula: filterFormula,
      sort: [{ field: 'name', direction: 'asc' }],
      maxRecords: 100,
    });

    const forces = result.records.map(r => ({
      id: r.id,
      ...r.fields,
    }));

    return NextResponse.json({ forces });
  } catch (error) {
    console.error('Error fetching forces:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
