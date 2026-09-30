import { emptyDocument } from '../schemas/defaults.ts';
import { createNode, registry } from '../registry/index.ts';
import { record, validateDocument, validDate } from '../validators/index.ts';
import type { Document, Node } from '../schemas/types.ts';

export interface MigrationResult { ok: boolean; document?: Document; original: unknown; errors: string[] }
// Never mutates the source; unsupported data returns errors and a complete retained original.
export function migrateV1(source: unknown, siteId = 'site_afnan'): MigrationResult {
  let original: unknown; try { original = structuredClone(source); } catch { return { ok: false, original: source, errors: ['Source cannot be cloned'] }; }
  const errors: string[] = [], doc = emptyDocument(siteId); const fail = (path: string) => errors.push('Unsupported or invalid legacy value: ' + path);
  if (!record(source) || source.schemaVersion !== 1 || !record(source.general) || !Array.isArray(source.pages) || !Array.isArray(source.menus)) return { ok: false, original, errors: ['Expected schema-v1 starter document'] };
  for (const key of Object.keys(source)) if (!['schemaVersion', 'general', 'pages', 'menus'].includes(key) && !(key === 'patches' && record(source[key]) && Object.keys(source[key]).length === 0)) fail(key);
  const g = source.general;
  for (const key of Object.keys(g)) if (!['name', 'nickname', 'birthdayISO', 'music', 'appearance'].includes(key)) fail('general.' + key);
  for (const key of ['name', 'nickname'] as const) { if (typeof g[key] === 'string') doc.general[key] = g[key]; else fail('general.' + key); }
  if (validDate(g.birthdayISO)) doc.general.birthdayDate = g.birthdayISO as string; else fail('general.birthdayISO (ambiguous timestamps require an explicit timezone decision)');
  for (const key of ['music', 'appearance'] as const) { if (!record(g[key])) fail('general.' + key); else for (const [name, value] of Object.entries(g[key])) { if (Object.hasOwn(doc.general[key], name)) (doc.general[key] as unknown as Record<string, unknown>)[name] = structuredClone(value); else fail('general.' + key + '.' + name); } }
  const seen = new WeakSet<object>(); let count = 0;
  function convert(raw: unknown, path: string, depth: number): Node | null {
    if (++count > 2000 || depth > 5 || !record(raw) || seen.has(raw)) { fail(path); return null; } seen.add(raw);
    const type = raw.type === 'page' ? 'page.standard' : raw.type;
    if (typeof type !== 'string' || !Object.hasOwn(registry, type)) { fail(path + '.type'); return null; }
    if (typeof raw.id !== 'string' || typeof raw.title !== 'string' || typeof raw.enabled !== 'boolean' || !record(raw.settings)) { fail(path); return null; }
    for (const key of Object.keys(raw)) if (!['id', 'type', 'title', 'enabled', 'settings', 'children'].includes(key)) fail(path + '.' + key);
    const node = createNode(type, raw.id, raw.title); node.enabled = raw.enabled;
    if (type === 'page.standard' && !Object.hasOwn(raw.settings, 'slug')) node.settings.slug = '/page-' + raw.id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    for (const [key, value] of Object.entries(raw.settings)) { if (Object.hasOwn(node.settings, key)) node.settings[key] = structuredClone(value); else fail(path + '.settings.' + key); }
    if (raw.children !== undefined) { if (!Array.isArray(raw.children)) fail(path + '.children'); else node.children = raw.children.map((n, i) => convert(n, path + '.children[' + i + ']', depth + 1)).filter((n): n is Node => n !== null); }
    return node;
  }
  doc.pages = source.pages.map((n, i) => convert(n, 'pages[' + i + ']', 1)).filter((n): n is Node => n !== null);
  doc.menus = source.menus.map((n, i) => convert(n, 'menus[' + i + ']', 1)).filter((n): n is Node => n !== null);
  errors.push(...validateDocument(doc).issues.map(i => i.path + ': ' + i.message));
  return errors.length ? { ok: false, original, errors } : { ok: true, document: doc, original, errors: [] };
}
