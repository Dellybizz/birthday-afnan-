# Editor schema — Phase 1

The editor consumes the same registry/runtime schemas as the public renderer and backend. `client.ts` exposes validation/definitions; `server.ts` exposes the same validation without DOM, Node imports or external runtime dependencies. Their parity is tested through valid/invalid fixtures; actual Deno deployment certification remains pending.

Groups: content, media, layout, appearance, behaviour, responsive, accessibility and navigation. Node title is an editor label; settings text is visitor content. Future controls should use the field type/options/bounds rather than infer input widgets from arbitrary JSON values.

Style values are sparse overrides in base/tablet/desktop. Resolution merges base, then tablet, then desktop according to requested breakpoint. Reset removes one override, revealing inherited values; it does not write a replacement default. Component field defaults come from the registry. Theme tokens/global defaults remain a renderer concern in Phase 3.

Phase 4 will wrap hierarchy mutations in reversible editor commands. The Phase 1 immutable operations are ready for history snapshots but do not themselves maintain undo/redo. Phase 2 will implement the typed draft API envelope declared in `contracts.ts`; defining its transport type does not implement authentication or persistence.

Validation issues contain field paths and stable codes suitable for inspector messages. Editor draft validation permits unselected null assets; publication must additionally resolve referenced asset metadata and ensure ready, authorised media. Sample asset IDs demonstrate reference extraction only.

Unsupported content is never executable: custom scripts, custom CSS, arbitrary HTML and unsafe URL protocols fail validation. A new component or setting requires an explicit registered definition, schema version/adapter when necessary, renderer and coverage checks.
