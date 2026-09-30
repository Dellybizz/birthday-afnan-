# Content model — Phase 1

The shared contract is `src/cms/schemas/types.ts`; its runtime validator is `src/cms/validators/index.ts`. A document contains schemaVersion 2, registryVersion 1, siteId, general, pages and menus. General defines identity/date/timezone/locale, theme, music and motion defaults. Dates are date-only; no reveal instant or secret is stored here.

Nodes have stable id, structural kind, registered type, editor title, enabled, settings, optional responsive style and optional children. Layout roots contain pages, then sections, blocks and elements. Container blocks can nest within the five-level layout limit; leaf elements cannot have children. Navigation is a separate tree: menu plus at most three item levels. IDs are globally unique across both trees.

`validateDocument(unknown)` returns structured issues with paths and codes. It rejects unregistered types/fields, mismatched kinds/parents, unsafe actions/rich text, invalid dates/timezones/locale, missing targets, duplicate canonical routes, cycles/repeated references, non-JSON values, depth/count/size limits and unsupported style fields. Documents are limited to 1 MiB and 2,000 nodes. Unknown extension fields require a schema change rather than silently disappearing.

`document/index.ts` provides walk/find, immutable insert/remove/move/reorder/duplicate, responsive resolution/reset, bindings and registry-driven asset references. Mutation functions validate before and after editing a cloned document, so errors leave the original untouched. Reorder indexes mean the final index after removal. Deletion of a referenced node fails until references are removed or retargeted in a coordinated edit. Duplicating pages creates a unique `-copy` route; subtree actions pointing inside the copy are remapped; external assets/targets remain unchanged.

Text bindings allow only `{{general.name}}`, `{{general.nickname}}` and `{{general.birthdayDate}}`. They produce plain text and must be escaped by the future renderer. Structured rich text supports paragraphs/text, bold/italic and validated HTTP(S) links. No executable HTML, JavaScript or arbitrary CSS is allowed.

`migrateV1` returns a retained complete original and either a validated v2 document or explicit errors with no successful partial document. It accepts the empty starter, optional empty legacy patches and registered legacy types, with generic `page` mapped to `page.standard`. Existing IDs are preserved. Unknown data/types, nonempty historical DOM patches and ambiguous timestamp birthdays need an explicit adapter/decision; they are never dropped silently.

Fixtures are synthetic. `fixtures/sample-document.json` uses sample asset IDs, not real uploaded objects or publication-ready media. `emptyDocument()` and `sampleDocument()` return fresh mutable content instances.

Important rollout boundary: the current Edge Functions still accept schema v1. Phase 1 provides server-compatible shared modules, not a replacement live endpoint. Do not paste v2 JSON into the existing admin publisher. Phase 2 introduces the new persistence path; Phase 3 introduces public rendering; Phase 4 introduces the visual editor.
