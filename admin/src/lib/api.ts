import type {
  ConversationMessage,
  Ticket,
  TicketStatus,
} from '@/types/tickets';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  }
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
};

function headers(accessToken: string | null): HeadersInit {
  const h: HeadersInit = { 'Content-Type': 'application/json' };
  if (accessToken) {
    (h as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }
  return h;
}

export async function fetchTickets(accessToken: string | null): Promise<Ticket[]> {
  const res = await fetch(`${getBaseUrl()}/tickets`, {
    headers: headers(accessToken),
  });
  if (!res.ok) {
    throw new Error(`Erreur ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchConversationMessages(
  ticketId: string,
  accessToken: string | null
): Promise<ConversationMessage[]> {
  const res = await fetch(
    `${getBaseUrl()}/tickets/${ticketId}/conversation-messages`,
    { headers: headers(accessToken) }
  );
  if (!res.ok) {
    throw new Error(`Erreur ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export async function updateTicketStatus(
  id: string,
  status: TicketStatus,
  accessToken: string | null
): Promise<Ticket> {
  const res = await fetch(`${getBaseUrl()}/tickets/${id}`, {
    method: 'PATCH',
    headers: headers(accessToken),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erreur ${res.status}`);
  }
  return res.json();
}
