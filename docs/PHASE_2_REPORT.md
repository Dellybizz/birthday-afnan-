# Phase 2 implementation and verification report

Status: **implementation complete; hosted activation and certification pending a dedicated project**.

Implemented:

- Named email/password admin sign-in, invitation/recovery password setting, tab-scoped session refresh and logout at `/admin-v2/`.
- Site memberships (owner/editor), current Auth-user and active-session checks, no role trust in editable metadata.
- Additive PostgreSQL migration for sites, memberships, private drafts, snapshots, immutable releases, legacy exports, save mutations, asset metadata/references, audit and request limits.
- RLS on all eleven new tables; browser writes and impersonating RPC calls denied. Backend RPCs are service-only SECURITY INVOKER functions, with membership checks and row locks.
- Shared schema validation before saves, revision conflicts, transaction-safe snapshots/references/audit and idempotent retries bound to the same actor/request.
- Baseline conversion that keeps the original JSON and creates separate draft/release copies. Existing key-based administration and tables are preserved during transition.
- Public content loader returning only an explicitly public site's active release; no draft-selection query parameter.
- Bounded request parsing, stable/redacted errors, exact-origin CORS, no-store responses and durable per-user request limiting.
- Reproducible browser/Edge bundles, pinned dependencies/lockfile, strict shared/backend/admin TypeScript checks and setup instructions.

Verification: all **48 tests pass**, as do `npm run check` (strict TypeScript and Edge/legacy syntax), `npm run build`, fresh offline `npm ci --ignore-scripts` and `git diff --check`. Tests include the existing 23 content tests plus HTTP-handler tests, draft-client retry/session tests and an actual isolated PostgreSQL migration/permission/transaction suite. Database tests use PGlite, not a mocked save counter: RLS, grants, SQL functions, revision conflicts, idempotency, original preservation, rate limits and membership/session revocation are queried against PostgreSQL. PGlite executes requests serially; this covers competing revision outcomes but is not a multi-connection hosted lock-contention benchmark.

The migration filename was created by the installed Supabase CLI `migration new`. CLI `migration list --local` was attempted but could not connect to localhost:54322 because a Docker-backed local Supabase stack is unavailable. That check is not marked passed. No remote database migration or hosted advisor query was run against the old project.

Hosted Supabase signup configuration, invitation/recovery email delivery, JWT/GoTrue integration, PostgREST schema exposure, Deno execution and service-role defaults still require the PHASE_2_SETUP.md certification checklist. The repository-only setup cannot certify those provider services. Only an older birthday-site project is connected; it was not used as a test database or changed.

No live data, legacy key or deployed application was changed. Phase 3 shared public rendering can proceed from this branch. Before claiming Phase 2 operationally certified, activate and test the dedicated hosted project.

Sources verified during implementation: Supabase Auth signInWithPassword, resetPasswordForEmail, getUser, Edge Function authentication documentation, and current changelog. Links are included in PHASE_2_SETUP.md / existing ARCHITECTURE.md and official documentation at https://supabase.com/docs .
