"use client";

import { redirect } from "next/navigation";

/**
 * Focus Page - Redirects to /review
 *
 * The focus route has been renamed to /review in V2.
 * This redirect ensures backward compatibility.
 */
export default function FocusPage() {
  redirect("/review");
}
