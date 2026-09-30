-- Additive Phase 2 foundation. Legacy site_state/key functions remain unchanged.
create table public.cms_sites (
  id text primary key,
  owner_id uuid not null references auth.users(id),
  name text not null,
  access_mode text not null default 'private' check (access_mode in ('public','private')),
  active_release_id uuid,
  publication_sequence bigint not null default 0,
  created_at timestamptz not null default now()
);
create table public.cms_members (
  site_id text not null references public.cms_sites(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','editor')),
  primary key(site_id,user_id)
);
create index cms_members_user_idx on public.cms_members(user_id,site_id);
create table public.cms_releases (
  id uuid primary key default gen_random_uuid(),
  site_id text not null references public.cms_sites(id),
  document jsonb not null check (jsonb_typeof(document)='object' and document->>'schemaVersion'='2'),
  source_revision bigint not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(site_id,id)
);
alter table public.cms_sites add constraint cms_active_release_site_fk
foreign key(id,active_release_id) references public.cms_releases(site_id,id);
create index cms_releases_site_idx on public.cms_releases(site_id,created_at desc);
create table public.cms_drafts (
  id uuid primary key default gen_random_uuid(),
  site_id text not null unique references public.cms_sites(id),
  document jsonb not null check (jsonb_typeof(document)='object' and document->>'schemaVersion'='2'),
  revision bigint not null default 1 check (revision>0),
  base_release_id uuid,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique(site_id,id),
  foreign key(site_id,base_release_id) references public.cms_releases(site_id,id)
);
create table public.cms_draft_versions (
  draft_id uuid not null references public.cms_drafts(id),
  site_id text not null,
  revision bigint not null,
  document jsonb not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key(draft_id,revision),
  foreign key(site_id,draft_id) references public.cms_drafts(site_id,id)
);
create table public.cms_save_mutations (
  draft_id uuid not null references public.cms_drafts(id),
  actor_id uuid not null references auth.users(id),
  mutation_id text not null check(length(mutation_id) between 1 and 128),
  request jsonb not null,
  result jsonb not null,
  primary key(draft_id,actor_id,mutation_id)
);
create table public.cms_legacy_exports (
  site_id text primary key references public.cms_sites(id),
  original jsonb not null,
  imported_by uuid references auth.users(id) on delete set null,
  imported_at timestamptz not null default now()
);
create table public.cms_assets (
  site_id text not null references public.cms_sites(id),
  id text not null,
  storage_key text not null,
  status text not null default 'pending' check(status in ('pending','ready','trashed')),
  metadata jsonb not null default '{}'::jsonb,
  primary key(site_id,id),
  unique(storage_key)
);
create table public.cms_asset_refs (
  site_id text not null references public.cms_sites(id),
  owner_kind text not null check(owner_kind in ('draft','draft_version','release')),
  owner_id text not null,
  asset_id text not null,
  node_id text not null default '',
  field_path text not null,
  primary key(site_id,owner_kind,owner_id,asset_id,node_id,field_path)
);
create index cms_asset_refs_asset_idx on public.cms_asset_refs(site_id,asset_id);
create table public.cms_audit (
  id bigint generated always as identity primary key,
  site_id text not null references public.cms_sites(id),
  actor_id uuid references auth.users(id) on delete set null,
  operation text not null,
  target_id text,
  created_at timestamptz not null default now()
);
create index cms_audit_site_idx on public.cms_audit(site_id,created_at desc);
create table public.cms_request_limits (
  actor_id uuid primary key references auth.users(id) on delete cascade,
  window_start timestamptz not null,
  requests integer not null
);

-- No browser writes. Named users have read access only to their own memberships
-- and site-scoped resources. Privileged writes go through verified Edge handlers.
do $$
declare t text;
begin
  foreach t in array array['cms_sites','cms_members','cms_releases','cms_drafts','cms_draft_versions','cms_save_mutations','cms_legacy_exports','cms_assets','cms_asset_refs','cms_audit','cms_request_limits'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from public,anon,authenticated',t);
    execute format('grant select,insert,update,delete on public.%I to service_role',t);
  end loop;
end $$;
grant usage,select on sequence public.cms_audit_id_seq to service_role;
revoke update,delete on public.cms_releases,public.cms_draft_versions,public.cms_legacy_exports,public.cms_audit from service_role;
grant select on public.cms_members to authenticated;
create policy cms_self_membership on public.cms_members for select to authenticated using (user_id=(select auth.uid()));
do $$
declare t text;
begin
  foreach t in array array['cms_sites','cms_releases','cms_drafts','cms_draft_versions','cms_assets','cms_asset_refs','cms_audit'] loop
    execute format('grant select on public.%I to authenticated',t);
    execute format('create policy cms_member_read on public.%I for select to authenticated using (exists(select 1 from public.cms_members m where m.site_id=%I.%I and m.user_id=(select auth.uid())))',t,t,case when t='cms_sites' then 'id' else 'site_id' end);
  end loop;
end $$;

grant usage on schema auth to service_role;
grant select on auth.sessions to service_role;
create function public.cms_session_active(p_actor uuid,p_session uuid) returns boolean
language sql security invoker set search_path=public as $$
  select exists(select 1 from auth.sessions where id=p_session and user_id=p_actor and (not_after is null or not_after>clock_timestamp()))
$$;

create function public.cms_take_request_slot(p_actor uuid) returns boolean
language plpgsql security invoker set search_path=public as $$
declare n integer;
begin
  insert into public.cms_request_limits(actor_id,window_start,requests) values(p_actor,clock_timestamp(),1)
  on conflict(actor_id) do update set
    requests=case when cms_request_limits.window_start<clock_timestamp()-interval '1 minute' then 1 else cms_request_limits.requests+1 end,
    window_start=case when cms_request_limits.window_start<clock_timestamp()-interval '1 minute' then clock_timestamp() else cms_request_limits.window_start end
  returning requests into n;
  return n<=120;
end $$;

create function public.cms_save_draft(p_actor uuid,p_draft uuid,p_expected bigint,p_mutation text,p_document jsonb,p_refs jsonb)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare d public.cms_drafts%rowtype; prior public.cms_save_mutations%rowtype; result jsonb; saved timestamptz;
begin
  select * into d from public.cms_drafts where id=p_draft for update;
  if not found then return jsonb_build_object('ok',false,'code','FORBIDDEN'); end if;
  perform 1 from public.cms_members where site_id=d.site_id and user_id=p_actor and role in ('owner','editor') for share;
  if not found then return jsonb_build_object('ok',false,'code','FORBIDDEN'); end if;
  if p_mutation is null or length(p_mutation) not between 1 and 128 or p_expected is null or p_expected<1 then return jsonb_build_object('ok',false,'code','INVALID_REQUEST'); end if;
  select * into prior from public.cms_save_mutations where draft_id=p_draft and actor_id=p_actor and mutation_id=p_mutation;
  if found then
    if prior.request<>jsonb_build_object('expectedRevision',p_expected,'document',p_document) then return jsonb_build_object('ok',false,'code','IDEMPOTENCY_MISMATCH'); end if;
    return prior.result;
  end if;
  if d.revision<>p_expected then return jsonb_build_object('ok',false,'code','REVISION_CONFLICT','currentRevision',d.revision); end if;
  if p_document is null or jsonb_typeof(p_document)<>'object' or p_document->>'schemaVersion' is distinct from '2' or p_document->>'siteId' is distinct from d.site_id or octet_length(p_document::text)>1048576 or jsonb_typeof(p_refs) is distinct from 'array' then return jsonb_build_object('ok',false,'code','INVALID_DOCUMENT'); end if;
  saved=clock_timestamp();
  update public.cms_drafts set document=p_document,revision=d.revision+1,updated_by=p_actor,updated_at=saved where id=p_draft;
  insert into public.cms_draft_versions(draft_id,site_id,revision,document,created_by) values(p_draft,d.site_id,d.revision+1,p_document,p_actor);
  delete from public.cms_asset_refs where site_id=d.site_id and owner_kind='draft' and owner_id=p_draft::text;
  insert into public.cms_asset_refs(site_id,owner_kind,owner_id,asset_id,node_id,field_path)
  select d.site_id,'draft',p_draft::text,x->>'assetId',coalesce(x->>'nodeId',''),x->>'field' from jsonb_array_elements(p_refs) x on conflict do nothing;
  insert into public.cms_asset_refs(site_id,owner_kind,owner_id,asset_id,node_id,field_path)
  select d.site_id,'draft_version',p_draft::text||':'||(d.revision+1)::text,x->>'assetId',coalesce(x->>'nodeId',''),x->>'field' from jsonb_array_elements(p_refs) x on conflict do nothing;
  result=jsonb_build_object('ok',true,'revision',d.revision+1,'savedAt',saved);
  insert into public.cms_save_mutations values(p_draft,p_actor,p_mutation,jsonb_build_object('expectedRevision',p_expected,'document',p_document),result);
  insert into public.cms_audit(site_id,actor_id,operation,target_id) values(d.site_id,p_actor,'draft_saved',p_draft::text);
  return result;
end $$;

create function public.cms_initialize_site(p_actor uuid,p_site text,p_document jsonb,p_original jsonb,p_refs jsonb)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare s public.cms_sites%rowtype; release uuid; draft uuid;
begin
  select * into s from public.cms_sites where id=p_site for update;
  if not found then return jsonb_build_object('ok',false,'code','FORBIDDEN'); end if;
  perform 1 from public.cms_members where site_id=p_site and user_id=p_actor and role='owner' for share;
  if not found then return jsonb_build_object('ok',false,'code','FORBIDDEN'); end if;
  if s.active_release_id is not null then return jsonb_build_object('ok',false,'code','ALREADY_INITIALIZED'); end if;
  if p_document is null or p_document->>'schemaVersion' is distinct from '2' or p_document->>'siteId' is distinct from p_site or octet_length(p_document::text)>1048576 or jsonb_typeof(p_refs) is distinct from 'array' then return jsonb_build_object('ok',false,'code','INVALID_DOCUMENT'); end if;
  insert into public.cms_releases(site_id,document,source_revision,created_by) values(p_site,p_document,1,p_actor) returning id into release;
  insert into public.cms_drafts(site_id,document,base_release_id,updated_by) values(p_site,p_document,release,p_actor) returning id into draft;
  insert into public.cms_draft_versions(draft_id,site_id,revision,document,created_by) values(draft,p_site,1,p_document,p_actor);
  insert into public.cms_legacy_exports(site_id,original,imported_by) values(p_site,coalesce(p_original,p_document),p_actor);
  insert into public.cms_asset_refs(site_id,owner_kind,owner_id,asset_id,node_id,field_path)
  select p_site,k.kind,k.id,x->>'assetId',coalesce(x->>'nodeId',''),x->>'field'
  from jsonb_array_elements(p_refs) x cross join (values('release',release::text),('draft',draft::text),('draft_version',draft::text||':1')) k(kind,id) on conflict do nothing;
  update public.cms_sites set active_release_id=release,publication_sequence=1 where id=p_site;
  insert into public.cms_audit(site_id,actor_id,operation,target_id) values(p_site,p_actor,'baseline_imported',draft::text);
  return jsonb_build_object('ok',true,'draftId',draft,'releaseId',release);
end $$;

revoke all on function public.cms_take_request_slot(uuid) from public,anon,authenticated;
revoke all on function public.cms_session_active(uuid,uuid) from public,anon,authenticated;
revoke all on function public.cms_save_draft(uuid,uuid,bigint,text,jsonb,jsonb) from public,anon,authenticated;
revoke all on function public.cms_initialize_site(uuid,text,jsonb,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.cms_take_request_slot(uuid) to service_role;
grant execute on function public.cms_session_active(uuid,uuid) to service_role;
grant execute on function public.cms_save_draft(uuid,uuid,bigint,text,jsonb,jsonb) to service_role;
grant execute on function public.cms_initialize_site(uuid,text,jsonb,jsonb,jsonb) to service_role;
