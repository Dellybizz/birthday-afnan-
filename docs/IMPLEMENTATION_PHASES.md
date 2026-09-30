# Birthday Afnan — Phased Implementation Plan

Date: 1 October 2026. Repository: https://github.com/Dellybizz/birthday-afnan- . Basis: the repository-specific ARCHITECTURE.md created in this conversation.

Status: planning only. No phase is certified complete by this document. Implementation must first refresh the repository baseline because other work may have changed it.

## Intended outcome

A responsive birthday website with a Shopify-style control panel: searchable content hierarchy, live visual preview, grouped controls for every supported editable property, media library, undo/redo, private draft saves, admin-only preview links, validated publication and rollback.

## Phase overview

| Phase | Focus | Working outcome |
| --- | --- | --- |
| 0 | Repository baseline and decisions | Reproducible starter and agreed implementation contracts |
| 1 | Content hierarchy and component registry | Validated site → page → section → block → element and menu models |
| 2 | Admin access and private persistence | Named admin login, revision-safe drafts and release storage |
| 3 | Public renderer and preview foundation | One renderer drives public pages and editor previews |
| 4 | Shopify-style visual editor | Outline, inspector, selection, structural editing and undo/redo |
| 5 | Media and advanced controls | Upload/library workflow and complete layout/playback controls |
| 6 | Save, publish and private preview links | Reliable publishing boundary, authenticated draft links and rollback |
| 7 | Complete birthday site and responsive polish | All selected pages and navigation fully configurable |
| 8 | Certification and production release | Verified complete flows, recovery and production deployment |

Work proceeds in this order. Small prototypes are allowed earlier, but a later phase cannot claim completion while its dependencies remain unresolved. The first complete save → preview → publish → rollback slice must be proven on a simple page before the full birthday experience is assembled.

## Phase 0 — Baseline, repository audit and implementation decisions

**Goal:** establish exactly what exists and how it will be extended safely.

### Work

1. Refresh `main`, capture its commit SHA, inspect any AGENTS.md instructions, branches and ongoing work. Use an isolated implementation branch and preserve unrelated changes.
2. Inventory admin files, Edge Functions, bootstrap SQL, all migrations and RPCs. Map the exact current state/history/media contracts.
3. Verify syntax and available checks. Record existing failures separately from changes introduced by implementation.
4. Reproduce setup in a disposable test project when available. Without a test project, finish source checks but mark database integration evidence as pending.
5. Record confirmed existing data/deployment state without assuming a live project exists or copying data from a previous birthday project.
6. Finalise schema versions, allowed hierarchy depth, component list, route policy, asset paths and the frontend build structure.
7. Record defaults: one owner, one primary saved draft, private draft media, immutable releases, admin-authenticated previews and schema-controlled fields.
8. Identify the public-site access choice: public or recipient-restricted. If undecided, keep draft privacy strict and defer production audience configuration.
9. Define a control coverage matrix: component → field → inspector group → renderer behaviour → validation → verification evidence.

### Deliverables

- Baseline report with exact SHA, current capabilities, gaps and known failures.
- Dependency/environment checklist with actual access status.
- Architecture decision records and agreed scope.
- Initial component/control coverage matrix and seeded sample document design.

### Completion checks

- A fresh contributor can reproduce the documented starter checks.
- Existing migration order and RPC dependencies are understood.
- No production data changes are necessary to complete the audit.
- Missing access is stated precisely; source inspection is not labelled live certification.

**Depends on:** none. **Next:** Phase 1.

## Phase 1 — Typed content hierarchy and registry

**Goal:** make the structure and controls consistent across frontend, editor and backend.

### Work

1. Add shared TypeScript/runtime schemas for site settings, page, section, block, element, menu and menu item.
2. Separate structural `kind` from registered component `type` and preserve stable node IDs.
3. Register initial components: standard page, greeting section, text section, container/card block, heading, paragraph, image, video, button and navigation.
4. Declare each type's fields, defaults, bounds, units, inspector groups, allowed children and asset/action references.
5. Implement traversal, lookup, insertion, removal, reorder, move and deep duplication with ID/reference remapping.
6. Add allowlisted personalisation bindings, structured rich text and safe action/link unions.
7. Define responsive base/tablet/desktop values with inheritance and reset behaviour.
8. Implement a versioned adapter for valid existing schema-v1 content. Keep conversion errors explicit and retain the original export.
9. Reject duplicate IDs, cycles, unsupported types, wrong parents, excessive depth, oversized documents and invalid routes/references.

### Deliverables

- Shared content/contracts modules and component registry.
- Versioned schema migration utilities.
- Seeded sample page with text, image, video and menu references.
- Updated field coverage matrix.

### Completion checks

- Client and server validators agree on valid and invalid fixtures.
- Subtree duplication produces fresh IDs and correctly remapped internal references.
- Invalid moves cannot corrupt the document.
- Existing valid starter documents convert without silent data loss.
- Component fields are declared once and usable in the server runtime.

**Depends on:** Phase 0. **Next:** Phase 2.

## Phase 2 — Admin authentication, drafts and release persistence

**Goal:** protect administration and establish saved state independently of live content.

### Work

1. Configure invite-only named admin login, session handling, logout and account recovery.
2. Add site membership/roles and enforce site-scoped permissions server-side and through RLS where applicable.
3. Preserve legacy-key access during a controlled transition; remove daily reliance on it after named access is verified.
4. Create or reconcile sites, drafts, draft versions, releases, assets/reference metadata, publish requests and audit records through reviewed migrations.
5. Add authenticated draft load/save endpoints with expected revision and idempotent mutation IDs.
6. Add an active-release pointer and a visitor-safe public content loader; no public draft reads.
7. Import current live state into an initial release and an independent draft in the test environment. Preserve exports/history.
8. Add stable API error codes, request limits and redacted logging.

### Deliverables

- Named admin sign-in and membership checks.
- Private draft persistence and revision-safe save contract.
- Release persistence/public loader contracts.
- Reviewed migrations and test-environment setup instructions.

### Completion checks

- Anonymous and wrong-site users cannot read/write drafts or administration data.
- Two saves with the same expected revision cannot both silently overwrite content.
- Retrying a successful save returns its original result.
- Saving a draft leaves the active public release unchanged.
- No service-role credential appears in browser code or content documents.

**Depends on:** Phase 1. **Next:** Phase 3.

## Phase 3 — Shared public renderer and preview foundation

**Goal:** render one document consistently in the website and editor.

### Work

1. Build responsive page shells and renderers for the initial registered types.
2. Resolve theme tokens, personalisation bindings, responsive styles, semantic text and menu/page targets.
3. Add stable `data-editor-node-id` attributes in preview mode without changing normal page output.
4. Render the public site from the active release only; render preview from an authorised document/context.
5. Add a preview iframe entry, initial document loading, page navigation and validated origin/source/message checks.
6. Implement sequence/acknowledgement handling and full resynchronisation after a missed update.
7. Define empty, loading, missing-media and render-error states. Preview failures identify the affected node.
8. Disable or simulate side-effecting public interactions in preview.

### Deliverables

- Working public sample page.
- Shared renderer package and preview frame protocol.
- Responsive theme/style resolver and asset-delivery adapter interface.

### Completion checks

- The same document/build renders the same content/layout in public and preview contexts.
- Out-of-order preview messages cannot replace newer state.
- A malformed message or unknown origin cannot control the preview.
- Missing media does not crash the page.
- Public pages exclude inspector and drag-tool dependencies.

**Depends on:** Phases 1–2. **Next:** Phase 4.

## Phase 4 — Shopify-style editor and command history

**Goal:** replace JSON-only daily editing with a visual workflow.

### Work

1. Build the desktop shell: toolbar, left outline, centre preview and right inspector.
2. Add page selection, searchable hierarchy, collapse/expand, breadcrumbs and node labels.
3. Connect outline selection to preview scroll/highlight and preview selection to the correct inspector.
4. Add selection mode versus interaction mode.
5. Generate grouped controls from registry fields; add reset/default/override indicators and inline validation.
6. Add page/section/block/element/menu CRUD, valid moves, duplicate, reorder and show/hide.
7. Support drag/drop plus move-up/down and choose-parent alternatives.
8. Implement reversible commands, bounded undo/redo and grouped typing/slider gestures.
9. Connect manual Save to Phase 2; show draft revision, unsaved state, conflict and failure accurately.
10. Add compact tablet/phone editor views without forcing a three-column layout.

### Deliverables

- Functional visual editor for the initial components.
- Command history and structural-editing controls.
- Registry-driven inspector and draft-save feedback.

### Completion checks

- All initial editable fields visibly change the preview and persist after save/reload.
- Undo/redo restores both content and hierarchy changes.
- New changes after undo clear the redo branch.
- Drag and non-drag reordering produce the same valid document.
- Text-input shortcuts retain expected native behaviour.
- Selection does not accidentally navigate or play media.

**Depends on:** Phases 1–3. **Next:** Phase 5.

## Phase 5 — Media library and advanced visual/playback controls

**Goal:** make photos, videos, audio and detailed styling manageable through the editor.

### Work

1. Implement site-scoped upload intents, private direct uploads, resumable large-file transfer and finalisation.
2. Validate actual object size/type/signature and processing state before use in publishable content.
3. Add paginated media search/filter, metadata, tags/folders and usage locations.
4. Add choose existing, upload, replace, remove and mobile-specific media selection.
5. Implement image ratios, natural sizing, max width, cover/contain, focal point, crop preview, alt text and captions.
6. Add poster/captions/controls/loop/preload settings for video and playlist settings for audio.
7. Add the global music coordinator with visitor mute, user-initiated audible playback and pause/resume around videos.
8. Complete supported styling: padding, margin, radius, backgrounds, overlays, transparency, borders, shadows, typography, grids and responsive overrides.
9. Produce thumbnails/approved web-ready variants; define durable processing jobs. Heavy transcoding needs a suitable worker or a documented web-ready-upload constraint.
10. Track references in drafts, snapshots and releases. Add protected trash/purge with race-safe lifecycle checks.
11. Standardise upload/list/delete site paths and remove per-item reference-query listing behaviour.

### Deliverables

- Integrated media library and upload pipeline.
- Complete media/layout inspector groups.
- Music/playback controller and protected asset lifecycle.

### Completion checks

- Interrupted uploads recover or fail cleanly without a publishable broken asset.
- Private uploads cannot be downloaded by anonymous users.
- Cover/contain, ratio, focal point and spacing match the preview and saved document.
- Replacing media preserves assets required by older retained releases.
- Referenced media cannot be purged, including during concurrent publish/attachment operations.
- Audible autoplay rejection produces a usable Play control.
- Page changes never create competing global audio players.

**Depends on:** Phases 1–4. **Next:** Phase 6.

## Phase 6 — Reliable saving, publication, private links and rollback

**Goal:** complete the editing-to-live workflow before expanding all pages.

### Work

1. Add serialised autosave, manual-save flush, mutation retry and precise saved/unsaved status.
2. Add bounded IndexedDB draft recovery and a compare/recover flow for divergent local/server versions.
3. Build prepublication validation with node/field errors, change summary and asset readiness checks.
4. Publish the exact acknowledged draft revision using expected publication sequence and idempotency key.
5. Prepare release assets before activation; advance the release pointer in one short database transaction.
6. Add durable jobs/outbox retries for preparation/invalidation and publication-status lookup after lost responses.
7. Provide admin-only `/preview/<opaque-id>` links for latest saved draft and fixed snapshot modes.
8. Require login, membership, grant scope/expiry/revocation and private cache headers on preview requests.
9. Choose and implement preview-media guarantees: authenticated gateway for strict access or short-lived signed URLs with their bearer-link limitation.
10. Add release history and rollback as a new audited publication event.
11. Verify public caching/propagation and coherent old-release fallback on invalidation delay.
12. Add scheduled snapshot publication only if needed; use the same validated server-side workflow.

### Deliverables

- Autosave/recovery and conflict UI.
- Publish, status, history and rollback interfaces.
- Authenticated unpublished-site links and protected preview media.
- Complete end-to-end sample-page workflow.

### Completion checks

- Saving and opening private preview never changes public content.
- Unsaved editor changes do not falsely appear in the saved-draft link.
- Anonymous, wrong-site, revoked and expired preview requests are denied.
- Failed asset preparation or stale revision leaves the active release unchanged.
- Retrying after a lost response creates only one publication for its key.
- Two publishers cannot activate conflicting releases from the same expected sequence.
- Rollback restores usable retained media/content.
- Public update propagation meets the agreed target; private data is never shared-cache content.

**Depends on:** Phases 1–5. **Next:** Phase 7.

## Phase 7 — Complete the birthday experience and responsive polish

**Goal:** populate every selected page using the proven content/editor system.

### Work

1. Finalise page inventory and personal content without assuming names, dates or content from another project.
2. Assemble greeting/home, galleries, messages, movie, playlists and other selected modules from registered components.
3. Add any chosen birthday-specific presets, such as reasons cards, hotline, adventures or kiss coupons, with explicit schemas and safe actions.
4. Configure menus/submenus, page metadata, icons, backgrounds and global settings through the editor.
5. Add server-enforced reveal/recipient access where required; a client countdown is only display logic.
6. Finish responsive overrides, empty states, loading/retry states and readable long-text layouts.
7. Implement reduced-motion behaviour, keyboard/focus flows, captions/transcripts and accessible non-drag controls.
8. Check full component/control coverage; fix any public property that is intended editable but lacks a working control.

### Deliverables

- Complete selected birthday pages and navigation.
- Content presets and finished component/control matrix.
- Responsive and accessibility fixes from representative device/browser checks.

### Completion checks

- Every selected page can be managed through the editor without ordinary JSON edits.
- All supported page/section/block/element/menu actions work across the finished site.
- The site is usable on narrow phones, tablets, landscape and desktop.
- Essential content is reachable with keyboard and assistive technologies.
- Public reveal protection remains effective when a visitor changes their device clock.

**Depends on:** Phases 1–6. **Next:** Phase 8.

## Phase 8 — Certification, recovery and production release

**Goal:** prove the complete system and deploy the verified state.

### Work

1. Run focused contract, database, editor and browser tests for the completed flows.
2. Verify draft isolation, membership, preview-media access and cross-site access denial.
3. Exercise failure paths: lost responses, offline edits, stale saves, upload interruption, publication races, job retries and rollback.
4. Measure public performance on a mid-range mobile profile and constrained connection; keep editor dependencies out of public bundles.
5. Check CSP, link/rich-text safety, request limits, permissions, redacted logs and credential exposure.
6. Back up database and object storage separately and demonstrate restoration in a clean test environment.
7. Create operational instructions for login recovery, media cleanup, failed publication, restore and rollback.
8. Deploy compatible application code before activating content requiring new components.
9. Apply reviewed production migrations with exports and rollback plans, then smoke-test live access/content/media paths.
10. Publish the approved content revision to the selected audience and retain final commit/release/deployment identifiers.

### Deliverables

- Certification report with passed checks, unresolved issues and evidence links.
- Backup/restore and operations runbook.
- Verified deployed code and content release identifiers.

### Completion checks

- Core workflows and critical failure/access cases pass in staging and final smoke checks.
- No broken required asset, unauthorised draft exposure or unresolved data-loss defect remains.
- A full restore and rollback have actually been exercised.
- Performance/accessibility findings are documented with measured results, not assumed compliance.
- Deployment success and content publication success are verified separately.

**Depends on:** Phases 0–7.

## Completion reporting rules

At the end of each phase, report: final code/document changes, commit/reference, checks run with results, remaining blockers and the next phase. Use **complete**, **implemented but awaiting integration evidence**, or **blocked**, rather than a vague percentage. A phase is complete only when its stated completion checks pass.

Infrastructure access may be required for database/auth/storage integration and production release. Finish independent source work first, then identify the exact unavailable resource; do not declare an untested live phase complete. Phase 0 can record those constraints without changing a live system.

No fixed delivery dates are promised before Phase 0 reveals the actual repository state, provider access and selected page scope. This plan sequences work; it does not certify that implementation has started.
