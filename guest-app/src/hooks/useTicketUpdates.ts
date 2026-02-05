import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { subscribeToTicketUpdates } from '../api/ticket-updates';
import type { Ticket } from '../types/api';

/**
 * Subscribe to real-time updates for a ticket (e.g. when admin changes status).
 * Updates the React Query cache and returns the latest update so the UI can show a notification.
 */
export function useTicketUpdates(ticketId: string | null): Ticket | null {
  const queryClient = useQueryClient();
  const [lastUpdate, setLastUpdate] = useState<Ticket | null>(null);

  useEffect(() => {
    if (!ticketId) return;

    const unsubscribe = subscribeToTicketUpdates(ticketId, (ticket) => {
      queryClient.setQueryData(['ticket', ticketId], ticket);
      setLastUpdate(ticket);
    });

    return unsubscribe;
  }, [ticketId, queryClient]);

  return lastUpdate;
}
