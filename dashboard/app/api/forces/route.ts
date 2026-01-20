/**
 * GET /api/forces
 *
 * Fetch forces from Airtable with optional filtering
 */

import { NextResponse } from "next/server";
import { fetchForces } from "@/lib/airtable";

export async function GET() {
  try {
    const forces = await fetchForces();

    return NextResponse.json({
      success: true,
      data: forces,
      count: forces.length,
    });
  } catch (error) {
    console.error("Error fetching forces:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch forces",
      },
      { status: 500 }
    );
  }
}
