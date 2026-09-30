import { readFileSync, readdirSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { Script } from 'node:vm';
import { sampleDocument, validateDocument } from '../src/cms/index.ts';
for (const path of ['admin/editor.js', 'admin/config.example.js']) new Script(readFileSync(path, 'utf8'), { filename: path });
for (const name of readdirSync('supabase/functions').filter(n => !n.startsWith('.'))) { const path = 'supabase/functions/' + name + '/index.ts'; new Script(stripTypeScriptTypes(readFileSync(path, 'utf8')), { filename: path }); }
if (!validateDocument(sampleDocument()).ok) throw Error('Sample document invalid');
console.log('PASS: legacy JS/Edge syntax and Phase 1 sample contract. Edge runtime/type/database certification is separate.');
