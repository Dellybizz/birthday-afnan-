import { createClient } from '@supabase/supabase-js';
import { DraftClient } from './draft-client.ts';
declare global { interface Window { CMS_CONFIG?: { supabaseUrl: string; publishableKey: string } } }
const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const status = element('status'), login = element('login-panel'), workspace = element('workspace'), recovery = element('recovery-panel');
const site = element<HTMLSelectElement>('site'), field = element<HTMLTextAreaElement>('document'), save = element<HTMLButtonElement>('save');
const config = window.CMS_CONFIG; let savedText = '', busy = false, recoveryMode = /type=(recovery|invite)/.test(location.hash), currentUser: string | null = null, sessionSequence = 0;
const show = (message: string) => { status.textContent = message; };
async function start() {
  if (!config?.supabaseUrl || !config.publishableKey || config.supabaseUrl.includes('YOUR_') || config.publishableKey.includes('YOUR_')) { show('Configure this workspace with your dedicated project URL and public publishable key.'); return; }
  const auth = createClient(config.supabaseUrl, config.publishableKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storage: sessionStorage, storageKey: 'birthday-cms-admin-v2' } });
  const call = async (body: Record<string, unknown>) => {
    const { data, error } = await auth.auth.getSession(); if (error || !data.session) throw Error('Session expired. Sign in again.');
    const r = await fetch(config.supabaseUrl + '/functions/v1/site-admin-v2', { method: 'POST', headers: { apikey: config.publishableKey, Authorization: 'Bearer ' + data.session.access_token, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const value = await r.json(); if (!r.ok || !value.ok) { const messages: Record<string, string> = { REVISION_CONFLICT: 'Newer changes exist. Copy your current text before reloading.', FORBIDDEN: 'You do not have access to this site.', RATE_LIMITED: 'Too many requests. Try again in a minute.', UNAUTHENTICATED: 'Session expired. Sign in again.', ALREADY_INITIALIZED: 'This workspace is already initialised. Reload the draft.' }; throw Error(messages[value.code] || value.code || 'Request failed'); } return value;
  };
  const drafts = new DraftClient(call);
  const dirty = () => field.value !== savedText;
  const guarded = (fn: () => Promise<void>) => async (event?: Event) => { event?.preventDefault(); if (busy) return; busy = true; save.disabled = true; site.disabled = true; for (const id of ['load', 'initialize', 'logout']) (element(id) as HTMLButtonElement).disabled = true; try { await fn(); } catch (e) { show(e instanceof Error ? e.message : 'Action failed.'); } finally { busy = false; site.disabled = false; for (const id of ['load', 'initialize', 'logout']) (element(id) as HTMLButtonElement).disabled = false; save.disabled = !drafts.draft; } };
  async function load() { const draft = await drafts.load(site.value); field.disabled = !draft; field.value = draft ? JSON.stringify(draft.document, null, 2) : ''; savedText = field.value; element('initialize').hidden = !!draft; element('revision').textContent = draft ? 'Private draft · revision ' + draft.revision : 'This site has no saved draft yet.'; save.disabled = !draft; show(draft ? 'Saved draft loaded.' : 'Create the workspace to preserve the existing baseline and start a private draft.'); }
  async function session() {
    const sequence = ++sessionSequence;
    const { data, error } = await auth.auth.getUser(); const signedIn = !error && !!data.user;
    if (sequence !== sessionSequence) return;
    if (signedIn && currentUser === data.user!.id && drafts.draft && !recoveryMode) { recovery.hidden = true; workspace.hidden = false; return; }
    login.hidden = signedIn; element('logout').hidden = !signedIn; recovery.hidden = !signedIn || !recoveryMode; workspace.hidden = true;
    if (!signedIn) { currentUser = null; drafts.clear(); field.value = ''; savedText = ''; show('Sign in with your invited administrator account.'); return; }
    currentUser = data.user!.id;
    if (recoveryMode) { show('Choose a new password for your administrator account.'); return; }
    const result = await call({ action: 'context' });
    if (sequence !== sessionSequence) return;
    site.replaceChildren();
    for (const membership of result.memberships) { const option = document.createElement('option'); option.value = membership.site_id; option.textContent = membership.site_id + ' · ' + membership.role; site.append(option); }
    if (!site.options.length) { show('Signed in, but no site membership is assigned. Ask the project owner to add your account.'); return; }
    workspace.hidden = false; await load();
  }
  element('login-form').addEventListener('submit', guarded(async () => { const { error } = await auth.auth.signInWithPassword({ email: element<HTMLInputElement>('email').value.trim(), password: element<HTMLInputElement>('password').value }); element<HTMLInputElement>('password').value = ''; if (error) throw Error('Sign-in failed. Check your email and password.'); }));
  element('recover').onclick = guarded(async () => { const email = element<HTMLInputElement>('email'); if (!email.reportValidity() || !email.value) return; const { error } = await auth.auth.resetPasswordForEmail(email.value.trim(), { redirectTo: location.origin + location.pathname }); if (error) throw Error('Could not request recovery. Try again later.'); show('If that account exists, a recovery email has been sent.'); });
  element('password-form').addEventListener('submit', guarded(async () => { const input = element<HTMLInputElement>('new-password'); if (input.value.length < 12) throw Error('Use at least 12 characters.'); const { error } = await auth.auth.updateUser({ password: input.value }); input.value = ''; if (error) throw Error('Could not update password.'); recoveryMode = false; history.replaceState(null, '', location.pathname); await session(); }));
  element('logout').onclick = guarded(async () => { if (dirty() && !confirm('Discard unsaved draft text and sign out?')) return; const { error } = await auth.auth.signOut({ scope: 'local' }); if (error) throw Error('Sign-out failed. Try again.'); drafts.clear(); field.value = ''; savedText = ''; await session(); });
  element('load').onclick = guarded(async () => { if (!dirty() || confirm('Discard unsaved text and reload the server draft?')) await load(); });
  site.onchange = guarded(async () => { if (dirty() && !confirm('Discard unsaved text and switch site?')) { site.value = drafts.draft?.site_id || ''; return; } await load(); });
  element('initialize').onclick = guarded(async () => { await call({ action: 'initialize', siteId: site.value }); await load(); });
  save.onclick = guarded(async () => { const result = await drafts.save(field.value); savedText = result.savedText; element('revision').textContent = 'Private draft · revision ' + result.revision; show(dirty() ? 'Earlier changes saved. Newer text is still unsaved.' : 'Changes saved privately.'); });
  field.oninput = () => { element('validation').textContent = ''; if (!busy) show(dirty() ? 'Unsaved changes.' : 'Saved.'); };
  window.addEventListener('beforeunload', e => { if (dirty()) { e.preventDefault(); e.returnValue = ''; } });
  auth.auth.onAuthStateChange((event) => { if (event === 'PASSWORD_RECOVERY') recoveryMode = true; if (event === 'SIGNED_OUT') { sessionSequence++; drafts.clear(); field.value = ''; savedText = ''; workspace.hidden = true; } if (['SIGNED_IN', 'SIGNED_OUT', 'PASSWORD_RECOVERY'].includes(event)) queueMicrotask(() => { if (!busy || event !== 'SIGNED_IN') session().catch(() => show('Session could not be restored. Sign in again.')); else setTimeout(() => session().catch(() => show('Session could not be restored.')), 0); }); });
  await session();
}
start().catch(() => show('Workspace could not start. Check configuration and connection.'));
