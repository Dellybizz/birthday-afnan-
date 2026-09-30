import type { Document, Issue } from './schemas/types.ts';
export interface SaveDraftRequest { draftId: string; expectedRevision: number; mutationId: string; document: Document }
export type SaveDraftResponse = { ok: true; revision: number; savedAt: string } | { ok: false; code: 'REVISION_CONFLICT' | 'INVALID_DOCUMENT' | 'FORBIDDEN'; issues?: Issue[] };
export const contentContractVersion = 1;
// API transport definitions only: authorization and persistence are implemented in Phase 2.
