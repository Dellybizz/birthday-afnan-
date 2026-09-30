import type { Field } from '../schemas/types.ts';
// Dot paths identify global inspector fields; array items are managed by a playlist control.
export const siteFields: readonly Field[] = [
  { id: 'name', label: 'Name', type: 'text', group: 'content', default: '', maxLength: 200 },
  { id: 'nickname', label: 'Nickname', type: 'text', group: 'content', default: '', maxLength: 200 },
  { id: 'birthdayDate', label: 'Birthday date', type: 'text', group: 'content', default: '' },
  { id: 'timezone', label: 'Timezone', type: 'text', group: 'content', default: 'Asia/Kolkata' },
  { id: 'locale', label: 'Locale', type: 'text', group: 'content', default: 'en' },
  { id: 'appearance.accent', label: 'Accent color', type: 'color', group: 'appearance', default: '#B44968' },
  { id: 'appearance.background', label: 'Background color', type: 'color', group: 'appearance', default: '#FFF7F2' },
  { id: 'appearance.text', label: 'Text color', type: 'color', group: 'appearance', default: '#30252B' },
  { id: 'appearance.font', label: 'Font', type: 'select', group: 'appearance', default: 'system', options: ['system', 'serif'] },
  { id: 'appearance.radius', label: 'Default corner radius', type: 'number', group: 'appearance', default: 24, min: 0, max: 80, unit: 'px' },
  { id: 'appearance.spacing', label: 'Default spacing', type: 'number', group: 'layout', default: 16, min: 0, max: 160, unit: 'px' },
  { id: 'music.enabled', label: 'Enable music', type: 'boolean', group: 'behaviour', default: false },
  { id: 'music.volume', label: 'Default music volume', type: 'number', group: 'behaviour', default: 0.5, min: 0, max: 1 },
  { id: 'music.loop', label: 'Loop playlist', type: 'boolean', group: 'behaviour', default: false },
  { id: 'animation.preset', label: 'Animation preset', type: 'select', group: 'behaviour', default: 'none', options: ['none', 'fade', 'slide'] },
  { id: 'animation.duration', label: 'Animation duration', type: 'number', group: 'behaviour', default: 300, min: 0, max: 2000, unit: 'ms' },
  { id: 'animation.reducedMotion', label: 'Respect reduced motion', type: 'boolean', group: 'accessibility', default: true }
];
export const playlistControl = { id: 'music.assetIds', label: 'Playlist', type: 'assetList', group: 'media', default: [] as string[], maxItems: 100 };
