# Component registry — Phase 1

`src/cms/registry/index.ts` is the single definition source for component settings. Definitions declare type, kind, version, label, allowed children, maximum children and fields. Each field declares ID, label, group, control type, default and applicable bounds/options/units. Inspectors and renderers are later consumers of these definitions.

| Type | Kind | Allowed children |
| --- | --- | --- |
| page.standard | page | section |
| section.greeting / section.text / section.container | section | block, element |
| block.container | block | block, element |
| block.card | block | element |
| text.heading / text.paragraph | element | none |
| media.image / media.video | element | none |
| action.button | element | none |
| navigation.menu | menu | menuItem |
| navigation.item | menuItem | menuItem |

Image controls include asset/mobile asset, alt/decorative/caption, ratio, fit and focal coordinates. Video controls include asset, poster, captions, controls, mute, loop, autoplay request, ratio/fit and preload. Buttons/menu items use a discriminated safe action union. Registry defaults are produced by `createNode(type,id)`; supported component-specific style controls come from `supportedStyleFields(type)`.

Common styles cover side-specific spacing, width/max width, radius, opacity/background alpha, background/text colors, typography, alignment, border/shadow, breakpoint visibility and motion. Gap/columns are container-only; media elements exclude text typography fields. Typography/length values are bounded and length strings accept numeric px/%/rem or auto. Negative margins and unrestricted custom CSS are not supported in this initial contract.

`docs/CONTROL_COVERAGE.md` is generated from these actual definitions. It lists every setting/style control for each component; status is schema-ready, not inspector/render-complete. A future renderer must implement each claimed field before the corresponding component can be certified.
