/**
 * PATCH /api/emails/[id]
 *
 * Update email status or properties
 */

import { NextResponse } from "next/server";
import { updateEmailStatus, skipEmail, approveEmailDraft } from "@/lib/airtable";
import type { EmailStatus } from "@/lib/types/email";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, status } = body;

    // Handle specific actions
    if (action === "skip") {
      await skipEmail(id, body.permanent);
      return NextResponse.json({
        success: true,
        message: "Email skipped",
      });
    }

    if (action === "approve") {
      await approveEmailDraft(id);
      return NextResponse.json({
        success: true,
        message: "Draft approved",
      });
    }

    // Handle generic status update
    if (status) {
      await updateEmailStatus(id, status as EmailStatus, body.fields);
      return NextResponse.json({
        success: true,
        message: `Email status updated to ${status}`,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "No valid action or status provided",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating email:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update email",
      },
      { status: 500 }
    );
  }
}
