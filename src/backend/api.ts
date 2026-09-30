import { validateDocument, validId, record } from '../cms/validators/index.ts';
import { assetReferences } from '../cms/document/index.ts';
import { migrateV1 } from '../cms/migrations/v1.ts';
import { emptyDocument } from '../cms/schemas/defaults.ts';
import type { Document } from '../cms/schemas/types.ts';

export type Row = Record<string, unknown>;
export interface Backend {
  verify(token: string): Promise<string | null>;
  slot(actor: string): Promise<boolean>;
  memberships(actor: string): Promise<Row[]>;
  draft(actor: string, site: string): Promise<Row | null>;
  save(actor: string, draft: string, expected: number, mutation: string, document: Document): Promise<Row>;
  initialize(actor: string, site: string, document: Document, original: unknown): Promise<Row>;
  legacy(site: string): Promise<unknown>;
  release(site: string): Promise<Row | null>;
}
const uuid = (v: unknown): v is string => typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
export class APIError extends Error { status: number; code: string; constructor(status: number, code: string) { super(code); this.status = status; this.code = code; } }
async function body(req: Request): Promise<Row> {
  const reader = req.body?.getReader(); if (!reader) throw new APIError(400, 'INVALID_REQUEST');
  let size = 0; const chunks: Uint8Array[] = [];
  while (true) { const item = await reader.read(); if (item.done) break; size += item.value.length; if (size > 1064960) { await reader.cancel(); throw new APIError(413, 'REQUEST_TOO_LARGE'); } chunks.push(item.value); }
  const bytes = new Uint8Array(size); let at = 0; for (const chunk of chunks) { bytes.set(chunk, at); at += chunk.length; }
  try { const value = JSON.parse(new TextDecoder().decode(bytes)); if (!record(value)) throw Error(); return value; } catch { throw new APIError(400, 'INVALID_REQUEST'); }
}
function response(req: Request, origins: readonly string[], value: unknown, status = 200, requestId = crypto.randomUUID()): Response {
  const origin = req.headers.get('origin'); return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Request-ID': requestId, 'Vary': 'Origin', ...(origin && origins.includes(origin) ? { 'Access-Control-Allow-Origin': origin } : {}), 'Access-Control-Allow-Headers': 'authorization,apikey,content-type', 'Access-Control-Allow-Methods': 'POST,GET,OPTIONS', 'X-Content-Type-Options': 'nosniff' } });
}
export function createAdminHandler(backend: Backend, origins: readonly string[]) {
  return async (req: Request): Promise<Response> => {
    const requestId = crypto.randomUUID();
    try {
      const origin = req.headers.get('origin'); if (origin && !origins.includes(origin)) throw new APIError(403, 'ORIGIN_DENIED');
      if (req.method === 'OPTIONS') return response(req, origins, { ok: true }, 200, requestId);
      if (req.method !== 'POST') throw new APIError(405, 'METHOD_NOT_ALLOWED');
      const authorization = req.headers.get('authorization') ?? ''; const token = authorization.match(/^Bearer (\S+)$/)?.[1];
      if (!token) throw new APIError(401, 'UNAUTHENTICATED'); const actor = await backend.verify(token); if (!actor) throw new APIError(401, 'UNAUTHENTICATED');
      if (!await backend.slot(actor)) throw new APIError(429, 'RATE_LIMITED');
      const data = await body(req);
      if (data.action === 'context') return response(req, origins, { ok: true, memberships: await backend.memberships(actor) }, 200, requestId);
      if (data.action === 'load') { if (!validId(data.siteId)) throw new APIError(400, 'INVALID_REQUEST'); const draft = await backend.draft(actor, data.siteId); if (!draft) throw new APIError(403, 'FORBIDDEN'); return response(req, origins, { ok: true, draft }, 200, requestId); }
      if (data.action === 'save') {
        if (!uuid(data.draftId) || !Number.isSafeInteger(data.expectedRevision) || Number(data.expectedRevision) < 1 || !validId(data.mutationId)) throw new APIError(400, 'INVALID_REQUEST');
        const check = validateDocument(data.document); if (!check.ok) return response(req, origins, { ok: false, code: 'INVALID_DOCUMENT', issues: check.issues }, 400, requestId);
        const result = await backend.save(actor, data.draftId, Number(data.expectedRevision), data.mutationId, data.document as Document);
        return response(req, origins, result, result.ok ? 200 : result.code === 'FORBIDDEN' ? 403 : result.code === 'INVALID_DOCUMENT' || result.code === 'INVALID_REQUEST' ? 400 : 409, requestId);
      }
      if (data.action === 'initialize') {
        if (!validId(data.siteId)) throw new APIError(400, 'INVALID_REQUEST');
        // Owner scope is checked before reading this dedicated project's legacy row.
        const memberships = await backend.memberships(actor); if (!memberships.some(m => m.site_id === data.siteId && m.role === 'owner')) throw new APIError(403, 'FORBIDDEN');
        const original = await backend.legacy(data.siteId);
        const migrated = original === null ? { ok: true, document: emptyDocument(data.siteId), original: null, errors: [] } : migrateV1(original, data.siteId);
        if (!migrated.ok || !migrated.document) return response(req, origins, { ok: false, code: 'MIGRATION_REQUIRED', errors: migrated.errors }, 400, requestId);
        const check = validateDocument(migrated.document); if (!check.ok) throw new APIError(400, 'INVALID_DOCUMENT');
        const result = await backend.initialize(actor, data.siteId, migrated.document, migrated.original);
        return response(req, origins, result, result.ok ? 200 : result.code === 'FORBIDDEN' ? 403 : 409, requestId);
      }
      throw new APIError(400, 'INVALID_ACTION');
    } catch (error) { const known = error instanceof APIError; return response(req, origins, { ok: false, code: known ? error.code : 'INTERNAL_ERROR', requestId }, known ? error.status : 500, requestId); }
  };
}
export function createContentHandler(backend: Backend, origins: readonly string[]) {
  return async (req: Request): Promise<Response> => {
    try { const origin = req.headers.get('origin'); if (origin && !origins.includes(origin)) throw new APIError(403, 'ORIGIN_DENIED'); if (req.method === 'OPTIONS') return response(req, origins, { ok: true }); if (req.method !== 'GET') throw new APIError(405, 'METHOD_NOT_ALLOWED'); const site = new URL(req.url).searchParams.get('siteId'); if (!validId(site)) throw new APIError(400, 'INVALID_REQUEST'); const release = await backend.release(site); if (!release) throw new APIError(404, 'NOT_FOUND'); return response(req, origins, { ok: true, release }); }
    catch (error) { return response(req, origins, { ok: false, code: error instanceof APIError ? error.code : 'INTERNAL_ERROR' }, error instanceof APIError ? error.status : 500); }
  };
}

export class RESTBackend implements Backend {
  url: string; service: string; publishable: string; legacySite: string;
  constructor(url: string, service: string, publishable: string, legacySite: string) { this.url = url; this.service = service; this.publishable = publishable; this.legacySite = legacySite; }
  async read(path: string, options: RequestInit = {}): Promise<unknown> { const r = await fetch(this.url + '/rest/v1/' + path, { ...options, headers: { apikey: this.service, Authorization: 'Bearer ' + this.service, 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(10000) }); if (!r.ok) throw new APIError(503, 'BACKEND_UNAVAILABLE'); return r.json(); }
  async rows(path: string): Promise<Row[]> { const data = await this.read(path); if (!Array.isArray(data)) throw new APIError(503, 'BACKEND_UNAVAILABLE'); return data; }
  async rpc(name: string, args: Row): Promise<Row> { return await this.read('rpc/' + name, { method: 'POST', body: JSON.stringify(args) }) as Row; }
  async verify(token: string): Promise<string | null> {
    const r = await fetch(this.url + '/auth/v1/user', { headers: { apikey: this.publishable, Authorization: 'Bearer ' + token }, signal: AbortSignal.timeout(10000) });
    if (r.status === 401 || r.status === 403) return null; if (!r.ok) throw new APIError(503, 'AUTH_UNAVAILABLE'); const user = await r.json();
    if (!uuid(user.id) || user.is_anonymous) return null;
    // Claims are used only after Auth has verified the token. They never supply roles.
    let session: unknown; try { const payload = token.split('.')[1]; session = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))).session_id; } catch { return null; }
    if (!uuid(session)) return null;
    const active = await this.read('rpc/cms_session_active', { method: 'POST', body: JSON.stringify({ p_actor: user.id, p_session: session }) });
    return active === true ? user.id : null;
  }
  async slot(actor: string): Promise<boolean> { return await this.read('rpc/cms_take_request_slot', { method: 'POST', body: JSON.stringify({ p_actor: actor }) }) === true; }
  async memberships(actor: string): Promise<Row[]> { return this.rows('cms_members?user_id=eq.' + encodeURIComponent(actor) + '&select=site_id,role'); }
  async draft(actor: string, site: string): Promise<Row | null> { const membership = await this.rows('cms_members?site_id=eq.' + encodeURIComponent(site) + '&user_id=eq.' + encodeURIComponent(actor) + '&select=role'); if (!membership.length) return null; return (await this.rows('cms_drafts?site_id=eq.' + encodeURIComponent(site) + '&select=id,site_id,document,revision,base_release_id,updated_at'))[0] ?? { site_id: site, uninitialized: true }; }
  save(actor: string, draft: string, expected: number, mutation: string, document: Document): Promise<Row> { return this.rpc('cms_save_draft', { p_actor: actor, p_draft: draft, p_expected: expected, p_mutation: mutation, p_document: document, p_refs: assetReferences(document) }); }
  initialize(actor: string, site: string, document: Document, original: unknown): Promise<Row> { return this.rpc('cms_initialize_site', { p_actor: actor, p_site: site, p_document: document, p_original: original, p_refs: assetReferences(document) }); }
  async legacy(site: string): Promise<unknown> { if (site !== this.legacySite) return null; const rows = await this.rows('site_state?id=eq.live&select=data'); return rows[0]?.data ?? null; }
  async release(site: string): Promise<Row | null> { const sites = await this.rows('cms_sites?id=eq.' + encodeURIComponent(site) + '&access_mode=eq.public&select=active_release_id,publication_sequence'); if (!sites[0]?.active_release_id) return null; const rows = await this.rows('cms_releases?site_id=eq.' + encodeURIComponent(site) + '&id=eq.' + encodeURIComponent(String(sites[0].active_release_id)) + '&select=id,document,created_at'); if (!rows[0]) return null; const check = validateDocument(rows[0].document); if (!check.ok) throw new APIError(503, 'INVALID_RELEASE'); return { ...rows[0], publicationSequence: sites[0].publication_sequence }; }
}
