"use client";

import { ToastProvider, ToastContainer } from "@/components/feedback/toast";

/**
 * Client-side providers wrapper
 *
 * Wraps the app with necessary context providers:
 * - ToastProvider: Global toast notifications
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <ToastContainer />
    </ToastProvider>
  );
}
