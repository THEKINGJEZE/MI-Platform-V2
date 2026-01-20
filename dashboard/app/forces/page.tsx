"use client";

import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";

/**
 * Forces Directory Page - Coming Soon
 *
 * Full forces directory deferred to future phase.
 * See SPEC-009 for migration details.
 */
export default function ForcesPage() {
  return (
    <AppShell>
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-xl font-semibold mb-2">Forces Directory</h1>
            <p className="text-muted-foreground">
              Coming soon. This feature is planned for a future phase.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
