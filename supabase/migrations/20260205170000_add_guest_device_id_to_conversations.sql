-- Associate conversations with a guest device (phone UUID or stable device id per install)
alter table public.conversations
  add column if not exists guest_device_id text;

create index if not exists idx_conversations_guest_device_id
  on public.conversations(guest_device_id);

comment on column public.conversations.guest_device_id is 'Stable device/guest id (e.g. phone UUID from app) so conversations are scoped per device.';
