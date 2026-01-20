import { redirect } from "next/navigation";

/**
 * Root Page (/)
 *
 * Redirects to Review page — the primary Monday Review workflow.
 * V2 uses /review instead of /focus per SPEC-009.
 */
export default function RootPage() {
  redirect("/review");
}
