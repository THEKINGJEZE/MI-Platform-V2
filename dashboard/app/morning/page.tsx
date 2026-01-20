"use client";

import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Sun } from "lucide-react";

/**
 * Morning Brief Page - Coming Soon
 *
 * Morning Brief ritual deferred to SPEC-008.
 * See SPEC-009 for migration details.
 */
export default function MorningBriefPage() {
  return (
    <AppShell>
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Sun className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-xl font-semibold mb-2">Morning Brief</h1>
            <p className="text-muted-foreground">
              Coming soon. This feature is planned for SPEC-008.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
