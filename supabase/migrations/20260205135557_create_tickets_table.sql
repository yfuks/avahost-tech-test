-- Tickets table for Ava ticketing (AGENTS.md schema)
create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  listing_id text not null,
  category text not null,
  status text not null check (status in ('created', 'in_progress', 'resolved')),
  updated_at timestamptz not null default now()
);

-- Optional: enable RLS if you need row-level security later
-- alter table public.tickets enable row level security;

comment on table public.tickets is 'Support tickets for guest incidents (e.g. internet).';
