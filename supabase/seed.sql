-- Seed data for local development (optional)
-- Example: insert into public.tickets (listing_id, category, status) values ('DEMO', 'internet', 'created');

-- Default admin user for back office (local dev)
-- Email: admin@avahost.local / Password: Admin123!
-- Requires pgcrypto for password hashing.
-- Auth expects some columns to be non-null (e.g. token fields as empty string) to avoid "Database error querying schema".
create extension if not exists pgcrypto;

do $$
declare
  v_user_id uuid := gen_random_uuid();
  v_encrypted_pw text := crypt('Admin123!', gen_salt('bf'));
begin
  insert into auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  values (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@avahost.local',
    v_encrypted_pw,
    now(),
    '{"role":"admin","provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values (
    v_user_id,
    v_user_id,
    format('{"sub": "%s", "email": "admin@avahost.local"}', v_user_id)::jsonb,
    'email',
    v_user_id::text,
    now(),
    now(),
    now()
  );
end$$;
