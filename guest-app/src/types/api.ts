/** Message sent to POST /chat/stream (content only; roles assigned server-side). */
export interface ChatMessageDto {
  content: string;
}

export type TicketStatus = 'created' | 'in_progress' | 'resolved';

export interface Ticket {
  id: string;
  listing_id: string;
  category: string;
  status: TicketStatus;
  updated_at: string;
}
