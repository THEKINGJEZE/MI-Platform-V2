import { NextRequest, NextResponse } from 'next/server';
import { listRecords, type Signal } from '@/lib/airtable';

/**
 * GET /api/signals
 *
 * Read-only endpoint for the signals debug view.
 *
 * Query params:
 * - source: Filter by source (e.g., "indeed", "competitor")
 * - status: Filter by status (e.g., "new", "relevant", "irrelevant")
 * - limit: Max records to return (default 50)
 * - offset: Pagination token
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = searchParams.get('offset') || undefined;

    const filters: string[] = [];

    if (source) {
      filters.push(`{source}="${source}"`);
    }

    if (status) {
      filters.push(`{status}="${status}"`);
    }

    const filterFormula = filters.length > 0
      ? filters.length === 1 ? filters[0] : `AND(${filters.join(', ')})`
      : undefined;

    const result = await listRecords<Signal>('signals', {
      filterByFormula: filterFormula,
      sort: [{ field: 'detected_at', direction: 'desc' }],
      maxRecords: Math.min(limit, 100),
      offset,
    });

    const signals = result.records.map(r => ({
      id: r.id,
      ...r.fields,
    }));

    return NextResponse.json({ signals, offset: result.offset });
  } catch (error) {
    console.error('Error fetching signals:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
