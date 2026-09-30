import type { Document, Issue } from './schemas/types.ts';
export interface SaveDraftRequest { draftId: string; expectedRevision: number; mutationId: string; document: Document }
export type SaveDraftResponse = { ok: true; revision: number; savedAt: string } | { ok: false; code: 'REVISION_CONFLICT' | 'IDEMPOTENCY_MISMATCH' | 'INVALID_REQUEST' | 'INVALID_DOCUMENT' | 'FORBIDDEN'; currentRevision?: number; issues?: Issue[] };
export const contentContractVersion = 1;
// Phase 2 implements this contract through src/backend/api.ts and cms_save_draft.
