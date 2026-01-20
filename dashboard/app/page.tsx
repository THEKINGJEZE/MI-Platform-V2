/**
 * Home Page — Redirect to Review
 *
 * Per SPEC-007b: Main entry point redirects to Three-Zone review layout
 */

import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/review');
}
