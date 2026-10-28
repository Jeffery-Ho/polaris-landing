# Design QA

## Hero typography refinement

- Desktop: the first screen is a full-bleed hero with a two-line headline, one inline platform mark per line, one Free trial pill, a text link to capabilities, and a large bottom-anchored video.
- Mobile: the same hero stacks without horizontal overflow, and the Free trial pill remains the only filled hero action.
- How it works: copy and the TOC / Outline switch sit on the left, and the browser chrome sits on the right. Narrow screens stack the copy above the window. The browser is a wide product window, about 737:545, large beside the copy. Switching modes zooms that picture in and lets it settle while the side list fades. TOC is a flat jump list; Outline nests the sections inside it. Both themes use the paper and terracotta cover colors.
- Headline marks are opaque white or black rounded tiles, inset from the edge, and share the letter centerline.

## Cross-platform typography

- macOS keeps the native system font stack and does not select the self-hosted Windows font face.
- With `data-platform="windows"`, the homepage and privacy page use the variable `Polaris Sans` face for text weights from 400 through 800; unavailable font data falls back to `Segoe UI` without horizontal overflow.

Final result: passed.

## Header navigation

- Desktop: a centered floating pill holds the logo, How it works, and Updates. Free trial is absent until the page scrolls past the hero, then a separate right-side pill links to the installation section. Language and theme controls sit outside the pill. GitHub Issues is in the footer.
- Mobile: the logo, language, theme, and menu button stay reachable without horizontal overflow. The menu lists How it works, Updates, and Free trial.
- The header Free trial control does not use the gradient outline. It uses the same Free trial / 免费试用 label as the hero and reaches the installation section. The language toggle remains keyboard accessible.

## PayPal CTA glass refinement

- The CTA base is ecommerce orange `rgb(255, 122, 0)`, clearly separating the PayPal action from product-navigation accents.
- A translucent highlight, white edge, inset reflection, orange shadow, and backdrop blur retain a high-contrast glass CTA surface.
- In supported Chromium browsers, the Header, failure-recovery video play control, and CTA use local SVG displacement refraction; Safari, Firefox, reduced-transparency, high-contrast, and reduced-motion modes retain the CSS frosted-glass fallback.
- The page-level ambient gradients, translucent surfaces, and stronger per-component displacement scales make the Header, failure-recovery play button, and CTA visibly refractive rather than merely blurred.
- The failure-recovery play button uses a translucent white glass surface with a near-black icon, keeping it readable over the video thumbnail.

## Video loading and analytics consent

- Before the video can play its first segment, the thumbnail keeps its 16:9 frame without a centered play control or loading text.
- Buffering and playback failures do not display state text; the play control becomes reachable only when playback cannot proceed.
- The consent card is visible for a new visitor. GA4 and SLS are configured only after “Allow analytics” with automatic page views disabled; SLS records consented arrivals and ZIP download actions with UTM, same-origin entry, or `direct_share` attribution plus normalized device context, while declining or later withdrawing consent stops subsequent custom events while keeping the landing page fully usable.

## Installation and localization

- Desktop: once the header Free trial pill is revealed, it smoothly scrolls to the two-card installation section.
- Mobile: the two installation cards stack vertically, and the four local-installation steps do not create horizontal overflow.
- The ZIP action resolves the GitHub [latest Release](https://github.com/Jeffery-Ho/Polaris-for-Web/releases/latest) API and directly downloads its versioned ZIP asset; if the API is unavailable, it falls back to the Release page. Each archive contains a root `manifest.json`.
- Mobile and tablet download actions prime the SLS request on pointer down and use the click handler as a no-duplicate fallback; logs report the triggered action, not confirmed file persistence.
- The same-origin `/entry/extension/` fallback stores only the fixed `polaris_extension` source in tab-scoped session storage; homepage visits without source parameters use `attribution_source=direct_share` and `attribution_status=direct`, including bookmarks, manually entered URLs, and links whose parameters were removed.
- The first visit follows the browser language (`zh-*` uses Simplified Chinese and other languages use English); switching languages updates all homepage copy and persists after refresh.

Verification: the inline module syntax, route resource, normalized device-context cases, download deduplication, click fallback, static resources, and diff formatting passed locally. The Aliyun SLS index was merged and read back with the attribution, viewport, language, and existing device fields. Existing desktop and mobile viewport checks remain valid; direct iOS Safari, iOS Chrome, Android browser, and Arc acceptance still requires a real-device or browser-automation run.
