# Local Supabase

This project uses [Supabase](https://supabase.com) for the `tickets` table. You can run Supabase locally with the CLI (requires [Docker](https://docs.docker.com/get-docker/)).

## Commands

```bash
# From project root
cd /Users/yoann/avahost-tech-test

# Start local Supabase (first run pulls images; may take a few minutes)
supabase start

# Stop local Supabase
supabase stop

# Get local API URL and anon key (after start)
supabase status
```

## After `supabase start`

- **API URL:** `http://127.0.0.1:54321`
- **Studio:** http://127.0.0.1:54323
- **DB direct:** `postgresql://postgres:postgres@127.0.0.1:54322/postgres`

Run `supabase status` to see the exact URLs and the `anon` / `service_role` keys. Point the NestJS API (e.g. via env) to this URL and use the service role key for server-side access.

## Migrations

- Migrations live in `supabase/migrations/`.
- The `tickets` table is created by `20260205135557_create_tickets_table.sql`.
- To add a new migration: `supabase migration new your_migration_name`.

## Seed

Optional seed data: edit `supabase/seed.sql`. It runs on `supabase start` and `supabase db reset`.
