import { NextRequest, NextResponse } from 'next/server';
import { updateRecord, type Opportunity } from '@/lib/airtable';

/**
 * POST /api/send
 *
 * Triggers the WF6: Send Outreach workflow via n8n webhook.
 *
 * GUARDRAILS:
 * - G-002: Command Queue for Emails — sends to n8n webhook, not direct to email
 * - G-008: Always Include webhookId — includes webhookId in the request
 * - G-011: Upsert Only — updates opportunity status via PATCH
 *
 * Body: {
 *   opportunity_id: string,
 *   action: "send_email" | "send_linkedin" | "skip",
 *   skip_reason?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { opportunity_id, action, skip_reason } = body;

    if (!opportunity_id) {
      return NextResponse.json({ error: 'Missing opportunity_id' }, { status: 400 });
    }

    if (!['send_email', 'send_linkedin', 'skip'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be send_email, send_linkedin, or skip' },
        { status: 400 }
      );
    }

    // Handle skip action locally
    if (action === 'skip') {
      const result = await updateRecord<Opportunity>('opportunities', opportunity_id, {
        status: 'skipped',
        skipped_reason: skip_reason || 'Skipped via dashboard',
      });

      return NextResponse.json({
        success: true,
        action: 'skip',
        opportunity: { id: result.id, ...result.fields },
      });
    }

    // For send actions, trigger n8n webhook (G-002, G-008)
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    const webhookId = process.env.N8N_WEBHOOK_ID;

    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'N8N_WEBHOOK_URL not configured' },
        { status: 500 }
      );
    }

    // G-008: Include webhookId in the payload
    const webhookPayload = {
      opportunity_id,
      action,
      webhookId, // G-008 compliance
      triggered_at: new Date().toISOString(),
      source: 'mi-dashboard',
    };

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('Webhook error:', errorText);
      return NextResponse.json(
        { error: `Webhook failed: ${webhookResponse.status}` },
        { status: 502 }
      );
    }

    // Update opportunity status optimistically
    const newStatus = action === 'send_email' ? 'sent' : 'sent';
    const result = await updateRecord<Opportunity>('opportunities', opportunity_id, {
      status: newStatus,
      sent_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      action,
      opportunity: { id: result.id, ...result.fields },
    });
  } catch (error) {
    console.error('Error in send action:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
