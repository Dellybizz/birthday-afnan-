import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { emptyDocument, sampleDocument, assetReferences } from '../src/cms/index.ts';

test('Phase 2 PostgreSQL permissions, revisions, idempotency and baseline preservation', async t => {
  const db = new PGlite();
  const a = '11111111-1111-4111-8111-111111111111', b = '22222222-2222-4222-8222-222222222222', e = '33333333-3333-4333-8333-333333333333';
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key); create table auth.sessions(id uuid primary key,user_id uuid,not_after timestamptz); grant usage on schema auth to service_role; grant select on auth.sessions to service_role; create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;`);
    await db.exec(readFileSync('supabase/migrations/20260930220539_cms_phase2_admin_drafts.sql', 'utf8'));
    await db.query('insert into auth.users values($1),($2),($3)', [a, b, e]);
    await db.query("insert into cms_sites(id,owner_id,name) values('site_afnan',$1,'A'),('other_site',$2,'B')", [a, b]);
    await db.query("insert into cms_members values('site_afnan',$1,'owner'),('other_site',$2,'owner'),('site_afnan',$3,'editor')", [a, b, e]);
    const original = { schemaVersion: 1, original: 'retained' }, doc = emptyDocument();
    await db.exec('set role service_role');
    const init = (await db.query<{ r: any }>('select cms_initialize_site($1,$2,$3,$4,$5) r', [a, 'site_afnan', doc, original, []])).rows[0].r;
    assert.equal(init.ok, true); const draft = init.draftId;
    const save = async (actor: string, expected: number, mutation: string, document = doc) => (await db.query<{ r: any }>('select cms_save_draft($1,$2,$3,$4,$5,$6) r', [actor, draft, expected, mutation, document, assetReferences(document)])).rows[0].r;
    await t.test('two competing saves have one winner and one conflict', async () => { const results = await Promise.all([save(a, 1, 'one'), save(e, 1, 'two')]); assert.equal(results.filter(r => r.ok).length, 1); assert.equal(results.filter(r => r.code === 'REVISION_CONFLICT').length, 1); });
    await t.test('retry returns original result; changed request key is rejected', async () => { const retry = await save(a, 1, 'one'); assert.equal(retry.revision, 2); const changed = structuredClone(doc); changed.general.name = 'Changed'; assert.equal((await save(a, 1, 'one', changed)).code, 'IDEMPOTENCY_MISMATCH'); });
    await t.test('wrong-site actor cannot save or initialise', async () => { assert.equal((await save(b, 2, 'wrong')).code, 'FORBIDDEN'); const result = (await db.query<{ r: any }>('select cms_initialize_site($1,$2,$3,$4,$5) r', [b, 'site_afnan', doc, null, []])).rows[0].r; assert.equal(result.code, 'FORBIDDEN'); });
    await t.test('save does not change active release or original export', async () => { const active = (await db.query<{ document: any }>('select r.document from cms_releases r join cms_sites s on s.active_release_id=r.id')).rows[0].document; assert.deepEqual(active, doc); assert.deepEqual((await db.query<{ original: any }>('select original from cms_legacy_exports')).rows[0].original, original); });
    await t.test('wrong document site is rejected without revision advance', async () => { const wrong = emptyDocument('other_site'); assert.equal((await save(a, 2, 'badsite', wrong)).code, 'INVALID_DOCUMENT'); assert.equal((await db.query<{ revision: number }>('select revision from cms_drafts')).rows[0].revision, 2); });
    await t.test('saved versions and exact asset refs advance atomically; releases stay immutable', async () => { assert.equal((await save(e, 2, 'assets', sampleDocument())).revision, 3); assert.equal((await db.query("select 1 from cms_asset_refs where owner_kind='draft' and asset_id='sample_image'")).rows.length, 1); assert.equal((await db.query("select 1 from cms_asset_refs where owner_kind='draft_version' and asset_id='sample_video'")).rows.length, 1); assert.equal((await db.query('select 1 from cms_draft_versions where revision=3')).rows.length, 1); await assert.rejects(db.query("update cms_releases set source_revision=999")); });
    await t.test('rate limiter atomically counts requests and blocks over budget', async () => { let last = true; for (let i = 0; i < 121; i++) last = (await db.query<{ r: boolean }>('select cms_take_request_slot($1) r', [a])).rows[0].r; assert.equal(last, false); });
    await db.exec('reset role');
    await t.test('session check rejects wrong owner, expired and revoked sessions', async () => { await db.query('insert into auth.sessions values($1,$2,null)', [e, a]); await db.exec('set role service_role'); assert.equal((await db.query<{ r: boolean }>('select cms_session_active($1,$2) r', [a, e])).rows[0].r, true); assert.equal((await db.query<{ r: boolean }>('select cms_session_active($1,$2) r', [b, e])).rows[0].r, false); await db.exec('reset role'); await db.query("update auth.sessions set not_after=now()-interval '1 minute'"); await db.exec('set role service_role'); assert.equal((await db.query<{ r: boolean }>('select cms_session_active($1,$2) r', [a, e])).rows[0].r, false); await db.exec('reset role'); await db.exec('delete from auth.sessions'); await db.exec('set role service_role'); assert.equal((await db.query<{ r: boolean }>('select cms_session_active($1,$2) r', [a, e])).rows[0].r, false); await db.exec('reset role'); });
    await t.test('RLS lets members read only their site and forbids direct writes/RPC impersonation', async () => {
      await db.query("select set_config('request.jwt.claim.sub',$1,false)", [b]); await db.exec('set role authenticated');
      assert.equal((await db.query('select * from cms_drafts')).rows.length, 0); assert.deepEqual((await db.query<{ id: string }>('select id from cms_sites')).rows.map(r => r.id), ['other_site']);
      await assert.rejects(db.query('update cms_drafts set revision=99'));
      await assert.rejects(db.query('select cms_save_draft($1,$2,$3,$4,$5,$6)', [a, draft, 2, 'impersonate', doc, []]));
      await db.exec('reset role'); await db.query("select set_config('request.jwt.claim.sub',$1,false)", [a]); await db.exec('set role authenticated'); assert.equal((await db.query('select * from cms_drafts')).rows.length, 1); await db.exec('reset role');
    });
    await t.test('anonymous users cannot read drafts or execute writes', async () => { await db.exec('set role anon'); await assert.rejects(db.query('select * from cms_drafts')); await assert.rejects(db.query('select cms_take_request_slot($1)', [a])); await db.exec('reset role'); });
    await t.test('membership revocation is enforced even for previously valid retry', async () => { await db.query('delete from cms_members where user_id=$1 and site_id=$2', [a, 'site_afnan']); await db.exec('set role service_role'); assert.equal((await save(a, 1, 'one')).code, 'FORBIDDEN'); await db.exec('reset role'); });
    await t.test('all new tables have RLS and no security-definer functions', async () => { const rows = (await db.query<{ relrowsecurity: boolean }>("select relrowsecurity from pg_class where relname like 'cms_%' and relkind='r'")).rows; assert.equal(rows.length, 11); assert.ok(rows.every(r => r.relrowsecurity)); assert.equal((await db.query("select 1 from pg_proc where proname like 'cms_%' and prosecdef")).rows.length, 0); });
  } finally { await db.close(); }
});
