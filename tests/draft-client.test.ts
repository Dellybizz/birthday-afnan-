import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DraftClient } from '../src/admin/draft-client.ts';
import { emptyDocument } from '../src/cms/index.ts';
test('lost save acknowledgement retains exact mutation and document for retry', async () => {
  const requests: Record<string, unknown>[] = []; const initial = emptyDocument();
  const client = new DraftClient(async body => { if (body.action === 'load') return { draft: { id: 'draft', site_id: 'site_afnan', revision: 1, document: initial } }; requests.push(structuredClone(body)); if (requests.length === 1) throw Error('network lost'); return { ok: true, revision: 2 }; });
  await client.load('site_afnan'); const first = structuredClone(initial); first.general.name = 'First'; await assert.rejects(client.save(JSON.stringify(first)));
  const newer = structuredClone(initial); newer.general.name = 'Newer'; const result = await client.save(JSON.stringify(newer)); assert.deepEqual(requests[0], requests[1]); assert.equal(JSON.parse(result.savedText).general.name, 'First'); assert.equal(client.pending, null);
  await client.save(JSON.stringify(newer)); assert.equal(requests[2].expectedRevision, 2); assert.notEqual(requests[2].mutationId, requests[1].mutationId);
});
test('site mismatch and invalid documents never submit; logout clears state', async () => { let calls = 0; const client = new DraftClient(async body => { calls++; return { draft: { id: 'draft', site_id: 'site_afnan', revision: 1, document: emptyDocument() } }; }); await client.load('site_afnan'); await assert.rejects(client.save(JSON.stringify(emptyDocument('other_site')))); assert.equal(calls, 1); client.clear(); await assert.rejects(client.save('{}')); });
test('delayed load cannot restore draft data after logout', async () => { let finish: (v: Record<string, any>) => void = () => {}; const client = new DraftClient(() => new Promise(resolve => { finish = resolve; })); const result = client.load('site_afnan'); client.clear(); finish({ draft: { id: 'draft', site_id: 'site_afnan', revision: 1, document: emptyDocument() } }); await assert.rejects(result); assert.equal(client.draft, null); });
