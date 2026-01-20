/**
 * Keyboard Navigation Hook
 *
 * Per SPEC-007b: J/K navigation, E/S/D actions, Z undo, ? shortcuts
 */

'use client';

import * as React from 'react';
import { useReviewStore, useCurrentOpportunity } from '@/lib/stores/review-store';

interface UseKeyboardNavOptions {
  onSend?: () => void;
  enabled?: boolean;
}

export function useKeyboardNav(options: UseKeyboardNavOptions = {}) {
  const { onSend, enabled = true } = options;

  const {
    selectNext,
    selectPrevious,
    markAsSent,
    markAsSkipped,
    markAsWon,
    markAsLost,
    openDismissModal,
    closeDismissModal,
    undo,
    toggleShortcutOverlay,
    isDismissModalOpen,
    isShortcutOverlayOpen,
    addToast,
  } = useReviewStore();

  const opportunity = useCurrentOpportunity();

  React.useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Handle Escape for modals
      if (e.key === 'Escape') {
        if (isDismissModalOpen) {
          closeDismissModal();
          return;
        }
        if (isShortcutOverlayOpen) {
          toggleShortcutOverlay();
          return;
        }
        return;
      }

      // Don't process other keys if modal is open
      if (isDismissModalOpen) return;

      switch (e.key.toLowerCase()) {
        case 'j':
          e.preventDefault();
          selectNext();
          break;

        case 'k':
          e.preventDefault();
          selectPrevious();
          break;

        case 'e':
          if (opportunity) {
            e.preventDefault();
            if (onSend) {
              onSend();
            } else {
              // Default send behavior
              handleSend(opportunity.id);
            }
          }
          break;

        case 's':
          if (opportunity) {
            e.preventDefault();
            handleSkip(opportunity.id);
          }
          break;

        case 'd':
          if (opportunity) {
            e.preventDefault();
            openDismissModal();
          }
          break;

        // V1 parity: W/L shortcuts for Won/Lost outcomes
        case 'w':
          if (opportunity) {
            e.preventDefault();
            handleWon(opportunity.id);
          }
          break;

        case 'l':
          if (opportunity) {
            e.preventDefault();
            handleLost(opportunity.id);
          }
          break;

        case 'z':
          e.preventDefault();
          const undone = undo();
          if (undone) {
            addToast({
              type: 'success',
              title: 'Action undone',
              duration: 3000,
            });
          } else {
            addToast({
              type: 'error',
              title: 'Nothing to undo',
              description: 'Undo window has expired',
              duration: 3000,
            });
          }
          break;

        case '?':
          e.preventDefault();
          toggleShortcutOverlay();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    enabled,
    opportunity,
    isDismissModalOpen,
    isShortcutOverlayOpen,
    selectNext,
    selectPrevious,
    openDismissModal,
    closeDismissModal,
    undo,
    toggleShortcutOverlay,
    addToast,
    onSend,
  ]);

  // Internal handlers
  function handleSend(opportunityId: string) {
    const opp = useReviewStore.getState().opportunities.find(
      (o) => o.id === opportunityId
    );
    if (!opp) return;

    // Build mailto link
    const to = opp.contact?.email || '';
    const subject = opp.draftSubject || `Re: ${opp.force?.name || 'Opportunity'} - Peel Solutions`;
    const body = opp.draftBody || '';
    const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open email client
    window.open(mailtoUrl, '_blank');

    // Mark as sent
    markAsSent(opportunityId);

    addToast({
      type: 'undo',
      title: `Sent: ${opp.force?.name || opp.name}`,
      description: 'Press Z to undo',
      duration: 30000,
      onUndo: () => {
        useReviewStore.getState().undo();
      },
    });
  }

  function handleSkip(opportunityId: string) {
    const opp = useReviewStore.getState().opportunities.find(
      (o) => o.id === opportunityId
    );
    if (!opp) return;

    markAsSkipped(opportunityId);

    addToast({
      type: 'undo',
      title: `Skipped: ${opp.force?.name || opp.name}`,
      description: 'Press Z to undo',
      duration: 30000,
      onUndo: () => {
        useReviewStore.getState().undo();
      },
    });
  }

  // V1 parity: Won/Lost handlers
  function handleWon(opportunityId: string) {
    const opp = useReviewStore.getState().opportunities.find(
      (o) => o.id === opportunityId
    );
    if (!opp) return;

    markAsWon(opportunityId);

    addToast({
      type: 'success',
      title: `Won: ${opp.force?.name || opp.name}`,
      description: 'Press Z to undo',
      duration: 30000,
      onUndo: () => {
        useReviewStore.getState().undo();
      },
    });
  }

  function handleLost(opportunityId: string) {
    const opp = useReviewStore.getState().opportunities.find(
      (o) => o.id === opportunityId
    );
    if (!opp) return;

    markAsLost(opportunityId);

    addToast({
      type: 'undo',
      title: `Lost: ${opp.force?.name || opp.name}`,
      description: 'Press Z to undo',
      duration: 30000,
      onUndo: () => {
        useReviewStore.getState().undo();
      },
    });
  }
}
