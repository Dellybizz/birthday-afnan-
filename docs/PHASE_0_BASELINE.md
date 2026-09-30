# Phase 0 — baseline, contracts and readiness

Recorded 1 October 2026. Repository: Dellybizz/birthday-afnan-. Baseline commit: `9a326a344b556dd285df1ce0b3d3a748f6b0332d`. Isolated work branch: `architecture-phase0-baseline`.

Status: **source baseline and planning deliverables complete; database integration evidence pending**. Phase 1 schema/registry work can proceed. This is not live deployment certification.

## Baseline inventory

At audit time GitHub lists only `main`; its HEAD matches the local checkout. The checkout was clean before this branch was created. No repository/ancestor AGENTS.md instruction was found. No GitHub Actions workflow runs exist. There is no package.json, dependency lockfile, test runner, public frontend, Supabase project configuration, or committed live frontend config.

The 14 tracked source/setup files comprise README and ignore rules, three admin files, two setup SQL files, two Edge Functions and an environment example, plus four inherited migrations. Admin config contains placeholders. No live project was selected or modified. README deployment statements remain unverified against a live database.

Existing editor: plain textarea; empty v1 general/pages/menus document; load, add page, undo, redo, publish. Existing backend: shared admin key, key rotation, failure limiting, structural document validation, revisioned live publishing/history, authenticated media listing/upload/deletion, signature checks and live/history substring-reference scanning.

## Checks and evidence

| Check | Result | Scope |
| --- | --- | --- |
| `node --check admin/editor.js` | PASS | JavaScript parsing |
| `node --check admin/config.example.js` | PASS | Example config parsing |
| Both Edge Functions parsed after Node `stripTypeScriptTypes` | PASS | Syntax only; no Deno execution or type checking |
| Mock-DOM add page → undo → redo | PASS | Actual editor code, isolated VM, no backend |
| Publish before load | PASS: guard message | Mock DOM; not successful publishing |
| All migration/RPC sources read in filename order | DONE | Source contract audit, not SQL execution |
| Deno / PostgreSQL client / Supabase CLI / Docker | Unavailable on PATH | No disposable local Supabase integration runtime |
| Remote database integration | NOT RUN | Dedicated test project and credentials not configured in checkout |

Node version: v24.19.0. `node --experimental-strip-types --check file.ts` did not parse the TypeScript in this invocation; that is an unsuitable checker command, not evidence of an Edge Function defect. Explicit type stripping followed by `vm.Script` parsing succeeded. Runtime/type certification remains pending.

Reproduce JavaScript syntax checks from repository root. For TS syntax only, use Node's `stripTypeScriptTypes(readFileSync(path,'utf8'))` followed by `new vm.Script(...)`. A future Deno check must provide the actual runtime/environment configuration rather than treating this substitute as equivalent.

## Setup order and SQL dependencies

Use a NEW dedicated test project. Do not connect an old birthday database. Never commit an admin key.

| Order | File | Dependencies and effect |
| --- | --- | --- |
| 1 | `setup/bootstrap.sql` | Creates pgcrypto in extensions, site_state/security tables, live seed, RLS/grants and public birthday-media bucket; fresh-project bootstrap, not rerunnable as written |
| 2 | `202609180010_birthday_site_state_revision_history.sql` | Requires site_state; adds revision/history; normalises inherited patches; creates publish_site_state; snapshots initial live state |
| 3 | `20260918065136_birthday_site_phase9_security_media_hardening.sql` | Requires security table, pgcrypto and Storage schema; creates auth-limit table and authorize/change-key functions; restricts file sizes/MIME; updates an inherited bucket if present |
| 4 | `20260918065258_birthday_site_phase9_media_reference_guard.sql` | Requires live/history tables; creates reference-status RPC |
| 5 | `20260918065543_birthday_site_phase9_rate_limit_found_fix.sql` | Replaces authorize RPC to retain original row-existence state across later SELECTs |
| 6 | `setup/set-admin-key.sql` | Requires security table and crypto functions; initialise long unique key privately after migration chain |

The first migration has a 12-digit historical filename prefix while later migrations use 14 digits. Do not rename an already applied migration blindly; check CLI history conventions when configuring a project. The chain includes legacy patch cleanup, an absent baseline-ID read, and an update of `birthday-site-web`, which bootstrap does not create. On a fresh project the absent baseline/bucket operations are expected to affect zero rows. Patch cleanup may add `patches: {}` to the starter JSON because its coalesced default is an object. Preserve these behaviours as evidence, then decide whether to replace inherited setup with a clean migration path in Phase 2.

## RPC and frontend contracts

| Caller | Contract | Response / dependency |
| --- | --- | --- |
| Admin/media authorization | birthday_admin_authorize(p_key,p_fingerprint) | allowed/rate_limited/retry_after; security/limits tables |
| Admin change_key | birthday_admin_change_key(p_new_key) | ok/hash_scheme; updates primary security row |
| Admin publish | publish_site_state(p_expected_revision,p_data) | ok/conflict/revision/updated_at; row lock on live and history insert |
| Media usage check | birthday_media_reference_status(p_url,p_path) | referenced/live/history_count; scans live/history JSON text |
| Editor load | ping then REST site_state live select | data/revision via public publishable key |

Publish validation: schemaVersion 1; general object; pages/menus arrays; global unique nonempty IDs; title/type strings; enabled boolean; settings object; optional recursive children; maximum depth 5, 2,000 nodes and 1 MiB serialized state. It does not validate registered types, personalisation fields, links, styles or child-kind compatibility. SQL publish additionally checks object shape and expected revision, but relies on server-side caller validation for richer invariants.

Admin responses use no-store and explicit allowed-origin CORS. Missing Origin is accepted; CORS cannot be relied on as authorization. Authorization depends on the supplied key. Gateway JWT verification is disabled by documented setup and custom key verification is performed inside the functions; revise deliberately during named-user migration.

## Findings and remediation ownership

| ID | Evidence / impact | Planned resolution |
| --- | --- | --- |
| F01 | No saved drafts; publish writes the live row directly | Phase 2 persistence and Phase 6 publication workflow |
| F02 | birthday-media is public; unpublished uploads are retrievable by asset URL | Phase 5 private upload delivery; Phase 6 release separation |
| F03 | No component registry or typed style/field validation | Phase 1 |
| F04 | Upload/list permit configurable folder, DELETE permits only birthday-afnan/ | Phase 5 consistent site-scoped keys |
| F05 | Media list makes one reference RPC per item; up to 1,000 items | Phase 5 pagination and batched refs |
| F06 | Force deletion permits breaking live/history references | Phase 5 protected lifecycle; Phase 6 release retention |
| F07 | Reference checks are substring scans and separate from physical deletion; attachment/publish can race deletion | Phase 5 indexed exact refs and lifecycle coordination |
| F08 | Full file buffered in Edge Function, max 100 MiB | Phase 5 direct/resumable upload and final validation |
| F09 | Shared key; no named membership, login recovery or admin preview authorization | Phase 2, then Phase 6 preview grants |
| F10 | Limits/structural fields accepted but no typed rendering or inspector | Phases 1, 3 and 4 |
| F11 | Inherited SQL has unrelated historical cleanup and setup is not idempotent | Phase 2 clean migration reconciliation after test-project reproduction |
| F12 | Concurrent first-time failed auth requests can undercount: absent row is not locked before upsert; current upsert uses calculated count | Phase 2 authentication transition or atomic legacy limiter fix; DB concurrency proof required |
| F13 | No CI, manifest, lockfile or integration runtime | Phase 1 frontend scaffolding; relevant checks as features are implemented |

No findings were fixed in the runtime during Phase 0. This branch adds planning documents only. Potential races above are source findings, not reproduced database failures.

## Decisions for implementation

1. One site and owner first; editor memberships are supported, but realtime multi-author editing is deferred.
2. React/TypeScript with separate public/admin entry builds and shared content/renderer/contracts modules.
3. Schema v2 separates kind/type, preserves existing node IDs, uses explicit adapters and never drops an original export.
4. Page level 1; maximum five layout node levels; menu allows three item levels below root. Child compatibility is registry-controlled.
5. JSONB document snapshots plus relational ownership, revisions, releases and exact asset references. No table/endpoint per paragraph.
6. Private draft saving and immutable content releases are separate operations. Publish targets an acknowledged draft revision.
7. Admin preview requires login AND site membership; a link alone grants no access. Default grant expiry 24 hours.
8. Private originals/drafts; deliberate public release variants only if the public audience policy permits them. For strict draft-media access choose authenticated gateway delivery.
9. Node IDs reference content; asset IDs reference immutable files; navigation uses page IDs and allowlisted actions. No arbitrary executable content/CSS.
10. Base/tablet/desktop inheritance; generated inspector groups: content, media, layout, appearance, behaviour, responsive, accessibility.
11. Undo/redo is command-based, bounded and grouped; saved versions and published history are separate recovery concepts.
12. Optional birthday module names do not imply the final content selection. Public versus recipient-restricted delivery remains undecided before production configuration.

## Initial control coverage matrix

All rows below are **planned, not implemented**. Server validation and the renderer must consume the same registered field definitions.

| Component | Fields/actions | Inspector group | Renderer responsibility | Verification |
| --- | --- | --- | --- | --- |
| Site settings | name, nickname, birthdayDate, timezone, greeting bindings | Personalisation | Format dates/text safely | Binding/date fixtures; edit/save/reload |
| Theme | palette, fonts, scale, spacing, radii | Appearance | Resolve tokens | Inspector-to-output comparison |
| Global music | enabled, playlist, volume, loop | Behaviour/media | One audio coordinator | Muted playback/video coordination |
| Page | title, slug, shell, enabled, background, width | Page/layout | Route and shell | Route uniqueness and visibility |
| Greeting section | background, alignment, padding, child text | Content/layout | Responsive greeting region | Preview/public parity |
| Container section/block | children, columns, gap, padding, margin | Structure/layout | Valid grid/flex composition | Invalid parent rejection; mobile layout |
| Heading | text/binding, level, size, weight, color | Content/appearance | Semantic heading | Heading validation and output |
| Paragraph | structured rich text, alignment, spacing | Content/appearance | Safe rich text | Unsafe links rejected |
| Image | assetId, alt, caption, ratio, fit, focal point, width | Media/layout/accessibility | Correct image variant/crop | cover/contain and usage refs |
| Video | assetId, poster, captions, controls, muted, loop | Media/behaviour | Inline player and fallbacks | Blocked autoplay and missing file |
| Button | label, icon, style, target/action | Content/behaviour | Safe actionable control | Invalid targets rejected |
| Menu/item | label, icon, page/action target, submenu, enabled | Navigation | Accessible menus/active state | Rename/delete reference integrity |
| Every allowed layout node | insert/delete/duplicate/move/reorder/enable | Structure | Ordered/visible children | ID remap, undo/redo, keyboard move |

Sample document design: one home page with greeting, heading/paragraph, image card and video; one main menu linking by page ID; shared theme/music settings. Fixtures use synthetic text and asset placeholders, never another person's private content. Phase 1 will implement and validate this seed against the v2 schema.

## Environment checklist and pending certification

Available: GitHub read/write connector; clone/read repository; Node; filesystem. Not configured: dedicated test project URL/credentials, deployed functions, named admin account, real storage fixtures or public hosting selection. No secret value is needed in these documents.

Database integration gate: create/select a NEW dedicated test project through available authorised tooling, run bootstrap/ordered migrations, initialise a test key privately, prove authorize/change-key/revision conflict/history/reference contracts and wrong-key blocking, then exercise concurrent limiter/publish cases. Record actual project/engine/runtime versions and results. No live database certification is possible until that environment exists; Phase 1's local contract implementation can continue meanwhile.

## Phase 0 exit assessment

- Baseline SHA, repository inventory, migration/RPC dependencies: complete.
- Existing JavaScript/TS syntax and lightweight editor behaviour: verified within stated scope.
- Implementation decisions, initial field coverage and seed design: complete.
- Disposable database reproduction and Deno runtime checks: pending environment.
- Production changes: none.

Next action: Phase 1 shared schemas/registry and frontend scaffolding. Carry the integration gate explicitly into Phase 2; do not retroactively label it passed.
