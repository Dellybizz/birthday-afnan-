import { build } from 'esbuild';
await build({ entryPoints: ['src/admin/app.ts'], bundle: true, platform: 'browser', format: 'esm', target: 'es2022', outfile: 'admin-v2/app.js' });
await build({ entryPoints: ['src/backend/api.ts'], bundle: true, platform: 'neutral', format: 'esm', target: 'es2022', outfile: 'supabase/functions/_shared/cms-api.js' });
console.log('Built admin-v2 and shared Edge handler. No server secrets are bundled.');
