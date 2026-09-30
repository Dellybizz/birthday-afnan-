import { registry, supportedStyleFields } from '../registry/index.ts';
import { siteFields } from '../registry/site.ts';
import type { Document, Field, Issue, Validation } from '../schemas/types.ts';

export const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
export const validId = (v: unknown): v is string => typeof v === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(v);
export const validColor = (v: unknown) => typeof v === 'string' && /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(v);
export function safeURL(v: unknown): boolean { if (typeof v !== 'string' || v.length > 2048) return false; try { const u = new URL(v); return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password; } catch { return false; } }
export function validDate(v: unknown): boolean { if (typeof v !== 'string') return false; if (v === '') return true; if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false; const d = new Date(v + 'T00:00:00Z'); return Number.isFinite(+d) && d.toISOString().slice(0, 10) === v; }
export function validBindings(text: string): boolean { const stripped = text.replace(/\{\{general\.(name|nickname|birthdayDate)\}\}/g, ''); return !stripped.includes('{{') && !stripped.includes('}}'); }
function keys(v: Record<string, unknown>, allowed: string[]) { return Object.keys(v).every(k => allowed.includes(k)); }
export function validAction(v: unknown): boolean {
  if (!record(v)) return false;
  switch (v.kind) {
    case 'none': return keys(v, ['kind']);
    case 'page': return keys(v, ['kind', 'pageId']) && validId(v.pageId);
    case 'anchor': return keys(v, ['kind', 'nodeId']) && validId(v.nodeId);
    case 'play': return keys(v, ['kind', 'assetId']) && validId(v.assetId);
    case 'external': return keys(v, ['kind', 'url']) && safeURL(v.url);
    default: return false;
  }
}
export function validRichText(v: unknown): boolean {
  return Array.isArray(v) && v.length <= 100 && v.every(p => record(p) && keys(p, ['type', 'children']) && p.type === 'paragraph' && Array.isArray(p.children) && p.children.length <= 100 && p.children.every(c => record(c) && keys(c, ['type', 'text', 'marks', 'href']) && c.type === 'text' && typeof c.text === 'string' && c.text.length <= 10000 && validBindings(c.text) && (c.href === undefined || safeURL(c.href)) && (c.marks === undefined || Array.isArray(c.marks) && c.marks.length <= 2 && new Set(c.marks).size === c.marks.length && c.marks.every(m => m === 'bold' || m === 'italic'))));
}
export function fieldValid(f: Field, v: unknown): boolean {
  switch (f.type) {
    case 'text': return typeof v === 'string' && v.length <= (f.maxLength ?? 10000) && validBindings(v);
    case 'color': return validColor(v);
    case 'number': return typeof v === 'number' && Number.isFinite(v) && v >= (f.min ?? -Infinity) && v <= (f.max ?? Infinity);
    case 'boolean': return typeof v === 'boolean';
    case 'select': return f.options?.includes(v as string | number) ?? false;
    case 'asset': return v === null || validId(v);
    case 'action': return validAction(v);
    case 'richText': return validRichText(v);
  }
}
export function validateDocument(input: unknown): Validation {
  const issues: Issue[] = []; const add = (path: string, message: string, code = 'INVALID_FIELD') => { if (issues.length < 100) issues.push({ path, message, code }); };
  // Check JSON compatibility, depth and shared references before serialisation or recursive traversal.
  const seen = new WeakSet<object>(); let visits = 0;
  function json(v: unknown, path: string, depth: number): boolean {
    if (++visits > 50000 || depth > 30) { add(path, 'JSON complexity limit exceeded', 'LIMIT'); return false; }
    if (v === null || typeof v === 'string' || typeof v === 'boolean' || typeof v === 'number' && Number.isFinite(v)) return true;
    if (typeof v !== 'object' || !v) { add(path, 'Only finite JSON values are allowed'); return false; }
    if (seen.has(v)) { add(path, 'Cycle or repeated object reference', 'CYCLE'); return false; } seen.add(v);
    if (!Array.isArray(v) && Object.getPrototypeOf(v) !== Object.prototype && Object.getPrototypeOf(v) !== null) { add(path, 'Plain JSON object required'); return false; }
    for (const [k, child] of Object.entries(v)) { if (['__proto__', 'constructor', 'prototype'].includes(k)) { add(path, 'Unsafe property'); return false; } if (!json(child, path + '.' + k, depth + 1)) return false; }
    return true;
  }
  if (!json(input, '$', 0)) return { ok: false, issues };
  if (new TextEncoder().encode(JSON.stringify(input)).byteLength > 1048576) return { ok: false, issues: [{ path: '$', code: 'LIMIT', message: 'Document exceeds 1 MiB' }] };
  if (!record(input)) return { ok: false, issues: [{ path: '$', code: 'INVALID_DOCUMENT', message: 'Object required' }] };
  if (!keys(input, ['schemaVersion', 'registryVersion', 'siteId', 'general', 'pages', 'menus'])) add('$', 'Unknown document fields');
  if (input.schemaVersion !== 2 || input.registryVersion !== 1) add('$', 'Unsupported schema/registry version', 'VERSION');
  if (!validId(input.siteId)) add('siteId', 'Invalid site ID');
  const g = input.general;
  if (!record(g)) add('general', 'Object required'); else {
    for (const f of siteFields) { let value: unknown = g; for (const part of f.id.split('.')) value = record(value) ? value[part] : undefined; if (!fieldValid(f, value)) add('general.' + f.id, 'Invalid ' + f.label); }
    if (!keys(g, ['name', 'nickname', 'birthdayDate', 'timezone', 'locale', 'appearance', 'music', 'animation'])) add('general', 'Unknown general fields');
    for (const key of ['name', 'nickname']) if (typeof g[key] !== 'string' || (g[key] as string).length > 200 || /\{\{|\}\}/.test(g[key] as string)) add('general.' + key, 'Plain text up to 200 characters required');
    if (!validDate(g.birthdayDate)) add('general.birthdayDate', 'Valid calendar date or empty string required');
    try { if (typeof g.timezone !== 'string' || g.timezone.length > 100) throw Error(); new Intl.DateTimeFormat('en', { timeZone: g.timezone }); } catch { add('general.timezone', 'Invalid timezone'); }
    try { if (typeof g.locale !== 'string' || !g.locale || g.locale.length > 35) throw Error(); new Intl.DateTimeFormat(g.locale); } catch { add('general.locale', 'Invalid locale'); }
    const a = g.appearance;
    if (!record(a) || !keys(a, ['accent', 'background', 'text', 'font', 'radius', 'spacing']) || !validColor(a.accent) || !validColor(a.background) || !validColor(a.text) || !['system', 'serif'].includes(a.font as string) || typeof a.radius !== 'number' || a.radius < 0 || a.radius > 80 || typeof a.spacing !== 'number' || a.spacing < 0 || a.spacing > 160) add('general.appearance', 'Invalid theme settings');
    const m = g.music;
    if (!record(m) || !keys(m, ['enabled', 'assetIds', 'volume', 'loop']) || typeof m.enabled !== 'boolean' || typeof m.loop !== 'boolean' || typeof m.volume !== 'number' || m.volume < 0 || m.volume > 1 || !Array.isArray(m.assetIds) || m.assetIds.length > 100 || !m.assetIds.every(validId) || new Set(m.assetIds).size !== m.assetIds.length) add('general.music', 'Invalid music settings');
    const an = g.animation;
    if (!record(an) || !keys(an, ['preset', 'duration', 'reducedMotion']) || !['none', 'fade', 'slide'].includes(an.preset as string) || typeof an.duration !== 'number' || an.duration < 0 || an.duration > 2000 || typeof an.reducedMotion !== 'boolean') add('general.animation', 'Invalid animation settings');
  }
  const ids = new Map<string, string>(), pageIds = new Set<string>(), routes = new Set<string>(); let count = 0;
  const actions: { value: Record<string, unknown>; path: string }[] = [];
  function nodes(items: unknown, path: string, allowed: readonly string[], depth: number, navigation: boolean) {
    if (!Array.isArray(items)) { add(path, 'Array required'); return; }
    if (depth > (navigation ? 4 : 5)) { add(path, 'Hierarchy depth exceeded', 'DEPTH'); return; }
    for (let i = 0; i < items.length; i++) {
      const n = items[i], at = path + '[' + i + ']'; if (++count > 2000) { add(at, 'Too many nodes', 'LIMIT'); return; }
      if (!record(n)) { add(at, 'Node object required'); continue; }
      if (!keys(n, ['id', 'kind', 'type', 'title', 'enabled', 'settings', 'style', 'children'])) add(at, 'Unknown node fields');
      if (!validId(n.id)) add(at + '.id', 'Invalid ID'); else { if (ids.has(n.id)) add(at + '.id', 'Duplicate ID', 'DUPLICATE_ID'); ids.set(n.id, at); }
      if (typeof n.title !== 'string' || n.title.length > 500 || typeof n.enabled !== 'boolean') add(at, 'Invalid title/enabled');
      const d = typeof n.type === 'string' ? registry[n.type] : undefined;
      if (!d) { add(at + '.type', 'Unregistered component', 'UNKNOWN_TYPE'); continue; }
      if (n.kind !== d.kind || !allowed.includes(d.kind)) add(at + '.kind', 'Wrong kind or parent', 'INVALID_PARENT');
      if (!record(n.settings)) add(at + '.settings', 'Object required'); else {
        if (!keys(n.settings, d.fields.map(f => f.id))) add(at + '.settings', 'Unknown settings');
        for (const f of d.fields) { const value = n.settings[f.id]; if (!fieldValid(f, value)) add(at + '.settings.' + f.id, 'Invalid ' + f.label); else if (f.type === 'action' && record(value)) actions.push({ value, path: at + '.settings.' + f.id }); }
        if (d.kind === 'page') { if (validId(n.id)) pageIds.add(n.id); const slug = n.settings.slug; if (typeof slug !== 'string' || !/^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\/?)*$/.test(slug) || slug.length > 200 || slug !== '/' && slug.endsWith('/')) add(at + '.settings.slug', 'Canonical lowercase route required'); else { if (routes.has(slug)) add(at + '.settings.slug', 'Duplicate route', 'DUPLICATE_ROUTE'); routes.add(slug); } }
      }
      if (n.style !== undefined) {
        if (!record(n.style) || !keys(n.style, ['base', 'tablet', 'desktop'])) add(at + '.style', 'Invalid breakpoint map'); else for (const [bp, values] of Object.entries(n.style)) {
          if (!record(values)) { add(at + '.style.' + bp, 'Style object required'); continue; }
          const fields = supportedStyleFields(d.type);
          for (const [key, value] of Object.entries(values)) { const f = fields.find(x => x.id === key); if (!f || !fieldValid(f, value) || ['width', 'maxWidth'].includes(key) && (typeof value !== 'string' || !/^(auto|(?:\d+(?:\.\d+)?)(?:px|%|rem))$/.test(value)) || key === 'columns' && !Number.isInteger(value)) add(at + '.style.' + bp + '.' + key, 'Invalid/unsupported style'); }
        }
      }
      if (n.children !== undefined) { if (!Array.isArray(n.children) || n.children.length > d.maxChildren) add(at + '.children', 'Invalid child count'); else if (n.children.length) nodes(n.children, at + '.children', d.allowedChildren, depth + 1, navigation); }
    }
  }
  nodes(input.pages, 'pages', ['page'], 1, false); nodes(input.menus, 'menus', ['menu'], 1, true);
  for (const { value, path } of actions) { if (value.kind === 'page' && !pageIds.has(value.pageId as string) || value.kind === 'anchor' && !ids.has(value.nodeId as string)) add(path, 'Target does not exist', 'MISSING_REFERENCE'); }
  return { ok: issues.length === 0, issues };
}
export function assertDocument(input: unknown): asserts input is Document { const result = validateDocument(input); if (!result.ok) throw new Error(JSON.stringify(result.issues)); }
