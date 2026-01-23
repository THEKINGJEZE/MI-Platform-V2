/**
 * POST /api/decay-alerts/[id]/acknowledge
 * PATCH /api/decay-alerts/[id]
 *
 * Acknowledge or update a decay alert
 */

import { NextResponse } from 'next/server';
import { acknowledgeDecayAlert } from '@/lib/airtable';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH - Acknowledge a decay alert
 */
export async function PATCH(request: Request, context: RouteParams) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    if (body.action === 'acknowledge') {
      await acknowledgeDecayAlert(id);
      return NextResponse.json({
        success: true,
        message: 'Alert acknowledged',
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid action. Use action: "acknowledge"',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating decay alert:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to update decay alert',
      },
      { status: 500 }
    );
  }
}
