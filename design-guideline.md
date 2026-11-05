# Polaris Landing Design Guidelines

## Hero

- Use a full-bleed hero with the page background running behind the floating nav. Let its height follow its content instead of stretching it to the viewport.
- Start with a two-line headline at display scale, without a supporting sentence above it. Do not spend the hero on a four-line headline, and do not add a decorative wordmark that is not the Polaris name.
- For Simplified Chinese, keep the concise two-line headline with an explicit line break so no character is stranded.
- Give the hero one solid Clay Free trial pill. "See how it works" is a quiet text link to the capabilities section, not a second pill.
- Place the large introduction video directly after the action group, with 28–48px of responsive spacing. Do not push it down with an automatic margin. Keep its source, thumbnail, and failure-recovery play control.
- Match the extension conversation cover: paper `#fafaf8` in light and `#1a1918` in dark, with one top radial of the terracotta accent (`#b85c3a` / `#e69a78`) mixed at 12%. The field stays nearly the paper color. Do not fill it with a deep clay gradient or the peach, pink, and blue theme gradient.
- Show supported platforms as inline marks inside the headline, one slot per line. The marks cycle; hover pauses the cycle, and reduced motion keeps the first marks still. Keep the full platform names in an accessible list for screen readers, using the same names as `Polaris-for-Web/README.md`. Do not repeat that list as a visible strip under the nav.
- Keep the sequence as full-bleed hero, How it works, installation panels, support, release notes, then the footer. Platform names stay in the headline marks and in the accessible platform list.
- How it works is a left–right row: the headline, short explanation, and TOC / Outline switch sit on the left, and a browser-chrome illustration sits on the right. On narrow screens, stack the copy above the window. The browser mock uses a wide window, about the same proportion as a product screenshot (roughly 737:545), large beside a narrow copy column. The window stays a fixed size when TOC and Outline switch. The picker expands the selected feature over 300ms, with a quiet wash and an accent bar, and the side list fades. The other feature collapses to its title. Inside the window, margin markers sit on a long answer and a Polaris side panel switches between TOC (a jump list) and Outline (the same answer as a nested structure). Use the conversation-cover paper and terracotta for that mock in both themes.
- Headline platform marks are opaque rounded tiles, white or black, with the mark inset from the tile edge. Align each headline row on the text baseline, keep the icon at 0.72em, and avoid a downward slot transform so the tile’s optical center lines up with the glyph center.

## Typography

- Follow the approved Polaris Clay design system in `Polaris-AI-Chat-Navigator/docs/show-me-design-system.html`. The website shares self-hosted fonts and semantic colors through `assets/theme.css`.
- Use Lora SemiBold Italic 600 for standalone Polaris wordmarks in navigation, the product illustration, and footer, and for the Pro plan title. Keep brand words together, with `-0.035em` tracking and no synthesized fonts.
- Use Newsreader Regular 400 for the hero, section headings and policy-page reading headings. Chinese falls back to Songti SC / Noto Serif CJK SC / SimSun; do not synthesize unbundled weights or italics.
- Use Inter for body copy, navigation, controls, feature lists, badges and metadata on every platform. Chinese falls back to PingFang SC / Microsoft YaHei and system sans-serif. Use the existing self-hosted Latin font subsets with `font-display: swap` and retain their OFL licenses.
- Preserve the current responsive sizes and two-line hero composition. Check both languages at 320px and wider after font changes.

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

- Use the Polaris Clay semantic palette throughout the homepage, footer and policy pages. Light: Paper `#fafaf8`, elevated `#ffffff`, text `#2a2724`, secondary `#57534c`, border `#e0ddd7`, accent `#b85c3a`. Dark: Ink `#1a1918`, elevated `#222120`, text `#f3f1ed`, secondary `#c4c0b8`, border `#3a3835`, accent `#e69a78`.
- Keep colors in `assets/theme.css`; section-specific aliases must refer to those tokens. Do not use the old orange/pink/blue gradient for text, borders or interaction states. Preserve the official colors of third-party platform marks and the red author-attribution heart.
- Main product and support actions use a solid Clay surface with theme-aware foreground: white in light mode and `#271812` in dark mode. Installation actions use a solid surface, a single Clay border and readable Clay labels.
- Keep existing panel and button geometry, grid dividers, spacing, hero radial wash and floating-navigation blur. Hover uses a subtle theme-aware surface or the Clay hover tone, stable text and no vertical lift.
- Focus and selection use the shared Clay tokens. Selection foreground must follow the accent foreground in each theme; body and control text must meet 4.5:1 contrast.
- Keep language and theme controls, persistence and system-preference behavior. Theme-color metadata follows the Paper / Ink page background.

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

- Keep the PayPal action prominent with a solid Clay button and theme-aware contrasting text, while keeping installation as the primary product action.

## Video loading and analytics consent

- Keep the thumbnail visible until the video can play its first segment; do not show a playback button while it loads or plays normally.
- Do not display loading, buffering, playback-failure, or other video state text. Show a centered black play button only when playback cannot proceed.
- The consent prompt is a compact white card with a fine border and shadow fixed to the lower edge. It must clearly state that analytics is optional, keep the decline action equally reachable, and allow a later withdrawal from the footer.

## Footer

- Use a full-width Paper-subtle surface in light mode and Ink-subtle in dark mode, with a fine top divider and a 1200px content width.
- Desktop has a wider brand column followed by Product, Install & help, and Legal. Keep the existing Polaris mark, independent-developer introduction, support email, copyright, and author link.
- Use plain labels: Features, What's new, and Install for Chrome / Edge / Firefox. Footer Pricing and Free trial entries stay hidden for now. Keep the red heart in the author attribution. Preserve the official destination URLs and the existing Analytics settings action.
- Below 950px, put the brand above three link columns; below 560px, use two link columns with 44px targets and a stacked bottom row. Localize with the homepage dictionaries and preserve theme and keyboard focus behavior.
