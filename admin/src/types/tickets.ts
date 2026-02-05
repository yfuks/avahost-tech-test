export type TicketStatus = 'created' | 'in_progress' | 'resolved';

export interface Ticket {
  id: string;
  listing_id: string;
  category: string;
  status: TicketStatus;
  updated_at: string;
  conversation_id?: string | null;
}

export type ConversationMessageRole = 'user' | 'assistant';

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  role: ConversationMessageRole;
  content: string;
  created_at: string;
}
