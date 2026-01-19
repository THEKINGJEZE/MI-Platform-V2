'use client';

import { Nav, PageHeader } from '@/components/nav';
import { OpportunityCard, getContactLinkedIn } from '@/components/opportunity-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQueueOpportunities, useUpdateOpportunity, useSendAction } from '@/lib/queries';
import { UIProvider } from '@/stores/ui-store';

/**
 * Queue View — Monday Morning Experience
 *
 * Per SPEC-007 §5:
 * - Hot Leads section (top) — priority = "Hot"
 * - Ready to Send section — status = "Ready"
 * - Opportunity cards with inline editing
 * - Send/Skip actions
 */
function QueueContent() {
  const { data, isLoading, error } = useQueueOpportunities();
  const updateMutation = useUpdateOpportunity();
  const sendMutation = useSendAction();

  // Extract opportunities array from response
  const opportunities = data?.opportunities ?? [];

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load opportunities</p>
        <p className="text-sm text-muted-foreground mt-2">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  // Split opportunities into Hot Leads and Ready to Send
  const hotLeads = opportunities.filter((opp) => opp.priority_tier?.toLowerCase() === 'hot');
  const readyToSend = opportunities.filter(
    (opp) => opp.priority_tier?.toLowerCase() !== 'hot' && opp.status?.toLowerCase() === 'ready'
  );

  const handleSendEmail = async (opportunityId: string) => {
    await sendMutation.mutateAsync({
      opportunity_id: opportunityId,
      action: 'send_email',
    });
  };

  const handleSendLinkedIn = async (opportunityId: string) => {
    // Copy message to clipboard + open LinkedIn
    const opp = opportunities.find((o) => o.id === opportunityId);
    if (opp?.outreach_draft) {
      await navigator.clipboard.writeText(opp.outreach_draft);
    }
    const linkedinUrl = opp ? getContactLinkedIn(opp) : undefined;
    if (linkedinUrl) {
      window.open(linkedinUrl, '_blank');
    }
    // Mark as sent
    await sendMutation.mutateAsync({
      opportunity_id: opportunityId,
      action: 'send_linkedin',
    });
  };

  const handleSkip = async (opportunityId: string, reason?: string) => {
    await sendMutation.mutateAsync({
      opportunity_id: opportunityId,
      action: 'skip',
      skip_reason: reason,
    });
  };

  const handleUpdateMessage = async (opportunityId: string, message: string) => {
    await updateMutation.mutateAsync({
      id: opportunityId,
      fields: { outreach_draft: message },
    });
  };

  const totalCount = (hotLeads?.length ?? 0) + (readyToSend?.length ?? 0);

  return (
    <>
      <PageHeader
        title="Monday Queue"
        subtitle={`${totalCount} opportunities ready for review`}
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Hot Leads Section */}
          {hotLeads.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="text-red-500">🔥</span>
                Hot Leads
                <span className="text-sm font-normal text-muted-foreground">
                  ({hotLeads.length})
                </span>
              </h2>
              <div className="space-y-4">
                {hotLeads.map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    onSendEmail={() => handleSendEmail(opp.id)}
                    onSendLinkedIn={() => handleSendLinkedIn(opp.id)}
                    onSkip={(reason) => handleSkip(opp.id, reason)}
                    onUpdateMessage={(message) =>
                      handleUpdateMessage(opp.id, message)
                    }
                    isLoading={
                      sendMutation.isPending || updateMutation.isPending
                    }
                  />
                ))}
              </div>
            </section>
          )}

          {/* Ready to Send Section */}
          {readyToSend.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Ready to Send
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({readyToSend.length})
                </span>
              </h2>
              <div className="space-y-4">
                {readyToSend.map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    onSendEmail={() => handleSendEmail(opp.id)}
                    onSendLinkedIn={() => handleSendLinkedIn(opp.id)}
                    onSkip={(reason) => handleSkip(opp.id, reason)}
                    onUpdateMessage={(message) =>
                      handleUpdateMessage(opp.id, message)
                    }
                    isLoading={
                      sendMutation.isPending || updateMutation.isPending
                    }
                  />
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {hotLeads.length === 0 && readyToSend.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No opportunities ready for review
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Check the Pipeline view for opportunities in progress
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default function QueuePage() {
  return (
    <UIProvider>
      <div className="min-h-screen bg-background">
        <Nav />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <QueueContent />
        </main>
      </div>
    </UIProvider>
  );
}
