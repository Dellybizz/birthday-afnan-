# Control coverage — Phase 1

Generated from registry definitions. All rows are schema-ready; inspector/renderer implementation is pending Phases 3–5.

| Component | Field | Group | Type | Bounds/options |
| --- | --- | --- | --- | --- |
| general | name | content | text | validated |
| general | nickname | content | text | validated |
| general | birthdayDate | content | text | validated |
| general | timezone | content | text | validated |
| general | locale | content | text | validated |
| general | appearance.accent | appearance | color | validated |
| general | appearance.background | appearance | color | validated |
| general | appearance.text | appearance | color | validated |
| general | appearance.font | appearance | select | system, serif |
| general | appearance.radius | appearance | number | 0–80 |
| general | appearance.spacing | layout | number | 0–160 |
| general | music.enabled | behaviour | boolean | validated |
| general | music.volume | behaviour | number | 0–1 |
| general | music.loop | behaviour | boolean | validated |
| general | animation.preset | behaviour | select | none, fade, slide |
| general | animation.duration | behaviour | number | 0–2000 |
| general | animation.reducedMotion | accessibility | boolean | validated |
| general | music.assetIds | media | assetList | validated |
| page.standard | slug | content | text | validated |
| page.standard | metaTitle | content | text | validated |
| page.standard | description | content | text | validated |
| page.standard | shell | layout | select | default, fullscreen |
| page.standard | style.{breakpoint}.paddingTop | layout | number | 0–160 |
| page.standard | style.{breakpoint}.paddingRight | layout | number | 0–160 |
| page.standard | style.{breakpoint}.paddingBottom | layout | number | 0–160 |
| page.standard | style.{breakpoint}.paddingLeft | layout | number | 0–160 |
| page.standard | style.{breakpoint}.marginTop | layout | number | 0–160 |
| page.standard | style.{breakpoint}.marginRight | layout | number | 0–160 |
| page.standard | style.{breakpoint}.marginBottom | layout | number | 0–160 |
| page.standard | style.{breakpoint}.marginLeft | layout | number | 0–160 |
| page.standard | style.{breakpoint}.gap | layout | number | 0–160 |
| page.standard | style.{breakpoint}.columns | layout | number | 1–6 |
| page.standard | style.{breakpoint}.width | layout | text | validated |
| page.standard | style.{breakpoint}.maxWidth | layout | text | validated |
| page.standard | style.{breakpoint}.radius | appearance | number | 0–80 |
| page.standard | style.{breakpoint}.opacity | appearance | number | 0–1 |
| page.standard | style.{breakpoint}.backgroundAlpha | appearance | number | 0–1 |
| page.standard | style.{breakpoint}.backgroundColor | appearance | color | validated |
| page.standard | style.{breakpoint}.color | appearance | color | validated |
| page.standard | style.{breakpoint}.fontSize | appearance | number | 12–96 |
| page.standard | style.{breakpoint}.lineHeight | appearance | number | 1–3 |
| page.standard | style.{breakpoint}.letterSpacing | appearance | number | -2–10 |
| page.standard | style.{breakpoint}.fontWeight | appearance | select | 400, 500, 600, 700 |
| page.standard | style.{breakpoint}.align | layout | select | left, center, right |
| page.standard | style.{breakpoint}.shadow | appearance | select | none, soft, medium |
| page.standard | style.{breakpoint}.borderWidth | appearance | number | 0–8 |
| page.standard | style.{breakpoint}.borderColor | appearance | color | validated |
| page.standard | style.{breakpoint}.visible | responsive | boolean | validated |
| page.standard | style.{breakpoint}.motion | behaviour | select | none, fade, slide |
| page.standard | style.{breakpoint}.duration | behaviour | number | 0–2000 |
| section.greeting | alignment | layout | select | left, center, right |
| section.greeting | style.{breakpoint}.paddingTop | layout | number | 0–160 |
| section.greeting | style.{breakpoint}.paddingRight | layout | number | 0–160 |
| section.greeting | style.{breakpoint}.paddingBottom | layout | number | 0–160 |
| section.greeting | style.{breakpoint}.paddingLeft | layout | number | 0–160 |
| section.greeting | style.{breakpoint}.marginTop | layout | number | 0–160 |
| section.greeting | style.{breakpoint}.marginRight | layout | number | 0–160 |
| section.greeting | style.{breakpoint}.marginBottom | layout | number | 0–160 |
| section.greeting | style.{breakpoint}.marginLeft | layout | number | 0–160 |
| section.greeting | style.{breakpoint}.gap | layout | number | 0–160 |
| section.greeting | style.{breakpoint}.columns | layout | number | 1–6 |
| section.greeting | style.{breakpoint}.width | layout | text | validated |
| section.greeting | style.{breakpoint}.maxWidth | layout | text | validated |
| section.greeting | style.{breakpoint}.radius | appearance | number | 0–80 |
| section.greeting | style.{breakpoint}.opacity | appearance | number | 0–1 |
| section.greeting | style.{breakpoint}.backgroundAlpha | appearance | number | 0–1 |
| section.greeting | style.{breakpoint}.backgroundColor | appearance | color | validated |
| section.greeting | style.{breakpoint}.color | appearance | color | validated |
| section.greeting | style.{breakpoint}.fontSize | appearance | number | 12–96 |
| section.greeting | style.{breakpoint}.lineHeight | appearance | number | 1–3 |
| section.greeting | style.{breakpoint}.letterSpacing | appearance | number | -2–10 |
| section.greeting | style.{breakpoint}.fontWeight | appearance | select | 400, 500, 600, 700 |
| section.greeting | style.{breakpoint}.align | layout | select | left, center, right |
| section.greeting | style.{breakpoint}.shadow | appearance | select | none, soft, medium |
| section.greeting | style.{breakpoint}.borderWidth | appearance | number | 0–8 |
| section.greeting | style.{breakpoint}.borderColor | appearance | color | validated |
| section.greeting | style.{breakpoint}.visible | responsive | boolean | validated |
| section.greeting | style.{breakpoint}.motion | behaviour | select | none, fade, slide |
| section.greeting | style.{breakpoint}.duration | behaviour | number | 0–2000 |
| section.text | style.{breakpoint}.paddingTop | layout | number | 0–160 |
| section.text | style.{breakpoint}.paddingRight | layout | number | 0–160 |
| section.text | style.{breakpoint}.paddingBottom | layout | number | 0–160 |
| section.text | style.{breakpoint}.paddingLeft | layout | number | 0–160 |
| section.text | style.{breakpoint}.marginTop | layout | number | 0–160 |
| section.text | style.{breakpoint}.marginRight | layout | number | 0–160 |
| section.text | style.{breakpoint}.marginBottom | layout | number | 0–160 |
| section.text | style.{breakpoint}.marginLeft | layout | number | 0–160 |
| section.text | style.{breakpoint}.gap | layout | number | 0–160 |
| section.text | style.{breakpoint}.columns | layout | number | 1–6 |
| section.text | style.{breakpoint}.width | layout | text | validated |
| section.text | style.{breakpoint}.maxWidth | layout | text | validated |
| section.text | style.{breakpoint}.radius | appearance | number | 0–80 |
| section.text | style.{breakpoint}.opacity | appearance | number | 0–1 |
| section.text | style.{breakpoint}.backgroundAlpha | appearance | number | 0–1 |
| section.text | style.{breakpoint}.backgroundColor | appearance | color | validated |
| section.text | style.{breakpoint}.color | appearance | color | validated |
| section.text | style.{breakpoint}.fontSize | appearance | number | 12–96 |
| section.text | style.{breakpoint}.lineHeight | appearance | number | 1–3 |
| section.text | style.{breakpoint}.letterSpacing | appearance | number | -2–10 |
| section.text | style.{breakpoint}.fontWeight | appearance | select | 400, 500, 600, 700 |
| section.text | style.{breakpoint}.align | layout | select | left, center, right |
| section.text | style.{breakpoint}.shadow | appearance | select | none, soft, medium |
| section.text | style.{breakpoint}.borderWidth | appearance | number | 0–8 |
| section.text | style.{breakpoint}.borderColor | appearance | color | validated |
| section.text | style.{breakpoint}.visible | responsive | boolean | validated |
| section.text | style.{breakpoint}.motion | behaviour | select | none, fade, slide |
| section.text | style.{breakpoint}.duration | behaviour | number | 0–2000 |
| section.container | layout | layout | select | stack, row, grid |
| section.container | style.{breakpoint}.paddingTop | layout | number | 0–160 |
| section.container | style.{breakpoint}.paddingRight | layout | number | 0–160 |
| section.container | style.{breakpoint}.paddingBottom | layout | number | 0–160 |
| section.container | style.{breakpoint}.paddingLeft | layout | number | 0–160 |
| section.container | style.{breakpoint}.marginTop | layout | number | 0–160 |
| section.container | style.{breakpoint}.marginRight | layout | number | 0–160 |
| section.container | style.{breakpoint}.marginBottom | layout | number | 0–160 |
| section.container | style.{breakpoint}.marginLeft | layout | number | 0–160 |
| section.container | style.{breakpoint}.gap | layout | number | 0–160 |
| section.container | style.{breakpoint}.columns | layout | number | 1–6 |
| section.container | style.{breakpoint}.width | layout | text | validated |
| section.container | style.{breakpoint}.maxWidth | layout | text | validated |
| section.container | style.{breakpoint}.radius | appearance | number | 0–80 |
| section.container | style.{breakpoint}.opacity | appearance | number | 0–1 |
| section.container | style.{breakpoint}.backgroundAlpha | appearance | number | 0–1 |
| section.container | style.{breakpoint}.backgroundColor | appearance | color | validated |
| section.container | style.{breakpoint}.color | appearance | color | validated |
| section.container | style.{breakpoint}.fontSize | appearance | number | 12–96 |
| section.container | style.{breakpoint}.lineHeight | appearance | number | 1–3 |
| section.container | style.{breakpoint}.letterSpacing | appearance | number | -2–10 |
| section.container | style.{breakpoint}.fontWeight | appearance | select | 400, 500, 600, 700 |
| section.container | style.{breakpoint}.align | layout | select | left, center, right |
| section.container | style.{breakpoint}.shadow | appearance | select | none, soft, medium |
| section.container | style.{breakpoint}.borderWidth | appearance | number | 0–8 |
| section.container | style.{breakpoint}.borderColor | appearance | color | validated |
| section.container | style.{breakpoint}.visible | responsive | boolean | validated |
| section.container | style.{breakpoint}.motion | behaviour | select | none, fade, slide |
| section.container | style.{breakpoint}.duration | behaviour | number | 0–2000 |
| block.container | layout | layout | select | stack, row, grid |
| block.container | style.{breakpoint}.paddingTop | layout | number | 0–160 |
| block.container | style.{breakpoint}.paddingRight | layout | number | 0–160 |
| block.container | style.{breakpoint}.paddingBottom | layout | number | 0–160 |
| block.container | style.{breakpoint}.paddingLeft | layout | number | 0–160 |
| block.container | style.{breakpoint}.marginTop | layout | number | 0–160 |
| block.container | style.{breakpoint}.marginRight | layout | number | 0–160 |
| block.container | style.{breakpoint}.marginBottom | layout | number | 0–160 |
| block.container | style.{breakpoint}.marginLeft | layout | number | 0–160 |
| block.container | style.{breakpoint}.gap | layout | number | 0–160 |
| block.container | style.{breakpoint}.columns | layout | number | 1–6 |
| block.container | style.{breakpoint}.width | layout | text | validated |
| block.container | style.{breakpoint}.maxWidth | layout | text | validated |
| block.container | style.{breakpoint}.radius | appearance | number | 0–80 |
| block.container | style.{breakpoint}.opacity | appearance | number | 0–1 |
| block.container | style.{breakpoint}.backgroundAlpha | appearance | number | 0–1 |
| block.container | style.{breakpoint}.backgroundColor | appearance | color | validated |
| block.container | style.{breakpoint}.color | appearance | color | validated |
| block.container | style.{breakpoint}.fontSize | appearance | number | 12–96 |
| block.container | style.{breakpoint}.lineHeight | appearance | number | 1–3 |
| block.container | style.{breakpoint}.letterSpacing | appearance | number | -2–10 |
| block.container | style.{breakpoint}.fontWeight | appearance | select | 400, 500, 600, 700 |
| block.container | style.{breakpoint}.align | layout | select | left, center, right |
| block.container | style.{breakpoint}.shadow | appearance | select | none, soft, medium |
| block.container | style.{breakpoint}.borderWidth | appearance | number | 0–8 |
| block.container | style.{breakpoint}.borderColor | appearance | color | validated |
| block.container | style.{breakpoint}.visible | responsive | boolean | validated |
| block.container | style.{breakpoint}.motion | behaviour | select | none, fade, slide |
| block.container | style.{breakpoint}.duration | behaviour | number | 0–2000 |
| block.card | style.{breakpoint}.paddingTop | layout | number | 0–160 |
| block.card | style.{breakpoint}.paddingRight | layout | number | 0–160 |
| block.card | style.{breakpoint}.paddingBottom | layout | number | 0–160 |
| block.card | style.{breakpoint}.paddingLeft | layout | number | 0–160 |
| block.card | style.{breakpoint}.marginTop | layout | number | 0–160 |
| block.card | style.{breakpoint}.marginRight | layout | number | 0–160 |
| block.card | style.{breakpoint}.marginBottom | layout | number | 0–160 |
| block.card | style.{breakpoint}.marginLeft | layout | number | 0–160 |
| block.card | style.{breakpoint}.gap | layout | number | 0–160 |
| block.card | style.{breakpoint}.columns | layout | number | 1–6 |
| block.card | style.{breakpoint}.width | layout | text | validated |
| block.card | style.{breakpoint}.maxWidth | layout | text | validated |
| block.card | style.{breakpoint}.radius | appearance | number | 0–80 |
| block.card | style.{breakpoint}.opacity | appearance | number | 0–1 |
| block.card | style.{breakpoint}.backgroundAlpha | appearance | number | 0–1 |
| block.card | style.{breakpoint}.backgroundColor | appearance | color | validated |
| block.card | style.{breakpoint}.color | appearance | color | validated |
| block.card | style.{breakpoint}.fontSize | appearance | number | 12–96 |
| block.card | style.{breakpoint}.lineHeight | appearance | number | 1–3 |
| block.card | style.{breakpoint}.letterSpacing | appearance | number | -2–10 |
| block.card | style.{breakpoint}.fontWeight | appearance | select | 400, 500, 600, 700 |
| block.card | style.{breakpoint}.align | layout | select | left, center, right |
| block.card | style.{breakpoint}.shadow | appearance | select | none, soft, medium |
| block.card | style.{breakpoint}.borderWidth | appearance | number | 0–8 |
| block.card | style.{breakpoint}.borderColor | appearance | color | validated |
| block.card | style.{breakpoint}.visible | responsive | boolean | validated |
| block.card | style.{breakpoint}.motion | behaviour | select | none, fade, slide |
| block.card | style.{breakpoint}.duration | behaviour | number | 0–2000 |
| text.heading | text | content | text | validated |
| text.heading | level | accessibility | select | 1, 2, 3, 4, 5, 6 |
| text.heading | style.{breakpoint}.paddingTop | layout | number | 0–160 |
| text.heading | style.{breakpoint}.paddingRight | layout | number | 0–160 |
| text.heading | style.{breakpoint}.paddingBottom | layout | number | 0–160 |
| text.heading | style.{breakpoint}.paddingLeft | layout | number | 0–160 |
| text.heading | style.{breakpoint}.marginTop | layout | number | 0–160 |
| text.heading | style.{breakpoint}.marginRight | layout | number | 0–160 |
| text.heading | style.{breakpoint}.marginBottom | layout | number | 0–160 |
| text.heading | style.{breakpoint}.marginLeft | layout | number | 0–160 |
| text.heading | style.{breakpoint}.width | layout | text | validated |
| text.heading | style.{breakpoint}.maxWidth | layout | text | validated |
| text.heading | style.{breakpoint}.radius | appearance | number | 0–80 |
| text.heading | style.{breakpoint}.opacity | appearance | number | 0–1 |
| text.heading | style.{breakpoint}.backgroundAlpha | appearance | number | 0–1 |
| text.heading | style.{breakpoint}.backgroundColor | appearance | color | validated |
| text.heading | style.{breakpoint}.color | appearance | color | validated |
| text.heading | style.{breakpoint}.fontSize | appearance | number | 12–96 |
| text.heading | style.{breakpoint}.lineHeight | appearance | number | 1–3 |
| text.heading | style.{breakpoint}.letterSpacing | appearance | number | -2–10 |
| text.heading | style.{breakpoint}.fontWeight | appearance | select | 400, 500, 600, 700 |
| text.heading | style.{breakpoint}.align | layout | select | left, center, right |
| text.heading | style.{breakpoint}.shadow | appearance | select | none, soft, medium |
| text.heading | style.{breakpoint}.borderWidth | appearance | number | 0–8 |
| text.heading | style.{breakpoint}.borderColor | appearance | color | validated |
| text.heading | style.{breakpoint}.visible | responsive | boolean | validated |
| text.heading | style.{breakpoint}.motion | behaviour | select | none, fade, slide |
| text.heading | style.{breakpoint}.duration | behaviour | number | 0–2000 |
| text.paragraph | content | content | richText | validated |
| text.paragraph | style.{breakpoint}.paddingTop | layout | number | 0–160 |
| text.paragraph | style.{breakpoint}.paddingRight | layout | number | 0–160 |
| text.paragraph | style.{breakpoint}.paddingBottom | layout | number | 0–160 |
| text.paragraph | style.{breakpoint}.paddingLeft | layout | number | 0–160 |
| text.paragraph | style.{breakpoint}.marginTop | layout | number | 0–160 |
| text.paragraph | style.{breakpoint}.marginRight | layout | number | 0–160 |
| text.paragraph | style.{breakpoint}.marginBottom | layout | number | 0–160 |
| text.paragraph | style.{breakpoint}.marginLeft | layout | number | 0–160 |
| text.paragraph | style.{breakpoint}.width | layout | text | validated |
| text.paragraph | style.{breakpoint}.maxWidth | layout | text | validated |
| text.paragraph | style.{breakpoint}.radius | appearance | number | 0–80 |
| text.paragraph | style.{breakpoint}.opacity | appearance | number | 0–1 |
| text.paragraph | style.{breakpoint}.backgroundAlpha | appearance | number | 0–1 |
| text.paragraph | style.{breakpoint}.backgroundColor | appearance | color | validated |
| text.paragraph | style.{breakpoint}.color | appearance | color | validated |
| text.paragraph | style.{breakpoint}.fontSize | appearance | number | 12–96 |
| text.paragraph | style.{breakpoint}.lineHeight | appearance | number | 1–3 |
| text.paragraph | style.{breakpoint}.letterSpacing | appearance | number | -2–10 |
| text.paragraph | style.{breakpoint}.fontWeight | appearance | select | 400, 500, 600, 700 |
| text.paragraph | style.{breakpoint}.align | layout | select | left, center, right |
| text.paragraph | style.{breakpoint}.shadow | appearance | select | none, soft, medium |
| text.paragraph | style.{breakpoint}.borderWidth | appearance | number | 0–8 |
| text.paragraph | style.{breakpoint}.borderColor | appearance | color | validated |
| text.paragraph | style.{breakpoint}.visible | responsive | boolean | validated |
| text.paragraph | style.{breakpoint}.motion | behaviour | select | none, fade, slide |
| text.paragraph | style.{breakpoint}.duration | behaviour | number | 0–2000 |
| media.image | assetId | media | asset | validated |
| media.image | alt | content | text | validated |
| media.image | caption | content | text | validated |
| media.image | decorative | accessibility | boolean | validated |
| media.image | ratio | layout | select | natural, 1:1, 4:3, 3:2, 16:9, 9:16 |
| media.image | fit | layout | select | cover, contain |
| media.image | focalX | layout | number | 0–100 |
| media.image | focalY | layout | number | 0–100 |
| media.image | mobileAssetId | media | asset | validated |
| media.image | style.{breakpoint}.paddingTop | layout | number | 0–160 |
| media.image | style.{breakpoint}.paddingRight | layout | number | 0–160 |
| media.image | style.{breakpoint}.paddingBottom | layout | number | 0–160 |
| media.image | style.{breakpoint}.paddingLeft | layout | number | 0–160 |
| media.image | style.{breakpoint}.marginTop | layout | number | 0–160 |
| media.image | style.{breakpoint}.marginRight | layout | number | 0–160 |
| media.image | style.{breakpoint}.marginBottom | layout | number | 0–160 |
| media.image | style.{breakpoint}.marginLeft | layout | number | 0–160 |
| media.image | style.{breakpoint}.width | layout | text | validated |
| media.image | style.{breakpoint}.maxWidth | layout | text | validated |
| media.image | style.{breakpoint}.radius | appearance | number | 0–80 |
| media.image | style.{breakpoint}.opacity | appearance | number | 0–1 |
| media.image | style.{breakpoint}.backgroundAlpha | appearance | number | 0–1 |
| media.image | style.{breakpoint}.backgroundColor | appearance | color | validated |
| media.image | style.{breakpoint}.shadow | appearance | select | none, soft, medium |
| media.image | style.{breakpoint}.borderWidth | appearance | number | 0–8 |
| media.image | style.{breakpoint}.borderColor | appearance | color | validated |
| media.image | style.{breakpoint}.visible | responsive | boolean | validated |
| media.image | style.{breakpoint}.motion | behaviour | select | none, fade, slide |
| media.image | style.{breakpoint}.duration | behaviour | number | 0–2000 |
| media.video | assetId | media | asset | validated |
| media.video | posterAssetId | media | asset | validated |
| media.video | captionsAssetId | media | asset | validated |
| media.video | controls | behaviour | boolean | validated |
| media.video | muted | behaviour | boolean | validated |
| media.video | loop | behaviour | boolean | validated |
| media.video | autoplay | behaviour | boolean | validated |
| media.video | preload | behaviour | select | none, metadata |
| media.video | ratio | layout | select | natural, 16:9, 9:16, 1:1 |
| media.video | fit | layout | select | cover, contain |
| media.video | style.{breakpoint}.paddingTop | layout | number | 0–160 |
| media.video | style.{breakpoint}.paddingRight | layout | number | 0–160 |
| media.video | style.{breakpoint}.paddingBottom | layout | number | 0–160 |
| media.video | style.{breakpoint}.paddingLeft | layout | number | 0–160 |
| media.video | style.{breakpoint}.marginTop | layout | number | 0–160 |
| media.video | style.{breakpoint}.marginRight | layout | number | 0–160 |
| media.video | style.{breakpoint}.marginBottom | layout | number | 0–160 |
| media.video | style.{breakpoint}.marginLeft | layout | number | 0–160 |
| media.video | style.{breakpoint}.width | layout | text | validated |
| media.video | style.{breakpoint}.maxWidth | layout | text | validated |
| media.video | style.{breakpoint}.radius | appearance | number | 0–80 |
| media.video | style.{breakpoint}.opacity | appearance | number | 0–1 |
| media.video | style.{breakpoint}.backgroundAlpha | appearance | number | 0–1 |
| media.video | style.{breakpoint}.backgroundColor | appearance | color | validated |
| media.video | style.{breakpoint}.shadow | appearance | select | none, soft, medium |
| media.video | style.{breakpoint}.borderWidth | appearance | number | 0–8 |
| media.video | style.{breakpoint}.borderColor | appearance | color | validated |
| media.video | style.{breakpoint}.visible | responsive | boolean | validated |
| media.video | style.{breakpoint}.motion | behaviour | select | none, fade, slide |
| media.video | style.{breakpoint}.duration | behaviour | number | 0–2000 |
| action.button | label | content | text | validated |
| action.button | variant | appearance | select | primary, secondary, link |
| action.button | action | behaviour | action | validated |
| action.button | style.{breakpoint}.paddingTop | layout | number | 0–160 |
| action.button | style.{breakpoint}.paddingRight | layout | number | 0–160 |
| action.button | style.{breakpoint}.paddingBottom | layout | number | 0–160 |
| action.button | style.{breakpoint}.paddingLeft | layout | number | 0–160 |
| action.button | style.{breakpoint}.marginTop | layout | number | 0–160 |
| action.button | style.{breakpoint}.marginRight | layout | number | 0–160 |
| action.button | style.{breakpoint}.marginBottom | layout | number | 0–160 |
| action.button | style.{breakpoint}.marginLeft | layout | number | 0–160 |
| action.button | style.{breakpoint}.width | layout | text | validated |
| action.button | style.{breakpoint}.maxWidth | layout | text | validated |
| action.button | style.{breakpoint}.radius | appearance | number | 0–80 |
| action.button | style.{breakpoint}.opacity | appearance | number | 0–1 |
| action.button | style.{breakpoint}.backgroundAlpha | appearance | number | 0–1 |
| action.button | style.{breakpoint}.backgroundColor | appearance | color | validated |
| action.button | style.{breakpoint}.color | appearance | color | validated |
| action.button | style.{breakpoint}.fontSize | appearance | number | 12–96 |
| action.button | style.{breakpoint}.lineHeight | appearance | number | 1–3 |
| action.button | style.{breakpoint}.letterSpacing | appearance | number | -2–10 |
| action.button | style.{breakpoint}.fontWeight | appearance | select | 400, 500, 600, 700 |
| action.button | style.{breakpoint}.align | layout | select | left, center, right |
| action.button | style.{breakpoint}.shadow | appearance | select | none, soft, medium |
| action.button | style.{breakpoint}.borderWidth | appearance | number | 0–8 |
| action.button | style.{breakpoint}.borderColor | appearance | color | validated |
| action.button | style.{breakpoint}.visible | responsive | boolean | validated |
| action.button | style.{breakpoint}.motion | behaviour | select | none, fade, slide |
| action.button | style.{breakpoint}.duration | behaviour | number | 0–2000 |
| navigation.menu | label | content | text | validated |
| navigation.menu | style.{breakpoint}.paddingTop | layout | number | 0–160 |
| navigation.menu | style.{breakpoint}.paddingRight | layout | number | 0–160 |
| navigation.menu | style.{breakpoint}.paddingBottom | layout | number | 0–160 |
| navigation.menu | style.{breakpoint}.paddingLeft | layout | number | 0–160 |
| navigation.menu | style.{breakpoint}.marginTop | layout | number | 0–160 |
| navigation.menu | style.{breakpoint}.marginRight | layout | number | 0–160 |
| navigation.menu | style.{breakpoint}.marginBottom | layout | number | 0–160 |
| navigation.menu | style.{breakpoint}.marginLeft | layout | number | 0–160 |
| navigation.menu | style.{breakpoint}.gap | layout | number | 0–160 |
| navigation.menu | style.{breakpoint}.columns | layout | number | 1–6 |
| navigation.menu | style.{breakpoint}.width | layout | text | validated |
| navigation.menu | style.{breakpoint}.maxWidth | layout | text | validated |
| navigation.menu | style.{breakpoint}.radius | appearance | number | 0–80 |
| navigation.menu | style.{breakpoint}.opacity | appearance | number | 0–1 |
| navigation.menu | style.{breakpoint}.backgroundAlpha | appearance | number | 0–1 |
| navigation.menu | style.{breakpoint}.backgroundColor | appearance | color | validated |
| navigation.menu | style.{breakpoint}.color | appearance | color | validated |
| navigation.menu | style.{breakpoint}.fontSize | appearance | number | 12–96 |
| navigation.menu | style.{breakpoint}.lineHeight | appearance | number | 1–3 |
| navigation.menu | style.{breakpoint}.letterSpacing | appearance | number | -2–10 |
| navigation.menu | style.{breakpoint}.fontWeight | appearance | select | 400, 500, 600, 700 |
| navigation.menu | style.{breakpoint}.align | layout | select | left, center, right |
| navigation.menu | style.{breakpoint}.shadow | appearance | select | none, soft, medium |
| navigation.menu | style.{breakpoint}.borderWidth | appearance | number | 0–8 |
| navigation.menu | style.{breakpoint}.borderColor | appearance | color | validated |
| navigation.menu | style.{breakpoint}.visible | responsive | boolean | validated |
| navigation.menu | style.{breakpoint}.motion | behaviour | select | none, fade, slide |
| navigation.menu | style.{breakpoint}.duration | behaviour | number | 0–2000 |
| navigation.item | label | content | text | validated |
| navigation.item | icon | navigation | select | none, home, heart, photo, music, video |
| navigation.item | target | navigation | action | validated |
| navigation.item | style.{breakpoint}.paddingTop | layout | number | 0–160 |
| navigation.item | style.{breakpoint}.paddingRight | layout | number | 0–160 |
| navigation.item | style.{breakpoint}.paddingBottom | layout | number | 0–160 |
| navigation.item | style.{breakpoint}.paddingLeft | layout | number | 0–160 |
| navigation.item | style.{breakpoint}.marginTop | layout | number | 0–160 |
| navigation.item | style.{breakpoint}.marginRight | layout | number | 0–160 |
| navigation.item | style.{breakpoint}.marginBottom | layout | number | 0–160 |
| navigation.item | style.{breakpoint}.marginLeft | layout | number | 0–160 |
| navigation.item | style.{breakpoint}.gap | layout | number | 0–160 |
| navigation.item | style.{breakpoint}.columns | layout | number | 1–6 |
| navigation.item | style.{breakpoint}.width | layout | text | validated |
| navigation.item | style.{breakpoint}.maxWidth | layout | text | validated |
| navigation.item | style.{breakpoint}.radius | appearance | number | 0–80 |
| navigation.item | style.{breakpoint}.opacity | appearance | number | 0–1 |
| navigation.item | style.{breakpoint}.backgroundAlpha | appearance | number | 0–1 |
| navigation.item | style.{breakpoint}.backgroundColor | appearance | color | validated |
| navigation.item | style.{breakpoint}.color | appearance | color | validated |
| navigation.item | style.{breakpoint}.fontSize | appearance | number | 12–96 |
| navigation.item | style.{breakpoint}.lineHeight | appearance | number | 1–3 |
| navigation.item | style.{breakpoint}.letterSpacing | appearance | number | -2–10 |
| navigation.item | style.{breakpoint}.fontWeight | appearance | select | 400, 500, 600, 700 |
| navigation.item | style.{breakpoint}.align | layout | select | left, center, right |
| navigation.item | style.{breakpoint}.shadow | appearance | select | none, soft, medium |
| navigation.item | style.{breakpoint}.borderWidth | appearance | number | 0–8 |
| navigation.item | style.{breakpoint}.borderColor | appearance | color | validated |
| navigation.item | style.{breakpoint}.visible | responsive | boolean | validated |
| navigation.item | style.{breakpoint}.motion | behaviour | select | none, fade, slide |
| navigation.item | style.{breakpoint}.duration | behaviour | number | 0–2000 |
