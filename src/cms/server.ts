// This module has no DOM, Node imports, dependency packages or service credentials.
// Edge Functions can import the same validator after the v2 persistence rollout.
export { validateDocument, assertDocument } from './validators/index.ts';
