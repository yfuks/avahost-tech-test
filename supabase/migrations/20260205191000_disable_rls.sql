-- Suppression de tout le RLS (politiques + fonction + RLS sur les tables)

drop policy if exists "Admins can select tickets" on public.tickets;
drop policy if exists "Admins can update tickets" on public.tickets;
drop policy if exists "Admins can select conversations" on public.conversations;
drop policy if exists "Admins can select conversation_messages" on public.conversation_messages;

drop function if exists public.is_admin();

alter table public.tickets disable row level security;
alter table public.conversations disable row level security;
alter table public.conversation_messages disable row level security;
