# Polaris Landing Design Guidelines

## Hero

- Do not render an eyebrow or category label above the headline.
- Keep the headline compact with `font-size: clamp(40px, 4.6vw, 64px)`.
- Use `#416bf0` for the supporting sentence so it matches Polaris's blue accent.

## Typography

- On macOS, use the native system font stack beginning with `-apple-system` and `BlinkMacSystemFont`.
- On Windows, use the self-hosted `Polaris Sans` face (Roboto Flex) with `Segoe UI` as its fallback. Apply this through the document's `data-platform="windows"` marker.

## Header

- On desktop, the Header is a centered floating glass capsule with `width: min(780px, calc(100% - 32px))`, 76px height, and a full-pill radius.
- On mobile, preserve the stacked navigation layout and its smaller rounded corners to keep the links readable.
- Use the liquid-glass engine for supported Chromium browsers with stronger `scale: -88`, light chroma, environmental background gradients, and the existing frosted-glass CSS fallback. The Header surface must remain translucent enough for refraction to read clearly.

## PayPal CTA

- Use ecommerce orange `#ff7a00` as the CTA base; it distinguishes the support action from the Polaris-blue product accents.
- Keep the CTA visually prominent through a translucent gradient layer, white glass edge, inset highlight, soft orange shadow, and backdrop blur.
- Use `scale: -76` with a translucent Polaris-blue base, stronger white highlight, and soft blue elevation so refraction remains visible without compromising white-text contrast.

## Video loading and analytics consent

- Keep the thumbnail visible until the video can play its first segment; do not show a playback button while it loads or plays normally.
- Do not display loading, buffering, playback-failure, or other video state text. Show the centered liquid-glass play button only when playback cannot proceed; use `scale: -62`, a translucent white base, and a modern near-black play icon.
- The consent prompt is a compact glass card fixed to the lower edge. It must clearly state that analytics is optional, keep the decline action equally reachable, and allow a later withdrawal from the footer.
