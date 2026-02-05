export type TicketStatus = 'created' | 'in_progress' | 'resolved';

export interface Ticket {
  id: string;
  listing_id: string;
  category: string;
  status: TicketStatus;
  updated_at: string;
}
