import type { Document } from './types.ts';
import { createNode } from '../registry/index.ts';
import { siteFields, playlistControl } from '../registry/site.ts';
export function emptyDocument(siteId = 'site_afnan'): Document {
  const general: Record<string, unknown> = {};
  for (const f of [...siteFields, playlistControl]) { const parts = f.id.split('.'); let target = general; for (const p of parts.slice(0, -1)) { target[p] ??= {}; target = target[p] as Record<string, unknown>; } target[parts.at(-1)!] = structuredClone(f.default); }
  return { schemaVersion: 2, registryVersion: 1, siteId, general: general as unknown as Document['general'], pages: [], menus: [] };
}
export function sampleDocument(): Document {
  const doc = emptyDocument(), page = createNode('page.standard', 'page_home', 'Home'), section = createNode('section.greeting', 'greeting'), heading = createNode('text.heading', 'heading'), paragraph = createNode('text.paragraph', 'paragraph'), card = createNode('block.card', 'card'), image = createNode('media.image', 'image'), video = createNode('media.video', 'video'), button = createNode('action.button', 'button');
  heading.settings.text = 'Happy birthday, {{general.name}}'; heading.settings.level = 1;
  paragraph.settings.content = [{ type: 'paragraph', children: [{ type: 'text', text: 'A little birthday space made just for you.' }] }];
  image.settings.alt = 'Choose a birthday photograph'; image.settings.assetId = 'sample_image'; video.settings.assetId = 'sample_video';
  button.settings.action = { kind: 'anchor', nodeId: 'heading' }; card.children = [image]; section.children = [heading, paragraph, card, video, button]; page.children = [section]; doc.pages = [page];
  const menu = createNode('navigation.menu', 'menu_main'), item = createNode('navigation.item', 'item_home'); item.settings.label = 'Home'; item.settings.target = { kind: 'page', pageId: page.id }; menu.children = [item]; doc.menus = [menu]; return doc;
}
