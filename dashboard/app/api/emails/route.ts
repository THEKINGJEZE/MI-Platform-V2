/**
 * GET /api/emails
 *
 * Fetch emails from Airtable with optional filtering
 */

import { NextResponse } from "next/server";
import { fetchEmails, fetchEmailStats } from "@/lib/airtable";
import type { EmailClassification, EmailStatus } from "@/lib/types/email";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classification = searchParams.get("classification") as EmailClassification | null;
    const status = searchParams.get("status") as EmailStatus | null;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : undefined;
    const statsOnly = searchParams.get("stats") === "true";

    // If only stats requested
    if (statsOnly) {
      const stats = await fetchEmailStats();
      return NextResponse.json({
        success: true,
        stats,
      });
    }

    const emails = await fetchEmails({
      classification: classification || undefined,
      status: status || undefined,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: emails,
      count: emails.length,
    });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch emails",
      },
      { status: 500 }
    );
  }
}
