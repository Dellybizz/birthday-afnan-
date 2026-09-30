-- Run only on a NEW dedicated Supabase project, before the inherited migrations.
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
create table public.site_state (id text primary key, data jsonb not null, updated_at timestamptz not null default now());
create table public.site_admin_security (id text primary key, key_hash text not null, updated_at timestamptz not null default now());
alter table public.site_state enable row level security;
alter table public.site_admin_security enable row level security;
revoke all on public.site_state, public.site_admin_security from public, anon, authenticated;
grant all on public.site_state, public.site_admin_security to service_role;
grant select on public.site_state to anon, authenticated;
create policy published_state_read on public.site_state for select to anon, authenticated using (id = 'live');
insert into public.site_state(id,data) values ('live','{"schemaVersion":1,"general":{"name":"","nickname":"","birthdayISO":"","music":{},"appearance":{}},"pages":[],"menus":[]}');
insert into storage.buckets(id,name,public) values ('birthday-media','birthday-media',true);
-- No admin key is seeded. Initialize it with setup/set-admin-key.sql.
