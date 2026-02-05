import { getApiUrl } from './client';
import type { Ticket } from '../types/api';

/**
 * GET /tickets/:id - for follow-up and Suspense demo.
 */
export async function getTicket(ticketId: string): Promise<Ticket> {
  const url = `${getApiUrl()}/tickets/${ticketId}`;
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) throw new Error('Ticket introuvable');
    const text = await res.text();
    throw new Error(text || `Erreur ${res.status}`);
  }
  return res.json() as Promise<Ticket>;
}
