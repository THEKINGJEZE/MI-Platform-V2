/**
 * GET /api/opportunities/[id]
 * PATCH /api/opportunities/[id]
 *
 * Fetch or update a single opportunity
 */

import { NextResponse } from "next/server";
import { fetchOpportunityById, updateOpportunityStatus } from "@/lib/airtable";
import type { OpportunityStatus } from "@/lib/types/opportunity";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const opportunity = await fetchOpportunityById(id);

    if (!opportunity) {
      return NextResponse.json(
        { success: false, error: "Opportunity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: opportunity,
    });
  } catch (error) {
    console.error("Error fetching opportunity:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch opportunity",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body as { status?: OpportunityStatus };

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status is required" },
        { status: 400 }
      );
    }

    await updateOpportunityStatus(id, status);

    return NextResponse.json({
      success: true,
      message: "Opportunity updated",
    });
  } catch (error) {
    console.error("Error updating opportunity:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update opportunity",
      },
      { status: 500 }
    );
  }
}
