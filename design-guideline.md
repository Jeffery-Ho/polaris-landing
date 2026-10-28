# Polaris Landing Design Guidelines

## Hero

- Fill the first screen: the hero is a full-bleed field at least `100svh`, with the page background running behind the floating nav.
- Use a short supporting sentence, then a two-line headline at display scale. Do not spend the hero on a four-line headline, and do not add a decorative wordmark that is not the Polaris name.
- For Simplified Chinese, keep the concise two-line headline with an explicit line break so no character is stranded.
- Give the hero one solid monochrome Free trial pill. "See how it works" is a quiet text link to the capabilities section, not a second pill.
- Anchor the existing introduction video large at the bottom of the hero so it dominates the first screen. Keep its source, thumbnail, and failure-recovery play control.
- Match the extension conversation cover: paper `#faf9f7` in light and `#191817` in dark, with one top radial of the terracotta accent (`#b85c3a` / `#e69a78`) mixed at 12%. The field stays nearly the paper color. Do not fill it with a deep clay gradient or the peach, pink, and blue theme gradient.
- Show supported platforms as inline marks inside the headline, one slot per line. The marks cycle; hover pauses the cycle, and reduced motion keeps the first marks still. Keep the full platform names in an accessible list for screen readers, using the same names as `Polaris-for-Web/README.md`. Do not repeat that list as a visible strip under the nav.
- Keep the sequence as full-bleed hero, How it works, installation panels, support, release notes, then the footer. Platform names stay in the headline marks and in the accessible platform list.
- How it works is a left–right row: the headline, short explanation, and TOC / Outline switch sit on the left, and a browser-chrome illustration sits on the right. On narrow screens, stack the copy above the window. Switching TOC and Outline fades and enlarges the browser, while the side list crossfades so the frame does not jump. Inside the window, margin markers sit on a long answer and a Polaris side panel switches between TOC (a jump list) and Outline (the same answer as a nested structure). Use the conversation-cover paper and terracotta for that mock in both themes.
- Headline platform marks are opaque rounded tiles, white or black, with the mark inset from the tile edge. Size and shift the slot so the tile’s optical center lines up with the letter center.

## Typography

- On macOS, use the native system font stack beginning with `-apple-system` and `BlinkMacSystemFont`.
- On Windows, use the self-hosted `Polaris Sans` face (Roboto Flex) with `Segoe UI` as its fallback. Apply this through the document's `data-platform="windows"` marker.

## Header

- Use a fixed, centered floating pill over the page, about 50px tall with a 16px radius, a 1px low-contrast border, a soft shadow, and a light backdrop blur. Let the page background run behind it. Do not use a full-width header bar or a header bottom border.
- Inside the pill, show the logo mark with a minimal wordmark and two quiet text links — How it works and Updates — at about 70% opacity, with no underlines. Do not place Free trial or GitHub Issues in that pill.
- At the top of the page, the hero Free trial action owns the install section. After the visitor scrolls past the hero, reveal a separate floating Free trial pill on the right that matches the nav pill and uses the same label. Do not use the gradient outline treatment on that header control.
- Keep language and theme switches outside the center pill as small controls on the right. On narrow screens they stay beside the menu button.
- On mobile, collapse the text links behind the menu button. The open panel uses at least 44px touch targets and includes Free trial so the install section stays reachable. GitHub Issues lives in the footer.
- In-page header links scroll to their targets with enough scroll padding to clear the fixed pill.

## Release notes

- Place a release-notes section below the support block and above the footer. Put the fine divider on the footer's top edge, separating the update cards from the bottom information.
- Mirror the feature releases from `Polaris-for-Web/src/release-notes.js`, sorted newest first. Show the latest five in the same bordered-card style as the installation tutorials; provide a button to reveal the complete list and replace it with a collapse action at the bottom of the expanded list.
- Render version labels as compact accent text, then show the source release title and explanatory copy.

## Visual system

- Use black, white, and neutral gray as the base palette, with black as the primary page surface.
- Use crisp 1px borders, 8px panel radii, 999px button radii, and generous spacing. Keep decorative blur off the page sections. The header pills are the exception: they use a 16px radius, a soft shadow, and backdrop blur.
- Use the logo-derived theme gradient `#ffb36b → #e879d2 → #7892ff` for accent text, capability indexes, and installation CTA labels/borders; keep CTA interiors solid.
- Keep the hero Free trial pill monochrome: solid black on the light field and solid white on the dark field, with no gradient outline. The secondary hero action is a text link. The label is “Free trial” in English and “免费试用” in Simplified Chinese, and it scrolls to the installation section.
- Use one shared hover treatment across controls: a subtle theme-aware surface, a fine contrasting border, stable text color, and no vertical lift. Use a theme-aware solid focus ring: white on dark surfaces and black on light surfaces.
- Use the shared gradient label/border treatment for installation CTAs, with a solid theme-aware interior and no gradient hover fill. The header Free trial pill does not use that gradient.
- Use grid dividers and edge-aligned sections instead of floating card shadows.
- Provide a compact language dropdown with a clear translation marker beside the theme switch, both outside the center navigation pill. The marker must use the control's current color rather than a fixed fill and be optically centered with its language text. Default to the system preference and persist explicit choices locally.

## Installation section

- Place a two-option installation section after How it works; Header and Hero in-page CTA links smoothly scroll to their targets without an abrupt jump, unless reduced motion is requested.
- Use equal 1px bordered panels on desktop and a single-column stack on mobile.
- Keep the local-installation steps readable as a numbered list and surface `chrome://extensions` in a distinguishable code style.
- Add a compact “Recommended in Mainland China” badge beside the local-installation title; use a solid theme-aware black or white border and interior.
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
