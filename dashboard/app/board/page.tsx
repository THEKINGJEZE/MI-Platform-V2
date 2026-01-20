"use client";

import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { LayoutDashboard } from "lucide-react";

/**
 * Board Page - Coming Soon
 *
 * Full board/dashboard view deferred to future phase.
 * See SPEC-009 for migration details.
 */
export default function BoardPage() {
  return (
    <AppShell>
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <LayoutDashboard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-xl font-semibold mb-2">Board View</h1>
            <p className="text-muted-foreground">
              Coming soon. This feature is planned for a future phase.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
