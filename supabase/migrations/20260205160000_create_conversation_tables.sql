-- Conversations: one per guest chat session (guest not authenticated; client can pass conversation_id to resume)
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.conversations is 'Guest chat sessions with Ava (no auth; identified by id for resume).';

-- Messages in a conversation (guest = user, Ava = assistant)
create table public.conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index idx_conversation_messages_conversation_id on public.conversation_messages(conversation_id);
create index idx_conversation_messages_created_at on public.conversation_messages(conversation_id, created_at);

comment on table public.conversation_messages is 'Messages between guest and Ava in a conversation.';
