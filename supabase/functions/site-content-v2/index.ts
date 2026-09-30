import { createContentHandler, RESTBackend } from '../_shared/cms-api.js';
const origins = (Deno.env.get('PUBLIC_ALLOWED_ORIGINS') || '').split(',').map(s => s.trim()).filter(Boolean);
const backend = new RESTBackend(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, Deno.env.get('CMS_PUBLISHABLE_KEY')!, '');
Deno.serve(createContentHandler(backend, origins));
