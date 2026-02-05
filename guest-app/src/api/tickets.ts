import { getApiUrl } from './client';
import type { Ticket } from '../types/api';

/**
 * GET /tickets/:id - for follow-up and display.
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

/**
 * GET /tickets?conversation_id= — returns the ticket for this conversation, or null if none.
 */
export async function getTicketByConversationId(
  conversationId: string,
): Promise<Ticket | null> {
  const url = `${getApiUrl()}/tickets?conversation_id=${encodeURIComponent(conversationId)}`;
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erreur ${res.status}`);
  }
  return res.json() as Promise<Ticket>;
}

/**
 * GET /tickets?guest_device_id= — returns all tickets for this guest's conversations (for left panel).
 */
export async function getTicketsByGuestDeviceId(
  guestDeviceId: string,
): Promise<Ticket[]> {
  const url = `${getApiUrl()}/tickets?guest_device_id=${encodeURIComponent(guestDeviceId)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erreur ${res.status}`);
  }
  return res.json() as Promise<Ticket[]>;
}
