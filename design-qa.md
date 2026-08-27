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

- The CTA base is Polaris blue `rgb(65, 107, 240)`, matching the supporting sentence.
- A translucent highlight, white edge, inset reflection, blue shadow, and backdrop blur retain a high-contrast glass CTA surface.
- In supported Chromium browsers, the Header, video play control, and CTA use local SVG displacement refraction; Safari, Firefox, reduced-transparency, high-contrast, and reduced-motion modes retain the CSS frosted-glass fallback.
- The page-level ambient gradients, translucent surfaces, and stronger per-component displacement scales make the Header, play button, and CTA visibly refractive rather than merely blurred.
- The play button uses a translucent white glass surface with a near-black icon, keeping it readable over the video thumbnail.

## Video loading and analytics consent

- Before the video has fully buffered, the thumbnail keeps its 16:9 frame and the centered play control remains reachable without any loading text.
- Buffering, playback failures, and manual play attempts do not display state text; the play control remains or becomes reachable when playback cannot proceed.
- The consent card is visible for a new visitor. GA4 is configured only after “Allow analytics” with automatic page views disabled; declining or later withdrawing consent stops subsequent custom events while keeping the landing page fully usable.
