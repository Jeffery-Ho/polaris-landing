# Polaris Landing Design Guidelines

## Hero

- Do not render an eyebrow or category label above the headline.
- Use a large, compact headline with a clear product outcome.
- Keep the supporting sentence neutral gray; reserve the logo border accent for links, focus states, and small indexes.
- Use a split hero: product value and actions on the left, the introduction video as the primary visual on the right.
- Keep the sequence as split hero, capabilities grid, installation panels, then support and privacy.

## Typography

- On macOS, use the native system font stack beginning with `-apple-system` and `BlinkMacSystemFont`.
- On Windows, use the self-hosted `Polaris Sans` face (Roboto Flex) with `Segoe UI` as its fallback. Apply this through the document's `data-platform="windows"` marker.

## Header

- Use a compact, transparent header with the brand aligned left and small bordered controls aligned right.
- Make Install the only filled primary action; keep How it works, GitHub Issues, and the language toggle as lightweight controls.
- On mobile, collapse the navigation to a Polaris logo plus menu button. Open the links in a compact bordered panel with at least 44px touch targets.
- Keep the header in normal page flow so the installation anchor remains predictable.

## Visual system

- Use black, white, and neutral gray as the base palette, with black as the primary page surface.
- Use crisp 1px borders, 8px control and panel radii, generous spacing, and no gradients, blur, or glass surfaces.
- Use the logo border accent `#e879d2` only for links, focus rings, and capability indexes.
- Use white for the primary installation action and a dark outlined treatment for local ZIP installation.
- Use grid dividers and edge-aligned sections instead of floating card shadows.

## Installation section

- Place a two-option installation section after the capabilities grid; the header Install link smoothly scrolls to it without an abrupt jump.
- Use equal 1px bordered panels on desktop and a single-column stack on mobile.
- Keep the local-installation steps readable as a numbered list and surface `chrome://extensions` in a distinguishable code style.
- The local ZIP action must use a same-site relative asset path and keep the installation instructions short; the Chrome Web Store action opens the verified store listing in a new tab.
- After the local ZIP action is clicked, show a short loading state with a spinner and ignore repeat clicks while the browser starts the native download; restore the normal label automatically because native downloads do not expose completion to the page.

## Localization

- Support English and Simplified Chinese through a small page-local translation dictionary.
- Follow the browser language only on first visit; persist a manual choice locally and update the document language, title, description, and control labels together.

## PayPal CTA

- Keep the PayPal action visually prominent with a solid warm-orange button, while keeping installation as the primary product action.

## Video loading and analytics consent

- Keep the thumbnail visible until the video can play its first segment; do not show a playback button while it loads or plays normally.
- Do not display loading, buffering, playback-failure, or other video state text. Show a centered black play button only when playback cannot proceed.
- The consent prompt is a compact white card with a fine border and shadow fixed to the lower edge. It must clearly state that analytics is optional, keep the decline action equally reachable, and allow a later withdrawal from the footer.
