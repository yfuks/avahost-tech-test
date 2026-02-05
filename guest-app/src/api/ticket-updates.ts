import { getApiUrl } from './client';
import type { Ticket } from '../types/api';

/**
 * Subscribe to real-time ticket updates (SSE). When an admin changes the ticket
 * status, onUpdate is called with the new ticket. Returns a function to stop listening.
 */
export function subscribeToTicketUpdates(
  ticketId: string,
  onUpdate: (ticket: Ticket) => void
): () => void {
  const url = `${getApiUrl()}/tickets/${ticketId}/updates`;
  const ac = new AbortController();

  async function run() {
    try {
      const res = await fetch(url, {
        headers: { Accept: 'text/event-stream' },
        signal: ac.signal,
      });
      if (!res.ok || !res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const payload = line.slice(6).trim();
            if (payload === '[DONE]') continue;
            try {
              const ticket = JSON.parse(payload) as Ticket;
              onUpdate(ticket);
            } catch {
              // ignore malformed
            }
          }
        }
      }
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError') return;
    }
  }

  run();

  return () => ac.abort();
}
