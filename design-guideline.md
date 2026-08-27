# Polaris Landing Design Guidelines

## Hero

- Do not render an eyebrow or category label above the headline.
- Keep the headline compact with `font-size: clamp(40px, 4.6vw, 64px)`.
- Use `#416bf0` for the supporting sentence so it matches Polaris's blue accent.

## Header

- On desktop, the Header is a centered floating glass capsule with `width: min(840px, 100%)` and a full-pill radius.
- On mobile, preserve the stacked navigation layout and its smaller rounded corners to keep the links readable.

## Video loading and analytics consent

- Keep the thumbnail visible while the full video buffers; place a centered glass play button above it.
- A loading-button click communicates “Video is loading. Please wait…” and does not interrupt the buffer state.
- The consent prompt is a compact glass card fixed to the lower edge. It must clearly state that analytics is optional, keep the decline action equally reachable, and allow a later withdrawal from the footer.
