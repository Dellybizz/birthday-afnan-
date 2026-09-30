-- Run privately in the NEW dedicated project's SQL editor after migrations.
-- Invite the owner through Supabase Auth first, then replace this UUID.
do $$
declare owner_user uuid := 'REPLACE_WITH_INVITED_OWNER_UUID'::uuid;
begin
  if not exists(select 1 from auth.users where id=owner_user) then raise exception 'Invite the owner account first'; end if;
  if exists(select 1 from public.cms_sites where id='site_afnan' and owner_id<>owner_user) then raise exception 'Site already belongs to another owner'; end if;
  insert into public.cms_sites(id,owner_id,name) values('site_afnan',owner_user,'Birthday Afnan') on conflict(id) do nothing;
  insert into public.cms_members(site_id,user_id,role) values('site_afnan',owner_user,'owner') on conflict(site_id,user_id) do update set role='owner';
end $$;
