import { createAdminHandler, RESTBackend } from '../_shared/cms-api.js';
const origins = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map(s => s.trim()).filter(Boolean);
const backend = new RESTBackend(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, Deno.env.get('CMS_PUBLISHABLE_KEY')!, Deno.env.get('CMS_LEGACY_SITE_ID') || 'site_afnan');
Deno.serve(createAdminHandler(backend, origins));
