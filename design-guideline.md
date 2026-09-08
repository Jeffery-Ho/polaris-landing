# Polaris Landing Design Guidelines

## Hero

- Do not render an eyebrow or category label above the headline.
- Keep the headline compact with `font-size: clamp(40px, 4.6vw, 64px)`.
- Use `#416bf0` for the supporting sentence so it matches Polaris's blue accent.

## Typography

- On macOS, use the native system font stack beginning with `-apple-system` and `BlinkMacSystemFont`.
- On Windows, use the self-hosted `Polaris Sans` face (Roboto Flex) with `Segoe UI` as its fallback. Apply this through the document's `data-platform="windows"` marker.

## Header

- On desktop, use a wide, transparent header with `width: min(1200px, 100%)`, a 64px minimum height, and the brand aligned left with navigation aligned right.
- Make Download the only filled primary action; keep Chrome Web Store, GitHub Issues, and the language toggle as lightweight secondary controls.
- On mobile, preserve the stacked navigation layout and its readable spacing without a surrounding capsule.
- Keep the header in normal page flow so the installation anchor remains predictable; do not apply the liquid-glass displacement filter to this surface.

## Installation section

- Place a two-option installation section below the introduction video and target it from the header Download link.
- Use equal glass cards on desktop and a single-column stack on mobile.
- Keep the local-installation steps readable as a numbered list and surface `chrome://extensions` in a distinguishable code style.
- The local ZIP action must use a same-site relative asset path; the Chrome Web Store action opens the verified store listing in a new tab.

## Localization

- Support English and Simplified Chinese through a small page-local translation dictionary.
- Follow the browser language only on first visit; persist a manual choice locally and update the document language, title, description, and control labels together.

## PayPal CTA

- Use ecommerce orange `#ff7a00` as the CTA base; it distinguishes the support action from the Polaris-blue product accents.
- Keep the CTA visually prominent through a translucent gradient layer, white glass edge, inset highlight, soft orange shadow, and backdrop blur.
- Use `scale: -76` with a translucent Polaris-blue base, stronger white highlight, and soft blue elevation so refraction remains visible without compromising white-text contrast.

## Video loading and analytics consent

- Keep the thumbnail visible until the video can play its first segment; do not show a playback button while it loads or plays normally.
- Do not display loading, buffering, playback-failure, or other video state text. Show the centered liquid-glass play button only when playback cannot proceed; use `scale: -62`, a translucent white base, and a modern near-black play icon.
- The consent prompt is a compact glass card fixed to the lower edge. It must clearly state that analytics is optional, keep the decline action equally reachable, and allow a later withdrawal from the footer.
