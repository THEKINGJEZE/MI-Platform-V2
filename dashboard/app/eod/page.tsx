"use client";

import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Moon } from "lucide-react";

/**
 * End of Day Page - Coming Soon
 *
 * EOD ritual deferred to future phase.
 * See SPEC-009 for migration details.
 */
export default function EODPage() {
  return (
    <AppShell>
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Moon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-xl font-semibold mb-2">End of Day</h1>
            <p className="text-muted-foreground">
              Coming soon. This feature is planned for a future phase.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
