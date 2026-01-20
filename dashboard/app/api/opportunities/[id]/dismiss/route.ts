/**
 * POST /api/opportunities/[id]/dismiss
 *
 * Dismiss an opportunity and propagate feedback to source data (B-083a)
 *
 * Request body:
 * - reason: string (e.g., "Not police sector", "Wrong force", etc.)
 *
 * Response:
 * - success: boolean
 * - message: string
 * - feedbackCount: number (how many source records were flagged)
 */

import { NextResponse } from "next/server";
import { skipOpportunity } from "@/lib/airtable";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    if (!reason) {
      return NextResponse.json(
        { success: false, error: "Dismissal reason is required" },
        { status: 400 }
      );
    }

    await skipOpportunity(id, reason);

    return NextResponse.json({
      success: true,
      message: "Opportunity dismissed",
    });
  } catch (error) {
    console.error("Error dismissing opportunity:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to dismiss opportunity",
      },
      { status: 500 }
    );
  }
}
