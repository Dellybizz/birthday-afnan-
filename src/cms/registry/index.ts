import type { Definition, Field, Kind, Node } from '../schemas/types.ts';

const field = (id: string, label: string, type: Field['type'], group: Field['group'], value: unknown, extra: Partial<Field> = {}): Field => ({ id, label, type, group, default: value, ...extra });
const text = (id: string, label: string, value = '') => field(id, label, 'text', 'content', value, { maxLength: 10000 });
const select = (id: string, label: string, options: readonly (string | number)[], value: string | number, group: Field['group'] = 'layout') => field(id, label, 'select', group, value, { options });
const asset = (id = 'assetId', label = 'Media') => field(id, label, 'asset', 'media', null);
const def = (type: string, kind: Kind, label: string, fields: Field[], children: Kind[] = [], maxChildren = 100): Definition => ({ type, kind, label, version: 1, fields, allowedChildren: children, maxChildren });

export const registry: Readonly<Record<string, Definition>> = Object.freeze(Object.assign(Object.create(null), Object.fromEntries([
  def('page.standard', 'page', 'Standard page', [text('slug', 'URL path', '/'), text('metaTitle', 'Page title'), text('description', 'Description'), select('shell', 'Page shell', ['default', 'fullscreen'], 'default')], ['section']),
  def('section.greeting', 'section', 'Greeting', [select('alignment', 'Alignment', ['left', 'center', 'right'], 'center')], ['block', 'element']),
  def('section.text', 'section', 'Text section', [], ['block', 'element']),
  def('section.container', 'section', 'Container section', [select('layout', 'Layout', ['stack', 'row', 'grid'], 'stack')], ['block', 'element']),
  def('block.container', 'block', 'Container', [select('layout', 'Layout', ['stack', 'row', 'grid'], 'stack')], ['block', 'element']),
  def('block.card', 'block', 'Card', [], ['element']),
  def('text.heading', 'element', 'Heading', [text('text', 'Text', 'Heading'), select('level', 'Heading level', [1, 2, 3, 4, 5, 6], 2, 'accessibility')], [], 0),
  def('text.paragraph', 'element', 'Paragraph', [field('content', 'Rich text', 'richText', 'content', [{ type: 'paragraph', children: [{ type: 'text', text: '' }] }])], [], 0),
  def('media.image', 'element', 'Image', [asset(), text('alt', 'Alternative text'), text('caption', 'Caption'), field('decorative', 'Decorative image', 'boolean', 'accessibility', false), select('ratio', 'Aspect ratio', ['natural', '1:1', '4:3', '3:2', '16:9', '9:16'], 'natural'), select('fit', 'Fit', ['cover', 'contain'], 'cover'), field('focalX', 'Focal X', 'number', 'layout', 50, { min: 0, max: 100, unit: '%' }), field('focalY', 'Focal Y', 'number', 'layout', 50, { min: 0, max: 100, unit: '%' }), asset('mobileAssetId', 'Mobile media')], [], 0),
  def('media.video', 'element', 'Video', [asset(), asset('posterAssetId', 'Poster'), asset('captionsAssetId', 'Captions'), field('controls', 'Player controls', 'boolean', 'behaviour', true), field('muted', 'Muted', 'boolean', 'behaviour', true), field('loop', 'Loop', 'boolean', 'behaviour', false), field('autoplay', 'Request autoplay', 'boolean', 'behaviour', false), select('preload', 'Preload', ['none', 'metadata'], 'metadata', 'behaviour'), select('ratio', 'Aspect ratio', ['natural', '16:9', '9:16', '1:1'], '16:9'), select('fit', 'Fit', ['cover', 'contain'], 'contain')], [], 0),
  def('action.button', 'element', 'Button', [text('label', 'Label', 'Open'), select('variant', 'Button style', ['primary', 'secondary', 'link'], 'primary', 'appearance'), field('action', 'Action', 'action', 'behaviour', { kind: 'none' })], [], 0),
  def('navigation.menu', 'menu', 'Menu', [text('label', 'Accessible menu label', 'Main navigation')], ['menuItem']),
  def('navigation.item', 'menuItem', 'Menu item', [text('label', 'Label', 'Menu item'), select('icon', 'Icon', ['none', 'home', 'heart', 'photo', 'music', 'video'], 'none', 'navigation'), field('target', 'Target', 'action', 'navigation', { kind: 'none' })], ['menuItem'])
].map(d => [d.type, Object.freeze(d)]))));

export const styleFields: readonly Field[] = Object.freeze([
  ...['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].map(id => field(id, id, 'number', 'layout', 0, { min: 0, max: 160, unit: 'px' })),
  ...['marginTop', 'marginRight', 'marginBottom', 'marginLeft'].map(id => field(id, id, 'number', 'layout', 0, { min: 0, max: 160, unit: 'px' })),
  field('gap', 'Gap', 'number', 'layout', 16, { min: 0, max: 160, unit: 'px' }),
  field('columns', 'Columns', 'number', 'layout', 1, { min: 1, max: 6 }),
  field('width', 'Width', 'text', 'layout', 'auto'), field('maxWidth', 'Maximum width', 'text', 'layout', '100%'),
  field('radius', 'Corner radius', 'number', 'appearance', 0, { min: 0, max: 80, unit: 'px' }),
  field('opacity', 'Whole element opacity', 'number', 'appearance', 1, { min: 0, max: 1 }),
  field('backgroundAlpha', 'Background opacity', 'number', 'appearance', 1, { min: 0, max: 1 }),
  field('backgroundColor', 'Background', 'color', 'appearance', '#FFF7F2'), field('color', 'Text color', 'color', 'appearance', '#30252B'),
  field('fontSize', 'Font size', 'number', 'appearance', 16, { min: 12, max: 96, unit: 'px' }),
  field('lineHeight', 'Line height', 'number', 'appearance', 1.5, { min: 1, max: 3 }),
  field('letterSpacing', 'Letter spacing', 'number', 'appearance', 0, { min: -2, max: 10, unit: 'px' }),
  select('fontWeight', 'Font weight', [400, 500, 600, 700], 400, 'appearance'),
  select('align', 'Alignment', ['left', 'center', 'right'], 'left'),
  select('shadow', 'Shadow', ['none', 'soft', 'medium'], 'none', 'appearance'),
  field('borderWidth', 'Border width', 'number', 'appearance', 0, { min: 0, max: 8, unit: 'px' }),
  field('borderColor', 'Border color', 'color', 'appearance', '#D8C4CD'),
  field('visible', 'Visible at this breakpoint', 'boolean', 'responsive', true),
  select('motion', 'Animation', ['none', 'fade', 'slide'], 'none', 'behaviour'),
  field('duration', 'Animation duration', 'number', 'behaviour', 300, { min: 0, max: 2000, unit: 'ms' })
]);

export function supportedStyleFields(type: string): readonly Field[] {
  const d = registry[type]; if (!d) throw Error('Unknown component: ' + type);
  return styleFields.filter(f => !(['gap', 'columns'].includes(f.id) && d.allowedChildren.length === 0) && !(['fontSize', 'lineHeight', 'letterSpacing', 'fontWeight', 'color', 'align'].includes(f.id) && type.startsWith('media.')));
}
export function createNode(type: string, id: string, title?: string): Node {
  const d = registry[type]; if (!d) throw Error('Unknown component: ' + type);
  return { id, kind: d.kind, type, title: title ?? d.label, enabled: true, settings: Object.fromEntries(d.fields.map(f => [f.id, structuredClone(f.default)])), ...(d.maxChildren ? { children: [] } : {}) };
}
