/**
 * GET /api/opportunities
 *
 * Fetch opportunities from Airtable with optional filtering
 */

import { NextResponse } from "next/server";
import { fetchOpportunities } from "@/lib/airtable";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : undefined;

    const opportunities = await fetchOpportunities({
      status,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: opportunities,
      count: opportunities.length,
    });
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch opportunities",
      },
      { status: 500 }
    );
  }
}
