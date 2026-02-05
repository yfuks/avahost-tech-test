import type { Ticket, TicketStatus } from '@/types/tickets';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  }
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
};

export async function fetchTickets(): Promise<Ticket[]> {
  const res = await fetch(`${getBaseUrl()}/tickets`);
  if (!res.ok) {
    throw new Error(`Erreur ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export async function updateTicketStatus(
  id: string,
  status: TicketStatus
): Promise<Ticket> {
  const res = await fetch(`${getBaseUrl()}/tickets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erreur ${res.status}`);
  }
  return res.json();
}
