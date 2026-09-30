# Birthday Afnan — reusable control backend

## Phase 1 content foundation

The schema-driven content foundation lives in `src/cms/`. See `docs/CONTENT_MODEL.md`, `docs/COMPONENT_REGISTRY.md`, `docs/EDITOR_SCHEMA.md` and `docs/PHASE_1_REPORT.md`.

With Node 22.18+ (CI uses Node 24), run `npm ci`, `npm test` and `npm run check`. Check includes strict TypeScript checking of the shared modules plus legacy syntax checks. There are no runtime package dependencies; TypeScript is a pinned development dependency.

`fixtures/sample-document.json` is a synthetic schema-v2 example with placeholder assets. Existing admin/Edge Functions still use v1: do not publish this fixture through the old endpoint. Draft persistence, public rendering and the visual editor are delivered in subsequent phases.

Extracted from Dellybizz/birthday-site main at 1e605a0afdcec37776d804b3f6ddc89afc7b6726. This is a fresh backend starter, not a copy of the birthday experience.

## Included
- Admin authorization/key rotation and rate limiting.
- Revision-checked publishing and database history snapshots.
- Media upload/list/delete with file validation and live/history reference guards.
- New empty JSON control panel with add-page, undo/redo, load and publish.
- Generic hierarchy: site → pages → sections → blocks → elements; menus use the same node model.

No original public HTML pages, photographs, videos, music, personal messages, credentials, deployed project URL, or Git history are included. The old monolithic visual editor and DOM patch runtimes are deliberately excluded because they embed the original pages and content. The replacement panel is a foundation; live visual preview, field inspectors, media UI, and new public page rendering still need implementation.

## New-project setup
1. Create a NEW dedicated Supabase project. Do not link the original database.
2. Run setup/bootstrap.sql in its SQL editor, then each file in supabase/migrations in filename order. These inherited migrations require bootstrap tables; they are not standalone.
3. Privately replace the placeholder in setup/set-admin-key.sql and run it. Use a long unique key. No old key is copied.
4. Deploy birthday-site-admin and birthday-site-media in this new project with gateway JWT verification disabled (the functions validate x-admin-key themselves). Configure ALLOWED_ORIGINS with exact new frontend origins.
5. Copy admin/config.example.js to admin/config.js and supply only the NEW project URL and public publishable key. Never put a service-role key in browser code.
6. Serve the repository over HTTP at localhost:3000 and visit /admin/. Load the live state before publishing.

The birthday-media bucket is public for delivery: anyone with an asset URL can read it. Use private storage and signed URLs if the new site requires private media. Nothing has been deployed or connected to a live database by this extraction.

## Node contract
Every node has id (globally unique), type, title, enabled, settings, and optional children. Order in each children/pages/menus array is display order. Delete removes a node; duplicate must assign new IDs to the entire subtree. Register typed field definitions and page renderers in the next architecture phase. Do not render settings as arbitrary HTML or executable code.

## Validation
Run `node --check admin/editor.js`. Database migrations and Edge Functions require a configured Supabase/Deno runtime for integration certification; source inspection is not live certification.

## References
- https://supabase.com/docs/guides/functions/secrets
- Source repository: https://github.com/Dellybizz/birthday-site
