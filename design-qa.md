# Design QA

## Hero typography refinement

- Desktop, 1280 × 720: the category eyebrow is absent; headline renders at 58.88px; the supporting sentence renders as `rgb(65, 107, 240)`.
- Mobile, 390 × 844: the category eyebrow remains absent; the 40px minimum headline size and blue supporting sentence fit without horizontal overflow.

## Cross-platform typography

- macOS keeps the native system font stack and does not select the self-hosted Windows font face.
- With `data-platform="windows"`, the homepage and privacy page use the variable `Polaris Sans` face for text weights from 400 through 800; unavailable font data falls back to `Segoe UI` without horizontal overflow.

Final result: passed.

## Header navigation

- Desktop: the header uses a wide transparent layout with the brand on the left, Download as the primary action, and secondary links on the right.
- Mobile: the header stacks its brand and navigation without a surrounding capsule or horizontal overflow.
- The header Download link reaches the installation section and the language toggle remains keyboard accessible.

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

- Desktop: the header Download link smoothly scrolls to the two-card installation section while retaining the wide transparent header treatment.
- Mobile: the two installation cards stack vertically, and the four local-installation steps do not create horizontal overflow.
- The ZIP action opens the GitHub [latest Release](https://github.com/Jeffery-Ho/Polaris-for-Web/releases/latest) page, where the versioned ZIP asset can be downloaded; each archive contains a root `manifest.json`.
- Mobile and tablet download actions prime the SLS request on pointer down and use the click handler as a no-duplicate fallback; logs report the triggered action, not confirmed file persistence.
- The same-origin `/entry/extension/` fallback stores only the fixed `polaris_extension` source in tab-scoped session storage; homepage visits without source parameters use `attribution_source=direct_share` and `attribution_status=direct`, including bookmarks, manually entered URLs, and links whose parameters were removed.
- The first visit follows the browser language (`zh-*` uses Simplified Chinese and other languages use English); switching languages updates all homepage copy and persists after refresh.

Verification: the inline module syntax, route resource, normalized device-context cases, download deduplication, click fallback, static resources, and diff formatting passed locally. The Aliyun SLS index was merged and read back with the attribution, viewport, language, and existing device fields. Existing desktop and mobile viewport checks remain valid; direct iOS Safari, iOS Chrome, Android browser, and Arc acceptance still requires a real-device or browser-automation run.
