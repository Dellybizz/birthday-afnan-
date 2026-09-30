export type Kind = 'page' | 'section' | 'block' | 'element' | 'menu' | 'menuItem';
export type Group = 'content' | 'media' | 'layout' | 'appearance' | 'behaviour' | 'responsive' | 'accessibility' | 'navigation';
export type FieldType = 'text' | 'color' | 'number' | 'boolean' | 'select' | 'asset' | 'action' | 'richText';
export type Action = { kind: 'none' } | { kind: 'page'; pageId: string } | { kind: 'anchor'; nodeId: string } | { kind: 'external'; url: string } | { kind: 'play'; assetId: string };
export type RichText = { type: 'paragraph'; children: { type: 'text'; text: string; marks?: ('bold' | 'italic')[]; href?: string }[] }[];
export interface Field { id: string; label: string; type: FieldType; group: Group; default: unknown; min?: number; max?: number; options?: readonly (string | number)[]; unit?: string; maxLength?: number }
export interface Definition { type: string; kind: Kind; label: string; version: number; fields: readonly Field[]; allowedChildren: readonly Kind[]; maxChildren: number }
export type Settings = Record<string, unknown>;
export type Style = Record<string, string | number | boolean>;
export interface Node { id: string; kind: Kind; type: string; title: string; enabled: boolean; settings: Settings; style?: { base?: Style; tablet?: Style; desktop?: Style }; children?: Node[] }
export interface General {
  name: string; nickname: string; birthdayDate: string; timezone: string; locale: string;
  appearance: { accent: string; background: string; text: string; font: 'system' | 'serif'; radius: number; spacing: number };
  music: { enabled: boolean; assetIds: string[]; volume: number; loop: boolean };
  animation: { preset: 'none' | 'fade' | 'slide'; duration: number; reducedMotion: boolean };
}
export interface Document { schemaVersion: 2; registryVersion: 1; siteId: string; general: General; pages: Node[]; menus: Node[] }
export interface Issue { path: string; code: string; message: string }
export interface Validation { ok: boolean; issues: Issue[] }
