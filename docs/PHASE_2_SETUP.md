# Phase 2 setup and activation

Official references: [password sign-in](https://supabase.com/docs/reference/javascript/auth-signinwithpassword), [password recovery](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail), [server-verified user](https://supabase.com/docs/reference/javascript/auth-getuser), [Edge authentication](https://supabase.com/docs/guides/functions/auth), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

Use a NEW dedicated Supabase project for birthday-afnan-. The only connected project found during implementation was the older birthday-site project; it was not inspected or modified beyond project-list metadata. This repository must not inherit that project's credentials/data.

## Local verification and build

Use Node 24. Run `npm ci --ignore-scripts`, `npm test`, `npm run check` and `npm run build`. The build creates `admin-v2/app.js` and `supabase/functions/_shared/cms-api.js`; both are generated/ignored and must exist before hosting/function deployment. Public frontend and Shopify-style editor are subsequent phases.

The database tests start an isolated PGlite PostgreSQL database, model the Supabase auth users/session tables and role names, execute the actual Phase 2 SQL migration, and query permissions/transactions. They do not connect to your account. This verifies PostgreSQL behaviour, not hosted GoTrue/PostgREST/SMTP/Edge infrastructure.

## Dedicated project prerequisites

1. Create/select the new project, confirm its identity and record engine/runtime versions. Project creation requires selecting an organisation and confirming its provider cost; no project was provisioned by this change.
2. For the extracted starter setup, run `setup/bootstrap.sql`, the four original migrations in filename order, then `20260930220539_cms_phase2_admin_drafts.sql`. New Phase 2 tables are additive; the existing state/history/security tables are preserved.
3. Disable new-user signups in hosted Auth settings. `supabase/config.toml` disables signups for local/config workflows; it does not automatically change hosted settings merely by being committed. Existing admin access remains available during transition.
4. Set the hosted Auth site URL and exact allowed redirect URL to your HTTPS `/admin-v2/` address. Invite a named owner account through Auth, then privately run `setup/phase2-owner.sql` with that user's UUID. No password or service key belongs in that SQL file.
5. Copy `admin-v2/config.example.js` to ignored `config.js`, using only the dedicated project's URL and public publishable key.
6. Configure function secrets: CMS_PUBLISHABLE_KEY; CMS_LEGACY_SITE_ID=site_afnan; ALLOWED_ORIGINS with exact admin origins; PUBLIC_ALLOWED_ORIGINS with exact eventual public origins. Supabase supplies server-side SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. Do not place those privileged values in browser config.
7. Run `npm run build`, then deploy `site-admin-v2` and `site-content-v2`. JWT gateway verification is disabled in function config because the admin handler explicitly verifies tokens against Auth and active sessions, while content exposes only explicitly public releases.
8. Host the admin-v2 HTML/CSS/generated JavaScript/config files over HTTPS. Serve development locally over HTTP at an allowed localhost origin.
9. Complete the invitation/password flow, sign in, and use Create private workspace. It converts only this dedicated project's legacy live row, retains its original JSON, creates an immutable baseline release plus independent draft, and starts with private site visibility.

CLI command shapes were checked using the installed CLI help:

```sh
npx supabase functions deploy site-admin-v2 site-content-v2 --project-ref YOUR_NEW_PROJECT_REF --no-verify-jwt
npx supabase secrets set --env-file YOUR_PRIVATE_ENV_FILE --project-ref YOUR_NEW_PROJECT_REF
```

Replace placeholders locally; do not commit private environment files. Do not deploy all functions implicitly or use prune during this transition. There is no new publish operation yet: Phase 6 owns the validated publication protocol. The baseline import is owner-only initialization, not ordinary editor publishing.

## Hosted certification checklist

- Owner can accept invitation, set password, sign in, reload session and sign out; recovery email returns to the same approved admin URL.
- Self-signup is disabled and a valid signed-in user without membership receives no site/draft access.
- Session revocation is detected by the admin API even while an old JWT remains unexpired.
- Named owner/editor can save; wrong-site accounts and anonymous requests are denied both through the endpoint and direct Data API calls.
- Two clients saving one expected revision produce one success and one conflict; replaying the winning request returns its original result.
- Retry retains its mutation ID/body after a lost response. Editing during a save does not mark later changes saved.
- Saving changes no active-release pointer/document. Private sites return NOT_FOUND on the public content endpoint; preview query parameters cannot select drafts.
- Import retains the exact legacy JSON and is rejected if unsupported legacy fields require explicit migration.
- Run hosted database advisors and inspect grants/RLS; inspect function logs without recording credentials/documents. Confirm the actual service role can execute the active-session function.
- Verify production transport, CSP, redirect configuration and trusted proxy settings when choosing hosting.

Do not revoke the legacy key or delete legacy tables until named login and recovery pass these hosted checks. Table writes/RPC calls remain service-only; role membership cannot be granted using editable user metadata.

## Operational limits

Auth tokens are held in tab-scoped sessionStorage and refreshed by the pinned SDK; they are not HttpOnly cookies. Closing the tab ends this browser persistence model. Enforce HTTPS and XSS protection; do not claim the cookie guarantees of an unimplemented gateway.

Each admin request verifies the Auth user and matching nonexpired auth.sessions row, then current site membership is used for data operations. Saving rechecks membership under the database transaction. The request limit is 120 per minute per verified user; Supabase Auth independently handles password/recovery endpoint limits.

Draft versions and idempotency records are retained without automated pruning in this phase. Add measured retention/cleanup with asset lifecycle rules later. Avoid using the draft client from multiple concurrent save callers; the UI serialises actions. Recovery/local offline drafts and autosave are Phase 6 work.
