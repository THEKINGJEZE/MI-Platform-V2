import { NextRequest, NextResponse } from 'next/server';
import { listRecords, updateRecord, type Opportunity } from '@/lib/airtable';

/**
 * GET /api/opportunities
 *
 * Query params:
 * - status: Filter by status (e.g., "ready", "sent")
 * - priority: Filter by priority_tier (e.g., "hot", "high")
 * - forQueue: If "true", returns ready + hot opportunities for Monday review
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const forQueue = searchParams.get('forQueue') === 'true';

    let filterFormula: string | undefined;

    if (forQueue) {
      // Queue view: ready status OR hot priority
      filterFormula = 'OR({status}="ready", {priority_tier}="hot")';
    } else if (status && priority) {
      filterFormula = `AND({status}="${status}", {priority_tier}="${priority}")`;
    } else if (status) {
      filterFormula = `{status}="${status}"`;
    } else if (priority) {
      filterFormula = `{priority_tier}="${priority}"`;
    }

    const result = await listRecords<Opportunity>('opportunities', {
      filterByFormula: filterFormula,
      sort: [
        { field: 'priority_tier', direction: 'asc' }, // hot first (alphabetical)
        { field: 'priority_score', direction: 'desc' },
      ],
      maxRecords: 100,
    });

    // Transform to include id at top level
    const opportunities = result.records.map(r => ({
      id: r.id,
      ...r.fields,
    }));

    return NextResponse.json({ opportunities, offset: result.offset });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/opportunities
 *
 * Body: { id: string, fields: Partial<Opportunity> }
 *
 * G-011: Uses PATCH (upsert), never DELETE
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, fields } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing opportunity id' }, { status: 400 });
    }

    const result = await updateRecord<Opportunity>('opportunities', id, fields);

    return NextResponse.json({
      id: result.id,
      ...result.fields,
    });
  } catch (error) {
    console.error('Error updating opportunity:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
