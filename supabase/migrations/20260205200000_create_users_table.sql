-- User table: app-level user (role). Links to auth.users.
-- Auth = Supabase session; User = role (admin vs user) stored here.
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

comment on table public.users is 'App users (role). id references auth.users.';
create index users_role_idx on public.users(role);
