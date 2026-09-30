import type { Document, Node, Style } from '../schemas/types.ts';
import { assertDocument } from '../validators/index.ts';
import { registry } from '../registry/index.ts';

export interface Location { node: Node; siblings: Node[]; index: number; parent: Node | null }
export function walk(document: Document, visit: (location: Location) => void): void {
  const scan = (items: Node[], parent: Node | null) => { items.forEach((node, index) => { visit({ node, siblings: items, index, parent }); if (node.children) scan(node.children, node); }); };
  scan(document.pages, null); scan(document.menus, null);
}
export function find(document: Document, id: string): Location | undefined { let match: Location | undefined; walk(document, l => { if (l.node.id === id) match = l; }); return match; }
export function resolveStyle(node: Node, breakpoint: 'base' | 'tablet' | 'desktop'): Style { return { ...node.style?.base, ...(breakpoint !== 'base' ? node.style?.tablet : {}), ...(breakpoint === 'desktop' ? node.style?.desktop : {}) }; }
export function resetOverride(node: Node, breakpoint: 'tablet' | 'desktop', field: string): Node { const copy = structuredClone(node); if (copy.style?.[breakpoint]) delete copy.style[breakpoint]![field]; return copy; }
export function bindText(text: string, document: Document): string { return text.replace(/\{\{general\.(name|nickname|birthdayDate)\}\}/g, (_, key: 'name' | 'nickname' | 'birthdayDate') => document.general[key]); }

type Destination = { root: 'pages' | 'menus'; parentId?: never } | { parentId: string; root?: never };
function list(doc: Document, target: Destination): Node[] { if (target.root) return doc[target.root]; const parent = find(doc, target.parentId)?.node; if (!parent) throw Error('Parent missing'); parent.children ??= []; return parent.children; }
function indexCheck(index: number, length: number) { if (!Number.isInteger(index) || index < 0 || index > length) throw Error('Invalid index'); }
function edit(document: Document, mutation: (draft: Document) => void): Document { assertDocument(document); const draft = structuredClone(document); mutation(draft); assertDocument(draft); return draft; }
export function insert(document: Document, node: Node, destination: Destination, index: number): Document { return edit(document, d => { const target = list(d, destination); indexCheck(index, target.length); target.splice(index, 0, structuredClone(node)); }); }
export function remove(document: Document, id: string): Document { return edit(document, d => { const at = find(d, id); if (!at) throw Error('Node missing'); at.siblings.splice(at.index, 1); }); }
export function move(document: Document, id: string, destination: Destination, index: number): Document {
  return edit(document, d => { const at = find(d, id); if (!at) throw Error('Node missing');
    if (destination.parentId) { let descendant = false; const scan = (n: Node) => { if (n.id === destination.parentId) descendant = true; n.children?.forEach(scan); }; scan(at.node); if (descendant) throw Error('Cannot move into own subtree'); }
    const target = list(d, destination); at.siblings.splice(at.index, 1); indexCheck(index, target.length); target.splice(index, 0, at.node);
  });
}
export function reorder(document: Document, id: string, finalIndex: number): Document { const at = find(document, id); if (!at) throw Error('Node missing'); return move(document, id, at.parent ? { parentId: at.parent.id } : { root: at.node.kind === 'page' ? 'pages' : 'menus' }, finalIndex); }
export function duplicate(document: Document, id: string, nextId: () => string = () => crypto.randomUUID()): Document {
  return edit(document, d => { const at = find(d, id); if (!at) throw Error('Node missing'); const clone = structuredClone(at.node), remap = new Map<string, string>();
    const assign = (n: Node) => { const old = n.id; n.id = nextId(); remap.set(old, n.id); n.children?.forEach(assign); }; assign(clone);
    const refs = (n: Node) => { for (const v of Object.values(n.settings)) if (v && typeof v === 'object' && !Array.isArray(v)) { const a = v as Record<string, unknown>; if (a.kind === 'page' && typeof a.pageId === 'string' && remap.has(a.pageId)) a.pageId = remap.get(a.pageId); if (a.kind === 'anchor' && typeof a.nodeId === 'string' && remap.has(a.nodeId)) a.nodeId = remap.get(a.nodeId); } n.children?.forEach(refs); }; refs(clone);
    if (clone.kind === 'page') { const routes = new Set(d.pages.map(n => n.settings.slug)); const base = clone.settings.slug === '/' ? '/home' : String(clone.settings.slug); let slug = base + '-copy', i = 2; while (routes.has(slug)) slug = base + '-copy-' + i++; clone.settings.slug = slug; }
    clone.title += ' copy'; at.siblings.splice(at.index + 1, 0, clone);
  });
}
export interface AssetReference { assetId: string; nodeId: string | null; field: string }
export function assetReferences(document: Document): AssetReference[] { const out: AssetReference[] = document.general.music.assetIds.map(assetId => ({ assetId, nodeId: null, field: 'general.music.assetIds' })); walk(document, ({ node }) => { for (const f of registry[node.type].fields) { const value = node.settings[f.id]; if (f.type === 'asset' && typeof value === 'string') out.push({ assetId: value, nodeId: node.id, field: f.id }); else if (f.type === 'action' && value && typeof value === 'object' && !Array.isArray(value)) { const a = value as Record<string, unknown>; if (a.kind === 'play' && typeof a.assetId === 'string') out.push({ assetId: a.assetId, nodeId: node.id, field: f.id }); } } }); return out; }
