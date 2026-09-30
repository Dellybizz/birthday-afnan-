import { validateDocument } from '../cms/validators/index.ts';
export interface Draft { id: string; site_id: string; document: unknown; revision: number; updated_at: string }
export class DraftClient {
  call: (body: Record<string, unknown>) => Promise<Record<string, any>>;
  draft: Draft | null = null;
  pending: Record<string, unknown> | null = null;
  generation = 0;
  constructor(call: DraftClient['call']) { this.call = call; }
  async load(site: string): Promise<Draft | null> { const generation = ++this.generation; const result = await this.call({ action: 'load', siteId: site }); if (generation !== this.generation) throw Error('Session changed. Reload your draft.'); if (result.draft.uninitialized) { this.draft = null; this.pending = null; return null; } this.draft = result.draft; this.pending = null; return this.draft; }
  async save(text: string): Promise<{ revision: number; savedText: string }> {
    if (!this.draft) throw Error('Load the saved draft first.');
    if (!this.pending) { const document = JSON.parse(text); const check = validateDocument(document); if (!check.ok) throw Error(check.issues.map(i => i.path + ': ' + i.message).join('\n')); if (document.siteId !== this.draft.site_id) throw Error('The document belongs to another site.'); this.pending = { action: 'save', draftId: this.draft.id, expectedRevision: this.draft.revision, mutationId: crypto.randomUUID(), document }; }
    const request = this.pending, generation = this.generation; const result = await this.call(request); if (generation !== this.generation || !this.draft) throw Error('Session changed. Reload your draft.'); this.draft.revision = result.revision; this.draft.document = structuredClone(request.document); this.pending = null; return { revision: result.revision, savedText: JSON.stringify(request.document, null, 2) };
  }
  clear() { this.generation++; this.draft = null; this.pending = null; }
}
