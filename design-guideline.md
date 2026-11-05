# Polaris Landing Design Guidelines

## Hero

- Use a full-bleed hero with the page background running behind the floating nav. Let its height follow its content instead of stretching it to the viewport.
- Start with a two-line headline at display scale, without a supporting sentence above it. Do not spend the hero on a four-line headline, and do not add a decorative wordmark that is not the Polaris name.
- For Simplified Chinese, keep the concise two-line headline with an explicit line break so no character is stranded.
- Give the hero one solid Clay Free trial pill. "See how it works" is a quiet text link to the capabilities section, not a second pill.
- Place the large introduction video directly after the action group, with 28–48px of responsive spacing, inside a product window: a 38px chrome bar with three neutral dots and a centered polaris-ai.work address, a 16px radius, a fine border and a soft shadow. Do not push it down with an automatic margin. Keep its source, thumbnail, and failure-recovery play control.
- Behind the headline, set a very large Lora SemiBold Italic “Polaris” wordmark in the accent mixed at 9% into the page color, like Dia's oversized name. It is decorative and hidden from assistive technology.
- Close the hero with a wide Paper arc that overlaps the lower edge of the product window, with a fine border on its curve.
- Match the extension conversation cover: paper `#fafaf8` in light and `#1a1918` in dark, with one top radial of the terracotta accent (`#b85c3a` / `#e69a78`) mixed at 12%. The field stays nearly the paper color. Do not fill it with a deep clay gradient or the peach, pink, and blue theme gradient.
- Show supported platforms as inline marks inside the headline, one slot per line. The marks cycle; hover pauses the cycle, and reduced motion keeps the first marks still. Keep the full platform names in an accessible list for screen readers, using the same names as `Polaris-for-Web/README.md`. Do not repeat that list as a visible strip under the nav.
- Keep the sequence as full-bleed hero, How it works, Features, Privacy, Pricing, installation panels, release notes, the closing CTA, then the footer. Platform names stay in the headline marks and in the accessible platform list.
- How it works is headed “Polaris reads between the headings” in Newsreader. It is a left–right row: the headline, short explanation, and TOC / Outline switch sit on the left, and a browser-chrome illustration sits on the right. On narrow screens, stack the copy above the window. The browser mock uses a wide window, about the same proportion as a product screenshot (roughly 737:545), large beside a narrow copy column. The window stays a fixed size when TOC and Outline switch. The picker expands the selected feature over 300ms, with a quiet wash and an accent bar, and the side list fades. The other feature collapses to its title. Inside the window, margin markers sit on a long answer and a Polaris side panel switches between TOC (a jump list) and Outline (the same answer as a nested structure). Use the conversation-cover paper and terracotta for that mock in both themes.
- The How it works list follows Dia without numeric indexes: a Newsreader title that stays muted until active, a Clay bar and one short line for the active feature, without check lists. Each window shows a ChatGPT page with real answer text and an Ask anything composer, and the real Polaris Chrome side panel as in the product screenshots: a side-panel title bar (Polaris: AI Chat Navigator, close), a header with the Polaris wordmark, the current platform icon and a settings gear, a search field, and equal Table of Contents | Outline tabs whose active tab is Clay-tinted with a Clay border; below, a dotted body with a grey user-question group and white rounded cards, the current one Clay-tinted, plus the ↑ ◎ ↓ float; Outline shows an Export button and a card of bulleted, expandable sections; settings open from the gear. Windows are visible as soon as they scroll in. While the section is on screen, a scripted cursor operates them through the demo controller; any visitor input pauses it for 12 seconds, and reduced motion disables it.
- Headline platform marks are opaque rounded tiles, white or black, with the mark inset from the tile edge. Align each headline row on the text baseline, keep the icon at 0.72em, and avoid a downward slot transform so the tile’s optical center lines up with the glyph center.

## Typography

- Follow the approved Polaris Clay design system in `Polaris-AI-Chat-Navigator/docs/show-me-design-system.html`. The website shares self-hosted fonts and semantic colors through `assets/theme.css`.
- Use Lora SemiBold Italic 600 for standalone Polaris wordmarks in navigation, the product illustration, and footer, and for the Pro plan title. Keep brand words together, with `-0.035em` tracking and no synthesized fonts.
- Use Newsreader Regular 400 for the hero, section headings and policy-page reading headings. Chinese falls back to Songti SC / Noto Serif CJK SC / SimSun; do not synthesize unbundled weights or italics.
- Use Inter for body copy, navigation, controls, feature lists, badges and metadata on every platform. Chinese falls back to PingFang SC / Microsoft YaHei and system sans-serif. Use the existing self-hosted Latin font subsets with `font-display: swap` and retain their OFL licenses.
- Preserve the current responsive sizes and two-line hero composition. Check both languages at 320px and wider after font changes.

## Header

- On desktop, use a fixed, centered floating pill over the page, about 50px tall with a 16px radius, a 1px low-contrast border, a soft shadow, and a light backdrop blur. Let the page background run behind it. Do not add a header bottom border. At 800px and below, use a full-width opaque header in the current theme's page color, covering the top safe area; remove the brand wrapper and control backgrounds while preserving control positions, touch targets, menus, and keyboard focus feedback.
- Inside the pill, show the logo mark with a minimal wordmark and quiet text links — Features, Privacy, and Pricing — at about 70% opacity, with no underlines. Do not place Free trial or GitHub Issues in that pill. Release notes stay reachable from the footer.
- At the top of the page, the hero Free trial action owns the install section. After the visitor scrolls past the hero, show one Free trial pill fixed at the bottom center, like Dia's download pill: solid Clay with a down arrow. Hide it while the installation section, the closing CTA or the footer is on screen, and on narrow screens while the analytics prompt is open. Do not add a second Free trial pill to the header.
- Keep language and theme switches outside the center pill as small controls on the right. On narrow screens they stay beside the menu button.
- On mobile, collapse the text links behind the menu button. The open panel uses at least 44px touch targets and includes Free trial so the install section stays reachable. GitHub Issues lives in the footer.
- In-page header links scroll to their targets with enough scroll padding to clear the fixed pill.

## SEO and AEO content

- Name the two views **Table of Contents** (目录) and **Outline** (大纲) everywhere in site copy, metadata and JSON-LD. Do not use Chapter View, Chapters or Navigation as feature names, including in mirrored release notes (rename them when copying from the extension's release-notes.js); only demo UI may show the extension's own placeholder labels.

- Directly under the hero, show the definition sentence (the spec's sentence with Chapter View renamed to a Table of Contents and an Outline) in Newsreader, the Supported platforms list (11 names, spec order) at `#platforms`, and a collapsible video transcript built from the video's captions.
- Put the FAQ at `#faq` after installation: native disclosures with the spec's questions plus the pricing questions. Keep the visible text identical to the FAQPage JSON-LD. Pricing no longer has its own FAQ.
- Every image needs descriptive alt text; decorative demo windows stay `aria-hidden`. The footer links How it works, Features, Supported platforms and FAQ.

## Features, privacy and closing

- Follow How it works with a Features bento: a Newsreader heading and six bordered cards in two columns (one column at 800px and below). Each card has a small uppercase label, one short sentence and a live demo of the real product: an AI chat page on the left and the real Polaris Chrome side panel as in the product screenshots: a side-panel title bar (Polaris: AI Chat Navigator, close), a header with the Polaris wordmark, the current platform icon and a settings gear, a search field, and equal Table of Contents | Outline tabs whose active tab is Clay-tinted with a Clay border; below, a dotted body with a grey user-question group and white rounded cards, the current one Clay-tinted, plus the ↑ ◎ ↓ float; Outline shows an Export button and a card of bulleted, expandable sections; settings open from the gear, with the extension's real labels in both languages. The window is laid out at 600×360 and scaled to the card. A scripted cursor operates it: Markers (hover, preview, jump), Outline (switch tab, expand sections, switch back), Search (type, filter, open), Streaming (markers appear as text streams), Platforms (the site cycles through every supported platform, names kept accessible) and Your markers (open settings from the gear, turn on Bold text, then jump to the new markers). Demos run only on screen and show a still frame under reduced motion.
- Privacy follows Features in the same Polaris v2 language: a small outlined lock tile, a centered two-line Newsreader heading (the second sentence in tertiary text), one lead line ending in a bold claim, then three bordered cards that match the Features cards, each with a Clay-tinted icon tile, bold title and short copy, and a centered link to the privacy policy. Do not use a full-bleed tinted band, a dashed frame or scrolling chips. Every statement must match `privacy.html`. Stack the cards at 800px.
- End the page with a plain, centered closing CTA: a Newsreader question, one solid Clay pill to the Chrome Web Store and a quiet line naming Edge and Firefox with a link to the installation section. Do not put it on an arc or a tinted band.

## Release notes

- Place a release-notes section below the installation panels and above the footer. Put the fine divider on the footer's top edge, separating the update cards from the bottom information.
- Mirror the feature releases from `Polaris-for-Web/src/release-notes.js`, sorted newest first. Show the latest five in the same bordered-card style as the installation tutorials; provide a button to reveal the complete list and replace it with a collapse action at the bottom of the expanded list.
- Render version labels as compact accent text, then show the source release title and explanatory copy.

## Visual system

- Use the Polaris Clay semantic palette throughout the homepage, Pricing, footer and policy pages. Light: Paper `#fafaf8`, elevated `#ffffff`, text `#2a2724`, secondary `#57534c`, border `#e0ddd7`, accent `#b85c3a`. Dark: Ink `#1a1918`, elevated `#222120`, text `#f3f1ed`, secondary `#c4c0b8`, border `#3a3835`, accent `#e69a78`.
- Keep colors in `assets/theme.css`; section-specific aliases must refer to those tokens. Do not use the old orange/pink/blue gradient for text, borders or interaction states. Preserve the official colors of third-party platform marks and the red author-attribution heart.
- Main product actions use a solid Clay surface with theme-aware foreground: white in light mode and `#271812` in dark mode. Installation actions use a solid surface, a single Clay border and readable Clay labels.
- Keep existing panel and button geometry, grid dividers, spacing, hero radial wash and floating-navigation blur. Hover uses a subtle theme-aware surface or the Clay hover tone, stable text and no vertical lift.
- Focus and selection use the shared Clay tokens. Selection foreground must follow the accent foreground in each theme; body and control text must meet 4.5:1 contrast.
- Keep language and theme controls, persistence and system-preference behavior. Theme-color metadata follows the Paper / Ink page background.

## Installation section

- Place a two-option installation section after Pricing; Header and Hero in-page CTA links smoothly scroll to their targets without an abrupt jump, unless reduced motion is requested.
- Use equal 1px bordered panels on desktop and a single-column stack on mobile.
- Keep the local-installation steps readable as a numbered list and surface `chrome://extensions` in a distinguishable code style.
- Add a compact “Recommended in Mainland China” badge beside the local-installation title; use the theme-aware text, border and panel tokens.
- The local ZIP action must use a same-site relative asset path and keep the installation instructions short; the Chrome Web Store action opens the verified store listing in a new tab.
- The store card covers all three official listings. A small pill switch at its top right shows Chrome, Microsoft Edge and Firefox marks; the selected browser changes the card title, copy, button label, note and link together, in both languages. The default follows the visitor's browser (Edge, then Firefox, otherwise Chrome).
- After the local ZIP action is clicked, show a short loading state with a spinner and ignore repeat clicks while the browser starts the native download; restore the normal label automatically because native downloads do not expose completion to the page.

## Pricing section

- Use the extension paywall's Clay design within `#pricing` and the same shared palette as the surrounding homepage. Use Inter for interface text, Newsreader for the headline and Free title, and Lora SemiBold Italic for Pro. Self-host all three fonts and their licenses.
- Start with a narrow 7-day trial information banner, followed by the approved headline “Get long conversation like a pro.”, a concise description, and “Choose your plan”. Do not start a website-only trial or invent a personal countdown.
- On desktop, show Free on the left and Pro on the right, with their prices and actions aligned. Below 640px use a native Free/Pro radio selector with a gray track and theme-aware raised highlight, and center the selected card at a maximum width of 520px. Default to Pro; preserve keyboard arrow selection. Slide the highlight and fade the newly selected card over 220ms, disabling both effects for reduced motion.
- Give both plans the same six feature rows in the same order (platforms, TOC, Outline export, local data, light/dark mode, settings). Mark Pro's two differences, every platform and a full-conversation TOC, in semibold ink. Under the cards, add a long-conversation spotlight: a Clay label, a Newsreader headline, one paragraph and an accurate platform note on the left, and side-by-side Free / Pro TOC columns on the right (Free shows only the last loaded replies, Pro the full list).
- Keep 24px outer radii, the inset rounded top under the Pro accent band, terracotta primary action, and secondary Free action. Explain the seven-day $12.90 welcome price and $19.99 regular price next to the amount.
- Follow with a compact three-column comparison and native disclosure FAQs; place them side by side on desktop and stack on narrow screens. Keep all content within the viewport at 320px.
- Finish with the approved terracotta dotted card, star asset, pale gradient Get Pro action, and a reachable free-use link. Dots belong only inside this closing card.
- Get Pro opens Stripe Checkout from the website at the $12.90 welcome price; show a short loading label while it opens and an inline, translated error with the extension fallback if it cannot. Explain next to the price that the extension keeps its own 7-day $12.90 / $19.99 rule, and say before the click that the key appears right after payment.
- `/checkout-return/` uses the policy-page layout. It shows checking, paid (key with Copy and redeem steps), extension, slow, canceled, failed and error states in both languages, never infers payment from the redirect, and offers key recovery by checkout email. Keep it out of search with `noindex`.

## Localization

- Support English and Simplified Chinese through a small page-local translation dictionary.
- Follow the browser language only on first visit; persist a manual choice locally and update the document language, title, description, and control labels together.

## Video loading and analytics consent

- Keep the thumbnail visible until the video can play its first segment; do not show a playback button while it loads or plays normally.
- Do not display loading, buffering, playback-failure, or other video state text. Show a centered black play button only when playback cannot proceed.
- The consent prompt is a compact white card with a fine border and shadow fixed to the lower edge. It must clearly state that analytics is optional, keep the decline action equally reachable, and allow a later withdrawal from the footer.

## Footer

- Use a full-width Paper-subtle surface in light mode and Ink-subtle in dark mode, with a fine top divider and a 1200px content width.
- Desktop has a wider brand column followed by Product, Install & help, and Legal. Group headings are small uppercase labels in the tertiary text color. Keep the existing Polaris mark, independent-developer introduction, support email, copyright, and author link.
- Use plain labels: Features, What's new, and Install for Chrome / Edge / Firefox. Footer Pricing and Free trial entries stay hidden for now. Keep the red heart in the author attribution. Preserve the official destination URLs and the existing Analytics settings action.
- Below 950px, put the brand above three link columns; below 560px, use two link columns with 44px targets and a stacked bottom row. Localize with the homepage dictionaries and preserve theme and keyboard focus behavior.
