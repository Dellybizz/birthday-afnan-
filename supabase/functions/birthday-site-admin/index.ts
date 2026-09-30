const ALLOWED_ORIGINS = new Set((Deno.env.get('ALLOWED_ORIGINS') || 'http://localhost:3000,http://127.0.0.1:3000').split(',').map(s => s.trim()).filter(Boolean));

function corsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = !origin || ALLOWED_ORIGINS.has(origin) ? origin : '';
  return {
    ...(allowedOrigin ? { 'Access-Control-Allow-Origin': allowedOrigin } : {}),
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'content-type,x-admin-key,authorization,apikey',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
  };
}

function originAllowed(req: Request) {
  const origin = req.headers.get('origin') || '';
  return !origin || ALLOWED_ORIGINS.has(origin);
}

function env() {
  return {
    url: Deno.env.get('SUPABASE_URL')!,
    service: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  };
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function clientFingerprint(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('cf-connecting-ip')
    || req.headers.get('x-real-ip')
    || 'unknown';
  return await sha256Hex(forwarded);
}

async function authorize(req: Request) {
  const key = req.headers.get('x-admin-key') || '';
  if (!key) return { allowed: false, rate_limited: false };
  const { url, service } = env();
  const r = await fetch(`${url}/rest/v1/rpc/birthday_admin_authorize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${service}`,
      apikey: service,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      p_key: key,
      p_fingerprint: await clientFingerprint(req),
    }),
  });
  const result = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(result?.message || result?.error || `Admin authorization failed: ${r.status}`);
  return result || { allowed: false, rate_limited: false };
}

function json(req: Request, body: unknown, status = 200, extra: Record<string,string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(req),
      ...extra,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

function isRecord(value: unknown): value is Record<string, any> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function str(value: unknown, max: number) {
  return typeof value === 'string' && value.length <= max;
}

function validateStringMap(value: unknown, maxValue = 100000) {
  if (!isRecord(value)) return false;
  return Object.entries(value).every(([k,v]) => k.length <= 160 && str(v,maxValue));
}

function validateState(data: unknown): string[] {
  if (!isRecord(data)) return ['State must be an object.'];
  if (new TextEncoder().encode(JSON.stringify(data)).byteLength > 1024 * 1024) return ['State exceeds 1 MB.'];
  const errors: string[] = [];
  if (data.schemaVersion !== 1) errors.push('Unsupported schemaVersion.');
  if (!isRecord(data.general)) errors.push('general must be an object.');
  const ids = new Set<string>(); let count = 0;
  function nodes(items: any, at: string, depth: number) {
    if (!Array.isArray(items) || depth > 5) { errors.push(`${at}: invalid hierarchy`); return; }
    for (const item of items) {
      if (++count > 2000) { errors.push('Too many nodes.'); return; }
      if (!isRecord(item) || !str(item.id,128) || !item.id || ids.has(item.id)) { errors.push(`${at}: invalid or duplicate id`); continue; }
      ids.add(item.id);
      if (!str(item.type,128) || !str(item.title,500) || typeof item.enabled !== 'boolean' || !isRecord(item.settings)) errors.push(`${at}: invalid node fields`);
      if (item.children !== undefined) nodes(item.children,at+'.'+item.id,depth+1);
    }
  }
  nodes(data.pages,'pages',1); nodes(data.menus,'menus',1);
  return errors.slice(0,50);
}

Deno.serve(async (req: Request) => {
  if (!originAllowed(req)) return json(req, { error: 'Origin not allowed' }, 403);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) });
  if (req.method !== 'POST') return json(req, { error: 'Method not allowed' }, 405);

  try {
    const key = req.headers.get('x-admin-key') || '';
    const auth = await authorize(req);
    if (auth?.rate_limited) {
      const retry = Math.max(1, Number(auth.retry_after || 900));
      return json(req, { error: 'Too many failed admin-key attempts. Try again later.', code: 'RATE_LIMITED', retryAfter: retry }, 429, { 'Retry-After': String(retry) });
    }
    if (!auth?.allowed) return json(req, { error: 'Unauthorized' }, 401);

    const body = await req.json().catch(() => ({}));

    if (body?.action === 'ping') return json(req, { ok: true });

    if (body?.action === 'change_key') {
      const newKey = typeof body?.newKey === 'string' ? body.newKey : '';
      if (newKey.length < 8 || newKey.length > 128) return json(req, { error: 'New admin key must be 8–128 characters.' }, 400);
      if (newKey === key) return json(req, { error: 'Choose a different admin key.' }, 400);

      const { url, service } = env();
      const r = await fetch(`${url}/rest/v1/rpc/birthday_admin_change_key`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${service}`,
          apikey: service,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ p_new_key: newKey }),
      });
      const result = await r.json().catch(() => ({}));
      if (!r.ok || !result?.ok) throw new Error(result?.message || result?.error || `Admin key update failed: ${r.status}`);
      return json(req, { ok: true, changed: true, hashScheme: result.hash_scheme || 'bcrypt-sha256' });
    }

    if (body?.action !== 'publish' || !body?.data || typeof body.data !== 'object') return json(req, { error: 'Invalid payload' }, 400);

    const expectedRevision = Number(body?.expectedRevision);
    if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 1) {
      return json(req, { error: 'A valid state revision is required.', code: 'MISSING_REVISION' }, 409);
    }

    const validationErrors = validateState(body.data);
    if (validationErrors.length) {
      return json(req, { error: 'State validation failed.', code: 'INVALID_STATE', details: validationErrors }, 400);
    }

    const { url, service } = env();
    const rpc = await fetch(`${url}/rest/v1/rpc/publish_site_state`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${service}`,
        apikey: service,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_expected_revision: expectedRevision, p_data: body.data }),
    });
    const result = await rpc.json().catch(() => ({}));
    if (!rpc.ok) throw new Error(result?.message || result?.error || `State publish failed: ${rpc.status}`);

    if (result?.conflict || result?.error === 'STALE_STATE') {
      return json(req, {
        error: 'This Control Room tab is out of date.',
        code: 'STALE_STATE',
        currentRevision: result?.current_revision ?? null,
        updatedAt: result?.updated_at ?? null,
      }, 409);
    }
    if (!result?.ok) return json(req, { error: result?.error || 'State publish failed.', code: result?.error || 'PUBLISH_FAILED' }, 400);

    return json(req, { ok: true, revision: result.revision, updatedAt: result.updated_at });
  } catch (err) {
    return json(req, { error: String((err as Error)?.message || err) }, 500);
  }
});