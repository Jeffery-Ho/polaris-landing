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

## PayPal CTA

- Use the same `#416bf0` Polaris blue as the supporting sentence.
- Keep the CTA visually prominent through a translucent gradient layer, white glass edge, inset highlight, soft blue shadow, and backdrop blur rather than switching to an unrelated blue.

## Video loading and analytics consent

- Keep the thumbnail visible while the full video buffers; place a centered glass play button above it.
- A loading-button click communicates “Video is loading. Please wait…” and does not interrupt the buffer state.
- The consent prompt is a compact glass card fixed to the lower edge. It must clearly state that analytics is optional, keep the decline action equally reachable, and allow a later withdrawal from the footer.
