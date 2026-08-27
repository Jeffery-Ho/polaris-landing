# Design QA

## Hero typography refinement

- Desktop, 1280 × 720: the category eyebrow is absent; headline renders at 58.88px; the supporting sentence renders as `rgb(65, 107, 240)`.
- Mobile, 390 × 844: the category eyebrow remains absent; the 40px minimum headline size and blue supporting sentence fit without horizontal overflow.

## Cross-platform typography

- macOS keeps the native system font stack and does not select the self-hosted Windows font face.
- With `data-platform="windows"`, the homepage and privacy page use the variable `Polaris Sans` face for text weights from 400 through 800; unavailable font data falls back to `Segoe UI` without horizontal overflow.

Final result: passed.

## Floating capsule header

- Desktop: the header is centered and capped at 780px with a full-pill radius; it remains part of normal page flow.
- Mobile: the stacked header remains within the viewport without horizontal overflow.

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
