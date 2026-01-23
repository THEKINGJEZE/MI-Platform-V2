/**
 * GET /api/decay-alerts
 *
 * Fetch relationship decay alerts from Airtable
 * Per SPEC-012 Phase 2a-7 and Decision I4 (Two-tier decay)
 *
 * Query params:
 * - status: Filter by decay status (warming, at_risk, cold)
 * - type: Filter by alert type (deal_contact, client_checkin, organisation)
 * - grouped: If "true", return alerts grouped by section
 * - stats: If "true", return only statistics
 * - limit: Maximum number of alerts to return
 */

import { NextResponse } from 'next/server';
import {
  fetchDecayAlerts,
  fetchDecayAlertsBySection,
  fetchDecayStats,
} from '@/lib/airtable';
import type { DecayStatus, DecayAlertType } from '@/lib/types/decay';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as DecayStatus | null;
    const alertType = searchParams.get('type') as DecayAlertType | null;
    const grouped = searchParams.get('grouped') === 'true';
    const statsOnly = searchParams.get('stats') === 'true';
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!, 10)
      : undefined;

    // Return stats only
    if (statsOnly) {
      const stats = await fetchDecayStats();
      return NextResponse.json({
        success: true,
        stats,
      });
    }

    // Return grouped by section (for dashboard three-panel view)
    if (grouped) {
      const sections = await fetchDecayAlertsBySection();
      return NextResponse.json({
        success: true,
        data: sections,
        counts: {
          dealContacts: sections.dealContacts.length,
          clientCheckins: sections.clientCheckins.length,
          organisations: sections.organisations.length,
          total:
            sections.dealContacts.length +
            sections.clientCheckins.length +
            sections.organisations.length,
        },
      });
    }

    // Return flat list with optional filters
    const alerts = await fetchDecayAlerts({
      status: status || undefined,
      alertType: alertType || undefined,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: alerts,
      count: alerts.length,
    });
  } catch (error) {
    console.error('Error fetching decay alerts:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch decay alerts',
      },
      { status: 500 }
    );
  }
}
