-- Link tickets to conversations (chat creates tickets with conversation context)
alter table public.tickets
  add column if not exists conversation_id uuid references public.conversations(id) on delete set null;

create index if not exists idx_tickets_conversation_id
  on public.tickets(conversation_id);

-- Only one unresolved ticket per conversation
create unique index if not exists idx_one_unresolved_ticket_per_conversation
  on public.tickets (conversation_id)
  where conversation_id is not null
    and status in ('created', 'in_progress');

comment on column public.tickets.conversation_id is 'Conversation that created this ticket; at most one unresolved ticket per conversation.';
