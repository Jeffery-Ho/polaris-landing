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
- The consent card is visible for a new visitor. GA4 is configured only after “Allow analytics” with automatic page views disabled; declining or later withdrawing consent stops subsequent custom events while keeping the landing page fully usable.

## Installation and localization

- Desktop: the header Download link reaches the two-card installation section while retaining the wide transparent header treatment.
- Mobile: the two installation cards stack vertically, and the six local-installation steps do not create horizontal overflow.
- The ZIP action downloads the current `Polaris-for-Web-0.48.3-build-196.zip` asset; the archive contains a root `manifest.json` with version name `0.48.3(196)`.
- The first visit follows the browser language (`zh-*` uses Simplified Chinese and other languages use English); switching languages updates all homepage copy and persists after refresh.

Verification: passed on the local static server at desktop and mobile viewport sizes; language switching, persistence, anchor navigation, and ZIP download were verified.
