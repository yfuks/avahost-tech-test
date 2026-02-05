-- RLS: only admins (authenticated users with app_metadata.role = 'admin') can read/update tickets
-- and read conversations/messages. Service role (API) bypasses RLS.
-- Guest app does not access Supabase directly; it uses the NestJS API with service role.

alter table public.tickets enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_messages enable row level security;

-- Helper: true when the current JWT belongs to an admin (app_metadata.role = 'admin').
-- Null-safe so schema introspection or auth flows without a JWT do not error.
create or replace function public.is_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  j jsonb;
begin
  j := auth.jwt();
  if j is null then
    return false;
  end if;
  return coalesce((j -> 'app_metadata' ->> 'role') = 'admin', false);
end;
$$;

-- Tickets: admins can select and update (for back office)
create policy "Admins can select tickets"
  on public.tickets for select
  to authenticated
  using (public.is_admin());

create policy "Admins can update tickets"
  on public.tickets for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- No insert/delete for authenticated (API uses service_role to create tickets)
-- So we don't add insert/delete policies for authenticated; service_role bypasses RLS.

-- Conversations: admins can select (to show in back office)
create policy "Admins can select conversations"
  on public.conversations for select
  to authenticated
  using (public.is_admin());

-- Conversation messages: admins can select (to show ticket conversation history)
create policy "Admins can select conversation_messages"
  on public.conversation_messages for select
  to authenticated
  using (public.is_admin());
